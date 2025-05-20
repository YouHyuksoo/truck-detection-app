"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OcrResult {
  id: number
  timestamp: string
  number: string
  confidence: number
  imageUrl: string
}

interface OcrResultsListProps {
  results: OcrResult[]
}

export default function OcrResultsList({ results }: OcrResultsListProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "클립보드에 복사됨",
      description: `번호 ${text}가 클립보드에 복사되었습니다.`,
    })
  }

  if (results.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">감지된 OCR 결과가 없습니다.</div>
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="divide-y">
        {results.map((result) => (
          <div key={result.id} className="p-3 hover:bg-muted/50">
            <div className="flex items-start gap-3">
              <div className="h-20 w-30 rounded overflow-hidden flex-shrink-0">
                <img
                  src={result.imageUrl || "/placeholder.svg"}
                  alt={`OCR 결과 ${result.number}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="font-medium truncate">{result.number}</div>
                  <Badge variant="outline" className="ml-2">
                    {result.confidence.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{result.timestamp}</div>
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => copyToClipboard(result.number)}>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    복사
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    상세
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
