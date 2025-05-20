"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Send, Clock, Download, Copy, Truck } from "lucide-react"
import type { OcrLogEntry } from "@/types/logs"
import { useToast } from "@/hooks/use-toast"

interface OcrLogDetailsProps {
  log: OcrLogEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OcrLogDetails({ log, open, onOpenChange }: OcrLogDetailsProps) {
  const { toast } = useToast()

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

  // 클립보드에 복사
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "클립보드에 복사됨",
      description: `텍스트가 클립보드에 복사되었습니다.`,
    })
  }

  // 이미지 다운로드
  const downloadImage = () => {
    toast({
      title: "이미지 다운로드",
      description: "이미지 다운로드가 시작되었습니다.",
    })

    // 이미지 URL에서 파일 가져오기
    fetch(log.imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        // 파일명 생성
        const timestamp = new Date(log.timestamp).toISOString().replace(/[:.]/g, "-")
        const filename = `ocr_image_${log.recognizedNumber}_${timestamp}.jpg`

        // 다운로드 링크 생성
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", filename)

        // 링크 클릭 이벤트 트리거
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "이미지 다운로드 완료",
          description: "이미지가 성공적으로 다운로드되었습니다.",
        })
      })
      .catch((error) => {
        console.error("Image download error:", error)
        toast({
          title: "다운로드 오류",
          description: "이미지 다운로드 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>OCR 로그 상세 정보</DialogTitle>
          <DialogDescription>{formatDate(log.timestamp)}에 처리된 OCR 로그 상세 정보입니다.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 이미지 섹션 */}
          <div className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <img
                src={log.imageUrl || "/placeholder.svg"}
                alt={`OCR 이미지 ${log.recognizedNumber}`}
                className="w-full h-auto"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={downloadImage}>
                <Download className="h-4 w-4 mr-2" />
                이미지 다운로드
              </Button>
            </div>
          </div>

          {/* 상세 정보 섹션 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">인식된 숫자</h3>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-mono font-bold">{log.recognizedNumber}</div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(log.recognizedNumber)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">신뢰도</h3>
                <Badge
                  variant={log.confidence > 80 ? "default" : log.confidence > 60 ? "outline" : "secondary"}
                  className="text-lg"
                >
                  {log.confidence}%
                </Badge>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium">처리 시간</h3>
                <div className="text-lg">{log.processingTime}ms</div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium">상태</h3>
                {log.status === "success" ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-lg">성공</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="text-lg">실패</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium">PLC 전송</h3>
                {log.sentToPLC ? (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Send className="h-5 w-5" />
                    <span className="text-lg">전송됨</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span className="text-lg">대기중</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">관심영역</h3>
              <div className="text-lg">{log.roiName}</div>
            </div>

            {log.truckId && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">트럭 ID</h3>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    <div className="text-lg">{log.truckId}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
