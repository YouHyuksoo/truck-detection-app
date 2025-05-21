import type { Metadata } from "next";
import DetectionDashboard from "@/components/detection/detection-dashboard";

export const metadata: Metadata = {
  title: "객체 감지 시스템 | 실시간 감지",
  description: "실시간 영상 및 객체 감지 결과를 표시하는 대시보드",
};

export default function DetectionPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">실시간 객체 감지</h1>
      <DetectionDashboard />
    </div>
  );
}
