"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { VideoData } from "@/lib/types"
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, X, Grid3X3, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface VideoPlayerProps {
  video: VideoData
  onBack: () => void
}

const PLAYBACK_SPEEDS = [
  { value: 0.25, label: "0.25x" },
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 1.75, label: "1.75x" },
  { value: 2, label: "2x" },
]

export function VideoPlayer({ video, onBack }: VideoPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showVideoSelector, setShowVideoSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const selectorTimeoutRef = useRef<NodeJS.Timeout>()

  const currentVideo = video.videos[currentVideoIndex]
  const currentVideoUrl = currentVideo?.url || ""

  // Filter videos based on search term
  const filteredVideos = video.videos.filter((v) => v.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleVideoChange = async (newIndex: number) => {
    if (!videoRef.current || newIndex === currentVideoIndex) return

    const savedTime = videoRef.current.currentTime
    const savedVolume = videoRef.current.volume
    const savedMuted = videoRef.current.muted
    const savedSpeed = videoRef.current.playbackRate
    const wasPlaying = !videoRef.current.paused

    setIsTransitioning(true)
    setCurrentVideoIndex(newIndex)

    // Wait for state update and video load
    setTimeout(() => {
      if (videoRef.current) {
        const newUrl = video.videos[newIndex]?.url
        if (newUrl) {
          videoRef.current.src = newUrl
          videoRef.current.load()

          const handleLoadedData = () => {
            if (videoRef.current) {
              // Restore all previous settings
              videoRef.current.currentTime = savedTime
              videoRef.current.volume = savedVolume
              videoRef.current.muted = savedMuted
              videoRef.current.playbackRate = savedSpeed

              // Continue playing if it was playing before
              if (wasPlaying) {
                videoRef.current.play().catch(console.error)
              }
            }
            setIsTransitioning(false)
            videoRef.current?.removeEventListener("loadeddata", handleLoadedData)
          }

          videoRef.current.addEventListener("loadeddata", handleLoadedData)
        }
      }
    }, 50)
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current.play().catch(console.error)
    } else {
      videoRef.current.pause()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return

    const newVolume = value[0]
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleSpeedChange = (speedStr: string) => {
    if (!videoRef.current) return

    const speed = Number.parseFloat(speedStr)
    videoRef.current.playbackRate = speed
    setPlaybackSpeed(speed)
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return

    const newTime = value[0]
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 600) // Reduced from 3000ms to 600ms
  }

  const handleVideoSelectorHover = (show: boolean) => {
    if (selectorTimeoutRef.current) {
      clearTimeout(selectorTimeoutRef.current)
    }

    if (show) {
      setShowVideoSelector(true)
    } else {
      selectorTimeoutRef.current = setTimeout(() => {
        setShowVideoSelector(false)
      }, 300)
    }
  }

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleDurationChange = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }
    const handleRateChange = () => setPlaybackSpeed(video.playbackRate)
    const handleError = (e: Event) => {
      console.error("Video error:", e)
      setIsTransitioning(false)
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("durationchange", handleDurationChange)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("volumechange", handleVolumeChange)
    video.addEventListener("ratechange", handleRateChange)
    video.addEventListener("error", handleError)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("durationchange", handleDurationChange)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("volumechange", handleVolumeChange)
      video.removeEventListener("ratechange", handleRateChange)
      video.removeEventListener("error", handleError)
    }
  }, [currentVideoUrl])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`${isFullscreen ? "fixed inset-0 z-50 bg-black" : "space-y-4"}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !isFullscreen && setShowControls(true)}
    >
      {!isFullscreen && (
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="border-pink-500/20 hover:bg-pink-500/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Grid
          </Button>
          <div>
            <h1 className="text-2xl font-poppins font-bold">{video.title}</h1>
            <p className="text-muted-foreground font-inter font-medium">Interactive Experience</p>
          </div>
        </div>
      )}

      <div className={`${isFullscreen ? "h-full flex" : "flex gap-4"}`}>
        {/* Video Player - Takes most of the space */}
        <div className={`${isFullscreen ? "flex-1" : "flex-1"}`}>
          <Card className={`overflow-hidden border-pink-500/20 ${isFullscreen ? "h-full border-0 rounded-none" : ""}`}>
            <CardContent className="p-0 relative h-full">
              <div className={`relative bg-black ${isFullscreen ? "h-full" : "aspect-video"}`}>
                {currentVideoUrl ? (
                  <video
                    ref={videoRef}
                    src={currentVideoUrl}
                    className={`w-full h-full object-contain transition-opacity duration-200 ${
                      isTransitioning ? "opacity-80" : "opacity-100"
                    }`}
                    onClick={togglePlayPause}
                    preload="metadata"
                    onError={(e) => {
                      console.error("Video playback error:", e)
                      setIsTransitioning(false)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                    <div className="text-center">
                      <p className="text-lg mb-2">No video available</p>
                    </div>
                  </div>
                )}

                {/* Minimal Progress Bar - Always Visible */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-200"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>

                {/* Video Selector - Fullscreen Only */}
                {isFullscreen && (
                  <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20"
                    onMouseEnter={() => handleVideoSelectorHover(true)}
                    onMouseLeave={() => handleVideoSelectorHover(false)}
                  >
                    {/* Hover Trigger Area */}
                    <div className="w-12 h-32 bg-gradient-to-r from-pink-500/10 to-transparent flex items-center justify-start pl-2">
                      <Grid3X3 className="w-4 h-4 text-pink-400" />
                    </div>

                    {/* Expandable Panel */}
                    <div
                      className={`absolute left-0 top-0 transition-all duration-300 ease-out ${
                        showVideoSelector
                          ? "translate-x-0 opacity-100 scale-100"
                          : "-translate-x-full opacity-0 scale-95"
                      }`}
                    >
                      <div className="bg-black/95 backdrop-blur-md rounded-r-xl p-4 w-80 max-h-96 border-r border-pink-500/20">
                        <div className="space-y-4">
                          {/* Search */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="Search videos..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm"
                            />
                          </div>

                          {/* Current Selection */}
                          <div className="text-center pb-2 border-b border-pink-500/20">
                            <p className="text-pink-400 text-xs font-medium mb-1">Now Playing</p>
                            <Badge variant="secondary" className="bg-pink-500/20 text-pink-300 text-xs">
                              {currentVideo?.name}
                            </Badge>
                          </div>

                          {/* Video List */}
                          <ScrollArea className="h-64">
                            <div className="space-y-1">
                              {filteredVideos.map((videoConfig, index) => {
                                const globalIndex = video.videos.findIndex((v) => v === videoConfig)
                                return (
                                  <Button
                                    key={index}
                                    variant={currentVideoIndex === globalIndex ? "default" : "ghost"}
                                    size="sm"
                                    className={`w-full justify-start text-left text-xs h-auto py-2 px-3 transition-all duration-200 ${
                                      currentVideoIndex === globalIndex
                                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg"
                                        : "text-white hover:bg-white/20 hover:text-pink-300"
                                    }`}
                                    onClick={() => handleVideoChange(globalIndex)}
                                  >
                                    <div className="text-left">
                                      <div className="font-medium line-clamp-2">{videoConfig.name}</div>
                                      <div className="text-xs opacity-70 mt-1">#{globalIndex + 1}</div>
                                    </div>
                                  </Button>
                                )
                              })}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clean Video Controls Overlay */}
                <div
                  className={`absolute inset-0 transition-opacity duration-200 pointer-events-none ${
                    showControls ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {/* Main Controls - Simplified */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="w-full cursor-pointer"
                        disabled={!currentVideoUrl}
                      />
                    </div>

                    {/* Control Row */}
                    <div className="flex items-center gap-4">
                      {/* Play/Pause */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-pink-500/20 h-9 w-9 p-0 rounded-full"
                        disabled={!currentVideoUrl}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>

                      {/* Volume */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={toggleMute}
                          className="text-white hover:bg-pink-500/20 h-8 w-8 p-0 rounded-full"
                          disabled={!currentVideoUrl}
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <div className="w-20">
                          <Slider
                            value={[volume]}
                            max={1}
                            step={0.1}
                            onValueChange={handleVolumeChange}
                            className="w-full"
                            disabled={!currentVideoUrl}
                          />
                        </div>
                      </div>

                      {/* Time Display */}
                      <div className="text-white text-sm font-mono bg-black/30 px-2 py-1 rounded">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>

                      <div className="flex-1" />

                      {/* Speed Select */}
                      <Select
                        value={playbackSpeed.toString()}
                        onValueChange={handleSpeedChange}
                        disabled={!currentVideoUrl}
                      >
                        <SelectTrigger className="w-20 h-8 bg-black/30 border-pink-500/30 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-pink-500/30">
                          {PLAYBACK_SPEEDS.map((speed) => (
                            <SelectItem
                              key={speed.value}
                              value={speed.value.toString()}
                              className="text-white hover:bg-pink-500/20"
                            >
                              {speed.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Fullscreen */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleFullscreen}
                        className="text-white hover:bg-pink-500/20 h-8 w-8 p-0 rounded-full"
                        disabled={!currentVideoUrl}
                      >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                      </Button>

                      {isFullscreen && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={onBack}
                          className="text-white hover:bg-pink-500/20 h-8 w-8 p-0 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {isTransitioning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="w-6 h-6 border-2 border-pink-500/50 border-t-pink-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Selection Panel - Desktop Only - Smaller */}
        {!isFullscreen && (
          <div className="w-80 space-y-4">
            {/* Search */}
            <Card className="border-pink-500/20">
              <CardContent className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-pink-500/20 focus:border-pink-500/40 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current Selection */}
            <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-pink-600/5">
              <CardContent className="p-3">
                <h3 className="font-poppins font-semibold mb-2 text-sm">Now Playing</h3>
                <Badge variant="secondary" className="bg-pink-500/20 text-pink-700 dark:text-pink-300 text-xs">
                  {currentVideo?.name}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  #{currentVideoIndex + 1} of {video.videos.length}
                </p>
              </CardContent>
            </Card>

            {/* Video List */}
            <Card className="border-pink-500/20">
              <CardContent className="p-3">
                <h3 className="font-poppins font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Grid3X3 className="w-3 h-3 text-pink-500" />
                  Videos ({filteredVideos.length})
                </h3>
                <ScrollArea className="h-96">
                  <div className="space-y-1">
                    {filteredVideos.map((videoConfig, index) => {
                      const globalIndex = video.videos.findIndex((v) => v === videoConfig)
                      return (
                        <Button
                          key={index}
                          variant={currentVideoIndex === globalIndex ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start text-left transition-all duration-200 font-poppins font-medium text-xs h-auto py-2 px-3 ${
                            currentVideoIndex === globalIndex
                              ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white"
                              : "border-pink-500/20 hover:bg-pink-500/10"
                          }`}
                          onClick={() => handleVideoChange(globalIndex)}
                        >
                          <div className="text-left">
                            <div className="font-medium line-clamp-2">{videoConfig.name}</div>
                            <div className="text-xs opacity-70 mt-1">#{globalIndex + 1}</div>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
