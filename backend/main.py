from fastapi import FastAPI, Request, WebSocket, UploadFile, File, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import httpx
import cv2
import numpy as np
import base64
import json

app = FastAPI()

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경에서는 모든 출처 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 정적 파일 폴더 생성
STATIC_IMG_PATH = "static/img"
os.makedirs(STATIC_IMG_PATH, exist_ok=True)

# 예제 이미지 파일 생성 (빈 파일)
for i in range(1, 6):
    open(f"{STATIC_IMG_PATH}/sample{i}.jpg", "wb").close()
open(f"{STATIC_IMG_PATH}/snapshot.jpg", "wb").close()

# 정적 파일 경로 마운트
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic 모델 정의
class CameraSettings(BaseModel):
    rtspUrl: str
    ipCameraUrl: str
    usbCameraIndex: str
    resolution: str
    fps: int
    enableAutoReconnect: bool
    reconnectInterval: int
    bufferSize: int

class ModelSettings(BaseModel):
    modelVersion: str
    modelSize: str
    customModelPath: str
    confidenceThreshold: float
    iouThreshold: float
    maxDetections: int
    enableGPU: bool
    enableBatchProcessing: bool
    batchSize: int
    enableTensorRT: bool
    enableQuantization: bool
    quantizationType: str

class OcrSettings(BaseModel):
    engine: str
    language: str
    customModelPath: str
    confidenceThreshold: float
    enablePreprocessing: bool
    preprocessingSteps: List[str]
    enableAutoRotation: bool
    maxRotationAngle: int
    enableDigitsOnly: bool
    minDigits: int
    maxDigits: int
    enableWhitelist: bool
    whitelist: str
    enableBlacklist: bool
    blacklist: str
    enableGPU: bool

class TrackingSettings(BaseModel):
    algorithm: str
    maxDisappeared: int
    maxDistance: int
    minConfidence: float
    iouThreshold: float
    enableKalmanFilter: bool
    enableDirectionDetection: bool
    directionThreshold: float
    enableSizeFiltering: bool
    minWidth: int
    minHeight: int
    maxWidth: int
    maxHeight: int
    trackingMode: str

class SystemSettings(BaseModel):
    processingMode: str
    maxThreads: int
    enableMultiprocessing: bool
    gpuMemoryLimit: int
    maxFps: int
    enableFrameSkipping: bool
    frameSkipRate: int
    logLevel: str
    logRetentionDays: int
    enableImageSaving: bool
    imageSavePath: str
    imageFormat: str
    imageQuality: int
    maxStorageSize: int
    enableNotifications: bool
    notifyOnError: bool
    notifyOnWarning: bool
    notifyOnSuccess: bool
    emailNotifications: bool
    emailRecipients: str
    enableAutoBackup: bool
    backupInterval: int
    backupPath: str
    maxBackupCount: int

VIDEO_SERVER_URL = "http://127.0.0.1:8000"

# 트레이닝 관련 Pydantic 모델
class Dataset(BaseModel):
    id: str
    name: str
    images: int
    annotations: int
    status: str
    lastUpdated: str

class Hyperparameters(BaseModel):
    modelVersion: str
    modelSize: str
    epochs: int
    batchSize: int
    imageSize: int
    learningRate: float
    weightDecay: float
    momentum: float
    useCosineScheduler: bool
    warmupEpochs: int
    iouThreshold: float
    confThreshold: float
    useAMP: bool
    useEMA: bool
    freezeBackbone: bool
    freezeBackboneEpochs: int
    useFineTuning: bool
    pretrainedModel: str
    freezeLayers: str
    fineTuningLearningRate: float
    onlyTrainNewLayers: bool

class ModelInfo(BaseModel):
    id: str
    name: str
    version: str
    type: str
    accuracy: float
    size: str
    createdAt: str
    lastUsed: str
    status: str
    tags: List[str]

class TrainingMetrics(BaseModel):
    epoch: int
    loss: float
    precision: float
    recall: float
    mAP: float
    learningRate: float
    timestamp: str

