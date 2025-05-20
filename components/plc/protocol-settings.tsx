"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConnectionType, PLCType, ProtocolType } from "@/types/plc"
import { useState } from "react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePLCApi } from "@/lib/api/plc-api"

interface ProtocolSettingsProps {
  protocol: ProtocolType
  deviceType: string
  connectionType: ConnectionType
  onUpdate: (protocol: ProtocolType) => void
}

const modbusSchema = z.object({
  unitId: z.number().min(1).max(247),
  wordOrder: z.enum(["big_endian", "little_endian"]),
  registerType: z.enum(["holding", "input", "coil", "discrete_input"]),
  startAddress: z.number().min(0),
  useZeroBasedAddressing: z.boolean(),
})

const s7Schema = z.object({
  rack: z.number().min(0).max(7),
  slot: z.number().min(0).max(31),
  pduSize: z.number().min(240).max(960),
  localTSAP: z.string().optional(),
  remoteTSAP: z.string().optional(),
})

export function ProtocolSettings({ protocol, deviceType, connectionType, onUpdate }: ProtocolSettingsProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>(protocol)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const plcApi = usePLCApi()

  const modbusForm = useForm<z.infer<typeof modbusSchema>>({
    resolver: zodResolver(modbusSchema),
    defaultValues: {
      unitId: 1,
      wordOrder: "big_endian",
      registerType: "holding",
      startAddress: 0,
      useZeroBasedAddressing: true,
    },
  })

  const s7Form = useForm<z.infer<typeof s7Schema>>({
    resolver: zodResolver(s7Schema),
    defaultValues: {
      rack: 0,
      slot: 1,
      pduSize: 480,
      localTSAP: "",
      remoteTSAP: "",
    },
  })

  const handleProtocolChange = async (value: string) => {
    try {
      const protocolValue = value as ProtocolType
      setSelectedProtocol(protocolValue)

      // API 호출로 프로토콜 업데이트
      await plcApi.updateProtocol(protocolValue)
      onUpdate(protocolValue)

      toast({
        title: "프로토콜 변경",
        description: "프로토콜 설정이 성공적으로 변경되었습니다.",
      })
    } catch (error) {
      toast({
        title: "프로토콜 설정 오류",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleModbusSubmit = async (values: z.infer<typeof modbusSchema>) => {
    try {
      setIsSubmitting(true)
      // 실제 구현에서는 여기서 API를 호출하여 설정을 저장합니다.
      // 여기서는, 토스트로 성공 메시지를 보여줍니다.
      await new Promise((resolve) => setTimeout(resolve, 500)) // 의도적 지연

      toast({
        title: "Modbus 설정 저장",
        description: "Modbus 설정이 성공적으로 저장되었습니다.",
      })
    } catch (error) {
      toast({
        title: "설정 저장 오류",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleS7Submit = async (values: z.infer<typeof s7Schema>) => {
    try {
      setIsSubmitting(true)
      // 실제 구현에서는 여기서 API를 호출하여 설정을 저장합니다.
      // 여기서는, 토스트로 성공 메시지를 보여줍니다.
      await new Promise((resolve) => setTimeout(resolve, 500)) // 의도적 지연

      toast({
        title: "S7 설정 저장",
        description: "S7 프로토콜 설정이 성공적으로 저장되었습니다.",
      })
    } catch (error) {
      toast({
        title: "설정 저장 오류",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // PLC 유형과 연결 방식에 따라 사용 가능한 프로토콜 목록을 반환합니다.
  const getAvailableProtocols = () => {
    if (connectionType === ConnectionType.ETHERNET) {
      switch (deviceType) {
        case PLCType.SIEMENS:
          return [ProtocolType.S7, ProtocolType.MODBUS_TCP]
        case PLCType.ALLEN_BRADLEY:
          return [ProtocolType.ETHERNET_IP, ProtocolType.MODBUS_TCP]
        case PLCType.MITSUBISHI:
          return [ProtocolType.MC_PROTOCOL, ProtocolType.MODBUS_TCP]
        case PLCType.OMRON:
          return [ProtocolType.FINS, ProtocolType.MODBUS_TCP]
        default:
          return [ProtocolType.MODBUS_TCP]
      }
    } else {
      return [ProtocolType.MODBUS_RTU]
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="protocol-type">통신 프로토콜</Label>
        <Select value={selectedProtocol} onValueChange={handleProtocolChange}>
          <SelectTrigger id="protocol-type">
            <SelectValue placeholder="프로토콜 선택" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableProtocols().map((p) => (
              <SelectItem key={p} value={p}>
                {p === ProtocolType.MODBUS_TCP && "Modbus TCP/IP"}
                {p === ProtocolType.MODBUS_RTU && "Modbus RTU"}
                {p === ProtocolType.ETHERNET_IP && "EtherNet/IP"}
                {p === ProtocolType.PROFINET && "PROFINET"}
                {p === ProtocolType.S7 && "S7 Protocol"}
                {p === ProtocolType.MC_PROTOCOL && "MC Protocol"}
                {p === ProtocolType.FINS && "FINS"}
                {p === ProtocolType.OTHER && "기타"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      {(selectedProtocol === ProtocolType.MODBUS_TCP || selectedProtocol === ProtocolType.MODBUS_RTU) && (
        <Card>
          <CardHeader>
            <CardTitle>Modbus 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...modbusForm}>
              <form onSubmit={modbusForm.handleSubmit(handleModbusSubmit)} className="space-y-4">
                <FormField
                  control={modbusForm.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit ID (Slave ID)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Modbus 장치의 식별자 (1-247)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={modbusForm.control}
                  name="wordOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>워드 순서</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="워드 순서 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="big_endian">Big Endian (AB CD)</SelectItem>
                          <SelectItem value="little_endian">Little Endian (CD AB)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>다중 레지스터 값의 바이트 순서</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={modbusForm.control}
                  name="registerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>기본 레지스터 유형</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="레지스터 유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="holding">Holding Register (4x)</SelectItem>
                          <SelectItem value="input">Input Register (3x)</SelectItem>
                          <SelectItem value="coil">Coil (0x)</SelectItem>
                          <SelectItem value="discrete_input">Discrete Input (1x)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>기본적으로 사용할 Modbus 레지스터 유형</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={modbusForm.control}
                  name="startAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>시작 주소</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>레지스터 주소의 시작점</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={modbusForm.control}
                  name="useZeroBasedAddressing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>0 기반 주소 지정 사용</FormLabel>
                        <FormDescription>주소를 0부터 시작하는 방식으로 사용합니다.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    "설정 저장"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {selectedProtocol === ProtocolType.S7 && (
        <Card>
          <CardHeader>
            <CardTitle>S7 프로토콜 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...s7Form}>
              <form onSubmit={s7Form.handleSubmit(handleS7Submit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={s7Form.control}
                    name="rack"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>랙 번호</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>PLC 랙 번호 (0-7)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={s7Form.control}
                    name="slot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>슬롯 번호</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>PLC 슬롯 번호 (0-31)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={s7Form.control}
                  name="pduSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PDU 크기</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="PDU 크기 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="240">240 바이트</SelectItem>
                          <SelectItem value="480">480 바이트</SelectItem>
                          <SelectItem value="960">960 바이트</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>프로토콜 데이터 단위의 최대 크기</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={s7Form.control}
                    name="localTSAP"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>로컬 TSAP (선택사항)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>로컬 TSAP 식별자 (16진수)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={s7Form.control}
                    name="remoteTSAP"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>원격 TSAP (선택사항)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>원격 TSAP 식별자 (16진수)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    "설정 저장"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {selectedProtocol === ProtocolType.ETHERNET_IP && (
        <Card>
          <CardHeader>
            <CardTitle>EtherNet/IP 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">EtherNet/IP 프로토콜 설정은 현재 개발 중입니다.</p>
          </CardContent>
        </Card>
      )}

      {selectedProtocol === ProtocolType.PROFINET && (
        <Card>
          <CardHeader>
            <CardTitle>PROFINET 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">PROFINET 프로토콜 설정은 현재 개발 중입니다.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
