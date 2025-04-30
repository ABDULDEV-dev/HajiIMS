"use client"

import { useState } from "react"
import BackToHomeButtom from "./BackToHomeButtom"

function LoginForm({ setCurrentPage }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the credentials to your backend
    console.log("Login attempted with:", credentials)
    // For now, we'll just redirect to the home page
    setCurrentPage("home")
  }

  return (
    <main className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={credentials.email} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account?{" "}
        <span className="link" onClick={() => setCurrentPage("signup")}>
          Sign up
        </span>
      </p>
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
    </main>
  )
}

export default LoginForm

