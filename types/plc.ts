export interface PLCDevice {
  id: string;
  name: string;
  type: PLCType;
  connectionType: ConnectionType;
  ipAddress?: string;
  port?: number;
  comPort?: string;
  baudRate?: number;
  timeout: number;
  status: ConnectionStatus;
  lastConnected?: Date;
}

export interface DataMapping {
  id: string;
  name: string;
  plcAddress: string;
  dataType: DataType;
  access: AccessType;
  description: string;
  scaleFactor?: number;
  offset?: number;
  unit?: string;
}

export interface CommunicationLog {
  id: string;
  timestamp: Date;
  direction: "read" | "write";
  address: string;
  value: string;
  status: "success" | "error";
  responseTime?: number;
  errorMessage?: string;
}

export enum PLCType {
  SIEMENS = "siemens",
  ALLEN_BRADLEY = "allen_bradley",
  MITSUBISHI = "mitsubishi",
  OMRON = "omron",
  SCHNEIDER = "schneider",
  DELTA = "delta",
  OTHER = "other",
}

export enum ConnectionType {
  ETHERNET = "ethernet",
  SERIAL = "serial",
  USB = "usb",
}

export enum ProtocolType {
  MODBUS_TCP = "modbus_tcp",
  MODBUS_RTU = "modbus_rtu",
  ETHERNET_IP = "ethernet_ip",
  PROFINET = "profinet",
  S7 = "s7",
  MC_PROTOCOL = "mc_protocol",
  FINS = "fins",
  OTHER = "other",
}

export enum DataType {
  BIT = "bit",
  BYTE = "byte",
  WORD = "word",
  DWORD = "dword",
  INT = "int",
  REAL = "real",
  STRING = "string",
}

export enum AccessType {
  READ = "read",
  WRITE = "write",
  READ_WRITE = "read_write",
}

export enum ConnectionStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  ERROR = "error",
}

export interface PLCSettings {
  device: PLCDevice;
  protocol: ProtocolType;
  dataMappings: DataMapping[];
  autoConnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export interface ConnectionSettingsProps {
  device: PLCDevice;
  onUpdate: (device: PLCDevice) => Promise<void>;
  onConnect: (deviceId: string) => Promise<void>;
  onDisconnect: (deviceId: string) => Promise<void>;
}

export interface PLCStatistics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageResponseTime: number;
  uptime: number;
  lastErrorMessage?: string;
  lastErrorTimestamp?: Date;
}
