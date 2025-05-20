"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Download, Upload, FileText, Archive } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { convertToYOLOYAML, downloadFile, getFormattedDate } from "@/utils/export-utils"
import type { Dataset, Image } from "@/types/dataset"

export function DataImportExport() {
  const [importProgress, setImportProgress] = useState(0)
  const [exportProgress, setExportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<"idle" | "importing" | "success" | "error">("idle")
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success" | "error">("idle")
  const [selectedFormat, setSelectedFormat] = useState("coco")
  const [trainSplit, setTrainSplit] = useState(70)
  const [valSplit, setValSplit] = useState(20)
  const [testSplit, setTestSplit] = useState(10)
  const [includeTestSplit, setIncludeTestSplit] = useState(false)

  const handleImport = () => {
    setImportStatus("importing")
    setImportProgress(0)

    // 가상의 진행 상황 시뮬레이션
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setImportStatus("success")
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleExport = () => {
    setExportStatus("exporting")
    setExportProgress(0)

    // 가상의 진행 상황 시뮬레이션
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setExportStatus("success")

          // 내보내기 완료 후 파일 다운로드 (예시)
          if (selectedFormat === "yaml") {
            // 실제 구현에서는 실제 데이터셋과 이미지를 사용해야 함
            const mockDataset: Dataset = {
              id: "dataset-1",
              name: "트럭 데이터셋 2023",
              description: "트럭 및 컨테이너 이미지 데이터셋",
              imageCount: 1000,
              annotatedCount: 950,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              tags: ["트럭", "컨테이너", "번호판"],
              status: "active",
            }

            const mockImages: Image[] = []
            // 실제 구현에서는 실제 이미지 데이터를 사용

            const yamlContent = convertToYOLOYAML(
              mockDataset,
              mockImages,
              trainSplit,
              valSplit,
              testSplit,
              includeTestSplit,
            )

            downloadFile(yamlContent, `truck_dataset_${getFormattedDate()}.yaml`, "application/x-yaml")
          }

          return 100
        }
        return prev + 20
      })
    }, 300)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>데이터 가져오기/내보내기</CardTitle>
        <CardDescription>데이터셋을 다양한 형식으로 가져오거나 내보냅니다</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">데이터 가져오기</TabsTrigger>
            <TabsTrigger value="export">데이터 내보내기</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="grid w-full gap-4">
              <div className="grid gap-2">
                <Label htmlFor="import-format">가져오기 형식</Label>
                <Select defaultValue="coco">
                  <SelectTrigger>
                    <SelectValue placeholder="형식 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coco">COCO JSON</SelectItem>
                    <SelectItem value="voc">Pascal VOC XML</SelectItem>
                    <SelectItem value="yolo">YOLO TXT</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="import-file">파일 선택</Label>
                <div className="flex gap-2">
                  <Input id="import-file" type="file" />
                  <Button variant="outline">찾아보기</Button>
                </div>
              </div>

              {importStatus === "importing" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>가져오기 진행 중...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              {importStatus === "success" && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">가져오기 완료</AlertTitle>
                  <AlertDescription className="text-green-700">데이터셋이 성공적으로 가져와졌습니다.</AlertDescription>
                </Alert>
              )}

              {importStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>가져오기 실패</AlertTitle>
                  <AlertDescription>데이터셋을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="grid w-full gap-4">
              <div className="grid gap-2">
                <Label htmlFor="export-dataset">데이터셋 선택</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="데이터셋 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 데이터셋</SelectItem>
                    <SelectItem value="trucks-2023">트럭 데이터셋 2023</SelectItem>
                    <SelectItem value="containers-2023">컨테이너 데이터셋 2023</SelectItem>
                    <SelectItem value="license-plates">번호판 데이터셋</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="export-format">내보내기 형식</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="형식 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coco">COCO JSON</SelectItem>
                    <SelectItem value="voc">Pascal VOC XML</SelectItem>
                    <SelectItem value="yolo">YOLO TXT</SelectItem>
                    <SelectItem value="yaml">YOLO YAML</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="export-options">내보내기 옵션</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="include-images" className="rounded border-gray-300" />
                    <label htmlFor="include-images">이미지 포함</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-annotations"
                      className="rounded border-gray-300"
                      defaultChecked
                    />
                    <label htmlFor="include-annotations">어노테이션 포함</label>
                  </div>
                </div>
              </div>

              {selectedFormat === "yaml" && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-train-val-split"
                      className="rounded border-gray-300"
                      defaultChecked
                    />
                    <label htmlFor="include-train-val-split">학습/검증 데이터 분할 포함</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-test-split"
                      className="rounded border-gray-300"
                      onChange={(e) => setIncludeTestSplit(e.target.checked)}
                    />
                    <label htmlFor="include-test-split">테스트 데이터 분할 포함</label>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <Label htmlFor="train-split">학습 비율 (%)</Label>
                      <Input
                        id="train-split"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue="70"
                        onChange={(e) => setTrainSplit(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="val-split">검증 비율 (%)</Label>
                      <Input
                        id="val-split"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue="20"
                        onChange={(e) => setValSplit(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="test-split">테스트 비율 (%)</Label>
                      <Input
                        id="test-split"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue="10"
                        onChange={(e) => setTestSplit(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {exportStatus === "exporting" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>내보내기 진행 중...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} />
                </div>
              )}

              {exportStatus === "success" && selectedFormat === "yaml" && (
                <Alert variant="default" className="bg-green-50 border-green-200 mt-4">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">YOLO YAML 내보내기 완료</AlertTitle>
                  <AlertDescription className="text-green-700">
                    YOLO YAML 형식으로 데이터셋이 성공적으로 내보내졌습니다. 데이터셋 폴더, 이미지, 라벨 파일 및 YAML
                    설정 파일이 포함되어 있습니다.
                  </AlertDescription>
                </Alert>
              )}

              {exportStatus === "success" && selectedFormat !== "yaml" && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">내보내기 완료</AlertTitle>
                  <AlertDescription className="text-green-700">데이터셋이 성공적으로 내보내졌습니다.</AlertDescription>
                </Alert>
              )}

              {exportStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>내보내기 실패</AlertTitle>
                  <AlertDescription>데이터셋을 내보내는 중 오류가 발생했습니다. 다시 시도해주세요.</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {importStatus === "idle" && (
          <Button onClick={handleImport} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            가져오기
          </Button>
        )}

        {exportStatus === "idle" && (
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            내보내기
          </Button>
        )}

        {exportStatus === "success" && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // 선택된 형식에 따라 다른 다운로드 처리
              if (selectedFormat === "yaml") {
                // YAML 파일 다운로드 (실제 구현에서는 ZIP 파일로 패키징해야 함)
                const mockDataset: Dataset = {
                  id: "dataset-1",
                  name: "트럭 데이터셋 2023",
                  description: "트럭 및 컨테이너 이미지 데이터셋",
                  imageCount: 1000,
                  annotatedCount: 950,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  tags: ["트럭", "컨테이너", "번호판"],
                  status: "active",
                }

                const mockImages: Image[] = []
                // 실제 구현에서는 실제 이미지 데이터를 사용

                const yamlContent = convertToYOLOYAML(
                  mockDataset,
                  mockImages,
                  trainSplit,
                  valSplit,
                  testSplit,
                  includeTestSplit,
                )

                downloadFile(yamlContent, `truck_dataset_${getFormattedDate()}.yaml`, "application/x-yaml")
              } else {
                // 기존 다운로드 로직
              }
            }}
          >
            {selectedFormat === "yaml" ? (
              <>
                <Archive className="h-4 w-4" />
                YOLO 데이터셋 다운로드
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                파일 다운로드
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
