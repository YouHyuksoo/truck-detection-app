from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect

from fastapi.responses import RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from fastapi.templating import Jinja2Templates
import cv2
import asyncio
from pathlib import Path
import json
import socket
from datetime import datetime


# === 앱 초기화 ===
active_connections = set()
meta_connections = set()  # 메타데이터 연결을 위한 세트
broadcast_task = None
meta_broadcast_task = None  # 메타데이터 브로드캐스트 태스크
connection_cleanup_task = None  # 연결 정리 태스크 추가
is_streaming = True  # 항상 스트리밍 활성화 상태로 유지
MAX_CONNECTIONS = 10  # 최대 연결 수 제한
cap = None  # 전역 카메라 변수 추가

# 연결 상태 추적을 위한 구조체
video_pending_connections = {}  # 대기 중인 비디오 연결 (WebSocket: 마지막 활동 시간)
meta_pending_connections = {}   # 대기 중인 메타 연결 (WebSocket: 마지막 활동 시간)
CONNECTION_TIMEOUT = 10  # 연결 타임아웃 (초)

# === 카메라 백엔드 상수 추가 ===
# DirectShow 백엔드 상수 (Windows에서 더 안정적일 수 있음)
CAP_DSHOW = 700


# === WebSocket으로 프레임 송출 ===
async def video_broadcast():
    import time
    import socket

    # OpenCV 최적화 활성화
    cv2.setUseOptimized(True)

    # 복구 관련 변수
    consecutive_failures = 0
    max_consecutive_failures = 5
    last_reconnect_time = time.time()
    reconnect_interval = 10  # 재연결 시도 간격(초)

    # 카메라 초기화 함수 개선
    def init_camera():
        global cap
        if cap is not None:
            cap.release()  # 기존 카메라 리소스 해제
        
        # 여러 백엔드를 시도
        try:
            # 먼저 DirectShow 백엔드 시도 (Windows에서 더 안정적)
            print("🔍 DirectShow 백엔드로 카메라 연결 시도...")
            cap = cv2.VideoCapture(0, CAP_DSHOW)
            
            # 해상도 설정
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            # 버퍼 사이즈 줄이기 (지연 감소)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            if cap.isOpened():
                print("✅ DirectShow 백엔드로 카메라 연결 성공")
                return True
        except Exception as e:
            print(f"⚠️ DirectShow 백엔드 연결 실패: {e}")
        
        try:
            # 기본 백엔드 시도
            print("🔍 기본 백엔드로 카메라 연결 시도...")
            cap = cv2.VideoCapture(0)
            
            # 해상도 설정
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            # 버퍼 사이즈 줄이기
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            if cap.isOpened():
                print("✅ 기본 백엔드로 카메라 연결 성공")
                return True
        except Exception as e:
            print(f"⚠️ 기본 백엔드 연결 실패: {e}")
        
        return False

    # 초기 카메라 연결
    if not init_camera():
        print("🚨 어떤 백엔드로도 카메라 열기 실패")
        return

    w = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    h = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    fps = cap.get(cv2.CAP_PROP_FPS)

    print(f"📷 카메라 송출 시작됨 해상도: {int(w)}×{int(h)}, FPS: {fps}")
    
    try:
        while True:
            # 스트리밍 항상 활성화 상태

            # 클라이언트가 없으면 프레임 처리 생략
            if not active_connections:
                await asyncio.sleep(0.5)
                continue

            ret, frame = cap.read()
            if not ret:
                consecutive_failures += 1
                print(f"⚠️ 프레임 읽기 실패 ({consecutive_failures}/{max_consecutive_failures})")

                if consecutive_failures >= max_consecutive_failures:
                    current_time = time.time()
                    if current_time - last_reconnect_time > reconnect_interval:
                        print("🔄 카메라 재연결 시도...")
                        if init_camera():
                            print("✅ 카메라 재연결 성공")
                            consecutive_failures = 0
                            last_reconnect_time = current_time
                        else:
                            print("❌ 카메라 재연결 실패")

                await asyncio.sleep(min(0.1 * consecutive_failures, 2.0))
                continue

            consecutive_failures = 0

            # 이미지 인코딩 (원본 품질)
            _, buffer = cv2.imencode(".jpg", frame)
            data = buffer.tobytes()

            del frame

            disconnected = set()
            for ws in list(active_connections):
                try:
                    await ws.send_bytes(data)
                except WebSocketDisconnect:
                    print("🔴 WebSocket 연결 해제됨")
                    disconnected.add(ws)
                except ConnectionResetError:
                    print("🔴 클라이언트에 의해 WebSocket 연결이 강제로 종료됨")
                    disconnected.add(ws)
                except socket.error:
                    print("🔴 소켓 오류 발생")
                    disconnected.add(ws)
                except Exception as e:
                    print(f"💥 송신 중 예외 발생: {e}")
                    disconnected.add(ws)

            for ws in disconnected:
                active_connections.discard(ws)

            await asyncio.sleep(0.01)
    finally:
        if cap is not None:
            cap.release()
        print("🛑 카메라 리소스 해제 완료")


