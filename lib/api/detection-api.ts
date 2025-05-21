"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

// API 기본 URL 설정
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010";

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

// 타입 정의 - 감지 통계 및 OCR 결과 관련 타입 제거됨

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
  onConnectionChange?: (
    isConnected: boolean,
    connectionType?: "video" | "meta"
  ) => void;
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

// === WebSocket 연결 상태를 전역적으로 관리하기 위한 싱글톤 객체 ===
class WebSocketManager {
  private static instance: WebSocketManager | null = null;

  private videoWs: WebSocket | null = null;
  private metaWs: WebSocket | null = null;
  private isVideoConnecting: boolean = false;
  private isMetaConnecting: boolean = false;
  private videoReconnectAttempts: number = 0;
  private metaReconnectAttempts: number = 0;
  private videoPingInterval: NodeJS.Timeout | null = null;
  private metaPingInterval: NodeJS.Timeout | null = null;
  private shouldTryReconnect: boolean = true; // 재연결 시도 여부 플래그 추가

  private videoConnectionListeners: Set<(connected: boolean) => void> =
    new Set();
  private metaConnectionListeners: Set<(connected: boolean) => void> =
    new Set();
  private messageListeners: Set<(data: any) => void> = new Set();

  public isVideoConnected: boolean = false;
  public isMetaConnected: boolean = false;

  // 재연결 관련 상수
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private readonly RECONNECT_DELAY = 3000; // ms

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  // 서버 상태에 따라 연결 제어 플래그 설정
  public setReconnectEnabled(enabled: boolean): void {
    this.shouldTryReconnect = enabled;

    // 서버가 중지되었다면 모든 연결 종료
    if (!enabled) {
      this.disconnect();
    }
  }

  // 비디오 WebSocket 연결
  public async connectVideo(toast: ToastFunction): Promise<void> {
    // 서버가 중지된 상태면 연결 시도하지 않음
    if (!this.shouldTryReconnect) {
      console.log("서버가 중지되어 WebSocket 연결을 시도하지 않습니다.");
      return;
    }

    if (this.isVideoConnecting) {
      console.log("비디오 WebSocket 연결 시도 중입니다.");
      return;
    }

    if (this.videoWs?.readyState === WebSocket.OPEN) {
      console.log("비디오 WebSocket이 이미 연결되어 있습니다.");
      return;
    }

    this.isVideoConnecting = true;
    this.videoReconnectAttempts = 0;

    try {
      this.videoWs = new WebSocket(WS_VIDEO_URL);

      this.videoWs.onopen = () => {
        console.log("비디오 WebSocket 연결됨");
        this.videoReconnectAttempts = 0;
        this.isVideoConnecting = false;
        this.isVideoConnected = true;

        // 모든 리스너에게 알림
        this.videoConnectionListeners.forEach((listener) => listener(true));

        if (this.videoWs?.readyState === WebSocket.OPEN) {
          this.videoWs.send("ping");
        }
      };

      this.videoWs.onerror = (error) => {
        console.error("비디오 WebSocket 오류:", error);
        this.isVideoConnecting = false;

        // 서버가 중지된 상태가 아닐 때만 오류 메시지 표시
        if (this.shouldTryReconnect) {
          toast({
            title: "연결 오류",
            description: "비디오 스트림 연결에 실패했습니다.",
            variant: "destructive",
          });
        }
      };

      this.videoWs.onclose = () => {
        console.log("비디오 WebSocket 연결 종료");
        this.isVideoConnecting = false;
        this.isVideoConnected = false;

        // 모든 리스너에게 알림
        this.videoConnectionListeners.forEach((listener) => listener(false));

        // 서버가 실행 중이고 최대 재시도 횟수에 도달하지 않았을 때만 재연결 시도
        if (
          this.shouldTryReconnect &&
          this.videoReconnectAttempts < this.MAX_RECONNECT_ATTEMPTS
        ) {
          setTimeout(() => {
            this.videoReconnectAttempts++;
            this.connectVideo(toast);
          }, this.RECONNECT_DELAY);
        } else if (this.shouldTryReconnect) {
          toast({
            title: "연결 종료",
            description: "비디오 스트림 연결이 종료되었습니다.",
            variant: "destructive",
          });
        }
      };

      this.videoWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // 모든 메시지 리스너에게 알림
          this.messageListeners.forEach((listener) => listener(data));
        } catch (e) {
          // 바이너리 데이터인 경우 프레임 처리
          const blob = new Blob([event.data], { type: "image/jpeg" });
          // 프레임 업데이트 리스너에게 알림
          this.messageListeners.forEach((listener) =>
            listener({
              type: "frame",
              frame: blob,
            })
          );
        }
      };

