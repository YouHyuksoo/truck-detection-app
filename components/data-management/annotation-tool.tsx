"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Save,
  ZoomIn,
  Move,
  Square,
  Tag,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ImageOff,
  Info,
  RefreshCw,
} from "lucide-react"
import type { Image, Annotation } from "@/types/dataset"
import { useToast } from "@/hooks/use-toast"

interface AnnotationToolProps {
  datasetId: string | null
  imageId: string | null
}

// 샘플 이미지 데이터 - 더 많은 이미지 추가
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
  {
    id: "img-007",
    datasetId: "dataset-001",
    filename: "classic_red_pickup.jpg",
    url: "/classic-red-pickup.png",
    width: 1280,
    height: 720,
    annotated: false,
    annotations: [],
    createdAt: "2023-11-05T09:30:00Z",
    tags: ["픽업트럭", "클래식"],
  },
]

// 사용 가능한 라벨
const availableLabels = ["트럭", "컨테이너 트럭", "탱크로리", "화물차", "기타"]

// 기본 이미지 생성 함수 (이미지 로드 실패 시 사용)
const createPlaceholderImage = (width: number, height: number, text: string): HTMLImageElement => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")

  if (ctx) {
    // 배경 채우기
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(0, 0, width, height)

    // 텍스트 스타일 설정
    ctx.font = "24px Arial"
    ctx.fillStyle = "#6b7280"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // 텍스트 그리기
    ctx.fillText(text, width / 2, height / 2)

    // 테두리 그리기
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, width, height)
  }

  // 캔버스를 이미지로 변환
  const img = new Image()
  img.src = canvas.toDataURL("image/png")
  return img
}

