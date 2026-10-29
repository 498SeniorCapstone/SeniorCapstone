import { supabase, supabaseConfigurationError } from '../lib/supabase'
import { formatSupabaseError } from '../lib/supabaseError'
import { hasPendingAccountUpgrade } from './authService'
import { normalizeUsername } from './validation'

export interface DemoProfile {
  id: number
  username: string
  display_name: string | null
  auth_user_id: string
  questionnare_completed: boolean | null
  is_anonymous: boolean
  upgrade_pending: boolean
}

function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigurationError)
  return supabase
}

async function getCurrentSession() {
  const client = requireSupabase()
  const { data: sessionData, error: sessionError } = await client.auth.getSession()
  if (sessionError) throw formatSupabaseError(sessionError, 'Could not restore the demo session.')
  return { client, user: sessionData.session?.user ?? null }
}

async function createAnonymousSession() {
  const client = requireSupabase()

  const { data, error } = await client.auth.signInAnonymously()
  if (error) throw formatSupabaseError(error, 'Could not start the anonymous demo session.')
  if (!data.user || !data.session) throw new Error('Anonymous sign-in did not create an active session.')
  return { client, user: data.user }
}

async function loadOwnedProfile(client: NonNullable<typeof supabase>, user: { id: string; is_anonymous?: boolean }): Promise<DemoProfile | null> {
  const { data, error } = await client
    .from('users')
    .select('id, username, display_name, auth_user_id, questionnare_completed')
    .eq('auth_user_id', user.id)

  if (error) throw formatSupabaseError(error, 'Could not load the anonymous demo profile.')
  const rows = data ?? []
  if (rows.length > 1) throw new Error('This anonymous account has multiple profiles. Resolve the duplicate auth_user_id rows before continuing.')
  if (rows.length !== 1) return null
  return {
    ...rows[0] as DemoProfile,
    is_anonymous: user.is_anonymous === true,
    upgrade_pending: hasPendingAccountUpgrade(user.id),
  }
}

export async function restoreDemoProfile(): Promise<DemoProfile | null> {
  const { client, user } = await getCurrentSession()
  if (!user) return null
  return loadOwnedProfile(client, user)
}

export async function selectDemoProfile(displayName: string): Promise<DemoProfile> {
  const current = await getCurrentSession()
  const client = current.client
  const user = current.user ?? (await createAnonymousSession()).user
  const normalizedDisplayName = displayName.trim()
  const normalizedUsername = normalizeUsername(normalizedDisplayName)
  const existing = await loadOwnedProfile(client, user)
  if (existing) return existing

  const { data: created, error: createError } = await client
    .from('users')
    .insert({ auth_user_id: user.id, username: normalizedUsername, display_name: normalizedDisplayName, email: user.is_anonymous ? null : user.email, questionnare_completed: false })
    .select('id, username, display_name, auth_user_id, questionnare_completed')
    .single()

  if (createError) {
    if (createError.code === '23505' && /username/i.test(`${createError.message} ${createError.details ?? ''}`)) {
      throw new Error('That username is already taken.')
    }
    const formatted = formatSupabaseError(createError, 'Could not create the demo profile.')
    throw formatted
  }
  if (!created) throw new Error('The demo profile was not returned after creation.')
  return {
    ...created as DemoProfile,
    is_anonymous: user.is_anonymous === true,
    upgrade_pending: hasPendingAccountUpgrade(user.id),
  }
}

export async function syncOwnedProfileIdentity(): Promise<void> {
  const { client, user } = await getCurrentSession()
  if (!user || user.is_anonymous || !user.email) return
  const metadataName = typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name.trim() : ''
  const update = metadataName ? { email: user.email, display_name: metadataName } : { email: user.email }
  const { error } = await client
    .from('users')
    .update(update)
    .eq('auth_user_id', user.id)
  if (error) throw formatSupabaseError(error, 'Could not synchronize your profile details.')
}

export async function signOutDemo(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw formatSupabaseError(error, 'Could not reset the demo session.')
}
