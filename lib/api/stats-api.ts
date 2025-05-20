import { toast } from "@/components/ui/use-toast";

// 통계 데이터 타입 정의
export interface StatsOverview {
  totalDetections: number;
  detectionSuccessRate: number;
  ocrRecognitionRate: number;
  averageProcessingTime: number;
  previousMonthComparison: {
    totalDetections: number;
    detectionSuccessRate: number;
    ocrRecognitionRate: number;
    averageProcessingTime: number;
  };
}

export interface DetectionTypeData {
  name: string;
  value: number;
}

export interface TimeSeriesData {
  date: string;
  [key: string]: string | number;
}

export interface AreaData {
  area: string;
  count: number;
  success: number;
}

export interface DetectionStatistics {
  detectionByType: DetectionTypeData[];
  detectionByTime: TimeSeriesData[];
  detectionByArea: AreaData[];
  averageAccuracy: number;
  averageProcessingSpeed: number;
  falseDetectionRate: number;
}

export interface OcrStatistics {
  accuracyTrend: TimeSeriesData[];
  confidenceLevels: DetectionTypeData[];
  errorTypes: { type: string; count: number }[];
  averageAccuracy: number;
  averageProcessingTime: number;
  errorRate: number;
}

export interface ProcessingTimeStatistics {
  processingSteps: { name: string; time: number }[];
  timeTrend: TimeSeriesData[];
  loadDistribution: TimeSeriesData[];
  averageTotalTime: number;
  maxProcessingTime: number;
  processingsPerSecond: number;
}

export interface ResourceUsageStatistics {
  cpuUsage: TimeSeriesData[];
  memoryUsage: TimeSeriesData[];
  diskUsage: DetectionTypeData[];
  currentUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
  performanceMetrics: {
    averageCpu: number;
    averageMemory: number;
    networkBandwidth: number;
    gpu: number;
    diskIo: number;
  };
}

export interface TimePeriodStatistics {
  daily: TimeSeriesData[];
  weekly: TimeSeriesData[];
  monthly: TimeSeriesData[];
}

