import type { ReactNode } from 'react'
import type { FormErrors, MealPreferences, StepId } from '../types'
import { validateAnswers } from '../validation'
import { ChoiceGrid, Field } from './components'

export interface StepRenderProps {
  answers: MealPreferences
  errors: FormErrors
  foodDraft: string
  setFoodDraft: (value: string) => void
  update: (key: keyof MealPreferences, value: string | string[]) => void
  toggle: (key: 'dietaryNeeds' | 'goals' | 'equipment' | 'obstacles', option: string) => void
  addFood: (value?: string) => void
  firstInvalidRef: { current: HTMLElement | null }
}

export interface StepDefinition {
  id: StepId
  title: string
  intro: string
  render: (props: StepRenderProps) => ReactNode
  validate: (answers: MealPreferences) => FormErrors
}

const goals = ['Quick and easy', 'High protein', 'Healthy comfort food', 'Family favorites', 'Low calorie', 'Gut friendly', 'Fakeaway']
const dietary = ['None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten free', 'Dairy free', 'Nut free']
const equipment = ['Hob/stovetop', 'Oven', 'Microwave', 'Air fryer', 'Slow cooker', 'Pressure cooker', 'Blender']
const obstacles = ['Not enough time', 'Not sure what to cook', 'Food costs', 'Limited cooking confidence', 'Hard to stay consistent', 'Different preferences at home', 'Other']
const commonFoods = ['Mushrooms', 'Shellfish', 'Peanuts', 'Tree nuts', 'Olives', 'Anchovies', 'Blue cheese', 'Liver', 'Tofu']

