"use client"

import { useState } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Search, Plus } from "lucide-react"

function ViewInventory({ inventory = [], productHistory = [], setCurrentPage }) {
  const [searchTerm, setSearchTerm] = useState("")

  // Calculate total selling value
  const totalSellingValue =
    inventory?.reduce((sum, item) => {
      const price = Number(item.price) || 0
      const quantity = Number(item.quantity) || 0
      return sum + price * quantity
    }, 0) || 0

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
      String(item.price).includes(searchLower) ||
      String(item.quantity).includes(searchLower)
    )
  })

  const handlePageChange = (page) => {
    if (typeof setCurrentPage === "function") {
      setCurrentPage(page)
    }
  }

  const handleProductClick = (product) => {
    // Store selected product in localStorage for ProductDetails page
    localStorage.setItem("selectedProduct", JSON.stringify(product))
    handlePageChange("product-details")
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
        </div>
      </div>

      {/* Simplified Product Cards */}
      <div className="simple-inventory-cards">
        {filteredInventory.map((item) => {
          const sellingPrice = Number(item.price) || 0
          const quantity = Number(item.quantity) || 0

          return (
            <div key={item.id} className="simple-inventory-card" onClick={() => handleProductClick(item)}>
              <div className="simple-card-image">
                <img
                  src={item.image || "/placeholder.svg?height=120&width=120"}
                  alt={item.name}
                  className="product-image"
                />
                {quantity === 0 && <div className="out-of-stock-badge">Out of Stock</div>}
                {quantity > 0 && quantity <= 5 && <div className="low-stock-badge">Low Stock</div>}
              </div>

              <div className="simple-card-content">
                <h3 className="simple-card-title">{item.name}</h3>
                <div className="simple-card-price">₦{formatNumber(sellingPrice.toFixed(2))}</div>
                <div className="simple-card-stock">Stock: {formatNumber(quantity)}</div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredInventory.length === 0 && (
        <div className="no-products">
          <div className="no-products-icon">📦</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or add new products to your inventory.</p>
          <button onClick={() => handlePageChange("add-product")} className="add-first-product-btn">
            <Plus className="icon" />
            Add Your First Product
          </button>
        </div>
      )}

      <div className="inventory-summary">
        <div className="summary-card">
          <h3>Inventory Summary</h3>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="stat-label">Total Products:</span>
              <span className="stat-value">{inventory.length}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Total Value:</span>
              <span className="stat-value">₦{formatNumber(totalSellingValue.toFixed(2))}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ViewInventory
