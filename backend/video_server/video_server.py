from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect

from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from fastapi.templating import Jinja2Templates
import cv2
import asyncio
from pathlib import Path


# === 앱 초기화 ===
active_connections = set()
broadcast_task = None
is_streaming = True  # 스트리밍 상태 추가


# === WebSocket으로 프레임 송출 ===
async def video_broadcast():
    import time

    # OpenCV 최적화 활성화
    cv2.setUseOptimized(True)

    # 복구 관련 변수
    consecutive_failures = 0
    max_consecutive_failures = 5
    last_reconnect_time = time.time()
    reconnect_interval = 10  # 재연결 시도 간격(초)

    # 카메라 초기화 함수
    def init_camera():
        nonlocal cap
        if cap is not None:
            cap.release()  # 기존 카메라 리소스 해제

        cap = cv2.VideoCapture(0)
        return cap.isOpened()

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("🚨 카메라 열기 실패")
        return

    w = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    h = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)

    print(f"📷 카메라 송출 시작됨 기본 해상도: {int(w)}×{int(h)}")
    
    try:
        while True:
            # 스트리밍이 일시정지된 경우 대기
            if not is_streaming:
                await asyncio.sleep(0.1)
                continue

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
                except Exception as e:
                    print(f"💥 송신 중 예외 발생: {e}")
                    disconnected.add(ws)

            for ws in disconnected:
                active_connections.discard(ws)

            await asyncio.sleep(0.01)
    finally:
        cap.release()
        print("🛑 카메라 리소스 해제 완료")


# === lifespan 기반 프레임 수신 태스크 관리 ===
@asynccontextmanager
async def lifespan(app: FastAPI):
    global broadcast_task
    broadcast_task = asyncio.create_task(video_broadcast())
    yield
    broadcast_task.cancel()
    print("🛑 영상 송출 태스크 종료")


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# === WebSocket 엔드포인트 ===
@app.websocket("/ws/video")
async def video_feed_ws(websocket: WebSocket):
    await websocket.accept()
    print("🟡 WebSocket 수락됨 (ping 대기 중...)")
    try:
        while True:
            await websocket.receive_text()  # ping 메시지 대기
            if websocket not in active_connections:
                active_connections.add(websocket)
                print(f"🟢 WebSocket ping 수신 - 접속 등록됨 ({len(active_connections)}명)")
    except WebSocketDisconnect:
        print("🔴 WebSocket 연결 해제됨")
    finally:
        active_connections.discard(websocket)
        print(f"🔵 WebSocket 연결 제거됨 (총 {len(active_connections)}명)")


# === HTTP 라우터 ===
@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# @app.get("/favicon.ico")
# async def favicon():
#     return RedirectResponse(url="/static/favicon.ico")

# === 비디오 스트림 제어 함수 ===
def control_stream(action: str) -> bool:
    global is_streaming
    if action == "play":
        is_streaming = True
        return True
    elif action == "pause":
        is_streaming = False
        return True
    return False

def refresh_stream() -> bool:
    global cap
    if cap is not None:
        cap.release()
    cap = cv2.VideoCapture(0)
    return cap.isOpened()

# === 비디오 제어 엔드포인트 ===
@app.post("/control")
async def control_video(action: str):
    success = control_stream(action)
    return {"success": success, "message": f"비디오 스트림 {action} {'성공' if success else '실패'}"}

@app.post("/refresh")
async def refresh_video():
    success = refresh_stream()
    return {"success": success, "message": "비디오 스트림 새로고침 " + ("성공" if success else "실패")}

# === 실행 ===
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
