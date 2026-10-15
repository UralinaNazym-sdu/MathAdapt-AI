
import express from 'express'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateLinearProblem } from './linearMath.js'
import { generateFallbackProblem } from './fallbackGenerator.js'

dotenv.config()

const app = express()
app.use(express.json({ limit: '10kb' }))

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null

// Stop calling Gemini temporarily when quota is exceeded.
let quotaBlockedUntil = 0

function isQuotaError(error) {
  const message = String(error?.message ?? '')

  return error?.status === 429 ||
    error?.code === 429 ||
    /\b429\b|RESOURCE_EXHAUSTED|quota exceeded|rate limit/i.test(message)
}

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
    foundation: 'Create a simple one-step linear equation.',
    standard: 'Create a linear equation requiring two or three steps.',
    advanced: 'Create a multi-step linear equation with brackets on both sides.'
  }

  const prompt = `
You are an educational mathematics tutor.
Generate ONE new linear equation in x.
Difficulty: ${level}
${levelInstructions[level]}

Requirements:
- Exactly one real solution.
- Use numbers, x, +, -, *, / and brackets.
- Do not use powers, fractions written with LaTeX, other variables or mathematical functions.
- The question must contain ONLY the equation.
- Do not include "Solve for x:" in the question.
- The answer must be a finite JSON number.
- Make the hint suitable for the difficulty level.
- Provide detailed and mathematically correct steps.
- Verify the answer by substitution.

Return only JSON with the following fields:
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

  // First try Gemini.
  if (ai && Date.now() >= quotaBlockedUntil) {
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

        const verified = validateLinearProblem(data, level)
        verified.source = 'gemini'

        verified.title =
          level.charAt(0).toUpperCase() + level.slice(1)

        return res.json(verified)

      } catch (error) {
        console.warn(
          `Generation attempt ${attempt} failed:`,
          error.message
        )

        if (isQuotaError(error)) {
          quotaBlockedUntil = Date.now() + 60 * 60 * 1000

          console.warn(
            'Gemini quota exhausted; switching to fallback generator.'
          )

          break
        }
      }
    }
  }

  // If Gemini fails, generate a verified problem locally.
  try {
    const fallback = generateFallbackProblem(level)

    console.info(
      `Generated verified fallback problem (${level}).`
    )

    return res.json(fallback)

  } catch (error) {
    console.error(
      'Fallback generation failed:',
      error.message
    )

    return res.status(500).json({
      error: 'Could not generate a math problem'
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
