"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  RotateCw,
  FlipHorizontal,
  Contrast,
  Sun,
  Droplets,
  Snowflake,
  Crop,
  Layers,
  AlertCircle,
  Check,
  ImageIcon,
  Play,
  Pause,
  RotateCcw,
  Undo,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DataAugmentationProps {
  datasetId: string | null
}

// 샘플 데이터셋 정보
const sampleDatasets = [
  {
    id: "dataset-001",
    name: "고속도로 트럭 데이터셋",
    imageCount: 156,
    createdAt: "2023-06-15T10:30:00Z",
    updatedAt: "2023-09-10T14:20:00Z",
    description: "고속도로에서 촬영된 트럭 이미지 모음",
  },
  {
    id: "dataset-002",
    name: "컨테이너 트럭 데이터셋",
    imageCount: 89,
    createdAt: "2023-07-20T09:30:00Z",
    updatedAt: "2023-08-15T11:45:00Z",
    description: "항만에서 촬영된 컨테이너 트럭 이미지 모음",
  },
  {
    id: "dataset-003",
    name: "야간 트럭 데이터셋",
    imageCount: 42,
    createdAt: "2023-09-10T22:15:00Z",
    updatedAt: "2023-09-12T08:30:00Z",
    description: "야간에 촬영된 트럭 이미지 모음",
  },
  {
    id: "dataset-004",
    name: "악천후 트럭 데이터셋",
    imageCount: 37,
    createdAt: "2023-10-15T14:20:00Z",
    updatedAt: "2023-10-18T09:10:00Z",
    description: "비, 눈, 안개 등 악천후에서 촬영된 트럭 이미지 모음",
  },
]

