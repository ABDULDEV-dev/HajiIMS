"use client"

import {
  PlusCircle,
  ClipboardList,
  Settings,
  ShoppingCart,
  BookOpen,
  UserCircle,
  Printer,
  BarChart,
  DollarSign,
} from "lucide-react"

function HomePage({ setCurrentPage }) {
  return (
    <main className="home-page">
      <div className="grid">
        <button onClick={() => setCurrentPage("add-product")}>
          <PlusCircle className="button-icon" />
          <span>Add Product</span>
        </button>
        <button onClick={() => setCurrentPage("view-inventory")}>
          <ClipboardList className="button-icon" />
          <span>View Inventory</span>
        </button>
        <button onClick={() => setCurrentPage("manage-inventory")}>
          <Settings className="button-icon" />
          <span>Manage Inventory</span>
        </button>
        <button onClick={() => setCurrentPage("sales")}>
          <ShoppingCart className="button-icon" />
          <span>Sales</span>
        </button>
        <button onClick={() => setCurrentPage("debt-book")}>
          <BookOpen className="button-icon" />
          <span>Debt Book</span>
        </button>
        <button onClick={() => setCurrentPage("receipt-printing")}>
          <Printer className="button-icon" />
          <span>Print Receipts</span>
        </button>
        <button onClick={() => setCurrentPage("sales-analytics")}>
          <BarChart className="button-icon" />
          <span>Sales Analytics</span>
        </button>
        <button onClick={() => setCurrentPage("financial-management")}>
          <DollarSign className="button-icon" />
          <span>Finances</span>
        </button>

    
      </div>
    </main>
  )
}

export default HomePage
