"use client"

import { useState, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Search, Plus, Minus, Trash2, Edit, RefreshCw } from "lucide-react"
import SwipeableCard from "./SwipeableCard"
import PullToRefresh from "./PullToRefresh"

function ManageInventory({
  inventory = [],
  updateQuantity,
  deleteProduct,
  updateProduct,
  setCurrentPage,
  setProductHistory,
  productHistory = [],
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState(null)
  const [restockProduct, setRestockProduct] = useState(null)
  const [restockQuantity, setRestockQuantity] = useState("")
  const [currentBalance, setCurrentBalance] = useState(0)

  // Load current financial balance
  useEffect(() => {
    const loadFinancialData = () => {
      const storedTransactions = localStorage.getItem("financialTransactions")
      if (storedTransactions) {
        const transactions = JSON.parse(storedTransactions)
        let totalIncome = 0
        let totalExpenses = 0

        transactions.forEach((transaction) => {
          if (transaction.type === "income") {
            totalIncome += Number(transaction.amount)
          } else if (transaction.type === "expense") {
            totalExpenses += Number(transaction.amount)
          }
        })

        setCurrentBalance(totalIncome - totalExpenses)
      }
    }

    loadFinancialData()

    // Set up event listener to update balance when financial data changes
    window.addEventListener("storage", (e) => {
      if (e.key === "financialTransactions") {
        loadFinancialData()
      }
    })

    return () => {
      window.removeEventListener("storage", (e) => {
        if (e.key === "financialTransactions") {
          loadFinancialData()
        }
      })
    }
  }, [])

  const filteredInventory = inventory.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower) ||
      String(item.price).includes(searchTerm) ||
      String(item.quantity).includes(searchTerm)
    )
  })

  const handlePageChange = (page) => {
    if (typeof setCurrentPage === "function") {
      setCurrentPage(page)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct({ ...product })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target

    if (name === "price" || name === "buyingPrice" || name === "quantity") {
      // Ensure only two decimal places for price and buyingPrice
      const formattedValue =
        name === "quantity"
          ? Math.floor(Number(value)) // No decimals for quantity
          : Number.parseFloat(Number.parseFloat(value).toFixed(2)) // Two decimals for prices

      setEditingProduct((prev) => ({
        ...prev,
        [name]: isNaN(formattedValue) ? "" : formattedValue,
      }))
    } else {
      setEditingProduct((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()

    // Validate that selling price is greater than buying price
    if (Number(editingProduct.price) <= Number(editingProduct.buyingPrice)) {
      alert("Selling price must be greater than buying price")
      return
    }

    updateProduct(editingProduct)
    setEditingProduct(null)
  }

  const handleRestock = (product) => {
    setRestockProduct(product)
    setRestockQuantity("")
  }

  const handleRestockSubmit = (e) => {
    e.preventDefault()
    const quantity = Number.parseInt(restockQuantity)
    if (!isNaN(quantity) && quantity > 0) {
      // Calculate the total cost of restocking
      const totalCost = quantity * restockProduct.buyingPrice

      // Check if there's enough balance for the restock
      if (totalCost > currentBalance) {
        alert(
          `Insufficient balance. Current balance: ₦${formatNumber(currentBalance)}, Required: ₦${formatNumber(totalCost)}`,
        )
        return
      }

      // Create an expense transaction for the restock
      const restockTransaction = {
        type: "expense",
        category: restockProduct.category || "inventory",
        amount: totalCost,
        date: new Date().toISOString().split("T")[0],
        description: `Restock of ${quantity} ${restockProduct.name}`,
        paymentMethod: "cash",
        reference: `RESTOCK-${Date.now()}`,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        relatedProducts: [restockProduct.id],
      }

      // Save the transaction to localStorage
      const storedTransactions = localStorage.getItem("financialTransactions")
      const transactions = storedTransactions ? JSON.parse(storedTransactions) : []
      transactions.push(restockTransaction)
      localStorage.setItem("financialTransactions", JSON.stringify(transactions))

      // Add to product history
      const historyEntry = {
        id: Date.now() + 1,
        productId: restockProduct.id,
        productName: restockProduct.name,
        type: "restock",
        date: new Date().toISOString().split("T")[0],
        description: `Restocked ${quantity} units`,
        quantity: quantity,
        amount: totalCost,
        details: {
          unitCost: restockProduct.buyingPrice,
          totalCost: totalCost,
        },
      }

      // Update product history
      if (setProductHistory) {
        setProductHistory((prev) => [...prev, historyEntry])
      }

      // Update local balance
      setCurrentBalance(currentBalance - totalCost)

      // Update the inventory quantity
      updateQuantity(restockProduct.id, quantity)
      setRestockProduct(null)
      setRestockQuantity("")

      // Show confirmation message
      alert(
        `Successfully restocked ${quantity} units of ${restockProduct.name}. An expense of ₦${formatNumber(totalCost)} has been recorded and deducted from your balance.`,
      )
    }
  }

  const formatNumber = (num) => {
    return Number.parseFloat(num)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Handle refresh
  const handleRefresh = async () => {
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Reload financial data
    const storedTransactions = localStorage.getItem("financialTransactions")
    if (storedTransactions) {
      const transactions = JSON.parse(storedTransactions)
      let totalIncome = 0
      let totalExpenses = 0

      transactions.forEach((transaction) => {
        if (transaction.type === "income") {
          totalIncome += Number(transaction.amount)
        } else if (transaction.type === "expense") {
          totalExpenses += Number(transaction.amount)
        }
      })

      setCurrentBalance(totalIncome - totalExpenses)
    }
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <main className="manage-inventory">
        <BackToHomeButtom setCurrentPage={setCurrentPage} />
        <h2>Manage Inventory</h2>

        <div className="financial-summary">
          <div className="summary-card">
            <h3>Available Balance</h3>
            <p className={`summary-value ${currentBalance >= 0 ? "positive" : "negative"}`}>
              ₦{formatNumber(currentBalance)}
            </p>
          </div>
        </div>

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

        {editingProduct && (
          <div className="edit-product-form">
            <h3>Edit Product</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input id="name" name="name" value={editingProduct.name} onChange={handleEditChange} required />
              </div>
              <div className="price-fields">
                <div className="price-field">
                  <label htmlFor="buyingPrice">Buying Price (₦)</label>
                  <input
                    id="buyingPrice"
                    name="buyingPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.buyingPrice}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="price-field">
                  <label htmlFor="price">Selling Price (₦)</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.price}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={editingProduct.category}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="shoes">Shoes</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={editingProduct.quantity}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="success-button">
                  Save Changes
                </button>
                <button type="button" className="cancel-button" onClick={() => setEditingProduct(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {restockProduct && (
          <div className="restock-popup-overlay">
            <div className="restock-popup">
              <h3>Restock {restockProduct.name}</h3>
              <form onSubmit={handleRestockSubmit}>
                <div className="form-group">
                  <label htmlFor="restockQuantity">Add Quantity</label>
                  <input
                    id="restockQuantity"
                    type="number"
                    min="1"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <p>Current Quantity: {restockProduct.quantity}</p>
                  <p>New Quantity: {restockProduct.quantity + (Number.parseInt(restockQuantity) || 0)}</p>
                  {restockQuantity && (
                    <>
                      <p className="expense-preview">
                        Expense Amount: ₦
                        {formatNumber(restockProduct.buyingPrice * (Number.parseInt(restockQuantity) || 0))}
                      </p>
                      <p className="balance-preview">Current Balance: ₦{formatNumber(currentBalance)}</p>
                      <p className="balance-after-preview">
                        Balance After Restock: ₦
                        {formatNumber(
                          currentBalance - restockProduct.buyingPrice * (Number.parseInt(restockQuantity) || 0),
                        )}
                      </p>
                      {currentBalance < restockProduct.buyingPrice * (Number.parseInt(restockQuantity) || 0) && (
                        <p className="insufficient-balance-warning">Warning: Insufficient balance for this restock!</p>
                      )}
                    </>
                  )}
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="success-button"
                    disabled={
                      restockQuantity &&
                      currentBalance < restockProduct.buyingPrice * (Number.parseInt(restockQuantity) || 0)
                    }
                  >
                    Restock
                  </button>
                  <button type="button" className="cancel-button" onClick={() => setRestockProduct(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Cards */}
        <div className="inventory-cards">
          {filteredInventory.map((item) => {
            const productHistoryEntries = productHistory.filter((entry) => entry.productId === item.id)

            return (
              <SwipeableCard
                key={item.id}
                leftActions={[
                  {
                    icon: <Trash2 className="button-icon-small" />,
                    label: "Delete",
                    type: "danger",
                    onClick: () => handleDelete(item.id),
                  },
                ]}
                rightActions={[
                  {
                    icon: <Edit className="button-icon-small" />,
                    label: "Edit",
                    type: "secondary",
                    onClick: () => handleEdit(item),
                  },
                  {
                    icon: <RefreshCw className="button-icon-small" />,
                    label: "Restock",
                    type: "success",
                    onClick: () => handleRestock(item),
                  },
                ]}
                className="manage-inventory-card"
              >
                <div className="card-header">
                  <div className="card-title-section">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="card-product-image" />
                    <div className="card-title-info">
                      <h3 className="card-title">{item.name}</h3>
                      <span className="card-category">{item.category}</span>
                    </div>
                  </div>
                  <div className="card-price-section">
                    <div className="card-price">₦{formatNumber(item.price)}</div>
                    <div className="card-stock">Stock: {Number(item.quantity) || 0}</div>
                  </div>
                </div>

                <div className="card-details">
                  <div className="detail-grid">
                    <div className="card-detail">
                      <span className="card-detail-label">Buying Price</span>
                      <span className="card-detail-value">₦{formatNumber(item.buyingPrice || 0)}</span>
                    </div>
                    <div className="card-detail">
                      <span className="card-detail-label">Total Value</span>
                      <span className="card-detail-value">
                        ₦{formatNumber((item.price * item.quantity).toFixed(2))}
                      </span>
                    </div>
                    <div className="card-detail">
                      <span className="card-detail-label">History Entries</span>
                      <span className="card-detail-value">{productHistoryEntries.length}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="card-action-button secondary"
                    title="Decrease quantity"
                  >
                    <Minus className="button-icon-small" />
                    Remove
                  </button>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="card-action-button primary"
                    title="Increase quantity"
                  >
                    <Plus className="button-icon-small" />
                    Add
                  </button>
                </div>
              </SwipeableCard>
            )
          })}
        </div>
      </main>
    </PullToRefresh>
  )
}

export default ManageInventory
