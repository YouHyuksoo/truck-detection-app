"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Monitor, Settings, Database, FileText, Target, Cpu, BarChart2, BookOpen } from "lucide-react"

export default function MenuStructure() {
  const [activeTab, setActiveTab] = useState("detection")

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>트럭 번호 감지 시스템 메뉴 구조</CardTitle>
          <CardDescription>시스템의 주요 메뉴 및 기능 구성</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2">
              <TabsTrigger value="detection" className="flex items-center gap-1">
                <Monitor className="h-4 w-4" />
                <span className="hidden md:inline">객체 탐지</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">환경 설정</span>
              </TabsTrigger>
              <TabsTrigger value="training" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                <span className="hidden md:inline">모델 학습</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">로그 조회</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span className="hidden md:inline">데이터 관리</span>
              </TabsTrigger>
              <TabsTrigger value="roi" className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span className="hidden md:inline">관심영역</span>
              </TabsTrigger>
              <TabsTrigger value="plc" className="flex items-center gap-1">
                <Cpu className="h-4 w-4" />
                <span className="hidden md:inline">PLC 설정</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1">
                <BarChart2 className="h-4 w-4" />
                <span className="hidden md:inline">통계</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detection" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>객체 탐지 화면</CardTitle>
                  <CardDescription>실시간 영상 및 감지 결과 표시</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>실시간 카메라 영상 표시</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>감지된 트럭 객체 바운딩 박스 표시</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>추출된 숫자 OCR 결과 표시</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>관심 영역 표시</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>실시간 처리 상태 및 통계 정보</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>환경 설정 메뉴</CardTitle>
                  <CardDescription>시스템 환경 설정 관리</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>비디오 서버 주소 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>YOLO 모델 파라미터 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>OCR 엔진 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>객체 추적 파라미터 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>시스템 성능 설정</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>모델 학습 메뉴</CardTitle>
                  <CardDescription>YOLO 모델 학습 관리</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>학습 데이터셋 선택</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>학습 하이퍼파라미터 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>학습 진행 상태 모니터링</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>모델 평가 및 성능 분석</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>학습된 모델 배포</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>로그 조회 메뉴</CardTitle>
                  <CardDescription>시스템 및 OCR 로그 조회</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>OCR 처리 이력 로그</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>시스템 동작 로그</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>오류 및 경고 로그</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>PLC 통신 로그</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>로그 필터링 및 검색</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>데이터 관리 메뉴</CardTitle>
                  <CardDescription>학습 데이터 관리</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>학습 데이터 업로드</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>데이터 라벨링 도구</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>데이터셋 분할 (학습/검증/테스트)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>데이터 증강 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>데이터 통계 및 분석</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roi" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>관심영역 설정 메뉴</CardTitle>
                  <CardDescription>OCR 처리를 위한 관심영역 설정</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>관심영역 드로잉 도구</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>다중 관심영역 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>관심영역별 처리 규칙 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>관심영역 테스트 및 검증</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>관심영역 프리셋 저장 및 불러오기</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plc" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>PLC 설정 메뉴</CardTitle>
                  <CardDescription>PLC 통신 설정</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>PLC 연결 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>통신 프로토콜 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>데이터 매핑 설정</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>통신 테스트 도구</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>PLC 상태 모니터링</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>통계 메뉴</CardTitle>
                  <CardDescription>시스템 성능 및 처리 통계</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>감지 성공률 통계</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>OCR 인식률 통계</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>처리 시간 분석</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>시스템 리소스 사용량</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      <span>일/주/월별 처리 통계</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
