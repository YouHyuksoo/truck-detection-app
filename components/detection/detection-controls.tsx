"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Settings } from "lucide-react"

interface DetectionControlsProps {
  onDetectionToggle: (enabled: boolean) => void
  onOcrToggle: (enabled: boolean) => void
  onConfidenceChange: (value: number) => void
  detectionEnabled: boolean
  ocrEnabled: boolean
  confidenceThreshold: number
}

export default function DetectionControls({
  onDetectionToggle,
  onOcrToggle,
  onConfidenceChange,
  detectionEnabled,
  ocrEnabled,
  confidenceThreshold,
}: DetectionControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <Label htmlFor="detection-toggle">객체 감지</Label>
          <span className="text-xs text-muted-foreground">트럭 객체 감지 활성화</span>
        </div>
        <Switch id="detection-toggle" checked={detectionEnabled} onCheckedChange={onDetectionToggle} />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <Label htmlFor="ocr-toggle">OCR 처리</Label>
          <span className="text-xs text-muted-foreground">숫자 인식 활성화</span>
        </div>
        <Switch id="ocr-toggle" checked={ocrEnabled} onCheckedChange={onOcrToggle} disabled={!detectionEnabled} />
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="confidence-threshold">감지 신뢰도 임계값</Label>
          <span className="text-sm">{confidenceThreshold}%</span>
        </div>
        <Slider
          id="confidence-threshold"
          min={0}
          max={100}
          step={1}
          value={[confidenceThreshold]}
          onValueChange={(value) => onConfidenceChange(value[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>낮음</span>
          <span>높음</span>
        </div>
      </div>

      <Separator />

      <Button variant="outline" className="w-full">
        <Settings className="h-4 w-4 mr-2" />
        고급 설정
      </Button>
    </div>
  )
}
