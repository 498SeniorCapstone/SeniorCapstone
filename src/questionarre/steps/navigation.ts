import { QUESTIONNAIRE_STEPS } from './stepDefinitions'
import type { StepId } from '../types'

export function stepIndex(stepId: StepId) {
  return QUESTIONNAIRE_STEPS.findIndex(step => step.id === stepId)
}

export function stepIdAt(index: number): StepId {
  return QUESTIONNAIRE_STEPS[index]?.id ?? QUESTIONNAIRE_STEPS[0].id
}
