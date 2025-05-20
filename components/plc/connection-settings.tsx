"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ConnectionStatus, ConnectionType, type PLCDevice, PLCType } from "@/types/plc"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { usePLCApi } from "@/lib/api/plc-api"
import { useToast } from "@/hooks/use-toast"

interface ConnectionSettingsProps {
  device: PLCDevice
  onUpdate: (device: PLCDevice) => void
}

export function ConnectionSettings({ device, onUpdate }: ConnectionSettingsProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const plcApi = usePLCApi()
  const { toast } = useToast()

  // 로컬 상태로 장치 정보 관리
  const [localDevice, setLocalDevice] = useState<PLCDevice>(device)

  // 이전 props를 저장하는 ref
  const prevDeviceRef = useRef<PLCDevice>(device)

  // props가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    // 이전 props와 현재 props가 다른 경우에만 업데이트
    if (JSON.stringify(prevDeviceRef.current) !== JSON.stringify(device)) {
      setLocalDevice(device)
      prevDeviceRef.current = device
    }
  }, [device])

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      const updatedDevice = await plcApi.connectPLC(localDevice.id)
      // 로컬 상태 업데이트
      setLocalDevice(updatedDevice)
      // 부모 컴포넌트에 알림
      onUpdate(updatedDevice)

      toast({
        title: "연결 성공",
        description: "PLC에 성공적으로 연결되었습니다.",
      })
    } catch (error) {
      setConnectionError((error as Error).message)
      toast({
        title: "연결 오류",
        description: (error as Error).message,
        variant: "destructive",
      })

      // 오류 상태로 로컬 상태 업데이트
      const errorDevice = {
        ...localDevice,
        status: ConnectionStatus.ERROR,
      }
      setLocalDevice(errorDevice)
      onUpdate(errorDevice)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsConnecting(true)
    try {
      const updatedDevice = await plcApi.disconnectPLC(localDevice.id)
      // 로컬 상태 업데이트
      setLocalDevice(updatedDevice)
      // 부모 컴포넌트에 알림
      onUpdate(updatedDevice)

      toast({
        title: "연결 해제",
        description: "PLC 연결이 해제되었습니다.",
      })
    } catch (error) {
      toast({
        title: "연결 해제 오류",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleChange = (field: keyof PLCDevice, value: any) => {
    // 로컬 상태 업데이트
    const updatedDevice = {
      ...localDevice,
      [field]: value,
    }
    setLocalDevice(updatedDevice)

    // 디바운스 처리를 위한 타임아웃
    const timeoutId = setTimeout(() => {
      onUpdate(updatedDevice)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">장치 이름</Label>
            <Input id="name" value={localDevice.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plc-type">PLC 유형</Label>
            <Select value={localDevice.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger id="plc-type">
                <SelectValue placeholder="PLC 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLCType.SIEMENS}>Siemens</SelectItem>
                <SelectItem value={PLCType.ALLEN_BRADLEY}>Allen-Bradley</SelectItem>
                <SelectItem value={PLCType.MITSUBISHI}>Mitsubishi</SelectItem>
                <SelectItem value={PLCType.OMRON}>Omron</SelectItem>
                <SelectItem value={PLCType.SCHNEIDER}>Schneider</SelectItem>
                <SelectItem value={PLCType.DELTA}>Delta</SelectItem>
                <SelectItem value={PLCType.OTHER}>기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection-type">연결 방식</Label>
            <Select
              value={localDevice.connectionType}
              onValueChange={(value) => handleChange("connectionType", value as ConnectionType)}
            >
              <SelectTrigger id="connection-type">
                <SelectValue placeholder="연결 방식 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConnectionType.ETHERNET}>이더넷</SelectItem>
                <SelectItem value={ConnectionType.SERIAL}>시리얼</SelectItem>
                <SelectItem value={ConnectionType.USB}>USB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {localDevice.connectionType === ConnectionType.ETHERNET && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ip-address">IP 주소</Label>
                <Input
                  id="ip-address"
                  value={localDevice.ipAddress}
                  onChange={(e) => handleChange("ipAddress", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">포트</Label>
                <Input
                  id="port"
                  type="number"
                  value={localDevice.port}
                  onChange={(e) => handleChange("port", Number.parseInt(e.target.value))}
                />
              </div>
            </>
          )}

          {localDevice.connectionType === ConnectionType.SERIAL && (
            <>
              <div className="space-y-2">
                <Label htmlFor="com-port">COM 포트</Label>
                <Input
                  id="com-port"
                  value={localDevice.comPort}
                  onChange={(e) => handleChange("comPort", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baud-rate">Baud Rate</Label>
                <Select
                  value={localDevice.baudRate?.toString()}
                  onValueChange={(value) => handleChange("baudRate", Number.parseInt(value))}
                >
                  <SelectTrigger id="baud-rate">
                    <SelectValue placeholder="Baud Rate 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9600">9600</SelectItem>
                    <SelectItem value="19200">19200</SelectItem>
                    <SelectItem value="38400">38400</SelectItem>
                    <SelectItem value="57600">57600</SelectItem>
                    <SelectItem value="115200">115200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="timeout">타임아웃 (ms)</Label>
            <Input
              id="timeout"
              type="number"
              value={localDevice.timeout}
              onChange={(e) => handleChange("timeout", Number.parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="auto-connect" checked={localDevice.status === ConnectionStatus.CONNECTED} disabled />
        <Label htmlFor="auto-connect">연결 상태</Label>
        <div className="ml-2 flex items-center">
          {localDevice.status === ConnectionStatus.CONNECTED && (
            <div className="flex items-center text-green-500">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span>연결됨</span>
            </div>
          )}
          {localDevice.status === ConnectionStatus.DISCONNECTED && (
            <div className="flex items-center text-gray-500">
              <span>연결 안됨</span>
            </div>
          )}
          {localDevice.status === ConnectionStatus.CONNECTING && (
            <div className="flex items-center text-blue-500">
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              <span>연결 중...</span>
            </div>
          )}
          {localDevice.status === ConnectionStatus.ERROR && (
            <div className="flex items-center text-red-500">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>오류</span>
            </div>
          )}
        </div>
      </div>

      {connectionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>연결 오류</AlertTitle>
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-4">
        <Button onClick={handleConnect} disabled={isConnecting || localDevice.status === ConnectionStatus.CONNECTED}>
          {isConnecting && localDevice.status !== ConnectionStatus.CONNECTED ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              연결 중...
            </>
          ) : (
            "연결"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleDisconnect}
          disabled={isConnecting || localDevice.status === ConnectionStatus.DISCONNECTED}
        >
          연결 해제
        </Button>
      </div>
    </div>
  )
}
