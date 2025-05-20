"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AccessType, type DataMapping as DataMappingType, DataType, ProtocolType } from "@/types/plc"
import { PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePLCApi } from "@/lib/api/plc-api"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DataMappingProps {
  mappings: DataMappingType[]
  protocol: ProtocolType
  deviceType: string
  onUpdate: (mappings: DataMappingType[]) => void
}

export function DataMapping({ mappings: initialMappings, protocol, deviceType, onUpdate }: DataMappingProps) {
  const [mappings, setMappings] = useState<DataMappingType[]>(initialMappings)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentMapping, setCurrentMapping] = useState<DataMappingType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const plcApi = usePLCApi()
  const { toast } = useToast()

  // 초기 데이터 로드
  useEffect(() => {
    const loadMappings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await plcApi.getDataMappings()
        setMappings(data)
        onUpdate(data)
      } catch (err) {
        setError("데이터 매핑을 로드하는 중 오류가 발생했습니다.")
        toast({
          title: "데이터 매핑 로드 오류",
          description: (err as Error).message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // 초기 값이 비어 있는 경우에만 로드
    if (initialMappings.length === 0) {
      loadMappings()
    }
  }, [initialMappings, plcApi, toast, onUpdate])

  const handleAddMapping = () => {
    setCurrentMapping({
      id: `mapping-${Date.now()}`,
      name: "",
      plcAddress: "",
      dataType: DataType.WORD,
      access: AccessType.READ,
      description: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditMapping = (mapping: DataMappingType) => {
    setCurrentMapping({ ...mapping })
    setIsDialogOpen(true)
  }

  const handleDeleteMapping = async (id: string) => {
    try {
      setIsLoading(true)
      await plcApi.deleteDataMapping(id)
      const updatedMappings = mappings.filter((m) => m.id !== id)
      setMappings(updatedMappings)
      onUpdate(updatedMappings)
      toast({
        title: "데이터 매핑 삭제",
        description: "데이터 매핑이 성공적으로 삭제되었습니다.",
      })
    } catch (err) {
      toast({
        title: "데이터 매핑 삭제 오류",
        description: (err as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveMapping = async () => {
    if (!currentMapping) return

    try {
      setIsSubmitting(true)
      let savedMapping: DataMappingType

      if (mappings.some((m) => m.id === currentMapping.id)) {
        // 기존 매핑 업데이트
        savedMapping = await plcApi.updateDataMapping(currentMapping)
        const updatedMappings = mappings.map((m) => (m.id === savedMapping.id ? savedMapping : m))
        setMappings(updatedMappings)
        onUpdate(updatedMappings)
        toast({
          title: "데이터 매핑 업데이트",
          description: "데이터 매핑이 성공적으로 업데이트되었습니다.",
        })
      } else {
        // 새 매핑 추가
        savedMapping = await plcApi.addDataMapping(currentMapping)
        const updatedMappings = [...mappings, savedMapping]
        setMappings(updatedMappings)
        onUpdate(updatedMappings)
        toast({
          title: "데이터 매핑 추가",
          description: "새 데이터 매핑이 성공적으로 추가되었습니다.",
        })
      }

      setIsDialogOpen(false)
      setCurrentMapping(null)
    } catch (err) {
      toast({
        title: "데이터 매핑 저장 오류",
        description: (err as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAddressPlaceholder = () => {
    switch (protocol) {
      case ProtocolType.MODBUS_TCP:
      case ProtocolType.MODBUS_RTU:
        return "예: 400001 (홀딩 레지스터 1)"
      case ProtocolType.S7:
        return "예: DB1.DBX0.0 (데이터 블록 1, 바이트 0, 비트 0)"
      case ProtocolType.ETHERNET_IP:
        return "예: N7:0 (정수 파일 7, 오프셋 0)"
      default:
        return "PLC 주소 입력"
    }
  }

  const getAddressHelp = () => {
    switch (protocol) {
      case ProtocolType.MODBUS_TCP:
      case ProtocolType.MODBUS_RTU:
        return (
          <>
            <p>Modbus 주소 형식:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>0xxxxx: 코일 (비트, 읽기/쓰기)</li>
              <li>1xxxxx: 디스크리트 입력 (비트, 읽기 전용)</li>
              <li>3xxxxx: 입력 레지스터 (워드, 읽기 전용)</li>
              <li>4xxxxx: 홀딩 레지스터 (워드, 읽기/쓰기)</li>
            </ul>
          </>
        )
      case ProtocolType.S7:
        return (
          <>
            <p>S7 주소 형식:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>I/E/IW/EW: 입력</li>
              <li>Q/A/QW/AW: 출력</li>
              <li>M/MW/MD: 메모리</li>
              <li>DB[n].DBX/DBB/DBW/DBD: 데이터 블록</li>
              <li>T: 타이머</li>
              <li>C/Z: 카운터</li>
            </ul>
          </>
        )
      default:
        return "PLC 주소를 입력하세요."
    }
  }

  if (isLoading && mappings.length === 0) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">데이터 매핑을 로드하는 중...</span>
      </div>
    )
  }

  if (error && mappings.length === 0) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">데이터 매핑 설정</h3>
          <p className="text-sm text-muted-foreground">PLC 메모리 주소와 시스템 데이터 간의 매핑을 설정합니다.</p>
        </div>
        <Button onClick={handleAddMapping} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          매핑 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>데이터 매핑 목록</CardTitle>
          <CardDescription>설정된 모든 데이터 매핑을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {mappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>설정된 데이터 매핑이 없습니다.</p>
              <p className="text-sm mt-2">&quot;매핑 추가&quot; 버튼을 클릭하여 새 매핑을 추가하세요.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>PLC 주소</TableHead>
                    <TableHead>데이터 타입</TableHead>
                    <TableHead>접근 권한</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead className="w-[100px]">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell className="font-medium">{mapping.name}</TableCell>
                      <TableCell>{mapping.plcAddress}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {mapping.dataType === DataType.BIT && "비트"}
                          {mapping.dataType === DataType.BYTE && "바이트"}
                          {mapping.dataType === DataType.WORD && "워드"}
                          {mapping.dataType === DataType.DWORD && "더블워드"}
                          {mapping.dataType === DataType.INT && "정수"}
                          {mapping.dataType === DataType.REAL && "실수"}
                          {mapping.dataType === DataType.STRING && "문자열"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            mapping.access === AccessType.READ
                              ? "secondary"
                              : mapping.access === AccessType.WRITE
                                ? "default"
                                : "outline"
                          }
                        >
                          {mapping.access === AccessType.READ && "읽기"}
                          {mapping.access === AccessType.WRITE && "쓰기"}
                          {mapping.access === AccessType.READ_WRITE && "읽기/쓰기"}
                        </Badge>
                      </TableCell>
                      <TableCell>{mapping.description}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditMapping(mapping)}
                            disabled={isLoading}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMapping(mapping.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentMapping && currentMapping.id.startsWith("mapping-") ? "데이터 매핑 추가" : "데이터 매핑 편집"}
            </DialogTitle>
            <DialogDescription>PLC 메모리 주소와 시스템 데이터 간의 매핑 정보를 입력하세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름
              </Label>
              <Input
                id="name"
                value={currentMapping?.name || ""}
                onChange={(e) =>
                  setCurrentMapping({
                    ...currentMapping!,
                    name: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plcAddress" className="text-right">
                PLC 주소
              </Label>
              <div className="col-span-3 space-y-2">
                <Input
                  id="plcAddress"
                  value={currentMapping?.plcAddress || ""}
                  onChange={(e) =>
                    setCurrentMapping({
                      ...currentMapping!,
                      plcAddress: e.target.value,
                    })
                  }
                  placeholder={getAddressPlaceholder()}
                />
                <div className="text-xs text-muted-foreground">{getAddressHelp()}</div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataType" className="text-right">
                데이터 타입
              </Label>
              <Select
                value={currentMapping?.dataType}
                onValueChange={(value) =>
                  setCurrentMapping({
                    ...currentMapping!,
                    dataType: value as DataType,
                  })
                }
              >
                <SelectTrigger id="dataType" className="col-span-3">
                  <SelectValue placeholder="데이터 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DataType.BIT}>비트</SelectItem>
                  <SelectItem value={DataType.BYTE}>바이트</SelectItem>
                  <SelectItem value={DataType.WORD}>워드</SelectItem>
                  <SelectItem value={DataType.DWORD}>더블워드</SelectItem>
                  <SelectItem value={DataType.INT}>정수</SelectItem>
                  <SelectItem value={DataType.REAL}>실수</SelectItem>
                  <SelectItem value={DataType.STRING}>문자열</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="access" className="text-right">
                접근 권한
              </Label>
              <Select
                value={currentMapping?.access}
                onValueChange={(value) =>
                  setCurrentMapping({
                    ...currentMapping!,
                    access: value as AccessType,
                  })
                }
              >
                <SelectTrigger id="access" className="col-span-3">
                  <SelectValue placeholder="접근 권한 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AccessType.READ}>읽기</SelectItem>
                  <SelectItem value={AccessType.WRITE}>쓰기</SelectItem>
                  <SelectItem value={AccessType.READ_WRITE}>읽기/쓰기</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                설명
              </Label>
              <Input
                id="description"
                value={currentMapping?.description || ""}
                onChange={(e) =>
                  setCurrentMapping({
                    ...currentMapping!,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            {(currentMapping?.dataType === DataType.INT || currentMapping?.dataType === DataType.REAL) && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="scaleFactor" className="text-right">
                    스케일 팩터
                  </Label>
                  <Input
                    id="scaleFactor"
                    type="number"
                    value={currentMapping?.scaleFactor || ""}
                    onChange={(e) =>
                      setCurrentMapping({
                        ...currentMapping!,
                        scaleFactor: Number.parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="offset" className="text-right">
                    오프셋
                  </Label>
                  <Input
                    id="offset"
                    type="number"
                    value={currentMapping?.offset || ""}
                    onChange={(e) =>
                      setCurrentMapping({
                        ...currentMapping!,
                        offset: Number.parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                단위
              </Label>
              <Input
                id="unit"
                value={currentMapping?.unit || ""}
                onChange={(e) =>
                  setCurrentMapping({
                    ...currentMapping!,
                    unit: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setCurrentMapping(null)
              }}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button onClick={handleSaveMapping} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
