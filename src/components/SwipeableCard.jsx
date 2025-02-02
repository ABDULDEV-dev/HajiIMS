"use client"

import { useState, useRef, useEffect } from "react"

function SwipeableCard({ children, onSwipeLeft, onSwipeRight, leftActions = [], rightActions = [], className = "" }) {
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [showActions, setShowActions] = useState(null) // 'left' | 'right' | null
  const cardRef = useRef(null)
  const actionsRef = useRef(null)

  const SWIPE_THRESHOLD = 100
  const MAX_TRANSLATE = 150

  const handleTouchStart = (e) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return

    const touchX = e.touches[0].clientX
    setCurrentX(touchX)

    const deltaX = touchX - startX
    const clampedDelta = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, deltaX))
    setTranslateX(clampedDelta)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    const deltaX = currentX - startX
    const absDelta = Math.abs(deltaX)

    if (absDelta > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        // Swiped right
        setShowActions("right")
        setTranslateX(MAX_TRANSLATE)
        if (onSwipeRight) onSwipeRight()
      } else {
        // Swiped left
        setShowActions("left")
        setTranslateX(-MAX_TRANSLATE)
        if (onSwipeLeft) onSwipeLeft()
      }
    } else {
      // Reset position
      setTranslateX(0)
      setShowActions(null)
    }

    setIsDragging(false)
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setCurrentX(e.clientX)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const mouseX = e.clientX
    setCurrentX(mouseX)

    const deltaX = mouseX - startX
    const clampedDelta = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, deltaX))
    setTranslateX(clampedDelta)
  }

  const handleMouseUp = () => {
    if (!isDragging) return

    const deltaX = currentX - startX
    const absDelta = Math.abs(deltaX)

    if (absDelta > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        setShowActions("right")
        setTranslateX(MAX_TRANSLATE)
        if (onSwipeRight) onSwipeRight()
      } else {
        setShowActions("left")
        setTranslateX(-MAX_TRANSLATE)
        if (onSwipeLeft) onSwipeLeft()
      }
    } else {
      setTranslateX(0)
      setShowActions(null)
    }

    setIsDragging(false)
  }

  const resetCard = () => {
    setTranslateX(0)
    setShowActions(null)
  }

  // Handle click outside to reset
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        resetCard()
      }
    }

    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showActions])

  // Handle mouse events globally when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, currentX, startX])

  return (
    <div className={`swipeable-card-container ${className}`} ref={cardRef}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className={`swipe-actions left-actions ${showActions === "left" ? "visible" : ""}`}>
          {leftActions.map((action, index) => (
            <button
              key={index}
              className={`swipe-action-button ${action.type || "default"}`}
              onClick={() => {
                action.onClick()
                resetCard()
              }}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className={`swipe-actions right-actions ${showActions === "right" ? "visible" : ""}`}>
          {rightActions.map((action, index) => (
            <button
              key={index}
              className={`swipe-action-button ${action.type || "default"}`}
              onClick={() => {
                action.onClick()
                resetCard()
              }}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Card */}
      <div
        className="swipeable-card"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  )
}

export default SwipeableCard
