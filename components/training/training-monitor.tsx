"use client"

import { useEffect, useRef, useState } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Clock, Download } from "lucide-react"

interface TrainingMonitorProps {
  isTraining: boolean
  progress: number
}

interface TrainingMetrics {
  epoch: number
  loss: number
  precision: number
  recall: number
  mAP: number
  learningRate: number
  timestamp: string
}

export default function TrainingMonitor({ isTraining, progress }: TrainingMonitorProps) {
  const [activeTab, setActiveTab] = useState("metrics")
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  // 학습 메트릭 시뮬레이션
  useEffect(() => {
    if (!isTraining) return

    const interval = setInterval(() => {
      const epoch = metrics.length + 1
      if (epoch > 100) {
        clearInterval(interval)
        return
      }

      const newMetric: TrainingMetrics = {
        epoch,
        loss: 5 / (1 + 0.1 * epoch) + Math.random() * 0.2,
        precision: 0.5 + 0.4 * (1 - Math.exp(-0.05 * epoch)) + Math.random() * 0.05,
        recall: 0.5 + 0.4 * (1 - Math.exp(-0.05 * epoch)) + Math.random() * 0.05,
        mAP: 0.4 + 0.5 * (1 - Math.exp(-0.03 * epoch)) + Math.random() * 0.03,
        learningRate: 0.01 * Math.cos(((epoch / 100) * Math.PI) / 2),
        timestamp: new Date().toISOString(),
      }

      setMetrics((prev) => [...prev, newMetric])

      // 로그 추가
      const logMessages = [
        `[${epoch}] Epoch ${epoch}/100, Loss: ${newMetric.loss.toFixed(4)}`,
        `[${epoch}] Precision: ${newMetric.precision.toFixed(4)}, Recall: ${newMetric.recall.toFixed(4)}`,
        `[${epoch}] mAP@0.5: ${newMetric.mAP.toFixed(4)}, LR: ${newMetric.learningRate.toFixed(6)}`,
      ]

      setLogs((prev) => [...prev, ...logMessages])
    }, 3000)

    return () => clearInterval(interval)
  }, [isTraining, metrics.length])

  // 로그 자동 스크롤
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  // 차트 그리기
  const lossChartRef = useRef<HTMLCanvasElement>(null)
  const metricChartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!lossChartRef.current || metrics.length === 0) return

    const ctx = lossChartRef.current.getContext("2d")
    if (!ctx) return

    // 손실 차트 그리기
    ctx.clearRect(0, 0, lossChartRef.current.width, lossChartRef.current.height)

    const maxLoss = Math.max(...metrics.map((m) => m.loss), 5)
    const chartHeight = lossChartRef.current.height - 40
    const chartWidth = lossChartRef.current.width - 60

    // 축 그리기
    ctx.strokeStyle = "#e5e7eb"
    ctx.beginPath()
    ctx.moveTo(50, 10)
    ctx.lineTo(50, chartHeight + 10)
    ctx.lineTo(chartWidth + 50, chartHeight + 10)
    ctx.stroke()

    // 손실 그래프 그리기
    ctx.strokeStyle = "#ef4444"
    ctx.lineWidth = 2
    ctx.beginPath()

    metrics.forEach((metric, index) => {
      const x = 50 + (index / (metrics.length - 1 || 1)) * chartWidth
      const y = 10 + chartHeight - (metric.loss / maxLoss) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 레이블 그리기
    ctx.fillStyle = "#6b7280"
    ctx.font = "10px Arial"
    ctx.textAlign = "right"
    ctx.fillText("0", 45, chartHeight + 10)
    ctx.fillText(maxLoss.toFixed(1), 45, 15)

    ctx.textAlign = "center"
    ctx.fillText("에폭", chartWidth / 2 + 50, chartHeight + 30)

    ctx.save()
    ctx.translate(15, chartHeight / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("손실", 0, 0)
    ctx.restore()
  }, [metrics])

  useEffect(() => {
    if (!metricChartRef.current || metrics.length === 0) return

    const ctx = metricChartRef.current.getContext("2d")
    if (!ctx) return

    // 메트릭 차트 그리기
    ctx.clearRect(0, 0, metricChartRef.current.width, metricChartRef.current.height)

    const chartHeight = metricChartRef.current.height - 40
    const chartWidth = metricChartRef.current.width - 60

    // 축 그리기
    ctx.strokeStyle = "#e5e7eb"
    ctx.beginPath()
    ctx.moveTo(50, 10)
    ctx.lineTo(50, chartHeight + 10)
    ctx.lineTo(chartWidth + 50, chartHeight + 10)
    ctx.stroke()

    // 정밀도 그래프
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.beginPath()

    metrics.forEach((metric, index) => {
      const x = 50 + (index / (metrics.length - 1 || 1)) * chartWidth
      const y = 10 + chartHeight - metric.precision * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 재현율 그래프
    ctx.strokeStyle = "#10b981"
    ctx.lineWidth = 2
    ctx.beginPath()

    metrics.forEach((metric, index) => {
      const x = 50 + (index / (metrics.length - 1 || 1)) * chartWidth
      const y = 10 + chartHeight - metric.recall * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // mAP 그래프
    ctx.strokeStyle = "#f59e0b"
    ctx.lineWidth = 2
    ctx.beginPath()

    metrics.forEach((metric, index) => {
      const x = 50 + (index / (metrics.length - 1 || 1)) * chartWidth
      const y = 10 + chartHeight - metric.mAP * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 레이블 그리기
    ctx.fillStyle = "#6b7280"
    ctx.font = "10px Arial"
    ctx.textAlign = "right"
    ctx.fillText("0", 45, chartHeight + 10)
    ctx.fillText("1.0", 45, 15)

    ctx.textAlign = "center"
    ctx.fillText("에폭", chartWidth / 2 + 50, chartHeight + 30)

    // 범례
    ctx.textAlign = "left"
    ctx.fillStyle = "#3b82f6"
    ctx.fillRect(chartWidth - 100, 15, 10, 10)
    ctx.fillStyle = "#6b7280"
    ctx.fillText("정밀도", chartWidth - 85, 23)

    ctx.fillStyle = "#10b981"
    ctx.fillRect(chartWidth - 100, 30, 10, 10)
    ctx.fillStyle = "#6b7280"
    ctx.fillText("재현율", chartWidth - 85, 38)

    ctx.fillStyle = "#f59e0b"
    ctx.fillRect(chartWidth - 100, 45, 10, 10)
    ctx.fillStyle = "#6b7280"
    ctx.fillText("mAP", chartWidth - 85, 53)
  }, [metrics])

  // 예상 완료 시간 계산
  const estimatedTimeRemaining = () => {
    if (!isTraining || progress === 0) return "계산 중..."

    const elapsedTime = metrics.length * 3 // 초 단위 (3초마다 메트릭 업데이트)
    const totalTime = (elapsedTime / progress) * 100
    const remainingTime = totalTime - elapsedTime

    if (remainingTime <= 0) return "완료 예정"

    const hours = Math.floor(remainingTime / 3600)
    const minutes = Math.floor((remainingTime % 3600) / 60)
    const seconds = Math.floor(remainingTime % 60)

    return `약 ${hours > 0 ? `${hours}시간 ` : ""}${minutes}분 ${seconds}초 남음`
  }

  return (
    <>
      <CardHeader>
        <CardTitle>학습 모니터링</CardTitle>
        <CardDescription>모델 학습 진행 상황을 실시간으로 모니터링합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 학습 상태 및 진행률 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">학습 상태</h3>
              <div className="flex items-center gap-2">
                {isTraining ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                    학습 중
                  </Badge>
                ) : progress === 100 ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    완료됨
                  </Badge>
                ) : progress > 0 ? (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    중단됨
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    대기 중
                  </Badge>
                )}

                {metrics.length > 0 && (
                  <span className="text-sm text-muted-foreground">에폭: {metrics.length}/100</span>
                )}
              </div>
            </div>

            {isTraining && (
              <div className="text-right">
                <div className="text-sm font-medium">예상 완료 시간</div>
                <div className="text-sm text-muted-foreground">{estimatedTimeRemaining()}</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>진행률</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </div>

        <Separator />

        {/* 학습 메트릭 및 로그 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">학습 메트릭</TabsTrigger>
            <TabsTrigger value="charts">차트</TabsTrigger>
            <TabsTrigger value="logs">로그</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4 pt-4">
            {metrics.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">손실</div>
                    <div className="text-2xl font-bold">{metrics[metrics.length - 1].loss.toFixed(4)}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">정밀도</div>
                    <div className="text-2xl font-bold">{metrics[metrics.length - 1].precision.toFixed(4)}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">재현율</div>
                    <div className="text-2xl font-bold">{metrics[metrics.length - 1].recall.toFixed(4)}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">mAP@0.5</div>
                    <div className="text-2xl font-bold">{metrics[metrics.length - 1].mAP.toFixed(4)}</div>
                  </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <div className="bg-muted px-4 py-2 font-medium">최근 에폭 메트릭</div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-2 text-left">에폭</th>
                          <th className="px-4 py-2 text-left">손실</th>
                          <th className="px-4 py-2 text-left">정밀도</th>
                          <th className="px-4 py-2 text-left">재현율</th>
                          <th className="px-4 py-2 text-left">mAP@0.5</th>
                          <th className="px-4 py-2 text-left">학습률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.slice(-5).map((metric) => (
                          <tr key={metric.epoch} className="border-t">
                            <td className="px-4 py-2">{metric.epoch}</td>
                            <td className="px-4 py-2">{metric.loss.toFixed(4)}</td>
                            <td className="px-4 py-2">{metric.precision.toFixed(4)}</td>
                            <td className="px-4 py-2">{metric.recall.toFixed(4)}</td>
                            <td className="px-4 py-2">{metric.mAP.toFixed(4)}</td>
                            <td className="px-4 py-2">{metric.learningRate.toFixed(6)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    메트릭 내보내기
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">학습이 시작되면 메트릭이 여기에 표시됩니다.</div>
            )}
          </TabsContent>

          <TabsContent value="charts" className="space-y-6 pt-4">
            {metrics.length > 0 ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">손실 추이</h3>
                  <div className="bg-muted/50 p-4 rounded-md h-[300px] flex items-center justify-center">
                    <canvas ref={lossChartRef} width={600} height={300} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">성능 메트릭 추이</h3>
                  <div className="bg-muted/50 p-4 rounded-md h-[300px] flex items-center justify-center">
                    <canvas ref={metricChartRef} width={600} height={300} />
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">학습이 시작되면 차트가 여기에 표시됩니다.</div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">학습 로그</h3>
                <Button variant="outline" size="sm" disabled={logs.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  로그 내보내기
                </Button>
              </div>

              <div className="rounded-md border">
                <ScrollArea className="h-[400px] p-4 font-mono text-sm">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="pb-1">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      학습이 시작되면 로그가 여기에 표시됩니다.
                    </div>
                  )}
                  <div ref={logsEndRef} />
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  )
}
