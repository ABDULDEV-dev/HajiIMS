"use client"

import { useState } from "react"
import { Search, ShoppingCart, Plus, Minus, ArrowLeft, Package } from "lucide-react"

function ProductSelection({ inventory, cart, setCart, setCurrentPage }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const formatNumber = (num) => {
    const parts = num.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
  }

  // Get unique categories
  const categories = ["all", ...new Set(inventory.map((item) => item.category).filter(Boolean))]

  // Filter products
  const filteredProducts = inventory.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const hasStock = item.quantity > 0

    return matchesSearch && matchesCategory && hasStock
  })

  // Get quantity in cart for a product
  const getCartQuantity = (productId) => {
    const cartItem = cart.find((item) => item.productId === productId)
    return cartItem ? cartItem.quantity : 0
  }

  // Add product to cart
  const addToCart = (product, quantity = 1) => {
    const existingItemIndex = cart.findIndex((item) => item.productId === product.id)
    const currentCartQuantity = getCartQuantity(product.id)

    // Check if adding this quantity would exceed available stock
    if (currentCartQuantity + quantity > product.quantity) {
      alert(`Cannot add more. Only ${product.quantity - currentCartQuantity} available.`)
      return
    }

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += quantity
      setCart(updatedCart)
    } else {
      // Add new item
      const cartItem = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        buyingPrice: product.buyingPrice || 0,
        quantity: quantity,
        image: product.image,
      }
      setCart([...cart, cartItem])
    }
  }

  // Remove from cart
  const removeFromCart = (productId, quantity = 1) => {
    const existingItemIndex = cart.findIndex((item) => item.productId === productId)

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart]
      const currentQuantity = updatedCart[existingItemIndex].quantity

      if (currentQuantity <= quantity) {
        // Remove item completely
        updatedCart.splice(existingItemIndex, 1)
      } else {
        // Reduce quantity
        updatedCart[existingItemIndex].quantity -= quantity
      }

      setCart(updatedCart)
    }
  }

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <main className="product-selection">
      {/* Header */}
      <div className="product-selection-header">
        <button onClick={() => setCurrentPage("sales")} className="back-button">
          <ArrowLeft className="icon" />
          Back to Sales
        </button>
        <h2>Select Products</h2>
        <div className="cart-summary">
          <ShoppingCart className="icon" />
          <span className="cart-count">{cartItemCount}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="product-selection-filters">
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

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-filter ${selectedCategory === category ? "active" : ""}`}
            >
              {category === "all" ? "All" : category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-selection-grid">
        {filteredProducts.map((product) => {
          const cartQuantity = getCartQuantity(product.id)
          const availableStock = product.quantity - cartQuantity
          const profit = product.price - (product.buyingPrice || 0)
          const profitMargin = product.price > 0 ? (profit / product.price) * 100 : 0

          return (
            <div key={product.id} className="product-selection-card">
              <div className="product-card-image">
                <img
                  src={product.image || "/placeholder.svg?height=120&width=120"}
                  alt={product.name}
                  className="product-image"
                />
                {availableStock <= 5 && availableStock > 0 && <div className="low-stock-badge">Low Stock</div>}
              </div>

              <div className="product-card-content">
                <h3 className="product-card-title">{product.name}</h3>
                <div className="product-card-price">₦{formatNumber(product.price.toFixed(2))}</div>
                <div className="product-card-details">
                  <div className="product-stock">Stock: {formatNumber(availableStock)}</div>
                  <div className="product-profit">Profit: {profitMargin.toFixed(1)}%</div>
                </div>

                {/* Quantity Controls */}
                <div className="quantity-controls">
                  {cartQuantity > 0 ? (
                    <div className="quantity-adjuster">
                      <button onClick={() => removeFromCart(product.id, 1)} className="quantity-btn minus">
                        <Minus className="icon-small" />
                      </button>
                      <span className="quantity-display">{cartQuantity}</span>
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="quantity-btn plus"
                        disabled={availableStock === 0}
                      >
                        <Plus className="icon-small" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="add-to-cart-btn"
                      disabled={availableStock === 0}
                    >
                      <Plus className="icon-small" />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products-found">
          <Package className="no-products-icon" />
          <h3>No products found</h3>
          <p>Try adjusting your search or category filter.</p>
        </div>
      )}

      {/* Cart Summary Footer */}
      {cart.length > 0 && (
        <div className="cart-summary-footer">
          <div className="cart-summary-content">
            <div className="cart-info">
              <div className="cart-items">{cartItemCount} items</div>
              <div className="cart-total">₦{formatNumber(cartTotal.toFixed(2))}</div>
            </div>
            <button onClick={() => setCurrentPage("sales")} className="proceed-to-checkout">
              Continue to Sale
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default ProductSelection
