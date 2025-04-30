"use client"

import { PlusCircle, ClipboardList, Settings, ShoppingCart, BookOpen, UserCircle, Printer } from "lucide-react"

function HomePage({ setCurrentPage }) {
  return (
    <main className="home-page">
      <div className="grid">
        <button onClick={() => setCurrentPage("add-product")}>
          <PlusCircle className="button-icon" />
          Add Product
        </button>
        <button onClick={() => setCurrentPage("view-inventory")}>
          <ClipboardList className="button-icon" />
          View Inventory
        </button>
        <button onClick={() => setCurrentPage("manage-inventory")}>
          <Settings className="button-icon" />
          Manage Inventory
        </button>
        <button onClick={() => setCurrentPage("sales")}>
          <ShoppingCart className="button-icon" />
          Sales
        </button>
        <button onClick={() => setCurrentPage("debt-book")}>
          <BookOpen className="button-icon" />
          Debt Book
        </button>
        <button onClick={() => setCurrentPage("receipt-history")}>
          <Printer className="button-icon" />
          Print Receipts
        </button>
        <button onClick={() => setCurrentPage("developer-details")}>
          <UserCircle className="button-icon" />
          Developer Details
        </button>
      </div>
    </main>
  )
}

export default HomePage

