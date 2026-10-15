
import express from 'express'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateLinearProblem } from './linearMath.js'

dotenv.config()

const app = express()
app.use(express.json({ limit: '10kb' }))

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'AI server is running' })
})


app.post('/api/generate', async (req, res) => {
  const { level } = req.body ?? {}

  if (!['foundation', 'standard', 'advanced'].includes(level)) {
    return res.status(400).json({
      error: 'Invalid difficulty level'
    })
  }

  const levelInstructions = {
    foundation:
      'Create a simple one-step linear equation.',
    standard:
      'Create a linear equation requiring two or three steps.',
    advanced:
      'Create a multi-step linear equation with brackets on both sides.'
  }

  const prompt = `
You are an educational mathematics tutor.

Generate ONE new linear equation in x.

Difficulty: ${level}
${levelInstructions[level]}

Requirements:
- Exactly one real solution.
- Use numbers, x, +, -, *, / and brackets.
- Do not use powers, fractions written with LaTeX,
  other variables or mathematical functions.
- The question must contain ONLY the equation.
- Do not include "Solve for x:" in the question.
- The answer must be a finite JSON number.
- Make the hint suitable for the difficulty level.
- Provide detailed and mathematically correct steps.
- Verify the answer by substitution.
- Return only JSON with the following fields:

{
  "title": "${level}",
  "question": "3x + 5 = 20",
  "answer": 5,
  "hint": "Subtract 5 first.",
  "steps": [
    "Subtract 5 from both sides.",
    "Divide both sides by 3."
  ]
}
`

  try {
    let lastError = ''

    // Try up to 3 times if Gemini produces invalid math.
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        })

        const data = JSON.parse(response.text)

        // Independently verify the equation and answer.
        const verified = validateLinearProblem(data)

        verified.title =
          level.charAt(0).toUpperCase() + level.slice(1)

        return res.json(verified)
      } catch (error) {
        lastError = error.message
        console.warn(
          `Generation attempt ${attempt} failed:`,
          lastError
        )
      }
    }

    console.error('All generation attempts failed:', lastError)

    return res.status(502).json({
      error: 'Could not generate a verified math problem'
    })
  } catch (error) {
    console.error('Server error:', error.message)

    return res.status(500).json({
      error: 'AI server error'
    })
  }
})



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')

  app.use(express.static(distPath))

  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MathAdapt AI running on port ${PORT}`)
})