import type { Metadata } from "next"
import { StatsDashboard } from "@/components/stats/stats-dashboard"

export const metadata: Metadata = {
  title: "통계 | 트럭 감지 시스템",
  description: "시스템 성능 및 처리 통계 대시보드",
}

export default function StatsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">통계 대시보드</h1>
        <p className="text-muted-foreground">시스템 성능 및 처리 통계를 확인합니다.</p>
      </div>
      <StatsDashboard />
    </div>
  )
}
