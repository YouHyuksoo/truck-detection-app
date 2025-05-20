"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ConnectionSettings } from "./connection-settings"
import { ProtocolSettings } from "./protocol-settings"
import { DataMapping } from "./data-mapping"
import { CommunicationTest } from "./communication-test"
import { StatusMonitor } from "./status-monitor"
import { PLCStatisticsComponent } from "./plc-statistics"
import type { PLCDevice, PLCSettings, DataMapping as DataMappingType } from "@/types/plc"
import { useToast } from "@/hooks/use-toast"
import { usePLCApi } from "@/lib/api/plc-api"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// 기본 PLC 설정
const DEFAULT_PLC_SETTINGS: PLCSettings = {
  device: {
    id: "plc1",
    name: "메인 PLC",
    type: "siemens",
    connectionType: "ethernet",
    ipAddress: "192.168.1.100",
    port: 502,
    timeout: 1000,
    status: "disconnected",
  },
  protocol: "modbus_tcp",
  dataMappings: [],
  autoConnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
}

export function PLCDashboard() {
  const [plcSettings, setPlcSettings] = useState<PLCSettings>(DEFAULT_PLC_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const plcApi = usePLCApi()

  // 초기 로딩 상태를 추적하는 ref
  const initialLoadDone = useRef(false)

  // 설정 로드 함수를 useCallback으로 메모이제이션
  const loadSettings = useCallback(async () => {
    // 이미 로드된 경우 중복 호출 방지
    if (initialLoadDone.current) return

    try {
      setLoading(true)
      setError(null)

      // 환경 변수가 true인 경우에만 API 호출
      if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
        const settings = await plcApi.getPLCSettings()
        setPlcSettings(settings)
      }
      // 초기 로딩 완료 표시
      initialLoadDone.current = true
    } catch (err) {
      console.error("PLC 설정 로드 오류:", err)
      setError("PLC 설정을 로드하는 중 오류가 발생했습니다.")
      toast({
        title: "설정 로드 오류",
        description: (err as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [plcApi, toast])

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // 장치 업데이트 함수
  const handleDeviceUpdate = useCallback(
    async (device: PLCDevice) => {
      // 이전 상태와 비교하여 변경된 경우에만 업데이트
      setPlcSettings((prev) => {
        // 이전 장치와 새 장치가 동일한 경우 상태 업데이트 방지
        if (JSON.stringify(prev.device) === JSON.stringify(device)) {
          return prev
        }
        return {
          ...prev,
          device,
        }
      })

      try {
        // API 호출은 백그라운드에서 진행
        if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
          await plcApi.updatePLCDevice(device)
          toast({
            title: "장치 설정 업데이트",
            description: "PLC 장치 설정이 성공적으로 업데이트되었습니다.",
          })
        }
      } catch (err) {
        console.error("장치 업데이트 오류:", err)
        toast({
          title: "장치 설정 업데이트 오류",
          description: (err as Error).message,
          variant: "destructive",
        })
      }
    },
    [plcApi, toast],
  )

  // 프로토콜 업데이트 함수
  const handleProtocolUpdate = useCallback(
    async (protocol: string) => {
      // 이전 상태와 비교하여 변경된 경우에만 업데이트
      setPlcSettings((prev) => {
        if (prev.protocol === protocol) {
          return prev
        }
        return {
          ...prev,
          protocol,
        }
      })

      try {
        // API 호출은 백그라운드에서 진행
        if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
          await plcApi.updateProtocol(protocol)
          toast({
            title: "프로토콜 설정 업데이트",
            description: "PLC 프로토콜 설정이 성공적으로 업데이트되었습니다.",
          })
        }
      } catch (err) {
        console.error("프로토콜 업데이트 오류:", err)
        toast({
          title: "프로토콜 설정 업데이트 오류",
          description: (err as Error).message,
          variant: "destructive",
        })
      }
    },
    [plcApi, toast],
  )

  // 데이터 매핑 업데이트 함수
  const handleDataMappingsUpdate = useCallback((mappings: DataMappingType[]) => {
    // 이전 상태와 비교하여 변경된 경우에만 업데이트
    setPlcSettings((prev) => {
      if (JSON.stringify(prev.dataMappings) === JSON.stringify(mappings)) {
        return prev
      }
      return {
        ...prev,
        dataMappings: mappings,
      }
    })
  }, [])

  // 로딩 중일 때 표시할 컴포넌트
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">PLC 설정을 로드하는 중...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="connection">연결 설정</TabsTrigger>
          <TabsTrigger value="protocol">프로토콜 설정</TabsTrigger>
          <TabsTrigger value="mapping">데이터 매핑</TabsTrigger>
          <TabsTrigger value="test">통신 테스트</TabsTrigger>
          <TabsTrigger value="monitor">상태 모니터링</TabsTrigger>
          <TabsTrigger value="statistics">통계</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
          <CardContent className="pt-6">
            <TabsContent value="connection" className="mt-0">
              <ConnectionSettings device={plcSettings.device} onUpdate={handleDeviceUpdate} />
            </TabsContent>
            <TabsContent value="protocol" className="mt-0">
              <ProtocolSettings
                protocol={plcSettings.protocol}
                deviceType={plcSettings.device.type}
                connectionType={plcSettings.device.connectionType}
                onUpdate={handleProtocolUpdate}
              />
            </TabsContent>
            <TabsContent value="mapping" className="mt-0">
              <DataMapping
                mappings={plcSettings.dataMappings}
                protocol={plcSettings.protocol}
                deviceType={plcSettings.device.type}
                onUpdate={handleDataMappingsUpdate}
              />
            </TabsContent>
            <TabsContent value="test" className="mt-0">
              <CommunicationTest
                device={plcSettings.device}
                protocol={plcSettings.protocol}
                mappings={plcSettings.dataMappings}
              />
            </TabsContent>
            <TabsContent value="monitor" className="mt-0">
              <StatusMonitor device={plcSettings.device} />
            </TabsContent>
            <TabsContent value="statistics" className="mt-0">
              <PLCStatisticsComponent device={plcSettings.device} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
