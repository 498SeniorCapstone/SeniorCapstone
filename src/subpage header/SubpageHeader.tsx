import {useNavigate} from "react-router-dom";
import homeIcon from "../assets/Apptrition_Home_Button.png";
import './SubpageHeader.css';

type SubpageHeaderProps = {
  title: string;
};

export default function SubpageHeader({ title }: SubpageHeaderProps) {
  const navigate = useNavigate();

  return(
    <header className="subpage-header">
        <button className="icon" aria-label="Home" onClick={() => navigate('/Dashboard')}>
            <img src={homeIcon} alt="Home" />
        </button>
        <h1 className="subpage-title">{title}</h1>
    </header>
 
  );}