function BackToHomeButtom({ setCurrentPage }) {
    return (
      <button className="back-home" onClick={() => setCurrentPage("home")}>
        Back to Home
      </button>
    )
  }
  
  export default BackToHomeButtom;
  
  