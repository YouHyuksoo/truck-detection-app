export type RoiType = "rectangle" | "polygon"
export type DrawingMode = "none" | "select" | "rectangle" | "polygon" | "move"

export interface RoiPoint {
  x: number
  y: number
}

export interface RoiActions {
  detectTrucks: boolean
  performOcr: boolean
  sendToPLC: boolean
  triggerAlarm: boolean
}

export interface RoiData {
  id: string
  name: string
  type: RoiType
  points: RoiPoint[]
  color: string
  enabled: boolean
  actions: RoiActions
  minDetectionTime: number
  description: string
}
