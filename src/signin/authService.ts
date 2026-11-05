import type { User } from '@supabase/supabase-js'
import { supabase, supabaseConfigurationError } from '../lib/supabase'
import { formatSupabaseError } from '../lib/supabaseError'
import type { AccountUpgradeResult, SignInValues, SignUpValues } from './types'

const pendingUpgradePrefix = 'anonymous-account-upgrade:'

function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigurationError)
  return supabase
}

export async function getCurrentAuthUser(): Promise<User | null> {
  const client = requireSupabase()
  const { data, error } = await client.auth.getSession()
  if (error) throw formatSupabaseError(error, 'Could not restore your authentication session.')
  return data.session?.user ?? null
}

export async function signInWithPassword(values: SignInValues): Promise<User> {
  const { data, error } = await requireSupabase().auth.signInWithPassword({
    email: values.email.trim(),
    password: values.password,
  })
  if (error) throw error
  if (!data.user || !data.session) throw new Error('Sign-in did not create an active session.')
  return data.user
}

export async function signUpWithPassword(values: SignUpValues) {
  const { data, error } = await requireSupabase().auth.signUp({
    email: values.email.trim(),
    password: values.password,
    options: { data: { username: values.username.trim(), display_name: values.username.trim() } },
  })
  if (error) throw error
  if (!data.user) throw new Error('Sign-up did not return an account. Try again.')
  return data
}

function pendingUpgradeKey(userId: string) {
  return `${pendingUpgradePrefix}${userId}`
}

function markUpgradePending(userId: string) {
  sessionStorage.setItem(pendingUpgradeKey(userId), 'true')
}

function clearUpgradePending(userId: string) {
  sessionStorage.removeItem(pendingUpgradeKey(userId))
}

export function hasPendingAccountUpgrade(userId: string) {
  return sessionStorage.getItem(pendingUpgradeKey(userId)) === 'true'
}

export async function upgradeAnonymousAccount(email: string, password: string): Promise<AccountUpgradeResult> {
  const client = requireSupabase()
  const user = await getCurrentAuthUser()
  if (!user) throw new Error('Your session has expired. Start again to save your account.')

  if (user.is_anonymous) {
    markUpgradePending(user.id)
    const { error } = await client.auth.updateUser({ email: email.trim() })
    if (error) throw formatSupabaseError(error, 'Could not link that email to your demo account.')
  }

  try {
    const { error } = await client.auth.updateUser({ password })
    if (error) throw error
    clearUpgradePending(user.id)
    return 'complete'
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (/confirm|verif|anonymous/i.test(message)) return 'confirmation-required'
    throw formatSupabaseError(error, 'Could not set your account password.')
  }
}

export async function finishAnonymousAccountUpgrade(password: string): Promise<void> {
  const user = await getCurrentAuthUser()
  if (!user) throw new Error('Your session has expired. Start again to save your account.')
  const { error } = await requireSupabase().auth.updateUser({ password })
  if (error) throw formatSupabaseError(error, 'Could not finish saving your account.')
  clearUpgradePending(user.id)
}
