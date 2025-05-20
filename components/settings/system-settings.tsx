"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Save, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useSettingsApi, type SystemSettings, type SystemInfo } from "@/lib/api/settings-api"

export default function SystemSettings() {
  const [systemTab, setSystemTab] = useState("performance")

  const {
    systemSettings,
    systemInfo,
    isSystemLoading,
    isBackingUp,
    isClearingLogs,
    updateSystemSettings,
    clearLogs,
    backupSystem,
    loadSystemInfo,
  } = useSettingsApi()

  // 로컬 상태로 시스템 설정 관리
  const [localSettings, setLocalSettings] = useState<SystemSettings>({
    processingMode: "balanced",
    maxThreads: 4,
    enableMultiprocessing: true,
    gpuMemoryLimit: 2048,
    maxFps: 30,
    enableFrameSkipping: true,
    frameSkipRate: 2,
    logLevel: "info",
    logRetentionDays: 30,
    enableImageSaving: true,
    imageSavePath: "/data/images",
    imageFormat: "jpg",
    imageQuality: 85,
    maxStorageSize: 10,
    enableNotifications: true,
    notifyOnError: true,
    notifyOnWarning: true,
    notifyOnSuccess: true,
    emailNotifications: false,
    emailRecipients: "",
    enableAutoBackup: true,
    backupInterval: 24,
    backupPath: "/data/backup",
    maxBackupCount: 5,
  })

  // 시스템 정보 상태
  const [localSystemInfo, setLocalSystemInfo] = useState<SystemInfo>({
    cpuUsage: 0,
    memoryUsage: { used: 0, total: 0 },
    gpuUsage: 0,
    diskUsage: { used: 0, total: 0 },
  })

  // API에서 가져온 설정으로 로컬 상태 초기화
  useEffect(() => {
    if (systemSettings) {
      setLocalSettings(systemSettings)
    }
  }, [systemSettings])

  // API에서 가져온 시스템 정보로 로컬 상태 초기화
  useEffect(() => {
    if (systemInfo) {
      setLocalSystemInfo(systemInfo)
    }
  }, [systemInfo])

  // 주기적으로 시스템 정보 업데이트
  useEffect(() => {
    const updateSystemInfoPeriodically = async () => {
      await loadSystemInfo()
    }

    // 초기 로드
    updateSystemInfoPeriodically()

    // 10초마다 업데이트
    const intervalId = setInterval(updateSystemInfoPeriodically, 10000)

    return () => clearInterval(intervalId)
  }, [loadSystemInfo])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocalSettings({
      ...localSettings,
      [name]: value,
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setLocalSettings({
      ...localSettings,
      [name]: checked,
    })
    handleSettingChange({ [name]: checked })
  }

  const handleSelectChange = (name: string, value: string) => {
    setLocalSettings({
      ...localSettings,
      [name]: value,
    })
    handleSettingChange({ [name]: value })
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setLocalSettings({
      ...localSettings,
      [name]: value[0],
    })
  }

  const handleClearLogs = async () => {
    await clearLogs()
  }

  const handleBackupNow = async () => {
    await backupSystem()
  }

  // 설정 변경 시 자동 저장
  const handleSettingChange = async (settings?: Partial<SystemSettings>) => {
    const updatedSettings = settings || localSettings
    await updateSystemSettings(updatedSettings)
  }

  return (
    <>
      <CardHeader>
        <CardTitle>시스템 설정</CardTitle>
        <CardDescription>시스템 성능 및 기타 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>시스템 정보</AlertTitle>
          <AlertDescription>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-xs">
                CPU 사용량: <Badge variant="outline">{localSystemInfo.cpuUsage}%</Badge>
              </div>
              <div className="text-xs">
                메모리 사용량:{" "}
                <Badge variant="outline">
                  {localSystemInfo.memoryUsage.used}GB / {localSystemInfo.memoryUsage.total}GB
                </Badge>
              </div>
              <div className="text-xs">
                GPU 사용량: <Badge variant="outline">{localSystemInfo.gpuUsage}%</Badge>
              </div>
              <div className="text-xs">
                디스크 사용량:{" "}
                <Badge variant="outline">
                  {localSystemInfo.diskUsage.used}GB / {localSystemInfo.diskUsage.total}GB
                </Badge>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Tabs value={systemTab} onValueChange={setSystemTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">성능</TabsTrigger>
            <TabsTrigger value="storage">저장소</TabsTrigger>
            <TabsTrigger value="notification">알림</TabsTrigger>
            <TabsTrigger value="backup">백업</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="processingMode">처리 모드</Label>
              <Select
                value={localSettings.processingMode}
                onValueChange={(value) => handleSelectChange("processingMode", value)}
              >
                <SelectTrigger id="processingMode">
                  <SelectValue placeholder="처리 모드 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">성능 우선 (높은 리소스 사용)</SelectItem>
                  <SelectItem value="balanced">균형 (권장)</SelectItem>
                  <SelectItem value="efficiency">효율성 우선 (낮은 리소스 사용)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="maxThreads">최대 스레드 수</Label>
                <span className="text-sm">{localSettings.maxThreads} 스레드</span>
              </div>
              <Slider
                id="maxThreads"
                min={1}
                max={16}
                step={1}
                value={[localSettings.maxThreads]}
                onValueChange={(value) => handleSliderChange("maxThreads", value)}
                onValueCommit={() => handleSettingChange()}
              />
              <p className="text-xs text-muted-foreground">처리에 사용할 최대 CPU 스레드 수입니다.</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableMultiprocessing">멀티프로세싱 사용</Label>
                <p className="text-xs text-muted-foreground">여러 프로세스를 사용하여 병렬 처리합니다.</p>
              </div>
              <Switch
                id="enableMultiprocessing"
                checked={localSettings.enableMultiprocessing}
                onCheckedChange={(checked) => handleSwitchChange("enableMultiprocessing", checked)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="gpuMemoryLimit">GPU 메모리 제한</Label>
                <span className="text-sm">{localSettings.gpuMemoryLimit} MB</span>
              </div>
              <Slider
                id="gpuMemoryLimit"
                min={512}
                max={8192}
                step={512}
                value={[localSettings.gpuMemoryLimit]}
                onValueChange={(value) => handleSliderChange("gpuMemoryLimit", value)}
                onValueCommit={() => handleSettingChange()}
              />
              <p className="text-xs text-muted-foreground">사용할 최대 GPU 메모리 양입니다.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="maxFps">최대 FPS</Label>
                <span className="text-sm">{localSettings.maxFps} FPS</span>
              </div>
              <Slider
                id="maxFps"
                min={1}
                max={60}
                step={1}
                value={[localSettings.maxFps]}
                onValueChange={(value) => handleSliderChange("maxFps", value)}
                onValueCommit={() => handleSettingChange()}
              />
              <p className="text-xs text-muted-foreground">처리할 최대 초당 프레임 수입니다.</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableFrameSkipping">프레임 스킵 사용</Label>
                <p className="text-xs text-muted-foreground">일부 프레임을 건너뛰어 처리 부하를 줄입니다.</p>
              </div>
              <Switch
                id="enableFrameSkipping"
                checked={localSettings.enableFrameSkipping}
                onCheckedChange={(checked) => handleSwitchChange("enableFrameSkipping", checked)}
              />
            </div>

            {localSettings.enableFrameSkipping && (
              <div className="space-y-2 pl-6 border-l-2 border-muted">
                <div className="flex justify-between">
                  <Label htmlFor="frameSkipRate">프레임 스킵 비율</Label>
                  <span className="text-sm">1/{localSettings.frameSkipRate}</span>
                </div>
                <Slider
                  id="frameSkipRate"
                  min={1}
                  max={10}
                  step={1}
                  value={[localSettings.frameSkipRate]}
                  onValueChange={(value) => handleSliderChange("frameSkipRate", value)}
                  onValueCommit={() => handleSettingChange()}
                />
                <p className="text-xs text-muted-foreground">
                  처리할 프레임 간격입니다. 예: 2는 1개 처리 후 1개 건너뜀을 의미합니다.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="storage" className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="logLevel">로그 레벨</Label>
              <Select value={localSettings.logLevel} onValueChange={(value) => handleSelectChange("logLevel", value)}>
                <SelectTrigger id="logLevel">
                  <SelectValue placeholder="로그 레벨 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">디버그 (가장 상세)</SelectItem>
                  <SelectItem value="info">정보</SelectItem>
                  <SelectItem value="warning">경고</SelectItem>
                  <SelectItem value="error">오류</SelectItem>
                  <SelectItem value="critical">심각</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="logRetentionDays">로그 보관 기간</Label>
                <span className="text-sm">{localSettings.logRetentionDays}일</span>
              </div>
              <Slider
                id="logRetentionDays"
                min={1}
                max={90}
                step={1}
                value={[localSettings.logRetentionDays]}
                onValueChange={(value) => handleSliderChange("logRetentionDays", value)}
                onValueCommit={() => handleSettingChange()}
              />
              <p className="text-xs text-muted-foreground">
                로그를 보관할 기간입니다. 이 기간이 지난 로그는 자동으로 삭제됩니다.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableImageSaving">이미지 저장</Label>
                <p className="text-xs text-muted-foreground">감지된 객체의 이미지를 저장합니다.</p>
              </div>
              <Switch
                id="enableImageSaving"
                checked={localSettings.enableImageSaving}
                onCheckedChange={(checked) => handleSwitchChange("enableImageSaving", checked)}
              />
            </div>

            {localSettings.enableImageSaving && (
              <div className="space-y-4 pl-6 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="imageSavePath">이미지 저장 경로</Label>
                  <Input
                    id="imageSavePath"
                    name="imageSavePath"
                    value={localSettings.imageSavePath}
                    onChange={handleInputChange}
                    onBlur={() => handleSettingChange()}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageFormat">이미지 형식</Label>
                    <Select
                      value={localSettings.imageFormat}
                      onValueChange={(value) => handleSelectChange("imageFormat", value)}
                    >
                      <SelectTrigger id="imageFormat">
                        <SelectValue placeholder="형식 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="imageQuality">이미지 품질</Label>
                      <span className="text-sm">{localSettings.imageQuality}%</span>
                    </div>
                    <Slider
                      id="imageQuality"
                      min={10}
                      max={100}
                      step={5}
                      value={[localSettings.imageQuality]}
                      onValueChange={(value) => handleSliderChange("imageQuality", value)}
                      onValueCommit={() => handleSettingChange()}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="maxStorageSize">최대 저장 공간</Label>
                <span className="text-sm">{localSettings.maxStorageSize} GB</span>
              </div>
              <Slider
                id="maxStorageSize"
                min={1}
                max={100}
                step={1}
                value={[localSettings.maxStorageSize]}
                onValueChange={(value) => handleSliderChange("maxStorageSize", value)}
                onValueCommit={() => handleSettingChange()}
              />
              <p className="text-xs text-muted-foreground">로그와 이미지에 사용할 최대 디스크 공간입니다.</p>
            </div>

            <Button variant="outline" className="w-full" onClick={handleClearLogs} disabled={isClearingLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearingLogs ? "삭제 중..." : "모든 로그 삭제"}
            </Button>
          </TabsContent>

          <TabsContent value="notification" className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableNotifications">알림 활성화</Label>
                <p className="text-xs text-muted-foreground">시스템 알림을 활성화합니다.</p>
              </div>
              <Switch
                id="enableNotifications"
                checked={localSettings.enableNotifications}
                onCheckedChange={(checked) => handleSwitchChange("enableNotifications", checked)}
              />
            </div>

            {localSettings.enableNotifications && (
              <div className="space-y-4 pl-6 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyOnError">오류 알림</Label>
                  <Switch
                    id="notifyOnError"
                    checked={localSettings.notifyOnError}
                    onCheckedChange={(checked) => handleSwitchChange("notifyOnError", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyOnWarning">경고 알림</Label>
                  <Switch
                    id="notifyOnWarning"
                    checked={localSettings.notifyOnWarning}
                    onCheckedChange={(checked) => handleSwitchChange("notifyOnWarning", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyOnSuccess">성공 알림</Label>
                  <Switch
                    id="notifyOnSuccess"
                    checked={localSettings.notifyOnSuccess}
                    onCheckedChange={(checked) => handleSwitchChange("notifyOnSuccess", checked)}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">이메일 알림</Label>
                <p className="text-xs text-muted-foreground">중요 이벤트를 이메일로 알립니다.</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={localSettings.emailNotifications}
                onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
              />
            </div>

            {localSettings.emailNotifications && (
              <div className="space-y-2 pl-6 border-l-2 border-muted">
                <Label htmlFor="emailRecipients">수신자 이메일</Label>
                <Input
                  id="emailRecipients"
                  name="emailRecipients"
                  placeholder="example@example.com, another@example.com"
                  value={localSettings.emailRecipients}
                  onChange={handleInputChange}
                  onBlur={() => handleSettingChange()}
                />
                <p className="text-xs text-muted-foreground">여러 이메일은 쉼표로 구분하세요.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="backup" className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableAutoBackup">자동 백업</Label>
                <p className="text-xs text-muted-foreground">시스템 설정과 데이터를 자동으로 백업합니다.</p>
              </div>
              <Switch
                id="enableAutoBackup"
                checked={localSettings.enableAutoBackup}
                onCheckedChange={(checked) => handleSwitchChange("enableAutoBackup", checked)}
              />
            </div>

            {localSettings.enableAutoBackup && (
              <div className="space-y-4 pl-6 border-l-2 border-muted">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="backupInterval">백업 간격</Label>
                    <span className="text-sm">{localSettings.backupInterval}시간</span>
                  </div>
                  <Slider
                    id="backupInterval"
                    min={1}
                    max={168}
                    step={1}
                    value={[localSettings.backupInterval]}
                    onValueChange={(value) => handleSliderChange("backupInterval", value)}
                    onValueCommit={() => handleSettingChange()}
                  />
                  <p className="text-xs text-muted-foreground">자동 백업 실행 간격입니다.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupPath">백업 경로</Label>
                  <Input
                    id="backupPath"
                    name="backupPath"
                    value={localSettings.backupPath}
                    onChange={handleInputChange}
                    onBlur={() => handleSettingChange()}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="maxBackupCount">최대 백업 수</Label>
                    <span className="text-sm">{localSettings.maxBackupCount}개</span>
                  </div>
                  <Slider
                    id="maxBackupCount"
                    min={1}
                    max={20}
                    step={1}
                    value={[localSettings.maxBackupCount]}
                    onValueChange={(value) => handleSliderChange("maxBackupCount", value)}
                    onValueCommit={() => handleSettingChange()}
                  />
                  <p className="text-xs text-muted-foreground">
                    보관할 최대 백업 파일 수입니다. 이 수를 초과하면 가장 오래된 백업이 삭제됩니다.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>마지막 백업</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="flex justify-between text-sm">
                  <span>{localSystemInfo.lastBackupTime || "백업 정보 없음"}</span>
                  <Badge variant="outline">성공</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  백업 크기: {localSystemInfo.backupSize ? `${localSystemInfo.backupSize} MB` : "정보 없음"}
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={handleBackupNow} disabled={isBackingUp}>
              {isBackingUp ? (
                <>
                  <div className="mr-2">백업 중...</div>
                  <Progress value={65} className="h-2 w-16" />
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  지금 백업
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  )
}
