"use client"

import { useState } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Download, FileUp, ImageIcon, CheckCircle, XCircle, BarChart4 } from "lucide-react"

export default function ModelEvaluation() {
  const [activeTab, setActiveTab] = useState("metrics")
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationProgress, setEvaluationProgress] = useState(0)
  const { toast } = useToast()

  // 모델 평가 시작
  const startEvaluation = () => {
    setIsEvaluating(true)
    setEvaluationProgress(0)

    toast({
      title: "모델 평가 시작",
      description: "테스트 데이터셋에 대한 모델 평가가 시작되었습니다.",
    })

    // 평가 진행 상황 시뮬레이션
    const interval = setInterval(() => {
      setEvaluationProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsEvaluating(false)
          toast({
            title: "모델 평가 완료",
            description: "모델 평가가 성공적으로 완료되었습니다.",
          })
          return 100
        }
        return newProgress
      })
    }, 500)
  }

  // 평가 결과 데이터
  const evaluationResults = {
    mAP50: 0.892,
    mAP50_95: 0.724,
    precision: 0.875,
    recall: 0.831,
    f1Score: 0.852,
    inferenceTime: 23.4, // ms
    confusionMatrix: {
      truePositives: 245,
      falsePositives: 35,
      falseNegatives: 50,
      trueNegatives: 670,
    },
    classAccuracy: {
      트럭: 0.92,
      버스: 0.87,
      승용차: 0.95,
      오토바이: 0.83,
    },
  }

  // 테스트 이미지 결과
  const testResults = [
    {
      id: 1,
      imageUrl: "/truck-detection-1.png",
      predictions: [{ label: "트럭", confidence: 0.95, bbox: [50, 100, 200, 150] }],
      groundTruth: [{ label: "트럭", bbox: [45, 95, 210, 155] }],
      correct: true,
    },
    {
      id: 2,
      imageUrl: "/truck-detection-2.png",
      predictions: [{ label: "트럭", confidence: 0.87, bbox: [150, 120, 180, 140] }],
      groundTruth: [{ label: "트럭", bbox: [145, 115, 185, 145] }],
      correct: true,
    },
    {
      id: 3,
      imageUrl: "/truck-detection-3.png",
      predictions: [{ label: "버스", confidence: 0.72, bbox: [80, 110, 220, 160] }],
      groundTruth: [{ label: "트럭", bbox: [75, 105, 225, 165] }],
      correct: false,
    },
    {
      id: 4,
      imageUrl: "/placeholder.svg?height=200&width=300&query=truck-detection-4",
      predictions: [],
      groundTruth: [{ label: "트럭", bbox: [120, 90, 180, 130] }],
      correct: false,
    },
  ]

  return (
    <>
      <CardHeader>
        <CardTitle>모델 평가</CardTitle>
        <CardDescription>학습된 모델의 성능을 평가합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">테스트 데이터셋 평가</h3>
            <p className="text-sm text-muted-foreground">
              학습된 모델을 테스트 데이터셋에서 평가하여 성능을 측정합니다.
            </p>
          </div>
          <Button onClick={startEvaluation} disabled={isEvaluating}>
            {isEvaluating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                평가 중...
              </>
            ) : (
              <>
                <BarChart4 className="h-4 w-4 mr-2" />
                평가 시작
              </>
            )}
          </Button>
        </div>

        {isEvaluating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>평가 진행률</span>
              <span>{Math.floor(evaluationProgress)}%</span>
            </div>
            <Progress value={evaluationProgress} />
          </div>
        )}

        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">평가 메트릭</TabsTrigger>
            <TabsTrigger value="confusion">혼동 행렬</TabsTrigger>
            <TabsTrigger value="examples">테스트 예시</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-6 pt-4">
            {evaluationProgress === 100 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">mAP@0.5</div>
                    <div className="text-2xl font-bold">{evaluationResults.mAP50.toFixed(3)}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">mAP@0.5:0.95</div>
                    <div className="text-2xl font-bold">{evaluationResults.mAP50_95.toFixed(3)}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">정밀도</div>
                    <div className="text-2xl font-bold">{evaluationResults.precision.toFixed(3)}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">재현율</div>
                    <div className="text-2xl font-bold">{evaluationResults.recall.toFixed(3)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">클래스별 정확도</h4>
                    <div className="space-y-3">
                      {Object.entries(evaluationResults.classAccuracy).map(([className, accuracy]) => (
                        <div key={className} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{className}</span>
                            <span>{(accuracy * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={accuracy * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">추론 성능</h4>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">추론 시간</div>
                          <div className="text-xl font-bold">{evaluationResults.inferenceTime.toFixed(1)} ms</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">F1 점수</div>
                          <div className="text-xl font-bold">{evaluationResults.f1Score.toFixed(3)}</div>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-sm font-medium mt-4">모델 크기</h4>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">원본 크기</div>
                          <div className="text-xl font-bold">86.4 MB</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">양자화 후</div>
                          <div className="text-xl font-bold">21.6 MB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    평가 결과 내보내기
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                모델 평가를 시작하면 메트릭이 여기에 표시됩니다.
              </div>
            )}
          </TabsContent>

          <TabsContent value="confusion" className="space-y-6 pt-4">
            {evaluationProgress === 100 ? (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">혼동 행렬</h4>
                  <div className="bg-muted/50 p-6 rounded-md">
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="bg-green-100 p-4 rounded-md text-center">
                        <div className="text-sm text-green-800">참 양성 (TP)</div>
                        <div className="text-2xl font-bold text-green-700">
                          {evaluationResults.confusionMatrix.truePositives}
                        </div>
                      </div>
                      <div className="bg-red-100 p-4 rounded-md text-center">
                        <div className="text-sm text-red-800">거짓 양성 (FP)</div>
                        <div className="text-2xl font-bold text-red-700">
                          {evaluationResults.confusionMatrix.falsePositives}
                        </div>
                      </div>
                      <div className="bg-red-100 p-4 rounded-md text-center">
                        <div className="text-sm text-red-800">거짓 음성 (FN)</div>
                        <div className="text-2xl font-bold text-red-700">
                          {evaluationResults.confusionMatrix.falseNegatives}
                        </div>
                      </div>
                      <div className="bg-green-100 p-4 rounded-md text-center">
                        <div className="text-sm text-green-800">참 음성 (TN)</div>
                        <div className="text-2xl font-bold text-green-700">
                          {evaluationResults.confusionMatrix.trueNegatives}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">오류 분석</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">정밀도 (Precision)</div>
                      <div className="text-xl font-bold">{evaluationResults.precision.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground mt-1">TP / (TP + FP)</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">재현율 (Recall)</div>
                      <div className="text-xl font-bold">{evaluationResults.recall.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground mt-1">TP / (TP + FN)</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">F1 점수</div>
                      <div className="text-xl font-bold">{evaluationResults.f1Score.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        2 * (Precision * Recall) / (Precision + Recall)
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                모델 평가를 시작하면 혼동 행렬이 여기에 표시됩니다.
              </div>
            )}
          </TabsContent>

          <TabsContent value="examples" className="space-y-6 pt-4">
            {evaluationProgress === 100 ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">테스트 이미지 결과</h4>
                    <Button variant="outline" size="sm">
                      <FileUp className="h-4 w-4 mr-2" />
                      테스트 이미지 업로드
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testResults.map((result) => (
                      <div key={result.id} className="border rounded-md overflow-hidden">
                        <div className="relative">
                          <img
                            src={result.imageUrl || "/placeholder.svg"}
                            alt={`테스트 이미지 ${result.id}`}
                            className="w-full h-auto"
                          />
                          <div className="absolute top-2 right-2">
                            {result.correct ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                정확함
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                오류
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-muted/50">
                          <div className="text-sm font-medium">예측 결과</div>
                          {result.predictions.length > 0 ? (
                            <div className="mt-1 space-y-1">
                              {result.predictions.map((pred, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>{pred.label}</span>
                                  <Badge variant="outline">{(pred.confidence * 100).toFixed(1)}%</Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-1 text-sm text-muted-foreground">감지된 객체 없음</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline">
                    <ImageIcon className="h-4 w-4 mr-2" />더 많은 테스트 이미지 보기
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                모델 평가를 시작하면 테스트 예시가 여기에 표시됩니다.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  )
}