export function AnnotationTool({ datasetId, imageId }: AnnotationToolProps) {
  const [currentImage, setCurrentImage] = useState<Image | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [currentLabel, setCurrentLabel] = useState(availableLabels[0])
  const [zoomLevel, setZoomLevel] = useState(100)
  const [tool, setTool] = useState<"box" | "move">("box")
  const [showConfidence, setShowConfidence] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const { toast } = useToast()

  // 디버깅을 위한 상태 로깅
  useEffect(() => {
    console.log("어노테이션 도구 상태:", { datasetId, imageId, currentImage })
  }, [datasetId, imageId, currentImage])

  // 이미지 ID가 변경될 때 이미지 데이터 로드
  useEffect(() => {
    if (imageId) {
      console.log("이미지 로드 시작:", imageId)
      setIsLoading(true)
      setError(null)

      // 실제 구현에서는 API 호출 등으로 이미지 데이터를 가져옴
      // 여기서는 샘플 데이터에서 찾는 방식으로 구현
      setTimeout(() => {
        try {
          const image = sampleImages.find((img) => img.id === imageId)

          if (image) {
            console.log("이미지 찾음:", image)
            setCurrentImage(image)
            setAnnotations(image.annotations || [])
            setIsLoading(false)

            // 이미지 로드 성공 토스트
            toast({
              title: "이미지 로드 완료",
              description: `${image.filename} 이미지가 로드되었습니다.`,
              duration: 3000,
            })
          } else {
            console.error("이미지를 찾을 수 없음:", imageId)
            setCurrentImage(null)
            setAnnotations([])
            setIsLoading(false)
            setError(`이미지 ID ${imageId}를 찾을 수 없습니다.`)

            // 이미지 로드 실패 토스트
            toast({
              title: "이미지 로드 실패",
              description: `이미지 ID ${imageId}를 찾을 수 없습니다.`,
              variant: "destructive",
              duration: 3000,
            })
          }
        } catch (err) {
          console.error("이미지 로드 오류:", err)
          setCurrentImage(null)
          setAnnotations([])
          setIsLoading(false)
          setError("이미지 로드 중 오류가 발생했습니다.")

          // 이미지 로드 오류 토스트
          toast({
            title: "이미지 로드 오류",
            description: "이미지 로드 중 오류가 발생했습니다.",
            variant: "destructive",
            duration: 3000,
          })
        }
      }, 500) // 로딩 시뮬레이션을 위한 지연
    } else {
      setCurrentImage(null)
      setAnnotations([])
    }
  }, [imageId, toast])

  // 캔버스에 이미지와 어노테이션 그리기
  useEffect(() => {
    if (!canvasRef.current || !currentImage) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    console.log("캔버스 그리기 시작:", currentImage.url)

    // 캔버스 크기 설정
    canvas.width = currentImage.width
    canvas.height = currentImage.height

    // 이미지 로드 및 그리기
    const img = new Image()

    // CORS 설정 - 이미지 로드 전에 설정해야 함
    img.crossOrigin = "anonymous"

    // 이미지 로드 성공 핸들러
    img.onload = () => {
      console.log("이미지 로드 완료:", img.width, img.height)
      imageRef.current = img

      // 캔버스 초기화
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 어노테이션 그리기
      drawAnnotations()

      // 이미지 로드 성공 로그
      console.log("이미지 및 어노테이션 그리기 완료")

      // 오류 상태 초기화
      setError(null)
    }

    // 이미지 로드 실패 핸들러
    img.onerror = (err) => {
      console.error("이미지 로드 실패:", err)

      // 오류 상세 정보 로깅
      console.log("이미지 URL:", currentImage.url)
      console.log("이미지 크기:", currentImage.width, "x", currentImage.height)

      // 대체 이미지 생성 및 사용
      const placeholderImg = createPlaceholderImage(
        currentImage.width,
        currentImage.height,
        "이미지를 로드할 수 없습니다",
      )

      imageRef.current = placeholderImg

      // 대체 이미지가 로드되면 캔버스에 그리기
      placeholderImg.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(placeholderImg, 0, 0, canvas.width, canvas.height)

        // 경고 메시지 표시
        setError("이미지를 로드할 수 없습니다. 대체 이미지를 표시합니다.")

        // 이미지 로드 실패 토스트
        toast({
          title: "이미지 로드 실패",
          description: "이미지 파일을 로드할 수 없어 대체 이미지를 표시합니다.",
          variant: "destructive",
          duration: 3000,
        })
      }
    }

    // 이미지 URL 설정 - 절대 경로 사용
    // 상대 경로를 절대 경로로 변환
    const baseUrl = window.location.origin
    const absoluteUrl = currentImage.url.startsWith("/") ? `${baseUrl}${currentImage.url}` : currentImage.url

    console.log("이미지 로드 시도:", absoluteUrl)
    img.src = absoluteUrl

    // 이미지 로드 타임아웃 설정 (5초)
    const timeoutId = setTimeout(() => {
      if (!imageRef.current) {
        console.error("이미지 로드 타임아웃")
        img.src = "" // 로드 중단

        // 대체 이미지 생성 및 사용
        const placeholderImg = createPlaceholderImage(currentImage.width, currentImage.height, "이미지 로드 시간 초과")

        imageRef.current = placeholderImg

        placeholderImg.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(placeholderImg, 0, 0, canvas.width, canvas.height)

          setError("이미지 로드 시간이 초과되었습니다. 대체 이미지를 표시합니다.")

          toast({
            title: "이미지 로드 시간 초과",
            description: "이미지 로드 시간이 초과되었습니다. 대체 이미지를 표시합니다.",
            variant: "destructive",
            duration: 3000,
          })
        }
      }
    }, 5000)

    // 컴포넌트 언마운트 시 타임아웃 정리
    return () => clearTimeout(timeoutId)
  }, [currentImage, toast])

  // 어노테이션 변경 시 다시 그리기
  useEffect(() => {
    if (currentImage) {
      if (isDrawing && startPoint && currentPoint) {
        drawAnnotationsWithPreview()
      } else {
        drawAnnotations()
      }
    }
  }, [annotations, selectedAnnotation, showConfidence, isDrawing, startPoint, currentPoint])

  // 어노테이션 그리기 함수
  const drawAnnotations = () => {
    if (!canvasRef.current || !currentImage) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 이미지 참조가 없는 경우 대체 이미지 생성
    if (!imageRef.current) {
      const placeholderImg = createPlaceholderImage(currentImage.width, currentImage.height, "이미지 준비 중...")

      imageRef.current = placeholderImg

      placeholderImg.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(placeholderImg, 0, 0, canvas.width, canvas.height)
      }

      return
    }

    // 캔버스 초기화 및 이미지 다시 그리기
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

    // 어노테이션 그리기
    annotations.forEach((ann) => {
      const [x, y, width, height] = ann.bbox

      // 선택된 어노테이션은 다른 색상으로 표시
      if (ann.id === selectedAnnotation) {
        ctx.strokeStyle = "#FF3366"
        ctx.lineWidth = 3
      } else {
        ctx.strokeStyle = "#00FF00"
        ctx.lineWidth = 2
      }

      ctx.strokeRect(x, y, width, height)

      // 라벨 표시
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(x, y - 20, 100, 20)
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "12px Arial"

      let labelText = ann.label
      if (showConfidence) {
        labelText += ` (${Math.round(ann.confidence * 100)}%)`
      }

      ctx.fillText(labelText, x + 5, y - 5)
    })
  }

  // 임시 박스를 포함한 어노테이션 그리기 함수
  const drawAnnotationsWithPreview = () => {
    if (!canvasRef.current || !currentImage || !startPoint || !currentPoint) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 이미지 참조가 없는 경우 대체 이미지 생성
    if (!imageRef.current) {
      return
    }

    // 캔버스 초기화 및 이미지 다시 그리기
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

    // 기존 어노테이션 그리기
    annotations.forEach((ann) => {
      const [x, y, width, height] = ann.bbox

      // 선택된 어노테이션은 다른 색상으로 표시
      if (ann.id === selectedAnnotation) {
        ctx.strokeStyle = "#FF3366"
        ctx.lineWidth = 3
      } else {
        ctx.strokeStyle = "#00FF00"
        ctx.lineWidth = 2
      }

      ctx.strokeRect(x, y, width, height)

      // 라벨 표시
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(x, y - 20, 100, 20)
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "12px Arial"

      let labelText = ann.label
      if (showConfidence) {
        labelText += ` (${Math.round(ann.confidence * 100)}%)`
      }

      ctx.fillText(labelText, x + 5, y - 5)
    })

    // 임시 박스 그리기 (드래그 중)
    if (isDrawing && startPoint && currentPoint) {
      const width = currentPoint.x - startPoint.x
      const height = currentPoint.y - startPoint.y

      ctx.strokeStyle = "#3B82F6" // 파란색
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5]) // 점선 스타일

      // 시작점에서 width, height 크기로 그리기
      ctx.strokeRect(startPoint.x, startPoint.y, width, height)

      // 크기 표시
      const absWidth = Math.abs(width)
      const absHeight = Math.abs(height)
      const sizeText = `${Math.round(absWidth)} x ${Math.round(absHeight)}`

      ctx.fillStyle = "rgba(59, 130, 246, 0.7)" // 반투명 파란색
      ctx.fillRect(currentPoint.x - 70, currentPoint.y - 20, 70, 20)

      ctx.fillStyle = "#FFFFFF"
      ctx.font = "12px Arial"
      ctx.fillText(sizeText, currentPoint.x - 65, currentPoint.y - 5)

      ctx.setLineDash([]) // 점선 스타일 초기화
    }
  }

  // 어노테이션 선택
  const handleSelectAnnotation = (annotationId: string) => {
    console.log("어노테이션 선택:", annotationId)
    setSelectedAnnotation(annotationId)
  }

  // 어노테이션 삭제
  const handleDeleteAnnotation = (annotationId: string) => {
    console.log("어노테이션 삭제:", annotationId)
    setAnnotations(annotations.filter((ann) => ann.id !== annotationId))
    if (selectedAnnotation === annotationId) {
      setSelectedAnnotation(null)
    }

    // 어노테이션 삭제 토스트
    toast({
      title: "어노테이션 삭제됨",
      description: "어노테이션이 성공적으로 삭제되었습니다.",
      duration: 3000,
    })
  }

  // 줌 레벨 변경
  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0])
  }

  // 이전/다음 이미지로 이동
  const navigateImage = (direction: "prev" | "next") => {
    if (!currentImage || !datasetId) return

    const datasetImages = sampleImages.filter((img) => img.datasetId === datasetId)
    const currentIndex = datasetImages.findIndex((img) => img.id === currentImage.id)

    if (direction === "prev" && currentIndex > 0) {
      const prevImage = datasetImages[currentIndex - 1]
      console.log("이전 이미지로 이동:", prevImage.id)
      setCurrentImage(prevImage)
      setAnnotations(prevImage.annotations || [])
      setSelectedAnnotation(null)

      // 이전 이미지 이동 토스트
      toast({
        title: "이전 이미지",
        description: `${prevImage.filename} 이미지로 이동했습니다.`,
        duration: 2000,
      })
    } else if (direction === "next" && currentIndex < datasetImages.length - 1) {
      const nextImage = datasetImages[currentIndex + 1]
      console.log("다음 이미지로 이동:", nextImage.id)
      setCurrentImage(nextImage)
      setAnnotations(nextImage.annotations || [])
      setSelectedAnnotation(null)

      // 다음 이미지 이동 토스트
      toast({
        title: "다음 이미지",
        description: `${nextImage.filename} 이미지로 이동했습니다.`,
        duration: 2000,
      })
    }
  }

  // 마우스 다운 이벤트 핸들러 - 드로잉 시작
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "box" || !canvasRef.current || !currentImage) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setIsDrawing(true)
    setStartPoint({ x, y })
    setCurrentPoint({ x, y })

    console.log("드로잉 시작:", { x, y })
  }

  // 마우스 이동 이벤트 핸들러 - 드로잉 중
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || tool !== "box" || !canvasRef.current || !currentImage) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setCurrentPoint({ x, y })

    // 임시 박스 그리기
    drawAnnotationsWithPreview()
  }

  // 마우스 업 이벤트 핸들러 - 드로잉 완료
  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !currentPoint || tool !== "box" || !currentImage) return

    // 최소 크기 검사 (10x10 픽셀 이상)
    const width = Math.abs(currentPoint.x - startPoint.x)
    const height = Math.abs(currentPoint.y - startPoint.y)

    if (width < 10 || height < 10) {
      console.log("박스가 너무 작습니다. 최소 10x10 픽셀 이상이어야 합니다.")
      setIsDrawing(false)
      setStartPoint(null)
      setCurrentPoint(null)
      drawAnnotations() // 임시 박스 제거

      toast({
        title: "박스 크기 부족",
        description: "바운딩 박스는 최소 10x10 픽셀 이상이어야 합니다.",
        variant: "destructive",
        duration: 3000,
      })

      return
    }

    // 좌표 계산 (좌상단 기준)
    const x = Math.min(startPoint.x, currentPoint.x)
    const y = Math.min(startPoint.y, currentPoint.y)

    // 새 어노테이션 생성
    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      imageId: currentImage.id,
      label: currentLabel,
      bbox: [x, y, width, height],
      confidence: 0.8,
      createdAt: new Date().toISOString(),
      updatedBy: "current-user",
    }

    console.log("새 어노테이션 추가:", newAnnotation)
    setAnnotations([...annotations, newAnnotation])
    setSelectedAnnotation(newAnnotation.id)

    // 상태 초기화
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)

    // 어노테이션 추가 토스트
    toast({
      title: "어노테이션 추가됨",
      description: `${currentLabel} 라벨의 새 어노테이션이 추가되었습니다.`,
      duration: 3000,
    })
  }

  // 마우스가 캔버스를 벗어날 경우 드로잉 취소
  const handleCanvasMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setStartPoint(null)
      setCurrentPoint(null)
      drawAnnotations() // 임시 박스 제거
    }
  }

  // 어노테이션 저장
  const handleSaveAnnotations = () => {
    if (!currentImage) return

    console.log("어노테이션 저장:", annotations)

    // 실제 구현에서는 API 호출 등으로 어노테이션 저장
    // 여기서는 토스트 메시지만 표시
    toast({
      title: "어노테이션 저장됨",
      description: `${annotations.length}개의 어노테이션이 저장되었습니다.`,
      duration: 3000,
    })
  }

  // 이미지 다시 로드
  const handleReloadImage = () => {
    if (!currentImage) return

    // 이미지 참조 초기화
    imageRef.current = null

    // 오류 상태 초기화
    setError(null)

    // 캔버스 다시 그리기
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "#f3f4f6"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.font = "16px Arial"
        ctx.fillStyle = "#6b7280"
        ctx.textAlign = "center"
        ctx.fillText("이미지 다시 로드 중...", canvas.width / 2, canvas.height / 2)
      }
    }

    // 이미지 다시 로드
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      console.log("이미지 다시 로드 완료")
      imageRef.current = img
      drawAnnotations()

      toast({
        title: "이미지 다시 로드됨",
        description: "이미지가 성공적으로 다시 로드되었습니다.",
        duration: 3000,
      })
    }

    img.onerror = (err) => {
      console.error("이미지 다시 로드 실패:", err)
      setError("이미지를 다시 로드할 수 없습니다.")

      toast({
        title: "이미지 다시 로드 실패",
        description: "이미지를 다시 로드할 수 없습니다.",
        variant: "destructive",
        duration: 3000,
      })
    }

    // 절대 경로 사용
    const baseUrl = window.location.origin
    const absoluteUrl = currentImage.url.startsWith("/") ? `${baseUrl}${currentImage.url}` : currentImage.url

    console.log("이미지 다시 로드 시도:", absoluteUrl)
    img.src = absoluteUrl
  }

  // 데이터셋이 선택되지 않은 경우
  if (!datasetId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">어노테이션 도구</h2>
        </div>

        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>데이터셋 필요</AlertTitle>
          <AlertDescription>
            어노테이션을 시작하려면 먼저 데이터셋을 선택하세요. 데이터셋 탭으로 이동하여 데이터셋을 선택하세요.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 이미지가 선택되지 않은 경우
  if (!imageId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">어노테이션 도구</h2>
        </div>

        <Alert>
          <ImageOff className="h-4 w-4" />
          <AlertTitle>이미지 필요</AlertTitle>
          <AlertDescription>
            어노테이션을 시작하려면 이미지를 선택하세요. 이미지 탭으로 이동하여 이미지를 선택하세요.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">어노테이션 도구</h2>
        </div>

        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="mt-4">이미지 로딩 중...</span>
        </div>
      </div>
    )
  }

  // 이미지가 로드되지 않은 경우
  if (!currentImage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">어노테이션 도구</h2>
        </div>

        <Alert variant="destructive">
          <ImageOff className="h-4 w-4" />
          <AlertTitle>이미지 로드 실패</AlertTitle>
          <AlertDescription>이미지를 로드할 수 없습니다. 다른 이미지를 선택하거나 다시 시도하세요.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">어노테이션 도구</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateImage("prev")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            이전
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateImage("next")}>
            다음
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>주의</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleReloadImage}>
              <RefreshCw className="h-4 w-4 mr-1" />
              이미지 다시 로드
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium">{currentImage.filename}</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTool("move")}
                    className={tool === "move" ? "bg-muted" : ""}
                  >
                    <Move className="h-4 w-4 mr-1" />
                    이동
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTool("box")}
                    className={tool === "box" ? "bg-muted" : ""}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    박스
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setZoomLevel(100)}>
                    <ZoomIn className="h-4 w-4 mr-1" />
                    {zoomLevel}%
                  </Button>
                </div>
              </div>

              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {tool === "box"
                    ? "박스 도구: 캔버스에서 드래그하여 바운딩 박스를 그리세요."
                    : "이동 도구: 캔버스를 드래그하여 이미지를 이동하세요."}
                </AlertDescription>
              </Alert>

              <div ref={containerRef} className="relative overflow-auto border rounded-md" style={{ height: "600px" }}>
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: "top left",
                    width: currentImage.width,
                    height: currentImage.height,
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    className={tool === "box" ? "cursor-crosshair" : "cursor-move"}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseLeave}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Slider value={[zoomLevel]} min={50} max={200} step={10} onValueChange={handleZoomChange} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>50%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="annotations">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="annotations">어노테이션</TabsTrigger>
              <TabsTrigger value="properties">속성</TabsTrigger>
            </TabsList>

            <TabsContent value="annotations" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">어노테이션 목록</h3>
                    <Button variant="outline" size="sm" onClick={handleSaveAnnotations}>
                      <Save className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {annotations.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">어노테이션이 없습니다.</p>
                    ) : (
                      annotations.map((ann) => (
                        <div
                          key={ann.id}
                          className={`p-2 border rounded-md cursor-pointer ${selectedAnnotation === ann.id ? "border-primary bg-primary/5" : ""}`}
                          onClick={() => handleSelectAnnotation(ann.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge>{ann.label}</Badge>
                              <span className="text-xs text-muted-foreground">{Math.round(ann.confidence * 100)}%</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAnnotation(ann.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {`x: ${Math.round(ann.bbox[0])}, y: ${Math.round(ann.bbox[1])}, w: ${Math.round(ann.bbox[2])}, h: ${Math.round(ann.bbox[3])}`}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="label">새 어노테이션 라벨</Label>
                      <Select value={currentLabel} onValueChange={setCurrentLabel}>
                        <SelectTrigger id="label">
                          <SelectValue placeholder="라벨 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLabels.map((label) => (
                            <SelectItem key={label} value={label}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="filename">파일명</Label>
                    <Input id="filename" value={currentImage.filename} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimensions">크기</Label>
                    <Input id="dimensions" value={`${currentImage.width} x ${currentImage.height}`} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">태그</Label>
                    <div className="flex flex-wrap gap-2">
                      {currentImage.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="show-confidence" checked={showConfidence} onCheckedChange={setShowConfidence} />
                    <Label htmlFor="show-confidence">신뢰도 표시</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
