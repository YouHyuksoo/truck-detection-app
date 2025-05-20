"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// API 기본 URL 설정
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010/api";

// WebSocket URL 상수
const WS_VIDEO_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== "undefined"
    ? (window.location.protocol === "https:" ? "wss://" : "ws://") +
      "localhost:8000/ws/video"
    : "");
const WS_META_URL =
  process.env.NEXT_PUBLIC_WS_META_URL ||
  (typeof window !== "undefined"
    ? (window.location.protocol === "https:" ? "wss://" : "ws://") +
      "localhost:8000/ws/meta"
    : "");

// 타입 정의
export interface DetectionStats {
  totalDetections: number;
  successfulOcr: number;
  averageConfidence: number;
  processingFps: number;
  lastDetection: string;
}

export interface OcrResult {
  id: number;
  timestamp: string;
  number: string;
  confidence: number;
  imageUrl: string;
}

export interface SystemStatus {
  camera: "normal" | "warning" | "error";
  yoloModel: "normal" | "warning" | "error";
  ocrEngine: "normal" | "warning" | "error";
  plcConnection: "normal" | "warning" | "error";
  systemLoad: "normal" | "warning" | "error";
  systemLoadPercentage?: number;
}

export interface WebSocketConnection {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  onConnectionChange?: (isConnected: boolean) => void;
}

export interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string;
  number?: string;
}

/**
 * Toast 메시지를 표시하는 함수 타입
 */
export interface ToastFunction {
  (props: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }): void;
}

/**
 * 통합 감지 API 훅
 *
 * 이 훅은 모든 API 기능을 하나의 인터페이스로 제공합니다.
 * 컴포넌트에서 이 훅을 사용하면 모든 API 기능에 접근할 수 있습니다.
 */
