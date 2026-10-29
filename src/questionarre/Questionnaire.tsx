import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { clearDraft, restoreDraft, saveDraft } from './storage'
import { validateAnswers } from './validation'
import { TOTAL_STEPS } from './types'
import type { FormErrors, MealPreferences } from './types'

const goals = ['Quick and easy', 'High protein', 'Healthy comfort food', 'Family favorites', 'Low calorie', 'Gut friendly', 'Fakeaway']
const dietary = ['None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten free', 'Dairy free', 'Nut free']
const equipment = ['Hob/stovetop', 'Oven', 'Microwave', 'Air fryer', 'Slow cooker', 'Pressure cooker', 'Blender']
const obstacles = ['Not enough time', 'Not sure what to cook', 'Food costs', 'Limited cooking confidence', 'Hard to stay consistent', 'Different preferences at home', 'Other']
const commonFoods = ['Mushrooms', 'Shellfish', 'Peanuts', 'Tree nuts', 'Olives', 'Anchovies', 'Blue cheese', 'Liver', 'Tofu']

export interface QuestionnaireProps {
  onComplete: (answers: MealPreferences) => Promise<void>
  draftScope: string
}

export function Questionnaire({ onComplete, draftScope }: QuestionnaireProps) {
  const [restored] = useState(() => restoreDraft(draftScope))
  const [answers, setAnswers] = useState(restored.answers)
  const [step, setStep] = useState(restored.step)
  const [errors, setErrors] = useState<FormErrors>({})
  const [foodDraft, setFoodDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const firstInvalidRef = useRef<HTMLElement | null>(null)

  useEffect(() => { headingRef.current?.focus() }, [step])
  useEffect(() => { saveDraft(draftScope, answers, step) }, [answers, draftScope, step])

  const update = (key: keyof MealPreferences, value: string | string[]) => {
    setAnswers(current => ({ ...current, [key]: value }))
    setErrors(current => { const next = { ...current }; delete next[key]; return next })
  }

  const toggle = (key: 'dietaryNeeds' | 'goals' | 'equipment' | 'obstacles', option: string) => {
    const current = answers[key]
    let next
    if (key === 'dietaryNeeds') {
      if (option === 'None') next = current.includes('None') ? [] : ['None']
      else {
        const restrictions = current.filter(value => !['None', 'Vegetarian', 'Vegan', 'Pescatarian'].includes(value))
        const lifestyle = ['Vegetarian', 'Vegan', 'Pescatarian'].includes(option) ? [option] : []
        next = [...lifestyle, ...(current.includes(option) ? restrictions : [...restrictions, option])]
      }
    } else next = current.includes(option) ? current.filter(value => value !== option) : [...current, option]
    update(key, next)
  }

  const addFood = (value = foodDraft) => {
    const food = value.trim()
    if (!food || answers.foodsToSkip.some(item => item.toLowerCase() === food.toLowerCase())) return
    update('foodsToSkip', [...answers.foodsToSkip, food])
    setFoodDraft('')
  }

  const validate = (target = step) => {
    const next = validateAnswers(answers, target)
    setErrors(next)
    return !Object.keys(next).length
  }

  const goTo = (next: number) => {
    setStep(next)
    setErrors({})
    setSubmissionError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const continueStep = () => {
    if (!validate()) setTimeout(() => firstInvalidRef.current?.focus(), 0)
    else goTo(step + 1)
  }

  const finish = async () => {
    if (submitting || !validate(TOTAL_STEPS)) {
      if (!submitting) setTimeout(() => firstInvalidRef.current?.focus(), 0)
      return
    }
    setSubmitting(true)
    setSubmissionError('')
    try {
      await onComplete(answers)
      clearDraft(draftScope)
    } catch {
      setSubmissionError('We could not save your responses. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="questionnaire-root app-shell">
    <div className="progress-wrap" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
      <div className="progress-meta"><span className="progress-label"><span className="pizza-icon" aria-hidden="true" />Progress</span><span>{step} / {TOTAL_STEPS}</span></div>
      <div className="progress-track">{Array.from({ length: TOTAL_STEPS }, (_, index) => <span className={`progress-segment ${index < step ? 'filled' : ''}`} key={index} />)}</div>
    </div>
    <form className="questionnaire" onSubmit={event => { event.preventDefault(); if (step === TOTAL_STEPS) void finish() }} noValidate>
      {step === 1 && <Step title="About you" intro="Age, height, and weight are optional." headingRef={headingRef}>
        <p className="optional-note">Age, height, and weight can be skipped.</p>
        <div className="field-grid">
          <Field id="age" label="Age" optional error={errors.age} value={answers.age} onChange={value => update('age', value)} type="number" min="1" placeholder="e.g. 29" />
          <Field id="weight" label="Weight" optional error={errors.weight} value={answers.weight} onChange={value => update('weight', value)} type="number" min="0" step="any" placeholder="e.g. 68" suffix={<select aria-label="Weight unit" value={answers.weightUnit} onChange={event => update('weightUnit', event.target.value)}><option>kg</option><option>lb</option></select>} />
          <Field id="height" label="Height" optional error={errors.height} value={answers.height} onChange={value => update('height', value)} type="number" min="0" step="any" placeholder={answers.heightUnit === 'cm' ? 'e.g. 172' : 'e.g. 5'} suffix={<select aria-label="Height unit" value={answers.heightUnit} onChange={event => update('heightUnit', event.target.value)}><option value="cm">cm</option><option value="ft">feet</option></select>} />
          {answers.heightUnit === 'ft' && <Field id="heightInches" label="Additional inches" optional error={errors.heightInches} value={answers.heightInches} onChange={value => update('heightInches', value)} type="number" min="0" max="11" step="any" placeholder="e.g. 8" />}
        </div>
      </Step>}
      {step === 2 && <Step title="What's your food vibe?" intro="Choose the kinds of meals you want more often." headingRef={headingRef}><p className="choice-hint">Pick all that fit</p><ChoiceGrid options={goals} selected={answers.goals} onToggle={option => toggle('goals', option)} /></Step>}
      {step === 3 && <Step title="Any dietary needs?" intro="None is exclusive. Vegetarian, vegan, and pescatarian are mutually exclusive." headingRef={headingRef}><p className="choice-hint">Pick all that fit</p><ChoiceGrid options={dietary} selected={answers.dietaryNeeds} onToggle={option => toggle('dietaryNeeds', option)} error={errors.dietaryNeeds} invalidRef={firstInvalidRef} /></Step>}
      {step === 4 && <Step title="Cooking schedule" intro="Set the rhythm for your week." headingRef={headingRef}>
        <Field id="people" label="How many people are you cooking for?" value={answers.people} onChange={value => update('people', value)} type="number" min="1" error={errors.people} invalidRef={firstInvalidRef} />
        <fieldset><legend>How many days a week would you like to plan for? <span className="required">Required</span></legend><ChoiceGrid compact options={['1', '2', '3', '4', '5', '6', '7']} selected={[answers.days]} onToggle={option => update('days', option)} error={errors.days} invalidRef={firstInvalidRef} /></fieldset>
        <fieldset><legend>How much time would you like to spend cooking each day? <span className="required">Required</span></legend><ChoiceGrid options={['15 minutes or less', 'Up to 30 minutes', 'Up to 45 minutes', 'Up to 60 minutes', 'More than 60 minutes']} selected={[answers.cookingTime]} onToggle={option => update('cookingTime', option)} error={errors.cookingTime} invalidRef={firstInvalidRef} /></fieldset>
      </Step>}
      {step === 5 && <Step title="Foods to skip" intro="Add anything you'd rather not see." headingRef={headingRef}>
        <div className="field"><label htmlFor="food-draft">Add a food <span className="optional">Optional</span></label><div className="add-row"><input id="food-draft" value={foodDraft} onChange={event => setFoodDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addFood() } }} placeholder="Type a food and press Enter" /><button type="button" className="add-button" onClick={() => addFood()}>Add</button></div></div>
        <div className="pick-label">Common picks</div><div className="quick-picks">{commonFoods.map(food => <button type="button" key={food} className={`quick-pick ${answers.foodsToSkip.includes(food) ? 'chosen' : ''}`} onClick={() => addFood(food)}>{food}</button>)}</div>
        <div className="chips" aria-live="polite">{answers.foodsToSkip.map(food => <span className="chip" key={food}>{food}<button type="button" aria-label={`Remove ${food}`} onClick={() => update('foodsToSkip', answers.foodsToSkip.filter(item => item !== food))}>×</button></span>)}</div>
      </Step>}
      {step === 6 && <Step title="What's in your kitchen?" intro="Tell us what you have available." headingRef={headingRef}>
        <fieldset><legend>What cooking equipment do you have? <span className="optional">Optional</span></legend><p className="choice-hint">Pick all that fit</p><ChoiceGrid options={equipment} selected={answers.equipment} onToggle={option => toggle('equipment', option)} />{answers.equipment.includes('Other') && <div className="field nested-field"><label htmlFor="other-equipment">Tell us about it <span className="optional">Optional</span></label><input id="other-equipment" value={answers.otherEquipment} onChange={event => update('otherEquipment', event.target.value)} placeholder="e.g. rice cooker" /></div>}<button type="button" className={`choice-card other-toggle ${answers.equipment.includes('Other') ? 'selected' : ''}`} onClick={() => toggle('equipment', 'Other')}><span className="choice-indicator">{answers.equipment.includes('Other') ? '✓' : ''}</span><span>Other</span></button></fieldset>
        <div className="field"><label htmlFor="ingredients">What ingredients do you already have? <span className="optional">Optional</span></label><textarea id="ingredients" value={answers.ingredients} onChange={event => update('ingredients', event.target.value)} placeholder="For example: rice, eggs, chickpeas, frozen vegetables..." rows={4} /></div>
      </Step>}
      {step === 7 && <Step title="What's getting in the way?" intro="Choose anything that sounds familiar." headingRef={headingRef}>
        <p className="choice-hint">Pick all that fit</p><ChoiceGrid options={obstacles} selected={answers.obstacles} onToggle={option => toggle('obstacles', option)} />
        <div className="field"><label htmlFor="obstacle-details">Anything else you'd like us to know? <span className="optional">Optional</span></label><textarea id="obstacle-details" value={answers.obstacleDetails} onChange={event => update('obstacleDetails', event.target.value)} rows={4} placeholder="A little more detail is welcome, but not required." /></div>
      </Step>}
      {submissionError && <Error>{submissionError}</Error>}
      <div className="form-actions">{step > 1 && <button type="button" className="button secondary" onClick={() => goTo(step - 1)} disabled={submitting}>Back</button>}{step < TOTAL_STEPS ? <button type="button" className="button primary" onClick={continueStep}>Continue</button> : <button type="submit" className="button primary" disabled={submitting}>{submitting ? 'Submitting...' : "Let's go"}</button>}</div>
    </form>
  </main>
}

function Step({ title, intro, children, headingRef }: { title: string; intro: string; children: ReactNode; headingRef: { current: HTMLHeadingElement | null } }) { return <section className="step-panel"><h2 ref={headingRef} tabIndex={-1}>{title}</h2><p className="step-intro">{intro}</p><div className="step-content">{children}</div></section> }
function Error({ children }: { children: ReactNode }) { return <p className="error" role="alert">{children}</p> }
interface FieldProps { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; min?: string; max?: string; step?: string; placeholder?: string; optional?: boolean; suffix?: ReactNode; error?: string; invalidRef?: { current: HTMLElement | null } }
function Field({ id, label, value, onChange, type = 'text', min, max, step, placeholder, optional, suffix, error, invalidRef }: FieldProps) { return <section className="field"><label htmlFor={id}>{label} <span className={optional ? 'optional' : 'required'}>{optional ? 'Optional' : 'Required'}</span></label><div className={suffix ? 'input-with-suffix' : ''}><input ref={element => { if (error && invalidRef) invalidRef.current = element }} id={id} value={value} onChange={event => onChange(event.target.value)} type={type} min={min} max={max} step={step} placeholder={placeholder} aria-invalid={!!error} />{suffix}</div>{error && <Error>{error}</Error>}</section> }
interface ChoiceGridProps { options: string[]; selected: string[]; onToggle: (option: string) => void; error?: string; compact?: boolean; invalidRef?: { current: HTMLElement | null } }
function ChoiceGrid({ options, selected, onToggle, error, compact, invalidRef }: ChoiceGridProps) { return <><div className={`choice-grid ${compact ? 'compact' : ''}`} role="group">{options.map((option, index) => <button ref={element => { if (error && index === 0 && invalidRef) invalidRef.current = element }} type="button" className={`choice-card ${selected.includes(option) ? 'selected' : ''}`} aria-pressed={selected.includes(option)} key={option} onClick={() => onToggle(option)}><span className="choice-indicator">{selected.includes(option) ? '✓' : ''}</span><span>{option}</span></button>)}</div>{error && <Error>{error}</Error>}</> }
