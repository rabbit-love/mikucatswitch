"use client"

import { useState, useEffect } from "react"
import { FolderSelector } from "@/components/folder-selector"
import { VideoGrid } from "@/components/video-grid"
import { VideoPlayer } from "@/components/video-player"
import { ThemeToggle } from "@/components/theme-toggle"
import type { VideoData } from "@/lib/types"
import { Heart } from "lucide-react"

export default function App() {
  const [selectedFolder, setSelectedFolder] = useState<FileSystemDirectoryHandle | null>(null)
  const [videoData, setVideoData] = useState<VideoData[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Try to restore previously selected folder
    const restorePreviousFolder = async () => {
      try {
        const savedFolderName = localStorage.getItem("mikucat-folder")
        if (!savedFolderName) return

        // Check if File System Access API is supported
        if (!("showDirectoryPicker" in window)) return

        // Try to get permission for the previously selected folder
        const opfsRoot = await navigator.storage.getDirectory()
        const folderHandleKey = `folder-handle-${savedFolderName}`

        try {
          // Try to get the stored folder handle
          const storedHandle = await opfsRoot.getFileHandle(folderHandleKey)
          if (storedHandle) {
            // We have a reference, but we need to ask user to reselect for security
            console.log("Previously selected folder:", savedFolderName)
            // Show a message to user that they can reselect their folder
          }
        } catch (error) {
          // No stored handle, that's fine
        }
      } catch (error) {
        console.log("Could not restore previous folder:", error)
      }
    }

    restorePreviousFolder()
  }, [])

  const handleVideoSelect = (video: VideoData) => {
    setSelectedVideo(video)
  }

  const handleFolderPersistence = async (folder: FileSystemDirectoryHandle) => {
    try {
      // Store folder name and try to maintain reference
      localStorage.setItem("mikucat-folder", folder.name)
      localStorage.setItem("mikucat-folder-timestamp", Date.now().toString())

      // Try to store a reference (this might not work in all browsers)
      try {
        const opfsRoot = await navigator.storage.getDirectory()
        const folderHandleKey = `folder-handle-${folder.name}`
        // This is a workaround - we'll store the folder info
        const folderInfo = {
          name: folder.name,
          timestamp: Date.now(),
        }
        localStorage.setItem("mikucat-folder-info", JSON.stringify(folderInfo))
      } catch (error) {
        console.log("Could not store folder reference:", error)
      }
    } catch (error) {
      console.log("Error persisting folder:", error)
    }
  }

  const handleFolderSelected = async (folder: FileSystemDirectoryHandle, videos: VideoData[]) => {
    setSelectedFolder(folder)
    setVideoData(videos)
    await handleFolderPersistence(folder)
  }

  const handleBackToGrid = () => {
    setSelectedVideo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-500/5">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center animate-heart-pulse">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-comfortaa gradient-text font-bold">mikucatswitch</h1>
              <p className="text-xs text-muted-foreground font-nunito font-medium tracking-wide">By _mikucat_</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!selectedFolder ? (
          <FolderSelector onFolderSelected={handleFolderSelected} />
        ) : selectedVideo ? (
          <VideoPlayer video={selectedVideo} onBack={handleBackToGrid} />
        ) : (
          <VideoGrid
            videos={videoData}
            onVideoSelect={handleVideoSelect}
            onChangeFolderRequest={() => setSelectedFolder(null)}
          />
        )}
      </main>
    </div>
  )
}
