"use client"

import { useEffect, useState } from "react"
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { getTimePeriodStats, type TimePeriodStatistics } from "@/lib/api/stats-api"
import { toast } from "@/components/ui/use-toast"

interface TimePeriodStatsProps {
  dateRange: {
    from: Date
    to: Date
  }
}

export function TimePeriodStats({ dateRange }: TimePeriodStatsProps) {
  const [stats, setStats] = useState<TimePeriodStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getTimePeriodStats(dateRange)
        setStats(data)
      } catch (error) {
        console.error("시간별 통계 데이터 로드 실패:", error)
        toast({
          title: "오류",
          description: "시간별 통계 데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (loading) {
    return <TimePeriodStatsSkeletons />
  }

  if (!stats) {
    return <div className="text-center text-muted-foreground p-4">데이터가 없습니다.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">일별 처리 통계</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={stats.daily}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" unit="%" domain={[80, 100]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" name="총 처리" fill="#8884d8" />
              <Bar yAxisId="left" dataKey="success" name="성공" fill="#82ca9d" />
              <Line yAxisId="right" type="monotone" dataKey="rate" name="성공률" stroke="#ff7300" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">주별 처리 통계</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={stats.weekly}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" unit="%" domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="총 처리" fill="#8884d8" />
                <Bar yAxisId="left" dataKey="success" name="성공" fill="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="rate" name="성공률" stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">월별 처리 통계</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={stats.monthly}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" unit="%" domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="총 처리" fill="#8884d8" />
                <Bar yAxisId="left" dataKey="success" name="성공" fill="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="rate" name="성공률" stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimePeriodStatsSkeletons() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">일별 처리 통계</h3>
        <Skeleton className="h-80 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">주별 처리 통계</h3>
          <Skeleton className="h-80 w-full" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">월별 처리 통계</h3>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  )
}
