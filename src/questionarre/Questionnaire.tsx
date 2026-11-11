import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent, ReactNode } from 'react'
import { clearDraft, restoreDraft, saveDraft } from './storage'
import { QUESTIONNAIRE_STEPS } from './steps/stepDefinitions'
import { stepIndex } from './steps/navigation'
import type { StepRenderProps } from './steps/stepDefinitions'
import type { FormErrors, MealPreferences, StepId } from './types'

export interface QuestionnaireProps {
  onComplete: (answers: MealPreferences) => Promise<void>
  draftScope: string
}

export function Questionnaire({ onComplete, draftScope }: QuestionnaireProps) {
  // Drafts are scoped by the public profile id and restore by stable step ID,
  // so inserting or reordering steps does not send a user to the wrong page.
  const [restored] = useState(() => restoreDraft(draftScope))
  const [answers, setAnswers] = useState(restored.answers)
  const [stepId, setStepId] = useState(restored.stepId)
  const [errors, setErrors] = useState<FormErrors>({})
  const [foodDraft, setFoodDraft] = useState('')
  // This guard disables the final action while the one completion operation is
  // in flight, preventing duplicate database submissions.
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const firstInvalidRef = useRef<HTMLElement | null>(null)
  const step = QUESTIONNAIRE_STEPS[stepIndex(stepId)]
  const stepNumber = stepIndex(stepId) + 1
  const finalStep = QUESTIONNAIRE_STEPS[QUESTIONNAIRE_STEPS.length - 1]
  const isFinalStep = stepId === finalStep.id

  useEffect(() => { headingRef.current?.focus() }, [stepId])
  useEffect(() => { saveDraft(draftScope, answers, stepId) }, [answers, draftScope, stepId])

  const update: StepRenderProps['update'] = (key, value) => {
    setAnswers(current => ({ ...current, [key]: value }))
    setErrors(current => { const next = { ...current }; delete next[key]; return next })
  }

  const toggle: StepRenderProps['toggle'] = (key, option) => {
    const current = answers[key]
    let next: string[]
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

  const goTo = (nextStepId: StepId) => {
    setStepId(nextStepId)
    setErrors({})
    setSubmissionError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validate = () => {
    const next = step.validate(answers)
    setErrors(next)
    return !Object.keys(next).length
  }

  const continueStep = () => {
    if (!validate()) setTimeout(() => firstInvalidRef.current?.focus(), 0)
    else {
      const next = QUESTIONNAIRE_STEPS[stepIndex(stepId) + 1]
      if (next) goTo(next.id)
    }
  }

  const finish = async () => {
    if (submitting || !validate()) {
      if (!submitting) setTimeout(() => firstInvalidRef.current?.focus(), 0)
      return
    }
    setSubmitting(true)
    setSubmissionError('')
    try {
      // The parent performs the one database operation. The draft is removed only after it confirms success.
      await onComplete(answers)
      clearDraft(draftScope)
    } catch {
      setSubmissionError('We could not save your responses. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Submission is intentionally click-only. This prevents implicit Enter
    // submits and prevents a Continue click from becoming Finish after React
    // advances the step.
    event.preventDefault()
  }

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter' || event.defaultPrevented) return
    if (event.target instanceof HTMLTextAreaElement) return
    if (event.target instanceof HTMLInputElement && event.target.id === 'food-draft') return
    event.preventDefault()
  }

  const renderProps: StepRenderProps = { answers, errors, foodDraft, setFoodDraft, update, toggle, addFood, firstInvalidRef }
  return <main className="questionnaire-root app-shell">
    <div className="progress-wrap" aria-label={`Step ${stepNumber} of ${QUESTIONNAIRE_STEPS.length}`}>
      <div className="progress-meta"><span className="progress-label"><span className="pizza-icon" aria-hidden="true" />Progress</span><span>{stepNumber} / {QUESTIONNAIRE_STEPS.length}</span></div>
      <div className="progress-track">{QUESTIONNAIRE_STEPS.map((item, index) => <span className={`progress-segment ${index < stepNumber ? 'filled' : ''}`} key={item.id} />)}</div>
    </div>
    <form className="questionnaire" onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown} noValidate>
      <Step title={step.title} intro={step.intro} headingRef={headingRef}>{step.render(renderProps)}</Step>
      {submissionError && <Error>{submissionError}</Error>}
      <div className="form-actions">{stepNumber > 1 && <button type="button" className="button secondary" onClick={() => goTo(QUESTIONNAIRE_STEPS[stepIndex(stepId) - 1].id)} disabled={submitting}>Back</button>}{!isFinalStep ? <button type="button" className="button primary" onClick={continueStep}>Continue</button> : <button type="button" className="button primary" onClick={() => void finish()} disabled={submitting}>{submitting ? 'Submitting...' : "Let's go"}</button>}</div>
    </form>
  </main>
}

function Step({ title, intro, children, headingRef }: { title: string; intro: string; children: ReactNode; headingRef: { current: HTMLHeadingElement | null } }) {
  return <section className="step-panel"><h2 ref={headingRef} tabIndex={-1}>{title}</h2><p className="step-intro">{intro}</p><div className="step-content">{children}</div></section>
}

function Error({ children }: { children: ReactNode }) {
  return <p className="error" role="alert">{children}</p>
}
