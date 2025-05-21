"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ConnectionSettings } from "./connection-settings";
import { ProtocolSettings } from "./protocol-settings";
import { DataMapping } from "./data-mapping";
import { CommunicationTest } from "./communication-test";
import { StatusMonitor } from "./status-monitor";
import { PLCStatisticsComponent } from "./plc-statistics";
import type { PLCDevice, PLCSettings } from "@/types/plc";
import { useToast } from "@/hooks/use-toast";
import {
  getPLCSettings,
  connectPLC,
  disconnectPLC,
  updatePLCDevice,
} from "@/lib/api/plc-api";
import { Loader2 } from "lucide-react";

export function PLCDashboard() {
  const [settings, setSettings] = useState<PLCSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPLCSettings();
        setSettings(data);
      } catch (err) {
        setError("PLC 설정을 로드하는 중 오류가 발생했습니다.");
        toast({
          title: "설정 로드 오류",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleConnect = async (deviceId: string) => {
    try {
      const updatedDevice = await connectPLC(deviceId);
      setSettings((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          device: updatedDevice,
        };
      });
      toast({
        title: "PLC 연결 성공",
        description: "PLC가 성공적으로 연결되었습니다.",
      });
    } catch (err) {
      toast({
        title: "PLC 연결 실패",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    try {
      const updatedDevice = await disconnectPLC(deviceId);
      setSettings((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          device: updatedDevice,
        };
      });
      toast({
        title: "PLC 연결 해제",
        description: "PLC 연결이 해제되었습니다.",
      });
    } catch (err) {
      toast({
        title: "PLC 연결 해제 실패",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateDevice = async (device: PLCDevice) => {
    try {
      const updatedDevice = await updatePLCDevice(device);
      setSettings((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          device: updatedDevice,
        };
      });
      toast({
        title: "장치 정보 업데이트",
        description: "PLC 장치 정보가 업데이트되었습니다.",
      });
    } catch (err) {
      toast({
        title: "장치 정보 업데이트 실패",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">PLC 설정을 로드하는 중...</span>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>PLC 설정을 사용할 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <ConnectionSettings
                device={settings.device}
                onUpdate={handleUpdateDevice}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            </TabsContent>
            <TabsContent value="protocol" className="mt-0">
              <ProtocolSettings
                protocol={settings.protocol}
                deviceType={settings.device.type}
                connectionType={settings.device.connectionType}
              />
            </TabsContent>
            <TabsContent value="mapping" className="mt-0">
              <DataMapping
                mappings={settings.dataMappings}
                protocol={settings.protocol}
                deviceType={settings.device.type}
              />
            </TabsContent>
            <TabsContent value="test" className="mt-0">
              <CommunicationTest device={settings.device} />
            </TabsContent>
            <TabsContent value="monitor" className="mt-0">
              <StatusMonitor device={settings.device} />
            </TabsContent>
            <TabsContent value="statistics" className="mt-0">
              <PLCStatisticsComponent device={settings.device} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
