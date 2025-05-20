"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatasetList } from "./dataset-list"
import { ImageBrowser } from "./image-browser"
import { AnnotationTool } from "./annotation-tool"
import { DataAugmentation } from "./data-augmentation"
import { DataStatistics } from "./data-statistics"
import { DataImportExport } from "./data-import-export"
import { useToast } from "@/hooks/use-toast"

export function DataManagementDashboard() {
  const [activeTab, setActiveTab] = useState("datasets")
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const { toast } = useToast()

  // 이미지 선택 핸들러 함수
  const handleImageSelect = (imageId: string) => {
    console.log("이미지 선택됨:", imageId)
    setSelectedImageId(imageId)

    // 이미지 선택 시 토스트 메시지 표시
    toast({
      title: "이미지 선택됨",
      description: `이미지 ID: ${imageId}`,
      duration: 3000,
    })

    // 어노테이션 탭으로 자동 전환
    setActiveTab("annotation")
  }

  // 데이터셋 선택 핸들러 함수
  const handleDatasetSelect = (datasetId: string) => {
    console.log("데이터셋 선택됨:", datasetId)
    setSelectedDatasetId(datasetId)
    setSelectedImageId(null) // 데이터셋이 변경되면 선택된 이미지 초기화

    // 데이터셋 선택 시 이미지 탭으로 자동 전환
    setActiveTab("images")

    // 데이터셋 선택 시 토스트 메시지 표시
    toast({
      title: "데이터셋 선택됨",
      description: `데이터셋 ID: ${datasetId}`,
      duration: 3000,
    })
  }

  // 디버깅을 위한 상태 변화 로깅
  useEffect(() => {
    console.log("상태 업데이트:", {
      activeTab,
      selectedDatasetId,
      selectedImageId,
    })
  }, [activeTab, selectedDatasetId, selectedImageId])

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">데이터 관리</h1>
        <p className="text-muted-foreground mt-2">트럭 감지 모델을 위한 데이터셋을 관리하고 어노테이션을 수행합니다.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="datasets">데이터셋</TabsTrigger>
          <TabsTrigger value="images">이미지</TabsTrigger>
          <TabsTrigger value="annotation">어노테이션</TabsTrigger>
          <TabsTrigger value="augmentation">데이터 증강</TabsTrigger>
          <TabsTrigger value="statistics">통계</TabsTrigger>
          <TabsTrigger value="import-export">가져오기/내보내기</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="mt-6">
          <DatasetList onSelectDataset={handleDatasetSelect} selectedDataset={selectedDatasetId} />
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <ImageBrowser
            datasetId={selectedDatasetId}
            onSelectImage={handleImageSelect}
            selectedImage={selectedImageId}
          />
        </TabsContent>

        <TabsContent value="annotation" className="mt-6">
          <AnnotationTool datasetId={selectedDatasetId} imageId={selectedImageId} />
        </TabsContent>

        <TabsContent value="augmentation" className="mt-6">
          <DataAugmentation datasetId={selectedDatasetId} />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <DataStatistics />
        </TabsContent>

        <TabsContent value="import-export" className="mt-6">
          <DataImportExport />
        </TabsContent>
      </Tabs>

      {/* 현재 선택된 항목 표시 (디버깅용) */}
      <div className="text-sm text-muted-foreground border-t pt-4 mt-8">
        <p>
          현재 선택: {selectedDatasetId ? `데이터셋 ${selectedDatasetId}` : "데이터셋 없음"} /
          {selectedImageId ? `이미지 ${selectedImageId}` : "이미지 없음"}
        </p>
      </div>
    </div>
  )
}
