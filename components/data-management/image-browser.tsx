"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Upload, Filter, Tag, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Image } from "@/types/dataset"

interface ImageBrowserProps {
  datasetId: string | null
  onSelectImage?: (imageId: string) => void
  selectedImage: string | null
}

// 샘플 이미지 데이터
const sampleImages: Image[] = [
  {
    id: "img-001",
    datasetId: "dataset-001",
    filename: "truck_highway_001.jpg",
    url: "/truck-detection-1.png",
    width: 1280,
    height: 720,
    annotated: true,
    annotations: [
      {
        id: "ann-001",
        imageId: "img-001",
        label: "트럭",
        bbox: [120, 150, 400, 250],
        confidence: 0.95,
        createdAt: "2023-06-15T10:30:00Z",
        updatedBy: "user1",
      },
    ],
    createdAt: "2023-06-15T10:30:00Z",
    tags: ["고속도로", "주간"],
  },
  {
    id: "img-002",
    datasetId: "dataset-001",
    filename: "truck_highway_002.jpg",
    url: "/truck-detection-2.png",
    width: 1280,
    height: 720,
    annotated: true,
    annotations: [
      {
        id: "ann-002",
        imageId: "img-002",
        label: "트럭",
        bbox: [200, 180, 380, 240],
        confidence: 0.92,
        createdAt: "2023-06-15T11:15:00Z",
        updatedBy: "user1",
      },
    ],
    createdAt: "2023-06-15T11:15:00Z",
    tags: ["고속도로", "주간"],
  },
  {
    id: "img-003",
    datasetId: "dataset-001",
    filename: "truck_highway_003.jpg",
    url: "/truck-detection-3.png",
    width: 1280,
    height: 720,
    annotated: false,
    annotations: [],
    createdAt: "2023-06-15T12:45:00Z",
    tags: ["고속도로", "주간"],
  },
  {
    id: "img-004",
    datasetId: "dataset-002",
    filename: "container_truck_001.jpg",
    url: "/truck-container.png",
    width: 1280,
    height: 720,
    annotated: true,
    annotations: [
      {
        id: "ann-003",
        imageId: "img-004",
        label: "컨테이너 트럭",
        bbox: [150, 170, 420, 260],
        confidence: 0.89,
        createdAt: "2023-07-20T09:30:00Z",
        updatedBy: "user2",
      },
    ],
    createdAt: "2023-07-20T09:30:00Z",
    tags: ["항만", "컨테이너"],
  },
  {
    id: "img-005",
    datasetId: "dataset-003",
    filename: "truck_night_001.jpg",
    url: "/truck-at-night.png",
    width: 1280,
    height: 720,
    annotated: true,
    annotations: [
      {
        id: "ann-004",
        imageId: "img-005",
        label: "트럭",
        bbox: [180, 200, 350, 230],
        confidence: 0.78,
        createdAt: "2023-09-10T22:15:00Z",
        updatedBy: "user1",
      },
    ],
    createdAt: "2023-09-10T22:15:00Z",
    tags: ["야간", "저조도"],
  },
  {
    id: "img-006",
    datasetId: "dataset-004",
    filename: "truck_rain_001.jpg",
    url: "/truck-side-view.png",
    width: 1280,
    height: 720,
    annotated: false,
    annotations: [],
    createdAt: "2023-10-15T14:20:00Z",
    tags: ["악천후", "비"],
  },
]

export function ImageBrowser({ datasetId, onSelectImage = () => {}, selectedImage }: ImageBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAnnotated, setFilterAnnotated] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [isLoading, setIsLoading] = useState(false)

  // 데이터셋 ID가 변경될 때 로딩 상태 표시
  useEffect(() => {
    if (datasetId) {
      setIsLoading(true)
      // 실제 구현에서는 API 호출 등으로 이미지 데이터를 가져옴
      // 여기서는 간단한 타이머로 로딩 시뮬레이션
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [datasetId])

  // 현재 데이터셋에 속한 이미지만 필터링
  const datasetImages = sampleImages.filter((img) => (datasetId ? img.datasetId === datasetId : true))

  // 검색어, 어노테이션 상태에 따라 필터링
  const filteredImages = datasetImages.filter((img) => {
    const matchesSearch =
      img.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesAnnotation =
      filterAnnotated === "all" ||
      (filterAnnotated === "annotated" && img.annotated) ||
      (filterAnnotated === "not-annotated" && !img.annotated)

    return matchesSearch && matchesAnnotation
  })

  // 정렬
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortBy === "name-asc") {
      return a.filename.localeCompare(b.filename)
    } else if (sortBy === "name-desc") {
      return b.filename.localeCompare(a.filename)
    }
    return 0
  })

  // 이미지 선택 핸들러
  const handleImageSelect = (imageId: string) => {
    console.log("이미지 브라우저에서 이미지 선택:", imageId)
    if (typeof onSelectImage === "function") {
      onSelectImage(imageId)
    }
  }

  // 데이터셋이 선택되지 않은 경우 안내 메시지 표시
  if (!datasetId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">이미지 브라우저</h2>
        </div>

        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>데이터셋 필요</AlertTitle>
          <AlertDescription>
            이미지를 보려면 먼저 데이터셋을 선택하세요. 데이터셋 탭으로 이동하여 데이터셋을 선택하세요.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 로딩 중인 경우 로딩 표시
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">이미지 브라우저</h2>
          <p className="text-sm text-muted-foreground">선택된 데이터셋: {datasetId}</p>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">이미지 로딩 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">이미지 브라우저</h2>
        <p className="text-sm text-muted-foreground">선택된 데이터셋: {datasetId}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="이미지 검색..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-2/3">
          <div className="w-full md:w-1/3">
            <Select value={filterAnnotated} onValueChange={setFilterAnnotated}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="어노테이션 상태" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 이미지</SelectItem>
                <SelectItem value="annotated">어노테이션 완료</SelectItem>
                <SelectItem value="not-annotated">어노테이션 미완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-1/3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">최신순</SelectItem>
                <SelectItem value="oldest">오래된순</SelectItem>
                <SelectItem value="name-asc">이름 (오름차순)</SelectItem>
                <SelectItem value="name-desc">이름 (내림차순)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="whitespace-nowrap">
            <Upload className="mr-2 h-4 w-4" />
            이미지 업로드
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedImages.map((image) => (
          <Card
            key={image.id}
            className={`cursor-pointer overflow-hidden transition-all hover:border-primary ${selectedImage === image.id ? "border-primary ring-1 ring-primary" : ""}`}
            onClick={() => handleImageSelect(image.id)}
          >
            <div className="relative aspect-video">
              <img
                src={image.url || "/placeholder.svg"}
                alt={image.filename}
                className="object-cover w-full h-full"
                onError={(e) => {
                  // 이미지 로드 실패 시 대체 이미지 표시
                  e.currentTarget.src = "/classic-red-pickup.png"
                }}
              />
              {image.annotated ? (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    어노테이션 완료
                  </Badge>
                </div>
              ) : (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    어노테이션 필요
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <div className="text-sm font-medium truncate" title={image.filename}>
                {image.filename}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {image.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1 text-xs">
                    <Tag className="h-2 w-2" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                <span>
                  {image.width}x{image.height}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">검색 결과가 없습니다.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setFilterAnnotated("all")
            }}
          >
            모든 이미지 보기
          </Button>
        </div>
      )}
    </div>
  )
}