      // ping 간격 설정
      if (this.videoPingInterval) clearInterval(this.videoPingInterval);
      this.videoPingInterval = setInterval(() => {
        if (this.videoWs?.readyState === WebSocket.OPEN) {
          this.videoWs.send("ping");
        }
      }, 30000);
    } catch (error) {
      console.error("비디오 WebSocket 연결 오류:", error);
      this.isVideoConnecting = false;
      throw error;
    }
  }

  // 메타 WebSocket 연결
  public async connectMeta(toast: ToastFunction): Promise<void> {
    // 서버가 중지된 상태면 연결 시도하지 않음
    if (!this.shouldTryReconnect) {
      console.log(
        "서버가 중지되어 메타데이터 WebSocket 연결을 시도하지 않습니다."
      );
      return;
    }

    if (this.isMetaConnecting) {
      console.log("메타 WebSocket 연결 시도 중입니다.");
      return;
    }

    if (this.metaWs?.readyState === WebSocket.OPEN) {
      console.log("메타 WebSocket이 이미 연결되어 있습니다.");
      return;
    }

    this.isMetaConnecting = true;
    this.metaReconnectAttempts = 0;

    try {
      this.metaWs = new WebSocket(WS_META_URL);

      this.metaWs.onopen = () => {
        console.log("메타 WebSocket 연결됨");
        this.metaReconnectAttempts = 0;
        this.isMetaConnecting = false;
        this.isMetaConnected = true;

        // 모든 리스너에게 알림
        this.metaConnectionListeners.forEach((listener) => listener(true));

        if (this.metaWs?.readyState === WebSocket.OPEN) {
          this.metaWs.send("ping");
        }
      };

      this.metaWs.onerror = (error) => {
        console.error("메타 WebSocket 오류:", error);
        this.isMetaConnecting = false;

        // 서버가 중지된 상태가 아닐 때만 오류 메시지 표시
        if (this.shouldTryReconnect) {
          toast({
            title: "연결 오류",
            description: "메타데이터 스트림 연결에 실패했습니다.",
            variant: "destructive",
          });
        }
      };

      this.metaWs.onclose = () => {
        console.log("메타 WebSocket 연결 종료");
        this.isMetaConnecting = false;
        this.isMetaConnected = false;

        // 모든 리스너에게 알림
        this.metaConnectionListeners.forEach((listener) => listener(false));

        // 서버가 실행 중이고 최대 재시도 횟수에 도달하지 않았을 때만 재연결 시도
        if (
          this.shouldTryReconnect &&
          this.metaReconnectAttempts < this.MAX_RECONNECT_ATTEMPTS
        ) {
          setTimeout(() => {
            this.metaReconnectAttempts++;
            this.connectMeta(toast);
          }, this.RECONNECT_DELAY);
        } else if (this.shouldTryReconnect) {
          toast({
            title: "연결 종료",
            description: "메타데이터 스트림 연결이 종료되었습니다.",
            variant: "destructive",
          });
        }
      };

      this.metaWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // 모든 메시지 리스너에게 알림
          this.messageListeners.forEach((listener) => listener(data));
        } catch (e) {
          console.error("메타데이터 메시지 파싱 오류:", e);
        }
      };

      // ping 간격 설정
      if (this.metaPingInterval) clearInterval(this.metaPingInterval);
      this.metaPingInterval = setInterval(() => {
        if (this.metaWs?.readyState === WebSocket.OPEN) {
          this.metaWs.send("ping");
        }
      }, 30000);
    } catch (error) {
      console.error("메타 WebSocket 연결 오류:", error);
      this.isMetaConnecting = false;
      throw error;
    }
  }

  // 연결 리스너 등록
  public addVideoConnectionListener(
    listener: (connected: boolean) => void
  ): () => void {
    this.videoConnectionListeners.add(listener);
    // 현재 상태 즉시 알림
    listener(this.isVideoConnected);

    // 정리 함수 반환
    return () => {
      this.videoConnectionListeners.delete(listener);
    };
  }

  public addMetaConnectionListener(
    listener: (connected: boolean) => void
  ): () => void {
    this.metaConnectionListeners.add(listener);
    // 현재 상태 즉시 알림
    listener(this.isMetaConnected);

    // 정리 함수 반환
    return () => {
      this.metaConnectionListeners.delete(listener);
    };
  }

  // 메시지 리스너 등록
  public addMessageListener(listener: (data: any) => void): () => void {
    this.messageListeners.add(listener);

    // 정리 함수 반환
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  // 모든 연결 종료
  public disconnect(): void {
    // 타이머 정리
    if (this.videoPingInterval) {
      clearInterval(this.videoPingInterval);
      this.videoPingInterval = null;
    }

    if (this.metaPingInterval) {
      clearInterval(this.metaPingInterval);
      this.metaPingInterval = null;
    }

    // 연결 종료
    if (this.videoWs) {
      this.videoWs.close();
      this.videoWs = null;
    }

    if (this.metaWs) {
      this.metaWs.close();
      this.metaWs = null;
    }

    this.isVideoConnected = false;
    this.isMetaConnected = false;
    this.isVideoConnecting = false;
    this.isMetaConnecting = false;

    // 모든 리스너에게 알림
    this.videoConnectionListeners.forEach((listener) => listener(false));
    this.metaConnectionListeners.forEach((listener) => listener(false));
  }
}

