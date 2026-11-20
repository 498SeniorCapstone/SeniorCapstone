import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserProfile } from './profileService.ts'
import type { UserProfile as Profile } from './profileService.ts'

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

function UserProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load your profile.'))
      .finally(() => setLoading(false))
  }, [])

  const backButton = (
    <button className="back-button" onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>
  )

  if (loading) {
    return <div className="stats-page">{backButton}<p>Loading your profile...</p></div>
  }

  if (error) {
    return <div className="stats-page">{backButton}<p className="error" role="alert">{error}</p></div>
  }

  if (!profile || !profile.questionnaireCompleted) {
    return (
      <div className="stats-page">
        {backButton}
        <h1 className="stats-title">Your Profile</h1>
        <p>Finish the questionnaire to see your profile here.</p>
      </div>
    )
  }

  const cards = [
    { label: 'Age', value: profile.age ?? '—' },
    { label: 'Main Goal', value: profile.goals[0] ?? '—' },
    { label: 'Foods Skipped', value: profile.foodsToSkip.length },
    { label: 'Appliances', value: profile.appliances.length },
  ]

  return (
    <div className="stats-page">
      {backButton}
      <h1 className="stats-title">Your Profile</h1>

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

      <TagList title="Goals" items={profile.goals} empty="No goals set." />
      <TagList title="Dietary Needs" items={profile.dietaryNeeds} empty="None." />
      <TagList title="Foods to Skip" items={profile.foodsToSkip} empty="Nothing skipped." />
      <TagList title="Kitchen Appliances" items={profile.appliances} empty="None listed." />
    </div>
  )
}

export default UserProfile