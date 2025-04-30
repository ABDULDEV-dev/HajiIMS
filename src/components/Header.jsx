function Header({ setCurrentPage }) {
    return (
      <header className="header">
        <h1 onClick={() => setCurrentPage("home")}>HAJI Inventory Management</h1>
        <div className="user-actions">
          <img
            src="/placeholder-avatar.jpg"
            alt="User"
            className="avatar"
            onClick={() => setCurrentPage("user-details")}
          />
          <button onClick={() => setCurrentPage("login")}>Login</button>
          <button onClick={() => setCurrentPage("signup")}>Sign Up</button>
        </div>
      </header>
    )
  }
  
  export default Header
  
  