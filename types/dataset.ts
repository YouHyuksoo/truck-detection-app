export interface Dataset {
  id: string
  name: string
  description: string
  imageCount: number
  annotatedCount: number
  createdAt: string
  updatedAt: string
  tags: string[]
  status: "active" | "archived" | "processing"
}

export interface Image {
  id: string
  datasetId: string
  filename: string
  url: string
  width: number
  height: number
  annotated: boolean
  annotations: Annotation[]
  createdAt: string
  tags: string[]
}

export interface Annotation {
  id: string
  imageId: string
  label: string
  bbox: [number, number, number, number] // [x, y, width, height]
  confidence: number
  createdAt: string
  updatedBy: string
}

export interface AugmentationOption {
  id: string
  name: string
  description: string
  type: "flip" | "rotate" | "crop" | "brightness" | "contrast" | "noise" | "blur"
  params: Record<string, any>
}

export interface AugmentationConfig {
  rotate: boolean
  flipHorizontal: boolean
  flipVertical: boolean
  brightness: boolean
  contrast: boolean
  noise: boolean
  blur: boolean
  scale: boolean
  crop: boolean
}
