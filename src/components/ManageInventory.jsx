"use client"

import { useState, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Search, Plus, Minus, Package2, Hash, Trash2, Edit, RefreshCw } from "lucide-react"
import ProfitMarginCalculator from "../components/ProfitMargingCalculator"

function ManageInventory({ inventory = [], updateQuantity, deleteProduct, updateProduct, setCurrentPage }) {
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

  // Handle applying suggested price from calculator
  const handleApplySuggestedPrice = (suggestedPrice) => {
    setEditingProduct((prev) => ({
      ...prev,
      price: suggestedPrice,
    }))
  }

  const formatNumber = (num) => {
    return Number.parseFloat(num)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
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

            {/* Add the profit margin calculator */}
            {editingProduct.buyingPrice && (
              <ProfitMarginCalculator
                buyingPrice={Number(editingProduct.buyingPrice)}
                onApplyPrice={handleApplySuggestedPrice}
              />
            )}

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

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>
                <Package2 className="table-icon" />
                Name
              </th>
              <th>
                <Hash className="table-icon" />
                Quantity
              </th>
              <th>Price (₦)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{Number(item.quantity) || 0}</td>
                <td>₦{formatNumber(item.price)}</td>
                <td className="action-buttons">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="icon-button decrease"
                    title="Decrease quantity"
                  >
                    <Minus className="button-icon-small" />
                  </button>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="icon-button increase"
                    title="Increase quantity"
                  >
                    <Plus className="button-icon-small" />
                  </button>
                  <button onClick={() => handleRestock(item)} className="icon-button restock" title="Restock">
                    <RefreshCw className="button-icon-small" />
                  </button>
                  <button onClick={() => handleEdit(item)} className="icon-button edit" title="Edit product">
                    <Edit className="button-icon-small" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="icon-button delete" title="Delete product">
                    <Trash2 className="button-icon-small" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default ManageInventory
