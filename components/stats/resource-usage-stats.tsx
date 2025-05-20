"use client"

import { useEffect, useState } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { getResourceUsageStats, type ResourceUsageStatistics } from "@/lib/api/stats-api"
import { toast } from "@/components/ui/use-toast"

interface ResourceUsageStatsProps {
  dateRange: {
    from: Date
    to: Date
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function ResourceUsageStats({ dateRange }: ResourceUsageStatsProps) {
  const [stats, setStats] = useState<ResourceUsageStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getResourceUsageStats(dateRange)
        setStats(data)
      } catch (error) {
        console.error("리소스 사용량 통계 데이터 로드 실패:", error)
        toast({
          title: "오류",
          description: "리소스 사용량 통계 데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (loading) {
    return <ResourceUsageStatsSkeletons />
  }

  if (!stats) {
    return <div className="text-center text-muted-foreground p-4">데이터가 없습니다.</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">현재 CPU 사용량</h4>
          <div className="text-2xl font-bold">{stats.currentUsage.cpu}%</div>
          <Progress value={stats.currentUsage.cpu} className="h-2 mt-2" />
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">현재 메모리 사용량</h4>
          <div className="text-2xl font-bold">{stats.currentUsage.memory}%</div>
          <Progress value={stats.currentUsage.memory} className="h-2 mt-2" />
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">현재 디스크 사용량</h4>
          <div className="text-2xl font-bold">{stats.currentUsage.disk}%</div>
          <Progress value={stats.currentUsage.disk} className="h-2 mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">CPU 사용량 추이</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.cpuUsage}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="usage" name="CPU 사용량" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">메모리 사용량 추이</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.memoryUsage}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="usage" name="메모리 사용량" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">디스크 사용량 분석</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.diskUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.diskUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">시스템 성능 지표</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">평균 CPU 사용량</span>
                <span className="text-sm">{stats.performanceMetrics.averageCpu}%</span>
              </div>
              <Progress value={stats.performanceMetrics.averageCpu} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">평균 메모리 사용량</span>
                <span className="text-sm">{stats.performanceMetrics.averageMemory}%</span>
              </div>
              <Progress value={stats.performanceMetrics.averageMemory} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">네트워크 대역폭 사용률</span>
                <span className="text-sm">{stats.performanceMetrics.networkBandwidth}%</span>
              </div>
              <Progress value={stats.performanceMetrics.networkBandwidth} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">GPU 사용률</span>
                <span className="text-sm">{stats.performanceMetrics.gpu}%</span>
              </div>
              <Progress value={stats.performanceMetrics.gpu} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">디스크 I/O 사용률</span>
                <span className="text-sm">{stats.performanceMetrics.diskIo}%</span>
              </div>
              <Progress value={stats.performanceMetrics.diskIo} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResourceUsageStatsSkeletons() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">CPU 사용량 추이</h3>
          <Skeleton className="h-80 w-full" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">메모리 사용량 추이</h3>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">디스크 사용량 분석</h3>
          <Skeleton className="h-80 w-full" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">시스템 성능 지표</h3>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
