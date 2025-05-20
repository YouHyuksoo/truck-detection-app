"use client";

import { useEffect, useRef } from "react";
import { useDetectionApi, Detection } from "@/lib/api/detection-api";

interface VideoFeedProps {
  isPlaying: boolean;
  showDetections: boolean;
  showOcr: boolean;
  confidenceThreshold: number;
}

export default function VideoFeed({
  isPlaying,
  showDetections,
  showOcr,
  confidenceThreshold,
}: VideoFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { frame, detections } = useDetectionApi();

  useEffect(() => {
    if (!isPlaying || !frame) return;
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
    isPlaying,
    frame,
    detections,
    showDetections,
    showOcr,
    confidenceThreshold,
  ]);

  return (
    <div className="relative w-full h-[400px] bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: isPlaying ? "block" : "none" }}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
          영상이 일시정지되었습니다.
        </div>
      )}
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
