import { useEffect, useState } from 'react'
import { getUserStats } from './statsService'
import type { UserStats } from './statsService'
import './Stats.css'

function TagList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="stats-panel">
      <h2>{title}</h2>
      {items.length ? (
        <ul className="stats-tags">
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </div>
  )
}

function Stats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getUserStats()
      .then(setStats)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load your stats.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="stats-page"><p>Loading your stats...</p></div>
  }

  if (error) {
    return <div className="stats-page"><p className="error" role="alert">{error}</p></div>
  }

  if (!stats || !stats.questionnaireCompleted) {
    return (
      <div className="stats-page">
        <h1 className="stats-title">Your Stats</h1>
        <p>Finish the questionnaire to see your stats here.</p>
      </div>
    )
  }

  const cards = [
    { label: 'Age', value: stats.age ?? '—' },
    { label: 'Main Goal', value: stats.goals[0] ?? '—' },
    { label: 'Foods Skipped', value: stats.foodsToSkip.length },
    { label: 'Appliances', value: stats.appliances.length },
  ]

  return (
    <div className="stats-page">
      <h1 className="stats-title">Your Stats</h1>

      <div className="stats-panel">
        <div className="stats-grid">
          {cards.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          ))}
        </div>
      </div>

      <TagList title="Goals" items={stats.goals} empty="No goals set." />
      <TagList title="Dietary Needs" items={stats.dietaryNeeds} empty="None." />
      <TagList title="Foods to Skip" items={stats.foodsToSkip} empty="Nothing skipped." />
      <TagList title="Kitchen Appliances" items={stats.appliances} empty="None listed." />
    </div>
  )
}

export default Stats