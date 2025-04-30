import BackToHomeButtom from './BackToHomeButtom'

function UserDetails({ setCurrentPage }) {
  // This is a placeholder for user data. In a real application, this would come from a backend or state management system.
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Inventory Manager",
    joinDate: "2023-01-01",
  }

  return (
    <main className="user-details">
      <h2>User Details</h2>
      <div className="user-info">
        <img src="/USER.jpg" alt="User Avatar" className="user-avatar" />
        <div>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <p>
            <strong>Join Date:</strong> {user.joinDate}
          </p>
        </div>
      </div>
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
    </main>
  )
}

export default UserDetails

