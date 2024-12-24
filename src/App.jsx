"use client"

import { useState, useEffect } from "react"
import Header from "./components/Header"
import HomePage from "./components/HomePage"
import ProductForm from "./components/ProductForm"
import ViewInventory from "./components/ViewInventory"
import ManageInventory from "./components/ManageInventory"
import DeveloperDetails from "./components/DeveloperDetails"
import LoginForm from "./components/LogingForm"
import SignupForm from "./components/SignupForm"
import UserDetails from "./components/UserDetails"
import SalesForm from "./components/Salesform"
import ReceiptPrinting from "./components/ReceiptPrinting"
import DebtBook from "./components/DebtBook"
import SalesAnalytics from "./components/SalesAnalytics"
import FinancialManagement from "./components/FinancialManagement"
import "./App.css"

function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [inventory, setInventory] = useState([])
  const [currentSale, setCurrentSale] = useState(null)
  const [companyInfo, setCompanyInfo] = useState({ name: "", image: "" })
  const [debts, setDebts] = useState([])
  const [sales, setSales] = useState([])

  useEffect(() => {
    const storedName = localStorage.getItem("companyName")
    const storedImage = localStorage.getItem("companyImage")
    if (storedName && storedImage) {
      setCompanyInfo({ name: storedName, image: storedImage })
    }

    // Load debts and sales from localStorage if available
    const storedDebts = localStorage.getItem("debts")
    const storedSales = localStorage.getItem("sales")
    if (storedDebts) {
      setDebts(JSON.parse(storedDebts))
    }
    if (storedSales) {
      setSales(JSON.parse(storedSales))
    }
  }, [])

  // Save debts and sales to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("debts", JSON.stringify(debts))
  }, [debts])

  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales))
  }, [sales])

  const addProduct = (product) => {
    setInventory([...inventory, { ...product, id: Date.now() }])
  }

  const updateQuantity = (id, change) => {
    setInventory(
      inventory.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, Number(item.quantity) + change) } : item,
      ),
    )
  }

  // Update the addSale function to handle initial deposits for debt sales
  const addSale = (sale) => {
    // Set default values for empty customer info
    const processedSale = {
      ...sale,
      customerName: sale.customerName || "Walk-in Customer",
      address: sale.address || "N/A",
      phoneNumber: sale.phoneNumber || "N/A",
    }

    setCurrentSale(processedSale)
    setSales([...sales, processedSale])

    // If sale is on debt, add to debt book
    if (processedSale.paymentType === "debt") {
      const saleAmount = processedSale.price * processedSale.quantity
      const initialDeposit = processedSale.initialDeposit || 0
      const remainingAmount = saleAmount - initialDeposit

      const debtRecord = {
        id: Date.now(),
        customerName: processedSale.customerName,
        phoneNumber: processedSale.phoneNumber,
        amount: saleAmount,
        date: processedSale.date,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
        description: `Purchase of ${processedSale.quantity} ${processedSale.productName}`,
        status: "pending",
        saleId: processedSale.id, // Link to the sale
        deposits:
          initialDeposit > 0
            ? [
                {
                  id: Date.now() + 1,
                  amount: initialDeposit,
                  date: processedSale.date,
                },
              ]
            : [],
        remainingAmount: remainingAmount,
      }
      setDebts([...debts, debtRecord])
    }

    // Update inventory
    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.id === Number(processedSale.product)
          ? { ...item, quantity: Math.max(0, Number(item.quantity) - Number(processedSale.quantity)) }
          : item,
      ),
    )
  }

  const addDebt = (debt) => {
    setDebts([...debts, debt])
  }

  const updateDebtStatus = (id, status, deposits, remainingAmount) => {
    setDebts(debts.map((debt) => (debt.id === id ? { ...debt, status, deposits, remainingAmount } : debt)))
  }

  const updateSalePaymentStatus = (saleId, status) => {
    setSales(sales.map((sale) => (sale.id === saleId ? { ...sale, paymentType: status } : sale)))
  }

  // Add the deleteProduct and updateProduct functions to the App component
  const deleteProduct = (id) => {
    setInventory(inventory.filter((item) => item.id !== id))
  }

  const updateProduct = (updatedProduct) => {
    setInventory(inventory.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)))
  }

  // Function to update financial records when a debt is settled
  const updateFinancialRecords = (debtId, amount) => {
    // This function will be called from DebtBook when a debt is settled
    // We'll implement the actual logic in the FinancialManagement component
    // For now, we just need to pass this function to both components
  }

  // Update the renderPage function to pass these new functions to ManageInventory
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage setCurrentPage={setCurrentPage} />
      case "add-product":
        return <ProductForm addProduct={addProduct} setCurrentPage={setCurrentPage} />
      case "view-inventory":
        return <ViewInventory inventory={inventory} setCurrentPage={setCurrentPage} />
      case "manage-inventory":
        return (
          <ManageInventory
            inventory={inventory}
            updateQuantity={updateQuantity}
            deleteProduct={deleteProduct}
            updateProduct={updateProduct}
            setCurrentPage={setCurrentPage}
          />
        )
      case "developer-details":
        return <DeveloperDetails setCurrentPage={setCurrentPage} />
      case "login":
        return <LoginForm setCurrentPage={setCurrentPage} />
      case "signup":
        return <SignupForm setCurrentPage={setCurrentPage} />
      case "user-details":
        return <UserDetails setCurrentPage={setCurrentPage} companyInfo={companyInfo} />
      case "sales":
        return <SalesForm inventory={inventory} addSale={addSale} sales={sales} setCurrentPage={setCurrentPage} />
      case "receipt-printing":
        return (
          <ReceiptPrinting
            currentSale={currentSale}
            setCurrentPage={setCurrentPage}
            sales={sales}
            companyInfo={companyInfo}
          />
        )
      case "debt-book":
        return (
          <DebtBook
            debts={debts}
            addDebt={addDebt}
            updateDebtStatus={updateDebtStatus}
            setCurrentPage={setCurrentPage}
            updateSalePaymentStatus={updateSalePaymentStatus}
            updateFinancialRecords={updateFinancialRecords}
          />
        )
      case "sales-analytics":
        return <SalesAnalytics sales={sales} inventory={inventory} setCurrentPage={setCurrentPage} />
      case "financial-management":
        return (
          <FinancialManagement
            inventory={inventory}
            sales={sales}
            setCurrentPage={setCurrentPage}
            updateFinancialRecords={updateFinancialRecords}
          />
        )
      default:
        return <HomePage setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <div className="app">
      <Header setCurrentPage={setCurrentPage} companyInfo={companyInfo} />
      {renderPage()}
    </div>
  )
}

export default App
