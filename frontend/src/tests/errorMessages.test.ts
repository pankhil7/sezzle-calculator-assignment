import { describe, it, expect } from 'vitest'
import { toUserFriendlyError } from '../util/errorMessages'

describe('toUserFriendlyError', () => {
  it('maps Division by zero from string detail', () => {
    const err = { response: { data: { detail: 'Division by zero' } } }
    expect(toUserFriendlyError(err)).toBe("Oops! You can't divide by zero.")
  })

  it('maps sqrt of negative from string detail', () => {
    const err = { response: { data: { detail: 'Cannot take square root of a negative number' } } }
    expect(toUserFriendlyError(err)).toBe('Square root requires a positive number.')
  })

  it('maps Invalid number from string detail', () => {
    const err = { response: { data: { detail: 'Invalid number: NaN' } } }
    expect(toUserFriendlyError(err)).toBe('Please enter a valid number.')
  })

  it('maps Result is out of computable range from string detail', () => {
    const err = { response: { data: { detail: 'Result is out of computable range' } } }
    expect(toUserFriendlyError(err)).toBe('The result is too large to compute.')
  })

  it('maps fractional exponent error from string detail', () => {
    const err = { response: { data: { detail: 'Cannot raise a negative number to a fractional exponent' } } }
    expect(toUserFriendlyError(err)).toBe('Cannot raise a negative number to a fractional power.')
  })

  it('maps zero to negative power from string detail', () => {
    const err = { response: { data: { detail: 'Zero cannot be raised to a negative power' } } }
    expect(toUserFriendlyError(err)).toBe('Zero cannot be raised to a negative power.')
  })

  it('maps Field required from array detail (Pydantic 422)', () => {
    const err = { response: { data: { detail: [{ msg: 'Field required' }] } } }
    expect(toUserFriendlyError(err)).toBe('Please provide all required inputs.')
  })

  it('maps Input should be a valid number from array detail (Pydantic 422)', () => {
    const err = { response: { data: { detail: [{ msg: 'Input should be a valid number' }] } } }
    expect(toUserFriendlyError(err)).toBe('Please enter a valid number.')
  })

  it('returns generic message for unknown array detail', () => {
    const err = { response: { data: { detail: [{ msg: 'some unknown pydantic error' }] } } }
    expect(toUserFriendlyError(err)).toBe('Please check your inputs and try again.')
  })

  it('returns generic message for unknown string detail', () => {
    const err = { response: { data: { detail: 'some unknown backend error' } } }
    expect(toUserFriendlyError(err)).toBe('Something went wrong. Please try again.')
  })

  it('returns generic message for network error with no response', () => {
    const err = new Error('Network Error')
    expect(toUserFriendlyError(err)).toBe('Something went wrong. Please try again.')
  })

  it('returns generic message for null error', () => {
    expect(toUserFriendlyError(null)).toBe('Something went wrong. Please try again.')
  })
})
