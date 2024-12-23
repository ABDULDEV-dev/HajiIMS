"use client"

import { useState, useRef, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Search, Printer, ArrowRight, CheckCircle2, XCircle } from "lucide-react"

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

  const filteredSales = sales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      sale.customerName?.toLowerCase().includes(searchLower) ||
      sale.productName?.toLowerCase().includes(searchLower) ||
      sale.phoneNumber?.includes(searchTerm) ||
      String(sale.quantity).includes(searchTerm)
    )
  })

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
    </main>
  )
}

export default ReceiptHistory