export const QUESTIONNAIRE_STEPS: readonly StepDefinition[] = [
  {
    id: 'about-you',
    title: 'About you',
    intro: 'Age, height, and weight are optional.',
    render: ({ answers, errors, update, firstInvalidRef }) => <>
      <p className="optional-note">Age, height, and weight can be skipped.</p>
      <div className="field-grid">
        <Field id="age" label="Age" optional error={errors.age} value={answers.age} onChange={value => update('age', value)} type="number" min="1" placeholder="e.g. 29" />
        <Field id="weight" label="Weight" optional error={errors.weight} value={answers.weight} onChange={value => update('weight', value)} type="number" min="0" step="any" placeholder="e.g. 68" suffix={<select aria-label="Weight unit" value={answers.weightUnit} onChange={event => update('weightUnit', event.target.value)}><option>kg</option><option>lb</option></select>} />
        <Field id="height" label="Height" optional error={errors.height} value={answers.height} onChange={value => update('height', value)} type="number" min="0" step="any" placeholder={answers.heightUnit === 'cm' ? 'e.g. 172' : 'e.g. 5'} suffix={<select aria-label="Height unit" value={answers.heightUnit} onChange={event => update('heightUnit', event.target.value)}><option value="cm">cm</option><option value="ft">feet</option></select>} />
        {answers.heightUnit === 'ft' && <Field id="heightInches" label="Additional inches" optional error={errors.heightInches} value={answers.heightInches} onChange={value => update('heightInches', value)} type="number" min="0" max="11" step="any" placeholder="e.g. 8" invalidRef={firstInvalidRef} />}
      </div>
    </>,
    validate: answers => validateAnswers(answers, 'about-you'),
  },
  {
    id: 'goals',
    title: "What's your food vibe?",
    intro: 'Choose the kinds of meals you want more often.',
    render: ({ answers, toggle }) => <><p className="choice-hint">Pick all that fit</p><ChoiceGrid options={goals} selected={answers.goals} onToggle={option => toggle('goals', option)} /></>,
    validate: answers => validateAnswers(answers, 'goals'),
  },
  {
    id: 'dietary-needs',
    title: 'Any dietary needs?',
    intro: 'None is exclusive. Vegetarian, vegan, and pescatarian are mutually exclusive.',
    render: ({ answers, errors, toggle, firstInvalidRef }) => <><p className="choice-hint">Pick all that fit</p><ChoiceGrid options={dietary} selected={answers.dietaryNeeds} onToggle={option => toggle('dietaryNeeds', option)} error={errors.dietaryNeeds} invalidRef={firstInvalidRef} /></>,
    validate: answers => validateAnswers(answers, 'dietary-needs'),
  },
  {
    id: 'cooking-schedule',
    title: 'Cooking schedule',
    intro: 'Set the rhythm for your week.',
    render: ({ answers, errors, update, firstInvalidRef }) => <>
      <Field id="people" label="How many people are you cooking for?" value={answers.people} onChange={value => update('people', value)} type="number" min="1" error={errors.people} invalidRef={firstInvalidRef} />
      <fieldset><legend>How many days a week would you like to plan for? <span className="required">Required</span></legend><ChoiceGrid compact options={['1', '2', '3', '4', '5', '6', '7']} selected={[answers.days]} onToggle={option => update('days', option)} error={errors.days} invalidRef={firstInvalidRef} /></fieldset>
      <fieldset><legend>How much time would you like to spend cooking each day? <span className="required">Required</span></legend><ChoiceGrid options={['15 minutes or less', 'Up to 30 minutes', 'Up to 45 minutes', 'Up to 60 minutes', 'More than 60 minutes']} selected={[answers.cookingTime]} onToggle={option => update('cookingTime', option)} error={errors.cookingTime} invalidRef={firstInvalidRef} /></fieldset>
    </>,
    validate: answers => validateAnswers(answers, 'cooking-schedule'),
  },
  {
    id: 'foods-to-skip',
    title: 'Foods to skip',
    intro: "Add anything you'd rather not see.",
    render: ({ answers, foodDraft, setFoodDraft, addFood, update }) => <>
      <div className="field"><label htmlFor="food-draft">Add a food <span className="optional">Optional</span></label><div className="add-row"><input id="food-draft" value={foodDraft} onChange={event => setFoodDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addFood() } }} placeholder="Type a food and press Enter" /><button type="button" className="add-button" onClick={() => addFood()}>Add</button></div></div>
      <div className="pick-label">Common picks</div><div className="quick-picks">{commonFoods.map(food => <button type="button" key={food} className={`quick-pick ${answers.foodsToSkip.includes(food) ? 'chosen' : ''}`} onClick={() => addFood(food)}>{food}</button>)}</div>
      <div className="chips" aria-live="polite">{answers.foodsToSkip.map(food => <span className="chip" key={food}>{food}<button type="button" aria-label={`Remove ${food}`} onClick={() => update('foodsToSkip', answers.foodsToSkip.filter(item => item !== food))}>×</button></span>)}</div>
    </>,
    validate: answers => validateAnswers(answers, 'foods-to-skip'),
  },
  {
    id: 'kitchen',
    title: "What's in your kitchen?",
    intro: 'Tell us what you have available.',
    render: ({ answers, toggle, update }) => <>
      <fieldset><legend>What cooking equipment do you have? <span className="optional">Optional</span></legend><p className="choice-hint">Pick all that fit</p><ChoiceGrid options={equipment} selected={answers.equipment} onToggle={option => toggle('equipment', option)} />{answers.equipment.includes('Other') && <div className="field nested-field"><label htmlFor="other-equipment">Tell us about it <span className="optional">Optional</span></label><input id="other-equipment" value={answers.otherEquipment} onChange={event => update('otherEquipment', event.target.value)} placeholder="e.g. rice cooker" /></div>}<button type="button" className={`choice-card other-toggle ${answers.equipment.includes('Other') ? 'selected' : ''}`} onClick={() => toggle('equipment', 'Other')}><span className="choice-indicator">{answers.equipment.includes('Other') ? '✓' : ''}</span><span>Other</span></button></fieldset>
      <div className="field"><label htmlFor="ingredients">What ingredients do you already have? <span className="optional">Optional</span></label><textarea id="ingredients" value={answers.ingredients} onChange={event => update('ingredients', event.target.value)} placeholder="For example: rice, eggs, chickpeas, frozen vegetables..." rows={4} /></div>
    </>,
    validate: answers => validateAnswers(answers, 'kitchen'),
  },
  {
    id: 'obstacles',
    title: "What's getting in the way?",
    intro: 'Choose anything that sounds familiar.',
    render: ({ answers, toggle, update }) => <>
      <p className="choice-hint">Pick all that fit</p><ChoiceGrid options={obstacles} selected={answers.obstacles} onToggle={option => toggle('obstacles', option)} />
      <div className="field"><label htmlFor="obstacle-details">Anything else you'd like us to know? <span className="optional">Optional</span></label><textarea id="obstacle-details" value={answers.obstacleDetails} onChange={event => update('obstacleDetails', event.target.value)} rows={4} placeholder="A little more detail is welcome, but not required." /></div>
    </>,
    validate: answers => validateAnswers(answers, 'obstacles'),
  },
]