# 감지 통계 데이터 생성 기능 제거됨

# === WebSocket으로 메타데이터 송출 ===
async def meta_broadcast():
    try:
        while True:
            if not meta_connections:
                await asyncio.sleep(0.5)
                continue
            
            # 기본 감지 메타데이터만 전송 (통계 데이터 제거)
            data = {
                "type": "detections",
                "detections": [
                    {
                        "x": 100,
                        "y": 100,
                        "width": 200,
                        "height": 100,
                        "confidence": 0.95,
                        "label": "truck",
                        "number": "1234"
                    }
                ]
            }

            # 감지 메타데이터 전송
            disconnected = set()
            for ws in list(meta_connections):
                try:
                    await ws.send_json(data)
                except WebSocketDisconnect:
                    print("🔴 메타 WebSocket 연결 해제됨")
                    disconnected.add(ws)
                except ConnectionResetError:
                    print("🔴 클라이언트에 의해 메타 WebSocket 연결이 강제로 종료됨")
                    disconnected.add(ws)
                except socket.error:
                    print("🔴 소켓 오류 발생")
                    disconnected.add(ws)
                except Exception as e:
                    print(f"💥 메타데이터 송신 중 예외 발생: {e}")
                    disconnected.add(ws)

            for ws in disconnected:
                meta_connections.discard(ws)

            await asyncio.sleep(0.1)  # 10 FPS
    except Exception as e:
        print(f"💥 메타데이터 브로드캐스트 오류: {e}")


# === 비활성 연결 정리 태스크 ===
async def cleanup_inactive_connections():
    import time
    
    while True:
        try:
            current_time = time.time()
            
            # 대기 중인 비디오 연결 확인
            disconnected_video = []
            for ws, last_active in video_pending_connections.items():
                if current_time - last_active > CONNECTION_TIMEOUT:
                    disconnected_video.append(ws)
                    print(f"⏱️ 비디오 연결 타임아웃으로 제거 (마지막 활동: {int(current_time - last_active)}초 전)")
            
            # 대기 중인 메타 연결 확인
            disconnected_meta = []
            for ws, last_active in meta_pending_connections.items():
                if current_time - last_active > CONNECTION_TIMEOUT:
                    disconnected_meta.append(ws)
                    print(f"⏱️ 메타 연결 타임아웃으로 제거 (마지막 활동: {int(current_time - last_active)}초 전)")
            
            # 타임아웃된 연결 제거
            for ws in disconnected_video:
                try:
                    del video_pending_connections[ws]
                    await ws.close(code=1000, reason="연결 타임아웃")
                except Exception as e:
                    print(f"연결 닫기 오류: {e}")
            
            for ws in disconnected_meta:
                try:
                    del meta_pending_connections[ws]
                    await ws.close(code=1000, reason="연결 타임아웃")
                except Exception as e:
                    print(f"연결 닫기 오류: {e}")
            
            # 5초마다 확인
            await asyncio.sleep(5)
        
        except Exception as e:
            print(f"연결 정리 중 오류: {e}")
            await asyncio.sleep(5)


