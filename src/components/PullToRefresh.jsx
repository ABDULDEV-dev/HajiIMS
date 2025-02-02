"use client"

import { useState, useRef, useEffect } from "react"
import { RefreshCw } from "lucide-react"

function PullToRefresh({ onRefresh, children, threshold = 80 }) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const containerRef = useRef(null)

  const handleTouchStart = (e) => {
    // Only start pull-to-refresh if we're at the top of the page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e) => {
    if (!isPulling || isRefreshing) return

    const currentY = e.touches[0].clientY
    const distance = Math.max(0, currentY - startY)

    // Apply resistance to the pull
    const resistedDistance = distance * 0.5
    setPullDistance(Math.min(resistedDistance, threshold * 1.5))

    // Prevent default scrolling when pulling
    if (distance > 10) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling) return

    setIsPulling(false)

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error("Refresh failed:", error)
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  // Reset pull distance when not pulling
  useEffect(() => {
    if (!isPulling && !isRefreshing) {
      setPullDistance(0)
    }
  }, [isPulling, isRefreshing])

  const pullProgress = Math.min(pullDistance / threshold, 1)
  const shouldTriggerRefresh = pullDistance >= threshold

  return (
    <div
      className="pull-to-refresh-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div
        className={`pull-to-refresh-indicator ${isPulling || isRefreshing ? "visible" : ""}`}
        style={{
          transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
          opacity: pullProgress,
        }}
      >
        <div className="refresh-icon-container">
          <RefreshCw
            className={`refresh-icon ${isRefreshing ? "spinning" : ""} ${shouldTriggerRefresh ? "ready" : ""}`}
            style={{
              transform: `rotate(${pullProgress * 180}deg)`,
            }}
          />
        </div>
        <div className="refresh-text">
          {isRefreshing ? "Refreshing..." : shouldTriggerRefresh ? "Release to refresh" : "Pull to refresh"}
        </div>
      </div>

      {/* Content */}
      <div
        className="pull-to-refresh-content"
        style={{
          transform: `translateY(${isPulling ? pullDistance : 0}px)`,
          transition: isPulling ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default PullToRefresh
