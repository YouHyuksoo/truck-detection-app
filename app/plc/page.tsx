import type { Metadata } from "next"
import { PLCDashboard } from "@/components/plc/plc-dashboard"

export const metadata: Metadata = {
  title: "PLC 설정",
  description: "트럭 감지 시스템의 PLC 연결 및 통신 설정을 관리합니다.",
}

export default function PLCPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">PLC 설정</h1>
        <p className="text-muted-foreground">트럭 감지 시스템과 PLC 장비 간의 통신 설정을 관리합니다.</p>
      </div>
      <PLCDashboard />
    </div>
  )
}
