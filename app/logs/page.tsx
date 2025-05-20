import type { Metadata } from "next"
import OcrLogsView from "@/components/logs/ocr-logs-view"

export const metadata: Metadata = {
  title: "트럭 감지 시스템 | OCR 로그 조회",
  description: "OCR 처리 이력 및 로그 조회",
}

export default function LogsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OCR 로그 조회</h1>
      <OcrLogsView />
    </div>
  )
}
