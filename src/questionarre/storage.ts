import { DRAFT_KEY, initialAnswers, TOTAL_STEPS } from './types'
import type { MealPreferences } from './types'

interface DraftPayload { version: number; answers: MealPreferences; step: number }

function draftKey(userId: string) { return `${DRAFT_KEY}:${userId}` }

function isValidAnswers(value: unknown): value is MealPreferences {
  if (!value || typeof value !== 'object') return false
  const a = value as MealPreferences
  const b = a.weeklyBudget
  return typeof a.username === 'string' && typeof a.age === 'string' && typeof a.weight === 'string' &&
    typeof a.height === 'string' && typeof a.people === 'string' && Array.isArray(a.goals) &&
    Array.isArray(a.dietaryNeeds) && Array.isArray(a.foodsToSkip) && Array.isArray(a.equipment) &&
    Array.isArray(a.obstacles) && !!b && b.currency === 'USD' &&
    (b.amount === null || typeof b.amount === 'number') && typeof b.flexible === 'boolean'
}

export function restoreDraft(userId: string) {
  try {
    const key = draftKey(userId)
    const raw = sessionStorage.getItem(key)
    if (!raw) return { answers: initialAnswers, step: 1 }
    const parsed = JSON.parse(raw) as DraftPayload
    const step = parsed.version === 2 && parsed.step >= 5 ? parsed.step + 1 : parsed.step
    if (![2, 3].includes(parsed.version) || !isValidAnswers(parsed.answers) || !Number.isInteger(step) || step < 1 || step > TOTAL_STEPS) {
      sessionStorage.removeItem(key)
      return { answers: initialAnswers, step: 1 }
    }
    return { answers: { ...parsed.answers, weeklyBudget: { ...parsed.answers.weeklyBudget, currency: 'USD', amount: parsed.answers.weeklyBudget.currency === 'USD' ? parsed.answers.weeklyBudget.amount : null } }, step }
  } catch {
    try { sessionStorage.removeItem(draftKey(userId)) } catch { /* storage can be unavailable */ }
    return { answers: initialAnswers, step: 1 }
  }
}

export function saveDraft(userId: string, answers: MealPreferences, step: number) {
  try { sessionStorage.setItem(draftKey(userId), JSON.stringify({ version: 3, answers, step })) } catch { /* storage can be unavailable */ }
}

export function clearDraft(userId: string) {
  try { sessionStorage.removeItem(draftKey(userId)) } catch { /* storage can be unavailable */ }
}


