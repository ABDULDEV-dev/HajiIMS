"use client"

import { useState, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
// import ProfitMarginCalculator from "./ProfitMarginCalculator"

function ProductForm({ addProduct, setCurrentPage }) {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    buyingPrice: "",
    category: "",
    quantity: "",
    image: "",
  })
  const [localImages, setLocalImages] = useState([])

  useEffect(() => {
    // Fetch images from localStorage
    const storedImages = JSON.parse(localStorage.getItem("inventoryImages") || "[]")
    setLocalImages(storedImages)
  }, [])

  // Update the handleChange function to limit decimal places
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "price" || name === "quantity" || name === "buyingPrice") {
      // Remove commas and convert to number
      const numValue = value.replace(/,/g, "")

      if (name === "quantity") {
        // For quantity, only allow whole numbers
        const intValue = Number.parseInt(numValue)
        setProduct((prev) => ({
          ...prev,
          [name]: isNaN(intValue) ? "" : intValue,
        }))
      } else {
        // For price and buyingPrice, limit to 2 decimal places
        const floatValue = Number.parseFloat(numValue)
        if (!isNaN(floatValue)) {
          // Format to 2 decimal places
          const formattedValue = Number.parseFloat(floatValue.toFixed(2))
          setProduct((prev) => ({
            ...prev,
            [name]: formattedValue,
          }))

          // If updating price, check against buying price
          if (name === "price" && formattedValue <= Number(product.buyingPrice) && product.buyingPrice !== "") {
            document.getElementById("price-warning").style.display = "block"
          } else if (name === "price") {
            document.getElementById("price-warning").style.display = "none"
          }

          // If updating buying price, check against selling price
          if (name === "buyingPrice" && Number(product.price) <= formattedValue && product.price !== "") {
            document.getElementById("price-warning").style.display = "block"
          } else if (name === "buyingPrice" && Number(product.price) > formattedValue) {
            document.getElementById("price-warning").style.display = "none"
          }
        } else {
          setProduct((prev) => ({
            ...prev,
            [name]: "",
          }))
        }
      }
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newImage = reader.result
        setProduct((prev) => ({ ...prev, image: newImage }))
        // Add the new image to localStorage
        const updatedImages = [...localImages, newImage]
        localStorage.setItem("inventoryImages", JSON.stringify(updatedImages))
        setLocalImages(updatedImages)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate that selling price is greater than buying price
    if (Number(product.price) <= Number(product.buyingPrice)) {
      alert("Selling price must be greater than buying price")
      return
    }

    addProduct(product)
    setProduct({ name: "", price: "", buyingPrice: "", category: "", quantity: "", image: "" })
    setCurrentPage("view-inventory")
  }

  const formatNumber = (num) => {
    return num >= 1000 ? num.toLocaleString("en-US") : num.toString()
  }

  // Handle applying suggested price from calculator
  // const handleApplySuggestedPrice = (suggestedPrice) => {
  //   setProduct((prev) => ({
  //     ...prev,
  //     price: suggestedPrice,
  //   }))
  //   // Hide price warning since we're applying a valid price
  //   document.getElementById("price-warning").style.display = "none"
  // }

  return (
    <main className="product-form">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Product Name</label>
          <input id="name" name="name" value={product.name} onChange={handleChange} required />
        </div>

        <div className="price-fields">
          <div className="price-field">
            <label htmlFor="buyingPrice">Buying Price (₦)</label>
            <input
              id="buyingPrice"
              name="buyingPrice"
              type="text"
              value={product.buyingPrice ? formatNumber(product.buyingPrice) : ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="price-field">
            <label htmlFor="price">Selling Price (₦)</label>
            <input
              id="price"
              name="price"
              type="text"
              value={product.price ? formatNumber(product.price) : ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div
          id="price-warning"
          className="price-warning"
          style={{ display: "none", color: "red", marginBottom: "10px" }}
        >
          Selling price must be greater than buying price
        </div>

        {/* Add the profit margin calculator */}
        {/* {product.buyingPrice && (
          <ProfitMarginCalculator buyingPrice={Number(product.buyingPrice)} onApplyPrice={handleApplySuggestedPrice} />
        )} */}

        <div>
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={product.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            <option value="shoes">Shoes</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            name="quantity"
            type="text"
            value={product.quantity ? formatNumber(product.quantity) : ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="image">Product Image</label>
          <input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        {product.image && (
          <div className="image-preview">
            <img src={product.image || "/placeholder.svg"} alt="Product" />
          </div>
        )}
        <div>
          <label>Select from existing images:</label>
          <div className="image-gallery">
            {localImages.map((img, index) => (
              <img
                key={index}
                src={img || "/placeholder.svg"}
                alt={`Stored image ${index}`}
                onClick={() => setProduct((prev) => ({ ...prev, image: img }))}
                className={product.image === img ? "selected" : ""}
              />
            ))}
          </div>
        </div>
        <button type="submit">Add Product</button>
      </form>
    </main>
  )
}

export default ProductForm
