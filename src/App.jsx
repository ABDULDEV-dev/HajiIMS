"use client"

import { useState, useEffect } from "react"
import Header from "./components/Header"
import HomePage from "./components/HomePage"
import ProductForm from "./components/ProductForm"
import ViewInventory from "./components/ViewInventory"
import ManageInventory from "./components/ManageInventory"
import ProductDetails from "./components/ProductDetails"
import LoginForm from "./components/LogingForm"
import SignupForm from "./components/SignupForm"
import UserDetails from "./components/UserDetails"
import SalesForm from "./components/Salesform"
import ReceiptPrinting from "./components/ReceiptPrinting"
import DebtBook from "./components/DebtBook"
import SalesAnalytics from "./components/SalesAnalytics"
import FinancialManagement from "./components/FinancialManagement"
import ProductSelection from "./components/ProductSelection"
import SaleDetails from "./components/SaleDetails"
import ReceiptHistory from "./components/ReceiptHistory"
import "./App.css"

function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [inventory, setInventory] = useState([])
  const [currentSale, setCurrentSale] = useState(null)
  const [companyInfo, setCompanyInfo] = useState({ name: "", image: "" })
  const [debts, setDebts] = useState([])
  const [sales, setSales] = useState([])
  const [productHistory, setProductHistory] = useState([])
  const [cart, setCart] = useState([])

  // Load product history from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem("productHistory")
    if (storedHistory) {
      setProductHistory(JSON.parse(storedHistory))
    }
  }, [])

  // Save product history to localStorage
  useEffect(() => {
    localStorage.setItem("productHistory", JSON.stringify(productHistory))
  }, [productHistory])

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
    const newProduct = { ...product, id: Date.now() }
    setInventory([...inventory, newProduct])

    // Add to product history
    const historyEntry = {
      id: Date.now() + 1,
      productId: newProduct.id,
      productName: newProduct.name,
      type: "created",
      date: new Date().toISOString().split("T")[0],
      description: `Product created with initial stock of ${newProduct.quantity}`,
      quantity: newProduct.quantity,
      amount: newProduct.buyingPrice * newProduct.quantity,
      details: {
        buyingPrice: newProduct.buyingPrice,
        sellingPrice: newProduct.price,
        category: newProduct.category,
      },
    }
    setProductHistory([...productHistory, historyEntry])
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

    // Add to product history
    const historyEntry = {
      id: Date.now() + Math.random(),
      productId: processedSale.product,
      productName: processedSale.productName,
      type: "sale",
      date: processedSale.date,
      description: `Sold ${processedSale.quantity} units to ${processedSale.customerName}`,
      quantity: -processedSale.quantity,
      amount: processedSale.price * processedSale.quantity,
      details: {
        customerName: processedSale.customerName,
        paymentType: processedSale.paymentType,
        unitPrice: processedSale.price,
      },
    }
    setProductHistory([...productHistory, historyEntry])

    // If sale is on debt, add to debt book with correct amount
    if (processedSale.paymentType === "debt") {
      const saleAmount = processedSale.price * processedSale.quantity
      const initialDeposit = processedSale.initialDeposit || 0
      const remainingAmount = saleAmount - initialDeposit

      const debtRecord = {
        id: Date.now(),
        customerName: processedSale.customerName,
        phoneNumber: processedSale.phoneNumber,
        amount: saleAmount, // Full sale amount
        date: processedSale.date,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        description: `Purchase of ${processedSale.quantity} ${processedSale.productName}`,
        status: "pending",
        saleId: processedSale.id,
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

  // Update the renderPage function to include ProductDetails and SaleDetails
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage setCurrentPage={setCurrentPage} />
      case "add-product":
        return <ProductForm addProduct={addProduct} setCurrentPage={setCurrentPage} />
      case "view-inventory":
        return <ViewInventory inventory={inventory} productHistory={productHistory} setCurrentPage={setCurrentPage} />
      case "product-details":
        return <ProductDetails productHistory={productHistory} setCurrentPage={setCurrentPage} />
      case "manage-inventory":
        return (
          <ManageInventory
            inventory={inventory}
            productHistory={productHistory}
            setProductHistory={setProductHistory}
            updateQuantity={updateQuantity}
            deleteProduct={deleteProduct}
            updateProduct={updateProduct}
            setCurrentPage={setCurrentPage}
          />
        )
      case "login":
        return <LoginForm setCurrentPage={setCurrentPage} />
      case "signup":
        return <SignupForm setCurrentPage={setCurrentPage} />
      case "user-details":
        return <UserDetails setCurrentPage={setCurrentPage} companyInfo={companyInfo} />
      case "sales":
        return (
          <SalesForm
            inventory={inventory}
            addSale={addSale}
            sales={sales}
            cart={cart}
            setCart={setCart}
            setCurrentPage={setCurrentPage}
          />
        )
      case "receipt-printing":
        return (
          <ReceiptPrinting
            currentSale={currentSale}
            setCurrentPage={setCurrentPage}
            sales={sales}
            companyInfo={companyInfo}
          />
        )
      case "receipt-history":
        return <ReceiptHistory sales={sales} setCurrentPage={setCurrentPage} setCurrentSale={setCurrentSale} />
      case "sale-details":
        return <SaleDetails sale={currentSale} setCurrentPage={setCurrentPage} setCurrentSale={setCurrentSale} />
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
      case "product-selection":
        return <ProductSelection inventory={inventory} cart={cart} setCart={setCart} setCurrentPage={setCurrentPage} />
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
