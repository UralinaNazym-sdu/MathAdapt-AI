
import { useState } from 'react'
import StudentWelcome from './StudentWelcome'
import './App.css'

// Default mathematical problems for each difficulty level
const problems = {
  foundation: {
    title: 'Foundation',
    question: 'x + 3 = 7',
    answer: 4,
    hint: 'Subtract 3 from both sides of the equation.',
    steps: [
      'x + 3 = 7',
      'x = 7 - 3',
      'x = 4'
    ]
  },

  standard: {
    title: 'Standard',
    question: '3x + 5 = 20',
    answer: 5,
    hint: 'First subtract 5, then divide both sides by 3.',
    steps: [
      '3x + 5 = 20',
      '3x = 15',
      'x = 5'
    ]
  },

  advanced: {
    title: 'Advanced',
    question: '3(x - 2) + 4 = 2x + 7',
    answer: 9,
    hint: 'Expand the brackets, then collect like terms.',
    steps: [
      '3x - 6 + 4 = 2x + 7',
      '3x - 2 = 2x + 7',
      'x = 9'
    ]
  }
}

function App() {
  // Learning level
  const [level, setLevel] = useState('foundation')

  // Student answer and feedback
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')

  // Hints and solutions
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  // Generated math problems
  const [aiProblem, setAiProblem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // Source of the generated problem
  const [problemSource, setProblemSource] = useState(null)

  // Student registration
  const [student, setStudent] = useState(() => {
    try {
      const savedStudent = localStorage.getItem(
        'mathadapt-student'
      )

      return savedStudent
        ? JSON.parse(savedStudent)
        : null
    } catch {
      return null
    }
  })

  function registerStudent(data) {
    localStorage.setItem(
      'mathadapt-student',
      JSON.stringify(data)
    )

    setStudent(data)
  }

  function logoutStudent() {
    localStorage.removeItem('mathadapt-student')
    setStudent(null)
  }

  // Current problem
  const problem = aiProblem || problems[level]

  // Change difficulty level
  function changeLevel(newLevel) {
    setLevel(newLevel)
    setAnswer('')
    setFeedback('')
    setShowHint(false)
    setShowSolution(false)
    setAiProblem(null)
    setAiError('')
    setProblemSource(null)
  }

  // Check student's mathematical answer
  function checkAnswer() {
    if (answer.trim() === '') {
      setFeedback('Please enter an answer first.')
      return
    }

    const value = Number(answer)

    if (!Number.isFinite(value)) {
      setFeedback('Please enter a valid number.')
    } else if (
      Math.abs(value - problem.answer) <
      1e-6 * Math.max(1, Math.abs(problem.answer))
    ) {
      setFeedback('Correct! Great job!')
    } else {
      setFeedback(
        'Not quite. Try again or use a hint.'
      )
    }
  }

  // Generate problem using Gemini or fallback generator
  async function generateProblem() {
    if (loading) return

    setLoading(true)
    setAiError('')
    setFeedback('')
    setAnswer('')
    setShowHint(false)
    setShowSolution(false)
    setProblemSource(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ level })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          [data.error, data.details]
            .filter(Boolean)
            .join(': ') || 'Problem generation failed'
        )
      }

      // Validate the server response
      if (
        typeof data.question !== 'string' ||
        !data.question.trim() ||
        typeof data.answer !== 'number' ||
        !Number.isFinite(data.answer) ||
        typeof data.hint !== 'string' ||
        !data.hint.trim() ||
        !Array.isArray(data.steps) ||
        !data.steps.length ||
        !data.steps.every(
          step =>
            typeof step === 'string' &&
            step.trim()
        )
      ) {
        throw new Error('Invalid problem response')
      }

      setAiProblem({
        title: problems[level].title,
        question: data.question,
        answer: data.answer,
        hint: data.hint,
        steps: data.steps
      })

      // Identify the generator
      setProblemSource(data.source || 'unknown')

    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred'
      )

    } finally {
      setLoading(false)
    }
  }

  // Student registration page
  if (!student) {
    return (
      <StudentWelcome onRegister={registerStudent} />
    )
  }

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="brand">

          <div className="logo-box">
            <img
              src="/sdu-logo.png"
              alt="SDU University Logo"
              className="sdu-logo"
            />
          </div>

          <div className="brand-text">
            <div className="logo">
              MathAdapt AI
            </div>

            <div className="brand-subtitle">
              AI for Differentiated Learning
            </div>
          </div>

        </div>

        <div className="student-header">
          <span>
            Welcome, {student.name}!
          </span>

          <span>
            Year {student.year}
          </span>

          <button onClick={logoutStudent}>
            Exit
          </button>
        </div>
      </header>

      <main className="main">

        {/* HERO SECTION */}
        <section className="hero">

          <div className="hero-left">

            <span className="eyebrow">
              AI-POWERED MATHEMATICS LEARNING
            </span>

            <h1>
              Mathematics made smarter, simpler,
              and more personal.
            </h1>

            <p>
              This educational web application helps
              students solve mathematical tasks at
              different difficulty levels with hints,
              feedback, and guided solutions.
            </p>

            <div className="hero-tags">
              <span>Foundation</span>
              <span>Standard</span>
              <span>Advanced</span>
            </div>

          </div>

          <div className="hero-right">

            <div className="info-card">
              <h3>Project Goal</h3>

              <p>
                One core math topic adapted into
                3 levels of difficulty using AI.
              </p>
            </div>

            <div className="info-card">
              <h3>Learning Support</h3>

              <p>
                Instant feedback, step-by-step help,
                and student-friendly practice.
              </p>
            </div>

          </div>
        </section>

        {/* LEARNING SECTION */}
        <section className="learning-card">

          <h2>
            Choose your learning level
          </h2>

          <p className="subtitle">
            Select the level that best matches your
            current mathematical skills.
          </p>

          {/* DIFFICULTY LEVELS */}
          <div className="levels">

            {Object.entries(problems).map(
              ([key, item]) => (

                <button
                  key={key}
                  className={
                    `level ${
                      level === key ? 'active' : ''
                    }`
                  }
                  onClick={() => changeLevel(key)}
                >

                  <span className="level-icon">
                    {key === 'foundation'
                      ? '🌱'
                      : key === 'standard'
                      ? '📘'
                      : '🚀'}
                  </span>

                  <strong>
                    {item.title}
                  </strong>

                  <small>
                    {key === 'foundation'
                      ? 'Easy level with clear guidance'
                      : key === 'standard'
                      ? 'Regular curriculum problem solving'
                      : 'Advanced multi-step challenge'}
                  </small>

                </button>
              )
            )}

          </div>

          {/* MATHEMATICAL PROBLEM */}
          <div className="problem-box">

            <div className="problem-top">
              <span>
                MATHEMATICAL TASK
              </span>

              <span className="difficulty">
                {problem.title}
              </span>
            </div>

            <h3>
              Solve for x
            </h3>

            <div className="equation">
              {problem.question
                .replace(
                  /^\s*solve\s+(?:the\s+equation\s+)?for\s+x\s*:\s*/i,
                  ''
                )
                .trim()}
            </div>

            {/* GENERATION BUTTON */}
            <button
              className="generate-btn"
              onClick={generateProblem}
              disabled={loading}
            >

              {loading
                ? 'Generating problem...'
                : '✦ Generate New Math Problem'}

            </button>

            {/* GENERATION SOURCE */}
            {problemSource && (
              <div
                className="generation-status"
                role="status"
              >
                {problemSource === 'gemini'
                  ? '✦ AI Generated — Google Gemini'
                  : problemSource === 'fallback'
                  ? '⚡ Practice Mode — Verified Math Generator'
                  : 'Problem generated — source unavailable'}
              </div>
            )}

            {/* ERROR MESSAGE */}
            {aiError && (
              <div
                className="feedback"
                role="alert"
              >
                Generation Error: {aiError}
              </div>
            )}

            {/* STUDENT ANSWER */}
            <label htmlFor="answer">
              Your answer
            </label>

            <input
              id="answer"
              type="number"
              placeholder="Enter the value of x"
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  checkAnswer()
                }
              }}
            />

            <button
              className="primary-btn"
              onClick={checkAnswer}
              disabled={loading}
            >
              Check Answer
            </button>

            {/* ANSWER FEEDBACK */}
            {feedback && (
              <div className="feedback">
                {feedback}
              </div>
            )}

            {/* HINT AND SOLUTION BUTTONS */}
            <div className="action-buttons">

              <button
                onClick={() =>
                  setShowHint(!showHint)
                }
              >
                {showHint
                  ? 'Hide Hint'
                  : 'Show Hint'}
              </button>

              <button
                onClick={() =>
                  setShowSolution(!showSolution)
                }
              >
                {showSolution
                  ? 'Hide Solution'
                  : 'Show Solution'}
              </button>

            </div>

            {/* HINT */}
            {showHint && (
              <div className="help-box">

                <strong>
                  Hint
                </strong>

                <p>
                  {problem.hint}
                </p>

              </div>
            )}

            {/* STEP-BY-STEP SOLUTION */}
            {showSolution && (
              <div className="help-box">

                <strong>
                  Step-by-step solution
                </strong>

                {problem.steps.map(
                  (step, index) => (

                    <p key={index}>
                      {index + 1}.{' '}
                      {step.replace(
                        /^\s*(?:step\s*)?\d+\s*[.:)\-]\s*/i,
                        ''
                      )}
                    </p>

                  )
                )}

              </div>
            )}

          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer>
        MathAdapt AI | SDU University |
        Educational Technology & AI
      </footer>

    </div>
  )
}

export default App
