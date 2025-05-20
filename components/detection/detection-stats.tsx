"use client";
import { useEffect, useState } from "react";
import { Truck, FileText, Percent, Clock, Activity } from "lucide-react";
import type { DetectionStats as ApiDetectionStats } from "@/lib/api/detection-api";

// DetectionStats 컴포넌트 인터페이스
interface DetectionStatsProps {
  stats: ApiDetectionStats;
}

export default function DetectionStats({ stats }: DetectionStatsProps) {
  // 클라이언트 사이드에서만 렌더링할 포맷된 시간 상태
  const [formattedTime, setFormattedTime] = useState<string>("로딩 중...");

  // 클라이언트 사이드에서만 날짜 포맷팅 수행
  useEffect(() => {
    try {
      const date = new Date(stats.lastDetection);
      const formatted = date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setFormattedTime(formatted);
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      setFormattedTime("날짜 형식 오류");
    }
  }, [stats.lastDetection]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col p-2 bg-muted/50 rounded-md">
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Truck className="h-3.5 w-3.5 mr-1" />
          <span>총 감지</span>
        </div>
        <span className="text-xl font-bold">{stats.totalDetections}</span>
      </div>

      <div className="flex flex-col p-2 bg-muted/50 rounded-md">
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <FileText className="h-3.5 w-3.5 mr-1" />
          <span>OCR 성공</span>
        </div>
        <span className="text-xl font-bold">{stats.successfulOcr}</span>
      </div>

      <div className="flex flex-col p-2 bg-muted/50 rounded-md">
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Percent className="h-3.5 w-3.5 mr-1" />
          <span>평균 신뢰도</span>
        </div>
        <span className="text-xl font-bold">{stats.averageConfidence}%</span>
      </div>

      <div className="flex flex-col p-2 bg-muted/50 rounded-md">
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Activity className="h-3.5 w-3.5 mr-1" />
          <span>처리 FPS</span>
        </div>
        <span className="text-xl font-bold">{stats.processingFps}</span>
      </div>

      <div className="col-span-2 flex flex-col p-2 bg-muted/50 rounded-md">
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>마지막 감지</span>
        </div>
        <span className="text-lg font-medium">{formattedTime}</span>
      </div>
    </div>
  );
}
