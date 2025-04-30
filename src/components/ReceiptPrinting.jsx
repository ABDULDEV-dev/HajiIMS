"use client"

import { useRef, useState, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Printer } from "lucide-react"

function ReceiptPrinting({ currentSale, setCurrentPage, sales }) {
  const receiptRef = useRef()
  const [showBuyingPrice, setShowBuyingPrice] = useState(false)
  const [relatedSales, setRelatedSales] = useState([])

  useEffect(() => {
    // If this is a multi-item sale, find all related sales with the same ID
    if (currentSale && currentSale.multiItemSale && sales) {
      const related = sales.filter((sale) => sale.id === currentSale.id)
      setRelatedSales(related)
    } else if (currentSale) {
      setRelatedSales([currentSale])
    }
  }, [currentSale, sales])

  // Add a check to handle if currentSale is null or undefined
  if (!currentSale) {
    return (
      <main className="receipt-printing">
        <BackToHomeButtom setCurrentPage={setCurrentPage} />
        <div className="no-receipt">
          <h2>No Receipt Selected</h2>
          <p>Please select a sale to print a receipt.</p>
          <button onClick={() => setCurrentPage("receipt-history")} className="action-button">
            Go to Receipt History
          </button>
        </div>
      </main>
    )
  }

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML
    const originalContent = document.body.innerHTML
    document.body.innerHTML = printContent
    window.print()
    document.body.innerHTML = originalContent
    // Reattach event handlers after printing
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const formatNumber = (num) => {
    const parts = num.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
  }

  // Calculate totals for all items in the sale
  const calculateTotals = () => {
    const subtotal = relatedSales.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const taxRate = 0.075
    const taxAmount = subtotal * taxRate
    const totalWithTax = subtotal + taxAmount

    const totalBuyingAmount = relatedSales.reduce((sum, item) => sum + (item.buyingPrice || 0) * item.quantity, 0)
    const profit = subtotal - totalBuyingAmount
    const profitMargin = subtotal > 0 ? (profit / subtotal) * 100 : 0

    return {
      subtotal,
      taxRate,
      taxAmount,
      totalWithTax,
      totalBuyingAmount,
      profit,
      profitMargin,
    }
  }

  const totals = calculateTotals()

  // Generate invoice number based on sale ID
  const invoiceNumber = `INV-${currentSale.id.toString().slice(-6)}`

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="receipt-printing">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />

      <div className="receipt-actions">
        <button onClick={() => setShowBuyingPrice(!showBuyingPrice)} className="toggle-button">
          {showBuyingPrice ? "Hide Cost Info" : "Show Cost Info"}
        </button>
        <button onClick={handlePrint} className="print-button">
          <Printer className="button-icon" />
          Print Receipt
        </button>
      </div>

      <div className="receipt-container">
        <div ref={receiptRef} className="receipt-content">
          <div className="receipt-header">
            <div className="store-logo">
              <img src="/placeholder.svg" alt="Store Logo" />
            </div>
            <div className="store-info">
              <h2>Inventory Management System</h2>
              <p>123 Business Street, City</p>
              <p>Phone: (123) 456-7890</p>
              <p>Email: contact@example.com</p>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-invoice-details">
            <div className="invoice-number">
              <h3>RECEIPT</h3>
              <p>
                <strong>Invoice #:</strong> {invoiceNumber}
              </p>
            </div>
            <div className="invoice-date">
              <p>
                <strong>Date:</strong> {formatDate(currentSale.date)}
              </p>
              <p>
                <strong>Payment:</strong> {currentSale.paymentType === "paid" ? "Paid" : "Credit (Debt)"}
              </p>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="customer-details">
            <h4>Customer Information</h4>
            <div className="customer-info-grid">
              <div className="customer-info-item">
                <p>
                  <strong>Name:</strong> {currentSale.customerName}
                </p>
              </div>
              <div className="customer-info-item">
                <p>
                  <strong>Phone:</strong> {currentSale.phoneNumber}
                </p>
              </div>
              <div className="customer-info-item">
                <p>
                  <strong>Address:</strong> {currentSale.address}
                </p>
              </div>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-items">
            <h4>Purchase Details</h4>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {relatedSales.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productName}</td>
                    <td>{formatNumber(item.quantity)}</td>
                    <td>₦{formatNumber(item.price.toFixed(2))}</td>
                    <td>₦{formatNumber((item.price * item.quantity).toFixed(2))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="receipt-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₦{formatNumber(totals.subtotal.toFixed(2))}</span>
            </div>
            <div className="summary-row">
              <span>VAT ({(totals.taxRate * 100).toFixed(1)}%):</span>
              <span>₦{formatNumber(totals.taxAmount.toFixed(2))}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₦{formatNumber(totals.totalWithTax.toFixed(2))}</span>
            </div>

            {showBuyingPrice && (
              <div className="profit-info">
                <div className="summary-row">
                  <span>Cost Price:</span>
                  <span>₦{formatNumber(totals.totalBuyingAmount.toFixed(2))}</span>
                </div>
                <div className="summary-row">
                  <span>Profit:</span>
                  <span className={totals.profit > 0 ? "profit-positive" : "profit-negative"}>
                    ₦{formatNumber(totals.profit.toFixed(2))} ({totals.profitMargin.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-footer">
            <p className="thank-you">Thank you for your business!</p>
            <p className="receipt-policy">Return Policy: Items can be returned within 7 days with receipt.</p>
            <div className="receipt-barcode">
              <p>*{invoiceNumber}*</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ReceiptPrinting
