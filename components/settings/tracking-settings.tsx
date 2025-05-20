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
import { AlertCircle, Check, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useSettingsApi, type TrackingSettings } from "@/lib/api/settings-api"

export default function TrackingSettings() {
  const { trackingSettings, isTrackingLoading, isTrackingTesting, updateTrackingSettings, testTracking } =
    useSettingsApi()

  // 로컬 상태로 추적 설정 관리
  const [localSettings, setLocalSettings] = useState<TrackingSettings>({
    algorithm: "sort",
    maxDisappeared: 30,
    maxDistance: 50,
    minConfidence: 30,
    iouThreshold: 40,
    enableKalmanFilter: true,
    enableDirectionDetection: true,
    directionThreshold: 50,
    enableSizeFiltering: true,
    minWidth: 50,
    minHeight: 30,
    maxWidth: 500,
    maxHeight: 300,
    trackingMode: "all",
  })

  // API에서 가져온 설정으로 로컬 상태 초기화
  useEffect(() => {
    if (trackingSettings) {
      setLocalSettings(trackingSettings)
    }
  }, [trackingSettings])

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
    handleSettingChange({ [name]: checked })
  }

  const handleSelectChange = (name: string, value: string) => {
    setLocalSettings({
      ...localSettings,
      [name]: value,
    })
    handleSettingChange({ [name]: value })
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setLocalSettings({
      ...localSettings,
      [name]: value[0],
    })
  }

  const handleRadioChange = (name: string, value: string) => {
    setLocalSettings({
      ...localSettings,
      [name]: value,
    })
    handleSettingChange({ [name]: value })
  }

  const handleTestTracking = async () => {
    await testTracking(localSettings)
  }

  // 설정 변경 시 자동 저장
  const handleSettingChange = async (settings?: Partial<TrackingSettings>) => {
    const updatedSettings = settings || localSettings
    await updateTrackingSettings(updatedSettings)
  }

  return (
    <>
      <CardHeader>
        <CardTitle>객체 추적 설정</CardTitle>
        <CardDescription>트럭 객체 추적을 위한 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>추적 알고리즘 정보</AlertTitle>
          <AlertDescription>
            현재 사용 중인 추적 알고리즘: <Badge variant="outline">SORT</Badge>
            <div className="text-xs mt-1">추적 ID 할당 방식: 고유 ID 자동 생성</div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="algorithm">추적 알고리즘</Label>
            <Select value={localSettings.algorithm} onValueChange={(value) => handleSelectChange("algorithm", value)}>
              <SelectTrigger id="algorithm">
                <SelectValue placeholder="알고리즘 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sort">SORT</SelectItem>
                <SelectItem value="deepsort">DeepSORT</SelectItem>
                <SelectItem value="bytetrack">ByteTrack</SelectItem>
                <SelectItem value="custom">사용자 정의</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingMode">추적 모드</Label>
            <RadioGroup
              value={localSettings.trackingMode}
              onValueChange={(value) => handleRadioChange("trackingMode", value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal">
                  모든 객체 추적
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="roi_only" id="roi_only" />
                <Label htmlFor="roi_only" className="font-normal">
                  관심 영역 내 객체만 추적
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high_confidence" id="high_confidence" />
                <Label htmlFor="high_confidence" className="font-normal">
                  높은 신뢰도 객체만 추적
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">추적 파라미터</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxDisappeared">최대 사라짐 프레임</Label>
              <span className="text-sm">{localSettings.maxDisappeared} 프레임</span>
            </div>
            <Slider
              id="maxDisappeared"
              min={1}
              max={100}
              step={1}
              value={[localSettings.maxDisappeared]}
              onValueChange={(value) => handleSliderChange("maxDisappeared", value)}
              onValueCommit={() => handleSettingChange()}
            />
            <p className="text-xs text-muted-foreground">객체가 이 프레임 수 동안 감지되지 않으면 추적을 중단합니다.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxDistance">최대 이동 거리</Label>
              <span className="text-sm">{localSettings.maxDistance} 픽셀</span>
            </div>
            <Slider
              id="maxDistance"
              min={10}
              max={200}
              step={1}
              value={[localSettings.maxDistance]}
              onValueChange={(value) => handleSliderChange("maxDistance", value)}
              onValueCommit={() => handleSettingChange()}
            />
            <p className="text-xs text-muted-foreground">
              프레임 간 객체의 최대 이동 거리입니다. 이 값을 초과하면 다른 객체로 간주합니다.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="minConfidence">최소 신뢰도</Label>
              <span className="text-sm">{localSettings.minConfidence}%</span>
            </div>
            <Slider
              id="minConfidence"
              min={1}
              max={100}
              step={1}
              value={[localSettings.minConfidence]}
              onValueChange={(value) => handleSliderChange("minConfidence", value)}
              onValueCommit={() => handleSettingChange()}
            />
            <p className="text-xs text-muted-foreground">추적을 시작하기 위한 최소 객체 감지 신뢰도입니다.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="iouThreshold">IoU 임계값</Label>
              <span className="text-sm">{localSettings.iouThreshold}%</span>
            </div>
            <Slider
              id="iouThreshold"
              min={1}
              max={100}
              step={1}
              value={[localSettings.iouThreshold]}
              onValueChange={(value) => handleSliderChange("iouThreshold", value)}
              onValueCommit={() => handleSettingChange()}
            />
            <p className="text-xs text-muted-foreground">객체 매칭을 위한 IoU(Intersection over Union) 임계값입니다.</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">고급 설정</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableKalmanFilter">칼만 필터 사용</Label>
              <p className="text-xs text-muted-foreground">객체 위치 예측을 위한 칼만 필터를 사용합니다.</p>
            </div>
            <Switch
              id="enableKalmanFilter"
              checked={localSettings.enableKalmanFilter}
              onCheckedChange={(checked) => handleSwitchChange("enableKalmanFilter", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableDirectionDetection">이동 방향 감지</Label>
              <p className="text-xs text-muted-foreground">객체의 이동 방향(좌→우, 우→좌)을 감지합니다.</p>
            </div>
            <Switch
              id="enableDirectionDetection"
              checked={localSettings.enableDirectionDetection}
              onCheckedChange={(checked) => handleSwitchChange("enableDirectionDetection", checked)}
            />
          </div>

          {localSettings.enableDirectionDetection && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <div className="flex justify-between">
                <Label htmlFor="directionThreshold">방향 감지 임계값</Label>
                <span className="text-sm">{localSettings.directionThreshold} 픽셀</span>
              </div>
              <Slider
                id="directionThreshold"
                min={10}
                max={200}
                step={1}
                value={[localSettings.directionThreshold]}
                onValueChange={(value) => handleSliderChange("directionThreshold", value)}
                onValueCommit={() => handleSettingChange()}
              />
              <p className="text-xs text-muted-foreground">방향을 결정하기 위한 최소 이동 거리입니다.</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableSizeFiltering">크기 필터링</Label>
              <p className="text-xs text-muted-foreground">특정 크기 범위의 객체만 추적합니다.</p>
            </div>
            <Switch
              id="enableSizeFiltering"
              checked={localSettings.enableSizeFiltering}
              onCheckedChange={(checked) => handleSwitchChange("enableSizeFiltering", checked)}
            />
          </div>

          {localSettings.enableSizeFiltering && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minWidth">최소 너비</Label>
                  <div className="flex items-center">
                    <Input
                      id="minWidth"
                      name="minWidth"
                      type="number"
                      value={localSettings.minWidth}
                      onChange={handleInputChange}
                      onBlur={() => handleSettingChange()}
                      className="w-full"
                    />
                    <span className="ml-2 text-sm">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minHeight">최소 높이</Label>
                  <div className="flex items-center">
                    <Input
                      id="minHeight"
                      name="minHeight"
                      type="number"
                      value={localSettings.minHeight}
                      onChange={handleInputChange}
                      onBlur={() => handleSettingChange()}
                      className="w-full"
                    />
                    <span className="ml-2 text-sm">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxWidth">최대 너비</Label>
                  <div className="flex items-center">
                    <Input
                      id="maxWidth"
                      name="maxWidth"
                      type="number"
                      value={localSettings.maxWidth}
                      onChange={handleInputChange}
                      onBlur={() => handleSettingChange()}
                      className="w-full"
                    />
                    <span className="ml-2 text-sm">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxHeight">최대 높이</Label>
                  <div className="flex items-center">
                    <Input
                      id="maxHeight"
                      name="maxHeight"
                      type="number"
                      value={localSettings.maxHeight}
                      onChange={handleInputChange}
                      onBlur={() => handleSettingChange()}
                      className="w-full"
                    />
                    <span className="ml-2 text-sm">px</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              handleSettingChange({
                algorithm: "sort",
                maxDisappeared: 30,
                maxDistance: 50,
                minConfidence: 30,
                iouThreshold: 40,
                enableKalmanFilter: true,
                enableDirectionDetection: true,
                directionThreshold: 50,
                enableSizeFiltering: true,
                minWidth: 50,
                minHeight: 30,
                maxWidth: 500,
                maxHeight: 300,
                trackingMode: "all",
              })
            }
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            기본값으로 복원
          </Button>
          <Button className="flex-1" onClick={handleTestTracking} disabled={isTrackingTesting}>
            {isTrackingTesting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {isTrackingTesting ? "테스트 중..." : "추적 테스트"}
          </Button>
        </div>
      </CardContent>
    </>
  )
}