// 글로벌 WebSocket 매니저 인스턴스
const wsManager =
  typeof window !== "undefined" ? WebSocketManager.getInstance() : null;

// 웹 페이지 로드 시 자동 연결 시도 (클라이언트 사이드에서만)
if (typeof window !== "undefined") {
  window.addEventListener("load", async () => {
    // 서버 상태 확인
    try {
      const serverRunning = await checkVideoServerStatus();

      // 서버가 실행 중일 때만 WebSocket 연결 시도
      if (serverRunning) {
        // 페이지 로드 시 토스트 참조가 없으므로 더미 함수 사용
        const dummyToast: ToastFunction = () => {};

        // 재연결 활성화
        wsManager?.setReconnectEnabled(true);
        wsManager?.connectVideo(dummyToast);
        wsManager?.connectMeta(dummyToast);
      } else {
        console.log(
          "서버가 실행 중이지 않아 WebSocket 연결을 시도하지 않습니다."
        );
        wsManager?.setReconnectEnabled(false);
      }
    } catch (error) {
      console.error("서버 상태 확인 오류:", error);
    }
  });
}

/**
 * 비디오 서버 시작 함수
 *
 * @param toast Toast 함수
 * @returns 성공 여부
 */
export async function startVideoServer(toast: ToastFunction): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/video-server/start`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const data = await response.json();

    toast({
      title: "비디오 서버 시작",
      description: "비디오 서버가 시작되었습니다. 잠시 후 연결됩니다.",
    });

    return data.success;
  } catch (error) {
    console.error("비디오 서버 시작 오류:", error);

    toast({
      title: "서버 오류",
      description: "비디오 서버 시작 중 오류가 발생했습니다.",
      variant: "destructive",
    });

    return false;
  }
}

/**
 * 비디오 서버 종료 함수
 *
 * @param toast Toast 함수
 * @returns 성공 여부
 */
export async function stopVideoServer(toast: ToastFunction): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/video-server/stop`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const data = await response.json();

    toast({
      title: "비디오 서버 종료",
      description: "비디오 서버가 종료되었습니다.",
    });

    return data.success;
  } catch (error) {
    console.error("비디오 서버 종료 오류:", error);

    toast({
      title: "서버 오류",
      description: "비디오 서버 종료 중 오류가 발생했습니다.",
      variant: "destructive",
    });

    return false;
  }
}

/**
 * 비디오 서버 상태 확인 함수 (캐싱 기능 추가)
 *
 * @returns 서버 실행 상태
 */
// 캐싱을 위한 변수
let lastServerStatusCheck = 0;
let cachedServerStatus = false;
const SERVER_STATUS_CACHE_TTL = 10000; // 10초 동안 캐시 유효

