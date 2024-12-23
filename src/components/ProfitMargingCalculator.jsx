"use client"

import { useState, useEffect } from "react"
import { Calculator, ArrowRight } from "lucide-react"

function ProfitMarginCalculator({ buyingPrice, onApplyPrice }) {
  const [margin, setMargin] = useState(30) // Default 30% profit margin
  const [suggestedPrice, setSuggestedPrice] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Predefined profit margin options
  const marginOptions = [10, 15, 20, 25, 30, 35, 40, 50, 60, 70]

  // Calculate suggested price whenever buying price or margin changes
  useEffect(() => {
    if (buyingPrice && !isNaN(buyingPrice) && buyingPrice > 0) {
      // Formula: selling price = buying price / (1 - margin/100)
      const calculatedPrice = buyingPrice / (1 - margin / 100)
      // Round to 2 decimal places
      setSuggestedPrice(Number(calculatedPrice.toFixed(2)))
    } else {
      setSuggestedPrice(0)
    }
  }, [buyingPrice, margin])

  // Handle margin change from input
  const handleMarginChange = (e) => {
    const value = Number(e.target.value)
    if (!isNaN(value) && value >= 0 && value < 100) {
      setMargin(value)
    }
  }

  // Handle margin change from preset buttons
  const handleMarginPreset = (preset) => {
    setMargin(preset)
  }

  // Apply the suggested price
  const handleApplyPrice = () => {
    if (suggestedPrice > 0 && suggestedPrice > buyingPrice) {
      onApplyPrice(suggestedPrice)
    }
  }

  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Calculate the actual profit amount
  const profitAmount = suggestedPrice - buyingPrice

  if (!buyingPrice || isNaN(buyingPrice) || buyingPrice <= 0) {
    return null // Don't render if no valid buying price
  }

  return (
    <div className="profit-calculator">
      <button
        type="button"
        className="calculator-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Open profit margin calculator"
      >
        <Calculator className="calculator-icon" />
        {isOpen ? "Hide Calculator" : "Suggest Selling Price"}
      </button>

      {isOpen && (
        <div className="calculator-panel">
          <h4>Profit Margin Calculator</h4>

          <div className="calculator-summary">
            <div className="summary-item">
              <span>Buying Price:</span>
              <span>₦{formatNumber(buyingPrice)}</span>
            </div>
            <div className="summary-item">
              <span>Profit Margin:</span>
              <span>{margin}%</span>
            </div>
            <div className="summary-item profit">
              <span>Profit Amount:</span>
              <span>₦{formatNumber(profitAmount)}</span>
            </div>
            <div className="summary-item suggested">
              <span>Suggested Price:</span>
              <span>₦{formatNumber(suggestedPrice)}</span>
            </div>
          </div>

          <div className="margin-input">
            <label htmlFor="margin">Profit Margin (%)</label>
            <input id="margin" type="number" min="1" max="99" value={margin} onChange={handleMarginChange} />
          </div>

          <div className="margin-presets">
            <p>Quick Presets:</p>
            <div className="preset-buttons">
              {marginOptions.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-button ${margin === preset ? "active" : ""}`}
                  onClick={() => handleMarginPreset(preset)}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          <div className="calculator-formula">
            <p>Formula: Selling Price = Buying Price / (1 - Margin/100)</p>
          </div>

          <button
            type="button"
            className="apply-price-button"
            onClick={handleApplyPrice}
            disabled={suggestedPrice <= buyingPrice}
          >
            <ArrowRight className="button-icon-small" />
            Apply Suggested Price
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfitMarginCalculator
