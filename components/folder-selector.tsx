"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Folder, Upload, AlertCircle, Info, ExternalLink, Play, Heart, Sparkles } from "lucide-react"
import type { VideoData } from "@/lib/types"
import { validateFolderStructure, loadVideoData } from "@/lib/file-utils"
import { storage } from "@/lib/storage"

interface FolderSelectorProps {
  onFolderSelected: (folder: FileSystemDirectoryHandle, videos: VideoData[]) => void
}

export function FolderSelector({ onFolderSelected }: FolderSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedFolderInfo, setSavedFolderInfo] = useState<{ name: string; timestamp: number } | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check for previously selected folder
    const savedInfo = storage.getItem("mikucat-folder-info")
    if (savedInfo) {
      try {
        const folderInfo = JSON.parse(savedInfo)
        const timeDiff = Date.now() - folderInfo.timestamp
        // Show info if folder was selected within last 7 days
        if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
          setSavedFolderInfo(folderInfo)
        } else {
          // Clean up old data
          storage.removeItem("mikucat-folder-info")
          storage.removeItem("mikucat-folder")
          storage.removeItem("mikucat-folder-timestamp")
        }
      } catch (error) {
        console.log("Error parsing saved folder info:", error)
      }
    }
  }, [])

  const handleSelectFolder = async () => {
    if (typeof window === "undefined") {
      throw new Error("File System Access API is only available in browsers")
    }

    try {
      setIsLoading(true)
      setError(null)
      setSavedFolderInfo(null)

      // Check if File System Access API is supported
      if (!("showDirectoryPicker" in window)) {
        throw new Error(
          "File System Access API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.",
        )
      }

      const folderHandle = await (window as any).showDirectoryPicker()

      // Validate folder structure
      const validation = await validateFolderStructure(folderHandle)
      if (!validation.isValid) {
        throw new Error(validation.error || "Invalid folder structure")
      }

      // Load video data
      const videoData = await loadVideoData(folderHandle)

      if (videoData.length === 0) {
        throw new Error("No valid videos found. Please ensure your videos are in MP4 or WebM format.")
      }

      onFolderSelected(folderHandle, videoData)
    } catch (err: any) {
      if (err.name === "AbortError") {
        // User cancelled the dialog
        return
      }
      setError(err.message || "Failed to load folder")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="animate-float">
          <h2 className="text-6xl font-comfortaa gradient-text font-bold mb-4">mikucatswitch</h2>
          <p className="text-xl font-nunito text-muted-foreground mb-2 font-semibold">Interactive Video Experience</p>
          <p className="text-lg font-poppins text-muted-foreground/80">
            By <span className="text-red-500 font-semibold">_mikucat_</span>
          </p>
        </div>

        {/* Social Links - At the top */}
        <div className="flex justify-center gap-4 mt-6">
          <a
            href="https://x.com/_mikucat_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 hover:from-red-500/20 hover:to-pink-500/20 hover:border-red-500/40 transition-all duration-200 text-sm font-poppins font-medium"
          >
            <span className="text-lg">𝕏</span>
            <span>Twitter</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <a
            href="https://www.patreon.com/c/_mikucat_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 hover:from-red-500/20 hover:to-pink-500/20 hover:border-red-500/40 transition-all duration-200 text-sm font-poppins font-medium"
          >
            <span className="text-lg">🎨</span>
            <span>Patreon</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <a
            href="https://www.iwara.tv/profile/_mikucat_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 hover:from-red-500/20 hover:to-pink-500/20 hover:border-red-500/40 transition-all duration-200 text-sm font-poppins font-medium"
          >
            <span className="text-lg">🎬</span>
            <span>Iwara</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Main Folder Selection - More Prominent */}
      <Card className="border-red-500/30 shadow-2xl shadow-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center animate-float">
            <Folder className="w-10 h-10 text-red-500" />
          </div>
          <CardTitle className="font-nunito font-bold text-2xl mb-2">Select Your Content Folder</CardTitle>
          <CardDescription className="font-poppins text-lg">
            Choose the folder containing your video collections to begin your interactive experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleSelectFolder}
            disabled={isLoading}
            className="w-full gradient-bg-primary hover:from-red-600 hover:to-pink-600 text-white font-nunito font-semibold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                Loading your content...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-3" />
                Choose Folder
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="border-red-500/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-poppins">{error}</AlertDescription>
            </Alert>
          )}

          {savedFolderInfo && (
            <Alert className="border-green-500/30 bg-green-500/10">
              <Info className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-300 font-poppins">
                <strong>Welcome back!</strong> "{savedFolderInfo.name}" was your last selected folder. Click "Choose
                Folder" to continue or select a different one.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Demo Videos Section - Without cards, just videos */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Video placeholders - ready to be replaced with real videos */}
        <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
          <div className="aspect-video bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl overflow-hidden relative border border-red-500/20 hover:border-red-500/40 hover:glow-red transition-all duration-300">
            {/* This will be replaced with actual video */}
            <video
              className="w-full h-full object-cover opacity-0"
              muted
              loop
              playsInline
              poster="/placeholder.svg?height=200&width=300"
            >
              {/* Video source will be added here */}
            </video>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <p className="font-nunito font-semibold text-lg text-red-500">How to Use</p>
                <p className="font-poppins text-sm text-muted-foreground">Quick setup guide</p>
              </div>
            </div>
          </div>
        </div>

        <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
          <div className="aspect-video bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl overflow-hidden relative border border-red-500/20 hover:border-red-500/40 hover:glow-red transition-all duration-300">
            {/* This will be replaced with actual video */}
            <video
              className="w-full h-full object-cover opacity-0"
              muted
              loop
              playsInline
              poster="/placeholder.svg?height=200&width=300"
            >
              {/* Video source will be added here */}
            </video>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <p className="font-nunito font-semibold text-lg text-red-500">Features Demo</p>
                <p className="font-poppins text-sm text-muted-foreground">Interactive showcase</p>
              </div>
            </div>
          </div>
        </div>

        <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
          <div className="aspect-video bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl overflow-hidden relative border border-red-500/20 hover:border-red-500/40 hover:glow-red transition-all duration-300">
            {/* This will be replaced with actual video */}
            <video
              className="w-full h-full object-cover opacity-0"
              muted
              loop
              playsInline
              poster="/placeholder.svg?height=200&width=300"
            >
              {/* Video source will be added here */}
            </video>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Heart className="w-16 h-16 text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <p className="font-nunito font-semibold text-lg text-red-500">Examples</p>
                <p className="font-poppins text-sm text-muted-foreground">Real usage scenarios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Info - Collapsed */}
      <details className="max-w-2xl mx-auto">
        <summary className="cursor-pointer font-nunito font-semibold text-center text-muted-foreground hover:text-foreground transition-colors">
          Technical Details & Config Structure
        </summary>
        <div className="mt-4 space-y-4">
          <Alert className="border-red-500/20 bg-red-500/5">
            <Info className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300 font-poppins">
              <strong>Simple Structure:</strong> Each video only needs a name and filename. Use descriptive names like
              "Ropa normal + Arriba".
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-nunito font-semibold">Expected config.json structure:</p>
            <div className="bg-muted/50 p-3 rounded-md font-mono text-xs">
              <div>{`{`}</div>
              <div className="ml-2">{`"version": 1,`}</div>
              <div className="ml-2">{`"videos": [`}</div>
              <div className="ml-4">{`{"filename": "video1.mp4", "name": "Ropa normal + Arriba"},`}</div>
              <div className="ml-4">{`{"filename": "video2.mp4", "name": "Ropa normal + Abajo"},`}</div>
              <div className="ml-4">{`{"filename": "video3.mp4", "name": "Bikini + Frente"}`}</div>
              <div className="ml-2">{`]`}</div>
              <div>{`}`}</div>
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}
