"use client"

import { useState } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import { Search, Plus, Minus, Package2, Hash } from "lucide-react"

function ManageInventory({ inventory = [], updateQuantity, setCurrentPage }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInventory = inventory.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      String(item.price).includes(searchTerm) ||
      String(item.quantity).includes(searchTerm)
    )
  })

  const handlePageChange = (page) => {
    if (typeof setCurrentPage === "function") {
      setCurrentPage(page)
    }
  }

  return (
    <main className="manage-inventory">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
      <h2>Manage Inventory</h2>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{Number(item.quantity) || 0}</td>
                <td className="action-buttons">
                  <button onClick={() => updateQuantity(item.id, -1)} className="icon-button decrease">
                    <Minus className="button-icon-small" />
                  </button>
                  <button onClick={() => updateQuantity(item.id, 1)} className="icon-button increase">
                    <Plus className="button-icon-small" />
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

