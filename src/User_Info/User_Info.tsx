import { useNavigate } from "react-router-dom";
import type { MealPreferences } from "../features/questionnaire";

interface UserInfoProps {
  answers: MealPreferences | null;
}

function User_Info({ answers }: UserInfoProps) {
  //navigation
  const navigate = useNavigate();

  return (
    <>
    <a className="site-name">Website Name</a>
    <button aria-label="Back to Dashboard" onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>
      <h1 data-questionnaire-complete={answers !== null}>
        this is user profile 
      </h1>
    </>
  )
}

export default User_Info
