"use client"

import { useState, useRef, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Search, Plus, ArrowRight, DollarSign, ChevronDown, Edit, Trash2, Eye, RefreshCw } from "lucide-react"

function ViewInventory({ inventory = [], setCurrentPage }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [showBuyingPrice, setShowBuyingPrice] = useState(true)
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [swipedCard, setSwipedCard] = useState(null)
  const [longPressCard, setLongPressCard] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const tableWrapperRef = useRef(null)
  const touchStartRef = useRef(null)
  const longPressTimerRef = useRef(null)

  useEffect(() => {
    const checkScroll = () => {
      if (tableWrapperRef.current) {
        const { scrollWidth, clientWidth } = tableWrapperRef.current
        setShowScrollIndicator(scrollWidth > clientWidth)
      }
    }

    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  // Calculate total selling value
  const totalSellingValue =
    inventory?.reduce((sum, item) => {
      const price = Number(item.price) || 0
      const quantity = Number(item.quantity) || 0
      return sum + price * quantity
    }, 0) || 0

  // Calculate total buying value
  const totalBuyingValue =
    inventory?.reduce((sum, item) => {
      const buyingPrice = Number(item.buyingPrice) || 0
      const quantity = Number(item.quantity) || 0
      return sum + buyingPrice * quantity
    }, 0) || 0

  // Calculate total potential profit
  const totalProfit = totalSellingValue - totalBuyingValue

  const formatNumber = (num) => {
    const parts = num.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
  }

  const filteredInventory = inventory.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower) ||
      String(item.price).includes(searchTerm) ||
      String(item.quantity).includes(searchTerm)
    )
  })

  const handlePageChange = (page) => {
    if (typeof setCurrentPage === "function") {
      setCurrentPage(page)
    }
  }

  // New interactive functions
  const toggleCardExpansion = (itemId) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedCards(newExpanded)
  }

  const handleTouchStart = (e, itemId) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
      itemId,
    }

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      setLongPressCard(itemId)
      // Simulate haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500)
  }

  const handleTouchMove = (e, itemId) => {
    if (!touchStartRef.current) return

    const deltaX = e.touches[0].clientX - touchStartRef.current.x
    const deltaY = e.touches[0].clientY - touchStartRef.current.y

    // Clear long press if moved too much
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      clearTimeout(longPressTimerRef.current)
    }

    // Handle swipe
    if (Math.abs(deltaX) > 50) {
      setSwipedCard(itemId)
    }
  }

  const handleTouchEnd = (e, itemId) => {
    clearTimeout(longPressTimerRef.current)

    if (!touchStartRef.current) return

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time

    // Reset swipe
    setTimeout(() => setSwipedCard(null), 300)

    // Handle tap
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
      toggleCardExpansion(itemId)
    }

    touchStartRef.current = null
  }

  const handleQuickAction = (action, item) => {
    // Simulate haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }

    switch (action) {
      case "edit":
        console.log("Edit item:", item.name)
        break
      case "delete":
        console.log("Delete item:", item.name)
        break
      case "view":
        console.log("View item:", item.name)
        break
      default:
        break
    }
  }

  const handlePullToRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  const filterOptions = [
    { key: "all", label: "All Items" },
    { key: "low-stock", label: "Low Stock" },
    { key: "high-profit", label: "High Profit" },
    { key: "recent", label: "Recently Added" },
  ]

  const getFilteredInventory = () => {
    let filtered = filteredInventory

    switch (selectedFilter) {
      case "low-stock":
        filtered = filtered.filter((item) => item.quantity < 10)
        break
      case "high-profit":
        filtered = filtered.filter((item) => {
          const profit = item.price - (item.buyingPrice || 0)
          const margin = item.price > 0 ? (profit / item.price) * 100 : 0
          return margin > 30
        })
        break
      case "recent":
        // Assuming items have a dateAdded field
        filtered = filtered.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0))
        break
      default:
        break
    }

    return filtered
  }

  return (
    <main className="view-inventory">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
      <h2>View Inventory</h2>
      <div className="inventory-actions">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="inventory-buttons">
          <button onClick={() => handlePageChange("add-product")} className="quick-add-button">
            <Plus className="icon" />
            Add Product
          </button>
          <button onClick={() => setShowBuyingPrice(!showBuyingPrice)} className="toggle-button">
            <DollarSign className="icon" />
            {showBuyingPrice ? "Hide Cost" : "Show Cost"}
          </button>
        </div>
      </div>

      {showScrollIndicator && (
        <div className="table-scroll-indicator">
          <ArrowRight className="icon" />
          Scroll horizontally to see more
        </div>
      )}

      <div className="table-wrapper" ref={tableWrapperRef}>
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              {showBuyingPrice && <th>Buying Price (₦)</th>}
              <th>Selling Price (₦)</th>
              <th>Category</th>
              <th>Quantity</th>
              {showBuyingPrice && <th>Total Buying (₦)</th>}
              <th>Total Selling (₦)</th>
              {showBuyingPrice && <th>Profit (₦)</th>}
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => {
              const sellingPrice = Number(item.price) || 0
              const buyingPrice = Number(item.buyingPrice) || 0
              const quantity = Number(item.quantity) || 0
              const totalSelling = sellingPrice * quantity
              const totalBuying = buyingPrice * quantity
              const profit = totalSelling - totalBuying
              const profitMargin = sellingPrice > 0 ? ((sellingPrice - buyingPrice) / sellingPrice) * 100 : 0

              return (
                <tr key={item.id}>
                  <td>
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="product-image" />
                  </td>
                  <td>{item.name}</td>
                  {showBuyingPrice && <td>₦{formatNumber(buyingPrice.toFixed(2))}</td>}
                  <td>₦{formatNumber(sellingPrice.toFixed(2))}</td>
                  <td>{item.category}</td>
                  <td>{formatNumber(quantity)}</td>
                  {showBuyingPrice && <td>₦{formatNumber(totalBuying.toFixed(2))}</td>}
                  <td>₦{formatNumber(totalSelling.toFixed(2))}</td>
                  {showBuyingPrice && (
                    <td className={profit > 0 ? "profit-positive" : "profit-negative"}>
                      ₦{formatNumber(profit.toFixed(2))}
                      <span className="profit-margin">({profitMargin.toFixed(1)}%)</span>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards with enhanced interactions */}
      <div className="mobile-cards">
        {/* Pull to Refresh */}
        <div className={`pull-to-refresh ${isRefreshing ? "refreshing" : ""}`} onClick={handlePullToRefresh}>
          <RefreshCw className={`refresh-icon ${isRefreshing ? "spinning" : ""}`} />
          <div>{isRefreshing ? "Refreshing..." : "Pull to refresh"}</div>
        </div>

        {/* Mobile Filters */}
        <div className="mobile-filters">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              className={`filter-chip ${selectedFilter === option.key ? "active" : ""}`}
              onClick={() => setSelectedFilter(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="table-cards">
          {getFilteredInventory().map((item) => {
            const sellingPrice = Number(item.price) || 0
            const buyingPrice = Number(item.buyingPrice) || 0
            const quantity = Number(item.quantity) || 0
            const totalSelling = sellingPrice * quantity
            const totalBuying = buyingPrice * quantity
            const profit = totalSelling - totalBuying
            const profitMargin = sellingPrice > 0 ? ((sellingPrice - buyingPrice) / sellingPrice) * 100 : 0
            const isExpanded = expandedCards.has(item.id)
            const isLowStock = quantity < 10

            return (
              <div
                key={item.id}
                className={`table-card expandable ripple ${isExpanded ? "expanded" : ""} ${swipedCard === item.id ? "swipe-left" : ""} ${longPressCard === item.id ? "long-pressing" : ""}`}
                onTouchStart={(e) => handleTouchStart(e, item.id)}
                onTouchMove={(e) => handleTouchMove(e, item.id)}
                onTouchEnd={(e) => handleTouchEnd(e, item.id)}
                onClick={() => toggleCardExpansion(item.id)}
              >
                {/* Swipe Actions */}
                <div className="swipe-actions left">
                  <button
                    className="swipe-action-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction("delete", item)
                    }}
                  >
                    <Trash2 />
                  </button>
                </div>

                {/* Notification Badge for Low Stock */}
                {isLowStock && <div className="notification-badge">!</div>}

                {/* Expand Indicator */}
                <div className={`card-expand-indicator ${isExpanded ? "expanded" : ""}`}>
                  <ChevronDown />
                </div>

                {/* Quick Actions Menu */}
                <div className="card-quick-actions">
                  <button
                    className="quick-action-btn edit"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction("edit", item)
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="quick-action-btn view"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction("view", item)
                    }}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="quick-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction("delete", item)
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="card-header">
                  <div className="card-title">{item.name}</div>
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="product-image" />
                </div>

                {/* Progress Bar for Stock Level */}
                <div className="card-progress">
                  <div
                    className={`card-progress-bar ${quantity > 20 ? "paid" : quantity > 5 ? "partial" : "debt"}`}
                    style={{ width: `${Math.min((quantity / 50) * 100, 100)}%` }}
                  ></div>
                </div>

                <div className="card-details">
                  <div className="card-detail">
                    <span className="card-detail-label">Category</span>
                    <span className="card-detail-value">{item.category}</span>
                  </div>
                  <div className="card-detail">
                    <span className="card-detail-label">Quantity</span>
                    <span className={`card-detail-value ${isLowStock ? "profit-negative" : ""}`}>
                      {formatNumber(quantity)}
                    </span>
                  </div>
                  {showBuyingPrice && (
                    <div className="card-detail">
                      <span className="card-detail-label">Buying Price</span>
                      <span className="card-detail-value">₦{formatNumber(buyingPrice.toFixed(2))}</span>
                    </div>
                  )}
                  <div className="card-detail">
                    <span className="card-detail-label">Selling Price</span>
                    <span className="card-detail-value">₦{formatNumber(sellingPrice.toFixed(2))}</span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="card-expanded-content">
                    <div className="card-expanded-details">
                      {showBuyingPrice && (
                        <>
                          <div className="expanded-detail">
                            <span className="expanded-detail-label">Total Buying Value</span>
                            <span className="expanded-detail-value">₦{formatNumber(totalBuying.toFixed(2))}</span>
                          </div>
                          <div className="expanded-detail">
                            <span className="expanded-detail-label">Total Selling Value</span>
                            <span className="expanded-detail-value">₦{formatNumber(totalSelling.toFixed(2))}</span>
                          </div>
                          <div className="expanded-detail">
                            <span className="expanded-detail-label">Potential Profit</span>
                            <span
                              className={`expanded-detail-value ${profit > 0 ? "profit-positive" : "profit-negative"}`}
                            >
                              ₦{formatNumber(profit.toFixed(2))} ({profitMargin.toFixed(1)}%)
                            </span>
                          </div>
                        </>
                      )}
                      <div className="expanded-detail">
                        <span className="expanded-detail-label">Stock Status</span>
                        <span className={`expanded-detail-value ${isLowStock ? "profit-negative" : "profit-positive"}`}>
                          {isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gesture Hint */}
                <div className="gesture-hint">Tap to expand • Swipe for actions</div>

                {/* Long Press Menu */}
                {longPressCard === item.id && (
                  <div className="long-press-menu show">
                    <button className="long-press-action" onClick={() => handleQuickAction("edit", item)}>
                      Edit
                    </button>
                    <button className="long-press-action" onClick={() => handleQuickAction("view", item)}>
                      View
                    </button>
                    <button className="long-press-action" onClick={() => handleQuickAction("delete", item)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Floating Action Button */}
        <button className="floating-action-btn" onClick={() => handlePageChange("add-product")}>
          <Plus size={24} />
        </button>
      </div>

      <div className="inventory-totals">
        <div className="totals-card">
          <h3>Inventory Summary</h3>
          <div className="totals-grid">
            {showBuyingPrice && (
              <div className="total-item">
                <span className="total-label">Total Buying Value:</span>
                <span className="total-value">₦{formatNumber(totalBuyingValue.toFixed(2))}</span>
              </div>
            )}
            <div className="total-item">
              <span className="total-label">Total Selling Value:</span>
              <span className="total-value">₦{formatNumber(totalSellingValue.toFixed(2))}</span>
            </div>
            {showBuyingPrice && (
              <div className="total-item">
                <span className="total-label">Total Potential Profit:</span>
                <span className={`total-value ${totalProfit > 0 ? "profit-positive" : "profit-negative"}`}>
                  ₦{formatNumber(totalProfit.toFixed(2))}
                  <span className="profit-margin">
                    ({totalSellingValue > 0 ? ((totalProfit / totalSellingValue) * 100).toFixed(1) : 0}%)
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default ViewInventory
