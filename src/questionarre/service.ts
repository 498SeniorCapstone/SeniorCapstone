import type { MealPreferences } from './types'
import { supabase } from '../lib/supabase'
import { formatSupabaseError } from '../lib/supabaseError'

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

async function getAuthenticatedUser() {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()
  if (error) throw formatSupabaseError(error, 'Could not restore the authenticated user.')
  if (!data.user) throw new Error('No authenticated user is available.')
  return { client, user: data.user }
}

export async function getQuestionnaireStatus() {
  const { client, user } = await getAuthenticatedUser()
  const { data, error } = await client
    .from('users')
    .select('questionnare_completed')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (error) throw formatSupabaseError(error, 'Could not load questionnaire status.')
  if (!data) throw new Error('Your account is not linked to a public.users row yet. Apply the auth-user link migration and map existing accounts before continuing.')
  return { userId: user.id, isComplete: data?.questionnare_completed === true }
}

export async function submitPreferences(answers: MealPreferences) {
  const { client, user } = await getAuthenticatedUser()
  const { data, error } = await client
    .from('questionnaire_responses')
    .upsert({
      user_id: user.id,
      answers,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select('completed_at')
    .single()

  if (error) throw formatSupabaseError(error, 'Could not save questionnaire answers.')
  if (!data?.completed_at) throw new Error('The questionnaire completion was not confirmed.')

  const { data: profile, error: profileError } = await client
    .from('users')
    .update({ questionnare_completed: true })
    .eq('auth_user_id', user.id)
    .select('questionnare_completed')
    .maybeSingle()

  if (profileError) throw formatSupabaseError(profileError, 'Could not update questionnaire completion.')
  if (profile?.questionnare_completed !== true) throw new Error('Your answers were saved, but completion could not be confirmed.')
  return { ok: true as const, answers }
}

export const DEMO_ANSWER_STORAGE_GAPS = [
  'weight and weightUnit (the database unit convention is not documented)',
  'height and heightUnit (the database unit convention is not documented)',
  'people',
  'days',
  'cookingTime',
  'ingredients',
  'obstacles',
  'obstacleDetails',
]

export async function submitDemoPreferences(profileId: number, answers: MealPreferences) {
  const { client, user } = await getAuthenticatedUser()
  const appliances = [...answers.equipment, ...(answers.otherEquipment.trim() ? [answers.otherEquipment.trim()] : [])]
  const goals = answers.goals.map(goal => goal.trim()).filter(Boolean)
  const update = {
    age: answers.age ? Number(answers.age) : null,
    dietary_restrictions: answers.dietaryNeeds,
    disliked_ingredients: answers.foodsToSkip,
    kitchen_appliances: appliances,
    primary_goal: goals[0] ?? null,
    secondary_goal: goals.slice(1).join(', ') || null,
    questionnare_completed: true,
  }
  const { data, error } = await client
    .from('users')
    .update(update)
    .eq('id', profileId)
    .eq('auth_user_id', user.id)
    .select('id, auth_user_id, questionnare_completed')
    .maybeSingle()

  if (error) throw formatSupabaseError(error, 'Could not save the demo questionnaire.')
  if (!data || data.id !== profileId || data.auth_user_id !== user.id || data.questionnare_completed !== true) {
    throw new Error(`The demo questionnaire update did not affect profile id ${profileId}.`)
  }
  return { ok: true as const, answers }
}
