"use client"

import { useEffect, useState } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Upload, FolderOpen, Database, RefreshCw, Trash2, CheckCircle, XCircle } from "lucide-react"
import { useTrainingApi } from "@/lib/api/training-api"

interface DatasetManagerProps {
  isTraining: boolean
}

export default function DatasetManager({ isTraining }: DatasetManagerProps) {
  const {
    datasets,
    selectedDataset,
    isLoading,
    loadDatasets,
    handleUploadDataset,
    handleDeleteDataset,
    setSelectedDataset,
  } = useTrainingApi()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [splitRatio, setSplitRatio] = useState<number[]>([70])
  const { toast } = useToast()

  // 컴포넌트 마운트 시 데이터셋 로드
  useEffect(() => {
    loadDatasets()
  }, [loadDatasets])

  // 데이터셋 업로드 시뮬레이션
  const handleUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // FormData 생성 (실제로는 파일 업로드 로직이 들어갈 자리)
          const formData = new FormData()
          formData.append("name", `새 데이터셋 ${new Date().toLocaleDateString()}`)

          // API 호출
          handleUploadDataset(formData)
            .then((newDataset) => {
              toast({
                title: "데이터셋 업로드 완료",
                description: `${newDataset.images}개의 이미지가 성공적으로 업로드되었습니다.`,
              })
            })
            .catch((error) => {
              toast({
                title: "업로드 실패",
                description: error.message || "데이터셋 업로드 중 오류가 발생했습니다.",
                variant: "destructive",
              })
            })

          return 100
        }
        return prev + Math.random() * 10
      })
    }, 500)
  }

  // 데이터셋 삭제
  const onDeleteDataset = (id: string) => {
    handleDeleteDataset(id)
      .then(() => {
        toast({
          title: "데이터셋 삭제",
          description: "데이터셋이 삭제되었습니다.",
        })
      })
      .catch((error) => {
        toast({
          title: "삭제 실패",
          description: error.message || "데이터셋 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      })
  }

  // 분할 비율 계산
  const trainRatio = splitRatio[0]
  const valRatio = Math.floor((100 - trainRatio) * 0.7)
  const testRatio = 100 - trainRatio - valRatio

  return (
    <>
      <CardHeader>
        <CardTitle>데이터셋 관리</CardTitle>
        <CardDescription>학습에 사용할 데이터셋을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 데이터셋 업로드 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">데이터셋 업로드</h3>
            <Button variant="outline" onClick={handleUpload} disabled={isUploading || isTraining || isLoading}>
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  이미지 업로드
                </>
              )}
            </Button>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>업로드 진행 중...</span>
                <span>{Math.floor(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Button variant="outline" className="w-full h-24 flex flex-col" disabled={isTraining || isLoading}>
                <FolderOpen className="h-6 w-6 mb-2" />
                <span>로컬 폴더에서 가져오기</span>
              </Button>
            </div>
            <div>
              <Button variant="outline" className="w-full h-24 flex flex-col" disabled={isTraining || isLoading}>
                <Database className="h-6 w-6 mb-2" />
                <span>기존 데이터베이스에서 가져오기</span>
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* 데이터셋 목록 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">데이터셋 목록</h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              데이터셋이 없습니다. 데이터셋을 업로드해주세요.
            </div>
          ) : (
            <div className="space-y-2">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className={`p-4 border rounded-md ${
                    selectedDataset === dataset.id ? "border-primary bg-muted/50" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={dataset.id}
                        name="dataset"
                        checked={selectedDataset === dataset.id}
                        onChange={() => setSelectedDataset(dataset.id)}
                        disabled={isTraining}
                      />
                      <Label htmlFor={dataset.id} className="font-medium cursor-pointer">
                        {dataset.name}
                      </Label>
                      {dataset.status === "ready" ? (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          준비됨
                        </Badge>
                      ) : dataset.status === "processing" ? (
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          처리 중
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          오류
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteDataset(dataset.id)}
                      disabled={isTraining || isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">이미지:</span> {dataset.images}개
                    </div>
                    <div>
                      <span className="text-muted-foreground">어노테이션:</span> {dataset.annotations}개
                    </div>
                    <div>
                      <span className="text-muted-foreground">마지막 업데이트:</span> {dataset.lastUpdated}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* 데이터셋 분할 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">데이터셋 분할</h3>
          <p className="text-sm text-muted-foreground">학습, 검증, 테스트 데이터셋의 비율을 설정합니다.</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>학습 데이터 비율</Label>
                <span className="text-sm">{trainRatio}%</span>
              </div>
              <Slider
                value={splitRatio}
                onValueChange={setSplitRatio}
                min={50}
                max={90}
                step={5}
                disabled={isTraining || isLoading}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-md text-center">
                <div className="text-lg font-bold text-blue-700">{trainRatio}%</div>
                <div className="text-sm text-blue-600">학습 데이터</div>
              </div>
              <div className="p-4 bg-green-50 rounded-md text-center">
                <div className="text-lg font-bold text-green-700">{valRatio}%</div>
                <div className="text-sm text-green-600">검증 데이터</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-md text-center">
                <div className="text-lg font-bold text-amber-700">{testRatio}%</div>
                <div className="text-sm text-amber-600">테스트 데이터</div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* 데이터 증강 설정 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">데이터 증강 설정</h3>
          <p className="text-sm text-muted-foreground">
            학습 데이터의 다양성을 높이기 위한 데이터 증강 옵션을 설정합니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="augmentation">증강 방법</Label>
              <Select defaultValue="default" disabled={isTraining || isLoading}>
                <SelectTrigger id="augmentation">
                  <SelectValue placeholder="증강 방법 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">기본 (회전, 뒤집기, 밝기)</SelectItem>
                  <SelectItem value="minimal">최소 (뒤집기만)</SelectItem>
                  <SelectItem value="aggressive">적극적 (모든 변환 적용)</SelectItem>
                  <SelectItem value="custom">사용자 정의</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="augmentation-factor">증강 배수</Label>
              <Select defaultValue="2" disabled={isTraining || isLoading}>
                <SelectTrigger id="augmentation-factor">
                  <SelectValue placeholder="증강 배수 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1배 (증강 없음)</SelectItem>
                  <SelectItem value="2">2배</SelectItem>
                  <SelectItem value="3">3배</SelectItem>
                  <SelectItem value="5">5배</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  )
}