class EvaluationResults(BaseModel):
    mAP50: float
    mAP50_95: float
    precision: float
    recall: float
    f1Score: float
    inferenceTime: float
    confusionMatrix: Dict[str, int]
    classAccuracy: Dict[str, float]

class TestResult(BaseModel):
    id: int
    imageUrl: str
    predictions: List[Dict[str, Any]]
    groundTruth: List[Dict[str, Any]]
    correct: bool

class DeploymentSettings(BaseModel):
    modelFormat: str
    targetDevice: str
    enableQuantization: bool
    quantizationType: str
    optimizeForInference: bool
    deploymentTarget: str
    modelVersion: str
    modelName: str
    includeMetadata: bool

class DeployedModel(BaseModel):
    id: str
    name: str
    format: str
    size: str
    target: str
    deployedAt: str
    status: str

@app.get("/api/detection/stats")
def get_detection_stats():
    return {
        "totalDetections": 100,
        "successfulOcr": 75,
        "averageConfidence": 88.4,
        "processingFps": 23.5,
        "lastDetection": datetime.utcnow().isoformat(),
    }


@app.get("/api/ocr/results")
def get_ocr_results(limit: int = 5):
    return [
        {
            "id": i,
            "timestamp": datetime.utcnow().isoformat(),
            "number": f"{1000 + i}",
            "confidence": 90 + i,
            "imageUrl": f"/static/img/sample{i}.jpg",
        }
        for i in range(1, limit + 1)
    ]


@app.get("/api/system/status")
def get_system_status():
    return {
        "camera": "normal",
        "yoloModel": "normal",
        "ocrEngine": "normal",
        "plcConnection": "normal",
        "systemLoad": "normal",
        "systemLoadPercentage": 35,
    }


@app.post("/api/video/control")
async def control_video_stream(request: Request):
    try:
        data = await request.json()
        action = data.get("action")
        
        if action not in ["play", "pause"]:
            return {"success": False, "message": "잘못된 액션입니다."}
            
        # video_server에 제어 명령 전달
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{VIDEO_SERVER_URL}/control", params={"action": action})
            if response.status_code != 200:
                return {"success": False, "message": "비디오 서버 통신 실패"}
            
            result = response.json()
            return result
            
    except Exception as e:
        return {
            "success": False,
            "message": f"비디오 스트림 제어 실패: {str(e)}"
        }


@app.post("/api/detection/settings")
async def toggle_detection(request: Request):
    data = await request.json()
    return {"success": True, "message": "감지 설정 변경 성공"}


@app.post("/api/ocr/settings")
async def toggle_ocr(request: Request):
    data = await request.json()
    return {"success": True, "message": "OCR 설정 변경 성공"}


@app.post("/api/video/snapshot")
def capture_snapshot():
    return {"success": True, "imageUrl": "/static/img/snapshot.jpg"}


@app.post("/api/video/refresh")
async def refresh_video_stream():
    try:
        # video_server에 새로고침 명령 전달
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{VIDEO_SERVER_URL}/refresh")
            if response.status_code != 200:
                return {"success": False, "message": "비디오 서버 통신 실패"}
            
            result = response.json()
            return result
            
    except Exception as e:
        return {
            "success": False,
            "message": f"비디오 스트림 새로고침 실패: {str(e)}"
        }


@app.post("/api/detection/threshold")
async def set_confidence_threshold(request: Request):
    data = await request.json()
    return {"success": True, "message": "신뢰도 임계값 설정 성공"}


# PLC 설정 가져오기
@app.get("/api/plc/settings")
def get_plc_settings():
    return {
        "device": {
            "id": "plc1",
            "name": "메인 PLC",
            "type": "modbus_tcp",
            "connectionType": "tcp",
            "ipAddress": "192.168.1.100",
            "port": 502,
            "timeout": 1000,
            "status": "disconnected",
        },
        "protocol": "modbus_tcp",
        "dataMappings": [
            {
                "id": "mapping1",
                "name": "트럭 감지 신호",
                "plcAddress": "40001",
                "dataType": "bit",
                "access": "read",
                "description": "트럭이 감지되면 1, 아니면 0",
            },
            {
                "id": "mapping2",
                "name": "카메라 트리거",
                "plcAddress": "40002",
                "dataType": "bit",
                "access": "write",
                "description": "카메라 촬영 트리거 신호",
            },
            {
                "id": "mapping3",
                "name": "컨테이너 번호",
                "plcAddress": "40100",
                "dataType": "string",
                "access": "read_write",
                "description": "인식된 컨테이너 번호",
            },
        ],
        "autoConnect": True,
        "reconnectInterval": 5000,
        "maxReconnectAttempts": 5,
    }


