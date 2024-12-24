"use client"

import { useState, useRef, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import {
  Search,
  Plus,
  User,
  Phone,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  PlusCircle,
  History,
} from "lucide-react"

function DebtBook({
  debts = [],
  addDebt,
  updateDebtStatus,
  setCurrentPage,
  updateSalePaymentStatus,
  updateFinancialRecords,
}) {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [showDepositForm, setShowDepositForm] = useState(false)
  const tableWrapperRef = useRef(null)
  const [newDebt, setNewDebt] = useState({
    customerName: "",
    phoneNumber: "",
    amount: "",
    dueDate: "",
    description: "",
  })

  const [showDepositModal, setShowDepositModal] = useState(false)

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setNewDebt((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields for debt records
    if (!newDebt.customerName || !newDebt.phoneNumber) {
      alert("Customer name and phone number are required for debt records")
      return
    }

    addDebt({
      ...newDebt,
      id: Date.now(),
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      deposits: [], // Initialize deposits array
      remainingAmount: Number(newDebt.amount), // Initialize remaining amount
    })
    setNewDebt({
      customerName: "",
      phoneNumber: "",
      amount: "",
      dueDate: "",
      description: "",
    })
    setShowForm(false)
  }

  const handleMarkAsPaid = (debtId) => {
    // Find the debt to get details for updating the sale
    const debt = debts.find((d) => d.id === debtId)
    if (debt) {
      // Update the debt status
      updateDebtStatus(debtId, "paid", [], 0)

      // Update the corresponding sale's payment status if it exists
      if (debt.saleId) {
        updateSalePaymentStatus(debt.saleId, "paid")

        // Update financial records to convert accounts receivable to income
        if (typeof updateFinancialRecords === "function") {
          updateFinancialRecords(debt.saleId, debt.remainingAmount)
        }
      }
    }
  }

  const handleAddDeposit = (e) => {
    e.preventDefault()
    if (!selectedDebt || !depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      return
    }

    const amount = Number(depositAmount)
    const debt = debts.find((d) => d.id === selectedDebt)

    if (!debt) return

    // Don't allow deposits larger than the remaining amount
    if (amount > debt.remainingAmount) {
      alert(`Deposit amount cannot exceed the remaining balance of ₦${formatNumber(debt.remainingAmount.toFixed(2))}`)
      return
    }

    const newDeposit = {
      id: Date.now(),
      amount,
      date: new Date().toISOString().split("T")[0],
    }

    // Calculate new remaining amount
    const newRemainingAmount = debt.remainingAmount - amount
    const newDeposits = [...(debt.deposits || []), newDeposit]

    // Update debt with new deposit and remaining amount
    updateDebtStatus(selectedDebt, newRemainingAmount <= 0 ? "paid" : "pending", newDeposits, newRemainingAmount)

    // If debt is fully paid, update the sale status and financial records
    if (newRemainingAmount <= 0 && debt.saleId) {
      updateSalePaymentStatus(debt.saleId, "paid")

      // Update financial records to convert accounts receivable to income
      if (typeof updateFinancialRecords === "function") {
        updateFinancialRecords(debt.saleId, amount)
      }
    } else if (typeof updateFinancialRecords === "function") {
      // For partial payments, still update financial records
      updateFinancialRecords(debt.saleId, amount)
    }

    // Reset form and close modal
    setDepositAmount("")
    setShowDepositModal(false)
    setSelectedDebt(null)
  }

  const formatNumber = (num) => {
    const parts = num.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
  }

  const filteredDebts = debts.filter((debt) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      debt.customerName.toLowerCase().includes(searchLower) ||
      debt.phoneNumber.includes(searchTerm) ||
      debt.description.toLowerCase().includes(searchLower) ||
      String(debt.amount).includes(searchTerm)
    )
  })

  // Calculate total deposits for a debt
  const getTotalDeposits = (debt) => {
    if (!debt.deposits || debt.deposits.length === 0) return 0
    return debt.deposits.reduce((sum, deposit) => sum + deposit.amount, 0)
  }

  return (
    <main className="debt-book">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
      <h2>Debt Book</h2>
      <button onClick={() => setShowForm(!showForm)} className="action-button">
        {showForm ? (
          <>
            <XCircle className="button-icon" />
            Hide Form
          </>
        ) : (
          <>
            <Plus className="button-icon" />
            Add New Debt
          </>
        )}
      </button>

      {showForm && (
        <div className="debt-form">
          <h3>Add New Debt</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="customerName">
                <User className="form-icon" />
                Customer Name
              </label>
              <input
                id="customerName"
                name="customerName"
                value={newDebt.customerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">
                <Phone className="form-icon" />
                Phone Number
              </label>
              <input id="phoneNumber" name="phoneNumber" value={newDebt.phoneNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="amount">
                <DollarSign className="form-icon" />
                Amount (₦)
              </label>
              <input id="amount" name="amount" type="number" value={newDebt.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="dueDate">
                <Calendar className="form-icon" />
                Due Date
              </label>
              <input id="dueDate" name="dueDate" type="date" value={newDebt.dueDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">
                <FileText className="form-icon" />
                Description
              </label>
              <input id="description" name="description" value={newDebt.description} onChange={handleChange} required />
            </div>
            <button type="submit">
              <Plus className="button-icon" />
              Add Debt
            </button>
          </form>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && selectedDebt && (
        <div className="modal-overlay">
          <div className="modal-content deposit-modal">
            <div className="modal-header">
              <h3>Add Deposit</h3>
              <button
                className="close-modal-button"
                onClick={() => {
                  setShowDepositModal(false)
                  setDepositAmount("")
                }}
              >
                <XCircle className="button-icon-small" />
              </button>
            </div>

            <div className="debt-summary">
              <p>
                <strong>Customer:</strong> {debts.find((d) => d.id === selectedDebt)?.customerName}
              </p>
              <p>
                <strong>Original Amount:</strong> ₦
                {formatNumber(Number(debts.find((d) => d.id === selectedDebt)?.amount).toFixed(2))}
              </p>
              <p>
                <strong>Remaining Balance:</strong> ₦
                {formatNumber(Number(debts.find((d) => d.id === selectedDebt)?.remainingAmount).toFixed(2))}
              </p>
            </div>

            <form onSubmit={handleAddDeposit}>
              <div className="form-group">
                <label htmlFor="depositAmount">
                  <DollarSign className="form-icon" />
                  Deposit Amount (₦)
                </label>
                <input
                  id="depositAmount"
                  name="depositAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={debts.find((d) => d.id === selectedDebt)?.remainingAmount}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="success-button">
                  <PlusCircle className="button-icon" />
                  Add Deposit
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowDepositModal(false)
                    setDepositAmount("")
                  }}
                >
                  <XCircle className="button-icon" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="debt-list">
        <h3>Debt Records</h3>
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search debts..."
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
                <th>Customer</th>
                <th>Phone</th>
                <th>Original (₦)</th>
                <th>Paid (₦)</th>
                <th>Remaining (₦)</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebts.map((debt) => {
                const totalDeposits = getTotalDeposits(debt)
                const remainingAmount =
                  debt.remainingAmount !== undefined ? debt.remainingAmount : Number(debt.amount) - totalDeposits

                return (
                  <tr key={debt.id} className={debt.status === "paid" ? "paid-debt" : ""}>
                    <td>{debt.customerName}</td>
                    <td>{debt.phoneNumber}</td>
                    <td>₦{formatNumber(Number(debt.amount).toFixed(2))}</td>
                    <td>₦{formatNumber(totalDeposits.toFixed(2))}</td>
                    <td>₦{formatNumber(remainingAmount.toFixed(2))}</td>
                    <td>{debt.dueDate}</td>
                    <td>
                      <span className={`status-badge ${debt.status}`}>
                        {debt.status === "paid" ? (
                          <CheckCircle2 className="status-icon paid" />
                        ) : (
                          <XCircle className="status-icon pending" />
                        )}
                        {debt.status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {debt.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedDebt(debt.id)
                                setShowDepositModal(true)
                              }}
                              className="icon-button deposit"
                            >
                              <PlusCircle className="button-icon-small" />
                              Deposit
                            </button>
                            <button onClick={() => handleMarkAsPaid(debt.id)} className="icon-button success">
                              <CheckCircle2 className="button-icon-small" />
                              Mark Paid
                            </button>
                          </>
                        )}
                        {debt.deposits && debt.deposits.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedDebt(debt.id === selectedDebt ? null : debt.id)
                            }}
                            className="icon-button history"
                          >
                            <History className="button-icon-small" />
                            History
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Deposit History Section */}
        {selectedDebt && !showDepositForm && (
          <div className="deposit-history">
            <div className="deposit-history-header">
              <h4>Payment History for {debts.find((d) => d.id === selectedDebt)?.customerName}</h4>
              <button className="close-button" onClick={() => setSelectedDebt(null)}>
                <XCircle className="button-icon-small" />
              </button>
            </div>

            <div className="debt-details">
              <p>
                <strong>Description:</strong> {debts.find((d) => d.id === selectedDebt)?.description}
              </p>
              <p>
                <strong>Created on:</strong> {debts.find((d) => d.id === selectedDebt)?.date}
              </p>
            </div>

            <table className="deposit-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount (₦)</th>
                </tr>
              </thead>
              <tbody>
                {debts
                  .find((d) => d.id === selectedDebt)
                  ?.deposits?.map((deposit) => (
                    <tr key={deposit.id}>
                      <td>{deposit.date}</td>
                      <td>₦{formatNumber(deposit.amount.toFixed(2))}</td>
                    </tr>
                  ))}
                <tr className="total-row">
                  <td>
                    <strong>Total Paid</strong>
                  </td>
                  <td>
                    <strong>
                      ₦{formatNumber(getTotalDeposits(debts.find((d) => d.id === selectedDebt)).toFixed(2))}
                    </strong>
                  </td>
                </tr>
                <tr className="remaining-row">
                  <td>
                    <strong>Remaining</strong>
                  </td>
                  <td>
                    <strong>
                      ₦{formatNumber(debts.find((d) => d.id === selectedDebt)?.remainingAmount.toFixed(2))}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

export default DebtBook
