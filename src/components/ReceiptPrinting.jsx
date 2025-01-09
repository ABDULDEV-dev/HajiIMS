"use client"

import { useRef, useState, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Printer, FileText, ShoppingBag } from "lucide-react"

function ReceiptPrinting({ currentSale, setCurrentPage, sales, companyInfo }) {
  const receiptRef = useRef()
  const [showBuyingPrice, setShowBuyingPrice] = useState(false)
  const [receiptItems, setReceiptItems] = useState([])
  const [selectedSale, setSelectedSale] = useState(currentSale || null)
  const [isMultiItemSale, setIsMultiItemSale] = useState(false)

  useEffect(() => {
    // If currentSale is provided, use it as the selected sale
    if (currentSale) {
      setSelectedSale(currentSale)

      // Check if this is a new format multi-item sale (with cartItems array)
      if (currentSale.cartItems && Array.isArray(currentSale.cartItems)) {
        setIsMultiItemSale(true)
        setReceiptItems(currentSale.cartItems)
      } else {
        // Handle legacy format - check if there are related sales with the same ID
        if (sales) {
          const related = sales.filter((sale) => sale.id === currentSale.id)
          setReceiptItems(related)
          setIsMultiItemSale(related.length > 1)
        } else {
          setReceiptItems([currentSale])
          setIsMultiItemSale(false)
        }
      }
    }
  }, [currentSale, sales])

  const handlePrint = () => {
    if (receiptRef.current) {
      const originalContents = document.body.innerHTML
      const printContents = receiptRef.current.innerHTML

      document.body.innerHTML = printContents
      window.print()
      document.body.innerHTML = originalContents

      // Reload the page after printing to restore the React app
      window.location.reload()
    } else {
      window.print()
    }
  }

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0"
    const parts = num.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
  }

  // Calculate totals for all items in the sale
  const calculateTotals = () => {
    if (!receiptItems.length)
      return {
        subtotal: 0,
        totalWithTax: 0,
        totalBuyingAmount: 0,
        profit: 0,
        profitMargin: 0,
        discount: 0,
        discountAmount: 0,
        finalTotal: 0,
      }

    // If this is a new format sale with totalAmount already calculated
    if (isMultiItemSale && selectedSale.totalAmount !== undefined) {
      const subtotal = receiptItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const totalBuyingAmount = receiptItems.reduce((sum, item) => sum + (item.buyingPrice || 0) * item.quantity, 0)
      const discount = selectedSale.discountAmount || 0
      const finalTotal = selectedSale.totalAmount
      const profit = finalTotal - totalBuyingAmount
      const profitMargin = finalTotal > 0 ? (profit / finalTotal) * 100 : 0

      return {
        subtotal,
        totalWithTax: finalTotal, // No tax added
        totalBuyingAmount,
        profit,
        profitMargin,
        discount: selectedSale.discount || 0,
        discountAmount: discount,
        finalTotal,
      }
    } else {
      // Legacy calculation for old format sales
      const subtotal = receiptItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const totalWithTax = subtotal // No tax added
      const totalBuyingAmount = receiptItems.reduce((sum, item) => sum + (item.buyingPrice || 0) * item.quantity, 0)
      const profit = subtotal - totalBuyingAmount
      const profitMargin = subtotal > 0 ? (profit / subtotal) * 100 : 0
      const discount = receiptItems[0]?.discount || 0
      const discountAmount = discount > 0 ? (subtotal * discount) / 100 : 0
      const finalTotal = subtotal - discountAmount

      return {
        subtotal,
        totalWithTax,
        totalBuyingAmount,
        profit,
        profitMargin,
        discount,
        discountAmount,
        finalTotal,
      }
    }
  }

  const totals = calculateTotals()

  // Generate invoice number based on sale ID
  const invoiceNumber = selectedSale ? `INV-${selectedSale.id.toString().slice(-6)}` : "INV-000000"

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
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

  // If no sales are available, show a list of sales to select from
  const handleSelectSale = (sale) => {
    setSelectedSale(sale)
  }

  if (!selectedSale && sales && sales.length > 0) {
    return (
      <main className="receipt-printing">
        <BackToHomeButtom setCurrentPage={setCurrentPage} />
        <h2>Select a Sale to Print Receipt</h2>
        <div className="sales-list">
          {sales.slice(0, 10).map((sale) => {
            // Check if this is a multi-item sale with cartItems
            const isMultiItem = sale.cartItems && Array.isArray(sale.cartItems) && sale.cartItems.length > 0
            const itemCount = isMultiItem ? sale.cartItems.length : 1
            const totalAmount = isMultiItem ? sale.totalAmount : sale.price * sale.quantity

            return (
              <div
                key={`${sale.id}-${isMultiItem ? "multi" : sale.productName}`}
                className="sale-item"
                onClick={() => handleSelectSale(sale)}
              >
                <div className="sale-details">
                  <h4>
                    {sale.customerName} -{" "}
                    {isMultiItem ? (
                      <span>
                        <ShoppingBag size={16} className="inline-icon" /> {itemCount} items
                      </span>
                    ) : (
                      sale.productName
                    )}
                  </h4>
                  <p>
                    Date: {sale.date} | Amount: ₦{formatNumber(totalAmount.toFixed(2))}
                  </p>
                </div>
                <button className="select-button">
                  <FileText className="button-icon-small" />
                  Select
                </button>
              </div>
            )
          })}
        </div>
      </main>
    )
  }

  // If no sales at all
  if (!selectedSale && (!sales || sales.length === 0)) {
    return (
      <main className="receipt-printing">
        <BackToHomeButtom setCurrentPage={setCurrentPage} />
        <div className="no-receipt">
          <h2>No Sales Available</h2>
          <p>There are no sales records to print receipts for.</p>
          <button onClick={() => setCurrentPage("sales")} className="action-button">
            Go to Sales
          </button>
        </div>
      </main>
    )
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
              <img src={companyInfo?.image || "/placeholder.svg"} alt="Store Logo" />
            </div>
            <div className="store-info">
              <h2>{companyInfo?.name || "Inventory Management System"}</h2>
              <p>{companyInfo?.address || "123 Business Street, City"}</p>
              <p>Phone: {companyInfo?.phone || "(123) 456-7890"}</p>
              <p>Email: {companyInfo?.email || "contact@example.com"}</p>
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
                <strong>Date:</strong> {formatDate(selectedSale?.date)}
              </p>
              <p>
                <strong>Payment:</strong> {selectedSale?.paymentType === "paid" ? "Paid" : "Credit (Debt)"}
              </p>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="customer-details">
            <h4>Customer Information</h4>
            <div className="customer-info-grid">
              <div className="customer-info-item">
                <p>
                  <strong>Name:</strong> {selectedSale?.customerName || "Walk-in Customer"}
                </p>
              </div>
              <div className="customer-info-item">
                <p>
                  <strong>Phone:</strong> {selectedSale?.phoneNumber || "N/A"}
                </p>
              </div>
              <div className="customer-info-item">
                <p>
                  <strong>Address:</strong> {selectedSale?.address || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-items">
            <h4>Purchase Details {isMultiItemSale ? `(${receiptItems.length} items)` : ""}</h4>
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
                {receiptItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productName}</td>
                    <td>{formatNumber(item.quantity)}</td>
                    <td>
                      {item.originalPrice && item.originalPrice > item.price ? (
                        <>
                          <span className="original-price">₦{formatNumber(item.originalPrice.toFixed(2))}</span>
                          <br />
                          <span>₦{formatNumber(item.price.toFixed(2))}</span>
                        </>
                      ) : (
                        <>₦{formatNumber(item.price.toFixed(2))}</>
                      )}
                    </td>
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

            {totals.discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Discount {totals.discount > 0 ? `(${totals.discount}%)` : ""}:</span>
                <span>-₦{formatNumber(totals.discountAmount.toFixed(2))}</span>
              </div>
            )}

            <div className="summary-row total">
              <span>Total:</span>
              <span>₦{formatNumber(totals.finalTotal.toFixed(2))}</span>
            </div>

            {selectedSale?.paymentType === "debt" && (
              <div className="payment-info">
                {selectedSale.initialDeposit > 0 && (
                  <div className="summary-row deposit">
                    <span>Initial Deposit:</span>
                    <span>₦{formatNumber(selectedSale.initialDeposit.toFixed(2))}</span>
                  </div>
                )}
                <div className="summary-row remaining">
                  <span>Balance Due:</span>
                  <span>₦{formatNumber((totals.finalTotal - (selectedSale.initialDeposit || 0)).toFixed(2))}</span>
                </div>
              </div>
            )}

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
