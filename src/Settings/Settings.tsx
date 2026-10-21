import { useNavigate } from "react-router-dom";

function Settings() {
  //navigation
  const navigate = useNavigate();

  return (
    <>
    <a className="site-name">Website Name</a>
    <button aria-label="Back to Dashboard" onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>
      <h1>
        this is settings
        
      </h1>
    </>
  )
}

export default Settings
