"use client"

import { useState } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, Info, Calendar, Tag, CheckCircle2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ModelInfo {
  id: string
  name: string
  version: string
  type: string
  accuracy: number
  size: string
  createdAt: string
  lastUsed: string
  status: "active" | "archived" | "training"
  tags: string[]
}

export default function ModelSelection() {
  const [models, setModels] = useState<ModelInfo[]>([
    {
      id: "model-1",
      name: "YOLOv8m 기본 모델",
      version: "v8.0.0",
      type: "pretrained",
      accuracy: 89.5,
      size: "78.5MB",
      createdAt: "2023-01-15",
      lastUsed: "2023-05-10",
      status: "active",
      tags: ["기본", "공식"],
    },
    {
      id: "model-2",
      name: "트럭 감지 모델 v1",
      version: "1.0.0",
      type: "custom",
      accuracy: 92.3,
      size: "82.1MB",
      createdAt: "2023-04-15",
      lastUsed: "2023-05-18",
      status: "archived",
      tags: ["트럭", "커스텀"],
    },
    {
      id: "model-3",
      name: "트럭 감지 모델 v2",
      version: "2.0.0",
      type: "custom",
      accuracy: 94.7,
      size: "85.3MB",
      createdAt: "2023-06-22",
      lastUsed: "2023-09-05",
      status: "active",
      tags: ["트럭", "커스텀", "최적화"],
    },
    {
      id: "model-4",
      name: "트럭 감지 모델 v3",
      version: "3.0.0",
      type: "finetuned",
      accuracy: 96.2,
      size: "86.7MB",
      createdAt: "2023-09-10",
      lastUsed: "2023-09-10",
      status: "active",
      tags: ["트럭", "파인튜닝", "야간"],
    },
  ])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [modelFilter, setModelFilter] = useState<string>("all")
  const { toast } = useToast()

  // 모델 필터링
  const filteredModels = models.filter((model) => {
    if (modelFilter === "all") return true
    if (modelFilter === "active") return model.status === "active"
    if (modelFilter === "pretrained") return model.type === "pretrained"
    if (modelFilter === "custom") return model.type === "custom"
    if (modelFilter === "finetuned") return model.type === "finetuned"
    return true
  })

  // 모델 선택 핸들러
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId)

    const model = models.find((m) => m.id === modelId)
    if (model) {
      toast({
        title: "모델 선택됨",
        description: `${model.name}이(가) 파인튜닝을 위해 선택되었습니다.`,
      })
    }
  }

  // 모델 다운로드 핸들러
  const handleDownloadModel = (modelId: string) => {
    const model = models.find((m) => m.id === modelId)
    if (model) {
      toast({
        title: "모델 다운로드 시작",
        description: `${model.name} 다운로드가 시작되었습니다.`,
      })
    }
  }

  return (
    <>
      <CardHeader>
        <CardTitle>모델 선택</CardTitle>
        <CardDescription>파인튜닝을 위한 기본 모델을 선택합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Label htmlFor="modelFilter">모델 필터</Label>
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger id="modelFilter" className="w-[180px]">
                <SelectValue placeholder="모든 모델" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 모델</SelectItem>
                <SelectItem value="active">활성 모델</SelectItem>
                <SelectItem value="pretrained">사전 학습 모델</SelectItem>
                <SelectItem value="custom">커스텀 모델</SelectItem>
                <SelectItem value="finetuned">파인튜닝 모델</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            모델 가져오기
          </Button>
        </div>

        <Separator />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">선택</TableHead>
                <TableHead>모델 이름</TableHead>
                <TableHead>유형</TableHead>
                <TableHead className="text-right">정확도</TableHead>
                <TableHead>크기</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <input
                      type="radio"
                      name="selectedModel"
                      checked={selectedModel === model.id}
                      onChange={() => handleSelectModel(model.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">v{model.version}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        model.type === "pretrained"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : model.type === "custom"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-green-50 text-green-700 border-green-200"
                      }
                    >
                      {model.type === "pretrained" ? "사전 학습" : model.type === "custom" ? "커스텀" : "파인튜닝"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{model.accuracy}%</TableCell>
                  <TableCell>{model.size}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{model.createdAt}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {model.status === "active" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        활성
                      </Badge>
                    ) : model.status === "archived" ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        보관됨
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        학습 중
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadModel(model.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>모델 다운로드</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>모델 상세 정보</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">선택된 모델 정보</h3>
          {selectedModel ? (
            (() => {
              const model = models.find((m) => m.id === selectedModel)
              if (!model) return <p>모델 정보를 찾을 수 없습니다.</p>

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">모델 이름:</span>
                      <span className="font-medium">{model.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">버전:</span>
                      <span>{model.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">유형:</span>
                      <span>
                        {model.type === "pretrained" ? "사전 학습" : model.type === "custom" ? "커스텀" : "파인튜닝"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">정확도:</span>
                      <span>{model.accuracy}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">크기:</span>
                      <span>{model.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">생성일:</span>
                      <span>{model.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">마지막 사용:</span>
                      <span>{model.lastUsed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">태그:</span>
                      <div className="flex gap-1">
                        {model.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()
          ) : (
            <p className="text-muted-foreground">파인튜닝을 위한 기본 모델을 선택해주세요.</p>
          )}
        </div>
      </CardContent>
    </>
  )
}
