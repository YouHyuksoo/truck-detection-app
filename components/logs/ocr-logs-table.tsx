"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ExternalLink, CheckCircle, XCircle, Send, Clock } from "lucide-react"
import type { OcrLogEntry } from "@/types/logs"
import { Skeleton } from "@/components/ui/skeleton"

interface OcrLogsTableProps {
  logs: OcrLogEntry[]
  isLoading: boolean
  onViewDetails: (log: OcrLogEntry) => void
}

export default function OcrLogsTable({ logs, isLoading, onViewDetails }: OcrLogsTableProps) {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(logs.length / pageSize)

  const paginatedLogs = logs.slice((page - 1) * pageSize, page * pageSize)

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  if (isLoading) {
    return <TableSkeleton />
  }

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">조회된 로그가 없습니다.</p>
        <p className="text-sm text-muted-foreground mt-1">필터 조건을 변경하여 다시 시도하세요.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">날짜/시간</TableHead>
              <TableHead>인식된 숫자</TableHead>
              <TableHead>신뢰도</TableHead>
              <TableHead>관심영역</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>PLC 전송</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{formatDate(log.timestamp)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded overflow-hidden">
                      <img
                        src={log.imageUrl || "/placeholder.svg"}
                        alt={`OCR 이미지 ${log.recognizedNumber}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-mono">{log.recognizedNumber}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={log.confidence > 80 ? "default" : log.confidence > 60 ? "outline" : "secondary"}>
                    {log.confidence}%
                  </Badge>
                </TableCell>
                <TableCell>{log.roiName}</TableCell>
                <TableCell>
                  {log.status === "success" ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>성공</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>실패</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {log.sentToPLC ? (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Send className="h-4 w-4" />
                      <span>전송됨</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>대기중</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(log)}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    상세
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          총 <span className="font-medium">{logs.length}</span>개 항목 중{" "}
          <span className="font-medium">{(page - 1) * pageSize + 1}</span>-
          <span className="font-medium">{Math.min(page * pageSize, logs.length)}</span> 표시
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          <div className="text-sm">
            {page} / {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">날짜/시간</TableHead>
            <TableHead>인식된 숫자</TableHead>
            <TableHead>신뢰도</TableHead>
            <TableHead>관심영역</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>PLC 전송</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-16 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
