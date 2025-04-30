"use client"

import { useState, useRef, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Search, Plus, ArrowRight, DollarSign } from "lucide-react"

function ViewInventory({ inventory = [], setCurrentPage }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [showBuyingPrice, setShowBuyingPrice] = useState(true) // Default to showing buying price
  const tableWrapperRef = useRef(null)

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

