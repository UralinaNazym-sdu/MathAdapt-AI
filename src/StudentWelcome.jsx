
import { useState } from 'react'

function StudentWelcome({ onRegister }) {
  const [name, setName] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim() || !year) {
      setError('Please complete all fields.')
      return
    }

    onRegister({
      name: name.trim(),
      year,
      registeredAt: new Date().toISOString()
    })
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-layout">

        <div className="welcome-info">
          <img
            src="/sdu-logo.png"
            alt="SDU University"
            className="welcome-logo"
          />

          <span className="welcome-tag">
            SDU UNIVERSITY · EDUCATIONAL TECHNOLOGY
          </span>

          <h1>Learning is better when it's made for you.</h1>

          <p>
            Welcome to MathAdapt AI — an interactive
            mathematics learning platform designed to
            support students at different skill levels.
          </p>

          <div className="welcome-features">
            <span>✓ Personalized challenges</span>
            <span>✓ Three difficulty levels</span>
            <span>✓ Helpful explanations</span>
          </div>
        </div>

        <form className="registration-card" onSubmit={handleSubmit}>
          <div className="registration-icon">🎓</div>

          <h2>Student Registration</h2>

          <p className="registration-subtitle">
            Enter your information to begin your learning journey.
          </p>

          <label htmlFor="student-name">Full Name</label>
          <input
            id="student-name"
            type="text"
            placeholder="e.g Uralina Nazym"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
          />

          <label htmlFor="student-year">Year of Study</label>
          <select
            id="student-year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="">Select your year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          {error && <p className="registration-error">{error}</p>}

          <button className="registration-button" type="submit">
            Start Learning →
          </button>

          <p className="registration-note">
            Your information is saved in this browser.
          </p>
        </form>

      </div>
    </div>
  )
}

export default StudentWelcome
