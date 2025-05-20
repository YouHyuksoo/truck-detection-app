"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, FileJson } from "lucide-react"
import type { OcrLogEntry } from "@/types/logs"

interface OcrLogExportProps {
  onExport: (format: string) => void
  count: number
  logs: OcrLogEntry[]
}

export default function OcrLogExport({ onExport, count, logs }: OcrLogExportProps) {
  // 파일 내보내기 핸들러
  const handleExport = (format: string) => {
    // 기존 onExport 콜백 호출 (UI 업데이트용)
    onExport(format)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          내보내기 ({count}개)
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="h-4 w-4 mr-2" />
          CSV 형식으로 내보내기
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel 형식으로 내보내기
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="h-4 w-4 mr-2" />
          JSON 형식으로 내보내기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
