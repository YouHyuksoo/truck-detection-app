import type { RoiData } from "@/types/roi";

// 기본 API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010/api";
const MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === "true";

// 목업 ROI 데이터
const mockRoiList: RoiData[] = [
  {
    id: "roi-1",
    name: "입구 영역",
    type: "polygon",
    points: [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 200 },
      { x: 100, y: 200 },
    ],
    color: "#ff0000",
    enabled: true,
    actions: {
      detectTrucks: true,
      performOcr: true,
      sendToPLC: true,
      triggerAlarm: false,
    },
    minDetectionTime: 2,
    description: "트럭이 입장하는 영역",
  },
  {
    id: "roi-2",
    name: "출구 영역",
    type: "rectangle",
    points: [
      { x: 400, y: 300 },
      { x: 600, y: 400 },
    ],
    color: "#00ff00",
    enabled: true,
    actions: {
      detectTrucks: true,
      performOcr: false,
      sendToPLC: true,
      triggerAlarm: false,
    },
    minDetectionTime: 1,
    description: "트럭이 퇴장하는 영역",
  },
];

/**
 * 모든 관심영역 목록을 가져옵니다.
 */
export async function getAllRois(): Promise<RoiData[]> {
  try {
    if (MOCK_API) {
      // 목업 데이터 반환 (개발 및 테스트용)
      console.log("Using mock ROI data");
      return new Promise((resolve) => {
        setTimeout(() => resolve([...mockRoiList]), 500);
      });
    }

    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/roi`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("관심영역 목록을 가져오는 중 오류 발생:", error);
    // 오류 발생 시 빈 배열 반환
    return [];
  }
}

/**
 * 특정 관심영역을 가져옵니다.
 */
export async function getRoi(id: string): Promise<RoiData | null> {
  try {
    if (MOCK_API) {
      // 목업 데이터에서 검색
      const roi = mockRoiList.find((r) => r.id === id);
      return new Promise((resolve) => {
        setTimeout(() => resolve(roi || null), 300);
      });
    }

    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/roi/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API 오류: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`관심영역(${id})을 가져오는 중 오류 발생:`, error);
    return null;
  }
}

/**
 * 새 관심영역을 생성합니다.
 */
export async function createRoi(roi: Omit<RoiData, "id">): Promise<RoiData> {
  try {
    if (MOCK_API) {
      // 목업 데이터에 추가
      const newRoi: RoiData = {
        ...roi,
        id: `roi-${Date.now()}`,
      };
      mockRoiList.push(newRoi);
      return new Promise((resolve) => {
        setTimeout(() => resolve(newRoi), 500);
      });
    }

    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/roi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roi),
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("관심영역을 생성하는 중 오류 발생:", error);
    // 오류 발생 시 기본 ROI 반환
    return {
      ...roi,
      id: `error-${Date.now()}`,
    };
  }
}

/**
 * 기존 관심영역을 업데이트합니다.
 */
export async function updateRoi(roi: RoiData): Promise<RoiData> {
  try {
    if (MOCK_API) {
      // 목업 데이터 업데이트
      const index = mockRoiList.findIndex((r) => r.id === roi.id);
      if (index >= 0) {
        mockRoiList[index] = roi;
      }
      return new Promise((resolve) => {
        setTimeout(() => resolve(roi), 500);
      });
    }

    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/roi/${roi.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roi),
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`관심영역(${roi.id})을 업데이트하는 중 오류 발생:`, error);
    // 오류 발생 시 원래 ROI 반환
    return roi;
  }
}

/**
 * 관심영역을 삭제합니다.
 */
export async function deleteRoi(id: string): Promise<boolean> {
  try {
    if (MOCK_API) {
      // 목업 데이터에서 삭제
      const index = mockRoiList.findIndex((r) => r.id === id);
      if (index >= 0) {
        mockRoiList.splice(index, 1);
      }
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 500);
      });
    }

    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/roi/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`관심영역(${id})을 삭제하는 중 오류 발생:`, error);
    return false;
  }
}

/**
 * 관심영역 설정을 내보냅니다.
 */
export async function exportRoiConfig(): Promise<string> {
  try {
    if (MOCK_API) {
      // 목업 데이터 내보내기
      return new Promise((resolve) => {
        setTimeout(() => resolve(JSON.stringify(mockRoiList, null, 2)), 500);
      });
    }

    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/roi/export`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error("관심영역 설정을 내보내는 중 오류 발생:", error);
    return JSON.stringify([]);
  }
}

/**
 * 관심영역 설정을 가져옵니다.
 */
export async function importRoiConfig(config: string): Promise<boolean> {
  try {
    if (MOCK_API) {
      // 목업 데이터 가져오기
      const importedRois = JSON.parse(config) as RoiData[];
      mockRoiList.length = 0; // 기존 데이터 삭제
      mockRoiList.push(...importedRois);
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 500);
      });
    }

    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/roi/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: config,
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("관심영역 설정을 가져오는 중 오류 발생:", error);
    return false;
  }
}

/**
 * 테스트 이미지를 가져옵니다.
 */
export async function getTestImage(): Promise<string> {
  try {
    if (MOCK_API) {
      // 목업 이미지 URL 반환
      return new Promise((resolve) => {
        setTimeout(() => resolve("/truck-detection-1.png"), 300);
      });
    }

    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/roi/test-image`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("테스트 이미지를 가져오는 중 오류 발생:", error);
    return "/placeholder.svg?height=480&width=640";
  }
}

/**
 * 관심영역 테스트를 시작합니다.
 */
export async function startRoiTest(): Promise<boolean> {
  try {
    if (MOCK_API) {
      // 목업 테스트 시작
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 300);
      });
    }

    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/roi/test/start`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("관심영역 테스트를 시작하는 중 오류 발생:", error);
    return false;
  }
}

/**
 * 관심영역 테스트를 중지합니다.
 */
export async function stopRoiTest(): Promise<boolean> {
  try {
    if (MOCK_API) {
      // 목업 테스트 중지
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 300);
      });
    }

    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/roi/test/stop`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("관심영역 테스트를 중지하는 중 오류 발생:", error);
    return false;
  }
}
