import { supabase } from '../lib/supabase'
import { formatSupabaseError } from '../lib/supabaseError'

export interface UserStats {
  age: number | null
  goals: string[]
  dietaryNeeds: string[]
  foodsToSkip: string[]
  appliances: string[]
  questionnaireCompleted: boolean
}

export async function getUserStats(): Promise<UserStats> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data: auth, error: authError } = await supabase.auth.getUser()
  if (authError) throw formatSupabaseError(authError, 'Could not load your account.')
  if (!auth.user) throw new Error('Please log in to see your stats.')

  const { data, error } = await supabase
    .from('users')
    .select('age, primary_goal, secondary_goal, dietary_restrictions, disliked_ingredients, kitchen_appliances, questionnare_completed')
    .eq('auth_user_id', auth.user.id)
    .maybeSingle()

  if (error) throw formatSupabaseError(error, 'Could not load your stats.')
  if (!data) throw new Error('Your account is not linked to a profile yet.')

  // primary_goal holds the first goal; secondary_goal holds the rest, joined with ", "
  const goals = [
    ...(data.primary_goal ? [data.primary_goal] : []),
    ...(data.secondary_goal ? data.secondary_goal.split(', ') : []),
  ]

  return {
    age: data.age ?? null,
    goals,
    dietaryNeeds: data.dietary_restrictions ?? [],
    foodsToSkip: data.disliked_ingredients ?? [],
    appliances: data.kitchen_appliances ?? [],
    questionnaireCompleted: data.questionnare_completed === true,
  }
}