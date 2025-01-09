"use client"

import { useState, useEffect } from "react"
import BackToHomeButtom from "./BackToHomeButtom"
import {
  User,
  Building2,
  LogOut,
  LogIn,
  UserPlus,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  MessageCircle,
  Code,
  Github,
  Linkedin,
  Globe,
  Award,
  Calendar,
  MapPin,
} from "lucide-react"

function UserDetails({ setCurrentPage, companyInfo }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [editedCompanyInfo, setEditedCompanyInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    image: "",
  })

  // Developer information
  const developerInfo = {
    name: "Abdulkadir Adamu Haji",
    title: "Full Stack Developer & Software Engineer",
    email: "AbdulkadirAdamu203@gmail.com",
    phone: "+234 706 568 8358",
    whatsapp: "+2347065688358",
    location: "Nigeria",
    image: "./Dev.jpg",
    bio: "Passionate software developer with expertise in modern web technologies. Specialized in creating efficient inventory management systems and business solutions.",
    skills: ["React", "JavaScript", "Node.js", "CSS", "HTML", "Database Design", "UI/UX Design"],
    experience: "3+ Years",
    projects: "15+ Completed Projects",
    social: {
      github: "https://github.com/abdulkadirhaji",
      linkedin: "https://linkedin.com/in/abdulkadirhaji",
      portfolio: "https://abdulkadirhaji.dev",
    },
  }

  // Load user session and company info on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
    }

    // Load company info from localStorage or props
    const storedCompanyName = localStorage.getItem("companyName")
    const storedCompanyImage = localStorage.getItem("companyImage")
    const storedCompanyDetails = localStorage.getItem("companyDetails")

    if (storedCompanyDetails) {
      setEditedCompanyInfo(JSON.parse(storedCompanyDetails))
    } else {
      setEditedCompanyInfo({
        name: storedCompanyName || companyInfo?.name || "HAJI Inventory Management",
        address: "123 Business Street, City, State",
        phone: "+234 123 456 7890",
        email: "contact@hajiims.com",
        image: storedCompanyImage || companyInfo?.image || "",
      })
    }
  }, [companyInfo])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    setCurrentUser(null)
    setIsLoggedIn(false)
    alert("You have been logged out successfully!")
  }

  const handleCompanyEdit = () => {
    setIsEditingCompany(true)
  }

  const handleCompanyChange = (e) => {
    const { name, value } = e.target
    setEditedCompanyInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCompanyImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditedCompanyInfo((prev) => ({
          ...prev,
          image: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveCompany = () => {
    // Save to localStorage
    localStorage.setItem("companyDetails", JSON.stringify(editedCompanyInfo))
    localStorage.setItem("companyName", editedCompanyInfo.name)
    localStorage.setItem("companyImage", editedCompanyInfo.image)

    setIsEditingCompany(false)
    alert("Company details updated successfully!")
  }

  const handleCancelEdit = () => {
    // Reset to original values
    const storedCompanyDetails = localStorage.getItem("companyDetails")
    if (storedCompanyDetails) {
      setEditedCompanyInfo(JSON.parse(storedCompanyDetails))
    }
    setIsEditingCompany(false)
  }

  // Contact functions
  const handleEmailContact = () => {
    window.location.href = `mailto:${developerInfo.email}?subject=Inquiry about HAJI Inventory Management System&body=Hello Abdulkadir,%0D%0A%0D%0AI would like to inquire about...`
  }

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      "Hello! I'm interested in your inventory management system. Can you provide more information?",
    )
    window.open(`https://wa.me/${developerInfo.whatsapp}?text=${message}`, "_blank")
  }

  const handlePhoneContact = () => {
    window.location.href = `tel:${developerInfo.phone}`
  }

  const handleSocialLink = (url) => {
    window.open(url, "_blank")
  }

  return (
    <main className="user-details">
      <BackToHomeButtom setCurrentPage={setCurrentPage} />
      <h2>Profile & Information Center</h2>

      {/* User Section */}
      <div className="profile-section">
        <div className="section-header">
          <User className="section-icon" />
          <h3>User Information</h3>
        </div>

        {isLoggedIn && currentUser ? (
          <div className="user-info-card">
            <div className="user-avatar-section">
              <img src={currentUser.avatar || "/placeholder.svg"} alt="User Avatar" className="user-avatar" />
              <div className="user-basic-info">
                <h4>{currentUser.name}</h4>
                <p className="user-email">{currentUser.email}</p>
                <p className="user-role">{currentUser.role || "Administrator"}</p>
              </div>
            </div>

            <div className="user-details-grid">
              <div className="detail-item">
                <span className="detail-label">Join Date:</span>
                <span className="detail-value">{currentUser.joinDate || "2024-01-01"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Login:</span>
                <span className="detail-value">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value status-active">Active</span>
              </div>
            </div>

            <button onClick={handleLogout} className="logout-button">
              <LogOut className="button-icon" />
              Log Out
            </button>
          </div>
        ) : (
          <div className="auth-section">
            <p className="auth-message">Please sign in to view your profile information</p>
            <div className="auth-buttons">
              <button onClick={() => setCurrentPage("login")} className="login-button">
                <LogIn className="button-icon" />
                Sign In
              </button>
              <button onClick={() => setCurrentPage("signup")} className="signup-button">
                <UserPlus className="button-icon" />
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Company Section */}
      <div className="company-section">
        <div className="section-header">
          <Building2 className="section-icon" />
          <h3>Company Information</h3>
          {!isEditingCompany && (
            <button onClick={handleCompanyEdit} className="edit-button">
              <Edit3 className="button-icon-small" />
              Edit
            </button>
          )}
        </div>

        <div className="company-info-card">
          {isEditingCompany ? (
            <div className="company-edit-form">
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  name="name"
                  value={editedCompanyInfo.name}
                  onChange={handleCompanyChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyAddress">Address</label>
                <input
                  id="companyAddress"
                  name="address"
                  value={editedCompanyInfo.address}
                  onChange={handleCompanyChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyPhone">Phone</label>
                  <input
                    id="companyPhone"
                    name="phone"
                    value={editedCompanyInfo.phone}
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="companyEmail">Email</label>
                  <input
                    id="companyEmail"
                    name="email"
                    type="email"
                    value={editedCompanyInfo.email}
                    onChange={handleCompanyChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="companyImage">Company Logo</label>
                <input
                  id="companyImage"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleCompanyImageChange}
                />
              </div>

              {editedCompanyInfo.image && (
                <div className="image-preview">
                  <img src={editedCompanyInfo.image || "/placeholder.svg"} alt="Company Logo Preview" />
                </div>
              )}

              <div className="form-actions">
                <button onClick={handleSaveCompany} className="save-button">
                  <Save className="button-icon-small" />
                  Save Changes
                </button>
                <button onClick={handleCancelEdit} className="cancel-button">
                  <X className="button-icon-small" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="company-display">
              <div className="company-header">
                <div className="company-logo">
                  <img src={editedCompanyInfo.image || "/placeholder.svg"} alt="Company Logo" />
                </div>
                <div className="company-basic-info">
                  <h4>{editedCompanyInfo.name}</h4>
                  <p className="company-tagline">Inventory Management System</p>
                </div>
              </div>

              <div className="company-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{editedCompanyInfo.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{editedCompanyInfo.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{editedCompanyInfo.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">System Version:</span>
                  <span className="detail-value">v2.0.0</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="contact-section">
        <div className="section-header">
          <MessageCircle className="section-icon" />
          <h3>Contact Support</h3>
        </div>

        <div className="contact-info-card">
          <div className="contact-intro">
            <p>
              Need help or have questions? Get in touch with our support team through any of the following channels:
            </p>
          </div>

          <div className="contact-methods">
            <button onClick={handleEmailContact} className="contact-method email">
              <Mail className="contact-icon" />
              <div className="contact-details">
                <span className="contact-label">Email Support</span>
                <span className="contact-value">{developerInfo.email}</span>
              </div>
            </button>

            <button onClick={handleWhatsAppContact} className="contact-method whatsapp">
              <MessageCircle className="contact-icon" />
              <div className="contact-details">
                <span className="contact-label">WhatsApp</span>
                <span className="contact-value">{developerInfo.phone}</span>
              </div>
            </button>

            <button onClick={handlePhoneContact} className="contact-method phone">
              <Phone className="contact-icon" />
              <div className="contact-details">
                <span className="contact-label">Phone Call</span>
                <span className="contact-value">{developerInfo.phone}</span>
              </div>
            </button>
          </div>

          <div className="contact-note">
            <p>
              <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (WAT)
            </p>
            <p>
              <strong>Response Time:</strong> We typically respond within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <div className="developer-section">
        <div className="section-header">
          <Code className="section-icon" />
          <h3>About the Developer</h3>
        </div>

        <div className="developer-info-card">
          <div className="developer-profile">
            <div className="developer-avatar">
              <img src={developerInfo.image || "/placeholder.svg"} alt="Developer" className="developer-image" />
              <div className="developer-status">
                <span className="status-indicator"></span>
                Available for Projects
              </div>
            </div>

            <div className="developer-basic-info">
              <h4>{developerInfo.name}</h4>
              <p className="developer-title">{developerInfo.title}</p>
              <div className="developer-location">
                <MapPin className="location-icon" />
                <span>{developerInfo.location}</span>
              </div>
              <p className="developer-bio">{developerInfo.bio}</p>
            </div>
          </div>

          <div className="developer-stats">
            <div className="stat-item">
              <Award className="stat-icon" />
              <div className="stat-details">
                <span className="stat-value">{developerInfo.experience}</span>
                <span className="stat-label">Experience</span>
              </div>
            </div>
            <div className="stat-item">
              <Code className="stat-icon" />
              <div className="stat-details">
                <span className="stat-value">{developerInfo.projects}</span>
                <span className="stat-label">Projects</span>
              </div>
            </div>
            <div className="stat-item">
              <Calendar className="stat-icon" />
              <div className="stat-details">
                <span className="stat-value">2024</span>
                <span className="stat-label">Latest Work</span>
              </div>
            </div>
          </div>

          <div className="developer-skills">
            <h5>Technical Skills</h5>
            <div className="skills-grid">
              {developerInfo.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="developer-contact">
            <h5>Connect with Developer</h5>
            <div className="social-links">
              <button onClick={() => handleSocialLink(developerInfo.social.github)} className="social-link github">
                <Github className="social-icon" />
                <span>GitHub</span>
              </button>
              <button onClick={() => handleSocialLink(developerInfo.social.linkedin)} className="social-link linkedin">
                <Linkedin className="social-icon" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => handleSocialLink(developerInfo.social.portfolio)}
                className="social-link portfolio"
              >
                <Globe className="social-icon" />
                <span>Portfolio</span>
              </button>
            </div>
          </div>

          <div className="developer-technologies">
            <h5>Technologies Used in This Project</h5>
            <div className="tech-list">
              <div className="tech-item">
                <strong>Frontend:</strong> React, JavaScript ES6+, CSS3, HTML5
              </div>
              <div className="tech-item">
                <strong>Styling:</strong> Custom CSS, Responsive Design, Flexbox/Grid
              </div>
              <div className="tech-item">
                <strong>Storage:</strong> LocalStorage API for data persistence
              </div>
              <div className="tech-item">
                <strong>Icons:</strong> Lucide React for modern iconography
              </div>
              <div className="tech-item">
                <strong>Features:</strong> Inventory Management, Sales Tracking, Financial Analytics
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default UserDetails
