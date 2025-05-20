"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { getProcessingTimeStats, type ProcessingTimeStatistics } from "@/lib/api/stats-api"
import { toast } from "@/components/ui/use-toast"

interface ProcessingTimeStatsProps {
  dateRange: {
    from: Date
    to: Date
  }
}

export function ProcessingTimeStats({ dateRange }: ProcessingTimeStatsProps) {
  const [stats, setStats] = useState<ProcessingTimeStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getProcessingTimeStats(dateRange)
        setStats(data)
      } catch (error) {
        console.error("처리 시간 통계 데이터 로드 실패:", error)
        toast({
          title: "오류",
          description: "처리 시간 통계 데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (loading) {
    return <ProcessingTimeStatsSkeletons />
  }

  if (!stats) {
    return <div className="text-center text-muted-foreground p-4">데이터가 없습니다.</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">처리 단계별 소요 시간</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.processingSteps}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit="ms" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="time" name="처리 시간 (ms)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">처리 시간 추이</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.timeTrend}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit="ms" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" name="총 처리 시간" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="detection" name="객체 감지" stroke="#82ca9d" />
                <Line type="monotone" dataKey="ocr" name="OCR 처리" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">시간대별 시스템 부하</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.loadDistribution}
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
              <Area type="monotone" dataKey="load" name="시스템 부하" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">평균 총 처리 시간</h4>
          <div className="text-2xl font-bold">{stats.averageTotalTime}ms</div>
          <p className="text-xs text-muted-foreground mt-1">전월 대비 -18ms</p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">최대 처리 시간</h4>
          <div className="text-2xl font-bold">{stats.maxProcessingTime}ms</div>
          <p className="text-xs text-muted-foreground mt-1">피크 시간대 기준</p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">초당 처리 건수</h4>
          <div className="text-2xl font-bold">{stats.processingsPerSecond.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground mt-1">전월 대비 +0.3</p>
        </div>
      </div>
    </div>
  )
}

function ProcessingTimeStatsSkeletons() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">처리 단계별 소요 시간</h3>
          <Skeleton className="h-80 w-full" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">처리 시간 추이</h3>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-4">시간대별 시스템 부하</h3>
        <Skeleton className="h-80 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
