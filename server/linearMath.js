
import { parse } from 'mathjs'

// Represent an expression as a*x + b
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

    return [
      args[0][0] - args[1][0],
      args[0][1] - args[1][1]
    ]
  }

  if (node.op === '*') {
    return args.reduce(([a, b], [c, d]) => {
      if (Math.abs(a * c) > 1e-12) {
        throw new Error('Nonlinear equation')
      }

      return [
        a * d + b * c,
        b * d
      ]
    }, [0, 1])
  }

  if (node.op === '/') {
    const [a, b] = args[0]
    const [c, d] = args[1]

    if (Math.abs(c) > 1e-12 || Math.abs(d) < 1e-12) {
      throw new Error('Unsupported division')
    }

    return [a / d, b / d]
  }

  throw new Error('Unsupported operation')
}

export function validateLinearProblem(problem) {
  if (
    !problem ||
    typeof problem.question !== 'string' ||
    typeof problem.answer !== 'number' ||
    !Number.isFinite(problem.answer) ||
    typeof problem.hint !== 'string' ||
    !problem.hint.trim() ||
    !Array.isArray(problem.steps) ||
    problem.steps.length === 0 ||
    !problem.steps.every(
      step => typeof step === 'string' && step.trim()
    )
  ) {
    throw new Error('Invalid problem format')
  }

  const equation = problem.question
    .replace(
      /^\s*solve\s+(?:the\s+equation\s+)?for\s+x\s*:\s*/i,
      ''
    )
    .trim()

  // Only simple linear equation characters are allowed.
  if (!/^[0-9xX+\-*/().=\s]+$/.test(equation)) {
    throw new Error('Unsupported equation format')
  }

  const parts = equation.toLowerCase().split('=')

  if (parts.length !== 2) {
    throw new Error('Equation must contain one equals sign')
  }

  const [leftA, leftB] = coefficients(parse(parts[0]))
  const [rightA, rightB] = coefficients(parse(parts[1]))

  const a = leftA - rightA
  const b = rightB - leftB

  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    Math.abs(a) < 1e-10
  ) {
    throw new Error('Equation has no unique solution')
  }

  const correctAnswer = b / a

  if (!Number.isFinite(correctAnswer)) {
    throw new Error('Invalid calculated answer')
  }

  if (
    Math.abs(problem.answer - correctAnswer) >
    1e-6 * Math.max(1, Math.abs(correctAnswer))
  ) {
    throw new Error('Gemini generated an incorrect answer')
  }

  return {
    ...problem,
    question: equation,
    answer: correctAnswer
  }
}
