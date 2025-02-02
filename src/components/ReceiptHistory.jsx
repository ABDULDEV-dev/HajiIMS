"use client"

import { useState, useRef, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Search, ArrowRight, CheckCircle2, XCircle, Eye } from "lucide-react"

function ReceiptHistory({ sales = [], setCurrentPage, setCurrentSale }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
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

  const handleViewSaleDetails = (sale) => {
    setCurrentSale(sale)
    setCurrentPage("sale-details")
  }

  const formatNumber = (num) => {
    const parts = num.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const filteredSales = sales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      sale.customerName?.toLowerCase().includes(searchLower) ||
      sale.productName?.toLowerCase().includes(searchLower) ||
      sale.phoneNumber?.includes(searchTerm) ||
      String(sale.quantity).includes(searchTerm)
    )
  })

  // Group sales by transaction ID for multi-item sales
  const groupedSales = filteredSales.reduce((acc, sale) => {
    const key = sale.multiItemSale ? sale.id : `${sale.id}-${sale.productName}`
    if (!acc[key]) {
      acc[key] = {
        ...sale,
        items: [],
      }
    }
    acc[key].items.push(sale)
    return acc
  }, {})

  const salesCards = Object.values(groupedSales)

  return (
    <main className="receipt-history">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
      <h2>Sales History</h2>

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
      </div>

      {/* Desktop Table View */}
      {showScrollIndicator && (
        <div className="table-scroll-indicator">
          <ArrowRight className="icon" />
          Scroll horizontally to see more
        </div>
      )}

      <div className="table-wrapper desktop-table" ref={tableWrapperRef}>
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
              filteredSales.map((sale) => {
                const total = sale.price * sale.quantity
                return (
                  <tr key={sale.id} className={sale.paymentType === "debt" ? "debt-row" : ""}>
                    <td>{sale.date}</td>
                    <td>{sale.customerName}</td>
                    <td>{sale.productName}</td>
                    <td>{formatNumber(sale.quantity)}</td>
                    <td>₦{formatNumber(total.toFixed(2))}</td>
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
                      <button onClick={() => handleViewSaleDetails(sale)} className="icon-button">
                        <Eye className="button-icon-small" />
                        View
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

      {/* Mobile Cards View */}
      <div className="mobile-cards sales-history-simple-cards">
        {salesCards.length > 0 ? (
          salesCards.map((saleGroup) => {
            const totalAmount = saleGroup.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
            const totalItems = saleGroup.items.length

            return (
              <div
                key={saleGroup.id}
                className={`simple-sale-card ${saleGroup.paymentType === "debt" ? "debt-card" : ""}`}
                onClick={() => handleViewSaleDetails(saleGroup)}
              >
                <div className="sale-card-main">
                  <div className="customer-section">
                    <div className="customer-avatar">{saleGroup.customerName.charAt(0).toUpperCase()}</div>
                    <div className="customer-info">
                      <h3 className="customer-name">{saleGroup.customerName}</h3>
                      <span className="sale-date">{formatDate(saleGroup.date)}</span>
                    </div>
                  </div>

                  <div className="amount-section">
                    <div className="sale-amount">₦{formatNumber(totalAmount.toFixed(2))}</div>
                    <span className={`payment-status ${saleGroup.paymentType}`}>
                      {saleGroup.paymentType === "paid" ? (
                        <CheckCircle2 className="status-icon" />
                      ) : (
                        <XCircle className="status-icon" />
                      )}
                      {saleGroup.paymentType === "paid" ? "Paid" : "Debt"}
                    </span>
                  </div>
                </div>

                <div className="sale-card-footer">
                  <div className="items-count">{totalItems === 1 ? "1 item" : `${totalItems} items`}</div>
                  <div className="view-indicator">
                    <Eye className="view-icon" />
                    <span>Tap to view</span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="no-records-card">
            <div className="no-sales-icon">📋</div>
            <h3>No Sales Found</h3>
            <p>No sales records match your search criteria.</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default ReceiptHistory
