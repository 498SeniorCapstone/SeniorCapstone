export function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

export function validateUsername(value: string) {
  if (!normalizeUsername(value)) return 'Enter a username to continue.'
  return ''
}

export function validateEmail(value: string) {
  if (!/^\S+@\S+\.\S+$/.test(value.trim())) return 'Enter a valid email address.'
  return ''
}

export function validatePassword(value: string) {
  if (value.length < 6) return 'Password must be at least 6 characters.'
  return ''
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  if (password !== confirmation) return 'Passwords do not match.'
  return ''
}