export function useDetectionApi() {
  const [isConnected, setIsConnected] = useState(false);
  const [detectionStats, setDetectionStats] = useState<DetectionStats>({
    totalDetections: 0,
    successfulOcr: 0,
    averageConfidence: 0,
    processingFps: 0,
    // ⚠️ 수정: 고정된 타임스탬프 사용
    lastDetection: "아직 감지되지 않음",
  });
  const [ocrResults, setOcrResults] = useState<OcrResult[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    camera: "normal",
    yoloModel: "normal",
    ocrEngine: "normal",
    plcConnection: "normal",
    systemLoad: "normal",
  });
  const [frame, setFrame] = useState<Blob | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const { toast } = useToast();

  // WebSocket 연결 객체
  const wsConnection = useWebSocketConnection(
    // 연결 상태 변경 콜백
    (connected) => {
      setIsConnected(connected);
    },
    // 메시지 수신 콜백
    (data) => {
      // 메시지 타입에 따라 처리
      if (data.type === "stats") {
        setDetectionStats(data.stats);
      } else if (data.type === "ocrResult") {
        setOcrResults((prev) => [data.result, ...prev].slice(0, 5));
      } else if (data.type === "systemStatus") {
        setSystemStatus(data.status);
      }
    }
  );

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 초기 데이터 로드
    const loadInitialData = async () => {
      try {
        const stats = await fetchDetectionStats();
        setDetectionStats(stats);

        const results = await fetchOcrResults();
        setOcrResults(results);

        const status = await fetchSystemStatus();
        setSystemStatus(status);
      } catch (error) {
        console.error("초기 데이터 로드 오류:", error);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let VIDEO_WS: WebSocket | null = null;
    let META_WS: WebSocket | null = null;
    let videoPingInterval: NodeJS.Timeout | null = null;
    let metaPingInterval: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;

    const connectWebSockets = async () => {
      try {
        // 비디오 WebSocket 연결
        if (VIDEO_WS?.readyState === WebSocket.CONNECTING) {
          console.log("비디오 WebSocket이 이미 연결 중입니다.");
          return;
        }

        VIDEO_WS = new WebSocket(WS_VIDEO_URL);
        VIDEO_WS.binaryType = "arraybuffer";

        // 연결 완료 대기
        await new Promise<void>((resolve, reject) => {
          if (!VIDEO_WS) return;

          const timeout = setTimeout(() => {
            reject(new Error("비디오 WebSocket 연결 시간 초과"));
          }, 5000);

          VIDEO_WS.onopen = () => {
            clearTimeout(timeout);
            console.log("Video WebSocket 연결됨");
            reconnectAttempts = 0;
            videoPingInterval = setInterval(() => {
              if (VIDEO_WS?.readyState === WebSocket.OPEN) {
                VIDEO_WS.send("ping");
              }
            }, 5000);
            resolve();
          };

          VIDEO_WS.onerror = (error) => {
            clearTimeout(timeout);
            console.error("Video WebSocket 오류:", error);
            toast({
              title: "비디오 스트림 오류",
              description: "비디오 스트림 연결 중 오류가 발생했습니다.",
              variant: "destructive",
            });
            reject(error);
          };
        });

        VIDEO_WS.onmessage = (e) => {
          if (e.data instanceof Blob) {
            setFrame(new Blob([e.data], { type: "image/jpeg" }));
          }
        };

        VIDEO_WS.onclose = () => {
          if (videoPingInterval) {
            clearInterval(videoPingInterval);
            videoPingInterval = null;
          }
          if (reconnectAttempts < maxReconnectAttempts) {
            setTimeout(connectWebSockets, reconnectDelay);
            reconnectAttempts++;
          }
        };

        // 메타 WebSocket 연결
        if (META_WS?.readyState === WebSocket.CONNECTING) {
          console.log("메타 WebSocket이 이미 연결 중입니다.");
          return;
        }

        META_WS = new WebSocket(WS_META_URL);

        // 연결 완료 대기
        await new Promise<void>((resolve, reject) => {
          if (!META_WS) return;

          const timeout = setTimeout(() => {
            reject(new Error("메타 WebSocket 연결 시간 초과"));
          }, 5000);

          META_WS.onopen = () => {
            clearTimeout(timeout);
            console.log("Meta WebSocket 연결됨");
            metaPingInterval = setInterval(() => {
              if (META_WS?.readyState === WebSocket.OPEN) {
                META_WS.send("ping");
              }
            }, 5000);
            resolve();
          };

          META_WS.onerror = (error) => {
            clearTimeout(timeout);
            console.error("Meta WebSocket 오류:", error);
            toast({
              title: "메타데이터 스트림 오류",
              description: "메타데이터 스트림 연결 중 오류가 발생했습니다.",
              variant: "destructive",
            });
            reject(error);
          };
        });

        META_WS.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.detections) {
              setDetections(data.detections);
            }
          } catch (error) {
            console.error("메타 데이터 파싱 오류:", error);
          }
        };

        META_WS.onclose = () => {
          if (metaPingInterval) {
            clearInterval(metaPingInterval);
            metaPingInterval = null;
          }
          if (reconnectAttempts < maxReconnectAttempts) {
            setTimeout(connectWebSockets, reconnectDelay);
            reconnectAttempts++;
          }
        };
      } catch (error) {
        console.error("WebSocket 연결 오류:", error);
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(connectWebSockets, reconnectDelay);
          reconnectAttempts++;
        }
      }
    };

    connectWebSockets();

    // Cleanup 함수
    return () => {
      if (videoPingInterval) {
        clearInterval(videoPingInterval);
        videoPingInterval = null;
      }
      if (metaPingInterval) {
        clearInterval(metaPingInterval);
        metaPingInterval = null;
      }
      if (VIDEO_WS) {
        VIDEO_WS.close();
        VIDEO_WS = null;
      }
      if (META_WS) {
        META_WS.close();
        META_WS = null;
      }
    };
  }, []);

  // 모든 API 함수를 반환
  return {
    // 상태
    isConnected,
    detectionStats,
    ocrResults,
    systemStatus,
    frame,
    detections,

    // WebSocket 연결 관리
    connect: wsConnection.connect,
    disconnect: wsConnection.disconnect,

    // API 함수 - toast를 매개변수로 전달
    controlVideoStream: (isPlaying: boolean) =>
      controlVideoStream(isPlaying, toast),
    toggleDetection: (enabled: boolean) => toggleDetection(enabled, toast),
    toggleOcr: (enabled: boolean) => toggleOcr(enabled, toast),
    setConfidenceThreshold,
    fetchDetectionStats,
    fetchOcrResults,
    fetchSystemStatus,
    captureSnapshot: () => captureSnapshot(toast),
    refreshVideoStream: () => refreshVideoStream(toast),
  };
}

/**
 * WebSocket 연결을 관리하는 함수
 */
