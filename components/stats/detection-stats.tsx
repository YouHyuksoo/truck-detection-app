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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { getDetectionStats, type DetectionStatistics } from "@/lib/api/stats-api"
import { toast } from "@/components/ui/use-toast"

interface DetectionStatsProps {
  dateRange: {
    from: Date
    to: Date
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function DetectionStats({ dateRange }: DetectionStatsProps) {
  const [stats, setStats] = useState<DetectionStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getDetectionStats(dateRange)
        setStats(data)
      } catch (error) {
        console.error("감지 통계 데이터 로드 실패:", error)
        toast({
          title: "오류",
          description: "감지 통계 데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">객체 유형별 감지 건수</h3>
            <Skeleton className="h-80 w-full" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">시간대별 감지 건수 및 성공률</h3>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">영역별 감지 성공률</h3>
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

  if (!stats) {
    return <div>데이터를 불러올 수 없습니다.</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">객체 유형별 감지 건수</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.detectionByType}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.detectionByType.map((entry, index) => (
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
          <h3 className="text-lg font-medium mb-4">시간대별 감지 건수 및 성공률</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.detectionByTime}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="총 감지" fill="#8884d8" />
                <Bar dataKey="success" name="성공" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">영역별 감지 성공률</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.detectionByArea}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="area" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="총 감지" fill="#8884d8" />
              <Bar dataKey="success" name="성공" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">평균 감지 정확도</h4>
          <div className="text-2xl font-bold">{stats.averageAccuracy.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">신뢰도 75% 이상 기준</p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">평균 처리 속도</h4>
          <div className="text-2xl font-bold">{stats.averageProcessingSpeed}ms</div>
          <p className="text-xs text-muted-foreground mt-1">객체 감지 단계만 해당</p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">오탐지율</h4>
          <div className="text-2xl font-bold">{stats.falseDetectionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">전월 대비 -0.5%</p>
        </div>
      </div>
    </div>
  )
}
