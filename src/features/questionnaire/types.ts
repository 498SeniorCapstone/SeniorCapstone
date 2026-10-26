export type WeightUnit = 'kg' | 'lb'
export type HeightUnit = 'cm' | 'ft'
export type Currency = 'USD'

export interface MealPreferences {
  username: string
  age: string
  weight: string
  weightUnit: WeightUnit
  height: string
  heightUnit: HeightUnit
  heightInches: string
  goals: string[]
  dietaryNeeds: string[]
  people: string
  days: string
  cookingTime: string
  weeklyBudget: { currency: Currency; amount: number | null; flexible: boolean }
  foodsToSkip: string[]
  equipment: string[]
  otherEquipment: string
  ingredients: string
  obstacles: string[]
  obstacleDetails: string
}

export type FormErrors = Record<string, string>

export const TOTAL_STEPS = 8
export const DRAFT_KEY = 'meal-preferences-questionnaire-draft'
export const initialAnswers: MealPreferences = {
  username: '', age: '', weight: '', weightUnit: 'kg', height: '', heightUnit: 'cm', heightInches: '',
  goals: [], dietaryNeeds: [], people: '1', days: '', cookingTime: '',
  weeklyBudget: { currency: 'USD', amount: null, flexible: false }, foodsToSkip: [], equipment: [],
  otherEquipment: '', ingredients: '', obstacles: [], obstacleDetails: '',
}


