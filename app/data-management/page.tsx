import { DataManagementDashboard } from "@/components/data-management/data-management-dashboard"

export default function DataManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold tracking-tight">데이터 관리</h1>
      </div>
      <DataManagementDashboard />
    </div>
  )
}
