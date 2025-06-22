"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { VideoData } from "@/lib/types"
import { Play, Settings, Grid3X3 } from "lucide-react"

interface VideoGridProps {
  videos: VideoData[]
  onVideoSelect: (video: VideoData) => void
  onChangeFolderRequest: () => void
}

export function VideoGrid({ videos, onVideoSelect, onChangeFolderRequest }: VideoGridProps) {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({})

  const handleMouseEnter = (videoId: string) => {
    setHoveredVideo(videoId)
    const videoElement = videoRefs.current[videoId]
    if (videoElement && videoElement.src) {
      videoElement.currentTime = 0
      videoElement.muted = true
      videoElement.volume = 0

      // Add error handling
      videoElement.onerror = (e) => {
        console.error(`Error loading preview video for ${videoId}:`, e)
      }

      videoElement.play().catch((error) => {
        console.error(`Failed to play preview video for ${videoId}:`, error)
      })
    }
  }

  const handleMouseLeave = (videoId: string) => {
    setHoveredVideo(null)
    const videoElement = videoRefs.current[videoId]
    if (videoElement) {
      videoElement.pause()
      videoElement.currentTime = 0
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Grid3X3 className="w-6 h-6 text-red-500" />
          <div>
            <h2 className="text-3xl font-nunito font-bold">Video Collection</h2>
            <p className="text-muted-foreground font-poppins">{videos.length} videos available</p>
          </div>
        </div>
        <Button variant="outline" onClick={onChangeFolderRequest} className="border-red-500/20 hover:bg-red-500/10">
          <Settings className="w-4 h-4 mr-2" />
          Change Folder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 border-red-500/10 hover:border-red-500/30"
            onClick={() => onVideoSelect(video)}
            onMouseEnter={() => handleMouseEnter(video.id)}
            onMouseLeave={() => handleMouseLeave(video.id)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                {/* Thumbnail - always visible */}
                <img
                  src={video.thumbnailUrl || "/placeholder.svg?height=200&width=300"}
                  alt={video.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    hoveredVideo === video.id ? "opacity-0" : "opacity-100"
                  }`}
                />

                {/* Video preview - only visible on hover */}
                {video.previewUrl && (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[video.id] = el
                    }}
                    src={video.previewUrl}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      hoveredVideo === video.id ? "opacity-100" : "opacity-0"
                    }`}
                    onError={(e) => {
                      console.error(`Preview video error for ${video.id}:`, e)
                    }}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-red-500/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-nunito font-semibold text-lg mb-1 line-clamp-1">{video.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-poppins">
                  <span>{video.videos.length} videos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
