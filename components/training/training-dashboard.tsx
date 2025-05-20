"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import DatasetManager from "./dataset-manager"
import HyperparameterSettings from "./hyperparameter-settings"
import TrainingMonitor from "./training-monitor"
import ModelEvaluation from "./model-evaluation"
import ModelDeployment from "./model-deployment"
import ModelSelection from "./model-selection"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Play, Pause, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TrainingDashboard() {
  const [activeTab, setActiveTab] = useState("dataset")
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  // hyperparameters 상태 추가
  const [hyperparameters, setHyperparameters] = useState(null)
  const { toast } = useToast()

  // 하이퍼파라미터 업데이트 함수
  const updateHyperparameters = (params) => {
    setHyperparameters(params)
  }

  // 학습 시작 함수에 파인튜닝 관련 로직 추가
  const startTraining = () => {
    setIsTraining(true)
    setTrainingProgress(0)

    // 파인튜닝 여부에 따라 다른 메시지 표시
    const isFineTuning = hyperparameters?.useFineTuning

    toast({
      title: isFineTuning ? "모델 파인튜닝 시작" : "모델 학습 시작",
      description: isFineTuning
        ? "기존 모델을 기반으로 파인튜닝이 시작되었습니다. 완료까지 시간이 소요될 수 있습니다."
        : "YOLO 모델 학습이 시작되었습니다. 완료까지 시간이 소요될 수 있습니다.",
    })

    // 학습 진행 상황 시뮬레이션
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        const newProgress = prev + Math.random() * 5
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsTraining(false)
          toast({
            title: isFineTuning ? "모델 파인튜닝 완료" : "모델 학습 완료",
            description: isFineTuning
              ? "기존 모델 기반 파인튜닝이 성공적으로 완료되었습니다."
              : "YOLO 모델 학습이 성공적으로 완료되었습니다.",
          })
          return 100
        }
        return newProgress
      })
    }, 3000)
  }

  // 학습 중지 함수
  const stopTraining = () => {
    setShowConfirmDialog(true)
  }

  // 학습 중지 확인
  const confirmStopTraining = () => {
    setIsTraining(false)
    setShowConfirmDialog(false)

    toast({
      title: "모델 학습 중지",
      description: "YOLO 모델 학습이 중지되었습니다.",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">YOLO 모델 학습 관리</h2>
          <p className="text-muted-foreground">트럭 감지를 위한 YOLO 모델을 학습하고 관리합니다.</p>
        </div>
        <div>
          {isTraining ? (
            <Button variant="destructive" onClick={stopTraining}>
              <Pause className="h-4 w-4 mr-2" />
              학습 중지
            </Button>
          ) : (
            <Button onClick={startTraining}>
              <Play className="h-4 w-4 mr-2" />
              학습 시작
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dataset">데이터셋</TabsTrigger>
          <TabsTrigger value="model">모델 선택</TabsTrigger>
          <TabsTrigger value="hyperparameters">하이퍼파라미터</TabsTrigger>
          <TabsTrigger value="monitor">학습 모니터링</TabsTrigger>
          <TabsTrigger value="evaluation">모델 평가</TabsTrigger>
          <TabsTrigger value="deployment">모델 배포</TabsTrigger>
        </TabsList>

        <TabsContent value="dataset" className="mt-4">
          <Card>
            <DatasetManager isTraining={isTraining} />
          </Card>
        </TabsContent>

        <TabsContent value="model" className="mt-4">
          <Card>
            <ModelSelection />
          </Card>
        </TabsContent>

        <TabsContent value="hyperparameters" className="mt-4">
          <Card>
            <HyperparameterSettings isTraining={isTraining} onUpdate={updateHyperparameters} />
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="mt-4">
          <Card>
            <TrainingMonitor isTraining={isTraining} progress={trainingProgress} />
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="mt-4">
          <Card>
            <ModelEvaluation />
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="mt-4">
          <Card>
            <ModelDeployment />
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>학습 중지 확인</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">모델 학습을 중지하시겠습니까?</span>
              </div>
              학습을 중지하면 현재까지의 진행 상황이 손실될 수 있습니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStopTraining}>중지</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
