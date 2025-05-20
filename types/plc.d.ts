// PLC 장치 유형
export type PLCType = "modbusTcp" | "modbusRtu" | "ethernetIp"; // 가능한 값 정의

// 연결 유형
export type ConnectionType = "tcp" | "udp" | "serial"; // "tcp" 포함

// 연결 상태
export type ConnectionStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "error"; // 가능한 값 정의

// PLC 장치 인터페이스
export interface PLCDevice {
  id: string;
  name: string;
  type: PLCType; // PLCType으로 타입 지정
  connectionType: ConnectionType; // ConnectionType으로 타입 지정
  ipAddress: string;
  port: number;
  timeout: number;
  status: ConnectionStatus; // ConnectionStatus로 타입 지정
  lastConnected?: Date; // 선택적 필드
}

// PLC 설정 인터페이스
export interface PLCSettings {
  device: PLCDevice;
  protocol: string;
  dataMappings: DataMapping[];
}

// 데이터 매핑 인터페이스
export interface DataMapping {
  id: string;
  name: string;
  plcAddress: string;
  dataType: "bit" | "byte" | "word" | "dword" | "int" | "real" | "string"; // 가능한 데이터 유형
  access: "read" | "write" | "read_write"; // 접근 유형
  description?: string; // 선택적 필드
}

// 통신 로그 인터페이스
export interface CommunicationLog {
  id: string;
  timestamp: Date;
  direction: "read" | "write";
  address: string;
  value: string;
  status: "success" | "error";
  responseTime?: number; // 선택적 필드
  errorMessage?: string; // 선택적 필드
}

// 통계 데이터 인터페이스
export interface PLCStatistics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageResponseTime: number;
  uptime: number; // 초 단위
  lastErrorMessage?: string; // 선택적 필드
  lastErrorTimestamp?: Date; // 선택적 필드
}
