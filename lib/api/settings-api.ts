"use client";

/**
 * 설정 관련 API 호출을 위한 모듈
 * 카메라, YOLO 모델, OCR 엔진, 객체 추적, 시스템 설정 관련 API 함수를 제공합니다.
 */

import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";

// 기본 API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010";

// ==================== 타입 정의 ====================

/**
 * 카메라 설정 타입
 */
export interface CameraSettings {
  rtspUrl: string;
  ipCameraUrl: string;
  usbCameraIndex: string;
  resolution: string;
  fps: number;
  enableAutoReconnect: boolean;
  reconnectInterval: number;
  bufferSize: number;
}

/**
 * YOLO 모델 설정 타입
 */
export interface ModelSettings {
  modelVersion: string;
  modelSize: string;
  customModelPath: string;
  confidenceThreshold: number;
  iouThreshold: number;
  maxDetections: number;
  enableGPU: boolean;
  enableBatchProcessing: boolean;
  batchSize: number;
  enableTensorRT: boolean;
  enableQuantization: boolean;
  quantizationType: string;
}

/**
 * OCR 엔진 설정 타입
 */
export interface OcrSettings {
  engine: string;
  language: string;
  customModelPath: string;
  confidenceThreshold: number;
  enablePreprocessing: boolean;
  preprocessingSteps: string[];
  enableAutoRotation: boolean;
  maxRotationAngle: number;
  enableDigitsOnly: boolean;
  minDigits: number;
  maxDigits: number;
  enableWhitelist: boolean;
  whitelist: string;
  enableBlacklist: boolean;
  blacklist: string;
  enableGPU: boolean;
}

/**
 * 객체 추적 설정 타입
 */
export interface TrackingSettings {
  algorithm: string;
  maxDisappeared: number;
  maxDistance: number;
  minConfidence: number;
  iouThreshold: number;
  enableKalmanFilter: boolean;
  enableDirectionDetection: boolean;
  directionThreshold: number;
  enableSizeFiltering: boolean;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  trackingMode: string;
}

/**
 * 시스템 설정 타입
 */
export interface SystemSettings {
  processingMode: string;
  maxThreads: number;
  enableMultiprocessing: boolean;
  gpuMemoryLimit: number;
  maxFps: number;
  enableFrameSkipping: boolean;
  frameSkipRate: number;
  logLevel: string;
  logRetentionDays: number;
  enableImageSaving: boolean;
  imageSavePath: string;
  imageFormat: string;
  imageQuality: number;
  maxStorageSize: number;
  enableNotifications: boolean;
  notifyOnError: boolean;
  notifyOnWarning: boolean;
  notifyOnSuccess: boolean;
  emailNotifications: boolean;
  emailRecipients: string;
  enableAutoBackup: boolean;
  backupInterval: number;
  backupPath: string;
  maxBackupCount: number;
}

/**
 * 시스템 정보 타입
 */
export interface SystemInfo {
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
  };
  gpuUsage: number;
  diskUsage: {
    used: number;
    total: number;
  };
  lastBackupTime?: string;
  backupSize?: number;
}

// ==================== API 함수 ====================

/**
 * 카메라 설정을 가져오는 함수
 * @param toast 알림 함수
 * @returns 카메라 설정 객체
 */
