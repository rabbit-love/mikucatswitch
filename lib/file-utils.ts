import type { VideoData, VideoCollectionConfig, FolderValidation } from "./types"

// Supported video formats for web browsers
const SUPPORTED_VIDEO_FORMATS = /\.(mp4|webm)$/i
const SUPPORTED_VIDEO_MIMES = ["video/mp4", "video/webm"]

export async function validateFolderStructure(folderHandle: FileSystemDirectoryHandle): Promise<FolderValidation> {
  try {
    let hasValidSubfolder = false

    for await (const [name, handle] of folderHandle.entries()) {
      if (handle.kind === "directory") {
        // Check if this subfolder has the required files
        let hasConfig = false
        let hasThumbnail = false
        let hasVideos = false

        for await (const [subName, subHandle] of handle.entries()) {
          if (subHandle.kind === "file") {
            if (subName === "config.json") hasConfig = true
            if (subName.match(/^thumbnail\.(png|jpg|jpeg|webp)$/i)) hasThumbnail = true
            if (subName.match(SUPPORTED_VIDEO_FORMATS)) hasVideos = true
          }
        }

        if (hasConfig && hasThumbnail && hasVideos) {
          hasValidSubfolder = true
          break
        }
      }
    }

    if (!hasValidSubfolder) {
      return {
        isValid: false,
        error:
          "No valid video folders found. Each folder must contain config.json, thumbnail image, and video files in MP4 or WebM format.",
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: "Failed to validate folder structure",
    }
  }
}

export async function loadVideoData(folderHandle: FileSystemDirectoryHandle): Promise<VideoData[]> {
  const videoData: VideoData[] = []

  for await (const [name, handle] of folderHandle.entries()) {
    if (handle.kind === "directory") {
      try {
        const data = await loadSingleVideoData(handle, name)
        if (data) {
          videoData.push(data)
        }
      } catch (error) {
        console.warn(`Failed to load video data for ${name}:`, error)
      }
    }
  }

  return videoData
}

async function isVideoSupported(file: File): Promise<boolean> {
  // Check MIME type first
  if (SUPPORTED_VIDEO_MIMES.includes(file.type)) {
    return true
  }

  // If MIME type is not set or generic, check by extension
  return SUPPORTED_VIDEO_FORMATS.test(file.name)
}

async function loadSingleVideoData(
  folderHandle: FileSystemDirectoryHandle,
  folderId: string,
): Promise<VideoData | null> {
  let configFile: FileSystemFileHandle | null = null
  let thumbnailFile: FileSystemFileHandle | null = null
  const videoFiles: FileSystemFileHandle[] = []

  // Collect files
  for await (const [name, handle] of folderHandle.entries()) {
    if (handle.kind === "file") {
      if (name === "config.json") {
        configFile = handle
      } else if (name.match(/^thumbnail\.(png|jpg|jpeg|webp)$/i)) {
        thumbnailFile = handle
      } else if (name.match(SUPPORTED_VIDEO_FORMATS)) {
        videoFiles.push(handle)
      }
    }
  }

  if (!configFile || !thumbnailFile || videoFiles.length === 0) {
    console.warn(`Incomplete folder structure for ${folderId}`)
    return null
  }

  try {
    // Read config
    const configFileObj = await configFile.getFile()
    const configText = await configFileObj.text()
    const config: VideoCollectionConfig = JSON.parse(configText)

    // Create URLs for files
    const thumbnailFileObj = await thumbnailFile.getFile()
    const thumbnailUrl = URL.createObjectURL(thumbnailFileObj)

    // Get preview video (first supported video file)
    let previewUrl = ""
    for (const videoFile of videoFiles) {
      try {
        const fileObj = await videoFile.getFile()
        if (await isVideoSupported(fileObj)) {
          previewUrl = URL.createObjectURL(fileObj)
          break
        }
      } catch (error) {
        console.warn(`Failed to load preview video ${videoFile.name}:`, error)
      }
    }

    // Create URLs for all videos - only include supported formats
    const videos = []
    for (const videoConfig of config.videos) {
      // Try to find the exact file first
      let videoFile = videoFiles.find((f) => f.name === videoConfig.filename)

      // If not found, try to find a supported alternative
      if (!videoFile) {
        const baseName = videoConfig.filename.replace(/\.[^/.]+$/, "") // Remove extension
        videoFile = videoFiles.find((f) => f.name.startsWith(baseName))
      }

      if (videoFile) {
        try {
          const fileObj = await videoFile.getFile()
          if (await isVideoSupported(fileObj)) {
            videos.push({
              ...videoConfig,
              url: URL.createObjectURL(fileObj),
              actualFilename: videoFile.name, // Store the actual filename used
            })
          } else {
            console.warn(`Unsupported video format: ${videoConfig.filename} - Skipping`)
          }
        } catch (error) {
          console.warn(`Failed to load video ${videoConfig.filename}:`, error)
        }
      } else {
        console.warn(`Video file not found: ${videoConfig.filename}`)
      }
    }

    // Only return if we have at least one valid video
    if (videos.length === 0) {
      console.warn(`No supported videos found for ${folderId}. Please convert videos to MP4 or WebM format.`)
      return null
    }

    return {
      id: folderId,
      title: config.title || folderId.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      thumbnailUrl,
      previewUrl,
      config,
      videos,
      folderHandle,
    }
  } catch (error) {
    console.error(`Failed to process folder ${folderId}:`, error)
    return null
  }
}
