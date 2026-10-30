import { DRAFT_KEY, initialAnswers } from './types'
import type { MealPreferences, StepId } from './types'
import { QUESTIONNAIRE_STEPS } from './steps/stepDefinitions'
import { stepIdAt } from './steps/navigation'

interface DraftPayload { version: number; answers: unknown; step?: number; stepId?: unknown }

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
    if (!raw) return { answers: initialAnswers, stepId: QUESTIONNAIRE_STEPS[0].id }
    const parsed = JSON.parse(raw) as DraftPayload
    const answers = normalizeAnswers(parsed.answers)
    // New drafts use stable IDs. Older numeric drafts are translated here,
    // including the removed budget-step offset, before the UI sees them.
    const stepId = typeof parsed.stepId === 'string' && QUESTIONNAIRE_STEPS.some(step => step.id === parsed.stepId)
      ? parsed.stepId as StepId
      : legacyStepId(parsed)
    if (![2, 3, 4, 5].includes(parsed.version) || !answers || !stepId) {
      sessionStorage.removeItem(key)
      return { answers: initialAnswers, stepId: QUESTIONNAIRE_STEPS[0].id }
    }
    return { answers, stepId }
  } catch {
    try { sessionStorage.removeItem(draftKey(userId)) } catch { /* storage can be unavailable */ }
    return { answers: initialAnswers, stepId: QUESTIONNAIRE_STEPS[0].id }
  }
}

function legacyStepId(payload: DraftPayload): StepId | null {
  if (!Number.isInteger(payload.step)) return null
  const hadBudgetStep = Boolean(payload.answers && typeof payload.answers === 'object' && 'weeklyBudget' in payload.answers)
  const currentStep = hadBudgetStep && payload.step! >= 5 ? payload.step! - 1 : payload.step!
  if (currentStep < 1 || currentStep > QUESTIONNAIRE_STEPS.length) return null
  return stepIdAt(currentStep - 1)
}

export function saveDraft(userId: string, answers: MealPreferences, stepId: StepId) {
  try { sessionStorage.setItem(draftKey(userId), JSON.stringify({ version: 5, answers, stepId })) } catch { /* storage can be unavailable */ }
}

export function clearDraft(userId: string) {
  try { sessionStorage.removeItem(draftKey(userId)) } catch { /* storage can be unavailable */ }
}