export function useWebSocketConnection(
  onConnectionChange?: (isConnected: boolean) => void,
  onMessage?: (data: any) => void
): WebSocketConnection {
  let ws: WebSocket | null = null;
  let isConnected = false;
  const { toast } = useToast();

  // WebSocket 연결 함수
  const connect = async (): Promise<void> => {
    try {
      ws = new WebSocket(WS_VIDEO_URL);

      ws.onopen = () => {
        isConnected = true;
        onConnectionChange?.(true);
        toast({
          title: "서버에 연결되었습니다",
          description: "실시간 영상 스트림을 수신 중입니다.",
        });
      };
      ws.onclose = () => {
        isConnected = false;
        onConnectionChange?.(false);
      };
      ws.onerror = (error) => {
        console.error("WebSocket 오류:", error);
        isConnected = false;
        onConnectionChange?.(false);
        toast({
          title: "연결 오류",
          description: "서버 연결 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (e) {
          console.error("메시지 파싱 오류:", e);
        }
      };
    } catch (error) {
      console.error("WebSocket 연결 실패:", error);
      toast({
        title: "연결 실패",
        description:
          "서버에 연결할 수 없습니다. 네트워크 상태와 서버 주소를 확인하세요.",
        variant: "destructive",
      });
    }
  };

  // WebSocket 연결 종료 함수
  const disconnect = (): void => {
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  return { isConnected, connect, disconnect, onConnectionChange };
}

/**
 * 비디오 스트림 제어 함수
 *
 * @param isPlaying 재생 상태
 * @param toast Toast 함수
 * @returns 성공 여부
 */
export async function controlVideoStream(
  isPlaying: boolean,
  toast: ToastFunction
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/video/control`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: isPlaying ? "pause" : "play" }),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const data = await response.json();

    toast({
      title: isPlaying ? "영상 일시정지" : "영상 재생",
      description: isPlaying
        ? "영상 스트림이 일시정지되었습니다."
        : "영상 스트림이 재생됩니다.",
    });

    return data.success;
  } catch (error) {
    console.error("비디오 스트림 제어 오류:", error);

    toast({
      title: "제어 오류",
      description: "비디오 스트림 제어 중 오류가 발생했습니다.",
      variant: "destructive",
    });

    return false;
  }
}

/**
 * 객체 감지 설정 변경 함수
 *
 * @param enabled 활성화 여부
 * @param toast Toast 함수
 * @returns 성공 여부
 */
export async function toggleDetection(
  enabled: boolean,
  toast: ToastFunction
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/detection/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled }),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const data = await response.json();

    toast({
      title: enabled ? "객체 감지 활성화" : "객체 감지 비활성화",
      description: enabled
        ? "트럭 객체 감지가 활성화되었습니다."
        : "트럭 객체 감지가 비활성화되었습니다.",
    });

    return data.success;
  } catch (error) {
    console.error("객체 감지 설정 변경 오류:", error);

    toast({
      title: "설정 오류",
      description: "객체 감지 설정 변경 중 오류가 발생했습니다.",
      variant: "destructive",
    });

    return false;
  }
}

/**
 * OCR 설정 변경 함수
 *
 * @param enabled 활성화 여부
 * @param toast Toast 함수
 * @returns 성공 여부
 */
export async function toggleOcr(
  enabled: boolean,
  toast: ToastFunction
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/ocr/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled }),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const data = await response.json();

    toast({
      title: enabled ? "OCR 활성화" : "OCR 비활성화",
      description: enabled
        ? "숫자 인식(OCR)이 활성화되었습니다."
        : "숫자 인식(OCR)이 비활성화되었습니다.",
    });

    return data.success;
  } catch (error) {
    console.error("OCR 설정 변경 오류:", error);

    toast({
      title: "설정 오류",
      description: "OCR 설정 변경 중 오류가 발생했습니다.",
      variant: "destructive",
    });

    return false;
  }
}

/**
 * 감지 신뢰도 임계값 설정 함수
 *
 * @param threshold 임계값 (0-100)
 * @returns 성공 여부
 */
export async function setConfidenceThreshold(
  threshold: number
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/detection/threshold`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ threshold: threshold / 100 }), // 백엔드는 0-1 범위 사용
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("감지 신뢰도 임계값 설정 오류:", error);
    return false;
  }
}

/**
 * 감지 통계 데이터 조회 함수
 */
export async function fetchDetectionStats(): Promise<DetectionStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/detection/stats`, {
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
    console.error("감지 통계 데이터 조회 오류:", error);
    return {
      totalDetections: 0,
      successfulOcr: 0,
      averageConfidence: 0,
      processingFps: 0,
      lastDetection: "데이터 없음",
    };
  }
}

/**
 * OCR 결과 목록 조회 함수
 *
 * @param limit 조회할 결과 수
 * @returns OCR 결과 목록
 */
export async function fetchOcrResults(limit = 5): Promise<OcrResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/ocr/results?limit=${limit}`, {
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
    console.error("OCR 결과 목록 조회 오류:", error);
    return [];
  }
}

/**
 * 시스템 상태 조회 함수
 *
 * @returns 시스템 상태 정보
 */
export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/system/status`);

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("시스템 상태 조회 오류:", error);

    // 오류 발생 시 기본값 반환
    return {
      camera: "error",
      yoloModel: "error",
      ocrEngine: "error",
      plcConnection: "error",
      systemLoad: "error",
    };
  }
}

/**
 * 스냅샷 캡처 함수
 *
 * @param toast Toast 함수
 * @returns 캡처된 이미지 URL
 */
export async function captureSnapshot(
  toast: ToastFunction
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/video/snapshot`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const data = await response.json();

    toast({
      title: "스냅샷 캡처 완료",
      description: "현재 화면이 캡처되었습니다.",
    });

    return data.imageUrl;
  } catch (error) {
    console.error("스냅샷 캡처 오류:", error);

    toast({
      title: "캡처 오류",
      description: "스냅샷 캡처 중 오류가 발생했습니다.",
      variant: "destructive",
    });

    return null;
  }
}

/**
 * 비디오 스트림 새로고침 함수
 *
 * @param toast Toast 함수
 * @returns 성공 여부
 */
export async function refreshVideoStream(
  toast: ToastFunction
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/video/refresh`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const data = await response.json();

    toast({
      title: "스트림 새로고침",
      description: "비디오 스트림이 새로고침되었습니다.",
    });

    return data.success;
  } catch (error) {
    console.error("비디오 스트림 새로고침 오류:", error);

    toast({
      title: "새로고침 오류",
      description: "비디오 스트림 새로고침 중 오류가 발생했습니다.",
      variant: "destructive",
    });

    return false;
  }
}
