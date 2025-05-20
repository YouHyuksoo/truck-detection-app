export interface OcrLogEntry {
  id: string
  timestamp: string
  recognizedNumber: string
  confidence: number
  roiName: string
  imageUrl: string
  processingTime: number
  status: "success" | "error"
  sentToPLC: boolean
  truckId: string | null
}

export interface OcrLogFilter {
  dateRange: {
    from: Date
    to: Date
  }
  numberQuery: string
  minConfidence: number
  roiFilter: string
  sortBy: string
  sortOrder: "asc" | "desc"
}
