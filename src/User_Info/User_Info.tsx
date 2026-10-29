import { useNavigate } from "react-router-dom";

function User_Info() {
  //navigation
  const navigate = useNavigate();

  return (
    <>
    <a className="site-name">Website Name</a>
    <button aria-label="Back to Dashboard" onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>
      <h1>
        this is user profile 
      </h1>
    </>
  )
}

export default User_Info
