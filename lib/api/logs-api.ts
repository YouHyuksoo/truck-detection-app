"use client";

import { useToast } from "@/hooks/use-toast";
import type { OcrLogEntry, OcrLogFilter } from "@/types/logs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010/api";

/**
 * OCR 로그 목록을 가져오는 함수
 *
 * @param filters 필터 조건
 * @returns OCR 로그 목록
 */
export async function fetchOcrLogs(
  filters: OcrLogFilter
): Promise<OcrLogEntry[]> {
  const response = await fetch(`${API_BASE_URL}/logs/ocr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    throw new Error(`HTTP 오류: ${response.status}`);
  }

  return response.json();
}

/**
 * OCR 로그 통계를 가져오는 함수
 *
 * @param dateRange 날짜 범위
 * @returns OCR 로그 통계
 */
export async function fetchOcrLogStats(dateRange: {
  from: Date;
  to: Date;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/logs/stats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dateRange),
  });

  if (!response.ok) {
    throw new Error(`HTTP 오류: ${response.status}`);
  }

  return response.json();
}

/**
 * OCR 로그를 내보내는 함수
 *
 * @param format 내보내기 형식 (csv, excel, json)
 * @param filters 필터 조건
 * @returns 내보내기 URL 또는 성공 여부
 */
export async function exportOcrLogs(
  format: string,
  filters: OcrLogFilter
): Promise<string | boolean> {
  const { toast } = useToast();
  try {
    const response = await fetch(`${API_BASE_URL}/logs/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ format, filters }),
    });
    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }
    const data = await response.json();
    toast({
      title: "내보내기 완료",
      description: `OCR 로그가 ${format.toUpperCase()} 형식으로 내보내졌습니다.`,
    });
    return data.downloadUrl || true;
  } catch (error) {
    toast({
      title: "내보내기 오류",
      description: "OCR 로그 내보내기 중 오류가 발생했습니다.",
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * 새 OCR 로그를 실시간으로 구독하는 함수
 *
 * @param callback 새 로그 수신 시 호출할 콜백 함수
 * @returns 구독 해제 함수
 */
export function subscribeToNewLogs(
  callback: (log: OcrLogEntry) => void
): () => void {
  const ws = new WebSocket(
    `${API_BASE_URL.replace("http", "ws")}/logs/subscribe`
  );
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "newLog") {
        callback(data.log);
      }
    } catch {
      // 무시
    }
  };
  return () => ws.close();
}
