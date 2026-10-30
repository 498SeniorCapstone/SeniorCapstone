import type { ReactNode } from 'react'

export function Field({ id, label, value, onChange, type = 'text', min, max, step, placeholder, optional, suffix, error, invalidRef }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; min?: string; max?: string; step?: string; placeholder?: string; optional?: boolean; suffix?: ReactNode; error?: string; invalidRef?: { current: HTMLElement | null } }) {
  return <section className="field"><label htmlFor={id}>{label} <span className={optional ? 'optional' : 'required'}>{optional ? 'Optional' : 'Required'}</span></label><div className={suffix ? 'input-with-suffix' : ''}><input ref={element => { if (error && invalidRef) invalidRef.current = element }} id={id} value={value} onChange={event => onChange(event.target.value)} type={type} min={min} max={max} step={step} placeholder={placeholder} aria-invalid={!!error} />{suffix}</div>{error && <Error>{error}</Error>}</section>
}

export function ChoiceGrid({ options, selected, onToggle, error, compact, invalidRef }: { options: string[]; selected: string[]; onToggle: (option: string) => void; error?: string; compact?: boolean; invalidRef?: { current: HTMLElement | null } }) {
  return <><div className={`choice-grid ${compact ? 'compact' : ''}`} role="group">{options.map((option, index) => <button ref={element => { if (error && index === 0 && invalidRef) invalidRef.current = element }} type="button" className={`choice-card ${selected.includes(option) ? 'selected' : ''}`} aria-pressed={selected.includes(option)} key={option} onClick={() => onToggle(option)}><span className="choice-indicator">{selected.includes(option) ? '✓' : ''}</span><span>{option}</span></button>)}</div>{error && <Error>{error}</Error>}</>
}

function Error({ children }: { children: ReactNode }) {
  return <p className="error" role="alert">{children}</p>
}
