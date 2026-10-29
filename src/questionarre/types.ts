export type WeightUnit = 'kg' | 'lb'
export type HeightUnit = 'cm' | 'ft'

export interface MealPreferences {
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
  foodsToSkip: string[]
  equipment: string[]
  otherEquipment: string
  ingredients: string
  obstacles: string[]
  obstacleDetails: string
}

export type FormErrors = Record<string, string>

export const TOTAL_STEPS = 7
export const DRAFT_KEY = 'meal-preferences-questionnaire-draft'
export const initialAnswers: MealPreferences = {
  age: '', weight: '', weightUnit: 'kg', height: '', heightUnit: 'cm', heightInches: '',
  goals: [], dietaryNeeds: [], people: '1', days: '', cookingTime: '',
  foodsToSkip: [], equipment: [],
  otherEquipment: '', ingredients: '', obstacles: [], obstacleDetails: '',
}


