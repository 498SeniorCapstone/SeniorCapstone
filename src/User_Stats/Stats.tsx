import './Stats.css'

function Stats() {
  const stats = [
    { label: 'Current Weight', value: '165 lbs' },
    { label: 'Target Weight', value: '155 lbs' },
    { label: 'Saved Recipes', value: 12 },
    { label: 'Workouts / Week', value: 3 },
  ]

  return (
    <div className="stats-page">
      <h1 className="stats-title">Your Stats</h1>
      <div className="stats-panel">
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Stats