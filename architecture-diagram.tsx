"use client"

import { useEffect, useRef } from "react"

export default function ArchitectureDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set styles
    ctx.font = "14px Arial"
    ctx.lineWidth = 2

    // Draw frontend box
    ctx.fillStyle = "#e3f2fd"
    ctx.strokeStyle = "#1976d2"
    ctx.fillRect(50, 50, 300, 200)
    ctx.strokeRect(50, 50, 300, 200)
    ctx.fillStyle = "#1976d2"
    ctx.fillText("Frontend (Next.js)", 150, 70)

    // Draw frontend components
    ctx.fillStyle = "#bbdefb"
    ctx.strokeStyle = "#1976d2"
    ctx.fillRect(70, 90, 260, 140)
    ctx.strokeRect(70, 90, 260, 140)
    ctx.fillStyle = "#1976d2"
    ctx.fillText("React Components", 150, 110)

    // List frontend components
    ctx.fillStyle = "#000"
    ctx.fillText("- 영상 표시 및 객체 탐지 화면", 80, 130)
    ctx.fillText("- 환경 설정 메뉴", 80, 150)
    ctx.fillText("- 모델 학습 메뉴", 80, 170)
    ctx.fillText("- 로그 조회 메뉴", 80, 190)
    ctx.fillText("- 관심영역 설정 메뉴", 80, 210)

    // Draw backend box
    ctx.fillStyle = "#e8f5e9"
    ctx.strokeStyle = "#388e3c"
    ctx.fillRect(50, 300, 300, 220)
    ctx.strokeRect(50, 300, 300, 220)
    ctx.fillStyle = "#388e3c"
    ctx.fillText("Backend (Python)", 150, 320)

    // Draw backend components
    ctx.fillStyle = "#c8e6c9"
    ctx.strokeStyle = "#388e3c"
    ctx.fillRect(70, 340, 260, 160)
    ctx.strokeRect(70, 340, 260, 160)
    ctx.fillStyle = "#388e3c"
    ctx.fillText("Python Modules", 150, 360)

    // List backend components
    ctx.fillStyle = "#000"
    ctx.fillText("- OpenCV 카메라 모듈", 80, 380)
    ctx.fillText("- YOLO 객체 감지 모듈", 80, 400)
    ctx.fillText("- OCR 처리 모듈", 80, 420)
    ctx.fillText("- 객체 추적 모듈", 80, 440)
    ctx.fillText("- PLC 통신 모듈", 80, 460)
    ctx.fillText("- 데이터베이스 모듈", 80, 480)

    // Draw database
    ctx.fillStyle = "#fff3e0"
    ctx.strokeStyle = "#e65100"
    ctx.fillRect(400, 350, 150, 100)
    ctx.strokeRect(400, 350, 150, 100)
    ctx.fillStyle = "#e65100"
    ctx.fillText("Database", 445, 370)
    ctx.fillStyle = "#000"
    ctx.fillText("- 로그 데이터", 410, 390)
    ctx.fillText("- 설정 데이터", 410, 410)
    ctx.fillText("- 학습 데이터", 410, 430)

    // Draw camera
    ctx.fillStyle = "#f3e5f5"
    ctx.strokeStyle = "#7b1fa2"
    ctx.fillRect(400, 50, 150, 80)
    ctx.strokeRect(400, 50, 150, 80)
    ctx.fillStyle = "#7b1fa2"
    ctx.fillText("Camera", 450, 70)
    ctx.fillStyle = "#000"
    ctx.fillText("- RTSP/IP Camera", 410, 90)
    ctx.fillText("- Video Stream", 410, 110)

    // Draw PLC
    ctx.fillStyle = "#ffebee"
    ctx.strokeStyle = "#c62828"
    ctx.fillRect(400, 180, 150, 80)
    ctx.strokeRect(400, 180, 150, 80)
    ctx.fillStyle = "#c62828"
    ctx.fillText("PLC", 460, 200)
    ctx.fillStyle = "#000"
    ctx.fillText("- 숫자 데이터 수신", 410, 220)
    ctx.fillText("- 제어 신호 처리", 410, 240)

    // Draw connections
    ctx.strokeStyle = "#666"
    ctx.beginPath()
    // Frontend to Backend
    ctx.moveTo(200, 250)
    ctx.lineTo(200, 300)
    // Backend to Database
    ctx.moveTo(350, 400)
    ctx.lineTo(400, 400)
    // Backend to Camera
    ctx.moveTo(350, 340)
    ctx.lineTo(380, 340)
    ctx.lineTo(380, 90)
    ctx.lineTo(400, 90)
    // Backend to PLC
    ctx.moveTo(350, 460)
    ctx.lineTo(380, 460)
    ctx.lineTo(380, 220)
    ctx.lineTo(400, 220)
    ctx.stroke()

    // Draw arrows
    function drawArrow(fromX: number, fromY: number, toX: number, toY: number) {
      const headLen = 10
      const angle = Math.atan2(toY - fromY, toX - fromX)

      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6))
      ctx.moveTo(toX, toY)
      ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6))
      ctx.stroke()
    }

    drawArrow(200, 290, 200, 300)
    drawArrow(390, 400, 400, 400)
    drawArrow(390, 90, 400, 90)
    drawArrow(390, 220, 400, 220)

    // Draw API connection
    ctx.fillStyle = "#000"
    ctx.fillText("REST API / WebSocket", 210, 280)
  }, [])

  return (
    <div className="flex justify-center p-4">
      <canvas ref={canvasRef} width={600} height={550} className="border border-gray-300 rounded-lg shadow-lg" />
    </div>
  )
}
