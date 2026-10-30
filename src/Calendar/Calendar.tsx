import { useState } from 'react';
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];
function User_Calendar() {
    const navigate = useNavigate();

  //planned recipes for the user
  const [value, onChange] = useState<Value>(new Date());
  
  return (
    <>
      <div className="header">
        <h1>Calendar</h1>
        <button className="back-button" onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>
      </div>
      <div>
        <Calendar onChange={onChange} value={value} />
      </div>
    </>
  )
}

export default User_Calendar
