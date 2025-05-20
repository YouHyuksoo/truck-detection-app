"use client"

import { useState } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Rocket,
  RefreshCw,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Cpu,
  HardDrive,
  Smartphone,
  Cloud,
} from "lucide-react"

export default function ModelDeployment() {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentProgress, setDeploymentProgress] = useState(0)
  const [deploymentComplete, setDeploymentComplete] = useState(false)
  const { toast } = useToast()

  // 배포 설정
  const [deploymentSettings, setDeploymentSettings] = useState({
    modelFormat: "onnx",
    targetDevice: "gpu",
    enableQuantization: true,
    quantizationType: "int8",
    optimizeForInference: true,
    deploymentTarget: "edge",
    modelVersion: "1.0.0",
    modelName: "truck_detector_yolov8m",
    includeMetadata: true,
  })

  // 설정 변경 핸들러
  const handleSettingChange = (key: string, value: string | boolean) => {
    setDeploymentSettings({
      ...deploymentSettings,
      [key]: value,
    })
  }

  // 모델 배포 시작
  const startDeployment = () => {
    setIsDeploying(true)
    setDeploymentProgress(0)
    setDeploymentComplete(false)

    toast({
      title: "모델 배포 시작",
      description: "모델 변환 및 배포가 시작되었습니다.",
    })

    // 배포 진행 상황 시뮬레이션
    const interval = setInterval(() => {
      setDeploymentProgress((prev) => {
        const newProgress = prev + Math.random() * 5
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsDeploying(false)
          setDeploymentComplete(true)
          toast({
            title: "모델 배포 완료",
            description: "모델이 성공적으로 배포되었습니다.",
          })
          return 100
        }
        return newProgress
      })
    }, 500)
  }

  // 배포된 모델 목록
  const deployedModels = [
    {
      id: "model-1",
      name: "truck_detector_yolov8m_v1.0.0",
      format: "ONNX",
      size: "21.6 MB",
      target: "Edge Device",
      deployedAt: "2023-05-15 14:30:22",
      status: "active",
    },
    {
      id: "model-2",
      name: "truck_detector_yolov8s_v0.9.5",
      format: "TensorRT",
      size: "12.8 MB",
      target: "Edge Device",
      deployedAt: "2023-05-10 09:15:47",
      status: "archived",
    },
  ]

  return (
    <>
      <CardHeader>
        <CardTitle>모델 배포</CardTitle>
        <CardDescription>학습된 모델을 변환하고 배포합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">배포 설정</h3>
            <Button onClick={startDeployment} disabled={isDeploying}>
              {isDeploying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  배포 중...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  배포 시작
                </>
              )}
            </Button>
          </div>

          {isDeploying && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>배포 진행률</span>
                <span>{Math.floor(deploymentProgress)}%</span>
              </div>
              <Progress value={deploymentProgress} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelName">모델 이름</Label>
                <Input
                  id="modelName"
                  value={deploymentSettings.modelName}
                  onChange={(e) => handleSettingChange("modelName", e.target.value)}
                  disabled={isDeploying}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelVersion">모델 버전</Label>
                <Input
                  id="modelVersion"
                  value={deploymentSettings.modelVersion}
                  onChange={(e) => handleSettingChange("modelVersion", e.target.value)}
                  disabled={isDeploying}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelFormat">모델 포맷</Label>
                <Select
                  value={deploymentSettings.modelFormat}
                  onValueChange={(value) => handleSettingChange("modelFormat", value)}
                  disabled={isDeploying}
                >
                  <SelectTrigger id="modelFormat">
                    <SelectValue placeholder="모델 포맷 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onnx">ONNX (Open Neural Network Exchange)</SelectItem>
                    <SelectItem value="tensorrt">TensorRT</SelectItem>
                    <SelectItem value="tflite">TensorFlow Lite</SelectItem>
                    <SelectItem value="coreml">Core ML (Apple)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetDevice">대상 디바이스</Label>
                <Select
                  value={deploymentSettings.targetDevice}
                  onValueChange={(value) => handleSettingChange("targetDevice", value)}
                  disabled={isDeploying}
                >
                  <SelectTrigger id="targetDevice">
                    <SelectValue placeholder="대상 디바이스 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpu">CPU</SelectItem>
                    <SelectItem value="gpu">GPU</SelectItem>
                    <SelectItem value="tpu">TPU / NPU</SelectItem>
                    <SelectItem value="mobile">모바일 디바이스</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deploymentTarget">배포 대상</Label>
                <Select
                  value={deploymentSettings.deploymentTarget}
                  onValueChange={(value) => handleSettingChange("deploymentTarget", value)}
                  disabled={isDeploying}
                >
                  <SelectTrigger id="deploymentTarget">
                    <SelectValue placeholder="배포 대상 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edge">엣지 디바이스</SelectItem>
                    <SelectItem value="cloud">클라우드 서버</SelectItem>
                    <SelectItem value="mobile">모바일 앱</SelectItem>
                    <SelectItem value="web">웹 브라우저</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="includeMetadata">메타데이터 포함</Label>
                  <p className="text-xs text-muted-foreground">
                    클래스 이름, 버전 등의 메타데이터를 모델에 포함합니다.
                  </p>
                </div>
                <Switch
                  id="includeMetadata"
                  checked={deploymentSettings.includeMetadata}
                  onCheckedChange={(checked) => handleSettingChange("includeMetadata", checked)}
                  disabled={isDeploying}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">최적화 설정</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableQuantization">모델 양자화</Label>
                <p className="text-xs text-muted-foreground">모델 크기를 줄이고 추론 속도를 향상시킵니다.</p>
              </div>
              <Switch
                id="enableQuantization"
                checked={deploymentSettings.enableQuantization}
                onCheckedChange={(checked) => handleSettingChange("enableQuantization", checked)}
                disabled={isDeploying}
              />
            </div>

            {deploymentSettings.enableQuantization && (
              <div className="space-y-2 pl-6 border-l-2 border-muted">
                <Label htmlFor="quantizationType">양자화 유형</Label>
                <Select
                  value={deploymentSettings.quantizationType}
                  onValueChange={(value) => handleSettingChange("quantizationType", value)}
                  disabled={isDeploying}
                >
                  <SelectTrigger id="quantizationType">
                    <SelectValue placeholder="양자화 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="int8">INT8 (8비트)</SelectItem>
                    <SelectItem value="fp16">FP16 (16비트)</SelectItem>
                    <SelectItem value="dynamic">동적 양자화</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="optimizeForInference">추론 최적화</Label>
                <p className="text-xs text-muted-foreground">추론 속도를 위해 모델 그래프를 최적화합니다.</p>
              </div>
              <Switch
                id="optimizeForInference"
                checked={deploymentSettings.optimizeForInference}
                onCheckedChange={(checked) => handleSettingChange("optimizeForInference", checked)}
                disabled={isDeploying}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">배포된 모델</h3>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              모델 다운로드
            </Button>
          </div>

          {deploymentComplete && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">배포 성공</h4>
                <p className="text-sm text-green-700 mt-1">
                  모델 {deploymentSettings.modelName} v{deploymentSettings.modelVersion}이(가) 성공적으로
                  배포되었습니다.
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="bg-white">
                    <Download className="h-4 w-4 mr-2" />
                    모델 다운로드
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md border overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium">배포 이력</div>
            <div className="divide-y">
              {deployedModels.map((model) => (
                <div key={model.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">배포 시간: {model.deployedAt}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        model.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }
                    >
                      {model.status === "active" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          활성
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          보관됨
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{model.format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{model.target}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{model.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">배포됨</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      다운로드
                    </Button>
                    {model.status === "active" ? (
                      <Button variant="outline" size="sm">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        보관
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Rocket className="h-4 w-4 mr-2" />
                        재배포
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </>
  )
}