# PLC 장치 정보 업데이트
@app.put("/api/plc/device")
async def update_plc_device(request: Request):
    data = await request.json()
    return data


# PLC 연결 시도
@app.post("/api/plc/connect/{device_id}")
def connect_plc(device_id: str):
    return {
        "id": device_id,
        "status": "connected",
        "lastConnected": __import__("datetime").datetime.utcnow().isoformat(),
    }


# PLC 연결 해제
@app.post("/api/plc/disconnect/{device_id}")
def disconnect_plc(device_id: str):
    return {"id": device_id, "status": "disconnected"}


# 프로토콜 설정 업데이트
@app.put("/api/plc/protocol")
async def update_plc_protocol(request: Request):
    data = await request.json()
    return {"protocol": data.get("protocol")}


# 데이터 매핑 목록 가져오기
@app.get("/api/plc/mappings")
def get_data_mappings():
    return [
        {
            "id": "mapping1",
            "name": "트럭 감지 신호",
            "plcAddress": "40001",
            "dataType": "bit",
            "access": "read",
            "description": "트럭이 감지되면 1, 아니면 0",
        },
        {
            "id": "mapping2",
            "name": "카메라 트리거",
            "plcAddress": "40002",
            "dataType": "bit",
            "access": "write",
            "description": "카메라 촬영 트리거 신호",
        },
        {
            "id": "mapping3",
            "name": "컨테이너 번호",
            "plcAddress": "40100",
            "dataType": "string",
            "access": "read_write",
            "description": "인식된 컨테이너 번호",
        },
    ]


# 데이터 매핑 추가
@app.post("/api/plc/mappings")
async def add_data_mapping(request: Request):
    data = await request.json()
    return data


# 데이터 매핑 업데이트
@app.put("/api/plc/mappings/{mapping_id}")
async def update_data_mapping(mapping_id: str, request: Request):
    data = await request.json()
    data["id"] = mapping_id
    return data


# 데이터 매핑 삭제
@app.delete("/api/plc/mappings/{mapping_id}")
def delete_data_mapping(mapping_id: str):
    return {}


# PLC 데이터 읽기
@app.post("/api/plc/read")
async def read_plc_data(request: Request):
    data = await request.json()
    return {"value": "0"}


# PLC 데이터 쓰기
@app.post("/api/plc/write")
async def write_plc_data(request: Request):
    return {}


# 통신 로그 가져오기
@app.get("/api/plc/logs")
def get_communication_logs():
    logs = []
    now = datetime.utcnow()
    for i in range(5):
        logs.append(
            {
                "id": f"log-{i}",
                "timestamp": (now - timedelta(seconds=i * 60)).isoformat(),
                "direction": "read" if i % 2 == 0 else "write",
                "address": "4000" + str(i + 1),
                "value": "1" if i % 2 == 0 else "SET",
                "status": "success",
                "responseTime": 20 + i,
            }
        )
    return logs


