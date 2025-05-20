"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Square, Pencil, Trash2, Save, Upload, Play, Pause, RefreshCw, Move, Undo, Redo, ImageIcon } from "lucide-react"
import RoiList from "./roi-list"
import RoiProperties from "./roi-properties"
import type { RoiData, RoiPoint, DrawingMode } from "@/types/roi"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getAllRois,
  updateRoi,
  createRoi,
  deleteRoi,
  exportRoiConfig,
  importRoiConfig,
  startRoiTest,
  stopRoiTest,
  getTestImage,
} from "@/lib/api/roi-api"

export default function RoiEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const startPointRef = useRef<RoiPoint | null>(null) // 시작점을 ref로 관리
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState("editor")
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("none")
  const [roiList, setRoiList] = useState<RoiData[]>([])
  const [selectedRoi, setSelectedRoi] = useState<RoiData | null>(null)
  const [currentPoints, setCurrentPoints] = useState<RoiPoint[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [undoStack, setUndoStack] = useState<RoiData[][]>([])
  const [redoStack, setRedoStack] = useState<RoiData[][]>([])
  const [mousePosition, setMousePosition] = useState<RoiPoint | null>(null) // 현재 마우스 위치
  const [canvasScale, setCanvasScale] = useState({ x: 1, y: 1 }) // 캔버스 스케일 추적
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // 관심영역 목록 로드
  const loadRois = useCallback(async () => {
    try {
      setIsLoading(true)
      const rois = await getAllRois()
      setRoiList(rois)
      if (rois.length > 0 && !selectedRoi) {
        setSelectedRoi(rois[0])
      }
    } catch (error) {
      console.error("관심영역 목록을 로드하는 중 오류 발생:", error)
      toast({
        title: "오류",
        description: "관심영역 목록을 로드하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, selectedRoi])

  // 테스트 이미지 로드
  const loadTestImage = useCallback(async () => {
    try {
      const imageUrl = await getTestImage()
      const img = new Image()
      img.src = imageUrl
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imageRef.current = img
        setImageLoaded(true)
        drawCanvas()
        updateCanvasScale()
      }
    } catch (error) {
      console.error("테스트 이미지를 로드하는 중 오류 발생:", error)
      // 기본 이미지 로드
      const img = new Image()
      img.src = "/placeholder.svg?height=480&width=640"
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imageRef.current = img
        setImageLoaded(true)
        drawCanvas()
        updateCanvasScale()
      }
    }
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
    loadRois()
    loadTestImage()

    // 윈도우 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", updateCanvasScale)
    return () => {
      window.removeEventListener("resize", updateCanvasScale)
    }
  }, [loadRois, loadTestImage])

  // 캔버스 스케일 업데이트
  const updateCanvasScale = () => {
    const canvas = canvasRef.current
    if (!canvas || !imageRef.current) return

    // 캔버스의 실제 크기와 표시 크기의 비율 계산
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight
    const imageWidth = imageRef.current.width
    const imageHeight = imageRef.current.height

    setCanvasScale({
      x: imageWidth / displayWidth,
      y: imageHeight / displayHeight,
    })
  }

  // Redraw canvas when ROIs change
  useEffect(() => {
    if (imageLoaded) {
      drawCanvas()
    }
  }, [roiList, selectedRoi, currentPoints, showGrid, showLabels, imageLoaded, mousePosition])

  // Draw the canvas with image and ROIs
  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !imageRef.current) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match the image
    canvas.width = imageRef.current.width
    canvas.height = imageRef.current.height

    // Draw the image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height)
    }

    // Draw all ROIs
    roiList.forEach((roi) => {
      drawRoi(ctx, roi, roi.id === selectedRoi?.id)
    })

    // 사각형 그리기 모드에서 시작점이 있고 마우스 위치가 있는 경우
    if (drawingMode === "rectangle" && startPointRef.current && mousePosition && isDrawing) {
      ctx.beginPath()
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2

      const startX = startPointRef.current.x
      const startY = startPointRef.current.y
      const width = mousePosition.x - startX
      const height = mousePosition.y - startY

      ctx.rect(startX, startY, width, height)
      ctx.stroke()

      // 시작점 표시
      ctx.beginPath()
      ctx.fillStyle = "#3b82f6"
      ctx.arc(startX, startY, 5, 0, Math.PI * 2)
      ctx.fill()

      // 현재 마우스 위치 표시
      ctx.beginPath()
      ctx.fillStyle = "#3b82f6"
      ctx.arc(mousePosition.x, mousePosition.y, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    // 다각형 그리기
    if (currentPoints.length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2

      ctx.moveTo(currentPoints[0].x, currentPoints[0].y)
      currentPoints.forEach((point, index) => {
        if (index > 0) {
          ctx.lineTo(point.x, point.y)
        }
      })

      // 다각형 그리기 중이고 마우스 위치가 있는 경우 마지막 점에서 마우스 위치까지 선 그리기
      if (drawingMode === "polygon" && mousePosition && currentPoints.length > 0 && isDrawing) {
        ctx.lineTo(mousePosition.x, mousePosition.y)
      }

      ctx.stroke()

      // 점들 표시
      currentPoints.forEach((point) => {
        ctx.beginPath()
        ctx.fillStyle = "#3b82f6"
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
        ctx.fill()
      })
    }
  }

  // Draw grid on canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 50
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"
    ctx.lineWidth = 1

    // Draw vertical lines
    for (let x = gridSize; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  // Draw a single ROI
  const drawRoi = (ctx: CanvasRenderingContext2D, roi: RoiData, isSelected: boolean) => {
    ctx.beginPath()

    // Set styles based on selection state
    ctx.strokeStyle = isSelected ? "#3b82f6" : roi.color
    ctx.fillStyle = isSelected ? `${roi.color}40` : `${roi.color}20`
    ctx.lineWidth = isSelected ? 3 : 2

    if (roi.type === "rectangle" && roi.points.length === 2) {
      const [start, end] = roi.points
      const width = end.x - start.x
      const height = end.y - start.y
      ctx.rect(start.x, start.y, width, height)
    } else if (roi.type === "polygon" && roi.points.length > 2) {
      ctx.moveTo(roi.points[0].x, roi.points[0].y)
      roi.points.forEach((point, index) => {
        if (index > 0) {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.closePath()
    }

    ctx.fill()
    ctx.stroke()

    // Draw handle points if selected
    if (isSelected) {
      roi.points.forEach((point) => {
        ctx.beginPath()
        ctx.fillStyle = "#3b82f6"
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw label if enabled
    if (showLabels && roi.name) {
      let labelX, labelY

      if (roi.type === "rectangle" && roi.points.length === 2) {
        labelX = roi.points[0].x
        labelY = roi.points[0].y - 10
      } else if (roi.type === "polygon" && roi.points.length > 0) {
        // Find the top-most point for the label
        labelX = roi.points[0].x
        labelY = roi.points[0].y - 10
        roi.points.forEach((point) => {
          if (point.y < labelY + 10) {
            labelY = point.y - 10
            labelX = point.x
          }
        })
      } else {
        return
      }

      ctx.font = "14px Arial"
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(labelX - 2, labelY - 14, ctx.measureText(roi.name).width + 4, 18)
      ctx.fillStyle = "white"
      ctx.fillText(roi.name, labelX, labelY)
    }
  }

  // 캔버스 내 마우스 좌표 가져오기
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): RoiPoint => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    // 클라이언트 좌표를 캔버스 좌표로 변환
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  // Handle canvas mouse down event
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingMode === "none") return

    const point = getCanvasCoordinates(e)

    if (drawingMode === "rectangle") {
      // 사각형 그리기 시작 - 시작점만 저장하고 그리기 상태 설정
      startPointRef.current = point
      setIsDrawing(true)
    } else if (drawingMode === "polygon") {
      if (!isDrawing) {
        // 다각형 그리기 시작
        setCurrentPoints([point])
        setIsDrawing(true)
      } else {
        // 이미 그리기 중인 경우 점 추가
        // 첫 번째 점 근처를 클릭한 경우 다각형 완성
        const firstPoint = currentPoints[0]
        const distance = Math.sqrt(Math.pow(point.x - firstPoint.x, 2) + Math.pow(point.y - firstPoint.y, 2))

        if (distance < 20 && currentPoints.length > 2) {
          finishPolygonDrawing()
        } else {
          setCurrentPoints([...currentPoints, point])
        }
      }
    } else if (drawingMode === "select") {
      // 기존 ROI 선택
      const clickedRoi = findRoiAtPoint(point.x, point.y)
      setSelectedRoi(clickedRoi)
    } else if (drawingMode === "move" && selectedRoi) {
      // 선택된 ROI 이동 시작
      setIsDrawing(true)
    }
  }

  // Handle canvas mouse move event
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasCoordinates(e)
    setMousePosition(point)

    if (!isDrawing) return

    if (drawingMode === "move" && selectedRoi) {
      // 선택된 ROI 이동
      const lastPoint = mousePosition || point
      const dx = point.x - lastPoint.x
      const dy = point.y - lastPoint.y

      setSelectedRoi({
        ...selectedRoi,
        points: selectedRoi.points.map((p) => ({
          x: p.x + dx,
          y: p.y + dy,
        })),
      })
    }
  }

  // Handle canvas mouse up event
  const handleCanvasMouseUp = () => {
    if (drawingMode === "rectangle" && isDrawing && startPointRef.current && mousePosition) {
      // 사각형 그리기 완료
      finishRectangleDrawing()
    } else if (drawingMode === "move" && isDrawing) {
      // ROI 이동 완료
      if (selectedRoi) {
        saveStateForUndo()
        handleRoiUpdate(selectedRoi)
        setIsDrawing(false)
      }
    }
  }

  // Handle canvas mouse leave event
  const handleCanvasMouseLeave = () => {
    setMousePosition(null)
  }

  // Handle double click to finish polygon drawing
  const handleCanvasDoubleClick = () => {
    if (drawingMode === "polygon" && isDrawing && currentPoints.length > 2) {
      finishPolygonDrawing()
    }
  }

  // 사각형 그리기 완료
  const finishRectangleDrawing = async () => {
    if (!startPointRef.current || !mousePosition) return

    const width = Math.abs(mousePosition.x - startPointRef.current.x)
    const height = Math.abs(mousePosition.y - startPointRef.current.y)

    // 너무 작은 사각형은 무시
    if (width < 10 || height < 10) {
      cancelDrawing()
      return
    }

    // 좌표 정규화 (시작점이 항상 왼쪽 위, 끝점이 항상 오른쪽 아래가 되도록)
    const normalizedPoints = [
      {
        x: Math.min(startPointRef.current.x, mousePosition.x),
        y: Math.min(startPointRef.current.y, mousePosition.y),
      },
      {
        x: Math.max(startPointRef.current.x, mousePosition.x),
        y: Math.max(startPointRef.current.y, mousePosition.y),
      },
    ]

    saveStateForUndo()

    try {
      const newRoi = await createRoi({
        name: `ROI ${roiList.length + 1}`,
        type: "rectangle",
        points: normalizedPoints,
        color: getRandomColor(),
        enabled: true,
        actions: {
          detectTrucks: true,
          performOcr: true,
          sendToPLC: false,
          triggerAlarm: false,
        },
        minDetectionTime: 2,
        description: "",
      })

      setRoiList([...roiList, newRoi])
      setSelectedRoi(newRoi)
      toast({
        title: "관심영역 생성",
        description: "새 관심영역이 생성되었습니다.",
      })
    } catch (error) {
      console.error("관심영역을 생성하는 중 오류 발생:", error)
      toast({
        title: "오류",
        description: "관심영역을 생성하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }

    cancelDrawing()
    setDrawingMode("select")
  }

  // 다각형 그리기 완료
  const finishPolygonDrawing = async () => {
    if (currentPoints.length < 3) {
      cancelDrawing()
      return
    }

    saveStateForUndo()

    try {
      const newRoi = await createRoi({
        name: `ROI ${roiList.length + 1}`,
        type: "polygon",
        points: [...currentPoints],
        color: getRandomColor(),
        enabled: true,
        actions: {
          detectTrucks: true,
          performOcr: true,
          sendToPLC: false,
          triggerAlarm: false,
        },
        minDetectionTime: 2,
        description: "",
      })

      setRoiList([...roiList, newRoi])
      setSelectedRoi(newRoi)
      toast({
        title: "관심영역 생성",
        description: "새 관심영역이 생성되었습니다.",
      })
    } catch (error) {
      console.error("관심영역을 생성하는 중 오류 발생:", error)
      toast({
        title: "오류",
        description: "관심영역을 생성하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }

    cancelDrawing()
    setDrawingMode("select")
  }

  // 그리기 취소
  const cancelDrawing = () => {
    startPointRef.current = null
    setCurrentPoints([])
    setIsDrawing(false)
  }

  // Find ROI at a specific point
  const findRoiAtPoint = (x: number, y: number) => {
    // Check in reverse order to select the top-most ROI
    for (let i = roiList.length - 1; i >= 0; i--) {
      const roi = roiList[i]

      if (roi.type === "rectangle" && roi.points.length === 2) {
        const [start, end] = roi.points
        const minX = Math.min(start.x, end.x)
        const maxX = Math.max(start.x, end.x)
        const minY = Math.min(start.y, end.y)
        const maxY = Math.max(start.y, end.y)

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          return roi
        }
      } else if (roi.type === "polygon" && roi.points.length > 2) {
        if (isPointInPolygon(x, y, roi.points)) {
          return roi
        }
      }
    }

    return null
  }

  // Check if a point is inside a polygon
  const isPointInPolygon = (x: number, y: number, points: RoiPoint[]) => {
    let inside = false
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x
      const yi = points[i].y
      const xj = points[j].x
      const yj = points[j].y

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }

    return inside
  }

  // Generate a random color
  const getRandomColor = () => {
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8000", "#8000ff"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Handle ROI selection from the list
  const handleRoiSelect = (roi: RoiData) => {
    setSelectedRoi(roi)
    setDrawingMode("select")
  }

  // Handle ROI update
  const handleRoiUpdate = async (updatedRoi: RoiData) => {
    // Save the state before the change for undo
    saveStateForUndo()

    try {
      const result = await updateRoi(updatedRoi)
      setRoiList(roiList.map((roi) => (roi.id === result.id ? result : roi)))
      setSelectedRoi(result)
    } catch (error) {
      console.error("관심영역을 업데이트하는 중 오류 발생:", error)
      toast({
        title: "오류",
        description: "관심영역을 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // Handle ROI deletion
  const handleRoiDelete = async (roiId: string) => {
    // Save the state before the change for undo
    saveStateForUndo()

    try {
      const success = await deleteRoi(roiId)
      if (success) {
        setRoiList(roiList.filter((roi) => roi.id !== roiId))
        if (selectedRoi?.id === roiId) {
          setSelectedRoi(null)
        }

        toast({
          title: "관심영역 삭제",
          description: "관심영역이 삭제되었습니다.",
        })
      } else {
        throw new Error("관심영역 삭제 실패")
      }
    } catch (error) {
      console.error("관심영역을 삭제하는 중 오류 발생:", error)
      toast({
        title: "오류",
        description: "관심영역을 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // Save state for undo
  const saveStateForUndo = () => {
    setUndoStack([...undoStack, [...roiList]])
    setRedoStack([])
  }

  // Handle undo
  const handleUndo = () => {
    if (undoStack.length === 0) return

    const prevState = undoStack[undoStack.length - 1]
    const newUndoStack = undoStack.slice(0, -1)

    setRedoStack([...redoStack, [...roiList]])
    setRoiList(prevState)
    setUndoStack(newUndoStack)

    // Update selected ROI if it exists in the new state
    if (selectedRoi) {
      const updatedSelectedRoi = prevState.find((roi) => roi.id === selectedRoi.id)
      setSelectedRoi(updatedSelectedRoi || null)
    }
  }

  // Handle redo
  const handleRedo = () => {
    if (redoStack.length === 0) return

    const nextState = redoStack[redoStack.length - 1]
    const newRedoStack = redoStack.slice(0, -1)

    setUndoStack([...undoStack, [...roiList]])
    setRoiList(nextState)
    setRedoStack(newRedoStack)

    // Update selected ROI if it exists in the new state
    if (selectedRoi) {
      const updatedSelectedRoi = nextState.find((roi) => roi.id === selectedRoi.id)
      setSelectedRoi(updatedSelectedRoi || null)
    }
  }

  // Handle save ROI configuration
  const handleSaveConfig = async () => {
    try {
      const config = await exportRoiConfig()
      // 파일 다운로드
      const blob = new Blob([config], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `roi-config-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "설정 저장 완료",
        description: "관심영역 설정이 저장되었습니다.",
      })
    } catch (error) {
      console.error("관심영역 설정을 저장하는 중 오류 발생:", error)
      toast({
        title: "오류",
        description: "관심영역 설정을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // Handle load ROI configuration
  const handleLoadConfig = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file input change
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const config = event.target?.result as string
        const success = await importRoiConfig(config)
        if (success) {
          await loadRois()
          toast({
            title: "설정 로드 완료",
            description: "관심영역 설정이 로드되었습니다.",
          })
        } else {
          throw new Error("설정 로드 실패")
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error("관심영역 설정을 로드하는 중 오류 발생:", error)
      toast({
        title: "오류",
        description: "관심영역 설정을 로드하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }

    // 파일 입력 초기화
    if (e.target) {
      e.target.value = ""
    }
  }

  // Handle play/pause test mode
  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        const success = await stopRoiTest()
        if (success) {
          setIsPlaying(false)
          toast({
            title: "테스트 중지",
            description: "관심영역 테스트가 중지되었습니다.",
          })
        } else {
          throw new Error("테스트 중지 실패")
        }
      } else {
        const success = await startRoiTest()
        if (success) {
          setIsPlaying(true)
          toast({
            title: "테스트 시작",
            description: "관심영역 테스트가 시작되었습니다.",
          })
        } else {
          throw new Error("테스트 시작 실패")
        }
      }
    } catch (error) {
      console.error("관심영역 테스트 제어 중 오류 발생:", error)
      toast({
        title: "오류",
        description: "관심영역 테스트를 제어하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // Handle load test image
  const handleLoadTestImage = async () => {
    try {
      await loadTestImage()
      toast({
        title: "이미지 로드 완료",
        description: "테스트 이미지가 로드되었습니다.",
      })
    } catch (error) {
      console.error("테스트 이미지를 로드하는 중 오류 발생:", error)
      toast({
        title: "오류",
        description: "테스트 이미지를 로드하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 그리기 중인지 확인
  const isCurrentlyDrawing = isDrawing && (drawingMode === "rectangle" || drawingMode === "polygon")

  // 로딩 중 표시
  if (isLoading && !imageLoaded) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[500px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[300px] lg:col-span-2" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main canvas area */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">편집기</TabsTrigger>
                <TabsTrigger value="test">테스트</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <ToggleGroup
                      type="single"
                      value={drawingMode}
                      onValueChange={(value) => {
                        if (value) {
                          // 그리기 모드 변경 시 현재 그리기 상태 초기화
                          if (isDrawing) {
                            cancelDrawing()
                          }
                          setDrawingMode(value as DrawingMode)
                        }
                      }}
                    >
                      <ToggleGroupItem value="select" aria-label="선택 도구" disabled={isCurrentlyDrawing}>
                        <Move className="h-4 w-4 mr-2" />
                        선택
                      </ToggleGroupItem>
                      <ToggleGroupItem value="rectangle" aria-label="사각형 도구" disabled={isCurrentlyDrawing}>
                        <Square className="h-4 w-4 mr-2" />
                        사각형
                      </ToggleGroupItem>
                      <ToggleGroupItem value="polygon" aria-label="다각형 도구" disabled={isCurrentlyDrawing}>
                        <Pencil className="h-4 w-4 mr-2" />
                        다각형
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="move"
                        aria-label="이동 도구"
                        disabled={!selectedRoi || isCurrentlyDrawing}
                      >
                        <Move className="h-4 w-4 mr-2" />
                        이동
                      </ToggleGroupItem>
                    </ToggleGroup>

                    <div className="ml-auto flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
                        <Label htmlFor="show-grid">그리드</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                        <Label htmlFor="show-labels">레이블</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUndo}
                      disabled={undoStack.length === 0 || isCurrentlyDrawing}
                    >
                      <Undo className="h-4 w-4 mr-2" />
                      실행 취소
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRedo}
                      disabled={redoStack.length === 0 || isCurrentlyDrawing}
                    >
                      <Redo className="h-4 w-4 mr-2" />
                      다시 실행
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedRoi) {
                          handleRoiDelete(selectedRoi.id)
                        }
                      }}
                      disabled={!selectedRoi || isCurrentlyDrawing}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </Button>
                    <div className="ml-auto flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleLoadConfig} disabled={isCurrentlyDrawing}>
                        <Upload className="h-4 w-4 mr-2" />
                        불러오기
                      </Button>
                      <Button variant="default" size="sm" onClick={handleSaveConfig} disabled={isCurrentlyDrawing}>
                        <Save className="h-4 w-4 mr-2" />
                        저장
                      </Button>
                    </div>
                  </div>

                  <div className="relative border rounded-md overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto bg-black"
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseLeave}
                      onDoubleClick={handleCanvasDoubleClick}
                    />

                    {/* 다각형 그리기 안내 메시지 */}
                    {drawingMode === "polygon" && isDrawing && (
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white p-2 rounded text-sm">
                        다각형을 완성하려면 첫 번째 점을 클릭하거나 더블 클릭하세요.
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {!isCurrentlyDrawing && (
                      <>
                        {drawingMode === "select" && "영역을 선택하려면 클릭하세요."}
                        {drawingMode === "rectangle" &&
                          "사각형을 그리려면 클릭하고 드래그한 후 마우스 버튼을 놓으세요."}
                        {drawingMode === "polygon" && "다각형을 그리려면 시작점을 클릭하세요."}
                        {drawingMode === "move" && "선택한 영역을 이동하려면 드래그하세요."}
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="test" className="mt-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant={isPlaying ? "destructive" : "default"} onClick={handlePlayPause}>
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          중지
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          테스트 시작
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={loadRois}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      초기화
                    </Button>
                    <div className="ml-auto">
                      <Button variant="outline" onClick={handleLoadTestImage}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        이미지 로드
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <canvas ref={canvasRef} className="w-full h-auto bg-black" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">테스트 결과</h3>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">
                          {isPlaying
                            ? "테스트 진행 중... 관심영역에 트럭이 감지되면 여기에 결과가 표시됩니다."
                            : "테스트를 시작하려면 '테스트 시작' 버튼을 클릭하세요."}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">활성화된 영역</h3>
                      <div className="p-3 bg-muted rounded-md h-[100px] overflow-auto">
                        {roiList.filter((roi) => roi.enabled).length > 0 ? (
                          <ul className="space-y-1 text-sm">
                            {roiList
                              .filter((roi) => roi.enabled)
                              .map((roi) => (
                                <li key={roi.id} className="flex items-center">
                                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: roi.color }} />
                                  {roi.name}
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">활성화된 관심영역이 없습니다.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar with ROI list and properties */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">관심영역 목록</h3>
            <RoiList
              roiList={roiList}
              selectedRoi={selectedRoi}
              onSelect={handleRoiSelect}
              onDelete={handleRoiDelete}
            />
          </CardContent>
        </Card>

        {selectedRoi && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">속성</h3>
              <RoiProperties roi={selectedRoi} onUpdate={handleRoiUpdate} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">도움말</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>사각형 도구:</strong> 클릭하고 드래그한 후 마우스 버튼을 놓으면 사각형이 생성됩니다.
              </p>
              <p>
                <strong>다각형 도구:</strong> 클릭하여 점을 추가하고, 첫 번째 점을 클릭하거나 더블 클릭하여 완성합니다.
              </p>
              <p>
                <strong>선택 도구:</strong> 영역을 선택하여 속성을 편집합니다.
              </p>
              <p>
                <strong>이동 도구:</strong> 선택한 영역을 드래그하여 이동합니다.
              </p>
              <Separator className="my-2" />
              <p>관심영역은 트럭 감지 및 OCR 처리가 수행될 영역을 지정합니다.</p>
              <p>각 영역마다 다른 동작을 설정할 수 있습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden file input for loading ROI configuration */}
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileInputChange} />
    </div>
  )
}
