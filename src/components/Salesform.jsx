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

  const [discount, setDiscount] = useState(0)
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
    // Ensure discount is between 0 and 10%
    if (isNaN(value)) {
      setDiscount(0)
    } else if (value > 10) {
      setDiscount(10)
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

    if (!customerInfo.customerName || !customerInfo.address || !customerInfo.phoneNumber) {
      alert("Please fill in all customer information")
      return
    }

    // Create a sale record for each product in the cart
    const currentDate = new Date().toISOString().split("T")[0]
    const saleId = Date.now() // Use the same ID for all products in this sale

    // Calculate total amount for the entire sale
    const totalAmount = calculateTotal()

    // Calculate the total with discount
    const totalWithDiscount = calculateTotal()

    // Process each item in the cart
    cart.forEach((item) => {
      // Apply the discount proportionally to each item
      const itemDiscount = discount > 0 ? (item.price * discount) / 100 : 0
      const discountedPrice = item.price - itemDiscount

      const saleRecord = {
        ...customerInfo,
        product: item.productId,
        productName: item.productName,
        price: discountedPrice,
        originalPrice: item.price,
        discount: discount,
        buyingPrice: item.buyingPrice,
        quantity: item.quantity,
        date: currentDate,
        id: saleId, // Same ID for all items in this sale
        multiItemSale: cart.length > 1, // Flag to indicate this is part of a multi-item sale
        totalSaleAmount: totalWithDiscount, // Store the total sale amount
        initialDeposit: customerInfo.paymentType === "debt" ? Number.parseFloat(initialDeposit) || 0 : 0,
      }

      addSale(saleRecord)
    })

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
  }

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discountAmount = subtotal * (discount / 100)
    return subtotal - discountAmount
  }

  const calculateProfit = () => {
    const profit = cart.reduce((sum, item) => sum + (item.price - item.buyingPrice) * item.quantity, 0)
    const discountAmount = profit * (discount / 100)
    return profit - discountAmount
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
              <div className="discount-section">
                <div className="discount-input">
                  <label htmlFor="discount">Discount (%)</label>
                  <input
                    id="discount"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={discount}
                    onChange={handleDiscountChange}
                    className="discount-field"
                  />
                  <span className="discount-limit">Max: 10%</span>
                </div>
                {discount > 0 && (
                  <div className="discount-summary">
                    <p>
                      Subtotal: ₦
                      {formatNumber(cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2))}
                    </p>
                    <p>
                      Discount ({discount}%): -₦
                      {formatNumber(
                        ((cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * discount) / 100).toFixed(2),
                      )}
                    </p>
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
              <input
                id="address"
                name="address"
                value={customerInfo.address}
                onChange={handleCustomerInfoChange}
                
              />
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
                  const total = sale.price * sale.quantity
                  const profit = (sale.price - (sale.buyingPrice || 0)) * sale.quantity
                  const profitMargin = sale.price > 0 ? ((sale.price - (sale.buyingPrice || 0)) / sale.price) * 100 : 0

                  return (
                    <tr
                      key={`${sale.id}-${sale.productId || sale.product}`}
                      className={sale.paymentType === "debt" ? "debt-row" : ""}
                    >
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
