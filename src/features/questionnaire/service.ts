import type { MealPreferences } from './types'
import { supabase } from '../../lib/supabase'

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

async function getAuthenticatedUser() {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('No authenticated user is available.')
  return { client, user: data.user }
}

export async function getQuestionnaireStatus() {
  const { client, user } = await getAuthenticatedUser()
  const { data, error } = await client
    .from('questionnaire_responses')
    .select('completed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return { userId: user.id, isComplete: Boolean(data?.completed_at) }
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

  if (error) throw error
  if (!data?.completed_at) throw new Error('The questionnaire completion was not confirmed.')
  return { ok: true as const, answers }
}


