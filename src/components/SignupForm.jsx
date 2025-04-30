"use client"

import { useState } from "react"
import BackToHomeButtom from './BackToHomeButtom'

function SignupForm({ setCurrentPage }) {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    companyImage: null,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUser((prev) => ({ ...prev, companyImage: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the user data to your backend
    console.log("Signup attempted with:", user)
    // For now, we'll just store the company data in localStorage
    localStorage.setItem("companyName", user.companyName)
    localStorage.setItem("companyImage", user.companyImage)
    // Redirect to the home page
    setCurrentPage("home")
  }

  return (
    <main className="auth-form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" value={user.name} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={user.email} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={user.password} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="companyName">Company Name</label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            value={user.companyName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="companyImage">Company Image</label>
          <input id="companyImage" name="companyImage" type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        {user.companyImage && (
          <div className="image-preview">
            <img src={user.companyImage || "/placeholder.svg"} alt="Company" />
          </div>
        )}
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account?{" "}
        <span className="link" onClick={() => setCurrentPage("login")}>
          Login
        </span>
      </p>
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
    </main>
  )
}

export default SignupForm

