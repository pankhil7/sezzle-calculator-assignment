const ERROR_MAP: Record<string, string> = {
  'Division by zero': "Oops! You can't divide by zero.",
  'Cannot take square root of a negative number': 'Square root requires a positive number.',
  'Invalid number': 'Please enter a valid number.',
  'Result is out of computable range': 'The result is too large to compute.',
  'Cannot raise a negative number to a fractional exponent': 'Cannot raise a negative number to a fractional power.',
  'Zero cannot be raised to a negative power': 'Zero cannot be raised to a negative power.',
  'Field required': 'Please provide all required inputs.',
  'Input should be a valid number': 'Please enter a valid number.',
}

export function toUserFriendlyError(error: unknown): string {
  // 422 Pydantic validation errors come as an array under detail
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail

  if (Array.isArray(detail)) {
    const msg = (detail[0] as { msg?: string })?.msg ?? ''
    for (const [key, friendly] of Object.entries(ERROR_MAP)) {
      if (msg.includes(key)) return friendly
    }
    return 'Please check your inputs and try again.'
  }

  if (typeof detail === 'string') {
    for (const [key, friendly] of Object.entries(ERROR_MAP)) {
      if (detail.includes(key)) return friendly
    }
  }

  return 'Something went wrong. Please try again.'
}
