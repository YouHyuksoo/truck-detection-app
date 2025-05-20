"use client"

import { useState } from "react"

import { useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Save, RefreshCw, FileDown, FileUp } from "lucide-react"
import { useTrainingApi, type Hyperparameters } from "@/lib/api/training-api"

interface HyperparameterSettingsProps {
  isTraining: boolean
  onUpdate?: (params: Hyperparameters) => void
}

export default function HyperparameterSettings({ isTraining, onUpdate }: HyperparameterSettingsProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const { toast } = useToast()

  const { hyperparameters, isLoading, loadHyperparameters, handleUpdateHyperparameters } = useTrainingApi()

  // 컴포넌트 마운트 시 하이퍼파라미터 로드
  useEffect(() => {
    loadHyperparameters()
  }, [loadHyperparameters])

  // 하이퍼파라미터 변경 핸들러
  const handleChange = (key: string, value: string | number | boolean) => {
    if (!hyperparameters) return

    const updatedParams = {
      ...hyperparameters,
      [key]: value,
    }

    // 부모 컴포넌트에 업데이트된 하이퍼파라미터 전달
    if (onUpdate) {
      onUpdate(updatedParams)
    }

    // API 호출
    handleUpdateHyperparameters(updatedParams).catch((error) => {
      toast({
        title: "업데이트 실패",
        description: error.message || "하이퍼파라미터 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    })
  }

  // 하이퍼파라미터 저장
  const saveHyperparameters = () => {
    if (!hyperparameters) return

    handleUpdateHyperparameters(hyperparameters)
      .then(() => {
        toast({
          title: "하이퍼파라미터 저장 완료",
          description: "학습 하이퍼파라미터가 저장되었습니다.",
        })
      })
      .catch((error) => {
        toast({
          title: "저장 실패",
          description: error.message || "하이퍼파라미터 저장 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      })
  }

  // 하이퍼파라미터 초기화
  const resetHyperparameters = () => {
    loadHyperparameters()
      .then(() => {
        toast({
          title: "하이퍼파라미터 초기화",
          description: "학습 하이퍼파라미터가 기본값으로 초기화되었습니다.",
        })
      })
      .catch((error) => {
        toast({
          title: "초기화 실패",
          description: error.message || "하이퍼파라미터 초기화 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      })
  }

  // 하이퍼파라미터 내보내기
  const exportHyperparameters = () => {
    if (!hyperparameters) return

    const dataStr = JSON.stringify(hyperparameters, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `yolo_hyperparameters_${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "하이퍼파라미터 내보내기 완료",
      description: "학습 하이퍼파라미터가 JSON 파일로 내보내졌습니다.",
    })
  }

  // 로딩 중이거나 하이퍼파라미터가 없는 경우
  if (isLoading || !hyperparameters) {
    return (
      <>
        <CardHeader>
          <CardTitle>하이퍼파라미터 설정</CardTitle>
          <CardDescription>모델 학습을 위한 하이퍼파라미터를 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader>
        <CardTitle>하이퍼파라미터 설정</CardTitle>
        <CardDescription>모델 학습을 위한 하이퍼파라미터를 설정합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={resetHyperparameters} disabled={isTraining || isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            초기화
          </Button>
          <Button variant="outline" size="sm" onClick={exportHyperparameters} disabled={isTraining || isLoading}>
            <FileDown className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          <Button variant="outline" size="sm" disabled={isTraining || isLoading}>
            <FileUp className="h-4 w-4 mr-2" />
            가져오기
          </Button>
          <Button size="sm" onClick={saveHyperparameters} disabled={isTraining || isLoading}>
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">기본 설정</TabsTrigger>
            <TabsTrigger value="optimization">최적화 설정</TabsTrigger>
            <TabsTrigger value="advanced">고급 설정</TabsTrigger>
            <TabsTrigger value="finetuning">파인튜닝</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="modelVersion">모델 버전</Label>
                <Select
                  value={hyperparameters.modelVersion}
                  onValueChange={(value) => handleChange("modelVersion", value)}
                  disabled={isTraining || isLoading}
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
                <Select
                  value={hyperparameters.modelSize}
                  onValueChange={(value) => handleChange("modelSize", value)}
                  disabled={isTraining || isLoading}
                >
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
              <div className="flex justify-between">
                <Label htmlFor="epochs">에폭 수</Label>
                <span className="text-sm">{hyperparameters.epochs} 에폭</span>
              </div>
              <Slider
                id="epochs"
                min={10}
                max={300}
                step={10}
                value={[hyperparameters.epochs]}
                onValueChange={(value) => handleChange("epochs", value[0])}
                disabled={isTraining || isLoading}
              />
              <p className="text-xs text-muted-foreground">
                전체 데이터셋을 몇 번 반복해서 학습할지 설정합니다. 값이 클수록 학습 시간이 길어집니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="batchSize">배치 크기</Label>
                <Select
                  value={hyperparameters.batchSize.toString()}
                  onValueChange={(value) => handleChange("batchSize", Number.parseInt(value))}
                  disabled={isTraining || isLoading}
                >
                  <SelectTrigger id="batchSize">
                    <SelectValue placeholder="배치 크기 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 (낮은 메모리)</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="16">16 (권장)</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                    <SelectItem value="64">64 (높은 메모리)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  한 번에 처리할 이미지 수입니다. GPU 메모리에 따라 조정하세요.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageSize">이미지 크기</Label>
                <Select
                  value={hyperparameters.imageSize.toString()}
                  onValueChange={(value) => handleChange("imageSize", Number.parseInt(value))}
                  disabled={isTraining || isLoading}
                >
                  <SelectTrigger id="imageSize">
                    <SelectValue placeholder="이미지 크기 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="416">416 x 416</SelectItem>
                    <SelectItem value="512">512 x 512</SelectItem>
                    <SelectItem value="640">640 x 640 (권장)</SelectItem>
                    <SelectItem value="1024">1024 x 1024</SelectItem>
                    <SelectItem value="1280">1280 x 1280</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  학습 및 추론에 사용할 이미지 크기입니다. 크기가 클수록 정확도가 높아질 수 있습니다.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="learningRate">학습률</Label>
                <span className="text-sm">{hyperparameters.learningRate}</span>
              </div>
              <Slider
                id="learningRate"
                min={0.0001}
                max={0.1}
                step={0.0001}
                value={[hyperparameters.learningRate]}
                onValueChange={(value) => handleChange("learningRate", value[0])}
                disabled={isTraining || isLoading}
              />
              <p className="text-xs text-muted-foreground">
                모델이 학습하는 속도를 결정합니다. 너무 높으면 학습이 불안정해지고, 너무 낮으면 학습이 느려집니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="weightDecay">가중치 감쇠</Label>
                  <span className="text-sm">{hyperparameters.weightDecay}</span>
                </div>
                <Slider
                  id="weightDecay"
                  min={0.0001}
                  max={0.01}
                  step={0.0001}
                  value={[hyperparameters.weightDecay]}
                  onValueChange={(value) => handleChange("weightDecay", value[0])}
                  disabled={isTraining || isLoading}
                />
                <p className="text-xs text-muted-foreground">과적합을 방지하기 위한 정규화 파라미터입니다.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="momentum">모멘텀</Label>
                  <span className="text-sm">{hyperparameters.momentum}</span>
                </div>
                <Slider
                  id="momentum"
                  min={0.8}
                  max={0.999}
                  step={0.001}
                  value={[hyperparameters.momentum]}
                  onValueChange={(value) => handleChange("momentum", value[0])}
                  disabled={isTraining || isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  최적화 알고리즘의 모멘텀 값입니다. 학습 안정성에 영향을 줍니다.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="useCosineScheduler">코사인 스케줄러 사용</Label>
                  <p className="text-xs text-muted-foreground">
                    학습률을 코사인 함수 형태로 감소시켜 학습 안정성을 높입니다.
                  </p>
                </div>
                <Switch
                  id="useCosineScheduler"
                  checked={hyperparameters.useCosineScheduler}
                  onCheckedChange={(checked) => handleChange("useCosineScheduler", checked)}
                  disabled={isTraining || isLoading}
                />
              </div>

              {hyperparameters.useCosineScheduler && (
                <div className="space-y-2 pl-6 border-l-2 border-muted">
                  <div className="flex justify-between">
                    <Label htmlFor="warmupEpochs">웜업 에폭</Label>
                    <span className="text-sm">{hyperparameters.warmupEpochs} 에폭</span>
                  </div>
                  <Slider
                    id="warmupEpochs"
                    min={0}
                    max={10}
                    step={1}
                    value={[hyperparameters.warmupEpochs]}
                    onValueChange={(value) => handleChange("warmupEpochs", value[0])}
                    disabled={isTraining || isLoading}
                  />
                  <p className="text-xs text-muted-foreground">학습 초기에 학습률을 서서히 증가시키는 기간입니다.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="iouThreshold">IoU 임계값</Label>
                  <span className="text-sm">{hyperparameters.iouThreshold}</span>
                </div>
                <Slider
                  id="iouThreshold"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={[hyperparameters.iouThreshold]}
                  onValueChange={(value) => handleChange("iouThreshold", value[0])}
                  disabled={isTraining || isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  바운딩 박스 매칭을 위한 IoU(Intersection over Union) 임계값입니다.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="confThreshold">신뢰도 임계값</Label>
                  <span className="text-sm">{hyperparameters.confThreshold}</span>
                </div>
                <Slider
                  id="confThreshold"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={[hyperparameters.confThreshold]}
                  onValueChange={(value) => handleChange("confThreshold", value[0])}
                  disabled={isTraining || isLoading}
                />
                <p className="text-xs text-muted-foreground">객체 감지 결과의 최소 신뢰도 임계값입니다.</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="useAMP">자동 혼합 정밀도(AMP) 사용</Label>
                  <p className="text-xs text-muted-foreground">
                    학습 속도를 높이고 메모리 사용량을 줄이기 위해 16비트 정밀도를 사용합니다.
                  </p>
                </div>
                <Switch
                  id="useAMP"
                  checked={hyperparameters.useAMP}
                  onCheckedChange={(checked) => handleChange("useAMP", checked)}
                  disabled={isTraining || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="useEMA">지수 이동 평균(EMA) 사용</Label>
                  <p className="text-xs text-muted-foreground">
                    모델 가중치의 이동 평균을 유지하여 학습 안정성을 높입니다.
                  </p>
                </div>
                <Switch
                  id="useEMA"
                  checked={hyperparameters.useEMA}
                  onCheckedChange={(checked) => handleChange("useEMA", checked)}
                  disabled={isTraining || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="freezeBackbone">백본 동결</Label>
                  <p className="text-xs text-muted-foreground">
                    초기 학습 단계에서 백본 네트워크의 가중치를 고정합니다.
                  </p>
                </div>
                <Switch
                  id="freezeBackbone"
                  checked={hyperparameters.freezeBackbone}
                  onCheckedChange={(checked) => handleChange("freezeBackbone", checked)}
                  disabled={isTraining || isLoading}
                />
              </div>

              {hyperparameters.freezeBackbone && (
                <div className="space-y-2 pl-6 border-l-2 border-muted">
                  <div className="flex justify-between">
                    <Label htmlFor="freezeBackboneEpochs">백본 동결 에폭</Label>
                    <span className="text-sm">{hyperparameters.freezeBackboneEpochs} 에폭</span>
                  </div>
                  <Slider
                    id="freezeBackboneEpochs"
                    min={1}
                    max={50}
                    step={1}
                    value={[hyperparameters.freezeBackboneEpochs]}
                    onValueChange={(value) => handleChange("freezeBackboneEpochs", value[0])}
                    disabled={isTraining || isLoading}
                  />
                  <p className="text-xs text-muted-foreground">백본 네트워크를 동결 상태로 유지할 에폭 수입니다.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="finetuning" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="useFineTuning">파인튜닝 사용</Label>
                  <p className="text-xs text-muted-foreground">기존에 학습된 모델을 기반으로 추가 학습을 진행합니다.</p>
                </div>
                <Switch
                  id="useFineTuning"
                  checked={hyperparameters.useFineTuning}
                  onCheckedChange={(checked) => handleChange("useFineTuning", checked)}
                  disabled={isTraining || isLoading}
                />
              </div>

              {hyperparameters.useFineTuning && (
                <div className="space-y-6 pl-6 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="pretrainedModel">사전 학습된 모델 선택</Label>
                    <Select
                      value={hyperparameters.pretrainedModel}
                      onValueChange={(value) => handleChange("pretrainedModel", value)}
                      disabled={isTraining || isLoading}
                    >
                      <SelectTrigger id="pretrainedModel">
                        <SelectValue placeholder="사전 학습된 모델 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none_selected">모델 선택...</SelectItem>
                        <SelectItem value="yolov8n_pretrained">YOLOv8n (사전 학습됨)</SelectItem>
                        <SelectItem value="yolov8s_pretrained">YOLOv8s (사전 학습됨)</SelectItem>
                        <SelectItem value="yolov8m_pretrained">YOLOv8m (사전 학습됨)</SelectItem>
                        <SelectItem value="yolov8l_pretrained">YOLOv8l (사전 학습됨)</SelectItem>
                        <SelectItem value="yolov8x_pretrained">YOLOv8x (사전 학습됨)</SelectItem>
                        <SelectItem value="truck_model_v1">트럭 감지 모델 v1 (2023-04-15)</SelectItem>
                        <SelectItem value="truck_model_v2">트럭 감지 모델 v2 (2023-06-22)</SelectItem>
                        <SelectItem value="truck_model_v3">트럭 감지 모델 v3 (2023-09-10)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">파인튜닝의 기반이 될 사전 학습된 모델을 선택합니다.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freezeLayers">레이어 동결 설정</Label>
                    <Select
                      value={hyperparameters.freezeLayers}
                      onValueChange={(value) => handleChange("freezeLayers", value)}
                      disabled={isTraining || isLoading}
                    >
                      <SelectTrigger id="freezeLayers">
                        <SelectValue placeholder="레이어 동결 설정 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">동결 없음 (모든 레이어 학습)</SelectItem>
                        <SelectItem value="backbone">백본만 동결 (권장)</SelectItem>
                        <SelectItem value="all_except_head">헤드를 제외한 모든 레이어 동결</SelectItem>
                        <SelectItem value="custom">사용자 정의 레이어 동결</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      파인튜닝 중 어떤 레이어를 동결(학습하지 않음)할지 설정합니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="fineTuningLearningRate">파인튜닝 학습률</Label>
                      <span className="text-sm">{hyperparameters.fineTuningLearningRate}</span>
                    </div>
                    <Slider
                      id="fineTuningLearningRate"
                      min={0.00001}
                      max={0.01}
                      step={0.00001}
                      value={[hyperparameters.fineTuningLearningRate]}
                      onValueChange={(value) => handleChange("fineTuningLearningRate", value[0])}
                      disabled={isTraining || isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      파인튜닝에는 일반적으로 더 낮은 학습률을 사용합니다. (기본 학습률보다 10배 낮게 설정)
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="onlyTrainNewLayers">새 레이어만 학습</Label>
                      <p className="text-xs text-muted-foreground">
                        클래스 수가 변경된 경우, 새로 추가된 출력 레이어만 학습합니다.
                      </p>
                    </div>
                    <Switch
                      id="onlyTrainNewLayers"
                      checked={hyperparameters.onlyTrainNewLayers}
                      onCheckedChange={(checked) => handleChange("onlyTrainNewLayers", checked)}
                      disabled={isTraining || isLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  )
}
