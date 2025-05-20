"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, RefreshCw } from "lucide-react"
import { useSettingsApi, type CameraSettings } from "@/lib/api/settings-api"

export default function CameraSettings() {
  const [cameraTab, setCameraTab] = useState("rtsp")

  const {
    cameraSettings,
    isCameraLoading,
    isCameraTesting,
    isCameraConnecting,
    updateCameraSettings,
    testCameraConnection,
    connectCamera,
  } = useSettingsApi()

  // 로컬 상태로 카메라 설정 관리
  const [localSettings, setLocalSettings] = useState<CameraSettings>({
    rtspUrl: "",
    ipCameraUrl: "",
    usbCameraIndex: "0",
    resolution: "1280x720",
    fps: 30,
    enableAutoReconnect: true,
    reconnectInterval: 5,
    bufferSize: 10,
  })

  // API에서 가져온 설정으로 로컬 상태 초기화
  useEffect(() => {
    if (cameraSettings) {
      setLocalSettings(cameraSettings)
    }
  }, [cameraSettings])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocalSettings({
      ...localSettings,
      [name]: value,
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setLocalSettings({
      ...localSettings,
      [name]: checked,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setLocalSettings({
      ...localSettings,
      [name]: value,
    })
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setLocalSettings({
      ...localSettings,
      [name]: value[0],
    })
  }

  const handleTestConnection = async () => {
    await testCameraConnection(localSettings)
  }

  const handleConnect = async () => {
    await connectCamera(localSettings)
  }

  // 설정 변경 시 자동 저장
  const handleSettingChange = async () => {
    await updateCameraSettings(localSettings)
  }

  return (
    <>
      <CardHeader>
        <CardTitle>카메라 설정</CardTitle>
        <CardDescription>비디오 스트림 소스 및 카메라 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={cameraTab} onValueChange={setCameraTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rtsp">RTSP 카메라</TabsTrigger>
            <TabsTrigger value="ip">IP 카메라</TabsTrigger>
            <TabsTrigger value="usb">USB 카메라</TabsTrigger>
          </TabsList>

          <TabsContent value="rtsp" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="rtspUrl">RTSP URL</Label>
              <Input
                id="rtspUrl"
                name="rtspUrl"
                placeholder="rtsp://username:password@ip:port/stream"
                value={localSettings.rtspUrl}
                onChange={handleInputChange}
                onBlur={handleSettingChange}
              />
              <p className="text-xs text-muted-foreground">예시: rtsp://admin:admin123@192.168.1.100:554/stream1</p>
            </div>
          </TabsContent>

          <TabsContent value="ip" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="ipCameraUrl">IP 카메라 URL</Label>
              <Input
                id="ipCameraUrl"
                name="ipCameraUrl"
                placeholder="http://ip:port/video"
                value={localSettings.ipCameraUrl}
                onChange={handleInputChange}
                onBlur={handleSettingChange}
              />
              <p className="text-xs text-muted-foreground">예시: http://192.168.1.100:8080/video</p>
            </div>
          </TabsContent>

          <TabsContent value="usb" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="usbCameraIndex">USB 카메라 인덱스</Label>
              <Input
                id="usbCameraIndex"
                name="usbCameraIndex"
                placeholder="0"
                value={localSettings.usbCameraIndex}
                onChange={handleInputChange}
                onBlur={handleSettingChange}
              />
              <p className="text-xs text-muted-foreground">
                일반적으로 첫 번째 카메라는 0, 두 번째 카메라는 1 등으로 지정됩니다.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="resolution">해상도</Label>
            <Select
              value={localSettings.resolution}
              onValueChange={(value) => {
                handleSelectChange("resolution", value)
                handleSettingChange()
              }}
            >
              <SelectTrigger id="resolution">
                <SelectValue placeholder="해상도 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="640x480">640x480 (VGA)</SelectItem>
                <SelectItem value="800x600">800x600 (SVGA)</SelectItem>
                <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                <SelectItem value="2560x1440">2560x1440 (QHD)</SelectItem>
                <SelectItem value="3840x2160">3840x2160 (4K UHD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="fps">프레임 레이트 (FPS)</Label>
              <span className="text-sm">{localSettings.fps} FPS</span>
            </div>
            <Slider
              id="fps"
              min={1}
              max={60}
              step={1}
              value={[localSettings.fps]}
              onValueChange={(value) => handleSliderChange("fps", value)}
              onValueCommit={() => handleSettingChange()}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>낮음 (1)</span>
              <span>높음 (60)</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">고급 설정</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableAutoReconnect">자동 재연결</Label>
              <p className="text-xs text-muted-foreground">연결이 끊어졌을 때 자동으로 재연결을 시도합니다.</p>
            </div>
            <Switch
              id="enableAutoReconnect"
              checked={localSettings.enableAutoReconnect}
              onCheckedChange={(checked) => {
                handleSwitchChange("enableAutoReconnect", checked)
                handleSettingChange()
              }}
            />
          </div>

          {localSettings.enableAutoReconnect && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <div className="flex justify-between">
                <Label htmlFor="reconnectInterval">재연결 간격 (초)</Label>
                <span className="text-sm">{localSettings.reconnectInterval}초</span>
              </div>
              <Slider
                id="reconnectInterval"
                min={1}
                max={30}
                step={1}
                value={[localSettings.reconnectInterval]}
                onValueChange={(value) => handleSliderChange("reconnectInterval", value)}
                onValueCommit={() => handleSettingChange()}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="bufferSize">버퍼 크기 (프레임)</Label>
              <span className="text-sm">{localSettings.bufferSize} 프레임</span>
            </div>
            <Slider
              id="bufferSize"
              min={1}
              max={30}
              step={1}
              value={[localSettings.bufferSize]}
              onValueChange={(value) => handleSliderChange("bufferSize", value)}
              onValueCommit={() => handleSettingChange()}
            />
            <p className="text-xs text-muted-foreground">
              버퍼 크기가 클수록 지연이 증가하지만 영상이 더 안정적입니다.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1" onClick={handleTestConnection} disabled={isCameraTesting}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isCameraTesting ? "animate-spin" : ""}`} />
            {isCameraTesting ? "테스트 중..." : "연결 테스트"}
          </Button>
          <Button className="flex-1" onClick={handleConnect} disabled={isCameraConnecting}>
            <Play className="h-4 w-4 mr-2" />
            {isCameraConnecting ? "연결 중..." : "카메라 연결"}
          </Button>
        </div>
      </CardContent>
    </>
  )
}
