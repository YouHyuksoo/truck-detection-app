"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// 샘플 데이터
const classDistributionData = [
  { name: "트럭", value: 245 },
  { name: "컨테이너", value: 178 },
  { name: "번호판", value: 312 },
  { name: "기타", value: 87 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const datasetGrowthData = [
  { name: "1월", images: 120 },
  { name: "2월", images: 180 },
  { name: "3월", images: 210 },
  { name: "4월", images: 280 },
  { name: "5월", images: 350 },
  { name: "6월", images: 420 },
]

const annotationQualityData = [
  { name: "높음", value: 65 },
  { name: "중간", value: 25 },
  { name: "낮음", value: 10 },
]

const QUALITY_COLORS = ["#4CAF50", "#FFC107", "#F44336"]

export function DataStatistics() {
  const [activeTab, setActiveTab] = useState("class-distribution")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>데이터 통계</CardTitle>
        <CardDescription>데이터셋 통계 및 분석 정보를 확인합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="class-distribution">클래스 분포</TabsTrigger>
            <TabsTrigger value="dataset-growth">데이터셋 성장</TabsTrigger>
            <TabsTrigger value="annotation-quality">어노테이션 품질</TabsTrigger>
          </TabsList>

          <TabsContent value="class-distribution" className="mt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {classDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="dataset-growth" className="mt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datasetGrowthData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="images" fill="#8884d8" name="이미지 수" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="annotation-quality" className="mt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={annotationQualityData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {annotationQualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={QUALITY_COLORS[index % QUALITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
