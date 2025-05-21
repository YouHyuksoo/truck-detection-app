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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010";
const STATS_ENDPOINT = `${API_BASE_URL}/api/detection/stats`;

// API 함수 구현
export async function getStatsOverview(): Promise<StatsOverview> {
  try {
    const params = new URLSearchParams({
      from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to_date: new Date().toISOString(),
    });

    const response = await fetch(`${STATS_ENDPOINT}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    const data = await response.json();
    return {
      totalDetections: data.totalDetections,
      detectionSuccessRate: (data.successfulOcr / data.totalDetections) * 100,
      ocrRecognitionRate: data.averageConfidence,
      averageProcessingTime: 1000 / data.processingFps,
      previousMonthComparison: {
        totalDetections: 0,
        detectionSuccessRate: 0,
        ocrRecognitionRate: 0,
        averageProcessingTime: 0,
      },
    };
  } catch (error) {
    console.error("통계 개요 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description: "통계 개요 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
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
    const params = new URLSearchParams({
      from_date: dateRange.from.toISOString(),
      to_date: dateRange.to.toISOString(),
    });

    const response = await fetch(`${STATS_ENDPOINT}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("감지 통계 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description: "감지 통계 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
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
    const params = new URLSearchParams({
      from_date: dateRange.from.toISOString(),
      to_date: dateRange.to.toISOString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/stats/ocr?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("OCR 통계 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description: "OCR 통계 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
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
    const params = new URLSearchParams({
      from_date: dateRange.from.toISOString(),
      to_date: dateRange.to.toISOString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/stats/processing-time?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("처리 시간 통계 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description: "처리 시간 통계 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
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
    const response = await fetch(`${API_BASE_URL}/api/settings/system/info`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    const data = await response.json();

    const currentUsage = {
      cpu: data.cpuUsage,
      memory: (data.memoryUsage.used / data.memoryUsage.total) * 100,
      disk: (data.diskUsage.used / data.diskUsage.total) * 100,
    };

    const performanceMetrics = {
      averageCpu: data.cpuUsage,
      averageMemory: (data.memoryUsage.used / data.memoryUsage.total) * 100,
      networkBandwidth: 0,
      gpu: data.gpuUsage,
      diskIo: 0,
    };

    return {
      cpuUsage: [],
      memoryUsage: [],
      diskUsage: [
        { name: "시스템", value: 25 },
        { name: "로그", value: 15 },
        { name: "이미지", value: 45 },
        { name: "기타", value: 15 },
      ],
      currentUsage,
      performanceMetrics,
    };
  } catch (error) {
    console.error("리소스 사용량 통계 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description:
        "리소스 사용량 통계 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
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
    const params = new URLSearchParams({
      from_date: dateRange.from.toISOString(),
      to_date: dateRange.to.toISOString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/detection/stats?${params}`
    );
    if (!response.ok) {
      console.error(`API 오류: ${response.status}`, await response.text());
      throw new Error(`API 오류: ${response.status}`);
    }
    const data = await response.json();

    return {
      daily: data.detectionByTime.map((stat: any) => ({
        date: stat.date,
        count: stat.count,
        success: stat.success,
        rate: (stat.success / stat.count) * 100,
      })),
      weekly: [],
      monthly: [],
    };
  } catch (error) {
    console.error("시간별 통계 데이터 가져오기 실패:", error);
    toast({
      title: "오류",
      description: "시간별 통계 데이터를 가져오는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
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
    const params = new URLSearchParams({
      format,
      from_date: dateRange.from.toISOString(),
      to_date: dateRange.to.toISOString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/stats/export?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

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
