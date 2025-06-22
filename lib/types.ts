export interface VideoConfig {
  filename: string
  name: string
  url?: string
  actualFilename?: string
}

export interface VideoCollectionConfig {
  version: number
  title?: string
  videos: VideoConfig[]
}

export interface VideoData {
  id: string
  title: string
  thumbnailUrl: string
  previewUrl: string
  config: VideoCollectionConfig
  videos: VideoConfig[]
  folderHandle: FileSystemDirectoryHandle
}

export interface FolderValidation {
  isValid: boolean
  error?: string
}
