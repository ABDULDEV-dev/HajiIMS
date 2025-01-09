"use client"

import { useState, useRef, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Search, Printer, ArrowRight, CheckCircle2, XCircle, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react"

function ReceiptHistory({ sales = [], setCurrentPage, setCurrentSale }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [expandedSaleId, setExpandedSaleId] = useState(null)
  const [viewMode, setViewMode] = useState("cards") // "cards" or "table"
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

    // Set view mode based on screen size
    const handleResize = () => {
      setViewMode(window.innerWidth < 768 ? "cards" : "table")
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", checkScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handlePrintReceipt = (sale) => {
    // Make sure we're setting the current sale before navigation
    setCurrentSale(sale)
    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      setCurrentPage("receipt-printing")
    }, 0)
  }

  const formatNumber = (num) => {
    const parts = num.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
  }

  const toggleExpandSale = (saleId) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId)
  }

  const filteredSales = sales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase()

    // For multi-item sales with cartItems array
    if (sale.cartItems && Array.isArray(sale.cartItems)) {
      // Check if any product in cartItems matches search
      const productMatch = sale.cartItems.some((item) => item.productName?.toLowerCase().includes(searchLower))

      return (
        sale.customerName?.toLowerCase().includes(searchLower) || productMatch || sale.phoneNumber?.includes(searchTerm)
      )
    }

    // For single-item sales (legacy format)
    return (
      sale.customerName?.toLowerCase().includes(searchLower) ||
      sale.productName?.toLowerCase().includes(searchLower) ||
      sale.phoneNumber?.includes(searchTerm) ||
      String(sale.quantity).includes(searchTerm)
    )
  })

  // Group sales by ID to handle both multi-item and single-item sales
  const groupedSales = filteredSales.reduce((acc, sale) => {
    // If this is a new format sale with cartItems
    if (sale.cartItems && Array.isArray(sale.cartItems)) {
      acc[sale.id] = sale
    } else {
      // For legacy format, group by ID
      if (!acc[sale.id]) {
        acc[sale.id] = { ...sale, isLegacy: true }
      }
    }
    return acc
  }, {})

  const uniqueSales = Object.values(groupedSales)

  return (
    <main className="receipt-history">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
      <h2>Receipt History</h2>
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === "cards" ? "active" : ""}`}
            onClick={() => setViewMode("cards")}
          >
            Cards
          </button>
          <button
            className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
          >
            Table
          </button>
        </div>
      </div>

      {/* Card View */}
      {viewMode === "cards" && (
        <div className="sales-cards">
          {uniqueSales.length > 0 ? (
            uniqueSales.map((sale) => {
              const isExpanded = expandedSaleId === sale.id
              const isMultiItem = sale.cartItems && Array.isArray(sale.cartItems) && sale.cartItems.length > 0

              // Calculate total for the sale
              let totalAmount = 0
              let itemCount = 0

              if (isMultiItem) {
                totalAmount = sale.totalAmount || 0
                itemCount = sale.cartItems.length
              } else {
                totalAmount = sale.price * sale.quantity
                itemCount = 1
              }

              return (
                <div
                  key={sale.id}
                  className={`sale-card ${sale.paymentType === "debt" ? "debt-card" : ""} ${isExpanded ? "expanded" : ""}`}
                  onClick={() => toggleExpandSale(sale.id)}
                >
                  <div className="sale-card-header">
                    <div className="sale-card-customer">
                      <h3>{sale.customerName || "Walk-in Customer"}</h3>
                      <span className="sale-date">{sale.date}</span>
                    </div>
                    <div className="sale-card-amount">
                      <span className="amount">₦{formatNumber(totalAmount.toFixed(2))}</span>
                      <span className={`status-badge ${sale.paymentType}`}>
                        {sale.paymentType === "paid" ? (
                          <CheckCircle2 className="status-icon paid" />
                        ) : (
                          <XCircle className="status-icon pending" />
                        )}
                        {sale.paymentType === "paid" ? "Paid" : "Debt"}
                      </span>
                    </div>
                  </div>

                  <div className="sale-card-summary">
                    <div className="product-summary">
                      {isMultiItem ? (
                        <span className="multi-item">
                          <ShoppingBag size={16} className="inline-icon" />
                          {itemCount} items
                        </span>
                      ) : (
                        <span>{sale.productName}</span>
                      )}
                      <span className="quantity-badge">
                        Qty:{" "}
                        {isMultiItem ? sale.cartItems.reduce((sum, item) => sum + item.quantity, 0) : sale.quantity}
                      </span>
                    </div>
                    <div className="expand-indicator">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="sale-card-details">
                      {/* Customer Details */}
                      <div className="detail-section">
                        <h4>Customer Details</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Phone:</span>
                            <span className="detail-value">{sale.phoneNumber || "N/A"}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Address:</span>
                            <span className="detail-value">{sale.address || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="detail-section">
                        <h4>Items</h4>
                        <div className="items-list">
                          {isMultiItem ? (
                            sale.cartItems.map((item, idx) => (
                              <div key={idx} className="item-row">
                                <div className="item-name">{item.productName}</div>
                                <div className="item-details">
                                  <span>
                                    {item.quantity} × ₦{formatNumber(item.price.toFixed(2))}
                                  </span>
                                  <span className="item-total">
                                    ₦{formatNumber((item.price * item.quantity).toFixed(2))}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="item-row">
                              <div className="item-name">{sale.productName}</div>
                              <div className="item-details">
                                <span>
                                  {sale.quantity} × ₦{formatNumber(sale.price.toFixed(2))}
                                </span>
                                <span className="item-total">
                                  ₦{formatNumber((sale.price * sale.quantity).toFixed(2))}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="detail-section">
                        <h4>Summary</h4>
                        <div className="financial-summary">
                          <div className="summary-item">
                            <span>Subtotal:</span>
                            <span>₦{formatNumber(totalAmount.toFixed(2))}</span>
                          </div>

                          {sale.discountAmount > 0 && (
                            <div className="summary-item discount">
                              <span>Discount:</span>
                              <span>₦{formatNumber(sale.discountAmount.toFixed(2))}</span>
                            </div>
                          )}

                          {sale.paymentType === "debt" && sale.initialDeposit > 0 && (
                            <div className="summary-item deposit">
                              <span>Deposit:</span>
                              <span>₦{formatNumber(sale.initialDeposit.toFixed(2))}</span>
                            </div>
                          )}

                          {sale.paymentType === "debt" && (
                            <div className="summary-item balance">
                              <span>Balance:</span>
                              <span>₦{formatNumber((totalAmount - (sale.initialDeposit || 0)).toFixed(2))}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="card-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePrintReceipt(sale)
                          }}
                          className="icon-button"
                        >
                          <Printer className="button-icon-small" />
                          Print Receipt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="no-sales">
              <p>No sales records found</p>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <>
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
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total (₦)</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? (
                  uniqueSales.map((sale) => {
                    const isMultiItem = sale.cartItems && Array.isArray(sale.cartItems) && sale.cartItems.length > 0
                    let totalAmount = 0
                    let totalQuantity = 0

                    if (isMultiItem) {
                      totalAmount = sale.totalAmount || 0
                      totalQuantity = sale.cartItems.reduce((sum, item) => sum + item.quantity, 0)
                    } else {
                      totalAmount = sale.price * sale.quantity
                      totalQuantity = sale.quantity
                    }

                    return (
                      <tr key={sale.id} className={sale.paymentType === "debt" ? "debt-row" : ""}>
                        <td>{sale.date}</td>
                        <td>{sale.customerName}</td>
                        <td>
                          {isMultiItem ? (
                            <span className="multi-item">
                              <ShoppingBag size={16} className="inline-icon" />
                              {sale.cartItems.length} items
                            </span>
                          ) : (
                            sale.productName
                          )}
                        </td>
                        <td>{formatNumber(totalQuantity)}</td>
                        <td>₦{formatNumber(totalAmount.toFixed(2))}</td>
                        <td>
                          <span className={`status-badge ${sale.paymentType}`}>
                            {sale.paymentType === "paid" ? (
                              <CheckCircle2 className="status-icon paid" />
                            ) : (
                              <XCircle className="status-icon pending" />
                            )}
                            {sale.paymentType === "paid" ? "Paid" : "Debt"}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => handlePrintReceipt(sale)} className="icon-button">
                            <Printer className="button-icon-small" />
                            Print
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="no-records">
                      No sales records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}

export default ReceiptHistory
