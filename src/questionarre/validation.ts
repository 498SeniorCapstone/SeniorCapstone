import type { FormErrors, MealPreferences, StepId } from './types'

export function validateAnswers(answers: MealPreferences, target: StepId): FormErrors {
  const errors: FormErrors = {}
  if (target === 'about-you') {
    if (answers.age && (!/^\d+$/.test(answers.age) || Number(answers.age) <= 0)) errors.age = 'Enter a positive whole number.'
    if (answers.weight && (!/^\d+(\.\d+)?$/.test(answers.weight) || Number(answers.weight) <= 0)) errors.weight = 'Enter a positive number.'
    if (answers.height && (!/^\d+(\.\d+)?$/.test(answers.height) || Number(answers.height) <= 0)) errors.height = 'Enter a positive number.'
    if (answers.heightUnit === 'ft' && answers.heightInches && (!/^\d+(\.\d+)?$/.test(answers.heightInches) || Number(answers.heightInches) < 0 || Number(answers.heightInches) >= 12)) errors.heightInches = 'Use 0-11 inches.'
  }
  if (target === 'goals' && !answers.goals.length) errors.goals = 'Choose at least one goal.'
  if (target === 'dietary-needs' && !answers.dietaryNeeds.length) errors.dietaryNeeds = 'Choose an option, including "None" if you have no dietary needs.'
  if (target === 'cooking-schedule') {
    if (!/^\d+$/.test(answers.people) || Number(answers.people) <= 0) errors.people = 'Enter a positive whole number.'
    if (!answers.days) errors.days = 'Choose how many days to plan for.'
    if (!answers.cookingTime) errors.cookingTime = 'Choose a cooking time.'
  }
  return errors
}
