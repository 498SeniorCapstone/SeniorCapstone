import { DRAFT_KEY, initialAnswers, TOTAL_STEPS } from './types'
import type { MealPreferences } from './types'

interface DraftPayload { version: number; answers: unknown; step: number }

function draftKey(userId: string) { return `${DRAFT_KEY}:${userId}` }

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function normalizeAnswers(value: unknown): MealPreferences | null {
  if (!value || typeof value !== 'object') return null
  const a = value as Record<string, unknown>
  if (typeof a.age !== 'string' || typeof a.weight !== 'string' ||
    (a.weightUnit !== 'kg' && a.weightUnit !== 'lb') || typeof a.height !== 'string' ||
    (a.heightUnit !== 'cm' && a.heightUnit !== 'ft') || typeof a.heightInches !== 'string' ||
    typeof a.people !== 'string' || typeof a.days !== 'string' || typeof a.cookingTime !== 'string' ||
    !isStringArray(a.goals) || !isStringArray(a.dietaryNeeds) || !isStringArray(a.foodsToSkip) ||
    !isStringArray(a.equipment) || typeof a.otherEquipment !== 'string' || typeof a.ingredients !== 'string' ||
    !isStringArray(a.obstacles) || typeof a.obstacleDetails !== 'string') return null

  return {
    age: a.age,
    weight: a.weight,
    weightUnit: a.weightUnit,
    height: a.height,
    heightUnit: a.heightUnit,
    heightInches: a.heightInches,
    goals: a.goals,
    dietaryNeeds: a.dietaryNeeds,
    people: a.people,
    days: a.days,
    cookingTime: a.cookingTime,
    foodsToSkip: a.foodsToSkip,
    equipment: a.equipment,
    otherEquipment: a.otherEquipment,
    ingredients: a.ingredients,
    obstacles: a.obstacles,
    obstacleDetails: a.obstacleDetails,
  }
}

export function restoreDraft(userId: string) {
  try {
    const key = draftKey(userId)
    const raw = sessionStorage.getItem(key)
    if (!raw) return { answers: initialAnswers, step: 1 }
    const parsed = JSON.parse(raw) as DraftPayload
    const answers = normalizeAnswers(parsed.answers)
    const hadBudgetStep = Boolean(parsed.answers && typeof parsed.answers === 'object' && 'weeklyBudget' in parsed.answers)
    const step = hadBudgetStep && parsed.step >= 5 ? parsed.step - 1 : parsed.step
    if (![2, 3, 4].includes(parsed.version) || !answers || !Number.isInteger(step) || step < 1 || step > TOTAL_STEPS) {
      sessionStorage.removeItem(key)
      return { answers: initialAnswers, step: 1 }
    }
    return { answers, step }
  } catch {
    try { sessionStorage.removeItem(draftKey(userId)) } catch { /* storage can be unavailable */ }
    return { answers: initialAnswers, step: 1 }
  }
}

export function saveDraft(userId: string, answers: MealPreferences, step: number) {
  try { sessionStorage.setItem(draftKey(userId), JSON.stringify({ version: 4, answers, step })) } catch { /* storage can be unavailable */ }
}

export function clearDraft(userId: string) {
  try { sessionStorage.removeItem(draftKey(userId)) } catch { /* storage can be unavailable */ }
}
