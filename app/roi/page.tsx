import type { Metadata } from "next"
import RoiEditor from "@/components/roi/roi-editor"

export const metadata: Metadata = {
  title: "트럭 감지 시스템 | 관심영역 설정",
  description: "트럭 감지 및 OCR 처리를 위한 관심영역(ROI) 설정",
}

export default function RoiPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">관심영역 설정</h1>
      <RoiEditor />
    </div>
  )
}
