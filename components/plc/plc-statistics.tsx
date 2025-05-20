"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { PLCStatistics, PLCDevice } from "@/types/plc"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Clock, AlertCircle, CheckCircle, Timer, Loader2 } from "lucide-react"
import { usePLCApi } from "@/lib/api/plc-api"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PLCStatisticsProps {
  device?: PLCDevice
}

export function PLCStatisticsComponent({ device }: PLCStatisticsProps) {
  const [statistics, setStatistics] = useState<PLCStatistics | null>(null)
  const [hourlyData, setHourlyData] = useState<{ hour: string; success: number; failure: number }[]>([])
  const [dailyData, setDailyData] = useState<{ day: string; success: number; failure: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const plcApi = usePLCApi()
  const { toast } = useToast()

  useEffect(() => {
    const loadStatistics = async () => {
      if (!device) return

      try {
        setLoading(true)
        setError(null)

        // 통계 데이터 로드
        const stats = await plcApi.getPLCStatistics()
        setStatistics(stats)

        // 시간별 데이터 생성 (실제로는 API에서 가져와야 함)
        const hourlyDataTemp = []
        for (let i = 0; i < 24; i++) {
          const hour = i.toString().padStart(2, "0") + ":00"
          const success = Math.floor(Math.random() * 100) + 50
          const failure = Math.floor(Math.random() * 10)
          hourlyDataTemp.push({ hour, success, failure })
        }
        setHourlyData(hourlyDataTemp)

        // 일별 데이터 생성 (실제로는 API에서 가져와야 함)
        const days = ["월", "화", "수", "목", "금", "토", "일"]
        const dailyDataTemp = days.map((day) => ({
          day,
          success: Math.floor(Math.random() * 500) + 300,
          failure: Math.floor(Math.random() * 50),
        }))
        setDailyData(dailyDataTemp)
      } catch (err) {
        setError("통계 데이터를 로드하는 중 오류가 발생했습니다.")
        toast({
          title: "통계 로드 오류",
          description: (err as Error).message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadStatistics()

    // 1분마다 데이터 갱신
    const intervalId = setInterval(loadStatistics, 60000)
    return () => clearInterval(intervalId)
  }, [device, plcApi, toast])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${days}일 ${hours}시간 ${minutes}분`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">통계 데이터를 로드하는 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!statistics) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>통계 데이터를 사용할 수 없습니다.</p>
      </div>
    )
  }

  const successRate =
    statistics.totalTransactions > 0 ? (statistics.successfulTransactions / statistics.totalTransactions) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 트랜잭션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              성공: {statistics.successfulTransactions.toLocaleString()} | 실패:{" "}
              {statistics.failedTransactions.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">평균 응답 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageResponseTime} ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Timer className="h-3 w-3 inline mr-1" />
              최근 1000개 트랜잭션 기준
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">가동 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(statistics.uptime)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              마지막 재시작: {new Date(Date.now() - statistics.uptime * 1000).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>통신 상태 통계</CardTitle>
          <CardDescription>시간별 및 일별 통신 성공/실패 통계</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hourly">
            <TabsList className="mb-4">
              <TabsTrigger value="hourly">시간별</TabsTrigger>
              <TabsTrigger value="daily">일별</TabsTrigger>
            </TabsList>
            <TabsContent value="hourly" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" name="성공" fill="#22c55e" stackId="a" />
                  <Bar dataKey="failure" name="실패" fill="#ef4444" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="daily" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" name="성공" fill="#22c55e" stackId="a" />
                  <Bar dataKey="failure" name="실패" fill="#ef4444" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 오류</CardTitle>
          <CardDescription>마지막으로 발생한 통신 오류 정보</CardDescription>
        </CardHeader>
        <CardContent>
          {statistics.lastErrorMessage ? (
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">{statistics.lastErrorMessage}</p>
                <p className="text-sm text-muted-foreground">{statistics.lastErrorTimestamp?.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p>오류 없음</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