export async function checkVideoServerStatus(): Promise<boolean> {
  const now = Date.now();

  // 캐시가 유효한 경우 캐시된 결과 반환
  if (now - lastServerStatusCheck < SERVER_STATUS_CACHE_TTL) {
    console.log(
      "서버 상태 캐시 사용:",
      cachedServerStatus ? "실행 중" : "중지됨"
    );
    return cachedServerStatus;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/video-server/status`);

    if (!response.ok) {
      cachedServerStatus = false;
      lastServerStatusCheck = now;
      return false;
    }

    const data = await response.json();
    cachedServerStatus = data.running;
    lastServerStatusCheck = now;
    return data.running;
  } catch (error) {
    console.error("비디오 서버 상태 확인 오류:", error);
    cachedServerStatus = false;
    lastServerStatusCheck = now;
    return false;
  }
}

/**
 * 통합 감지 API 훅
 *
 * 이 훅은 모든 API 기능을 하나의 인터페이스로 제공합니다.
 * 컴포넌트에서 이 훅을 사용하면 모든 API 기능에 접근할 수 있습니다.
 */
export function useDetectionApi() {
  const [isVideoConnected, setIsVideoConnected] = useState(false);
  const [isMetaConnected, setIsMetaConnected] = useState(false);
  const [videoServerRunning, setVideoServerRunning] = useState(false);
  // 감지 통계 및 OCR 결과 상태 제거
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

  // 웹소켓 매니저와 연결 상태 동기화
  useEffect(() => {
    if (typeof window === "undefined" || !wsManager) return;

    // 비디오 연결 상태 리스너
    const videoCleanup = wsManager.addVideoConnectionListener((connected) => {
      setIsVideoConnected(connected);
    });

    // 메타 연결 상태 리스너
    const metaCleanup = wsManager.addMetaConnectionListener((connected) => {
      setIsMetaConnected(connected);
    });

    // 메시지 리스너
    const messageCleanup = wsManager.addMessageListener((data) => {
      if (data.type === "frame") {
        setFrame(data.frame);
      } else if (data.type === "systemStatus") {
        setSystemStatus(data.status);
      } else if (data.type === "detections") {
        setDetections(data.detections);
      }
      // 감지 통계 및 OCR 결과 처리 코드 제거
    });

    // 연결 시도 (이미 연결 중이거나 연결된 경우 아무 일도 일어나지 않음)
    wsManager.connectVideo(toast);
    wsManager.connectMeta(toast);

    // 컴포넌트 언마운트 시 리스너만 정리 (연결은 유지)
    return () => {
      videoCleanup();
      metaCleanup();
      messageCleanup();
    };
  }, [toast]);

  // 컴포넌트 마운트 시 초기 데이터 로드 및 서버 상태 확인
  useEffect(() => {
    // 초기 데이터 로드
    const loadInitialData = async () => {
      try {
        // 비디오 서버 상태 확인
        const serverRunning = await checkVideoServerStatus();
        setVideoServerRunning(serverRunning);

        // 서버 상태에 따라 재연결 시도 여부 설정
        wsManager?.setReconnectEnabled(serverRunning);

        // 초기 데이터 로드는 WebSocket 연결 후에 수행
        if (isVideoConnected) {
          // 감지 통계 및 OCR 결과 로드 코드 제거

          const status = await fetchSystemStatus();
          setSystemStatus(status);
        }
      } catch (error) {
        console.error("초기 데이터 로드 오류:", error);
      }
    };
    loadInitialData();
  }, [isVideoConnected]);

  // 이전 서버 상태를 저장하기 위한 레퍼런스 (컴포넌트 최상위 레벨에 선언)
  const lastServerStatusRef = useRef(videoServerRunning);
  // 사용자가 의도적으로 서버를 종료했는지 추적하기 위한 플래그
  const userStoppedServerRef = useRef(false);

  // 주기적으로 서버 상태 확인
  useEffect(() => {
    // 현재 상태로 ref 업데이트
    lastServerStatusRef.current = videoServerRunning;

    // 서버 상태를 주기적으로 확인하는 함수
    const checkServerStatus = async () => {
      try {
        // 사용자가 의도적으로 서버를 종료한 경우 상태 확인 건너뜀
        if (userStoppedServerRef.current) {
          return;
        }

        const serverRunning = await checkVideoServerStatus();

        // 상태가 변경된 경우에만 로깅 및 처리
        if (lastServerStatusRef.current !== serverRunning) {
          console.log(
            "비디오 서버 상태 변경:",
            serverRunning ? "실행 중" : "중지됨"
          );

          // 서버 상태에 따라 재연결 시도 여부 설정
          wsManager?.setReconnectEnabled(serverRunning);

          // 상태 업데이트
          setVideoServerRunning(serverRunning);
          lastServerStatusRef.current = serverRunning;

          // 서버가 다시 시작된 경우 WebSocket 연결 다시 시도
          if (serverRunning && !isVideoConnected) {
            wsManager?.connectVideo(toast);
            wsManager?.connectMeta(toast);
          }
        }
      } catch (error) {
        console.error("서버 상태 확인 오류:", error);
      }
    };

    // 초기 상태 확인
    checkServerStatus();

    // 30초마다 상태 확인
    const intervalId = setInterval(checkServerStatus, 30000);

    // 정리 함수
    return () => {
      clearInterval(intervalId);
    };
  }, [videoServerRunning, isVideoConnected, isMetaConnected, toast]);

  // 비디오 서버 시작
  const handleStartVideoServer = async () => {
    const success = await startVideoServer(toast);
    if (success) {
      // 사용자가 서버를 시작했으므로 플래그 해제
      userStoppedServerRef.current = false;
      setVideoServerRunning(true);
      // 서버 시작 후 WebSocket 연결 시도 활성화
      wsManager?.setReconnectEnabled(true);
      // 연결 즉시 시도
      wsManager?.connectVideo(toast);
      wsManager?.connectMeta(toast);
    }
  };

  // 비디오 서버 종료
  const handleStopVideoServer = async () => {
    const success = await stopVideoServer(toast);
    if (success) {
      // 사용자가 의도적으로 서버를 종료했음을 표시
      userStoppedServerRef.current = true;
      // 서버 종료 전에 WebSocket 연결 시도 비활성화
      wsManager?.setReconnectEnabled(false);
      setVideoServerRunning(false);
    }
  };

  // 모든 API 함수를 반환
  return {
    // 상태
    isVideoConnected,
    isMetaConnected,
    videoServerRunning,
    // 감지 통계 및 OCR 결과 관련 속성 제거
    systemStatus,
    frame,
    detections,

    // API 함수 - toast를 매개변수로 전달
    toggleDetection: (enabled: boolean) => toggleDetection(enabled, toast),
    toggleOcr: (enabled: boolean) => toggleOcr(enabled, toast),
    setConfidenceThreshold: (threshold: number) =>
      setConfidenceThreshold(threshold, toast),
    // 감지 통계 및 OCR 결과 관련 함수 제거
    fetchSystemStatus,
    startVideoServer: handleStartVideoServer,
    stopVideoServer: handleStopVideoServer,
  };
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
    const response = await fetch(`${API_BASE_URL}/api/detection/settings`, {
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
    const response = await fetch(`${API_BASE_URL}/api/ocr/settings`, {
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
 * @param toast 선택적 Toast 함수
 * @returns 성공 여부
 */
export async function setConfidenceThreshold(
  threshold: number,
  toast?: ToastFunction
): Promise<boolean> {
  try {
    const normalizedThreshold = threshold / 100; // 백엔드는 0-1 범위 사용

    console.log(
      `신뢰도 임계값 설정 요청: ${threshold}% (${normalizedThreshold})`
    );

    const response = await fetch(`${API_BASE_URL}/api/detection/threshold`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ threshold: normalizedThreshold }),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const data = await response.json();

    // 토스트 알림 제공 (선택적)
    if (toast) {
      toast({
        title: "신뢰도 임계값 설정",
        description: `감지 신뢰도 임계값이 ${threshold}%로 설정되었습니다.`,
      });
    }

    return data.success;
  } catch (error) {
    console.error("감지 신뢰도 임계값 설정 오류:", error);

    // 토스트 알림 제공 (선택적)
    if (toast) {
      toast({
        title: "설정 오류",
        description: "감지 신뢰도 임계값 설정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }

    return false;
  }
}

/**
 * 시스템 상태 조회 함수
 *
 * @returns 시스템 상태 정보
 */
export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/detection/system-status`);

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
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