export function DataAugmentation({ datasetId }: DataAugmentationProps) {
  const [dataset, setDataset] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 증강 설정
  const [rotationEnabled, setRotationEnabled] = useState(true)
  const [rotationRange, setRotationRange] = useState([15])
  const [flipEnabled, setFlipEnabled] = useState(true)
  const [contrastEnabled, setContrastEnabled] = useState(true)
  const [contrastRange, setContrastRange] = useState([0.2])
  const [brightnessEnabled, setBrightnessEnabled] = useState(true)
  const [brightnessRange, setBrightnessRange] = useState([0.2])
  const [blurEnabled, setBlurEnabled] = useState(false)
  const [blurRange, setBlurRange] = useState([1.0])
  const [noiseEnabled, setNoiseEnabled] = useState(false)
  const [noiseRange, setNoiseRange] = useState([0.05])
  const [cropEnabled, setCropEnabled] = useState(true)
  const [cropRange, setCropRange] = useState([0.1])

  // 증강 실행 상태
  const [isAugmenting, setIsAugmenting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processedImages, setProcessedImages] = useState(0)
  const [generatedImages, setGeneratedImages] = useState(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string | null>(null)
  const [augmentationComplete, setAugmentationComplete] = useState(false)

  const { toast } = useToast()

  // 데이터셋 ID가 변경될 때 데이터셋 정보 로드
  useEffect(() => {
    console.log("데이터 증강 컴포넌트 - 데이터셋 ID 변경:", datasetId)

    if (datasetId) {
      setIsLoading(true)
      setError(null)

      // 실제 구현에서는 API 호출 등으로 데이터셋 정보를 가져옴
      // 여기서는 샘플 데이터에서 찾는 방식으로 구현
      setTimeout(() => {
        try {
          const foundDataset = sampleDatasets.find((ds) => ds.id === datasetId)

          if (foundDataset) {
            console.log("데이터셋 찾음:", foundDataset)
            setDataset(foundDataset)
            setIsLoading(false)

            // 데이터셋 로드 성공 토스트
            toast({
              title: "데이터셋 로드 완료",
              description: `${foundDataset.name} 데이터셋이 로드되었습니다.`,
              duration: 3000,
            })
          } else {
            console.error("데이터셋을 찾을 수 없음:", datasetId)
            setDataset(null)
            setIsLoading(false)
            setError(`데이터셋 ID ${datasetId}를 찾을 수 없습니다.`)

            // 데이터셋 로드 실패 토스트
            toast({
              title: "데이터셋 로드 실패",
              description: `데이터셋 ID ${datasetId}를 찾을 수 없습니다.`,
              variant: "destructive",
              duration: 3000,
            })
          }
        } catch (err) {
          console.error("데이터셋 로드 오류:", err)
          setDataset(null)
          setIsLoading(false)
          setError("데이터셋 로드 중 오류가 발생했습니다.")

          // 데이터셋 로드 오류 토스트
          toast({
            title: "데이터셋 로드 오류",
            description: "데이터셋 로드 중 오류가 발생했습니다.",
            variant: "destructive",
            duration: 3000,
          })
        }
      }, 500) // 로딩 시뮬레이션을 위한 지연
    } else {
      setDataset(null)
    }
  }, [datasetId, toast])

  // 증강 시작
  const startAugmentation = () => {
    if (!dataset) return

    setIsAugmenting(true)
    setProgress(0)
    setProcessedImages(0)
    setGeneratedImages(0)
    setEstimatedTimeRemaining("계산 중...")
    setAugmentationComplete(false)

    // 증강 시작 토스트
    toast({
      title: "데이터 증강 시작",
      description: `${dataset.name} 데이터셋의 증강을 시작합니다.`,
      duration: 3000,
    })

    // 증강 진행 시뮬레이션
    const totalImages = dataset.imageCount
    const interval = setInterval(() => {
      setProcessedImages((prev) => {
        const newProcessed = Math.min(prev + Math.floor(Math.random() * 5) + 1, totalImages)
        const progressPercent = (newProcessed / totalImages) * 100
        setProgress(progressPercent)

        // 예상 남은 시간 계산
        const remainingImages = totalImages - newProcessed
        const remainingMinutes = Math.ceil(remainingImages / 10)
        setEstimatedTimeRemaining(remainingImages > 0 ? `약 ${remainingMinutes}분 남음` : null)

        // 생성된 이미지 수 업데이트
        const newGenerated = Math.floor(newProcessed * calculateMultiplier())
        setGeneratedImages(newGenerated)

        // 완료 처리
        if (newProcessed >= totalImages) {
          clearInterval(interval)
          setIsAugmenting(false)
          setAugmentationComplete(true)

          // 증강 완료 토스트
          toast({
            title: "데이터 증강 완료",
            description: `${newGenerated}개의 새 이미지가 생성되었습니다.`,
            duration: 5000,
          })
        }

        return newProcessed
      })
    }, 500)

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(interval)
  }

  // 증강 중지
  const stopAugmentation = () => {
    setIsAugmenting(false)

    // 증강 중지 토스트
    toast({
      title: "데이터 증강 중지됨",
      description: "데이터 증강이 사용자에 의해 중지되었습니다.",
      duration: 3000,
    })
  }

  // 증강 설정 초기화
  const resetSettings = () => {
    setRotationEnabled(true)
    setRotationRange([15])
    setFlipEnabled(true)
    setContrastEnabled(true)
    setContrastRange([0.2])
    setBrightnessEnabled(true)
    setBrightnessRange([0.2])
    setBlurEnabled(false)
    setBlurRange([1.0])
    setNoiseEnabled(false)
    setNoiseRange([0.05])
    setCropEnabled(true)
    setCropRange([0.1])

    // 설정 초기화 토스트
    toast({
      title: "설정 초기화됨",
      description: "증강 설정이 기본값으로 초기화되었습니다.",
      duration: 3000,
    })
  }

  // 증강 배율 계산
  const calculateMultiplier = () => {
    let multiplier = 1

    if (rotationEnabled) multiplier += 2
    if (flipEnabled) multiplier += 1
    if (contrastEnabled) multiplier += 1
    if (brightnessEnabled) multiplier += 1
    if (blurEnabled) multiplier += 1
    if (noiseEnabled) multiplier += 1
    if (cropEnabled) multiplier += 1

    return multiplier
  }

  // 예상 결과 계산
  const calculateExpectedResults = () => {
    if (!dataset) return { originalCount: 0, newCount: 0, totalCount: 0 }

    const originalCount = dataset.imageCount
    const multiplier = calculateMultiplier()
    const newCount = originalCount * (multiplier - 1)
    const totalCount = originalCount * multiplier

    return { originalCount, newCount, totalCount }
  }

  // 데이터셋이 선택되지 않은 경우
  if (!datasetId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">데이터 증강</h2>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>데이터셋 필요</AlertTitle>
          <AlertDescription>
            데이터 증강을 시작하려면 먼저 데이터셋을 선택하세요. 데이터셋 탭으로 이동하여 데이터셋을 선택하세요.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">데이터 증강</h2>
        </div>

        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="mt-4">데이터셋 로딩 중...</span>
        </div>
      </div>
    )
  }

  // 오류가 발생한 경우
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">데이터 증강</h2>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // 데이터셋이 로드되지 않은 경우
  if (!dataset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">데이터 증강</h2>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>데이터셋 오류</AlertTitle>
          <AlertDescription>
            데이터셋을 로드할 수 없습니다. 다른 데이터셋을 선택하거나 다시 시도하세요.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { originalCount, newCount, totalCount } = calculateExpectedResults()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">데이터 증강</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {dataset.name}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            이미지 {dataset.imageCount}개
          </Badge>
        </div>
      </div>

      {augmentationComplete ? (
        <Alert variant="success" className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">증강 완료</AlertTitle>
          <AlertDescription className="text-green-700 flex items-center justify-between">
            <span>{generatedImages}개의 새 이미지가 생성되었습니다.</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAugmentationComplete(false)}>
                <RotateCcw className="h-4 w-4 mr-1" />
                다시 설정
              </Button>
              <Button variant="default" size="sm">
                <ImageIcon className="h-4 w-4 mr-1" />
                이미지 탭으로 이동
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : isAugmenting ? (
        <Card>
          <CardHeader>
            <CardTitle>증강 진행 중...</CardTitle>
            <CardDescription>{dataset.name} 데이터셋의 이미지를 증강하고 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">처리된 이미지</p>
                <p className="font-medium">
                  {processedImages} / {dataset.imageCount}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">생성된 새 이미지</p>
                <p className="font-medium">{generatedImages}</p>
              </div>
              <div>
                <p className="text-muted-foreground">예상 남은 시간</p>
                <p className="font-medium">{estimatedTimeRemaining || "완료 중..."}</p>
              </div>
            </div>
            <Button variant="destructive" onClick={stopAugmentation}>
              <Pause className="h-4 w-4 mr-1" />
              증강 중지
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="settings">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">증강 설정</TabsTrigger>
            <TabsTrigger value="preview">예상 결과</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>기하학적 변환</CardTitle>
                <CardDescription>이미지의 회전, 반전 등 기하학적 변환을 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="rotation" checked={rotationEnabled} onCheckedChange={setRotationEnabled} />
                      <Label htmlFor="rotation" className="flex items-center">
                        <RotateCw className="h-4 w-4 mr-2" />
                        회전
                      </Label>
                    </div>
                    <Badge variant={rotationEnabled ? "default" : "outline"}>±{rotationRange[0]}°</Badge>
                  </div>
                  {rotationEnabled && (
                    <>
                      <Slider
                        value={rotationRange}
                        min={5}
                        max={45}
                        step={5}
                        onValueChange={setRotationRange}
                        disabled={!rotationEnabled}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5°</span>
                        <span>25°</span>
                        <span>45°</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch id="flip" checked={flipEnabled} onCheckedChange={setFlipEnabled} />
                    <Label htmlFor="flip" className="flex items-center">
                      <FlipHorizontal className="h-4 w-4 mr-2" />
                      좌우 반전
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="crop" checked={cropEnabled} onCheckedChange={setCropEnabled} />
                      <Label htmlFor="crop" className="flex items-center">
                        <Crop className="h-4 w-4 mr-2" />
                        무작위 크롭
                      </Label>
                    </div>
                    <Badge variant={cropEnabled ? "default" : "outline"}>{cropRange[0] * 100}%</Badge>
                  </div>
                  {cropEnabled && (
                    <>
                      <Slider
                        value={cropRange}
                        min={0.05}
                        max={0.25}
                        step={0.05}
                        onValueChange={setCropRange}
                        disabled={!cropEnabled}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5%</span>
                        <span>15%</span>
                        <span>25%</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>색상 및 밝기 변환</CardTitle>
                <CardDescription>이미지의 대비, 밝기 등 색상 관련 변환을 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="contrast" checked={contrastEnabled} onCheckedChange={setContrastEnabled} />
                      <Label htmlFor="contrast" className="flex items-center">
                        <Contrast className="h-4 w-4 mr-2" />
                        대비 변화
                      </Label>
                    </div>
                    <Badge variant={contrastEnabled ? "default" : "outline"}>±{contrastRange[0] * 100}%</Badge>
                  </div>
                  {contrastEnabled && (
                    <>
                      <Slider
                        value={contrastRange}
                        min={0.1}
                        max={0.5}
                        step={0.1}
                        onValueChange={setContrastRange}
                        disabled={!contrastEnabled}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>10%</span>
                        <span>30%</span>
                        <span>50%</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="brightness" checked={brightnessEnabled} onCheckedChange={setBrightnessEnabled} />
                      <Label htmlFor="brightness" className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        밝기 변화
                      </Label>
                    </div>
                    <Badge variant={brightnessEnabled ? "default" : "outline"}>±{brightnessRange[0] * 100}%</Badge>
                  </div>
                  {brightnessEnabled && (
                    <>
                      <Slider
                        value={brightnessRange}
                        min={0.1}
                        max={0.5}
                        step={0.1}
                        onValueChange={setBrightnessRange}
                        disabled={!brightnessEnabled}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>10%</span>
                        <span>30%</span>
                        <span>50%</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>노이즈 및 블러</CardTitle>
                <CardDescription>이미지에 노이즈나 블러 효과를 추가합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="blur" checked={blurEnabled} onCheckedChange={setBlurEnabled} />
                      <Label htmlFor="blur" className="flex items-center">
                        <Droplets className="h-4 w-4 mr-2" />
                        블러 효과
                      </Label>
                    </div>
                    <Badge variant={blurEnabled ? "default" : "outline"}>{blurRange[0].toFixed(1)}px</Badge>
                  </div>
                  {blurEnabled && (
                    <>
                      <Slider
                        value={blurRange}
                        min={0.5}
                        max={3.0}
                        step={0.5}
                        onValueChange={setBlurRange}
                        disabled={!blurEnabled}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.5px</span>
                        <span>1.5px</span>
                        <span>3.0px</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="noise" checked={noiseEnabled} onCheckedChange={setNoiseEnabled} />
                      <Label htmlFor="noise" className="flex items-center">
                        <Snowflake className="h-4 w-4 mr-2" />
                        노이즈 추가
                      </Label>
                    </div>
                    <Badge variant={noiseEnabled ? "default" : "outline"}>{noiseRange[0] * 100}%</Badge>
                  </div>
                  {noiseEnabled && (
                    <>
                      <Slider
                        value={noiseRange}
                        min={0.01}
                        max={0.1}
                        step={0.01}
                        onValueChange={setNoiseRange}
                        disabled={!noiseEnabled}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1%</span>
                        <span>5%</span>
                        <span>10%</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetSettings}>
                <Undo className="h-4 w-4 mr-1" />
                설정 초기화
              </Button>
              <Button onClick={startAugmentation}>
                <Play className="h-4 w-4 mr-1" />
                증강 시작
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>예상 결과</CardTitle>
                <CardDescription>현재 설정으로 증강 시 예상되는 결과입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 text-center p-4 border rounded-md">
                    <p className="text-muted-foreground text-sm">원본 이미지</p>
                    <p className="text-3xl font-bold">{originalCount}</p>
                  </div>
                  <div className="space-y-2 text-center p-4 border rounded-md">
                    <p className="text-muted-foreground text-sm">새 이미지</p>
                    <p className="text-3xl font-bold text-primary">{newCount}</p>
                  </div>
                  <div className="space-y-2 text-center p-4 border rounded-md">
                    <p className="text-muted-foreground text-sm">총 이미지</p>
                    <p className="text-3xl font-bold">{totalCount}</p>
                  </div>
                </div>

                <Alert>
                  <Layers className="h-4 w-4" />
                  <AlertTitle>증강 배율: {calculateMultiplier()}x</AlertTitle>
                  <AlertDescription>
                    현재 설정으로 각 이미지당 {calculateMultiplier() - 1}개의 새 이미지가 생성됩니다.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <p className="font-medium">활성화된 증강 기법:</p>
                  <div className="flex flex-wrap gap-2">
                    {rotationEnabled && <Badge>회전 (±{rotationRange[0]}°)</Badge>}
                    {flipEnabled && <Badge>좌우 반전</Badge>}
                    {contrastEnabled && <Badge>대비 변화 (±{contrastRange[0] * 100}%)</Badge>}
                    {brightnessEnabled && <Badge>밝기 변화 (±{brightnessRange[0] * 100}%)</Badge>}
                    {blurEnabled && <Badge>블러 ({blurRange[0].toFixed(1)}px)</Badge>}
                    {noiseEnabled && <Badge>노이즈 ({noiseRange[0] * 100}%)</Badge>}
                    {cropEnabled && <Badge>무작위 크롭 ({cropRange[0] * 100}%)</Badge>}
                  </div>
                </div>

                <Button onClick={startAugmentation} className="w-full">
                  <Play className="h-4 w-4 mr-1" />
                  증강 시작
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
