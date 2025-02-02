"use client"

import { useState, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import {
  Plus,
  Minus,
  Search,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  TrendingUp,
  ShoppingCart,
  Package2,
} from "lucide-react"

function FinancialManagement({ setCurrentPage, inventory, sales = [], updateFinancialRecords }) {
  const [transactions, setTransactions] = useState([])
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterDateRange, setFilterDateRange] = useState({ start: "", end: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    type: "income",
    category: "",
    amount: "",
    formattedAmount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    paymentMethod: "cash",
    reference: "",
    relatedSales: [], // To store related sales IDs
    relatedProducts: [], // To store related product IDs
  })
  const [salesSummary, setSalesSummary] = useState([])
  const [showSalesSummary, setShowSalesSummary] = useState(false)
  const [openingBalance, setOpeningBalance] = useState(0)
  const [showOpeningBalanceForm, setShowOpeningBalanceForm] = useState(false)

  // Load transactions from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem("financialTransactions")
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    }
  }, [])

  // Process sales data to create a summary of sales by date
  useEffect(() => {
    if (sales && sales.length > 0) {
      // Group sales by transaction ID (for multi-product sales)
      const salesByTransaction = sales.reduce((acc, sale) => {
        if (!acc[sale.id]) {
          acc[sale.id] = {
            id: sale.id,
            date: sale.date,
            customerName: sale.customerName || "Walk-in Customer",
            items: [],
            totalAmount: 0,
            totalProfit: 0,
            paymentType: sale.paymentType,
          }
        }

        const saleTotal = sale.price * sale.quantity
        const saleProfit = (sale.price - (sale.buyingPrice || 0)) * sale.quantity

        acc[sale.id].items.push(sale)
        acc[sale.id].totalAmount += saleTotal
        acc[sale.id].totalProfit += saleProfit

        return acc
      }, {})

      // Convert to array and sort by date (newest first)
      const salesSummaryArray = Object.values(salesByTransaction).sort((a, b) => new Date(b.date) - new Date(a.date))

      setSalesSummary(salesSummaryArray)

      // Check if there are any sales that don't have corresponding financial transactions
      const saleIds = new Set(salesSummaryArray.map((sale) => sale.id.toString()))
      const transactionSaleIds = new Set(
        transactions
          .filter((t) => t.relatedSales && t.relatedSales.length > 0)
          .flatMap((t) => t.relatedSales.map(String)),
      )

      // Find sales that don't have corresponding financial transactions
      const missingSales = [...saleIds].filter((id) => !transactionSaleIds.has(id))

      // If there are missing sales, create financial transactions for them
      // But only for paid sales, not for debt sales
      if (missingSales.length > 0) {
        const newTransactions = missingSales
          .filter((saleId) => salesByTransaction[saleId].paymentType !== "debt") // Only process paid sales
          .map((saleId) => {
            const sale = salesByTransaction[saleId]
            return {
              type: "income",
              category: "sales",
              amount: sale.totalAmount,
              date: sale.date,
              description: `Sale to ${sale.customerName} (${sale.items.length} ${
                sale.items.length > 1 ? "items" : "item"
              })`,
              paymentMethod: "cash",
              reference: `SALE-${saleId}`,
              id: Date.now() + Number.parseInt(saleId),
              timestamp: new Date().toISOString(),
              relatedSales: [saleId],
              relatedProducts: sale.items.map((item) => item.product),
            }
          })

        if (newTransactions.length > 0) {
          setTransactions((prev) => [...prev, ...newTransactions])
        }
      }
    }
  }, [sales, transactions])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("financialTransactions", JSON.stringify(transactions))
  }, [transactions])

  // Format number with commas for input fields
  const formatInputNumber = (value) => {
    if (!value) return ""

    // Remove any non-digit characters except decimal point
    const numericValue = value.toString().replace(/[^\d.]/g, "")

    // Split into integer and decimal parts
    const parts = numericValue.split(".")

    // Format integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    // Join back with decimal part (if exists)
    return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0]
  }

  // Parse formatted number back to numeric value
  const parseFormattedNumber = (formattedValue) => {
    if (!formattedValue) return ""
    // Remove commas and convert to number
    const numericValue = formattedValue.replace(/,/g, "")
    return numericValue === "" ? "" : numericValue
  }

  const handleTransactionChange = (e) => {
    const { name, value } = e.target

    if (name === "amount") {
      // Format the input value with commas
      const numericValue = parseFormattedNumber(value)
      const formattedValue = formatInputNumber(value)

      setNewTransaction((prev) => ({
        ...prev,
        amount: numericValue,
        formattedAmount: formattedValue,
      }))
    } else {
      setNewTransaction((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleAddTransaction = (e) => {
    e.preventDefault()

    if (!newTransaction.amount || !newTransaction.category || !newTransaction.date) {
      alert("Please fill in all required fields")
      return
    }

    const transaction = {
      ...newTransaction,
      amount: Number(newTransaction.amount),
      id: Date.now(),
      timestamp: new Date().toISOString(),
    }

    setTransactions((prev) => [...prev, transaction])
    setNewTransaction({
      type: newTransaction.type,
      category: "",
      amount: "",
      formattedAmount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      paymentMethod: "cash",
      reference: "",
      relatedSales: [],
      relatedProducts: [],
    })

    if (newTransaction.type === "income") {
      setShowIncomeForm(false)
    } else {
      setShowExpenseForm(false)
    }
  }

  // Handle recording a sale as income
  const handleRecordSale = (sale) => {
    // For debt sales, we don't record them as income
    if (sale.paymentType === "debt") {
      // Create an accounts receivable transaction instead
      const receivableTransaction = {
        type: "accounts-receivable",
        category: "accounts-receivable",
        amount: sale.totalAmount,
        date: sale.date,
        description: `Credit Sale to ${sale.customerName} (${sale.items.length} ${sale.items.length > 1 ? "items" : "item"})`,
        paymentMethod: "credit",
        reference: `SALE-${sale.id}`,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        relatedSales: [sale.id],
        relatedProducts: sale.items.map((item) => item.product),
        settled: false,
      }

      setTransactions((prev) => [...prev, receivableTransaction])
    } else {
      // Create a regular income transaction for paid sales
      const saleTransaction = {
        type: "income",
        category: "sales",
        amount: sale.totalAmount,
        date: sale.date,
        description: `Sale to ${sale.customerName} (${sale.items.length} ${sale.items.length > 1 ? "items" : "item"})`,
        paymentMethod: "cash",
        reference: `SALE-${sale.id}`,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        relatedSales: [sale.id],
        relatedProducts: sale.items.map((item) => item.product),
      }

      setTransactions((prev) => [...prev, saleTransaction])
    }
  }

  // Handle debt settlement - convert accounts receivable to income
  const handleDebtSettlement = (debtId, amount) => {
    // Find the accounts receivable transaction
    const receivableTransaction = transactions.find(
      (t) => t.type === "accounts-receivable" && t.relatedSales.includes(debtId.toString()),
    )

    if (receivableTransaction) {
      // Mark the receivable as settled
      setTransactions((prev) => prev.map((t) => (t.id === receivableTransaction.id ? { ...t, settled: true } : t)))

      // Create a new income transaction for the settled debt
      const incomeTransaction = {
        type: "income",
        category: "debt-payment",
        amount: amount,
        date: new Date().toISOString().split("T")[0],
        description: `Payment received for debt: ${receivableTransaction.description}`,
        paymentMethod: "cash",
        reference: `DEBT-PAYMENT-${debtId}`,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        relatedSales: receivableTransaction.relatedSales,
        relatedProducts: receivableTransaction.relatedProducts,
      }

      setTransactions((prev) => [...prev, incomeTransaction])
    }
  }

  // Add this function after the handleDebtSettlement function to handle restock expenses
  const handleRestockExpense = (restockTransaction) => {
    setTransactions((prev) => [...prev, restockTransaction])
  }

  // Filter transactions based on search term and filters
  const filteredTransactions = transactions.filter((transaction) => {
    // Search term filter
    const searchMatch =
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()))

    // Type filter
    const typeMatch = filterType === "all" || transaction.type === filterType

    // Category filter
    const categoryMatch = filterCategory === "all" || transaction.category === filterCategory

    // Date range filter
    let dateMatch = true
    if (filterDateRange.start && filterDateRange.end) {
      const transactionDate = new Date(transaction.date)
      const startDate = new Date(filterDateRange.start)
      const endDate = new Date(filterDateRange.end)
      endDate.setHours(23, 59, 59, 999) // Set to end of day
      dateMatch = transactionDate >= startDate && transactionDate <= endDate
    }

    return searchMatch && typeMatch && categoryMatch && dateMatch
  })

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date))

  // Calculate totals
  const calculateTotals = () => {
    let totalIncome = 0
    let totalExpenses = 0
    let totalReceivables = 0

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount
      } else if (transaction.type === "expense") {
        totalExpenses += transaction.amount
      } else if (transaction.type === "accounts-receivable" && !transaction.settled) {
        totalReceivables += transaction.amount
      }
    })

    const currentBalance = totalIncome - totalExpenses

    return {
      totalIncome,
      totalExpenses,
      totalReceivables,
      currentBalance,
    }
  }

  // Update the destructuring of calculateTotals to include totalReceivables
  const { totalIncome, totalExpenses, totalReceivables, currentBalance } = calculateTotals()

  // Get unique categories for filter dropdown
  const categories = [
    ...new Set(
      transactions
        .filter((t) => t.category !== "opening-balance")
        .map((transaction) => transaction.category)
        .filter(Boolean),
    ),
  ]

  // Format currency with proper thousand separators
  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Add this new function for formatting numbers without currency symbol
  const formatNumber = (num) => {
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Get transaction type icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case "income":
        return <ArrowDownCircle className="transaction-icon income" />
      case "expense":
        return <ArrowUpCircle className="transaction-icon expense" />
      case "accounts-receivable":
        return <CreditCard className="transaction-icon accounts-receivable" />
      default:
        return <DollarSign className="transaction-icon" />
    }
  }

  // Get transaction type label
  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case "income":
        return "Income"
      case "expense":
        return "Expense"
      case "accounts-receivable":
        return "Accounts Receivable"
      default:
        return type
    }
  }

  // Reset filters
  const resetFilters = () => {
    setFilterType("all")
    setFilterCategory("all")
    setFilterDateRange({ start: "", end: "" })
    setSearchTerm("")
  }

  // Income categories
  const incomeCategories = ["Sales", "Investment", "Loan", "Interest", "Refund", "Gift", "Other Income"]

  // Expense categories
  const expenseCategories = [
    // Product Categories
    "Shoes",
    "Clothing",
    "Food",
    "Electronics",
    "Furniture",
    "Appliances",
    "Beauty Products",
    "Health Products",
    "Toys",
    "Books",
    "Stationery",
    "Jewelry",
    "Accessories",
    "Home Decor",
    "Kitchen Items",
    "Sports Equipment",
    "Automotive",
    "Tools",
    "Garden Supplies",

    // Operational expenses (still needed for general business expenses)
    "Rent",
    "Utilities",
    "Salaries",
    "Transportation",
    "Marketing",
    "Insurance",
    "Taxes",
    "Office Supplies",
    "Maintenance",
    "Packaging",
    "Shipping",
    "Software",
    "Equipment",
    "Professional Services",
    "Bank Charges",
    "Other Expense",
  ]

  // Payment methods
  const paymentMethods = [
    "Cash",
    "Bank Transfer",
    "Credit Card",
    "Debit Card",
    "Mobile Money",
    "Check",
    "Credit",
    "Other",
  ]

  useEffect(() => {
    // If this is a multi-item sale, find all related sales with the same ID
    const storedOpeningBalance = localStorage.getItem("openingBalance")
    if (storedOpeningBalance) {
      setOpeningBalance(JSON.parse(storedOpeningBalance))
    }

    // Only show the opening balance form if there's no capital transaction yet
    if (!transactions.some((t) => t.type === "capital")) {
      setShowOpeningBalanceForm(true)
    } else {
      setShowOpeningBalanceForm(false)
    }
  }, [transactions])

  // Set up the updateFinancialRecords function
  useEffect(() => {
    if (typeof updateFinancialRecords === "function") {
      // Override the function with our implementation
      updateFinancialRecords = (saleId, amount) => {
        handleDebtSettlement(saleId, amount)
      }
    }
  }, [])

  // Add this useEffect to listen for restock transactions
  useEffect(() => {
    // Function to handle storage events
    const handleStorageChange = (e) => {
      if (e.key === "financialTransactions") {
        const updatedTransactions = JSON.parse(e.newValue)
        setTransactions(updatedTransactions)
      }
    }

    // Add event listener
    window.addEventListener("storage", handleStorageChange)

    // Clean up
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return (
    <main className="financial-management">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
      <h2>Financial Management</h2>

      {/* Financial Summary */}
      <div className="financial-summary">
        <div className="summary-card">
          <h3>Current Balance</h3>
          <p className={`summary-value ${currentBalance >= 0 ? "positive" : "negative"}`}>
            {formatCurrency(currentBalance)}
          </p>
        </div>
        <div className="summary-card">
          <h3>Total Income</h3>
          <p className="summary-value positive">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p className="summary-value negative">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="summary-card">
          <h3>Accounts Receivable</h3>
          <p className="summary-value receivable">{formatCurrency(totalReceivables)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="financial-actions">
        <button
          className="action-button income-button"
          onClick={() => {
            setShowIncomeForm(!showIncomeForm)
            setShowExpenseForm(false)
            setShowSalesSummary(false)
            setNewTransaction((prev) => ({ ...prev, type: "income" }))
          }}
        >
          <Plus className="button-icon" />
          Add Income
        </button>
        <button
          className="action-button expense-button"
          onClick={() => {
            setShowExpenseForm(!showExpenseForm)
            setShowIncomeForm(false)
            setShowSalesSummary(false)
            setNewTransaction((prev) => ({ ...prev, type: "expense" }))
          }}
        >
          <Minus className="button-icon" />
          Add Expense
        </button>
        <button
          className="action-button sales-button"
          onClick={() => {
            setShowSalesSummary(!showSalesSummary)
            setShowIncomeForm(false)
            setShowExpenseForm(false)
          }}
        >
          <ShoppingCart className="button-icon" />
          {showSalesSummary ? "Hide Sales" : "View Sales"}
        </button>
        <button className="action-button filter-button" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="button-icon" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Income Form */}
      {showIncomeForm && (
        <div className="transaction-form income-form">
          <h3>Add Income</h3>
          <form onSubmit={handleAddTransaction}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="income-amount">
                  <DollarSign className="form-icon" />
                  Amount (₦)
                </label>
                <input
                  id="income-amount"
                  name="amount"
                  type="text"
                  value={newTransaction.formattedAmount}
                  onChange={handleTransactionChange}
                  required
                  placeholder="0.00"
                  className="formatted-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="income-date">
                  <Calendar className="form-icon" />
                  Date
                </label>
                <input
                  id="income-date"
                  name="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={handleTransactionChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="income-category">
                  <Tag className="form-icon" />
                  Category
                </label>
                <select
                  id="income-category"
                  name="category"
                  value={newTransaction.category}
                  onChange={handleTransactionChange}
                  required
                >
                  <option value="">Select Category</option>
                  {incomeCategories.map((category) => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="income-payment-method">
                  <CreditCard className="form-icon" />
                  Payment Method
                </label>
                <select
                  id="income-payment-method"
                  name="paymentMethod"
                  value={newTransaction.paymentMethod}
                  onChange={handleTransactionChange}
                  required
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method.toLowerCase()}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="income-description">
                <FileText className="form-icon" />
                Description
              </label>
              <input
                id="income-description"
                name="description"
                value={newTransaction.description}
                onChange={handleTransactionChange}
                placeholder="Enter description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="income-reference">
                <FileText className="form-icon" />
                Reference/Receipt Number
              </label>
              <input
                id="income-reference"
                name="reference"
                value={newTransaction.reference}
                onChange={handleTransactionChange}
                placeholder="Optional"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button">
                Add Income
              </button>
              <button type="button" className="cancel-button" onClick={() => setShowIncomeForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Form */}
      {showExpenseForm && (
        <div className="transaction-form expense-form">
          <h3>Add Expense</h3>
          <form onSubmit={handleAddTransaction}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expense-amount">
                  <DollarSign className="form-icon" />
                  Amount (₦)
                </label>
                <input
                  id="expense-amount"
                  name="amount"
                  type="text"
                  value={newTransaction.formattedAmount}
                  onChange={handleTransactionChange}
                  required
                  placeholder="0.00"
                  className="formatted-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="expense-date">
                  <Calendar className="form-icon" />
                  Date
                </label>
                <input
                  id="expense-date"
                  name="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={handleTransactionChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expense-category">
                  <Tag className="form-icon" />
                  Category
                </label>
                <select
                  id="expense-category"
                  name="category"
                  value={newTransaction.category}
                  onChange={handleTransactionChange}
                  required
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map((category) => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="expense-payment-method">
                  <CreditCard className="form-icon" />
                  Payment Method
                </label>
                <select
                  id="expense-payment-method"
                  name="paymentMethod"
                  value={newTransaction.paymentMethod}
                  onChange={handleTransactionChange}
                  required
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method.toLowerCase()}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="expense-description">
                <FileText className="form-icon" />
                Description
              </label>
              <input
                id="expense-description"
                name="description"
                value={newTransaction.description}
                onChange={handleTransactionChange}
                placeholder="Enter description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="expense-reference">
                <FileText className="form-icon" />
                Reference/Receipt Number
              </label>
              <input
                id="expense-reference"
                name="reference"
                value={newTransaction.reference}
                onChange={handleTransactionChange}
                placeholder="Optional"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button">
                Add Expense
              </button>
              <button type="button" className="cancel-button" onClick={() => setShowExpenseForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sales Summary Section */}
      {showSalesSummary && (
        <div className="sales-summary-section">
          <h3>Sales Transactions</h3>
          <p className="section-description">
            View and record sales transactions as income. Multi-product sales are grouped together.
          </p>

          <div className="sales-summary-cards">
            {salesSummary.length > 0 ? (
              salesSummary.map((sale) => {
                // Check if this sale has already been recorded in financial transactions
                const isRecorded = transactions.some(
                  (t) => t.relatedSales && t.relatedSales.includes(sale.id.toString()),
                )

                return (
                  <div
                    key={sale.id}
                    className={`sale-transaction-card ${sale.paymentType === "debt" ? "debt-card" : ""} ${
                      isRecorded ? "recorded-card" : ""
                    }`}
                  >
                    <div className="transaction-header">
                      <div className="transaction-info">
                        <div className="transaction-date">{sale.date}</div>
                        <div className="transaction-customer">{sale.customerName}</div>
                        <div className="transaction-items-count">
                          <Package2 className="items-icon" />
                          {sale.items.length} {sale.items.length > 1 ? "items" : "item"}
                        </div>
                      </div>
                      <div className="transaction-totals">
                        <div className="transaction-amount">₦{formatNumber(sale.totalAmount)}</div>
                        <div className={`transaction-payment ${sale.paymentType}`}>
                          {sale.paymentType === "paid" ? "Paid" : "Debt"}
                        </div>
                        {isRecorded ? (
                          <div className="recorded-badge">Recorded</div>
                        ) : (
                          <button
                            className="record-sale-button"
                            onClick={() => handleRecordSale(sale)}
                            title="Record this sale as income"
                          >
                            Record as Income
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="transaction-details">
                      <table className="transaction-items-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price (₦)</th>
                            <th>Total (₦)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sale.items.map((item, idx) => {
                            const itemTotal = item.price * item.quantity
                            return (
                              <tr key={`${item.id}-${idx}`}>
                                <td>{item.productName}</td>
                                <td>{formatNumber(item.quantity)}</td>
                                <td>₦{formatNumber(item.price.toFixed(2))}</td>
                                <td>₦{formatNumber(itemTotal.toFixed(2))}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3">
                              <strong>Total</strong>
                            </td>
                            <td>
                              <strong>₦{formatNumber(sale.totalAmount.toFixed(2))}</strong>
                            </td>
                          </tr>
                          <tr className="profit-row">
                            <td colSpan="3">
                              <strong>Profit</strong>
                            </td>
                            <td className={sale.totalProfit > 0 ? "profit-positive" : "profit-negative"}>
                              <strong>₦{formatNumber(sale.totalProfit.toFixed(2))}</strong>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="no-sales">
                <p>No sales records found. Create sales from the Sales page to see them here.</p>
                <button className="action-button" onClick={() => setCurrentPage("sales")}>
                  Go to Sales
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="filters-container">
          <h3>Filter Transactions</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="filter-type">Transaction Type</label>
              <select id="filter-type" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="accounts-receivable">Accounts Receivable</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-category">Category</label>
              <select id="filter-category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-date-start">Start Date</label>
              <input
                id="filter-date-start"
                type="date"
                value={filterDateRange.start}
                onChange={(e) => setFilterDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="filter-group">
              <label htmlFor="filter-date-end">End Date</label>
              <input
                id="filter-date-end"
                type="date"
                value={filterDateRange.end}
                onChange={(e) => setFilterDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
          <div className="filter-actions">
            <button className="reset-filters-button" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="transactions-list">
        <h3>Transaction History</h3>
        {sortedTransactions.length === 0 ? (
          <div className="no-transactions">
            <p>No transactions found. Add income or expenses to get started.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="transactions-table-wrapper desktop-table">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Payment Method</th>
                    <th>Reference</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((transaction) => (
                    <tr key={transaction.id} className={`transaction-row ${transaction.type}`}>
                      <td className="transaction-type">
                        {getTransactionIcon(transaction.type)}
                        <span>{getTransactionTypeLabel(transaction.type)}</span>
                      </td>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="transaction-category">
                        <span className={`category-badge ${transaction.category}`}>
                          {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                        </span>
                      </td>
                      <td>
                        {transaction.description}
                        {transaction.relatedSales && transaction.relatedSales.length > 0 && (
                          <span className="related-badge">Sale ID: {transaction.relatedSales.join(", ")}</span>
                        )}
                      </td>
                      <td>{transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}</td>
                      <td>{transaction.reference || "-"}</td>
                      <td
                        className={`transaction-amount ${
                          transaction.type === "income" || transaction.type === "capital" ? "positive" : "negative"
                        }`}
                      >
                        {transaction.type === "expense" ? "-" : ""}
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-cards">
              {sortedTransactions.map((transaction) => (
                <div key={transaction.id} className={`table-card transaction-card ${transaction.type}`}>
                  <div className="card-header">
                    <div className="card-title-section">
                      <div className="transaction-type">
                        {getTransactionIcon(transaction.type)}
                        <span>{getTransactionTypeLabel(transaction.type)}</span>
                      </div>
                      <span className="card-date">{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                    <div
                      className={`card-amount ${
                        transaction.type === "income" || transaction.type === "capital" ? "positive" : "negative"
                      }`}
                    >
                      {transaction.type === "expense" ? "-" : ""}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>

                  <div className="card-details">
                    <div className="card-detail">
                      <span className="card-detail-label">Category</span>
                      <span className={`category-badge ${transaction.category}`}>
                        {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                      </span>
                    </div>
                    <div className="card-detail">
                      <span className="card-detail-label">Description</span>
                      <span className="card-detail-value">{transaction.description}</span>
                    </div>
                    <div className="card-detail">
                      <span className="card-detail-label">Payment Method</span>
                      <span className="card-detail-value">
                        {transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
                      </span>
                    </div>
                    {transaction.reference && (
                      <div className="card-detail">
                        <span className="card-detail-label">Reference</span>
                        <span className="card-detail-value">{transaction.reference}</span>
                      </div>
                    )}
                    {transaction.relatedSales && transaction.relatedSales.length > 0 && (
                      <div className="card-detail">
                        <span className="card-detail-label">Related Sale</span>
                        <span className="related-badge">ID: {transaction.relatedSales.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Financial Insights */}
      <div className="financial-insights">
        <div className="insights-header">
          <h3>Financial Insights</h3>
          <TrendingUp className="insights-icon" />
        </div>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Income vs Expenses</h4>
            <div className="insight-chart">
              <div className="chart-bar-container">
                <div className="chart-label">Income</div>
                <div
                  className="chart-bar income"
                  style={{ width: `${(totalIncome / (totalIncome + totalExpenses || 1)) * 100}%` }}
                >
                  {formatCurrency(totalIncome)}
                </div>
              </div>
              <div className="chart-bar-container">
                <div className="chart-label">Expenses</div>
                <div
                  className="chart-bar expense"
                  style={{ width: `${(totalExpenses / (totalIncome + totalExpenses || 1)) * 100}%` }}
                >
                  {formatCurrency(totalExpenses)}
                </div>
              </div>
            </div>
          </div>
          <div className="insight-card">
            <h4>Profit Margin</h4>
            <div className="insight-value">
              {totalIncome > 0 ? `${formatNumber(((totalIncome - totalExpenses) / totalIncome) * 100)}%` : "N/A"}
            </div>
            <div className="insight-description">
              {totalIncome > 0
                ? totalIncome > totalExpenses
                  ? "Your business is profitable!"
                  : "Your expenses exceed your income."
                : "Add income to calculate profit margin."}
            </div>
          </div>
          <div className="insight-card">
            <h4>Top Expense Category</h4>
            <div className="insight-value">
              {transactions.filter((t) => t.type === "expense").length > 0
                ? (() => {
                    const expensesByCategory = transactions
                      .filter((t) => t.type === "expense")
                      .reduce((acc, t) => {
                        acc[t.category] = (acc[t.category] || 0) + t.amount
                        return acc
                      }, {})
                    const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0]
                    return topCategory ? `${topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1)}` : "None"
                  })()
                : "None"}
            </div>
            <div className="insight-description">
              {transactions.filter((t) => t.type === "expense").length > 0
                ? "This is where most of your money goes."
                : "Add expenses to see your top category."}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default FinancialManagement
