import type { Metadata } from "next"
import TrainingDashboard from "@/components/training/training-dashboard"

export const metadata: Metadata = {
  title: "트럭 감지 시스템 | 모델 학습",
  description: "YOLO 모델 학습 관리 및 모니터링",
}

export default function TrainingPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">모델 학습</h1>
      <TrainingDashboard />
    </div>
  )
}
