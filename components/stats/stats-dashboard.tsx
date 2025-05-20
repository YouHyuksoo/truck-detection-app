"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { DetectionStats } from "./detection-stats"
import { OcrStats } from "./ocr-stats"
import { ProcessingTimeStats } from "./processing-time-stats"
import { ResourceUsageStats } from "./resource-usage-stats"
import { TimePeriodStats } from "./time-period-stats"
import { addDays } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { getStatsOverview, exportStatsData, type StatsOverview } from "@/lib/api/stats-api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

export function StatsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [overview, setOverview] = useState<StatsOverview | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  const loadOverviewData = useCallback(async () => {
    setOverviewLoading(true)
    try {
      const data = await getStatsOverview()
      setOverview(data)
    } catch (error) {
      console.error("통계 개요 데이터 로드 실패:", error)
      toast({
        title: "오류",
        description: "통계 개요 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOverviewData()
  }, [loadOverviewData])

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await loadOverviewData()
      toast({
        title: "새로고침 완료",
        description: "통계 데이터가 성공적으로 새로고침되었습니다.",
      })
    } catch (error) {
      console.error("데이터 새로고침 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: "csv" | "excel" | "json") => {
    setIsExporting(true)
    try {
      await exportStatsData(format, dateRange)
      toast({
        title: "내보내기 완료",
        description: `통계 데이터를 ${format.toUpperCase()} 형식으로 성공적으로 내보냈습니다.`,
      })
    } catch (error) {
      console.error("데이터 내보내기 실패:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "새로고침 중..." : "새로고침"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2" disabled={isExporting}>
                <Download className="h-4 w-4" />
                {isExporting ? "내보내는 중..." : "내보내기"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>CSV 형식</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>Excel 형식</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>JSON 형식</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="detection">감지 통계</TabsTrigger>
          <TabsTrigger value="ocr">OCR 통계</TabsTrigger>
          <TabsTrigger value="processing">처리 시간</TabsTrigger>
          <TabsTrigger value="resources">리소스 사용량</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">총 감지 건수</CardTitle>
              </CardHeader>
              <CardContent>
                {overviewLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{overview?.totalDetections.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      전월 대비{" "}
                      <span
                        className={
                          overview?.previousMonthComparison.totalDetections >= 0 ? "text-green-500" : "text-red-500"
                        }
                      >
                        {overview?.previousMonthComparison.totalDetections >= 0 ? "+" : ""}
                        {overview?.previousMonthComparison.totalDetections.toFixed(1)}%
                      </span>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">감지 성공률</CardTitle>
              </CardHeader>
              <CardContent>
                {overviewLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{overview?.detectionSuccessRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      전월 대비{" "}
                      <span
                        className={
                          overview?.previousMonthComparison.detectionSuccessRate >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {overview?.previousMonthComparison.detectionSuccessRate >= 0 ? "+" : ""}
                        {overview?.previousMonthComparison.detectionSuccessRate.toFixed(1)}%
                      </span>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">OCR 인식률</CardTitle>
              </CardHeader>
              <CardContent>
                {overviewLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{overview?.ocrRecognitionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      전월 대비{" "}
                      <span
                        className={
                          overview?.previousMonthComparison.ocrRecognitionRate >= 0 ? "text-green-500" : "text-red-500"
                        }
                      >
                        {overview?.previousMonthComparison.ocrRecognitionRate >= 0 ? "+" : ""}
                        {overview?.previousMonthComparison.ocrRecognitionRate.toFixed(1)}%
                      </span>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">평균 처리 시간</CardTitle>
              </CardHeader>
              <CardContent>
                {overviewLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{overview?.averageProcessingTime}ms</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      전월 대비{" "}
                      <span
                        className={
                          overview?.previousMonthComparison.averageProcessingTime <= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {overview?.previousMonthComparison.averageProcessingTime <= 0 ? "" : "+"}
                        {overview?.previousMonthComparison.averageProcessingTime}ms
                      </span>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>일별 처리 통계</CardTitle>
                <CardDescription>최근 30일간의 일별 처리 건수 및 성공률</CardDescription>
              </CardHeader>
              <CardContent>
                <TimePeriodStats dateRange={dateRange} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detection" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>감지 성공률 통계</CardTitle>
              <CardDescription>객체 감지 성공률 및 관련 지표</CardDescription>
            </CardHeader>
            <CardContent>
              <DetectionStats dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocr" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>OCR 인식률 통계</CardTitle>
              <CardDescription>OCR 처리 성공률 및 관련 지표</CardDescription>
            </CardHeader>
            <CardContent>
              <OcrStats dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>처리 시간 분석</CardTitle>
              <CardDescription>각 처리 단계별 소요 시간 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <ProcessingTimeStats dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>시스템 리소스 사용량</CardTitle>
              <CardDescription>CPU, 메모리, 디스크 등 시스템 리소스 사용량</CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceUsageStats dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
