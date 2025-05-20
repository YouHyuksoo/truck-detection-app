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
import { AlertCircle, Check, Download, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useSettingsApi, type OcrSettings } from "@/lib/api/settings-api"

export default function OcrSettings() {
  const { ocrSettings, isOcrLoading, isOcrTesting, updateOcrSettings, testOcr } = useSettingsApi()

  // 로컬 상태로 OCR 설정 관리
  const [localSettings, setLocalSettings] = useState<OcrSettings>({
    engine: "tesseract",
    language: "kor+eng",
    customModelPath: "",
    confidenceThreshold: 60,
    enablePreprocessing: true,
    preprocessingSteps: ["grayscale", "threshold", "noise_removal"],
    enableAutoRotation: true,
    maxRotationAngle: 15,
    enableDigitsOnly: true,
    minDigits: 3,
    maxDigits: 4,
    enableWhitelist: true,
    whitelist: "0123456789",
    enableBlacklist: false,
    blacklist: "",
    enableGPU: true,
  })

  // API에서 가져온 설정으로 로컬 상태 초기화
  useEffect(() => {
    if (ocrSettings) {
      setLocalSettings(ocrSettings)
    }
  }, [ocrSettings])

  const preprocessingOptions = [
    { id: "grayscale", label: "그레이스케일 변환" },
    { id: "threshold", label: "이진화 (임계값)" },
    { id: "adaptive_threshold", label: "적응형 이진화" },
    { id: "blur", label: "블러 처리" },
    { id: "noise_removal", label: "노이즈 제거" },
    { id: "dilation", label: "팽창" },
    { id: "erosion", label: "침식" },
    { id: "sharpening", label: "선명화" },
  ]

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

  const handlePreprocessingChange = (id: string, checked: boolean) => {
    let newSteps: string[]
    if (checked) {
      newSteps = [...localSettings.preprocessingSteps, id]
    } else {
      newSteps = localSettings.preprocessingSteps.filter((step) => step !== id)
    }

    setLocalSettings({
      ...localSettings,
      preprocessingSteps: newSteps,
    })

    handleSettingChange({ preprocessingSteps: newSteps })
  }

  const handleTestOcr = async () => {
    await testOcr(localSettings)
  }

  // 설정 변경 시 자동 저장
  const handleSettingChange = async (settings?: Partial<OcrSettings>) => {
    const updatedSettings = settings || localSettings
    await updateOcrSettings(updatedSettings)
  }

  return (
    <>
      <CardHeader>
        <CardTitle>OCR 엔진 설정</CardTitle>
        <CardDescription>텍스트 인식을 위한 OCR 엔진 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>OCR 엔진 정보</AlertTitle>
          <AlertDescription>
            현재 사용 중인 OCR 엔진: <Badge variant="outline">Tesseract 5.0.0</Badge>
            <div className="text-xs mt-1">지원 언어: 한국어, 영어, 숫자</div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="engine">OCR 엔진</Label>
            <Select value={localSettings.engine} onValueChange={(value) => handleSelectChange("engine", value)}>
              <SelectTrigger id="engine">
                <SelectValue placeholder="OCR 엔진 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tesseract">Tesseract OCR</SelectItem>
                <SelectItem value="easyocr">EasyOCR</SelectItem>
                <SelectItem value="paddleocr">PaddleOCR</SelectItem>
                <SelectItem value="custom">사용자 정의 모델</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">언어 설정</Label>
            <Select value={localSettings.language} onValueChange={(value) => handleSelectChange("language", value)}>
              <SelectTrigger id="language">
                <SelectValue placeholder="언어 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eng">영어</SelectItem>
                <SelectItem value="kor">한국어</SelectItem>
                <SelectItem value="kor+eng">한국어 + 영어</SelectItem>
                <SelectItem value="digits">숫자만</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {localSettings.engine === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="customModelPath">사용자 정의 모델 경로</Label>
            <Input
              id="customModelPath"
              name="customModelPath"
              placeholder="/path/to/ocr_model"
              value={localSettings.customModelPath}
              onChange={handleInputChange}
              onBlur={() => handleSettingChange()}
            />
            <p className="text-xs text-muted-foreground">사용자 정의 OCR 모델의 파일 경로를 입력하세요.</p>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">인식 설정</h3>

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
            <p className="text-xs text-muted-foreground">OCR 결과를 필터링하는 최소 신뢰도 임계값입니다.</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableDigitsOnly">숫자만 인식</Label>
              <p className="text-xs text-muted-foreground">숫자만 인식하도록 제한합니다.</p>
            </div>
            <Switch
              id="enableDigitsOnly"
              checked={localSettings.enableDigitsOnly}
              onCheckedChange={(checked) => handleSwitchChange("enableDigitsOnly", checked)}
            />
          </div>

          {localSettings.enableDigitsOnly && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minDigits">최소 자릿수</Label>
                  <Select
                    value={localSettings.minDigits.toString()}
                    onValueChange={(value) => handleSelectChange("minDigits", value)}
                  >
                    <SelectTrigger id="minDigits">
                      <SelectValue placeholder="최소 자릿수" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1자리</SelectItem>
                      <SelectItem value="2">2자리</SelectItem>
                      <SelectItem value="3">3자리</SelectItem>
                      <SelectItem value="4">4자리</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDigits">최대 자릿수</Label>
                  <Select
                    value={localSettings.maxDigits.toString()}
                    onValueChange={(value) => handleSelectChange("maxDigits", value)}
                  >
                    <SelectTrigger id="maxDigits">
                      <SelectValue placeholder="최대 자릿수" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3자리</SelectItem>
                      <SelectItem value="4">4자리</SelectItem>
                      <SelectItem value="5">5자리</SelectItem>
                      <SelectItem value="6">6자리</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableWhitelist">화이트리스트 사용</Label>
              <p className="text-xs text-muted-foreground">특정 문자만 인식하도록 제한합니다.</p>
            </div>
            <Switch
              id="enableWhitelist"
              checked={localSettings.enableWhitelist}
              onCheckedChange={(checked) => handleSwitchChange("enableWhitelist", checked)}
            />
          </div>

          {localSettings.enableWhitelist && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <Label htmlFor="whitelist">화이트리스트 문자</Label>
              <Input
                id="whitelist"
                name="whitelist"
                placeholder="예: 0123456789"
                value={localSettings.whitelist}
                onChange={handleInputChange}
                onBlur={() => handleSettingChange()}
              />
              <p className="text-xs text-muted-foreground">인식할 문자를 입력하세요. 공백 없이 입력합니다.</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableBlacklist">블랙리스트 사용</Label>
              <p className="text-xs text-muted-foreground">특정 문자를 인식에서 제외합니다.</p>
            </div>
            <Switch
              id="enableBlacklist"
              checked={localSettings.enableBlacklist}
              onCheckedChange={(checked) => handleSwitchChange("enableBlacklist", checked)}
            />
          </div>

          {localSettings.enableBlacklist && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <Label htmlFor="blacklist">블랙리스트 문자</Label>
              <Input
                id="blacklist"
                name="blacklist"
                placeholder="예: OIl"
                value={localSettings.blacklist}
                onChange={handleInputChange}
                onBlur={() => handleSettingChange()}
              />
              <p className="text-xs text-muted-foreground">인식에서 제외할 문자를 입력하세요. 공백 없이 입력합니다.</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">전처리 설정</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enablePreprocessing">이미지 전처리</Label>
              <p className="text-xs text-muted-foreground">OCR 인식률을 높이기 위해 이미지를 전처리합니다.</p>
            </div>
            <Switch
              id="enablePreprocessing"
              checked={localSettings.enablePreprocessing}
              onCheckedChange={(checked) => handleSwitchChange("enablePreprocessing", checked)}
            />
          </div>

          {localSettings.enablePreprocessing && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <div className="space-y-2">
                <Label>전처리 단계</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {preprocessingOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={localSettings.preprocessingSteps.includes(option.id)}
                        onCheckedChange={(checked) => handlePreprocessingChange(option.id, checked as boolean)}
                      />
                      <Label htmlFor={option.id} className="text-sm font-normal">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableAutoRotation">자동 회전 보정</Label>
              <p className="text-xs text-muted-foreground">기울어진 텍스트를 자동으로 보정합니다.</p>
            </div>
            <Switch
              id="enableAutoRotation"
              checked={localSettings.enableAutoRotation}
              onCheckedChange={(checked) => handleSwitchChange("enableAutoRotation", checked)}
            />
          </div>

          {localSettings.enableAutoRotation && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <div className="flex justify-between">
                <Label htmlFor="maxRotationAngle">최대 회전 각도</Label>
                <span className="text-sm">±{localSettings.maxRotationAngle}°</span>
              </div>
              <Slider
                id="maxRotationAngle"
                min={1}
                max={45}
                step={1}
                value={[localSettings.maxRotationAngle]}
                onValueChange={(value) => handleSliderChange("maxRotationAngle", value)}
                onValueCommit={() => handleSettingChange()}
              />
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">성능 설정</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableGPU">GPU 가속</Label>
              <p className="text-xs text-muted-foreground">GPU를 사용하여 OCR 처리 속도를 향상시킵니다.</p>
            </div>
            <Switch
              id="enableGPU"
              checked={localSettings.enableGPU}
              onCheckedChange={(checked) => handleSwitchChange("enableGPU", checked)}
            />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            언어 데이터 다운로드
          </Button>
          <Button className="flex-1" onClick={handleTestOcr} disabled={isOcrTesting}>
            {isOcrTesting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            {isOcrTesting ? "테스트 중..." : "OCR 테스트"}
          </Button>
        </div>
      </CardContent>
    </>
  )
}
