import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { initialAnswers, type MealPreferences } from '../questionarre/types'

const GOALS = ['Quick and easy', 'High protein', 'Healthy comfort food', 'Family favorites', 'Low calorie', 'Gut friendly', 'Fakeaway']
const DIETARY_NEEDS = ['None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten free', 'Dairy free', 'Nut free']
const EQUIPMENT = ['Hob/stovetop', 'Oven', 'Microwave', 'Air fryer', 'Slow cooker', 'Pressure cooker', 'Blender']
const OBSTACLES = ['Not enough time', 'Not sure what to cook', 'Food costs', 'Limited cooking confidence', 'Hard to stay consistent', 'Different preferences at home', 'Other']
const COOKING_TIMES = ['15 minutes or less', 'Up to 30 minutes', 'Up to 45 minutes', 'Up to 60 minutes', 'More than 60 minutes']

type SettingsProfile = {
  id: number
  username: string | null
  age: number | null
  dietary_restrictions: string[] | null
  disliked_ingredients: string[] | null
  kitchen_appliances: string[] | null
  primary_goal: string | null
  secondary_goal: string | null
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return fallback
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function readAnswers(value: unknown): MealPreferences {
  if (!value || typeof value !== 'object') throw new Error('Your saved preferences could not be read.')
  const saved = value as Record<string, unknown>
  if (
    typeof saved.age !== 'string' || typeof saved.weight !== 'string' ||
    (saved.weightUnit !== 'kg' && saved.weightUnit !== 'lb') ||
    typeof saved.height !== 'string' ||
    (saved.heightUnit !== 'cm' && saved.heightUnit !== 'ft') ||
    typeof saved.heightInches !== 'string' ||
    !isStringArray(saved.goals) || !isStringArray(saved.dietaryNeeds) ||
    typeof saved.people !== 'string' || typeof saved.days !== 'string' ||
    typeof saved.cookingTime !== 'string' || !isStringArray(saved.foodsToSkip) ||
    !isStringArray(saved.equipment) || typeof saved.otherEquipment !== 'string' ||
    typeof saved.ingredients !== 'string' || !isStringArray(saved.obstacles) ||
    typeof saved.obstacleDetails !== 'string'
  ) {
    throw new Error('Your saved preferences are incomplete. Please refresh and try again.')
  }

  return {
    age: saved.age,
    weight: saved.weight,
    weightUnit: saved.weightUnit,
    height: saved.height,
    heightUnit: saved.heightUnit,
    heightInches: saved.heightInches,
    goals: saved.goals,
    dietaryNeeds: saved.dietaryNeeds,
    people: saved.people,
    days: saved.days,
    cookingTime: saved.cookingTime,
    foodsToSkip: saved.foodsToSkip,
    equipment: saved.equipment,
    otherEquipment: saved.otherEquipment,
    ingredients: saved.ingredients,
    obstacles: saved.obstacles,
    obstacleDetails: saved.obstacleDetails,
  }
}

function profileAnswers(profile: SettingsProfile): MealPreferences {
  const appliances = profile.kitchen_appliances ?? []
  const goals = [profile.primary_goal, ...(profile.secondary_goal?.split(', ') ?? [])]
    .filter((goal): goal is string => Boolean(goal))

  return {
    ...initialAnswers,
    age: profile.age == null ? '' : String(profile.age),
    goals,
    dietaryNeeds: profile.dietary_restrictions ?? [],
    foodsToSkip: profile.disliked_ingredients ?? [],
    equipment: appliances.filter(item => EQUIPMENT.includes(item)),
    otherEquipment: appliances.filter(item => !EQUIPMENT.includes(item) && item !== 'Other').join(', '),
  }
}

function listFromText(value: string) {
  return value.split(/[,\n]/).map(item => item.trim()).filter(Boolean)
}

function Settings() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [answers, setAnswers] = useState<MealPreferences>(initialAnswers)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      if (!supabase) {
        setError('Supabase is not configured.')
        setLoading(false)
        return
      }

      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        if (!authData.user) throw new Error('Sign in to view your settings.')

        const [profileResult, answersResult] = await Promise.all([
          supabase.from('users')
            .select('id, username, age, dietary_restrictions, disliked_ingredients, kitchen_appliances, primary_goal, secondary_goal')
            .eq('auth_user_id', authData.user.id)
            .maybeSingle(),
          supabase.from('questionnaire_responses')
            .select('answers')
            .eq('user_id', authData.user.id)
            .maybeSingle(),
        ])

        if (profileResult.error) throw profileResult.error
        if (!profileResult.data) throw new Error('Your profile could not be found.')
        if (answersResult.error) throw answersResult.error

        const profile = profileResult.data as SettingsProfile
        const loadedAnswers = answersResult.data
          ? readAnswers(answersResult.data.answers)
          : profileAnswers(profile)

        if (active) {
          setUsername(profile.username ?? '')
          setAnswers(loadedAnswers)
        }
      } catch (reason) {
        if (active) setError(getErrorMessage(reason, 'Could not load your settings.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => { active = false }
  }, [])

  const update = <K extends keyof MealPreferences>(key: K, value: MealPreferences[K]) => {
    setAnswers(current => ({ ...current, [key]: value }))
    setError('')
    setNotice('')
  }

  const toggle = (key: 'goals' | 'dietaryNeeds' | 'equipment' | 'obstacles', value: string) => {
    const current = answers[key]
    let next = current.includes(value) ? current.filter(item => item !== value) : [...current, value]

    if (key === 'dietaryNeeds') {
      if (value === 'None') next = next.includes('None') ? ['None'] : []
      else if (next.includes(value)) next = next.filter(item => item !== 'None')
    }
    update(key, next)
  }

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || saving) return
    setError('')
    setNotice('')

    const displayName = username.trim()
    if (!displayName) {
      setError('Username cannot be empty.')
      return
    }
    if (answers.age && (!Number.isFinite(Number(answers.age)) || Number(answers.age) < 1)) {
      setError('Enter a valid age, or leave it blank.')
      return
    }

    setSaving(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!authData.user) throw new Error('Your session expired. Sign in again to save your settings.')

      const { error: answersError } = await supabase.from('questionnaire_responses').upsert({
        user_id: authData.user.id,
        answers,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      if (answersError) throw answersError

      const goals = answers.goals.map(goal => goal.trim()).filter(Boolean)
      const appliances = [...answers.equipment, ...listFromText(answers.otherEquipment)]
      const normalizedUsername = displayName.toLowerCase()
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .update({
          username: normalizedUsername,
          display_name: displayName,
          age: answers.age ? Number(answers.age) : null,
          dietary_restrictions: answers.dietaryNeeds,
          disliked_ingredients: answers.foodsToSkip,
          kitchen_appliances: appliances,
          primary_goal: goals[0] ?? null,
          secondary_goal: goals.slice(1).join(', ') || null,
        })
        .eq('auth_user_id', authData.user.id)
        .select('id')
        .maybeSingle()
      if (profileError) {
        if (profileError.code === '23505') throw new Error('That username is already taken.')
        throw profileError
      }
      if (!profile) throw new Error('Your profile was not updated. Refresh and try again.')

      const { error: metadataError } = await supabase.auth.updateUser({
        data: { username: normalizedUsername, display_name: displayName },
      })
      if (metadataError) throw metadataError
      setUsername(normalizedUsername)
      setNotice('Your settings have been saved.')
    } catch (reason) {
      setError(getErrorMessage(reason, 'Could not save your settings.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="settings-page"><p role="status">Loading your settings…</p></main>

  return (
    <main className="settings-page">
      <style>{`
        .settings-page { width: min(100% - 32px, 860px); margin: 0 auto; padding: 28px 0 56px; color: #33432b; text-align: left; }
        .settings-page h1 { margin: 0 0 8px; font-size: 2rem; }
        .settings-page > p { margin: 0 0 24px; }
        .settings-page .settings-section { margin: 20px 0; padding: 24px; border: 1px solid rgba(51,67,43,.2); border-radius: 14px; background: rgba(255,255,255,.55); }
        .settings-page .settings-section h2 { margin: 0 0 6px; font-size: 1.35rem; }
        .settings-page .section-description { margin: 0 0 18px; color: #59634f; }
        .settings-page .settings-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px; }
        .settings-page .settings-field { display: flex; flex-direction: column; gap: 6px; font-weight: 600; }
        .settings-page input, .settings-page select, .settings-page textarea { width: 100%; min-height: 42px; padding: 9px 11px; border: 1px solid #87917b; border-radius: 7px; background: #fffdf8; color: #24311e; font: inherit; }
        .settings-page textarea { min-height: 90px; resize: vertical; }
        .settings-page fieldset { margin: 0; padding: 0; border: 0; }
        .settings-page legend { margin-bottom: 10px; font-weight: 700; }
        .settings-page .settings-options { display: flex; flex-wrap: wrap; gap: 9px; }
        .settings-page .settings-option { display: inline-flex; align-items: center; gap: 7px; padding: 8px 11px; border: 1px solid #87917b; border-radius: 999px; background: #fffdf8; cursor: pointer; }
        .settings-page .settings-option input { width: 16px; min-height: 16px; height: 16px; margin: 0; accent-color: #33432b; }
        .settings-page .settings-message { margin: 14px 0; padding: 11px 14px; border-radius: 8px; }
        .settings-page .settings-error { background: #fff0ed; color: #8c241b; }
        .settings-page .settings-notice { background: #edf5e8; color: #33432b; }
        .settings-page .settings-actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 24px; }
        .settings-page .settings-button { min-height: 42px; padding: 9px 16px; border: 0; border-radius: 8px; background: #33432b; color: #fff8e9; font: inherit; font-weight: 700; cursor: pointer; }
        .settings-page .settings-button:disabled { cursor: wait; opacity: .65; }
        .settings-page .settings-back { border: 1px solid #33432b; background: transparent; color: #33432b; }
        @media (max-width: 520px) { .settings-page .settings-section { padding: 18px; } .settings-page .settings-actions { flex-direction: column-reverse; } }
      `}</style>
      <h1>Settings</h1>
      <p>Update your profile and the preferences used to tailor your meal ideas.</p>

      {error && <p className="settings-message settings-error" role="alert">{error}</p>}
      {notice && <p className="settings-message settings-notice" role="status">{notice}</p>}

      <form onSubmit={event => void save(event)}>
        <section className="settings-section" aria-labelledby="about-you-heading">
          <h2 id="about-you-heading">About you</h2>
          <p className="section-description">Personal details you shared with us.</p>
          <div className="settings-fields">
            <label className="settings-field">Username
              <input value={username} onChange={event => { setUsername(event.target.value); setNotice('') }} autoComplete="username" />
            </label>
            <label className="settings-field">Age
              <input type="number" min="1" value={answers.age} onChange={event => update('age', event.target.value)} />
            </label>
            <label className="settings-field">Weight
              <span style={{ display: 'flex', gap: 8 }}>
                <input type="number" min="0" step="any" value={answers.weight} onChange={event => update('weight', event.target.value)} />
                <select aria-label="Weight unit" value={answers.weightUnit} onChange={event => update('weightUnit', event.target.value as MealPreferences['weightUnit'])}>
                  <option value="kg">kg</option><option value="lb">lb</option>
                </select>
              </span>
            </label>
            <label className="settings-field">Height
              <span style={{ display: 'flex', gap: 8 }}>
                <input type="number" min="0" step="any" value={answers.height} onChange={event => update('height', event.target.value)} />
                <select aria-label="Height unit" value={answers.heightUnit} onChange={event => update('heightUnit', event.target.value as MealPreferences['heightUnit'])}>
                  <option value="cm">cm</option><option value="ft">feet</option>
                </select>
              </span>
            </label>
            {answers.heightUnit === 'ft' && <label className="settings-field">Additional inches
              <input type="number" min="0" max="11" step="any" value={answers.heightInches} onChange={event => update('heightInches', event.target.value)} />
            </label>}
          </div>
        </section>

        <section className="settings-section" aria-labelledby="goals-heading">
          <h2 id="goals-heading">Goals</h2>
          <p className="section-description">What kinds of meals would you like more often?</p>
          <OptionGroup options={GOALS} selected={answers.goals} onToggle={value => toggle('goals', value)} label="Meal goals" />
        </section>

        <section className="settings-section" aria-labelledby="dietary-heading">
          <h2 id="dietary-heading">Dietary needs</h2>
          <p className="section-description">Select dietary preferences or restrictions that should guide your meals.</p>
          <OptionGroup options={DIETARY_NEEDS} selected={answers.dietaryNeeds} onToggle={value => toggle('dietaryNeeds', value)} label="Dietary preferences" />
        </section>

        <section className="settings-section" aria-labelledby="schedule-heading">
          <h2 id="schedule-heading">Cooking schedule</h2>
          <p className="section-description">Set the rhythm and time commitment for your meal plans.</p>
          <div className="settings-fields">
            <label className="settings-field">People to cook for
              <input type="number" min="1" value={answers.people} onChange={event => update('people', event.target.value)} />
            </label>
            <label className="settings-field">Days per week
              <select value={answers.days} onChange={event => update('days', event.target.value)}>
                <option value="">Choose days</option>
                {['1', '2', '3', '4', '5', '6', '7'].map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </label>
            <label className="settings-field">Cooking time per day
              <select value={answers.cookingTime} onChange={event => update('cookingTime', event.target.value)}>
                <option value="">Choose a time</option>
                {COOKING_TIMES.map(time => <option key={time} value={time}>{time}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="skip-heading">
          <h2 id="skip-heading">Foods to skip</h2>
          <p className="section-description">List ingredients you prefer not to see, separated by commas or new lines.</p>
          <label className="settings-field" htmlFor="settings-foods">Foods and ingredients
            <textarea id="settings-foods" value={answers.foodsToSkip.join(', ')} onChange={event => update('foodsToSkip', listFromText(event.target.value))} placeholder="For example: mushrooms, olives" />
          </label>
        </section>

        <section className="settings-section" aria-labelledby="kitchen-heading">
          <h2 id="kitchen-heading">What's in your kitchen?</h2>
          <p className="section-description">Choose your equipment and add ingredients you already have.</p>
          <OptionGroup options={EQUIPMENT} selected={answers.equipment} onToggle={value => toggle('equipment', value)} label="Cooking equipment" />
          <label className="settings-field" htmlFor="settings-other-equipment" style={{ marginTop: 16 }}>Other equipment
            <input id="settings-other-equipment" value={answers.otherEquipment} onChange={event => update('otherEquipment', event.target.value)} placeholder="For example: rice cooker" />
          </label>
          <label className="settings-field" htmlFor="settings-ingredients" style={{ marginTop: 16 }}>Ingredients you have
            <textarea id="settings-ingredients" value={answers.ingredients} onChange={event => update('ingredients', event.target.value)} placeholder="For example: rice, eggs, chickpeas, frozen vegetables" />
          </label>
        </section>

        <section className="settings-section" aria-labelledby="obstacles-heading">
          <h2 id="obstacles-heading">Obstacles</h2>
          <p className="section-description">Let us know what makes meal planning or cooking more difficult.</p>
          <OptionGroup options={OBSTACLES} selected={answers.obstacles} onToggle={value => toggle('obstacles', value)} label="Meal planning obstacles" />
          <label className="settings-field" htmlFor="settings-obstacle-details" style={{ marginTop: 16 }}>Anything else you'd like us to know?
            <textarea id="settings-obstacle-details" value={answers.obstacleDetails} onChange={event => update('obstacleDetails', event.target.value)} />
          </label>
        </section>

        <div className="settings-actions">
          <button type="button" className="settings-button settings-back" onClick={() => navigate('/Dashboard')}>Back to dashboard</button>
          <button type="submit" className="settings-button" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
        </div>
      </form>
    </main>
  )
}

function OptionGroup({ options, selected, onToggle, label }: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  label: string
}) {
  return (
    <fieldset>
      <legend>{label}</legend>
      <div className="settings-options">
        {options.map(option => (
          <label className="settings-option" key={option}>
            <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default Settings