// API 함수 구현
export async function getStatsOverview(): Promise<StatsOverview> {
  try {
    if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
      // 목업 데이터 반환
      await new Promise((resolve) => setTimeout(resolve, 500)); // 지연 시간 추가
      return {
        totalDetections: 24892,
        detectionSuccessRate: 94.3,
        ocrRecognitionRate: 89.7,
        averageProcessingTime: 245,
        previousMonthComparison: {
          totalDetections: 12.5,
          detectionSuccessRate: 2.1,
          ocrRecognitionRate: 3.4,
          averageProcessingTime: -18,
        },
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/stats/overview`
    );
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("통계 개요 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description: "통계 개요 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
    // 기본값 반환
    return {
      totalDetections: 0,
      detectionSuccessRate: 0,
      ocrRecognitionRate: 0,
      averageProcessingTime: 0,
      previousMonthComparison: {
        totalDetections: 0,
        detectionSuccessRate: 0,
        ocrRecognitionRate: 0,
        averageProcessingTime: 0,
      },
    };
  }
}

export async function getDetectionStats(dateRange: {
  from: Date;
  to: Date;
}): Promise<DetectionStatistics> {
  try {
    if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
      // 목업 데이터 반환
      await new Promise((resolve) => setTimeout(resolve, 500)); // 지연 시간 추가
      return {
        detectionByType: [
          { name: "트럭", value: 12500 },
          { name: "컨테이너", value: 8200 },
          { name: "기타 차량", value: 4192 },
        ],
        detectionByTime: [
          { date: "00-04", count: 1250, success: 1180 },
          { date: "04-08", count: 2100, success: 1950 },
          { date: "08-12", count: 5200, success: 4900 },
          { date: "12-16", count: 4800, success: 4500 },
          { date: "16-20", count: 6300, success: 5900 },
          { date: "20-24", count: 3200, success: 3000 },
        ],
        detectionByArea: [
          { area: "입구", count: 8500, success: 8100 },
          { area: "출구", count: 7200, success: 6800 },
          { area: "주차장", count: 5100, success: 4700 },
          { area: "하차장", count: 4092, success: 3800 },
        ],
        averageAccuracy: 92.8,
        averageProcessingSpeed: 185,
        falseDetectionRate: 3.2,
      };
    }

    const params = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/stats/detection?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("감지 통계 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description: "감지 통계 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
    // 기본값 반환
    return {
      detectionByType: [],
      detectionByTime: [],
      detectionByArea: [],
      averageAccuracy: 0,
      averageProcessingSpeed: 0,
      falseDetectionRate: 0,
    };
  }
}

export async function getOcrStats(dateRange: {
  from: Date;
  to: Date;
}): Promise<OcrStatistics> {
  try {
    if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
      // 목업 데이터 반환
      await new Promise((resolve) => setTimeout(resolve, 500)); // 지연 시간 추가
      return {
        accuracyTrend: [
          { date: "5/1", accuracy: 85.2 },
          { date: "5/5", accuracy: 86.1 },
          { date: "5/10", accuracy: 87.5 },
          { date: "5/15", accuracy: 88.2 },
          { date: "5/20", accuracy: 89.0 },
          { date: "5/25", accuracy: 89.5 },
          { date: "5/30", accuracy: 89.7 },
        ],
        confidenceLevels: [
          { name: "90-100%", value: 12500 },
          { name: "80-90%", value: 6800 },
          { name: "70-80%", value: 3200 },
          { name: "60-70%", value: 1500 },
          { name: "<60%", value: 892 },
        ],
        errorTypes: [
          { type: "숫자 오인식", count: 450 },
          { type: "부분 누락", count: 320 },
          { type: "번호판 미감지", count: 280 },
          { type: "저해상도", count: 210 },
          { type: "기타", count: 140 },
        ],
        averageAccuracy: 89.7,
        averageProcessingTime: 75,
        errorRate: 10.3,
      };
    }

    const params = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/stats/ocr?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("OCR 통계 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description: "OCR 통계 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
    // 기본값 반환
    return {
      accuracyTrend: [],
      confidenceLevels: [],
      errorTypes: [],
      averageAccuracy: 0,
      averageProcessingTime: 0,
      errorRate: 0,
    };
  }
}

export async function getProcessingTimeStats(dateRange: {
  from: Date;
  to: Date;
}): Promise<ProcessingTimeStatistics> {
  try {
    if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
      // 목업 데이터 반환
      await new Promise((resolve) => setTimeout(resolve, 500)); // 지연 시간 추가
      return {
        processingSteps: [
          { name: "영상 획득", time: 15 },
          { name: "전처리", time: 25 },
          { name: "객체 감지", time: 120 },
          { name: "객체 추적", time: 35 },
          { name: "OCR 처리", time: 75 },
          { name: "후처리", time: 20 },
        ],
        timeTrend: [
          { date: "5/1", total: 310, detection: 135, ocr: 85 },
          { date: "5/5", total: 300, detection: 130, ocr: 82 },
          { date: "5/10", total: 285, detection: 125, ocr: 80 },
          { date: "5/15", total: 275, detection: 122, ocr: 78 },
          { date: "5/20", total: 265, detection: 120, ocr: 76 },
          { date: "5/25", total: 255, detection: 118, ocr: 75 },
          { date: "5/30", total: 245, detection: 115, ocr: 75 },
        ],
        loadDistribution: [
          { date: "00:00", load: 15 },
          { date: "02:00", load: 10 },
          { date: "04:00", load: 8 },
          { date: "06:00", load: 20 },
          { date: "08:00", load: 45 },
          { date: "10:00", load: 65 },
          { date: "12:00", load: 70 },
          { date: "14:00", load: 75 },
          { date: "16:00", load: 80 },
          { date: "18:00", load: 70 },
          { date: "20:00", load: 55 },
          { date: "22:00", load: 30 },
        ],
        averageTotalTime: 245,
        maxProcessingTime: 520,
        processingsPerSecond: 4.1,
      };
    }

    const params = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/stats/processing-time?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("처리 시간 통계 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description: "처리 시간 통계 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
    // 기본값 반환
    return {
      processingSteps: [],
      timeTrend: [],
      loadDistribution: [],
      averageTotalTime: 0,
      maxProcessingTime: 0,
      processingsPerSecond: 0,
    };
  }
}

export async function getResourceUsageStats(dateRange: {
  from: Date;
  to: Date;
}): Promise<ResourceUsageStatistics> {
  try {
    if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
      // 목업 데이터 반환
      await new Promise((resolve) => setTimeout(resolve, 500)); // 지연 시간 추가
      return {
        cpuUsage: [
          { date: "00:00", usage: 25 },
          { date: "02:00", usage: 20 },
          { date: "04:00", usage: 18 },
          { date: "06:00", usage: 30 },
          { date: "08:00", usage: 45 },
          { date: "10:00", usage: 55 },
          { date: "12:00", usage: 60 },
          { date: "14:00", usage: 65 },
          { date: "16:00", usage: 70 },
          { date: "18:00", usage: 60 },
          { date: "20:00", usage: 45 },
          { date: "22:00", usage: 35 },
        ],
        memoryUsage: [
          { date: "00:00", usage: 45 },
          { date: "02:00", usage: 42 },
          { date: "04:00", usage: 40 },
          { date: "06:00", usage: 48 },
          { date: "08:00", usage: 55 },
          { date: "10:00", usage: 65 },
          { date: "12:00", usage: 70 },
          { date: "14:00", usage: 75 },
          { date: "16:00", usage: 78 },
          { date: "18:00", usage: 72 },
          { date: "20:00", usage: 60 },
          { date: "22:00", usage: 50 },
        ],
        diskUsage: [
          { name: "시스템", value: 25 },
          { name: "로그", value: 15 },
          { name: "이미지", value: 45 },
          { name: "기타", value: 15 },
        ],
        currentUsage: {
          cpu: 32,
          memory: 58,
          disk: 45,
        },
        performanceMetrics: {
          averageCpu: 45,
          averageMemory: 58,
          networkBandwidth: 32,
          gpu: 75,
          diskIo: 28,
        },
      };
    }

    const params = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/stats/resource-usage?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("리소스 사용량 통계 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description:
        "리소스 사용량 통계 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
    // 기본값 반환
    return {
      cpuUsage: [],
      memoryUsage: [],
      diskUsage: [],
      currentUsage: {
        cpu: 0,
        memory: 0,
        disk: 0,
      },
      performanceMetrics: {
        averageCpu: 0,
        averageMemory: 0,
        networkBandwidth: 0,
        gpu: 0,
        diskIo: 0,
      },
    };
  }
}

export async function getTimePeriodStats(dateRange: {
  from: Date;
  to: Date;
}): Promise<TimePeriodStatistics> {
  try {
    if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
      // 목업 데이터 반환
      await new Promise((resolve) => setTimeout(resolve, 500)); // 지연 시간 추가
      return {
        daily: [
          { date: "5/1", count: 820, success: 750, rate: 91.5 },
          { date: "5/2", count: 932, success: 856, rate: 91.8 },
          { date: "5/3", count: 901, success: 830, rate: 92.1 },
          { date: "5/4", count: 934, success: 862, rate: 92.3 },
          { date: "5/5", count: 756, success: 701, rate: 92.7 },
          { date: "5/6", count: 610, success: 567, rate: 93.0 },
          { date: "5/7", count: 580, success: 542, rate: 93.4 },
          { date: "5/8", count: 850, success: 798, rate: 93.9 },
          { date: "5/9", count: 920, success: 867, rate: 94.2 },
          { date: "5/10", count: 870, success: 822, rate: 94.5 },
        ],
        weekly: [
          { date: "1주차", count: 5200, success: 4750, rate: 91.3 },
          { date: "2주차", count: 5500, success: 5060, rate: 92.0 },
          { date: "3주차", count: 6100, success: 5650, rate: 92.6 },
          { date: "4주차", count: 6800, success: 6350, rate: 93.4 },
          { date: "5주차", count: 7200, success: 6780, rate: 94.2 },
        ],
        monthly: [
          { date: "1월", count: 18500, success: 16650, rate: 90.0 },
          { date: "2월", count: 19200, success: 17470, rate: 91.0 },
          { date: "3월", count: 21500, success: 19780, rate: 92.0 },
          { date: "4월", count: 23000, success: 21390, rate: 93.0 },
          { date: "5월", count: 24800, success: 23410, rate: 94.4 },
        ],
      };
    }

    const params = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/stats/time-period?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("시간별 통계 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description: "시간별 통계 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
    // 기본값 반환
    return {
      daily: [],
      weekly: [],
      monthly: [],
    };
  }
}

export async function exportStatsData(
  format: "csv" | "excel" | "json",
  dateRange: { from: Date; to: Date }
): Promise<string> {
  try {
    if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
      // 목업 응답 반환
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 지연 시간 추가
      return `통계_데이터_${format}_${new Date().toISOString().split("T")[0]}`;
    }

    const params = new URLSearchParams({
      format,
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/stats/export?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    // 파일 다운로드 처리
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `통계_데이터_${format}_${
      new Date().toISOString().split("T")[0]
    }.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return "성공적으로 내보냈습니다.";
  } catch (error) {
    console.error("통계 데이터 내보내기 실패:", error);
    toast({
      title: "오류",
      description: "통계 데이터를 내보내는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
    throw error;
  }
}
