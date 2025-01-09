"use client"

import { useState } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Search, ShoppingCart, Plus, Trash2 } from "lucide-react"

function SalesForm({ inventory, addSale, sales, setCurrentPage }) {
  const [showForm, setShowForm] = useState(false)
  const [showSalesHistory, setShowSalesHistory] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState([])
  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    address: "",
    phoneNumber: "",
    paymentType: "paid", // "paid" or "debt"
  })
  const [currentProduct, setCurrentProduct] = useState({
    product: "",
    quantity: "",
  })

  const [discount, setDiscount] = useState(0) // Now represents amount instead of percentage
  const [initialDeposit, setInitialDeposit] = useState("")

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target
    setCustomerInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleProductChange = (e) => {
    const { name, value } = e.target
    setCurrentProduct((prev) => ({ ...prev, [name]: value }))
  }

  const handleDiscountChange = (e) => {
    const value = Number.parseFloat(e.target.value)
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (isNaN(value)) {
      setDiscount(0)
    } else if (value > cartTotal) {
      setDiscount(cartTotal) // Can't discount more than total
    } else if (value < 0) {
      setDiscount(0)
    } else {
      setDiscount(value)
    }
  }

  const handleInitialDepositChange = (e) => {
    const value = e.target.value
    setInitialDeposit(value)
  }

  const addToCart = () => {
    if (!currentProduct.product || !currentProduct.quantity) {
      alert("Please select a product and quantity")
      return
    }

    const selectedProduct = inventory.find((item) => item.id === Number(currentProduct.product))
    if (!selectedProduct) {
      alert("Invalid product selection")
      return
    }

    const quantity = Number(currentProduct.quantity)
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity")
      return
    }

    // Check if there's enough inventory
    if (quantity > selectedProduct.quantity) {
      alert(`Not enough inventory. Only ${selectedProduct.quantity} available.`)
      return
    }

    // Check if product is already in cart
    const existingProductIndex = cart.findIndex((item) => item.productId === Number(currentProduct.product))

    if (existingProductIndex >= 0) {
      // Update quantity if product already in cart
      const updatedCart = [...cart]
      const totalQuantity = updatedCart[existingProductIndex].quantity + quantity

      // Check if total quantity exceeds available inventory
      if (totalQuantity > selectedProduct.quantity) {
        alert(`Cannot add more. Total would exceed available inventory of ${selectedProduct.quantity}.`)
        return
      }

      updatedCart[existingProductIndex].quantity = totalQuantity
      setCart(updatedCart)
    } else {
      // Add new product to cart
      setCart([
        ...cart,
        {
          productId: Number(currentProduct.product),
          productName: selectedProduct.name,
          price: selectedProduct.price,
          buyingPrice: selectedProduct.buyingPrice || 0,
          quantity: quantity,
        },
      ])
    }

    // Reset current product selection
    setCurrentProduct({
      product: "",
      quantity: "",
    })
  }

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (cart.length === 0) {
      alert("Please add at least one product to the cart")
      return
    }

    // Create a single sale transaction with all cart items
    const currentDate = new Date().toISOString().split("T")[0]
    const saleId = Date.now()

    // Calculate totals for the entire cart
    const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalWithDiscount = cartSubtotal - discount
    const totalProfit = cart.reduce((sum, item) => sum + (item.price - item.buyingPrice) * item.quantity, 0) - discount

    // Create a comprehensive sale record that includes all cart items
    const saleRecord = {
      ...customerInfo,
      id: saleId,
      date: currentDate,
      cartItems: cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        buyingPrice: item.buyingPrice,
        quantity: item.quantity,
        itemTotal: item.price * item.quantity,
      })),
      // For backward compatibility, use the first item's details as primary
      product: cart[0].productId,
      productName: cart.length === 1 ? cart[0].productName : `${cart.length} items`,
      price: totalWithDiscount / cart.reduce((sum, item) => sum + item.quantity, 0), // Average price per unit
      originalPrice: cartSubtotal / cart.reduce((sum, item) => sum + item.quantity, 0),
      buyingPrice:
        cart.reduce((sum, item) => sum + item.buyingPrice * item.quantity, 0) /
        cart.reduce((sum, item) => sum + item.quantity, 0),
      quantity: cart.reduce((sum, item) => sum + item.quantity, 0), // Total quantity
      subtotal: cartSubtotal,
      discountAmount: discount,
      totalAmount: totalWithDiscount,
      totalProfit: totalProfit,
      isMultiItem: cart.length > 1,
      itemCount: cart.length,
      initialDeposit: customerInfo.paymentType === "debt" ? Number.parseFloat(initialDeposit) || 0 : 0,
    }

    // Add the single comprehensive sale record
    addSale(saleRecord)

    // Reset form
    setCustomerInfo({
      customerName: "",
      address: "",
      phoneNumber: "",
      paymentType: "paid",
    })
    setCart([])
    setShowForm(false)
    setDiscount(0)
    setInitialDeposit("")

    alert(`Sale completed successfully! ${cart.length} item(s) sold for ₦${formatNumber(totalWithDiscount.toFixed(2))}`)
  }

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return subtotal - discount // Direct subtraction of discount amount
  }

  const calculateProfit = () => {
    const profit = cart.reduce((sum, item) => sum + (item.price - item.buyingPrice) * item.quantity, 0)
    return profit - discount // Subtract discount from profit
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

  // Calculate total sales and profit
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0)
  const totalProfit = filteredSales.reduce((sum, sale) => {
    const profit = (sale.price - (sale.buyingPrice || 0)) * sale.quantity
    return sum + profit
  }, 0)

  // Sales Card Component for mobile view
  const SalesCard = ({ sale, total, profit, profitMargin, formatNumber }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const toggleExpanded = () => {
      setIsExpanded(!isExpanded)
    }

    return (
      <div
        className={`sales-card ${sale.paymentType === "debt" ? "debt-card" : ""} ${isExpanded ? "expanded" : ""}`}
        onClick={toggleExpanded}
      >
        {/* Essential Info - Always Visible */}
        <div className="sales-card-header">
          <div className="sales-card-main">
            <div className="customer-info">
              <h4 className="customer-name">{sale.customerName || "Walk-in Customer"}</h4>
              <span className="sale-date">{sale.date}</span>
            </div>
            <div className="sale-amount">
              <span className="total-amount">₦{formatNumber(total.toFixed(2))}</span>
              <span className={`payment-status ${sale.paymentType}`}>
                {sale.paymentType === "paid" ? "Paid" : "Debt"}
              </span>
            </div>
          </div>

          <div className="sales-card-summary">
            <div className="product-summary">
              {sale.isMultiItem ? (
                <span className="multi-item-badge">{sale.itemCount} items</span>
              ) : (
                <span className="single-item">{sale.productName}</span>
              )}
              <span className="quantity-badge">Qty: {formatNumber(sale.quantity)}</span>
            </div>
            <div className="expand-indicator">
              <span className="expand-text">{isExpanded ? "Less" : "More"}</span>
              <div className={`expand-arrow ${isExpanded ? "rotated" : ""}`}>▼</div>
            </div>
          </div>
        </div>

        {/* Detailed Info - Expandable */}
        <div className={`sales-card-details ${isExpanded ? "visible" : ""}`}>
          {sale.isMultiItem && sale.cartItems ? (
            <div className="cart-items-section">
              <h5>Items Purchased:</h5>
              <div className="cart-items-list">
                {sale.cartItems.map((item, index) => (
                  <div key={index} className="cart-item-detail">
                    <span className="item-name">{item.productName}</span>
                    <span className="item-details">
                      {item.quantity} × ₦{formatNumber(item.price.toFixed(2))} = ₦
                      {formatNumber(item.itemTotal.toFixed(2))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="single-item-details">
              <div className="detail-row">
                <span className="detail-label">Product:</span>
                <span className="detail-value">{sale.productName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Unit Price:</span>
                <span className="detail-value">₦{formatNumber(sale.price.toFixed(2))}</span>
              </div>
            </div>
          )}

          <div className="financial-details">
            {sale.subtotal && sale.discountAmount > 0 && (
              <>
                <div className="detail-row">
                  <span className="detail-label">Subtotal:</span>
                  <span className="detail-value">₦{formatNumber(sale.subtotal.toFixed(2))}</span>
                </div>
                <div className="detail-row discount-row">
                  <span className="detail-label">Discount:</span>
                  <span className="detail-value discount-amount">-₦{formatNumber(sale.discountAmount.toFixed(2))}</span>
                </div>
              </>
            )}

            <div className="detail-row profit-row">
              <span className="detail-label">Profit:</span>
              <span className={`detail-value ${profit > 0 ? "profit-positive" : "profit-negative"}`}>
                ₦{formatNumber(profit.toFixed(2))} ({profitMargin.toFixed(1)}%)
              </span>
            </div>

            {sale.paymentType === "debt" && sale.initialDeposit > 0 && (
              <div className="detail-row">
                <span className="detail-label">Initial Deposit:</span>
                <span className="detail-value">₦{formatNumber(sale.initialDeposit.toFixed(2))}</span>
              </div>
            )}
          </div>

          <div className="customer-details">
            {sale.phoneNumber && (
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{sale.phoneNumber}</span>
              </div>
            )}
            {sale.address && (
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{sale.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="sales-page">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
      <h2>Sales Management</h2>

      <div className="sales-actions">
        <button onClick={() => setShowForm(!showForm)} className="action-button">
          {showForm ? "Hide Sales Form" : "New Sale"}
        </button>
        <button onClick={() => setShowSalesHistory(!showSalesHistory)} className="action-button">
          {showSalesHistory ? "Hide Sales History" : "Show Sales History"}
        </button>
      </div>

      {showForm && (
        <div className="sales-form">
          <h3>New Sale</h3>

          {/* Product Selection */}
          <div className="product-selection">
            <h4>Add Products</h4>
            <div className="product-selection-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product">Product</label>
                  <select id="product" name="product" value={currentProduct.product} onChange={handleProductChange}>
                    <option value="">Select a product</option>
                    {inventory.map((item) => {
                      const profit = item.price - (item.buyingPrice || 0)
                      const profitMargin = item.price > 0 ? (profit / item.price) * 100 : 0

                      return (
                        <option key={item.id} value={item.id}>
                          {item.name} - ₦{item.price} (Profit: {profitMargin.toFixed(1)}%, Available: {item.quantity})
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={currentProduct.quantity}
                    onChange={handleProductChange}
                  />
                </div>
                <button type="button" onClick={addToCart} className="add-to-cart-button">
                  <Plus className="button-icon-small" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Shopping Cart */}
          {cart.length > 0 && (
            <div className="shopping-cart">
              <h4>
                <ShoppingCart className="cart-icon" />
                Shopping Cart
              </h4>
              {/* Desktop Cart Table */}
              <div className="table-wrapper">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price (₦)</th>
                      <th>Quantity</th>
                      <th>Total (₦)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td>₦{formatNumber(item.price.toFixed(2))}</td>
                        <td>{item.quantity}</td>
                        <td>₦{formatNumber((item.price * item.quantity).toFixed(2))}</td>
                        <td>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="remove-button"
                            title="Remove from cart"
                          >
                            <Trash2 className="button-icon-small" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="cart-total">
                      <td colSpan="3">
                        <strong>Total</strong>
                      </td>
                      <td colSpan="2">
                        <strong>₦{formatNumber(calculateTotal().toFixed(2))}</strong>
                      </td>
                    </tr>
                    <tr className="cart-profit">
                      <td colSpan="3">
                        <strong>Estimated Profit</strong>
                      </td>
                      <td colSpan="2">
                        <strong className="profit-value">₦{formatNumber(calculateProfit().toFixed(2))}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Cart Cards */}
              <div className="mobile-cards">
                <div className="cart-cards">
                  {cart.map((item, index) => (
                    <div key={index} className="cart-card">
                      <div className="cart-card-header">
                        <span className="cart-card-title">{item.productName}</span>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="cart-card-remove"
                          title="Remove from cart"
                        >
                          <Trash2 className="button-icon-small" />
                        </button>
                      </div>
                      <div className="cart-card-details">
                        <div className="cart-card-detail">
                          <div className="cart-card-detail-label">Price</div>
                          <div className="cart-card-detail-value">₦{formatNumber(item.price.toFixed(2))}</div>
                        </div>
                        <div className="cart-card-detail">
                          <div className="cart-card-detail-label">Qty</div>
                          <div className="cart-card-detail-value">{item.quantity}</div>
                        </div>
                        <div className="cart-card-detail">
                          <div className="cart-card-detail-label">Total</div>
                          <div className="cart-card-detail-value">
                            ₦{formatNumber((item.price * item.quantity).toFixed(2))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Mobile Cart Summary */}
                  <div className="cart-card" style={{ backgroundColor: "#fff8f0", border: "2px solid #ff8c00" }}>
                    <div className="cart-card-details">
                      <div className="cart-card-detail">
                        <div className="cart-card-detail-label">Cart Total</div>
                        <div className="cart-card-detail-value" style={{ color: "#ff8c00", fontWeight: "bold" }}>
                          ₦{formatNumber(calculateTotal().toFixed(2))}
                        </div>
                      </div>
                      <div className="cart-card-detail">
                        <div className="cart-card-detail-label">Est. Profit</div>
                        <div className="cart-card-detail-value profit-positive">
                          ₦{formatNumber(calculateProfit().toFixed(2))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="discount-section">
                <div className="discount-input">
                  <label htmlFor="discount">Discount Amount (₦)</label>
                  <input
                    id="discount"
                    type="number"
                    min="0"
                    max={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                    step="0.01"
                    value={discount}
                    onChange={handleDiscountChange}
                    className="discount-field"
                    placeholder="0.00"
                  />
                  <span className="discount-limit">
                    Max: ₦{formatNumber(cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2))}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="discount-summary">
                    <p>
                      Subtotal: ₦
                      {formatNumber(cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2))}
                    </p>
                    <p>Discount: -₦{formatNumber(discount.toFixed(2))}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="customer-form">
            <h4>Customer Information</h4>
            <div className="form-group">
              <label htmlFor="customerName">Customer Name</label>
              <input
                id="customerName"
                name="customerName"
                value={customerInfo.customerName}
                onChange={handleCustomerInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input id="address" name="address" value={customerInfo.address} onChange={handleCustomerInfoChange} />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                value={customerInfo.phoneNumber}
                onChange={handleCustomerInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentType">Payment Type</label>
              <select
                id="paymentType"
                name="paymentType"
                value={customerInfo.paymentType}
                onChange={handleCustomerInfoChange}
                required
              >
                <option value="paid">Paid</option>
                <option value="debt">Debt</option>
              </select>
            </div>
            {customerInfo.paymentType === "debt" && (
              <div className="form-group">
                <label htmlFor="initialDeposit">Initial Deposit (₦)</label>
                <input
                  id="initialDeposit"
                  name="initialDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={initialDeposit}
                  onChange={handleInitialDepositChange}
                  placeholder="0.00"
                />
                <small className="deposit-note">Leave empty for no initial deposit</small>
              </div>
            )}

            <button type="submit" className="complete-sale-button" disabled={cart.length === 0}>
              Complete Sale
            </button>
          </form>
        </div>
      )}

      {showSalesHistory && (
        <div className="sales-history">
          <h3>Sales History</h3>
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

          {/* Mobile Sales Cards */}
          <div className="mobile-sales-cards">
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => {
                const total = sale.totalAmount || sale.price * sale.quantity
                const profit = sale.totalProfit || (sale.price - (sale.buyingPrice || 0)) * sale.quantity
                const profitMargin = sale.price > 0 ? ((sale.price - (sale.buyingPrice || 0)) / sale.price) * 100 : 0

                return (
                  <SalesCard
                    key={sale.id}
                    sale={sale}
                    total={total}
                    profit={profit}
                    profitMargin={profitMargin}
                    formatNumber={formatNumber}
                  />
                )
              })
            ) : (
              <div className="no-sales-message">
                <ShoppingCart className="no-sales-icon" />
                <p>No sales records found</p>
              </div>
            )}
          </div>

          {/* Desktop Table (hidden on mobile) */}
          <div className="desktop-sales-table">
            <div className="table-wrapper">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price (₦)</th>
                    <th>Total (₦)</th>
                    <th>Profit (₦)</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => {
                    const total = sale.totalAmount || sale.price * sale.quantity
                    const profit = sale.totalProfit || (sale.price - (sale.buyingPrice || 0)) * sale.quantity
                    const profitMargin =
                      sale.price > 0 ? ((sale.price - (sale.buyingPrice || 0)) / sale.price) * 100 : 0

                    return (
                      <tr key={sale.id} className={sale.paymentType === "debt" ? "debt-row" : ""}>
                        <td>{sale.date}</td>
                        <td>{sale.customerName}</td>
                        <td>{sale.productName}</td>
                        <td>{formatNumber(sale.quantity)}</td>
                        <td>₦{formatNumber(sale.price.toFixed(2))}</td>
                        <td>₦{formatNumber(total.toFixed(2))}</td>
                        <td className={profit > 0 ? "profit-positive" : "profit-negative"}>
                          ₦{formatNumber(profit.toFixed(2))}
                          <span className="profit-margin">({profitMargin.toFixed(1)}%)</span>
                        </td>
                        <td>
                          <span className={`payment-status ${sale.paymentType}`}>
                            {sale.paymentType === "paid" ? "Paid" : "Debt"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sales-summary">
            <div className="summary-item">
              <strong>Total Sales:</strong> ₦{formatNumber(totalSales.toFixed(2))}
            </div>
            <div className="summary-item">
              <strong>Total Profit:</strong>{" "}
              <span className={totalProfit > 0 ? "profit-positive" : "profit-negative"}>
                ₦{formatNumber(totalProfit.toFixed(2))}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default SalesForm
