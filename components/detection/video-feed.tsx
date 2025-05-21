"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { useDetectionApi, Detection } from "@/lib/api/detection-api";

interface VideoFeedProps {
  showDetections: boolean;
  showOcr: boolean;
  confidenceThreshold: number;
  isPlaying: boolean; // 속성은 남겨두지만 내부적으로 사용하지 않음
  children?: ReactNode; // 버튼 등을 렌더링하기 위한 children prop 추가
}

export default function VideoFeed({
  showDetections,
  showOcr,
  confidenceThreshold,
  children,
}: VideoFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { frame, detections, isVideoConnected, isMetaConnected } =
    useDetectionApi();

  // 디버깅을 위한 상태 추가
  const [debug, setDebug] = useState({
    hasDetections: false,
    detectionsCount: 0,
    isMetaConnected: false,
    lastUpdated: new Date().toISOString(),
  });

  // 디버깅 정보 업데이트
  useEffect(() => {
    console.log("메타데이터 연결 상태:", isMetaConnected);
    console.log("감지된 데이터:", detections);

    setDebug({
      hasDetections: detections && detections.length > 0,
      detectionsCount: detections ? detections.length : 0,
      isMetaConnected,
      lastUpdated: new Date().toISOString(),
    });
  }, [detections, isMetaConnected]);

  useEffect(() => {
    if (!frame || !isVideoConnected) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // 비동기로 Blob → ImageBitmap 으로 변환
    createImageBitmap(frame).then((img) => {
      // 캔버스 크기 맞추기
      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      // 영상 그리기
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      const w = img.width * scale;
      const h = img.height * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, w, h);

      // 감지 결과 그리기
      if (showDetections) {
        detections
          .filter((d) => d.confidence >= confidenceThreshold)
          .forEach((d) => drawDetection(ctx, d, x, y, w, h, showOcr));
      }
    });
  }, [
    frame,
    detections,
    showDetections,
    showOcr,
    confidenceThreshold,
    isVideoConnected,
  ]);

  // 메타데이터를 표시하기 위한 함수
  const renderMetadataItem = (detection: Detection, index: number) => {
    const confidence = Math.round(detection.confidence * 100);
    return (
      <div
        key={index}
        className="flex items-center bg-black/70 rounded p-1 mr-2 mb-1 text-xs"
      >
        <span className="font-medium text-green-400">{detection.label}</span>
        <span className="mx-1 text-white">|</span>
        <span className="text-white">{confidence}%</span>
        {detection.number && (
          <>
            <span className="mx-1 text-white">|</span>
            <span className="text-blue-300">번호: {detection.number}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-[400px]">
      {/* 비디오 영역 */}
      <div className="relative w-full flex-grow bg-black overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: isVideoConnected ? "block" : "none" }}
        />
        {!isVideoConnected && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
            비디오 스트림 연결이 끊겼습니다.
          </div>
        )}

        {/* 버튼 렌더링 영역 */}
        {children}
      </div>

      {/* 메타데이터 패널 - 캔버스 아래에 배치 */}
      <div className="w-full bg-black/80 backdrop-blur-sm p-2 max-h-20 overflow-y-auto border-t border-gray-700">
        {/* 메타데이터 헤더 */}
        <div className="w-full mb-1 text-xs text-white/80 pb-1 border-b border-white/20">
          상태: {isMetaConnected ? "메타데이터 연결됨" : "메타데이터 연결 끊김"}{" "}
          | 객체:{" "}
          {detections?.filter((d) => d.confidence >= confidenceThreshold)
            .length || 0}
          개
        </div>

        {/* 메타데이터 아이템 */}
        <div className="w-full flex flex-wrap">
          {detections && detections.length > 0 ? (
            detections
              .filter((d) => d.confidence >= confidenceThreshold)
              .map((detection, index) => renderMetadataItem(detection, index))
          ) : (
            <div className="text-xs text-gray-400">감지된 객체가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
}

// 하나의 Detection 을 그리는 함수 분리
function drawDetection(
  ctx: CanvasRenderingContext2D,
  d: Detection,
  x0: number,
  y0: number,
  w0: number,
  h0: number,
  showOcr: boolean
) {
  const boxX = x0 + d.x * w0;
  const boxY = y0 + d.y * h0;
  const boxW = d.width * w0;
  const boxH = d.height * h0;

  // 바운딩 박스
  ctx.strokeStyle = "rgba(0,255,0,0.8)";
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // 레이블
  const label = `${d.label} ${Math.round(d.confidence * 100)}%`;
  ctx.font = "14px Arial";
  const lw = ctx.measureText(label).width + 10;
  ctx.fillStyle = "rgba(0,255,0,0.7)";
  ctx.fillRect(boxX, boxY - 20, lw, 20);
  ctx.fillStyle = "#fff";
  ctx.fillText(label, boxX + 5, boxY - 5);

  // OCR 번호판
  if (showOcr && d.number) {
    const text = `번호: ${d.number}`;
    const ow = ctx.measureText(text).width + 10;
    ctx.fillStyle = "rgba(0,100,255,0.7)";
    ctx.fillRect(boxX, boxY + boxH, ow, 20);
    ctx.fillStyle = "#fff";
    ctx.fillText(text, boxX + 5, boxY + boxH + 15);
  }
}
