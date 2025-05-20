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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { getOcrStats, type OcrStatistics } from "@/lib/api/stats-api"

interface OcrStatsProps {
  dateRange: {
    from: Date
    to: Date
  }
}

const COLORS = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"]

export function OcrStats({ dateRange }: OcrStatsProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OcrStatistics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOcrStats() {
      try {
        setLoading(true)
        const data = await getOcrStats(dateRange)
        setStats(data)
        setError(null)
      } catch (err) {
        console.error("OCR 통계 데이터 로드 실패:", err)
        setError("OCR 통계 데이터를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchOcrStats()
  }, [dateRange])

  if (loading) {
    return <OcrStatsSkeletons />
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>
  }

  if (!stats) {
    return <div className="text-center text-muted-foreground p-4">데이터가 없습니다.</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">OCR 인식률 추이</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.accuracyTrend}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="accuracy" name="인식률 (%)" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">신뢰도 수준별 분포</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.confidenceLevels}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {stats.confidenceLevels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">OCR 오류 유형 분석</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.errorTypes}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="오류 건수" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">평균 OCR 인식률</h4>
          <div className="text-2xl font-bold">{stats.averageAccuracy.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            전월 대비 {stats.averageAccuracy > 0 ? "+" : ""}
            {stats.averageAccuracy.toFixed(1)}%
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">평균 OCR 처리 시간</h4>
          <div className="text-2xl font-bold">{stats.averageProcessingTime}ms</div>
          <p className="text-xs text-muted-foreground mt-1">전월 대비 -8ms</p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">OCR 오류율</h4>
          <div className="text-2xl font-bold">{stats.errorRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            전월 대비 {stats.errorRate > 0 ? "+" : ""}
            {stats.errorRate.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}

function OcrStatsSkeletons() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">OCR 인식률 추이</h3>
          <Skeleton className="h-80 w-full" />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">신뢰도 수준별 분포</h3>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">OCR 오류 유형 분석</h3>
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
