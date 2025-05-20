"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Camera, FileText, Zap, Truck, Target } from "lucide-react"
import CameraSettings from "./camera-settings"
import ModelSettings from "./model-settings"
import OcrSettings from "./ocr-settings"
import TrackingSettings from "./tracking-settings"
import SystemSettings from "./system-settings"
import { Button } from "@/components/ui/button"
import { useSettingsApi } from "@/lib/api/settings-api"

export default function SettingsLayout() {
  const [activeTab, setActiveTab] = useState("camera")

  const { isSaving, isResetting, saveAllSettings, resetSettings } = useSettingsApi()

  const handleSaveSettings = async () => {
    await saveAllSettings()
  }

  const handleResetSettings = async () => {
    await resetSettings()
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border rounded-lg p-1 mb-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span>카메라</span>
            </TabsTrigger>
            <TabsTrigger value="model" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>YOLO 모델</span>
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>OCR 엔진</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>객체 추적</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>시스템</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <Card className="border rounded-lg">
          <TabsContent value="camera" className="m-0">
            <CameraSettings />
          </TabsContent>

          <TabsContent value="model" className="m-0">
            <ModelSettings />
          </TabsContent>

          <TabsContent value="ocr" className="m-0">
            <OcrSettings />
          </TabsContent>

          <TabsContent value="tracking" className="m-0">
            <TrackingSettings />
          </TabsContent>

          <TabsContent value="system" className="m-0">
            <SystemSettings />
          </TabsContent>
        </Card>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleResetSettings} disabled={isResetting}>
          {isResetting ? "초기화 중..." : "기본값으로 복원"}
        </Button>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "저장 중..." : "설정 저장"}
        </Button>
      </div>
    </div>
  )
}
