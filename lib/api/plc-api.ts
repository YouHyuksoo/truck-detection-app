import type {
  PLCDevice,
  PLCSettings,
  DataMapping,
  CommunicationLog,
  PLCStatistics,
} from "@/types/plc";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010/api";
const PLC_ENDPOINT = `${API_BASE_URL}/plc`;

// 공통 API 호출 함수
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.statusText}`);
  }
  return response.json();
}

// PLC 설정 가져오기
export async function getPLCSettings(): Promise<PLCSettings> {
  return apiRequest<PLCSettings>(`${PLC_ENDPOINT}/settings`);
}

// PLC 장치 정보 업데이트
export async function updatePLCDevice(device: PLCDevice): Promise<PLCDevice> {
  return apiRequest<PLCDevice>(`${PLC_ENDPOINT}/device`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(device),
  });
}

// PLC 연결 시도
export async function connectPLC(deviceId: string): Promise<PLCDevice> {
  return apiRequest<PLCDevice>(`${PLC_ENDPOINT}/connect/${deviceId}`, {
    method: "POST",
  });
}

// PLC 연결 해제
export async function disconnectPLC(deviceId: string): Promise<PLCDevice> {
  return apiRequest<PLCDevice>(`${PLC_ENDPOINT}/disconnect/${deviceId}`, {
    method: "POST",
  });
}

// 프로토콜 설정 업데이트
export async function updateProtocol(protocol: string): Promise<string> {
  return apiRequest<{ protocol: string }>(`${PLC_ENDPOINT}/protocol`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ protocol }),
  }).then((data) => data.protocol);
}

// 데이터 매핑 가져오기
export async function getDataMappings(): Promise<DataMapping[]> {
  return apiRequest<DataMapping[]>(`${PLC_ENDPOINT}/mappings`);
}

// 데이터 매핑 추가
export async function addDataMapping(
  mapping: DataMapping
): Promise<DataMapping> {
  return apiRequest<DataMapping>(`${PLC_ENDPOINT}/mappings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapping),
  });
}

// 데이터 매핑 업데이트
export async function updateDataMapping(
  mapping: DataMapping
): Promise<DataMapping> {
  return apiRequest<DataMapping>(`${PLC_ENDPOINT}/mappings/${mapping.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapping),
  });
}

// 데이터 매핑 삭제
export async function deleteDataMapping(id: string): Promise<void> {
  await apiRequest<void>(`${PLC_ENDPOINT}/mappings/${id}`, {
    method: "DELETE",
  });
}

// PLC 데이터 읽기
export async function readPLCData(
  address: string,
  dataType: string
): Promise<string> {
  return apiRequest<{ value: string }>(`${PLC_ENDPOINT}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, dataType }),
  }).then((data) => data.value);
}

// PLC 데이터 쓰기
export async function writePLCData(
  address: string,
  value: string,
  dataType: string
): Promise<void> {
  await apiRequest<void>(`${PLC_ENDPOINT}/write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, value, dataType }),
  });
}

// 통신 로그 가져오기
export async function getCommunicationLogs(): Promise<CommunicationLog[]> {
  return apiRequest<CommunicationLog[]>(`${PLC_ENDPOINT}/logs`);
}

// 통계 데이터 가져오기
export async function getPLCStatistics(): Promise<PLCStatistics> {
  return apiRequest<PLCStatistics>(`${PLC_ENDPOINT}/statistics`);
}

// PLC API 훅
export function usePLCApi() {
  return {
    getPLCSettings,
    updatePLCDevice,
    connectPLC,
    disconnectPLC,
    updateProtocol,
    getDataMappings,
    addDataMapping,
    updateDataMapping,
    deleteDataMapping,
    readPLCData,
    writePLCData,
    getCommunicationLogs,
    getPLCStatistics,
  };
}
