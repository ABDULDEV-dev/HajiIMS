"use client"

import { useState, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Calendar, Filter, TrendingUp, PieChartIcon, BarChartIcon } from "lucide-react"

function SalesAnalytics({ sales = [], inventory = [], setCurrentPage }) {
  const [timeRange, setTimeRange] = useState("all")
  const [chartType, setChartType] = useState("sales")
  const [filteredSales, setFilteredSales] = useState([])
  const [salesData, setSalesData] = useState({
    dailySales: [],
    monthlySales: [],
    topProducts: [],
    paymentTypes: [],
    profitMargins: [],
    categoryDistribution: [],
  })

  // Colors for charts
  const COLORS = [
    "#FF8C00",
    "#FF621F",
    "#FF4500",
    "#FF7F50",
    "#FFA07A",
    "#FF6347",
    "#FF8C69",
    "#FFD700",
    "#FFA500",
    "#FF4500",
  ]
  const PAYMENT_COLORS = { paid: "#22c55e", debt: "#ef4444" }

  // Filter sales based on selected time range
  useEffect(() => {
    let filtered = [...sales]
    const now = new Date()

    if (timeRange === "week") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = sales.filter((sale) => new Date(sale.date) >= oneWeekAgo)
    } else if (timeRange === "month") {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      filtered = sales.filter((sale) => new Date(sale.date) >= oneMonthAgo)
    } else if (timeRange === "quarter") {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      filtered = sales.filter((sale) => new Date(sale.date) >= threeMonthsAgo)
    } else if (timeRange === "year") {
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      filtered = sales.filter((sale) => new Date(sale.date) >= oneYearAgo)
    }

    setFilteredSales(filtered)
  }, [sales, timeRange])

  // Process sales data for charts
  useEffect(() => {
    if (filteredSales.length === 0) {
      setSalesData({
        dailySales: [],
        monthlySales: [],
        topProducts: [],
        paymentTypes: [],
        profitMargins: [],
        categoryDistribution: [],
      })
      return
    }

    // Process daily sales
    const dailySalesMap = {}
    filteredSales.forEach((sale) => {
      const date = sale.date
      if (!dailySalesMap[date]) {
        dailySalesMap[date] = { date, sales: 0, profit: 0 }
      }
      dailySalesMap[date].sales += sale.price * sale.quantity
      dailySalesMap[date].profit += (sale.price - (sale.buyingPrice || 0)) * sale.quantity
    })

    const dailySales = Object.values(dailySalesMap).sort((a, b) => new Date(a.date) - new Date(b.date))

    // Process monthly sales
    const monthlySalesMap = {}
    filteredSales.forEach((sale) => {
      const date = new Date(sale.date)
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`
      if (!monthlySalesMap[monthYear]) {
        monthlySalesMap[monthYear] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          sales: 0,
          profit: 0,
        }
      }
      monthlySalesMap[monthYear].sales += sale.price * sale.quantity
      monthlySalesMap[monthYear].profit += (sale.price - (sale.buyingPrice || 0)) * sale.quantity
    })

    const monthlySales = Object.values(monthlySalesMap).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(" ")
      const [bMonth, bYear] = b.month.split(" ")
      return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`)
    })

    // Process top products
    const productSalesMap = {}
    filteredSales.forEach((sale) => {
      if (!productSalesMap[sale.productName]) {
        productSalesMap[sale.productName] = {
          name: sale.productName,
          sales: 0,
          quantity: 0,
          profit: 0,
        }
      }
      productSalesMap[sale.productName].sales += sale.price * sale.quantity
      productSalesMap[sale.productName].quantity += sale.quantity
      productSalesMap[sale.productName].profit += (sale.price - (sale.buyingPrice || 0)) * sale.quantity
    })

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)

    // Process payment types
    const paymentTypesMap = { paid: 0, debt: 0 }
    filteredSales.forEach((sale) => {
      const paymentType = sale.paymentType || "paid"
      paymentTypesMap[paymentType] += sale.price * sale.quantity
    })

    const paymentTypes = Object.entries(paymentTypesMap).map(([name, value]) => ({ name, value }))

    // Process profit margins
    const profitMargins = topProducts
      .map((product) => ({
        name: product.name,
        margin: (product.profit / product.sales) * 100,
      }))
      .sort((a, b) => b.margin - a.margin)

    // Process category distribution (from inventory)
    const categoryMap = {}
    inventory.forEach((item) => {
      const category = item.category || "Uncategorized"
      if (!categoryMap[category]) {
        categoryMap[category] = { name: category, value: 0 }
      }
      categoryMap[category].value += item.price * item.quantity
    })

    const categoryDistribution = Object.values(categoryMap)

    setSalesData({
      dailySales,
      monthlySales,
      topProducts,
      paymentTypes,
      profitMargins,
      categoryDistribution,
    })
  }, [filteredSales, inventory])

  const formatCurrency = (value) => {
    return `₦${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatNumber = (value) => {
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label, valuePrefix = "₦" }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${valuePrefix}${formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Custom tooltip for pie charts
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${payload[0].name}`}</p>
          <p style={{ color: payload[0].color }}>{`Value: ₦${formatNumber(payload[0].value)}`}</p>
          {payload[0].payload.percentage && (
            <p style={{ color: payload[0].color }}>{`Percentage: ${payload[0].payload.percentage.toFixed(1)}%`}</p>
          )}
        </div>
      )
    }
    return null
  }

  // Custom tooltip for profit margin chart
  const MarginTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p style={{ color: payload[0].color }}>{`Margin: ${formatNumber(payload[0].value)}%`}</p>
        </div>
      )
    }
    return null
  }

  // Calculate total sales and profit
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0)
  const totalProfit = filteredSales.reduce(
    (sum, sale) => sum + (sale.price - (sale.buyingPrice || 0)) * sale.quantity,
    0,
  )
  const averageMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0

  // Prepare pie chart data with percentages
  const preparePercentageData = (data) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    return data.map((item) => ({
      ...item,
      percentage: (item.value / total) * 100,
    }))
  }

  const renderChart = () => {
    switch (chartType) {
      case "sales":
        return (
          <div className="chart-container">
            <h3>Sales Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={timeRange === "month" || timeRange === "week" ? salesData.dailySales : salesData.monthlySales}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeRange === "month" || timeRange === "week" ? "date" : "month"} />
                <YAxis tickFormatter={(value) => `₦${value.toLocaleString()}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#FF8C00" name="Sales" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#22c55e" name="Profit" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )

      case "products":
        return (
          <div className="chart-container">
            <h3>Top Selling Products</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesData.topProducts.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₦${value.toLocaleString()}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="sales" fill="#FF8C00" name="Sales" />
                <Bar dataKey="profit" fill="#22c55e" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )

      case "payment":
        return (
          <div className="chart-container">
            <h3>Sales by Payment Type</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={preparePercentageData(salesData.paymentTypes)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                >
                  {salesData.paymentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )

      case "margins":
        return (
          <div className="chart-container">
            <h3>Product Profit Margins</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesData.profitMargins.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                <Tooltip content={<MarginTooltip />} />
                <Legend />
                <Bar dataKey="margin" fill="#FF8C00" name="Profit Margin %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )

      case "inventory":
        return (
          <div className="chart-container">
            <h3>Inventory Value by Category</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={preparePercentageData(salesData.categoryDistribution)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                >
                  {salesData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )

      default:
        return <div>Select a chart type</div>
    }
  }

  return (
    <main className="sales-analytics">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
      <h2>Sales Analytics Dashboard</h2>

      <div className="analytics-controls">
        <div className="time-filter">
          <div className="filter-label">
            <Calendar className="filter-icon" />
            <span>Time Period:</span>
          </div>
          <div className="filter-options">
            <button className={timeRange === "week" ? "active" : ""} onClick={() => setTimeRange("week")}>
              Week
            </button>
            <button className={timeRange === "month" ? "active" : ""} onClick={() => setTimeRange("month")}>
              Month
            </button>
            <button className={timeRange === "quarter" ? "active" : ""} onClick={() => setTimeRange("quarter")}>
              Quarter
            </button>
            <button className={timeRange === "year" ? "active" : ""} onClick={() => setTimeRange("year")}>
              Year
            </button>
            <button className={timeRange === "all" ? "active" : ""} onClick={() => setTimeRange("all")}>
              All Time
            </button>
          </div>
        </div>

        <div className="chart-filter">
          <div className="filter-label">
            <Filter className="filter-icon" />
            <span>Chart Type:</span>
          </div>
          <div className="filter-options">
            <button className={chartType === "sales" ? "active" : ""} onClick={() => setChartType("sales")}>
              <TrendingUp className="button-icon-small" />
              Sales Trend
            </button>
            <button className={chartType === "products" ? "active" : ""} onClick={() => setChartType("products")}>
              <BarChartIcon className="button-icon-small" />
              Top Products
            </button>
            <button className={chartType === "payment" ? "active" : ""} onClick={() => setChartType("payment")}>
              <PieChartIcon className="button-icon-small" />
              Payment Types
            </button>
            <button className={chartType === "margins" ? "active" : ""} onClick={() => setChartType("margins")}>
              <BarChartIcon className="button-icon-small" />
              Profit Margins
            </button>
            <button className={chartType === "inventory" ? "active" : ""} onClick={() => setChartType("inventory")}>
              <PieChartIcon className="button-icon-small" />
              Inventory Value
            </button>
          </div>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Total Sales</h3>
          <p className="summary-value">{formatCurrency(totalSales)}</p>
          <p className="summary-period">{timeRange === "all" ? "All Time" : `Last ${timeRange}`}</p>
        </div>
        <div className="summary-card">
          <h3>Total Profit</h3>
          <p className="summary-value profit-positive">{formatCurrency(totalProfit)}</p>
          <p className="summary-period">{timeRange === "all" ? "All Time" : `Last ${timeRange}`}</p>
        </div>
        <div className="summary-card">
          <h3>Average Margin</h3>
          <p className="summary-value">{formatNumber(averageMargin)}%</p>
          <p className="summary-period">{timeRange === "all" ? "All Time" : `Last ${timeRange}`}</p>
        </div>
        <div className="summary-card">
          <h3>Total Transactions</h3>
          <p className="summary-value">{new Set(filteredSales.map((sale) => sale.id)).size}</p>
          <p className="summary-period">{timeRange === "all" ? "All Time" : `Last ${timeRange}`}</p>
        </div>
      </div>

      <div className="chart-section">{renderChart()}</div>

      {chartType === "products" && (
        <div className="data-table-section">
          <h3>Top 10 Products by Sales</h3>

          {/* Desktop Table */}
          <div className="table-wrapper desktop-table">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Sales (₦)</th>
                  <th>Profit (₦)</th>
                  <th>Margin (%)</th>
                </tr>
              </thead>
              <tbody>
                {salesData.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency(product.sales)}</td>
                    <td className={product.profit > 0 ? "profit-positive" : "profit-negative"}>
                      {formatCurrency(product.profit)}
                    </td>
                    <td>{formatNumber((product.profit / product.sales) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-cards">
            {salesData.topProducts.map((product, index) => (
              <div key={index} className="table-card analytics-card">
                <div className="card-header">
                  <div className="card-title-section">
                    <h3 className="card-title">{product.name}</h3>
                    <span className="card-rank">#{index + 1}</span>
                  </div>
                  <div className="card-sales">{formatCurrency(product.sales)}</div>
                </div>

                <div className="card-details">
                  <div className="card-detail">
                    <span className="card-detail-label">Quantity Sold</span>
                    <span className="card-detail-value">{product.quantity}</span>
                  </div>
                  <div className="card-detail">
                    <span className="card-detail-label">Profit</span>
                    <span className={`card-detail-value ${product.profit > 0 ? "profit-positive" : "profit-negative"}`}>
                      {formatCurrency(product.profit)}
                    </span>
                  </div>
                  <div className="card-detail">
                    <span className="card-detail-label">Margin</span>
                    <span className="card-detail-value">{formatNumber((product.profit / product.sales) * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

export default SalesAnalytics
