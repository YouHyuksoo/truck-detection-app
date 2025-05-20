"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CardContent } from "@/components/ui/card"
import { Search, CalendarIcon, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import type { OcrLogFilter } from "@/types/logs"

interface OcrLogFiltersProps {
  filters: OcrLogFilter
  onFilterChange: (filters: Partial<OcrLogFilter>) => void
  isLoading: boolean
}

export default function OcrLogFilters({ filters, onFilterChange, isLoading }: OcrLogFiltersProps) {
  const [localFilters, setLocalFilters] = useState<OcrLogFilter>(filters)

  // 로컬 필터 변경
  const handleLocalFilterChange = <K extends keyof OcrLogFilter>(key: K, value: OcrLogFilter[K]) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  // 날짜 범위 변경
  const handleDateChange = (field: "from" | "to", date: Date | undefined) => {
    if (!date) return

    setLocalFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date,
      },
    }))
  }

  // 필터 적용
  const applyFilters = () => {
    onFilterChange(localFilters)
  }

  // 필터 초기화
  const resetFilters = () => {
    const defaultFilters: OcrLogFilter = {
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
        to: new Date(),
      },
      numberQuery: "",
      minConfidence: 0,
      roiFilter: "all",
      sortBy: "timestamp",
      sortOrder: "desc",
    }

    setLocalFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  return (
    <CardContent className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 날짜 범위 선택 */}
        <div className="space-y-2">
          <Label>날짜 범위</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(localFilters.dateRange.from, "yyyy-MM-dd", { locale: ko })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={localFilters.dateRange.from}
                  onSelect={(date) => handleDateChange("from", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="flex items-center">~</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(localFilters.dateRange.to, "yyyy-MM-dd", { locale: ko })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={localFilters.dateRange.to}
                  onSelect={(date) => handleDateChange("to", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 숫자 검색 */}
        <div className="space-y-2">
          <Label htmlFor="numberQuery">숫자 검색</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="numberQuery"
              placeholder="인식된 숫자 검색..."
              className="pl-8"
              value={localFilters.numberQuery}
              onChange={(e) => handleLocalFilterChange("numberQuery", e.target.value)}
            />
          </div>
        </div>

        {/* 신뢰도 필터 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="minConfidence">최소 신뢰도</Label>
            <span className="text-sm">{localFilters.minConfidence}%</span>
          </div>
          <Slider
            id="minConfidence"
            min={0}
            max={100}
            step={5}
            value={[localFilters.minConfidence]}
            onValueChange={(value) => handleLocalFilterChange("minConfidence", value[0])}
          />
        </div>

        {/* 관심영역 필터 */}
        <div className="space-y-2">
          <Label htmlFor="roiFilter">관심영역</Label>
          <Select value={localFilters.roiFilter} onValueChange={(value) => handleLocalFilterChange("roiFilter", value)}>
            <SelectTrigger id="roiFilter">
              <SelectValue placeholder="관심영역 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 영역</SelectItem>
              <SelectItem value="입구 영역">입구 영역</SelectItem>
              <SelectItem value="출구 영역">출구 영역</SelectItem>
              <SelectItem value="주차장 입구">주차장 입구</SelectItem>
              <SelectItem value="하차장">하차장</SelectItem>
              <SelectItem value="검수 구역">검수 구역</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* 정렬 옵션 */}
        <div className="space-y-2">
          <Label htmlFor="sortBy">정렬 기준</Label>
          <Select value={localFilters.sortBy} onValueChange={(value) => handleLocalFilterChange("sortBy", value)}>
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="정렬 기준 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">날짜/시간</SelectItem>
              <SelectItem value="recognizedNumber">인식된 숫자</SelectItem>
              <SelectItem value="confidence">신뢰도</SelectItem>
              <SelectItem value="roiName">관심영역</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">정렬 순서</Label>
          <Select
            value={localFilters.sortOrder}
            onValueChange={(value) => handleLocalFilterChange("sortOrder", value as "asc" | "desc")}
          >
            <SelectTrigger id="sortOrder">
              <SelectValue placeholder="정렬 순서 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">오름차순</SelectItem>
              <SelectItem value="desc">내림차순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-2 flex items-end gap-2">
          <Button variant="outline" className="flex-1" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            초기화
          </Button>
          <Button className="flex-1" onClick={applyFilters} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "검색 중..." : "검색"}
          </Button>
        </div>
      </div>
    </CardContent>
  )
}
