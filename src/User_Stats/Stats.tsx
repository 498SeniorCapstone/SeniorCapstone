import { useNavigate } from 'react-router-dom'
import UserStatsPanel from './UserStatsPanel.tsx'
import './Stats.css'

function Stats() {
  const navigate = useNavigate()

  return (
    <div className="stats-page">
      <button className="back-button" onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>
      <h1 className="stats-title">Your Stats</h1>
      <UserStatsPanel />
    </div>
  )
}

export default Stats