export async function getCameraSettings(toast: any): Promise<CameraSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/camera`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("카메라 설정 조회 오류:", error);
    toast({
      title: "카메라 설정 로드 실패",
      description:
        "서버에서 카메라 설정을 불러올 수 없습니다. 기본값을 사용합니다.",
      variant: "destructive",
    });
    return {
      rtspUrl: "rtsp://example.com/stream",
      ipCameraUrl: "http://example.com/stream",
      usbCameraIndex: "0",
      resolution: "1920x1080",
      fps: 30,
      enableAutoReconnect: true,
      reconnectInterval: 5000,
      bufferSize: 10,
    };
  }
}

/**
 * 카메라 설정을 업데이트하는 함수
 * @param settings 업데이트할 카메라 설정
 * @param toast 알림 함수
 * @returns 업데이트된 카메라 설정
 */
export async function updateCameraSettings(
  settings: Partial<CameraSettings>,
  toast: any
): Promise<CameraSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/camera`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    toast({
      title: "카메라 설정 업데이트 성공",
      description: "카메라 설정이 성공적으로 업데이트되었습니다.",
    });

    return response.json();
  } catch (error) {
    console.error("카메라 설정 업데이트 중 오류 발생:", error);
    toast({
      title: "카메라 설정 업데이트 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 카메라 연결을 테스트하는 함수
 * @param settings 테스트할 카메라 설정
 * @param toast 알림 함수
 * @returns 테스트 결과
 */
export async function testCameraConnection(
  settings: Partial<CameraSettings>,
  toast: any
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/camera/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `API 오류: ${response.status}`);
    }

    toast({
      title: "연결 테스트 성공",
      description: "카메라 연결이 정상적으로 확인되었습니다.",
    });

    return result;
  } catch (error) {
    console.error("카메라 연결 테스트 중 오류 발생:", error);
    toast({
      title: "연결 테스트 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 카메라에 연결하는 함수
 * @param settings 연결할 카메라 설정
 * @param toast 알림 함수
 * @returns 연결 결과
 */
export async function connectCamera(
  settings: Partial<CameraSettings>,
  toast: any
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/camera/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `API 오류: ${response.status}`);
    }

    toast({
      title: "카메라 연결 성공",
      description: "카메라에 성공적으로 연결되었습니다.",
    });

    return result;
  } catch (error) {
    console.error("카메라 연결 중 오류 발생:", error);
    toast({
      title: "카메라 연결 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * YOLO 모델 설정을 가져오는 함수
 * @param toast 알림 함수
 * @returns YOLO 모델 설정 객체
 */
export async function getModelSettings(toast: any): Promise<ModelSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/model`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("모델 설정 조회 오류:", error);
    toast({
      title: "모델 설정 로드 실패",
      description:
        "서버에서 모델 설정을 불러올 수 없습니다. 기본값을 사용합니다.",
      variant: "destructive",
    });
    return {
      modelVersion: "yolov8",
      modelSize: "medium",
      customModelPath: "",
      confidenceThreshold: 0.25,
      iouThreshold: 0.45,
      maxDetections: 100,
      enableGPU: true,
      enableBatchProcessing: false,
      batchSize: 1,
      enableTensorRT: false,
      enableQuantization: false,
      quantizationType: "int8",
    };
  }
}

/**
 * YOLO 모델 설정을 업데이트하는 함수
 * @param settings 업데이트할 모델 설정
 * @param toast 알림 함수
 * @returns 업데이트된 모델 설정
 */
export async function updateModelSettings(
  settings: Partial<ModelSettings>,
  toast: any
): Promise<ModelSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/model`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    toast({
      title: "모델 설정 업데이트 성공",
      description: "모델 설정이 성공적으로 업데이트되었습니다.",
    });

    return await response.json();
  } catch (error) {
    console.error("모델 설정 업데이트 중 오류 발생:", error);
    toast({
      title: "모델 설정 업데이트 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * YOLO 모델을 로드하는 함수
 * @param settings 로드할 모델 설정
 * @param toast 알림 함수
 * @returns 로드 결과
 */
export async function loadModel(
  settings: Partial<ModelSettings>,
  toast: any
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/model/load`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `API 오류: ${response.status}`);
    }

    toast({
      title: "모델 로드 성공",
      description: "모델이 성공적으로 로드되었습니다.",
    });

    return result;
  } catch (error) {
    console.error("모델 로드 중 오류 발생:", error);
    toast({
      title: "모델 로드 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * OCR 설정을 가져오는 함수
 * @param toast 알림 함수
 * @returns OCR 설정 객체
 */
export async function getOcrSettings(toast: any): Promise<OcrSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/ocr`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("OCR 설정 조회 오류:", error);
    toast({
      title: "OCR 설정 로드 실패",
      description:
        "서버에서 OCR 설정을 불러올 수 없습니다. 기본값을 사용합니다.",
      variant: "destructive",
    });
    return {
      engine: "tesseract",
      language: "kor",
      customModelPath: "",
      confidenceThreshold: 0.7,
      enablePreprocessing: true,
      preprocessingSteps: ["grayscale", "threshold"],
      enableAutoRotation: true,
      maxRotationAngle: 45,
      enableDigitsOnly: true,
      minDigits: 4,
      maxDigits: 8,
      enableWhitelist: false,
      whitelist: "",
      enableBlacklist: false,
      blacklist: "",
      enableGPU: false,
    };
  }
}

/**
 * OCR 설정을 업데이트하는 함수
 * @param settings 업데이트할 OCR 설정
 * @param toast 알림 함수
 * @returns 업데이트된 OCR 설정
 */
export async function updateOcrSettings(
  settings: Partial<OcrSettings>,
  toast: any
): Promise<OcrSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/ocr`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    toast({
      title: "OCR 설정 업데이트 성공",
      description: "OCR 설정이 성공적으로 업데이트되었습니다.",
    });

    return await response.json();
  } catch (error) {
    console.error("OCR 설정 업데이트 중 오류 발생:", error);
    toast({
      title: "OCR 설정 업데이트 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * OCR 테스트를 수행하는 함수
 * @param settings 테스트할 OCR 설정
 * @param toast 알림 함수
 * @returns 테스트 결과
 */
export async function testOcr(
  settings: Partial<OcrSettings>,
  toast: any
): Promise<{ success: boolean; message: string; text?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/ocr/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `API 오류: ${response.status}`);
    }

    toast({
      title: "OCR 테스트 성공",
      description: "OCR 엔진이 정상적으로 작동합니다.",
    });

    return result;
  } catch (error) {
    console.error("OCR 테스트 중 오류 발생:", error);
    toast({
      title: "OCR 테스트 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 객체 추적 설정을 가져오는 함수
 * @param toast 알림 함수
 * @returns 객체 추적 설정 객체
 */
export async function getTrackingSettings(
  toast: any
): Promise<TrackingSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/tracking`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("추적 설정 조회 오류:", error);
    toast({
      title: "추적 설정 로드 실패",
      description:
        "서버에서 추적 설정을 불러올 수 없습니다. 기본값을 사용합니다.",
      variant: "destructive",
    });
    return {
      algorithm: "sort",
      maxDisappeared: 30,
      maxDistance: 50,
      minConfidence: 0.3,
      iouThreshold: 0.3,
      enableKalmanFilter: true,
      enableDirectionDetection: true,
      directionThreshold: 0.5,
      enableSizeFiltering: true,
      minWidth: 50,
      minHeight: 50,
      maxWidth: 500,
      maxHeight: 500,
      trackingMode: "normal",
    };
  }
}

/**
 * 객체 추적 설정을 업데이트하는 함수
 * @param settings 업데이트할 객체 추적 설정
 * @param toast 알림 함수
 * @returns 업데이트된 객체 추적 설정
 */
export async function updateTrackingSettings(
  settings: Partial<TrackingSettings>,
  toast: any
): Promise<TrackingSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/tracking`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    toast({
      title: "추적 설정 업데이트 성공",
      description: "추적 설정이 성공적으로 업데이트되었습니다.",
    });

    return await response.json();
  } catch (error) {
    console.error("추적 설정 업데이트 중 오류 발생:", error);
    toast({
      title: "추적 설정 업데이트 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 객체 추적 테스트를 수행하는 함수
 * @param settings 테스트할 객체 추적 설정
 * @param toast 알림 함수
 * @returns 테스트 결과
 */
export async function testTracking(
  settings: Partial<TrackingSettings>,
  toast: any
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/tracking/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `API 오류: ${response.status}`);
    }

    toast({
      title: "추적 테스트 성공",
      description: "객체 추적이 정상적으로 작동합니다.",
    });

    return result;
  } catch (error) {
    console.error("추적 테스트 중 오류 발생:", error);
    toast({
      title: "추적 테스트 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 시스템 설정을 가져오는 함수
 * @param toast 알림 함수
 * @returns 시스템 설정 객체
 */
export async function getSystemSettings(toast: any): Promise<SystemSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/system`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("시스템 설정 조회 오류:", error);
    toast({
      title: "시스템 설정 로드 실패",
      description:
        "서버에서 시스템 설정을 불러올 수 없습니다. 기본값을 사용합니다.",
      variant: "destructive",
    });
    return {
      processingMode: "normal",
      maxThreads: 4,
      enableMultiprocessing: true,
      gpuMemoryLimit: 2048,
      maxFps: 30,
      enableFrameSkipping: true,
      frameSkipRate: 2,
      logLevel: "info",
      logRetentionDays: 30,
      enableImageSaving: true,
      imageSavePath: "./images",
      imageFormat: "jpg",
      imageQuality: 90,
      maxStorageSize: 10240,
      enableNotifications: true,
      notifyOnError: true,
      notifyOnWarning: true,
      notifyOnSuccess: false,
      emailNotifications: false,
      emailRecipients: "",
      enableAutoBackup: true,
      backupInterval: 24,
      backupPath: "./backups",
      maxBackupCount: 10,
    };
  }
}

/**
 * 시스템 설정을 업데이트하는 함수
 * @param settings 업데이트할 시스템 설정
 * @param toast 알림 함수
 * @returns 업데이트된 시스템 설정
 */
export async function updateSystemSettings(
  settings: Partial<SystemSettings>,
  toast: any
): Promise<SystemSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/system`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    toast({
      title: "시스템 설정 업데이트 성공",
      description: "시스템 설정이 성공적으로 업데이트되었습니다.",
    });

    return await response.json();
  } catch (error) {
    console.error("시스템 설정 업데이트 중 오류 발생:", error);
    toast({
      title: "시스템 설정 업데이트 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 시스템 정보를 가져오는 함수
 * @param toast 알림 함수
 * @returns 시스템 정보 객체
 */
export async function getSystemInfo(toast: any): Promise<SystemInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/system/info`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("시스템 정보 조회 오류:", error);
    toast({
      title: "시스템 정보 로드 실패",
      description: "서버에서 시스템 정보를 불러올 수 없습니다.",
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 로그를 삭제하는 함수
 * @param toast 알림 함수
 * @returns 삭제 결과
 */
export async function clearLogs(toast: any): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/settings/system/logs/clear`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    const result = await response.json();
    toast({
      title: "로그 삭제 성공",
      description: "로그가 성공적으로 삭제되었습니다.",
    });
    return result;
  } catch (error) {
    console.error("로그 삭제 중 오류 발생:", error);
    toast({
      title: "로그 삭제 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 시스템 백업을 수행하는 함수
 * @param toast 알림 함수
 * @returns 백업 결과
 */
export async function backupSystem(toast: any): Promise<{
  success: boolean;
  message: string;
  backupPath?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/system/backup`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    const result = await response.json();
    toast({
      title: "백업 성공",
      description: "시스템이 성공적으로 백업되었습니다.",
    });
    return result;
  } catch (error) {
    console.error("시스템 백업 중 오류 발생:", error);
    toast({
      title: "백업 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 모든 설정을 저장하는 함수
 * @param toast 알림 함수
 * @returns 저장 결과
 */
export async function saveAllSettings(toast: any): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/save`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    const result = await response.json();
    toast({
      title: "설정 저장 성공",
      description: "모든 설정이 성공적으로 저장되었습니다.",
    });
    return result;
  } catch (error) {
    console.error("설정 저장 중 오류 발생:", error);
    toast({
      title: "설정 저장 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 설정을 기본값으로 복원하는 함수
 * @param toast 알림 함수
 * @returns 복원 결과
 */
export async function resetSettings(toast: any): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/reset`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    const result = await response.json();
    toast({
      title: "설정 초기화 성공",
      description: "모든 설정이 기본값으로 초기화되었습니다.",
    });
    return result;
  } catch (error) {
    console.error("설정 초기화 중 오류 발생:", error);
    toast({
      title: "설정 초기화 실패",
      description: `오류: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      variant: "destructive",
    });
    throw error;
  }
}

// ==================== 커스텀 훅 ====================

/**
 * 설정 API를 사용하기 위한 커스텀 훅
 * @returns 설정 API 함수와 상태
 */
export function useSettingsApi() {
  const { toast } = useToast();

  // 카메라 설정 상태
  const [cameraSettings, setCameraSettings] = useState<CameraSettings | null>(
    null
  );
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isCameraTesting, setIsCameraTesting] = useState(false);
  const [isCameraConnecting, setIsCameraConnecting] = useState(false);

  // 모델 설정 상태
  const [modelSettings, setModelSettings] = useState<ModelSettings | null>(
    null
  );
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelTesting, setIsModelTesting] = useState(false);

  // OCR 설정 상태
  const [ocrSettings, setOcrSettings] = useState<OcrSettings | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isOcrTesting, setIsOcrTesting] = useState(false);

  // 추적 설정 상태
  const [trackingSettings, setTrackingSettings] =
    useState<TrackingSettings | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [isTrackingTesting, setIsTrackingTesting] = useState(false);

  // 시스템 설정 상태
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(
    null
  );
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isSystemLoading, setIsSystemLoading] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  // 전체 설정 상태
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const loadAllSettings = useCallback(async () => {
    try {
      const [camera, model, ocr, tracking, system] = await Promise.all([
        getCameraSettings(toast),
        getModelSettings(toast),
        getOcrSettings(toast),
        getTrackingSettings(toast),
        getSystemSettings(toast),
      ]);

      setCameraSettings(camera);
      setModelSettings(model);
      setOcrSettings(ocr);
      setTrackingSettings(tracking);
      setSystemSettings(system);
    } catch (error) {
      console.error("설정 로드 오류:", error);
      toast({
        title: "설정 로드 실패",
        description: "설정을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // 카메라 설정 로드
  const loadCameraSettings = useCallback(async () => {
    setIsCameraLoading(true);
    try {
      const settings = await getCameraSettings(toast);
      setCameraSettings(settings);
    } catch (error) {
      console.error("카메라 설정 로드 실패:", error);
    } finally {
      setIsCameraLoading(false);
    }
  }, [toast]);

  // 카메라 설정 업데이트
  const handleUpdateCameraSettings = useCallback(
    async (settings: Partial<CameraSettings>) => {
      setIsCameraLoading(true);
      try {
        const updatedSettings = await updateCameraSettings(settings, toast);
        setCameraSettings(updatedSettings);
        return updatedSettings;
      } catch (error) {
        console.error("카메라 설정 업데이트 실패:", error);
        throw error;
      } finally {
        setIsCameraLoading(false);
      }
    },
    [toast]
  );

  // 카메라 연결 테스트
  const handleTestCameraConnection = useCallback(
    async (settings?: Partial<CameraSettings>) => {
      setIsCameraTesting(true);
      try {
        return await testCameraConnection(
          settings || cameraSettings || {},
          toast
        );
      } catch (error) {
        console.error("카메라 연결 테스트 실패:", error);
        throw error;
      } finally {
        setIsCameraTesting(false);
      }
    },
    [cameraSettings, toast]
  );

  // 카메라 연결
  const handleConnectCamera = useCallback(
    async (settings?: Partial<CameraSettings>) => {
      setIsCameraConnecting(true);
      try {
        return await connectCamera(settings || cameraSettings || {}, toast);
      } catch (error) {
        console.error("카메라 연결 실패:", error);
        throw error;
      } finally {
        setIsCameraConnecting(false);
      }
    },
    [cameraSettings, toast]
  );

  // 모델 설정 로드
  const loadModelSettings = useCallback(async () => {
    setIsModelLoading(true);
    try {
      const settings = await getModelSettings(toast);
      setModelSettings(settings);
    } catch (error) {
      console.error("모델 설정 로드 실패:", error);
    } finally {
      setIsModelLoading(false);
    }
  }, [toast]);

  // 모델 설정 업데이트
  const handleUpdateModelSettings = useCallback(
    async (settings: Partial<ModelSettings>) => {
      setIsModelLoading(true);
      try {
        const updatedSettings = await updateModelSettings(settings, toast);
        setModelSettings(updatedSettings);
        return updatedSettings;
      } catch (error) {
        console.error("모델 설정 업데이트 실패:", error);
        throw error;
      } finally {
        setIsModelLoading(false);
      }
    },
    [toast]
  );

  // 모델 로드
  const handleLoadModel = useCallback(
    async (settings?: Partial<ModelSettings>) => {
      setIsModelTesting(true);
      try {
        return await loadModel(settings || modelSettings || {}, toast);
      } catch (error) {
        console.error("모델 로드 실패:", error);
        throw error;
      } finally {
        setIsModelTesting(false);
      }
    },
    [modelSettings, toast]
  );

  // OCR 설정 로드
  const loadOcrSettings = useCallback(async () => {
    setIsOcrLoading(true);
    try {
      const settings = await getOcrSettings(toast);
      setOcrSettings(settings);
    } catch (error) {
      console.error("OCR 설정 로드 실패:", error);
    } finally {
      setIsOcrLoading(false);
    }
  }, [toast]);

  // OCR 설정 업데이트
  const handleUpdateOcrSettings = useCallback(
    async (settings: Partial<OcrSettings>) => {
      setIsOcrLoading(true);
      try {
        const updatedSettings = await updateOcrSettings(settings, toast);
        setOcrSettings(updatedSettings);
        return updatedSettings;
      } catch (error) {
        console.error("OCR 설정 업데이트 실패:", error);
        throw error;
      } finally {
        setIsOcrLoading(false);
      }
    },
    [toast]
  );

  // OCR 테스트
  const handleTestOcr = useCallback(
    async (settings?: Partial<OcrSettings>) => {
      setIsOcrTesting(true);
      try {
        return await testOcr(settings || ocrSettings || {}, toast);
      } catch (error) {
        console.error("OCR 테스트 실패:", error);
        throw error;
      } finally {
        setIsOcrTesting(false);
      }
    },
    [ocrSettings, toast]
  );

  // 추적 설정 로드
  const loadTrackingSettings = useCallback(async () => {
    setIsTrackingLoading(true);
    try {
      const settings = await getTrackingSettings(toast);
      setTrackingSettings(settings);
    } catch (error) {
      console.error("추적 설정 로드 실패:", error);
    } finally {
      setIsTrackingLoading(false);
    }
  }, [toast]);

  // 추적 설정 업데이트
  const handleUpdateTrackingSettings = useCallback(
    async (settings: Partial<TrackingSettings>) => {
      setIsTrackingLoading(true);
      try {
        const updatedSettings = await updateTrackingSettings(settings, toast);
        setTrackingSettings(updatedSettings);
        return updatedSettings;
      } catch (error) {
        console.error("추적 설정 업데이트 실패:", error);
        throw error;
      } finally {
        setIsTrackingLoading(false);
      }
    },
    [toast]
  );

  // 추적 테스트
  const handleTestTracking = useCallback(
    async (settings?: Partial<TrackingSettings>) => {
      setIsTrackingTesting(true);
      try {
        return await testTracking(settings || trackingSettings || {}, toast);
      } catch (error) {
        console.error("추적 테스트 실패:", error);
        throw error;
      } finally {
        setIsTrackingTesting(false);
      }
    },
    [trackingSettings, toast]
  );

  // 시스템 설정 로드
  const loadSystemSettings = useCallback(async () => {
    setIsSystemLoading(true);
    try {
      const settings = await getSystemSettings(toast);
      setSystemSettings(settings);
    } catch (error) {
      console.error("시스템 설정 로드 실패:", error);
    } finally {
      setIsSystemLoading(false);
    }
  }, [toast]);

  // 시스템 정보 로드
  const loadSystemInfo = useCallback(async () => {
    try {
      const info = await getSystemInfo(toast);
      setSystemInfo(info);
      return info;
    } catch (error) {
      console.error("시스템 정보 로드 실패:", error);
      throw error;
    }
  }, [toast]);

  // 시스템 설정 업데이트
  const handleUpdateSystemSettings = useCallback(
    async (settings: Partial<SystemSettings>) => {
      setIsSystemLoading(true);
      try {
        const updatedSettings = await updateSystemSettings(settings, toast);
        setSystemSettings(updatedSettings);
        return updatedSettings;
      } catch (error) {
        console.error("시스템 설정 업데이트 실패:", error);
        throw error;
      } finally {
        setIsSystemLoading(false);
      }
    },
    [toast]
  );

  // 로그 삭제
  const handleClearLogs = useCallback(async () => {
    setIsClearingLogs(true);
    try {
      return await clearLogs(toast);
    } catch (error) {
      console.error("로그 삭제 실패:", error);
      throw error;
    } finally {
      setIsClearingLogs(false);
    }
  }, [toast]);

  // 시스템 백업
  const handleBackupSystem = useCallback(async () => {
    setIsBackingUp(true);
    try {
      return await backupSystem(toast);
    } catch (error) {
      console.error("시스템 백업 실패:", error);
      throw error;
    } finally {
      setIsBackingUp(false);
    }
  }, [toast]);

  // 모든 설정 저장
  const handleSaveAllSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      return await saveAllSettings(toast);
    } catch (error) {
      console.error("설정 저장 실패:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // 설정 초기화
  const handleResetSettings = useCallback(async () => {
    setIsResetting(true);
    try {
      const result = await resetSettings(toast);
      if (result.success) {
        // 모든 설정 다시 로드
        await Promise.all([
          loadCameraSettings(),
          loadModelSettings(),
          loadOcrSettings(),
          loadTrackingSettings(),
          loadSystemSettings(),
          loadSystemInfo(),
        ]);
      }
      return result;
    } catch (error) {
      console.error("설정 초기화 실패:", error);
      throw error;
    } finally {
      setIsResetting(false);
    }
  }, [
    loadCameraSettings,
    loadModelSettings,
    loadOcrSettings,
    loadTrackingSettings,
    loadSystemSettings,
    loadSystemInfo,
    toast,
  ]);

  // 초기 로드
  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  return {
    // 카메라 설정
    cameraSettings,
    isCameraLoading,
    isCameraTesting,
    isCameraConnecting,
    loadCameraSettings,
    updateCameraSettings: handleUpdateCameraSettings,
    testCameraConnection: handleTestCameraConnection,
    connectCamera: handleConnectCamera,

    // 모델 설정
    modelSettings,
    isModelLoading,
    isModelTesting,
    loadModelSettings,
    updateModelSettings: handleUpdateModelSettings,
    loadModel: handleLoadModel,

    // OCR 설정
    ocrSettings,
    isOcrLoading,
    isOcrTesting,
    loadOcrSettings,
    updateOcrSettings: handleUpdateOcrSettings,
    testOcr: handleTestOcr,

    // 추적 설정
    trackingSettings,
    isTrackingLoading,
    isTrackingTesting,
    loadTrackingSettings,
    updateTrackingSettings: handleUpdateTrackingSettings,
    testTracking: handleTestTracking,

    // 시스템 설정
    systemSettings,
    systemInfo,
    isSystemLoading,
    isBackingUp,
    isClearingLogs,
    loadSystemSettings,
    loadSystemInfo,
    updateSystemSettings: handleUpdateSystemSettings,
    clearLogs: handleClearLogs,
    backupSystem: handleBackupSystem,

    // 전체 설정
    isSaving,
    isResetting,
    saveAllSettings: handleSaveAllSettings,
    resetSettings: handleResetSettings,
    loadAllSettings,
  };
}
