"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AccessType,
  type CommunicationLog,
  ConnectionStatus,
  type DataMapping,
  DataType,
  type PLCDevice,
  type ProtocolType,
} from "@/types/plc"
import { ArrowDown, ArrowUp, Loader2, RefreshCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { usePLCApi } from "@/lib/api/plc-api"
import { useToast } from "@/hooks/use-toast"

interface CommunicationTestProps {
  device?: PLCDevice
  protocol?: ProtocolType
  mappings?: DataMapping[]
}

export function CommunicationTest({ device, protocol, mappings = [] }: CommunicationTestProps) {
  const [selectedMapping, setSelectedMapping] = useState<string>("")
  const [customAddress, setCustomAddress] = useState<string>("")
  const [customDataType, setCustomDataType] = useState<DataType>(DataType.WORD)
  const [writeValue, setWriteValue] = useState<string>("")
  const [isReading, setIsReading] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const [readValue, setReadValue] = useState<string | null>(null)
  const [logs, setLogs] = useState<CommunicationLog[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const plcApi = usePLCApi()
  const { toast } = useToast()

  // device가 undefined인 경우를 처리
  const isConnected = device?.status === ConnectionStatus.CONNECTED

  // 로그 데이터 로드
  useEffect(() => {
    const loadLogs = async () => {
      if (!device) return

      try {
        setIsLoadingLogs(true)
        const logData = await plcApi.getCommunicationLogs()
        setLogs(logData)
      } catch (err) {
        toast({
          title: "로그 로드 오류",
          description: (err as Error).message,
          variant: "destructive",
        })
      } finally {
        setIsLoadingLogs(false)
      }
    }

    loadLogs()
  }, [device, plcApi, toast])

  const handleRead = async () => {
    if (!device || !isConnected) {
      setError("PLC가 연결되어 있지 않습니다. 먼저 연결을 설정하세요.")
      return
    }

    setIsReading(true)
    setError(null)
    setReadValue(null)

    try {
      const mapping = selectedMapping ? mappings.find((m) => m.id === selectedMapping) : null
      const address = mapping ? mapping.plcAddress : customAddress
      const dataType = mapping ? mapping.dataType : customDataType

      // PLC에서 데이터 읽기
      const value = await plcApi.readPLCData(address, dataType)
      setReadValue(value)

      // 성공 메시지 표시
      toast({
        title: "데이터 읽기 성공",
        description: `주소 ${address}에서 값 ${value}를 읽었습니다.`,
      })

      // 로그 목록 업데이트
      const log: CommunicationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        direction: "read",
        address: address || "",
        value,
        status: "success",
        responseTime: Math.floor(Math.random() * 50) + 10, // 실제로는 서버에서 계산된 값이 반환됩니다.
      }

      setLogs((prevLogs) => [log, ...prevLogs].slice(0, 100))
    } catch (err) {
      setError((err as Error).message)
      toast({
        title: "데이터 읽기 오류",
        description: (err as Error).message,
        variant: "destructive",
      })

      // 오류 로그 추가
      const mapping = selectedMapping ? mappings.find((m) => m.id === selectedMapping) : null
      const address = mapping ? mapping.plcAddress : customAddress

      const log: CommunicationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        direction: "read",
        address: address || "",
        value: "",
        status: "error",
        errorMessage: (err as Error).message,
      }
      setLogs((prevLogs) => [log, ...prevLogs].slice(0, 100))
    } finally {
      setIsReading(false)
    }
  }

  const handleWrite = async () => {
    if (!device || !isConnected) {
      setError("PLC가 연결되어 있지 않습니다. 먼저 연결을 설정하세요.")
      return
    }

    setIsWriting(true)
    setError(null)

    try {
      const mapping = selectedMapping ? mappings.find((m) => m.id === selectedMapping) : null
      const address = mapping ? mapping.plcAddress : customAddress
      const dataType = mapping ? mapping.dataType : customDataType

      // PLC에 데이터 쓰기
      await plcApi.writePLCData(address, writeValue, dataType)

      // 성공 메시지 표시
      toast({
        title: "데이터 쓰기 성공",
        description: `주소 ${address}에 값 ${writeValue}를 썼습니다.`,
      })

      // 로그 추가
      const log: CommunicationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        direction: "write",
        address: address || "",
        value: writeValue,
        status: "success",
        responseTime: Math.floor(Math.random() * 50) + 10, // 실제로는 서버에서 계산된 값이 반환됩니다.
      }

      setLogs((prevLogs) => [log, ...prevLogs].slice(0, 100))
    } catch (err) {
      setError((err as Error).message)
      toast({
        title: "데이터 쓰기 오류",
        description: (err as Error).message,
        variant: "destructive",
      })

      // 오류 로그 추가
      const mapping = selectedMapping ? mappings.find((m) => m.id === selectedMapping) : null
      const address = mapping ? mapping.plcAddress : customAddress

      const log: CommunicationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        direction: "write",
        address: address || "",
        value: writeValue,
        status: "error",
        errorMessage: (err as Error).message,
      }
      setLogs((prevLogs) => [log, ...prevLogs].slice(0, 100))
    } finally {
      setIsWriting(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
    toast({
      title: "로그 지우기",
      description: "통신 로그가 지워졌습니다.",
    })
  }

  const isWritable = (mapping: DataMapping) =>
    mapping.access === AccessType.WRITE || mapping.access === AccessType.READ_WRITE

  const isReadable = (mapping: DataMapping) =>
    mapping.access === AccessType.READ || mapping.access === AccessType.READ_WRITE

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">수동 테스트</TabsTrigger>
          <TabsTrigger value="logs">통신 로그</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>PLC 통신 테스트</CardTitle>
                <CardDescription>PLC와의 통신을 테스트하고 데이터를 읽거나 씁니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!device || !isConnected ? (
                  <Alert className="mb-4">
                    <AlertTitle>PLC가 연결되어 있지 않습니다</AlertTitle>
                    <AlertDescription>통신 테스트를 하기 전에 먼저 연결 설정 탭에서 PLC를 연결하세요.</AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mapping-select">데이터 매핑 선택</Label>
                    <Select
                      value={selectedMapping}
                      onValueChange={(value) => {
                        setSelectedMapping(value)
                        setCustomAddress("")
                      }}
                    >
                      <SelectTrigger id="mapping-select">
                        <SelectValue placeholder="데이터 매핑 선택 (선택사항)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">직접 입력</SelectItem>
                        {mappings.map((mapping) => (
                          <SelectItem key={mapping.id} value={mapping.id}>
                            {mapping.name} ({mapping.plcAddress})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(!selectedMapping || selectedMapping === "custom") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="custom-address">PLC 주소</Label>
                        <Input
                          id="custom-address"
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-data-type">데이터 타입</Label>
                        <Select
                          value={customDataType}
                          onValueChange={(value) => {
                            setCustomDataType(value as DataType)
                          }}
                        >
                          <SelectTrigger id="custom-data-type">
                            <SelectValue placeholder="데이터 타입 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DataType.BIT}>Bit</SelectItem>
                            <SelectItem value={DataType.BYTE}>Byte</SelectItem>
                            <SelectItem value={DataType.WORD}>Word</SelectItem>
                            <SelectItem value={DataType.DWORD}>DWord</SelectItem>
                            <SelectItem value={DataType.INT}>Int</SelectItem>
                            <SelectItem value={DataType.REAL}>Real</SelectItem>
                            <SelectItem value={DataType.STRING}>String</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="write-value">쓰기 값</Label>
                    <Input
                      id="write-value"
                      value={writeValue}
                      onChange={(e) => setWriteValue(e.target.value)}
                      disabled={!device || !isConnected}
                    />
                  </div>

                  {readValue !== null && (
                    <div className="p-4 border rounded-md bg-muted/50">
                      <h4 className="font-medium mb-1">읽은 값:</h4>
                      <p className="text-xl font-mono">{readValue}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={handleRead} disabled={!device || !isConnected || isReading}>
                  {isReading ? (
                    <>
                      읽는 중...
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      읽기
                      <ArrowDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button onClick={handleWrite} disabled={!device || !isConnected || isWriting}>
                  {isWriting ? (
                    <>
                      쓰기 중...
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      쓰기
                      <ArrowUp className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>통신 로그</CardTitle>
                <CardDescription>PLC와의 통신 기록을 보여줍니다.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLogs ? (
                  <div className="flex justify-center items-center p-10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="ml-2">로그를 로드하는 중...</span>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] w-full rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">시간</TableHead>
                          <TableHead>방향</TableHead>
                          <TableHead>주소</TableHead>
                          <TableHead>값</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>응답 시간 (ms)</TableHead>
                          <TableHead>오류 메시지</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.length > 0 ? (
                          logs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>{log.timestamp.toLocaleTimeString()}</TableCell>
                              <TableCell>
                                {log.direction === "read" ? (
                                  <Badge variant="secondary">읽기</Badge>
                                ) : (
                                  <Badge>쓰기</Badge>
                                )}
                              </TableCell>
                              <TableCell>{log.address}</TableCell>
                              <TableCell>{log.value}</TableCell>
                              <TableCell>
                                {log.status === "success" ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    성공
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">오류</Badge>
                                )}
                              </TableCell>
                              <TableCell>{log.responseTime ? `${log.responseTime}ms` : "-"}</TableCell>
                              <TableCell>{log.errorMessage || "-"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                              통신 로그가 없습니다.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={clearLogs}>
                  로그 지우기
                  <RefreshCw className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