# 통계 데이터 가져오기
@app.get("/api/plc/statistics")
def get_plc_statistics():
    return {
        "totalTransactions": 1250,
        "successfulTransactions": 1180,
        "failedTransactions": 70,
        "averageResponseTime": 45.8,
        "uptime": 86400 * 3.5,
        "lastErrorMessage": "Connection timeout",
        "lastErrorTimestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }


# OCR 로그 목록 (POST)
@app.post("/api/logs/ocr")
async def post_logs_ocr(request: Request):
    filters = await request.json()
    # 기본 예시 응답 (filters 무시)
    return [
        {
            "id": f"log-{i}",
            "timestamp": datetime.utcnow().isoformat(),
            "recognizedNumber": f"{1000 + i}",
            "confidence": 90 + i,
            "roiName": "입구 영역",
            "imageUrl": f"/static/img/sample{i}.jpg",
            "processingTime": 50 + i,
            "status": "success",
            "sentToPLC": True,
            "truckId": f"TRUCK-{100 + i}",
        }
        for i in range(1, 6)
    ]


# OCR 로그 통계 (POST)
@app.post("/api/logs/stats")
async def post_logs_stats(request: Request):
    _ = await request.json()
    return {
        "totalCount": 127,
        "successCount": 98,
        "avgConfidence": 87.5,
        "plcSentCount": 92,
        "dailyStats": [
            {"date": "2025-05-13", "count": 12},
            {"date": "2025-05-14", "count": 15},
            {"date": "2025-05-15", "count": 18},
            {"date": "2025-05-16", "count": 22},
            {"date": "2025-05-17", "count": 19},
        ],
        "confidenceDistribution": {
            "0-50%": 5,
            "51-70%": 12,
            "71-85%": 25,
            "86-95%": 45,
            "96-100%": 40,
        },
        "roiDistribution": {
            "입구 영역": 35,
            "출구 영역": 28,
            "주차장 입구": 22,
            "하차장": 19,
            "검수 구역": 23,
        },
    }


# OCR 로그 내보내기 (POST)
@app.post("/api/logs/export")
async def post_logs_export(request: Request):
    data = await request.json()
    fmt = data.get("format", "csv")
    return {"downloadUrl": f"/static/exports/logs.{fmt}"}


# WebSocket: 새 OCR 로그 구독
@app.websocket("/api/logs/subscribe")
async def ws_logs_subscribe(websocket: WebSocket):
    await websocket.accept()
    while True:
        log = {
            "id": f"log-{int(datetime.utcnow().timestamp())}",
            "timestamp": datetime.utcnow().isoformat(),
            "recognizedNumber": "1234",
            "confidence": 95,
            "roiName": "입구 영역",
            "imageUrl": "/static/img/snapshot.jpg",
            "processingTime": 60,
            "status": "success",
            "sentToPLC": True,
            "truckId": None,
        }
        await websocket.send_json({"type": "newLog", "log": log})
        await asyncio.sleep(5)


# Camera Settings
@app.get("/api/settings/camera")
def get_camera_settings():
    return {
        "rtspUrl": "rtsp://example.com/stream",
        "ipCameraUrl": "http://example.com/stream",
        "usbCameraIndex": "0",
        "resolution": "1920x1080",
        "fps": 30,
        "enableAutoReconnect": True,
        "reconnectInterval": 5000,
        "bufferSize": 10
    }


@app.put("/api/settings/camera")
async def update_camera_settings(settings: CameraSettings):
    return settings


@app.post("/api/settings/camera/test")
async def test_camera_connection(settings: CameraSettings):
    return {"success": True, "message": "카메라 연결 테스트 성공"}


@app.post("/api/settings/camera/connect")
async def connect_camera(settings: CameraSettings):
    return {"success": True, "message": "카메라 연결 성공"}


# Model Settings
@app.get("/api/settings/model")
def get_model_settings():
    return {
        "modelVersion": "v8",
        "modelSize": "large",
        "customModelPath": "/models/custom.pt",
        "confidenceThreshold": 0.5,
        "iouThreshold": 0.45,
        "maxDetections": 100,
        "enableGPU": True,
        "enableBatchProcessing": True,
        "batchSize": 4,
        "enableTensorRT": True,
        "enableQuantization": True,
        "quantizationType": "int8"
    }


@app.put("/api/settings/model")
async def update_model_settings(settings: ModelSettings):
    return settings


@app.post("/api/settings/model/load")
async def load_model(settings: ModelSettings):
    return {"success": True, "message": "모델 로드 성공"}


# OCR Settings
@app.get("/api/settings/ocr")
def get_ocr_settings():
    return {
        "engine": "tesseract",
        "language": "eng",
        "customModelPath": "/models/ocr",
        "confidenceThreshold": 0.8,
        "enablePreprocessing": True,
        "preprocessingSteps": ["grayscale", "threshold"],
        "enableAutoRotation": True,
        "maxRotationAngle": 45,
        "enableDigitsOnly": True,
        "minDigits": 4,
        "maxDigits": 8,
        "enableWhitelist": True,
        "whitelist": "0123456789",
        "enableBlacklist": False,
        "blacklist": "",
        "enableGPU": True
    }


@app.put("/api/settings/ocr")
async def update_ocr_settings(settings: OcrSettings):
    return settings


@app.post("/api/settings/ocr/test")
async def test_ocr(settings: OcrSettings):
    return {"success": True, "message": "OCR 테스트 성공", "text": "123456"}


# Tracking Settings
@app.get("/api/settings/tracking")
def get_tracking_settings():
    return {
        "algorithm": "sort",
        "maxDisappeared": 30,
        "maxDistance": 50,
        "minConfidence": 0.5,
        "iouThreshold": 0.3,
        "enableKalmanFilter": True,
        "enableDirectionDetection": True,
        "directionThreshold": 0.7,
        "enableSizeFiltering": True,
        "minWidth": 100,
        "minHeight": 100,
        "maxWidth": 800,
        "maxHeight": 800,
        "trackingMode": "normal"
    }


@app.put("/api/settings/tracking")
async def update_tracking_settings(settings: TrackingSettings):
    return settings


@app.post("/api/settings/tracking/test")
async def test_tracking(settings: TrackingSettings):
    return {"success": True, "message": "추적 테스트 성공"}


# System Settings
@app.get("/api/settings/system")
def get_system_settings():
    return {
        "processingMode": "gpu",
        "maxThreads": 4,
        "enableMultiprocessing": True,
        "gpuMemoryLimit": 4096,
        "maxFps": 30,
        "enableFrameSkipping": True,
        "frameSkipRate": 2,
        "logLevel": "info",
        "logRetentionDays": 30,
        "enableImageSaving": True,
        "imageSavePath": "/data/images",
        "imageFormat": "jpg",
        "imageQuality": 95,
        "maxStorageSize": 1000000,
        "enableNotifications": True,
        "notifyOnError": True,
        "notifyOnWarning": True,
        "notifyOnSuccess": False,
        "emailNotifications": False,
        "emailRecipients": "",
        "enableAutoBackup": True,
        "backupInterval": 86400,
        "backupPath": "/data/backups",
        "maxBackupCount": 10
    }


@app.put("/api/settings/system")
async def update_system_settings(settings: SystemSettings):
    return settings


@app.get("/api/settings/system/info")
def get_system_info():
    return {
        "cpuUsage": 45.5,
        "memoryUsage": {
            "used": 4096,
            "total": 8192
        },
        "gpuUsage": 75.2,
        "diskUsage": {
            "used": 500000,
            "total": 1000000
        },
        "lastBackupTime": datetime.utcnow().isoformat(),
        "backupSize": 1024
    }


@app.post("/api/settings/system/logs/clear")
def clear_logs():
    return {"success": True, "message": "로그 삭제 성공"}


@app.post("/api/settings/system/backup")
def backup_system():
    return {"success": True, "message": "시스템 백업 성공", "backupPath": "/data/backups/backup_20240320.zip"}


# Save and Reset
@app.post("/api/settings/save")
def save_all_settings():
    return {"success": True, "message": "모든 설정 저장 성공"}


@app.post("/api/settings/reset")
def reset_settings():
    return {"success": True, "message": "설정 초기화 성공"}


# 트레이닝 관련 엔드포인트
@app.get("/api/training/datasets")
def get_datasets():
    return [
        {
            "id": "dataset-1",
            "name": "트럭 데이터셋 v1",
            "images": 1250,
            "annotations": 1250,
            "status": "ready",
            "lastUpdated": datetime.utcnow().isoformat()
        }
    ]

@app.post("/api/training/datasets")
async def upload_dataset(file: UploadFile = File(...)):
    return {
        "id": "dataset-2",
        "name": file.filename,
        "images": 0,
        "annotations": 0,
        "status": "processing",
        "lastUpdated": datetime.utcnow().isoformat()
    }

@app.delete("/api/training/datasets/{dataset_id}")
def delete_dataset(dataset_id: str):
    return {"success": True, "message": "데이터셋 삭제 성공"}

@app.get("/api/training/hyperparameters")
def get_hyperparameters():
    return {
        "modelVersion": "yolov8",
        "modelSize": "medium",
        "epochs": 100,
        "batchSize": 16,
        "imageSize": 640,
        "learningRate": 0.01,
        "weightDecay": 0.0005,
        "momentum": 0.937,
        "useCosineScheduler": True,
        "warmupEpochs": 3,
        "iouThreshold": 0.7,
        "confThreshold": 0.25,
        "useAMP": True,
        "useEMA": True,
        "freezeBackbone": False,
        "freezeBackboneEpochs": 10,
        "useFineTuning": False,
        "pretrainedModel": "",
        "freezeLayers": "backbone",
        "fineTuningLearningRate": 0.001,
        "onlyTrainNewLayers": False
    }

@app.put("/api/training/hyperparameters")
async def update_hyperparameters(hyperparameters: Hyperparameters):
    return hyperparameters

@app.get("/api/training/models")
def get_models():
    return [
        {
            "id": "model-1",
            "name": "YOLOv8m 기본 모델",
            "version": "v8.0.0",
            "type": "pretrained",
            "accuracy": 89.5,
            "size": "78.5MB",
            "createdAt": datetime.utcnow().isoformat(),
            "lastUsed": datetime.utcnow().isoformat(),
            "status": "active",
            "tags": ["기본", "공식"]
        }
    ]

@app.get("/api/training/models/{model_id}")
def get_model_by_id(model_id: str):
    return {
        "id": model_id,
        "name": "YOLOv8m 기본 모델",
        "version": "v8.0.0",
        "type": "pretrained",
        "accuracy": 89.5,
        "size": "78.5MB",
        "createdAt": datetime.utcnow().isoformat(),
        "lastUsed": datetime.utcnow().isoformat(),
        "status": "active",
        "tags": ["기본", "공식"]
    }

@app.post("/api/training/start")
async def start_training(
    dataset_id: str,
    model_id: Optional[str] = None,
    hyperparameters: Hyperparameters = None
):
    return {"trainingId": "training-1"}

@app.post("/api/training/stop/{training_id}")
def stop_training(training_id: str):
    return {"success": True, "message": "트레이닝 중지 성공"}

@app.get("/api/training/metrics/{training_id}")
def get_training_metrics(training_id: str):
    return [
        {
            "epoch": 1,
            "loss": 0.5,
            "precision": 0.8,
            "recall": 0.7,
            "mAP": 0.75,
            "learningRate": 0.01,
            "timestamp": datetime.utcnow().isoformat()
        }
    ]

@app.get("/api/training/logs/{training_id}")
def get_training_logs(training_id: str):
    return ["트레이닝 시작", "에포크 1 완료", "에포크 2 완료"]

@app.post("/api/training/evaluate/{model_id}")
def evaluate_model(model_id: str):
    return {
        "mAP50": 0.85,
        "mAP50_95": 0.75,
        "precision": 0.8,
        "recall": 0.7,
        "f1Score": 0.75,
        "inferenceTime": 0.05,
        "confusionMatrix": {
            "truePositives": 100,
            "falsePositives": 20,
            "falseNegatives": 30,
            "trueNegatives": 850
        },
        "classAccuracy": {
            "truck": 0.85,
            "car": 0.90
        }
    }

@app.get("/api/training/test-results/{model_id}")
def get_test_results(model_id: str):
    return [
        {
            "id": 1,
            "imageUrl": "/static/img/test1.jpg",
            "predictions": [
                {
                    "label": "truck",
                    "confidence": 0.95,
                    "bbox": [100, 100, 200, 200]
                }
            ],
            "groundTruth": [
                {
                    "label": "truck",
                    "bbox": [100, 100, 200, 200]
                }
            ],
            "correct": True
        }
    ]

@app.get("/api/training/deployment-settings")
def get_deployment_settings():
    return {
        "modelFormat": "onnx",
        "targetDevice": "gpu",
        "enableQuantization": True,
        "quantizationType": "int8",
        "optimizeForInference": True,
        "deploymentTarget": "production",
        "modelVersion": "v1",
        "modelName": "truck-detector",
        "includeMetadata": True
    }

@app.put("/api/training/deployment-settings")
async def update_deployment_settings(settings: DeploymentSettings):
    return settings

@app.post("/api/training/deploy/{model_id}")
async def deploy_model(model_id: str, settings: DeploymentSettings):
    return {"deploymentId": "deploy-1"}

@app.get("/api/training/deployed-models")
def get_deployed_models():
    return [
        {
            "id": "deploy-1",
            "name": "트럭 감지 모델 v1",
            "format": "onnx",
            "size": "45MB",
            "target": "production",
            "deployedAt": datetime.utcnow().isoformat(),
            "status": "active"
        }
    ]

# WebSocket 연결 관리를 위한 클래스
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.video_connections: List[WebSocket] = []
        self.meta_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, connection_type: str):
        try:
            await websocket.accept()
            if connection_type == "video":
                self.video_connections.append(websocket)
            elif connection_type == "meta":
                self.meta_connections.append(websocket)
            self.active_connections.append(websocket)
            print(f"{connection_type} WebSocket 연결됨")
        except Exception as e:
            print(f"WebSocket 연결 오류: {str(e)}")
            raise

    def disconnect(self, websocket: WebSocket, connection_type: str):
        try:
            if connection_type == "video" and websocket in self.video_connections:
                self.video_connections.remove(websocket)
            elif connection_type == "meta" and websocket in self.meta_connections:
                self.meta_connections.remove(websocket)
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            print(f"{connection_type} WebSocket 연결 해제됨")
        except Exception as e:
            print(f"WebSocket 연결 해제 오류: {str(e)}")

    async def broadcast_video(self, frame: bytes):
        disconnected = []
        for connection in self.video_connections:
            try:
                await connection.send_bytes(frame)
            except Exception as e:
                print(f"비디오 전송 오류: {str(e)}")
                disconnected.append(connection)
        
        for connection in disconnected:
            self.disconnect(connection, "video")

    async def broadcast_meta(self, data: dict):
        disconnected = []
        for connection in self.meta_connections:
            try:
                await connection.send_text(json.dumps(data))
            except Exception as e:
                print(f"메타데이터 전송 오류: {str(e)}")
                disconnected.append(connection)
        
        for connection in disconnected:
            self.disconnect(connection, "meta")