# === lifespan 기반 프레임 수신 태스크 관리 ===
@asynccontextmanager
async def lifespan(app: FastAPI):
    global broadcast_task, meta_broadcast_task, connection_cleanup_task
    broadcast_task = asyncio.create_task(video_broadcast())
    meta_broadcast_task = asyncio.create_task(meta_broadcast())
    connection_cleanup_task = asyncio.create_task(cleanup_inactive_connections())
    yield
    broadcast_task.cancel()
    meta_broadcast_task.cancel()
    connection_cleanup_task.cancel()
    print("🛑 영상 및 메타데이터 송출 태스크 종료")


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# === WebSocket 엔드포인트 ===
@app.websocket("/ws/video")
async def video_feed_ws(websocket: WebSocket):
    import time
    
    # 중복 연결 확인
    client_info = f"{websocket.client.host}:{websocket.client.port}"
    
    # 최대 연결 수 제한
    if len(active_connections) >= MAX_CONNECTIONS:
        await websocket.close(code=1008, reason="최대 연결 수 초과")
        return

    await websocket.accept()
    print(f"🟡 비디오 WebSocket 수락됨 ({client_info}, ping 대기 중...)")
    
    # 대기 중인 연결에 추가
    video_pending_connections[websocket] = time.time()
    
    try:
        while True:
            # ping 메시지 대기 (5초 타임아웃)
            try:
                message = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
                
                # 대기 중인 연결 상태 업데이트
                if websocket in video_pending_connections:
                    video_pending_connections[websocket] = time.time()
                
                # ping 메시지를 받았고 아직 등록되지 않은 경우에만 등록
                if message == "ping" and websocket not in active_connections:
                    # 대기 목록에서 제거하고 활성 목록에 추가
                    if websocket in video_pending_connections:
                        del video_pending_connections[websocket]
                    
                    active_connections.add(websocket)
                    print(f"🟢 비디오 WebSocket ping 수신 - 접속 등록됨 ({client_info}, 총 {len(active_connections)}명)")
            except asyncio.TimeoutError:
                # 타임아웃은 정상임, 계속 대기
                continue
            
    except WebSocketDisconnect:
        print(f"🔴 비디오 WebSocket 연결 해제됨 ({client_info})")
    finally:
        active_connections.discard(websocket)
        if websocket in video_pending_connections:
            del video_pending_connections[websocket]
        print(f"🔵 비디오 WebSocket 연결 제거됨 ({client_info}, 총 {len(active_connections)}명)")


@app.websocket("/ws/meta")
async def meta_feed_ws(websocket: WebSocket):
    import time
    
    # 클라이언트 정보
    client_info = f"{websocket.client.host}:{websocket.client.port}"
    
    if len(meta_connections) >= MAX_CONNECTIONS:
        await websocket.close(code=1008, reason="최대 연결 수 초과")
        return

    await websocket.accept()
    print(f"🟡 메타 WebSocket 수락됨 ({client_info}, ping 대기 중...)")
    
    # 대기 중인 연결에 추가
    meta_pending_connections[websocket] = time.time()
    
    try:
        while True:
            # ping 메시지 대기 (5초 타임아웃)
            try:
                message = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
                
                # 대기 중인 연결 상태 업데이트
                if websocket in meta_pending_connections:
                    meta_pending_connections[websocket] = time.time()
                
                # ping 메시지를 받았고 아직 등록되지 않은 경우에만 등록
                if message == "ping" and websocket not in meta_connections:
                    # 대기 목록에서 제거하고 활성 목록에 추가
                    if websocket in meta_pending_connections:
                        del meta_pending_connections[websocket]
                    
                    meta_connections.add(websocket)
                    print(f"🟢 메타 WebSocket ping 수신 - 접속 등록됨 ({client_info}, 총 {len(meta_connections)}명)")
            except asyncio.TimeoutError:
                # 타임아웃은 정상임, 계속 대기
                continue
            
    except WebSocketDisconnect:
        print(f"🔴 메타 WebSocket 연결 해제됨 ({client_info})")
    finally:
        meta_connections.discard(websocket)
        if websocket in meta_pending_connections:
            del meta_pending_connections[websocket]
        print(f"🔵 메타 WebSocket 연결 제거됨 ({client_info}, 총 {len(meta_connections)}명)")


# === HTTP 라우터 ===
@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# @app.get("/favicon.ico")
# async def favicon():
#     return RedirectResponse(url="/static/favicon.ico")

# === 실행 ===
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
