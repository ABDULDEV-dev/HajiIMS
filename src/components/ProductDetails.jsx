"use client"

import { useState, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import {
  Package,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  History,
  Plus,
  ShoppingCart,
  Edit,
  ArrowLeft,
} from "lucide-react"

function ProductDetails({ productHistory = [], setCurrentPage }) {
  const [product, setProduct] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const storedProduct = localStorage.getItem("selectedProduct")
    if (storedProduct) {
      setProduct(JSON.parse(storedProduct))
    }
  }, [])

  if (!product) {
    return (
      <main className="product-details">
        <BackToHomeButtom setCurrentPage={setCurrentPage} />
        <div className="no-product">
          <h2>Product not found</h2>
          <p>Please select a product from the inventory.</p>
          <button onClick={() => setCurrentPage("view-inventory")} className="back-to-inventory-btn">
            <ArrowLeft className="icon" />
            Back to Inventory
          </button>
        </div>
      </main>
    )
  }

  const formatNumber = (num) => {
    const parts = num.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
  }

  const sellingPrice = Number(product.price) || 0
  const buyingPrice = Number(product.buyingPrice) || 0
  const quantity = Number(product.quantity) || 0
  const totalSelling = sellingPrice * quantity
  const totalBuying = buyingPrice * quantity
  const profit = totalSelling - totalBuying
  const profitMargin = sellingPrice > 0 ? ((sellingPrice - buyingPrice) / sellingPrice) * 100 : 0

  const getProductHistory = (productId) => {
    return productHistory
      .filter((entry) => entry.productId === productId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const productHistoryEntries = getProductHistory(product.id)

  const handleEdit = () => {
    localStorage.setItem("editProduct", JSON.stringify(product))
    setCurrentPage("edit-product")
  }

  return (
    <main className="product-details">
      <div className="product-details-header">
        <button onClick={() => setCurrentPage("view-inventory")} className="back-button">
          <ArrowLeft className="icon" />
          Back to Inventory
        </button>
        <div className="header-actions">
          <button onClick={handleEdit} className="edit-button">
            <Edit className="icon" />
            Edit
          </button>
        </div>
      </div>

      <div className="product-details-content">
        {/* Product Image and Basic Info */}
        <div className="product-hero">
          <div className="product-image-container">
            <img
              src={product.image || "/placeholder.svg?height=300&width=300"}
              alt={product.name}
              className="product-hero-image"
            />
            {quantity === 0 && <div className="stock-status out-of-stock">Out of Stock</div>}
            {quantity > 0 && quantity <= 5 && <div className="stock-status low-stock">Low Stock</div>}
            {quantity > 5 && <div className="stock-status in-stock">In Stock</div>}
          </div>

          <div className="product-hero-info">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-category">{product.category}</div>
            <div className="product-price">₦{formatNumber(sellingPrice.toFixed(2))}</div>
            <div className="product-stock">Stock: {formatNumber(quantity)} units</div>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="product-details-grid">
          <div className="detail-card">
            <div className="detail-card-header">
              <DollarSign className="detail-icon" />
              <h3>Pricing Information</h3>
            </div>
            <div className="detail-card-content">
              <div className="detail-row">
                <span className="detail-label">Selling Price:</span>
                <span className="detail-value">₦{formatNumber(sellingPrice.toFixed(2))}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cost Price:</span>
                <span className="detail-value">₦{formatNumber(buyingPrice.toFixed(2))}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Profit per Unit:</span>
                <span
                  className={`detail-value ${(sellingPrice - buyingPrice) > 0 ? "profit-positive" : "profit-negative"}`}
                >
                  ₦{formatNumber((sellingPrice - buyingPrice).toFixed(2))}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Profit Margin:</span>
                <span className={`detail-value ${profitMargin > 0 ? "profit-positive" : "profit-negative"}`}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-card-header">
              <Package className="detail-icon" />
              <h3>Stock Information</h3>
            </div>
            <div className="detail-card-content">
              <div className="detail-row">
                <span className="detail-label">Current Stock:</span>
                <span className="detail-value">{formatNumber(quantity)} units</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Value:</span>
                <span className="detail-value">₦{formatNumber(totalSelling.toFixed(2))}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Cost:</span>
                <span className="detail-value">₦{formatNumber(totalBuying.toFixed(2))}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Profit:</span>
                <span className={`detail-value ${profit > 0 ? "profit-positive" : "profit-negative"}`}>
                  ₦{formatNumber(profit.toFixed(2))}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-card-header">
              <TrendingUp className="detail-icon" />
              <h3>Performance</h3>
            </div>
            <div className="detail-card-content">
              <div className="detail-row">
                <span className="detail-label">History Entries:</span>
                <span className="detail-value">{productHistoryEntries.length}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Updated:</span>
                <span className="detail-value">
                  {productHistoryEntries.length > 0 ? productHistoryEntries[0].date : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="product-actions">
          <button onClick={() => setShowHistory(!showHistory)} className="action-button secondary">
            <History className="icon" />
            {showHistory ? "Hide History" : "View History"}
          </button>
          <button onClick={() => setCurrentPage("sales")} className="action-button primary">
            <ShoppingCart className="icon" />
            Sell Product
          </button>
        </div>

        {/* Product History */}
        {showHistory && (
          <div className="product-history-section">
            <h3>Product History</h3>
            <div className="history-entries">
              {productHistoryEntries.map((entry) => (
                <div key={entry.id} className={`history-entry ${entry.type}`}>
                  <div className="entry-header">
                    <div className="entry-type">
                      {entry.type === "created" && <Package className="entry-icon" />}
                      {entry.type === "restock" && <Plus className="entry-icon" />}
                      {entry.type === "sale" && <TrendingUp className="entry-icon" />}
                      <span className="entry-type-label">
                        {entry.type === "created" && "Product Created"}
                        {entry.type === "restock" && "Restocked"}
                        {entry.type === "sale" && "Sale"}
                      </span>
                    </div>
                    <div className="entry-date">
                      <Calendar className="date-icon" />
                      {entry.date}
                    </div>
                  </div>

                  <div className="entry-details">
                    <p className="entry-description">{entry.description}</p>
                    <div className="entry-metrics">
                      <div className="metric">
                        <span className="metric-label">Quantity:</span>
                        <span className={`metric-value ${entry.quantity > 0 ? "positive" : "negative"}`}>
                          {entry.quantity > 0 ? "+" : ""}
                          {formatNumber(entry.quantity)}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Amount:</span>
                        <span className="metric-value">₦{formatNumber(entry.amount.toFixed(2))}</span>
                      </div>
                    </div>

                    {entry.details && (
                      <div className="entry-extra-details">
                        {entry.details.customerName && (
                          <div className="extra-detail">
                            <User className="detail-icon" />
                            <span>{entry.details.customerName}</span>
                          </div>
                        )}
                        {entry.details.paymentType && (
                          <div className="extra-detail">
                            <span className={`payment-badge ${entry.details.paymentType}`}>
                              {entry.details.paymentType}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {productHistoryEntries.length === 0 && (
                <div className="no-history">
                  <History className="no-history-icon" />
                  <p>No history available for this product</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default ProductDetails
