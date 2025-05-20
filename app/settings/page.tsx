import type { Metadata } from "next"
import SettingsLayout from "@/components/settings/settings-layout"

export const metadata: Metadata = {
  title: "트럭 감지 시스템 | 환경 설정",
  description: "시스템 환경 설정 관리",
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">환경 설정</h1>
      <SettingsLayout />
    </div>
  )
}
