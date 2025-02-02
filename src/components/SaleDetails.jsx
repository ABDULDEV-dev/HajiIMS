"use client"
import BackToHomeButtom from "./BackToHomeButtom"
import {
  ArrowLeft,
  User,
  Calendar,
  CreditCard,
  Package,
  MapPin,
  Phone,
  Printer,
  CheckCircle2,
  XCircle,
} from "lucide-react"

function SaleDetails({ sale, setCurrentPage, setCurrentSale }) {
  if (!sale) {
    return (
      <main className="sale-details">
        <BackToHomeButtom setCurrentPage={setCurrentPage} />
        <div className="no-sale-selected">
          <h2>No Sale Selected</h2>
          <p>Please select a sale from the history to view details.</p>
        </div>
      </main>
    )
  }

  const handlePrintReceipt = () => {
    setCurrentSale(sale)
    setCurrentPage("receipt-printing")
  }

  const handleBackToHistory = () => {
    setCurrentPage("receipt-history")
  }

  const formatNumber = (num) => {
    const parts = num.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Handle both single item and multi-item sales
  const items = sale.items || [sale]
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <main className="sale-details">
      <div className="sale-details-header">
        <button onClick={handleBackToHistory} className="back-button">
          <ArrowLeft className="button-icon" />
          Back to History
        </button>
        <div className="header-actions">
          <button onClick={handlePrintReceipt} className="print-button">
            <Printer className="button-icon" />
            Print Receipt
          </button>
        </div>
      </div>

      <div className="sale-details-content">
        {/* Sale Overview */}
        <div className="sale-overview-card">
          <div className="overview-header">
            <div className="sale-status">
              <span className={`status-badge large ${sale.paymentType}`}>
                {sale.paymentType === "paid" ? (
                  <CheckCircle2 className="status-icon" />
                ) : (
                  <XCircle className="status-icon" />
                )}
                {sale.paymentType === "paid" ? "Paid" : "Debt"}
              </span>
            </div>
            <div className="sale-amount-large">₦{formatNumber(totalAmount.toFixed(2))}</div>
          </div>
          <div className="overview-meta">
            <div className="meta-item">
              <Calendar className="meta-icon" />
              <span>
                {formatDate(sale.date)} at {formatTime(sale.date)}
              </span>
            </div>
            <div className="meta-item">
              <Package className="meta-icon" />
              <span>
                {items.length === 1 ? "1 item" : `${items.length} items`} • {formatNumber(totalQuantity)} total qty
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="detail-section">
          <div className="section-header">
            <User className="section-icon" />
            <h3>Customer Information</h3>
          </div>
          <div className="customer-details-card">
            <div className="customer-avatar-large">{sale.customerName.charAt(0).toUpperCase()}</div>
            <div className="customer-info-detailed">
              <h4 className="customer-name-large">{sale.customerName}</h4>
              <div className="customer-contact">
                {sale.phoneNumber && sale.phoneNumber !== "N/A" && (
                  <div className="contact-item">
                    <Phone className="contact-icon" />
                    <span>{sale.phoneNumber}</span>
                  </div>
                )}
                {sale.address && sale.address !== "N/A" && (
                  <div className="contact-item">
                    <MapPin className="contact-icon" />
                    <span>{sale.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items Purchased */}
        <div className="detail-section">
          <div className="section-header">
            <Package className="section-icon" />
            <h3>Items Purchased</h3>
          </div>
          <div className="items-list">
            {items.map((item, index) => (
              <div key={index} className="item-card">
                <div className="item-image-placeholder">
                  <Package className="item-icon" />
                </div>
                <div className="item-details">
                  <h4 className="item-name">{item.productName}</h4>
                  <div className="item-specs">
                    <span className="item-quantity">Qty: {formatNumber(item.quantity)}</span>
                    <span className="item-price">₦{formatNumber(item.price.toFixed(2))} each</span>
                  </div>
                </div>
                <div className="item-total">₦{formatNumber((item.price * item.quantity).toFixed(2))}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Information */}
        <div className="detail-section">
          <div className="section-header">
            <CreditCard className="section-icon" />
            <h3>Payment Information</h3>
          </div>
          <div className="payment-details-card">
            <div className="payment-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₦{formatNumber(totalAmount.toFixed(2))}</span>
              </div>
              {sale.discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount ({sale.discount}%):</span>
                  <span>-₦{formatNumber(((totalAmount * sale.discount) / 100).toFixed(2))}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total:</span>
                <span>₦{formatNumber(totalAmount.toFixed(2))}</span>
              </div>
              {sale.paymentType === "debt" && sale.initialDeposit > 0 && (
                <>
                  <div className="summary-row deposit">
                    <span>Initial Deposit:</span>
                    <span>₦{formatNumber(sale.initialDeposit.toFixed(2))}</span>
                  </div>
                  <div className="summary-row balance">
                    <span>Balance Due:</span>
                    <span>₦{formatNumber((totalAmount - sale.initialDeposit).toFixed(2))}</span>
                  </div>
                </>
              )}
            </div>
            <div className="payment-method">
              <div className="payment-type">
                <CreditCard className="payment-icon" />
                <span>{sale.paymentType === "paid" ? "Cash Payment" : "Credit Sale"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default SaleDetails
