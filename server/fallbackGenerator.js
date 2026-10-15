
import { validateLinearProblem } from './linearMath.js'

const integer = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const nonZero = (min, max) => {
  let number

  do {
    number = integer(min, max)
  } while (number === 0)

  return number
}

const signed = (n) =>
  n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`

export function generateFallbackProblem(level) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = integer(-10, 10)

    let question
    let hint
    let steps

    if (level === 'foundation') {
      const a = nonZero(2, 9)

      if (Math.random() < 0.5) {
        question = `${a}x = ${a * x}`

        hint = 'Divide both sides by the coefficient of x.'

        steps = [
          `Divide both sides by ${a}.`,
          `x = ${x}.`
        ]
      } else {
        const b = nonZero(-12, 12)

        question = `x ${signed(b)} = ${x + b}`

        hint = 'Move the constant to the other side.'

        steps = [
          `Subtract (${b}) from both sides.`,
          `x = ${x}.`
        ]
      }

    } else if (level === 'standard') {
      const a = nonZero(2, 9)
      const b = nonZero(-15, 15)

      question = `${a}x ${signed(b)} = ${a * x + b}`

      hint =
        'Move the constant first, then divide by the coefficient of x.'

      steps = [
        `Subtract (${b}) from both sides: ${a}x = ${a * x}.`,
        `Divide both sides by ${a}: x = ${x}.`
      ]

    } else if (level === 'advanced') {
      const a = nonZero(2, 6)
      const d = nonZero(-5, 5)

      if (a === d) continue

      const b = nonZero(-7, 7)
      const c = nonZero(-10, 10)
      const e = a * (x + b) + c - d * x

      question =
        `${a}(x ${signed(b)}) ${signed(c)} = ${d}x ${signed(e)}`

      hint =
        'Expand the brackets, collect x terms on one side, then isolate x.'

      steps = [
        `Expand the brackets: ${a}x ${signed(a * b + c)} = ${d}x ${signed(e)}.`,
        `Collect the x terms: ${a - d}x = ${e - a * b - c}.`,
        `Divide by ${a - d}: x = ${x}.`
      ]

    } else {
      throw new Error('Invalid difficulty level')
    }

    try {
    const verified = validateLinearProblem({
        title:
            level.charAt(0).toUpperCase() + level.slice(1),
        question,
        answer: x,
        hint,
        steps
    }, level)

    return {
        ...verified,
        source: 'fallback'
    }  

    } catch (error) {
      console.warn(
        'Fallback validation retry:',
        error.message
      )
    }
  }

  throw new Error(
    'Failed to generate a valid fallback problem'
  )
}
