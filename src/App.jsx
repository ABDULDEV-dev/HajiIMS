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

  // Update the addSale function to handle optional customer info
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
      const debtRecord = {
        id: Date.now(),
        customerName: processedSale.customerName,
        phoneNumber: processedSale.phoneNumber,
        amount: processedSale.price * processedSale.quantity,
        date: processedSale.date,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
        description: `Purchase of ${processedSale.quantity} ${processedSale.productName}`,
        status: "pending",
        saleId: processedSale.id, // Link to the sale
        deposits: [],
        remainingAmount: processedSale.price * processedSale.quantity,
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

  const updateDebtStatus = (id, status) => {
    setDebts(debts.map((debt) => (debt.id === id ? { ...debt, status } : debt)))
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
          />
        )
      case "sales-analytics":
        return <SalesAnalytics sales={sales} inventory={inventory} setCurrentPage={setCurrentPage} />
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
