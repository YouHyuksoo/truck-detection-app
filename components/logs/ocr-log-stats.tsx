"use client"

import { useEffect, useRef } from "react"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { OcrLogEntry } from "@/types/logs"

interface OcrLogStatsProps {
  logs: OcrLogEntry[]
  dateRange: {
    from: Date
    to: Date
  }
  stats?: any // API에서 가져온 통계 데이터
}

export default function OcrLogStats({ logs, dateRange, stats }: OcrLogStatsProps) {
  const dailyChartRef = useRef<HTMLCanvasElement>(null)
  const confidenceChartRef = useRef<HTMLCanvasElement>(null)
  const roiChartRef = useRef<HTMLCanvasElement>(null)

  // 통계 데이터 계산 (API 데이터가 없는 경우 로컬에서 계산)
  const totalLogs = stats?.totalCount || logs.length
  const successLogs = stats?.successCount || logs.filter((log) => log.status === "success").length
  const avgConfidence = stats?.avgConfidence || logs.reduce((sum, log) => sum + log.confidence, 0) / (totalLogs || 1)
  const sentToPLC = stats?.plcSentCount || logs.filter((log) => log.sentToPLC).length

  // 일별 데이터 차트 그리기
  useEffect(() => {
    if (!dailyChartRef.current) return
    if (!stats && logs.length === 0) return

    const ctx = dailyChartRef.current.getContext("2d")
    if (!ctx) return

    // 일별 데이터 준비
    let dates: string[] = []
    let counts: number[] = []

    if (stats?.dailyStats) {
      // API 데이터 사용
      dates = stats.dailyStats.map((item: any) => item.date)
      counts = stats.dailyStats.map((item: any) => item.count)
    } else {
      // 로컬 데이터 집계
      const dailyData: Record<string, number> = {}
      const days = 7 // 최근 7일

      // 최근 7일 날짜 초기화
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]
        dailyData[dateStr] = 0
      }

      // 로그 데이터 집계
      logs.forEach((log) => {
        const dateStr = new Date(log.timestamp).toISOString().split("T")[0]
        if (dailyData[dateStr] !== undefined) {
          dailyData[dateStr]++
        }
      })

      dates = Object.keys(dailyData).sort()
      counts = dates.map((date) => dailyData[date])
    }

    // 차트 그리기
    ctx.clearRect(0, 0, dailyChartRef.current.width, dailyChartRef.current.height)

    // 막대 그래프 그리기
    const barWidth = dailyChartRef.current.width / (dates.length * 2)
    const maxCount = Math.max(...counts, 1)

    ctx.fillStyle = "#3b82f6"
    dates.forEach((date, index) => {
      const x = index * (barWidth * 2) + barWidth / 2
      const height = (counts[index] / maxCount) * (dailyChartRef.current!.height - 60)
      ctx.fillRect(x, dailyChartRef.current!.height - 30 - height, barWidth, height)

      // 날짜 레이블
      ctx.fillStyle = "#6b7280"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(
        new Date(date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
        x + barWidth / 2,
        dailyChartRef.current!.height - 10,
      )

      // 값 레이블
      if (counts[index] > 0) {
        ctx.fillStyle = "#3b82f6"
        ctx.fillText(counts[index].toString(), x + barWidth / 2, dailyChartRef.current!.height - 35 - height)
      }
    })
  }, [logs, stats])

  // 신뢰도 분포 차트
  useEffect(() => {
    if (!confidenceChartRef.current) return
    if (!stats && logs.length === 0) return

    const ctx = confidenceChartRef.current.getContext("2d")
    if (!ctx) return

    // 신뢰도 구간별 데이터 준비
    let confidenceRanges: Record<string, number> = {}

    if (stats?.confidenceDistribution) {
      // API 데이터 사용
      confidenceRanges = stats.confidenceDistribution
    } else {
      // 로컬 데이터 집계
      confidenceRanges = {
        "0-50%": 0,
        "51-70%": 0,
        "71-85%": 0,
        "86-95%": 0,
        "96-100%": 0,
      }

      logs.forEach((log) => {
        if (log.confidence <= 50) confidenceRanges["0-50%"]++
        else if (log.confidence <= 70) confidenceRanges["51-70%"]++
        else if (log.confidence <= 85) confidenceRanges["71-85%"]++
        else if (log.confidence <= 95) confidenceRanges["86-95%"]++
        else confidenceRanges["96-100%"]++
      })
    }

    // 차트 그리기
    const ranges = Object.keys(confidenceRanges)
    const counts = ranges.map((range) => confidenceRanges[range])

    ctx.clearRect(0, 0, confidenceChartRef.current.width, confidenceChartRef.current.height)

    // 파이 차트 그리기
    const total = counts.reduce((sum, count) => sum + count, 0)
    let startAngle = 0

    const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"]

    ranges.forEach((range, index) => {
      const sliceAngle = (counts[index] / total) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(confidenceChartRef.current!.width / 2, confidenceChartRef.current!.height / 2)
      ctx.arc(
        confidenceChartRef.current!.width / 2,
        confidenceChartRef.current!.height / 2,
        Math.min(confidenceChartRef.current!.width, confidenceChartRef.current!.height) / 2 - 10,
        startAngle,
        startAngle + sliceAngle,
      )
      ctx.closePath()

      ctx.fillStyle = colors[index]
      ctx.fill()

      // 레이블 위치 계산
      const labelAngle = startAngle + sliceAngle / 2
      const labelRadius = Math.min(confidenceChartRef.current!.width, confidenceChartRef.current!.height) / 2 - 30
      const labelX = confidenceChartRef.current!.width / 2 + Math.cos(labelAngle) * labelRadius
      const labelY = confidenceChartRef.current!.height / 2 + Math.sin(labelAngle) * labelRadius

      // 레이블 그리기 (값이 있는 경우만)
      if (counts[index] > 0) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${Math.round((counts[index] / total) * 100)}%`, labelX, labelY)
      }

      startAngle += sliceAngle
    })

    // 범례 그리기
    const legendY = confidenceChartRef.current.height - 20
    const legendWidth = confidenceChartRef.current.width / ranges.length

    ranges.forEach((range, index) => {
      const legendX = index * legendWidth + legendWidth / 2

      ctx.fillStyle = colors[index]
      ctx.fillRect(legendX - 30, legendY, 10, 10)

      ctx.fillStyle = "#6b7280"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"
      ctx.fillText(range, legendX - 15, legendY + 5)
    })
  }, [logs, stats])

  // 관심영역별 차트
  useEffect(() => {
    if (!roiChartRef.current) return
    if (!stats && logs.length === 0) return

    const ctx = roiChartRef.current.getContext("2d")
    if (!ctx) return

    // 관심영역별 데이터 준비
    let roiData: Record<string, number> = {}

    if (stats?.roiDistribution) {
      // API 데이터 사용
      roiData = stats.roiDistribution
    } else {
      // 로컬 데이터 집계
      roiData = {}
      logs.forEach((log) => {
        if (!roiData[log.roiName]) {
          roiData[log.roiName] = 0
        }
        roiData[log.roiName]++
      })
    }

    // 차트 그리기
    const rois = Object.keys(roiData)
    const counts = rois.map((roi) => roiData[roi])

    ctx.clearRect(0, 0, roiChartRef.current.width, roiChartRef.current.height)

    // 수평 막대 그래프 그리기
    const barHeight = 30
    const maxCount = Math.max(...counts, 1)
    const chartHeight = rois.length * (barHeight + 10)
    const startY = (roiChartRef.current.height - chartHeight) / 2

    rois.forEach((roi, index) => {
      const y = startY + index * (barHeight + 10)
      const width = (counts[index] / maxCount) * (roiChartRef.current!.width - 150)

      // 막대 그리기
      ctx.fillStyle = `hsl(${index * 50}, 70%, 50%)`
      ctx.fillRect(100, y, width, barHeight)

      // ROI 이름 레이블
      ctx.fillStyle = "#6b7280"
      ctx.font = "12px Arial"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText(roi, 90, y + barHeight / 2)

      // 값 레이블
      ctx.fillStyle = "#000000"
      ctx.textAlign = "left"
      ctx.fillText(counts[index].toString(), width + 110, y + barHeight / 2)
    })
  }, [logs, stats])

  return (
    <div className="p-6 space-y-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>OCR 통계</CardTitle>
        <CardDescription>
          {dateRange.from.toLocaleDateString()} ~ {dateRange.to.toLocaleDateString()} 기간의 OCR 처리 통계입니다.
        </CardDescription>
      </CardHeader>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">총 처리 건수</div>
          <div className="text-3xl font-bold mt-1">{totalLogs}</div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">성공률</div>
          <div className="text-3xl font-bold mt-1">{totalLogs ? Math.round((successLogs / totalLogs) * 100) : 0}%</div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">평균 신뢰도</div>
          <div className="text-3xl font-bold mt-1">{avgConfidence.toFixed(1)}%</div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">PLC 전송률</div>
          <div className="text-3xl font-bold mt-1">{totalLogs ? Math.round((sentToPLC / totalLogs) * 100) : 0}%</div>
        </div>
      </div>

      {/* 차트 */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">일별 추이</TabsTrigger>
          <TabsTrigger value="confidence">신뢰도 분포</TabsTrigger>
          <TabsTrigger value="roi">관심영역별</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <div className="bg-muted/50 rounded-lg p-4 h-[300px] flex items-center justify-center">
            {stats || logs.length > 0 ? (
              <canvas ref={dailyChartRef} width={600} height={300} />
            ) : (
              <div className="text-muted-foreground">표시할 데이터가 없습니다.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="confidence" className="mt-4">
          <div className="bg-muted/50 rounded-lg p-4 h-[300px] flex items-center justify-center">
            {stats || logs.length > 0 ? (
              <canvas ref={confidenceChartRef} width={400} height={300} />
            ) : (
              <div className="text-muted-foreground">표시할 데이터가 없습니다.</div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            <div className="text-center">
              <Badge variant="outline" className="bg-red-500 text-white">
                0-50%
              </Badge>
              <div className="text-sm mt-1">매우 낮음</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="bg-orange-500 text-white">
                51-70%
              </Badge>
              <div className="text-sm mt-1">낮음</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="bg-yellow-500 text-white">
                71-85%
              </Badge>
              <div className="text-sm mt-1">보통</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="bg-lime-500 text-white">
                86-95%
              </Badge>
              <div className="text-sm mt-1">높음</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="bg-green-500 text-white">
                96-100%
              </Badge>
              <div className="text-sm mt-1">매우 높음</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roi" className="mt-4">
          <div className="bg-muted/50 rounded-lg p-4 h-[300px] flex items-center justify-center">
            {stats || logs.length > 0 ? (
              <canvas ref={roiChartRef} width={600} height={300} />
            ) : (
              <div className="text-muted-foreground">표시할 데이터가 없습니다.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
