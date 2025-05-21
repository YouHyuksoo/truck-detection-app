"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type PLCDevice, ConnectionStatus } from "@/types/plc";
import { CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StatusMonitorProps {
  device: PLCDevice;
  onConnect: (deviceId: string) => Promise<void>;
  onDisconnect: (deviceId: string) => Promise<void>;
  onUpdate: (device: PLCDevice) => Promise<void>;
}

export function StatusMonitor({
  device,
  onConnect,
  onDisconnect,
  onUpdate,
}: StatusMonitorProps) {
  const [status, setStatus] = useState(device.status);
  const [lastConnected, setLastConnected] = useState<Date | undefined>(
    device.lastConnected
  );
  const { toast } = useToast();

  // 초기 상태 설정
  useEffect(() => {
    setStatus(device.status);
    setLastConnected(
      device.lastConnected ? new Date(device.lastConnected) : undefined
    );
  }, [device]);

  // 주기적으로 PLC 상태 업데이트 (30초마다)
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!device.id) return;

      try {
        // 실제 구현에서는 상태 확인 API를 호출할 수 있습니다.
        // 여기서는 시뮬레이션만 합니다.
        if (status === ConnectionStatus.CONNECTED) {
          // 90% 확률로 연결 유지
          if (Math.random() > 0.1) {
            // 연결 유지, 아무 동작 필요 없음
          } else {
            // 연결 끊김
            setStatus(ConnectionStatus.DISCONNECTED);
            toast({
              title: "연결 끊김 감지",
              description:
                "PLC와의 연결이 끊어졌습니다. 다시 연결을 시도하세요.",
              variant: "destructive",
            });
          }
        }
      } catch (err) {
        console.error("PLC 상태 모니터링 오류:", err);
      }
    }, 30000); // 30초로 변경

    return () => clearInterval(intervalId);
  }, [device.id, toast, status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>상태 모니터링</CardTitle>
        <CardDescription>PLC 연결 상태 및 정보를 표시합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">장치 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-muted-foreground">이름</div>
              <div className="font-medium">{device.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">유형</div>
              <div className="font-medium">{device.type}</div>
            </div>
            <div>
              <div className="text-muted-foreground">연결 방식</div>
              <div className="font-medium">{device.connectionType}</div>
            </div>
            <div>
              <div className="text-muted-foreground">IP 주소</div>
              <div className="font-medium">{device.ipAddress || "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">포트</div>
              <div className="font-medium">{device.port || "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">COM 포트</div>
              <div className="font-medium">{device.comPort || "-"}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">연결 상태</h3>
          <div className="flex items-center">
            {status === ConnectionStatus.CONNECTED && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                연결됨
              </Badge>
            )}
            {status === ConnectionStatus.DISCONNECTED && (
              <Badge
                variant="outline"
                className="bg-gray-50 text-gray-700 border-gray-200"
              >
                연결 끊김
              </Badge>
            )}
            {status === ConnectionStatus.CONNECTING && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                연결 중...
              </Badge>
            )}
            {status === ConnectionStatus.ERROR && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                오류
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">최근 연결</h3>
          {lastConnected ? (
            <div className="text-sm">
              {lastConnected.toLocaleDateString()}{" "}
              {lastConnected.toLocaleTimeString()}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 inline-block" />
              연결 기록 없음
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
