
import { parse } from 'mathjs'

const EPS = 1e-10

// Convert an expression to a*x + b.
function coefficients(node) {
  if (node.isParenthesisNode) {
    return coefficients(node.content)
  }

  if (node.isConstantNode) {
    const value = Number(node.value)

    if (!Number.isFinite(value)) {
      throw new Error('Invalid number')
    }

    return [0, value]
  }

  if (node.isSymbolNode && node.name === 'x') {
    return [1, 0]
  }

  if (!node.isOperatorNode) {
    throw new Error('Unsupported expression')
  }

  const args = node.args.map(coefficients)

  if (node.op === '+') {
    return args.reduce(
      ([a, b], [c, d]) => [a + c, b + d],
      [0, 0]
    )
  }

  if (node.op === '-') {
    if (args.length === 1) {
      return [-args[0][0], -args[0][1]]
    }

    return args.slice(1).reduce(
      ([a, b], [c, d]) => [a - c, b - d],
      args[0]
    )
  }

  if (node.op === '*') {
    return args.reduce(([a, b], [c, d]) => {
      if (Math.abs(a * c) > EPS) {
        throw new Error('Nonlinear equation')
      }

      return [a * d + b * c, b * d]
    }, [0, 1])
  }

  if (node.op === '/') {
    if (args.length !== 2) {
      throw new Error('Unsupported division')
    }

    const [a, b] = args[0]
    const [c, d] = args[1]

    if (Math.abs(c) > EPS || Math.abs(d) < EPS) {
      throw new Error('Unsupported division')
    }

    return [a / d, b / d]
  }

  throw new Error('Unsupported operation')
}

function cleanNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error('Invalid calculation')
  }

  if (Math.abs(value) < EPS) return 0

  return Number(value.toPrecision(12))
}

function variableTerm(a) {
  const value = cleanNumber(a)

  if (value === 0) return '0'
  if (value === 1) return 'x'
  if (value === -1) return '-x'

  return `${value}x`
}

function expression(a, b) {
  const x = cleanNumber(a)
  const constant = cleanNumber(b)

  if (x === 0) return String(constant)
  if (constant === 0) return variableTerm(x)

  const sign = constant < 0 ? '-' : '+'

  return `${variableTerm(x)} ${sign} ${Math.abs(constant)}`
}

export function validateLinearProblem(problem, level = 'standard') {
  if (
    !problem ||
    typeof problem.question !== 'string' ||
    typeof problem.answer !== 'number' ||
    !Number.isFinite(problem.answer) ||
    typeof problem.hint !== 'string' ||
    !problem.hint.trim()
  ) {
    throw new Error('Invalid problem format')
  }

  const equation = problem.question
    .replace(
      /^\s*solve\s+(?:the\s+equation\s+)?for\s+x\s*:\s*/i,
      ''
    )
    .trim()

  if (!/^[0-9xX+\-*/().=\s]+$/.test(equation)) {
    throw new Error('Unsupported equation format')
  }

  const parts = equation.toLowerCase().split('=')

  if (parts.length !== 2) {
    throw new Error('Equation must have exactly one equals sign')
  }

  const [leftA, leftB] = coefficients(parse(parts[0]))
  const [rightA, rightB] = coefficients(parse(parts[1]))

  const a = leftA - rightA
  const b = rightB - leftB

  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    Math.abs(a) < EPS
  ) {
    throw new Error('Equation has no unique solution')
  }

  const correctAnswer = b / a

  if (!Number.isFinite(correctAnswer)) {
    throw new Error('Invalid answer')
  }

  const tolerance = 1e-6 * Math.max(1, Math.abs(correctAnswer))

  if (Math.abs(problem.answer - correctAnswer) > tolerance) {
    throw new Error('Incorrect generated answer')
  }

  // Build algebraic steps from verified coefficients.
  // Do not trust unverified AI-generated solution steps.
  const simplified =
    `${expression(leftA, leftB)} = ${expression(rightA, rightB)}`

  const collected =
    `${variableTerm(a)} = ${cleanNumber(b)}`

  const finalStep = `x = ${cleanNumber(correctAnswer)}`

  let steps
  let hint

  if (level === 'foundation') {
    steps = [
      `Start with: ${equation}`,
      `Simplify both sides: ${simplified}`,
      `Move the x terms to one side and constants to the other: ${collected}`,
      `Divide by ${cleanNumber(a)}: ${finalStep}`
    ]

    hint = 'First simplify the equation. Then isolate x using the opposite operation.'

  } else if (level === 'advanced') {
    steps = [
      `Expand brackets and combine like terms: ${simplified}`,
      `Collect variable terms and constants: ${collected}`,
      `Divide by the coefficient of x: ${finalStep}`
    ]

    hint = 'Expand brackets, combine like terms, and isolate the variable.'

  } else {
    steps = [
      `Simplify the equation: ${simplified}`,
      `Collect the x terms: ${collected}`,
      `Solve for x: ${finalStep}`
    ]

    hint = 'Simplify both sides, collect variable terms, and divide by the coefficient of x.'
  }

  return {
    title:
      level.charAt(0).toUpperCase() + level.slice(1),
    question: equation,
    answer: correctAnswer,
    hint,
    steps
  }
}