manager = ConnectionManager()

# 비디오 스트림을 위한 WebSocket 엔드포인트
@app.websocket("/ws/video")
async def websocket_video_endpoint(websocket: WebSocket):
    try:
        await manager.connect(websocket, "video")
        while True:
            try:
                # 테스트용 더미 프레임 생성
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame, "Test Frame", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                _, buffer = cv2.imencode('.jpg', frame)
                await manager.broadcast_video(buffer.tobytes())
                await asyncio.sleep(0.033)  # 약 30 FPS
            except Exception as e:
                print(f"비디오 프레임 생성/전송 오류: {str(e)}")
                break
    except WebSocketDisconnect:
        manager.disconnect(websocket, "video")
    except Exception as e:
        print(f"비디오 WebSocket 오류: {str(e)}")
        manager.disconnect(websocket, "video")

# 메타데이터를 위한 WebSocket 엔드포인트
@app.websocket("/ws/meta")
async def websocket_meta_endpoint(websocket: WebSocket):
    try:
        await manager.connect(websocket, "meta")
        while True:
            try:
                # 테스트용 더미 메타데이터 생성
                data = {
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
                await manager.broadcast_meta(data)
                await asyncio.sleep(0.1)  # 10 FPS
            except Exception as e:
                print(f"메타데이터 생성/전송 오류: {str(e)}")
                break
    except WebSocketDisconnect:
        manager.disconnect(websocket, "meta")
    except Exception as e:
        print(f"메타 WebSocket 오류: {str(e)}")
        manager.disconnect(websocket, "meta")

# 👇 바로 실행 가능하도록 구성
def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8010, reload=True)


if __name__ == "__main__":
    main()
