"use client";

/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Maximize2,
  Settings,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  Power,
  PowerOff,
} from "lucide-react";
import VideoFeed from "./video-feed";
import { useToast } from "@/hooks/use-toast";
import {
  useDetectionApi,
  toggleDetection,
  toggleOcr,
  fetchSystemStatus,
  type SystemStatus,
} from "@/lib/api/detection-api";

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const headingStyles = css`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

export default function DetectionDashboard() {
  // useDetectionApi 훅을 통해 상태 및 기능 가져오기
  const {
    isVideoConnected,
    isMetaConnected,
    videoServerRunning,
    // detectionStats와 ocrResults 제거됨
    systemStatus,
    startVideoServer,
    stopVideoServer,
  } = useDetectionApi();

  const [detectionEnabled, setDetectionEnabled] = useState(true);
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(40);
  const [activeTab, setActiveTab] = useState("live");
  const [fullscreen, setFullscreen] = useState(false);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 전체화면 토글
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && dashboardRef.current) {
      dashboardRef.current.requestFullscreen().catch((err) => {
        toast({
          title: "전체화면 모드 오류",
          description: `전체화면 모드를 시작할 수 없습니다: ${err.message}`,
          variant: "destructive",
        });
      });
    } else {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  // 객체 감지 토글
  const handleToggleDetection = async () => {
    const success = await toggleDetection(!detectionEnabled, toast);
    if (success) {
      setDetectionEnabled(!detectionEnabled);
    }
  };

  // OCR 토글
  const handleToggleOcr = async () => {
    const success = await toggleOcr(!ocrEnabled, toast);
    if (success) {
      setOcrEnabled(!ocrEnabled);
    }
  };

  // 신뢰도 임계값 변경 처리
  const handleConfidenceChange = async (value: number[]) => {
    setConfidenceThreshold(value[0]);

    // 슬라이더 이동이 끝나면 API로 설정 저장
    const threshold = value[0];
    console.log(`신뢰도 임계값 설정: ${threshold}%`);
    await setConfidenceThreshold(threshold);
  };

  // 스냅샷 캡처 처리 함수 제거됨

  // 비디오 서버 토글 핸들러
  const handleToggleVideoServer = async () => {
    if (videoServerRunning) {
      await stopVideoServer();
    } else {
      await startVideoServer();
    }
  };

  return (
    <div
      ref={dashboardRef}
      className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${
        fullscreen ? "fixed inset-0 bg-background z-50 p-4 overflow-auto" : ""
      }`}
    >
      {/* Main video feed */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">실시간 영상</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                <Badge
                  variant={isVideoConnected ? "default" : "destructive"}
                  className="ml-2"
                >
                  영상 {isVideoConnected ? "연결됨" : "연결 끊김"}
                </Badge>
                <Badge
                  variant={isMetaConnected ? "default" : "destructive"}
                  className="ml-2"
                >
                  메타데이터 {isMetaConnected ? "연결됨" : "연결 끊김"}
                </Badge>
              </div>
              <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="px-4 pt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="live">실시간 영상</TabsTrigger>
                  <TabsTrigger value="recorded">녹화 영상</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="live" className="m-0">
                <div className="relative">
                  <VideoFeed
                    isPlaying={true}
                    showDetections={detectionEnabled}
                    showOcr={ocrEnabled}
                    confidenceThreshold={confidenceThreshold / 100}
                  >
                    <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
                      <Button
                        variant={videoServerRunning ? "destructive" : "default"}
                        size="sm"
                        className={`shadow-md ${
                          videoServerRunning
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                        onClick={handleToggleVideoServer}
                      >
                        {videoServerRunning ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            서버 종료
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-2" />
                            서버 시작
                          </>
                        )}
                      </Button>
                    </div>
                  </VideoFeed>
                </div>
              </TabsContent>

              <TabsContent value="recorded" className="m-0">
                <div className="flex items-center justify-center h-[400px] bg-muted">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      녹화된 영상이 없습니다.
                    </p>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      녹화 영상 불러오기
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar with controls and results */}
      <div className="space-y-4">
        {/* Detection controls */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">감지 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="detection-toggle">객체 감지</Label>
                <span className="text-xs text-muted-foreground">
                  객체 감지 활성화
                </span>
              </div>
              <Switch
                id="detection-toggle"
                checked={detectionEnabled}
                onCheckedChange={handleToggleDetection}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="ocr-toggle">OCR 처리</Label>
                <span className="text-xs text-muted-foreground">
                  숫자 인식 활성화
                </span>
              </div>
              <Switch
                id="ocr-toggle"
                checked={ocrEnabled}
                onCheckedChange={handleToggleOcr}
                disabled={!detectionEnabled}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="confidence-threshold">감지 신뢰도 임계값</Label>
                <span className="text-sm">{confidenceThreshold}%</span>
              </div>
              <Slider
                id="confidence-threshold"
                min={0}
                max={100}
                step={1}
                value={[confidenceThreshold]}
                onValueChange={handleConfidenceChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>낮음</span>
                <span>높음</span>
              </div>
            </div>

            <Separator />

            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              고급 설정
            </Button>
          </CardContent>
        </Card>

        {/* System status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">시스템 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">카메라 연결</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  정상
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">YOLO 모델</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  정상
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">OCR 엔진</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  정상
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">PLC 연결</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  주의
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">시스템 부하</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  정상 (32%)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 감지 통계 및 OCR 결과 카드 제거됨 */}
      </div>
    </div>
  );
}
