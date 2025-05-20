"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Search, ImageIcon, Tag, Calendar, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DatasetListProps {
  onSelectDataset?: (datasetId: string) => void
  selectedDataset?: string | null
}

// 샘플 데이터셋 데이터
const sampleDatasets = [
  {
    id: "dataset-001",
    name: "고속도로 트럭 데이터셋",
    description: "고속도로에서 촬영된 트럭 이미지 모음",
    imageCount: 150,
    tags: ["고속도로", "주간", "트럭"],
    createdAt: "2023-06-15T10:30:00Z",
    updatedAt: "2023-06-20T14:45:00Z",
  },
  {
    id: "dataset-002",
    name: "항만 컨테이너 트럭 데이터셋",
    description: "항만에서 촬영된 컨테이너 트럭 이미지 모음",
    imageCount: 120,
    tags: ["항만", "컨테이너", "트럭"],
    createdAt: "2023-07-10T09:15:00Z",
    updatedAt: "2023-07-15T11:30:00Z",
  },
  {
    id: "dataset-003",
    name: "야간 트럭 데이터셋",
    description: "야간에 촬영된 트럭 이미지 모음",
    imageCount: 80,
    tags: ["야간", "저조도", "트럭"],
    createdAt: "2023-09-05T20:10:00Z",
    updatedAt: "2023-09-10T22:30:00Z",
  },
  {
    id: "dataset-004",
    name: "악천후 트럭 데이터셋",
    description: "비, 안개 등 악천후 상황에서 촬영된 트럭 이미지 모음",
    imageCount: 60,
    tags: ["악천후", "비", "안개", "트럭"],
    createdAt: "2023-10-12T13:45:00Z",
    updatedAt: "2023-10-15T16:20:00Z",
  },
]

export function DatasetList({ onSelectDataset, selectedDataset }: DatasetListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [newDatasetName, setNewDatasetName] = useState("")
  const [newDatasetDescription, setNewDatasetDescription] = useState("")
  const [newDatasetTags, setNewDatasetTags] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // 검색어에 따라 데이터셋 필터링
  const filteredDatasets = sampleDatasets.filter(
    (dataset) =>
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // 새 데이터셋 생성 핸들러
  const handleCreateDataset = () => {
    // 실제 구현에서는 API 호출 등으로 데이터셋 생성
    console.log("새 데이터셋 생성:", {
      name: newDatasetName,
      description: newDatasetDescription,
      tags: newDatasetTags.split(",").map((tag) => tag.trim()),
    })

    // 입력 필드 초기화 및 다이얼로그 닫기
    setNewDatasetName("")
    setNewDatasetDescription("")
    setNewDatasetTags("")
    setIsCreateDialogOpen(false)
  }

  // 데이터셋 선택 핸들러
  const handleSelectDataset = (datasetId: string) => {
    if (onSelectDataset) {
      onSelectDataset(datasetId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">데이터셋</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />새 데이터셋
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 데이터셋 생성</DialogTitle>
              <DialogDescription>새로운 데이터셋의 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">데이터셋 이름</Label>
                <Input
                  id="name"
                  value={newDatasetName}
                  onChange={(e) => setNewDatasetName(e.target.value)}
                  placeholder="예: 고속도로 트럭 데이터셋"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={newDatasetDescription}
                  onChange={(e) => setNewDatasetDescription(e.target.value)}
                  placeholder="데이터셋에 대한 설명을 입력하세요."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">태그</Label>
                <Input
                  id="tags"
                  value={newDatasetTags}
                  onChange={(e) => setNewDatasetTags(e.target.value)}
                  placeholder="쉼표로 구분하여 입력 (예: 고속도로, 주간, 트럭)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateDataset}>생성</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="데이터셋 검색..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDatasets.map((dataset) => (
          <Card
            key={dataset.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedDataset === dataset.id ? "border-primary ring-1 ring-primary" : ""
            }`}
            onClick={() => handleSelectDataset(dataset.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{dataset.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">메뉴 열기</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>편집</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>삭제</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{dataset.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {dataset.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ImageIcon className="mr-1 h-4 w-4" />
                <span>{dataset.imageCount}개 이미지</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                <span>
                  생성: {new Date(dataset.createdAt).toLocaleDateString()} | 수정:{" "}
                  {new Date(dataset.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">검색 결과가 없습니다.</p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            모든 데이터셋 보기
          </Button>
        </div>
      )}
    </div>
  )
}
