export function formatSupabaseError(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return new Error(fallback)
  const candidate = error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown }
  const parts = [
    typeof candidate.message === 'string' ? candidate.message : fallback,
    typeof candidate.code === 'string' ? `code: ${candidate.code}` : '',
    typeof candidate.details === 'string' ? `details: ${candidate.details}` : '',
    typeof candidate.hint === 'string' ? `hint: ${candidate.hint}` : '',
  ].filter(Boolean)
  return new Error(parts.join(' | '))
}
