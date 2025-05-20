"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { RoiData } from "@/types/roi"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, RefreshCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RoiPropertiesProps {
  roi: RoiData
  onUpdate: (roi: RoiData) => void
}

export default function RoiProperties({ roi, onUpdate }: RoiPropertiesProps) {
  const [localRoi, setLocalRoi] = useState<RoiData>(roi)
  const [activeTab, setActiveTab] = useState("basic")

  // Update local state when selected ROI changes
  useEffect(() => {
    setLocalRoi(roi)
  }, [roi])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setLocalRoi({
      ...localRoi,
      [name]: value,
    })
  }

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setLocalRoi({
      ...localRoi,
      [name]: checked,
    })
  }

  // Handle action switch changes
  const handleActionChange = (name: string, checked: boolean) => {
    setLocalRoi({
      ...localRoi,
      actions: {
        ...localRoi.actions,
        [name]: checked,
      },
    })
  }

  // Handle slider changes
  const handleSliderChange = (name: string, value: number[]) => {
    setLocalRoi({
      ...localRoi,
      [name]: value[0],
    })
  }

  // Handle color change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalRoi({
      ...localRoi,
      color: e.target.value,
    })
  }

  // Apply changes
  const applyChanges = () => {
    onUpdate(localRoi)
  }

  // Reset changes
  const resetChanges = () => {
    setLocalRoi(roi)
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">기본</TabsTrigger>
            <TabsTrigger value="actions">동작</TabsTrigger>
            <TabsTrigger value="advanced">고급</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" name="name" value={localRoi.name} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                value={localRoi.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">색상</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={localRoi.color}
                  onChange={handleColorChange}
                  className="w-12 h-8 p-1"
                />
                <Input value={localRoi.color} onChange={handleColorChange} className="flex-1" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">활성화</Label>
              <Switch
                id="enabled"
                checked={localRoi.enabled}
                onCheckedChange={(checked) => handleSwitchChange("enabled", checked)}
              />
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="detectTrucks">트럭 감지</Label>
                <p className="text-xs text-muted-foreground">이 영역에서 트럭을 감지합니다.</p>
              </div>
              <Switch
                id="detectTrucks"
                checked={localRoi.actions.detectTrucks}
                onCheckedChange={(checked) => handleActionChange("detectTrucks", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="performOcr">OCR 수행</Label>
                <p className="text-xs text-muted-foreground">감지된 트럭에서 숫자를 인식합니다.</p>
              </div>
              <Switch
                id="performOcr"
                checked={localRoi.actions.performOcr}
                onCheckedChange={(checked) => handleActionChange("performOcr", checked)}
                disabled={!localRoi.actions.detectTrucks}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sendToPLC">PLC로 전송</Label>
                <p className="text-xs text-muted-foreground">인식된 숫자를 PLC로 전송합니다.</p>
              </div>
              <Switch
                id="sendToPLC"
                checked={localRoi.actions.sendToPLC}
                onCheckedChange={(checked) => handleActionChange("sendToPLC", checked)}
                disabled={!localRoi.actions.performOcr && !localRoi.actions.detectTrucks}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="triggerAlarm">알람 트리거</Label>
                <p className="text-xs text-muted-foreground">트럭이 감지되면 알람을 트리거합니다.</p>
              </div>
              <Switch
                id="triggerAlarm"
                checked={localRoi.actions.triggerAlarm}
                onCheckedChange={(checked) => handleActionChange("triggerAlarm", checked)}
                disabled={!localRoi.actions.detectTrucks}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="minDetectionTime">최소 감지 시간 (초)</Label>
                <span className="text-sm">{localRoi.minDetectionTime}초</span>
              </div>
              <Slider
                id="minDetectionTime"
                min={0}
                max={10}
                step={0.5}
                value={[localRoi.minDetectionTime]}
                onValueChange={(value) => handleSliderChange("minDetectionTime", value)}
              />
              <p className="text-xs text-muted-foreground">트럭이 이 시간 동안 영역 내에 있어야 동작이 트리거됩니다.</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>영역 정보</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>유형:</div>
                  <div className="font-medium">{localRoi.type === "rectangle" ? "사각형" : "다각형"}</div>
                  <div>점 개수:</div>
                  <div className="font-medium">{localRoi.points.length}</div>
                  {localRoi.type === "rectangle" && localRoi.points.length === 2 && (
                    <>
                      <div>너비:</div>
                      <div className="font-medium">{Math.abs(localRoi.points[1].x - localRoi.points[0].x)}px</div>
                      <div>높이:</div>
                      <div className="font-medium">{Math.abs(localRoi.points[1].y - localRoi.points[0].y)}px</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={resetChanges}>
            <RefreshCw className="h-4 w-4 mr-2" />
            초기화
          </Button>
          <Button size="sm" onClick={applyChanges}>
            <Check className="h-4 w-4 mr-2" />
            적용
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
