"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import OcrLogsTable from "./ocr-logs-table"
import OcrLogFilters from "./ocr-log-filters"
import OcrLogStats from "./ocr-log-stats"
import OcrLogDetails from "./ocr-log-details"
import OcrLogExport from "./ocr-log-export"
import { useToast } from "@/hooks/use-toast"
import type { OcrLogEntry, OcrLogFilter } from "@/types/logs"
import { Button } from "@/components/ui/button"
import { fetchOcrLogs, fetchOcrLogStats, exportOcrLogs, subscribeToNewLogs } from "@/lib/api/logs-api"

export default function OcrLogsView() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedLog, setSelectedLog] = useState<OcrLogEntry | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<OcrLogEntry[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const { toast } = useToast()

  // 기본 필터 설정
  const [filters, setFilters] = useState<OcrLogFilter>({
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
      to: new Date(),
    },
    numberQuery: "",
    minConfidence: 0,
    roiFilter: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  })

  // 로그 데이터 가져오기
  const fetchLogs = useCallback(
    async (currentFilters: OcrLogFilter) => {
      setIsLoading(true)
      try {
        const data = await fetchOcrLogs(currentFilters)
        setLogs(data)
      } catch (error) {
        console.error("로그 데이터 가져오기 오류:", error)
        toast({
          title: "데이터 로드 오류",
          description: "로그 데이터를 가져오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  // 통계 데이터 가져오기
  const fetchStats = useCallback(async () => {
    try {
      const data = await fetchOcrLogStats(filters.dateRange)
      setStats(data)
    } catch (error) {
      console.error("통계 데이터 가져오기 오류:", error)
      toast({
        title: "통계 데이터 로드 오류",
        description: "통계 데이터를 가져오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }, [filters.dateRange, toast])

  // 필터 변경 처리
  const handleFilterChange = (newFilters: Partial<OcrLogFilter>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    fetchLogs(updatedFilters)
  }

  // 로그 상세 정보 표시
  const handleViewDetails = (log: OcrLogEntry) => {
    setSelectedLog(log)
    setShowDetails(true)
  }

  // 로그 내보내기
  const handleExport = async (format: string) => {
    try {
      toast({
        title: "내보내기 시작",
        description: `${format.toUpperCase()} 형식으로 로그를 내보내는 중입니다.`,
      })

      await exportOcrLogs(format, filters)
    } catch (error) {
      console.error("로그 내보내기 오류:", error)
    }
  }

  // 실시간 로그 업데이트 구독
  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    if (activeTab === "all" && isPlaying) {
      unsubscribe = subscribeToNewLogs((newLog) => {
        setLogs((prevLogs) => [newLog, ...prevLogs])

        toast({
          title: "새 로그 입력",
          description: `새로운 OCR 로그가 추가되었습니다: ${newLog.recognizedNumber}`,
        })
      })
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [activeTab, isPlaying, toast])

  // 초기 데이터 로드
  useEffect(() => {
    fetchLogs(filters)
  }, [fetchLogs, filters])

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === "stats") {
      fetchStats()
    }
  }, [activeTab, fetchStats])

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">전체 로그</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          <Card>
            <OcrLogFilters filters={filters} onFilterChange={handleFilterChange} isLoading={isLoading} />
          </Card>

          <div className="flex justify-between items-center">
            <OcrLogExport onExport={handleExport} count={logs.length} logs={logs} />
            <Button variant={isPlaying ? "destructive" : "outline"} size="sm" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? "실시간 업데이트 중지" : "실시간 업데이트 시작"}
            </Button>
          </div>

          <Card>
            <OcrLogsTable logs={logs} isLoading={isLoading} onViewDetails={handleViewDetails} />
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <Card>
            {stats ? (
              <OcrLogStats logs={logs} dateRange={filters.dateRange} stats={stats} />
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">통계 데이터를 로드 중입니다...</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">로그 설정</h2>
            <p className="text-muted-foreground">로그 보관 기간 및 자동 삭제 설정을 관리합니다.</p>
            {/* 로그 설정 컴포넌트 추가 예정 */}
          </Card>
        </TabsContent>
      </Tabs>

      {/* 로그 상세 정보 다이얼로그 */}
      {selectedLog && <OcrLogDetails log={selectedLog} open={showDetails} onOpenChange={setShowDetails} />}
    </div>
  )
}
