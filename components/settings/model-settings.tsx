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
import { AlertCircle, Download, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useSettingsApi, type ModelSettings as ModelSettingsType } from "@/lib/api/settings-api"

export default function ModelSettings() {
  const { modelSettings, isModelLoading, isModelTesting, updateModelSettings, loadModel } = useSettingsApi()

  // 로컬 상태로 모델 설정 관리
  const [localSettings, setLocalSettings] = useState<ModelSettingsType>({
    modelVersion: "yolov8",
    modelSize: "medium",
    customModelPath: "/models/custom_truck_model.pt",
    confidenceThreshold: 40,
    iouThreshold: 45,
    maxDetections: 100,
    enableGPU: true,
    enableBatchProcessing: true,
    batchSize: 4,
    enableTensorRT: false,
    enableQuantization: false,
    quantizationType: "int8",
  })

  // API에서 가져온 설정으로 로컬 상태 초기화
  useEffect(() => {
    if (modelSettings) {
      setLocalSettings(modelSettings)
    }
  }, [modelSettings])

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

  const handleLoadModel = async () => {
    await loadModel(localSettings)
  }

  // 설정 변경 시 자동 저장
  const handleSettingChange = async (settings?: Partial<ModelSettingsType>) => {
    const updatedSettings = settings || localSettings
    await updateModelSettings(updatedSettings)
  }

  return (
    <>
      <CardHeader>
        <CardTitle>YOLO 모델 설정</CardTitle>
        <CardDescription>객체 감지를 위한 YOLO 모델 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>모델 정보</AlertTitle>
          <AlertDescription>
            현재 로드된 모델: <Badge variant="outline">YOLOv8m</Badge>
            <div className="text-xs mt-1">마지막 로드: 2023-05-19 14:30:45</div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="modelVersion">모델 버전</Label>
            <Select
              value={localSettings.modelVersion}
              onValueChange={(value) => handleSelectChange("modelVersion", value)}
            >
              <SelectTrigger id="modelVersion">
                <SelectValue placeholder="모델 버전 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yolov5">YOLOv5</SelectItem>
                <SelectItem value="yolov7">YOLOv7</SelectItem>
                <SelectItem value="yolov8">YOLOv8</SelectItem>
                <SelectItem value="yolox">YOLOX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelSize">모델 크기</Label>
            <Select value={localSettings.modelSize} onValueChange={(value) => handleSelectChange("modelSize", value)}>
              <SelectTrigger id="modelSize">
                <SelectValue placeholder="모델 크기 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nano">Nano (가장 작음)</SelectItem>
                <SelectItem value="small">Small (작음)</SelectItem>
                <SelectItem value="medium">Medium (중간)</SelectItem>
                <SelectItem value="large">Large (큼)</SelectItem>
                <SelectItem value="xlarge">X-Large (가장 큼)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customModelPath">사용자 정의 모델 경로</Label>
          <div className="flex gap-2">
            <Input
              id="customModelPath"
              name="customModelPath"
              placeholder="/path/to/model.pt"
              value={localSettings.customModelPath}
              onChange={handleInputChange}
              onBlur={() => handleSettingChange()}
            />
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            사용자 정의 학습 모델의 파일 경로를 입력하세요. 비워두면 기본 모델이 사용됩니다.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">감지 파라미터</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="confidenceThreshold">신뢰도 임계값</Label>
              <span className="text-sm">{localSettings.confidenceThreshold}%</span>
            </div>
            <Slider
              id="confidenceThreshold"
              min={1}
              max={100}
              step={1}
              value={[localSettings.confidenceThreshold]}
              onValueChange={(value) => handleSliderChange("confidenceThreshold", value)}
              onValueCommit={() => handleSettingChange()}
            />
            <p className="text-xs text-muted-foreground">객체 감지 결과를 필터링하는 최소 신뢰도 임계값입니다.</p>
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
            <p className="text-xs text-muted-foreground">
              중복 감지를 제거하기 위한 IoU(Intersection over Union) 임계값입니다.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxDetections">최대 감지 수</Label>
              <span className="text-sm">{localSettings.maxDetections}</span>
            </div>
            <Slider
              id="maxDetections"
              min={1}
              max={300}
              step={1}
              value={[localSettings.maxDetections]}
              onValueChange={(value) => handleSliderChange("maxDetections", value)}
              onValueCommit={() => handleSettingChange()}
            />
            <p className="text-xs text-muted-foreground">한 프레임에서 감지할 최대 객체 수입니다.</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">성능 최적화</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableGPU">GPU 가속</Label>
              <p className="text-xs text-muted-foreground">GPU를 사용하여 모델 추론 속도를 향상시킵니다.</p>
            </div>
            <Switch
              id="enableGPU"
              checked={localSettings.enableGPU}
              onCheckedChange={(checked) => handleSwitchChange("enableGPU", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableBatchProcessing">배치 처리</Label>
              <p className="text-xs text-muted-foreground">여러 프레임을 배치로 처리하여 처리량을 증가시킵니다.</p>
            </div>
            <Switch
              id="enableBatchProcessing"
              checked={localSettings.enableBatchProcessing}
              onCheckedChange={(checked) => handleSwitchChange("enableBatchProcessing", checked)}
            />
          </div>

          {localSettings.enableBatchProcessing && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <div className="flex justify-between">
                <Label htmlFor="batchSize">배치 크기</Label>
                <span className="text-sm">{localSettings.batchSize}</span>
              </div>
              <Slider
                id="batchSize"
                min={1}
                max={16}
                step={1}
                value={[localSettings.batchSize]}
                onValueChange={(value) => handleSliderChange("batchSize", value)}
                onValueCommit={() => handleSettingChange()}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableTensorRT">TensorRT 최적화</Label>
              <p className="text-xs text-muted-foreground">NVIDIA TensorRT를 사용하여 추론 속도를 최적화합니다.</p>
            </div>
            <Switch
              id="enableTensorRT"
              checked={localSettings.enableTensorRT}
              onCheckedChange={(checked) => handleSwitchChange("enableTensorRT", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableQuantization">모델 양자화</Label>
              <p className="text-xs text-muted-foreground">모델 크기를 줄이고 추론 속도를 향상시킵니다.</p>
            </div>
            <Switch
              id="enableQuantization"
              checked={localSettings.enableQuantization}
              onCheckedChange={(checked) => handleSwitchChange("enableQuantization", checked)}
            />
          </div>

          {localSettings.enableQuantization && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <Label htmlFor="quantizationType">양자화 유형</Label>
              <Select
                value={localSettings.quantizationType}
                onValueChange={(value) => handleSelectChange("quantizationType", value)}
              >
                <SelectTrigger id="quantizationType">
                  <SelectValue placeholder="양자화 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="int8">INT8 (8비트)</SelectItem>
                  <SelectItem value="fp16">FP16 (16비트)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            모델 다운로드
          </Button>
          <Button className="flex-1" onClick={handleLoadModel} disabled={isModelTesting}>
            {isModelTesting ? (
              <>
                <div className="mr-2">모델 로드 중...</div>
                <Progress value={65} className="h-2 w-16" />
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                모델 로드
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </>
  )
}
