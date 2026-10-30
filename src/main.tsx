import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
import App from './App.tsx'
// AppGate adds the feature entry flow around these existing routes without
// moving route ownership out of this application entry point.
import { AppGate } from './signin'
import {HashRouter, Route, Routes} from "react-router-dom";
import User_Info from "./User_Info/User_Info.tsx";
import Notifications from './Notifications/Notifications.tsx';
import Settings from './Settings/Settings.tsx';
import Stats from './User_Stats/Stats.tsx';
import Calendar from './Calendar/Calendar.tsx';
import Discover from './Discover/Discover.tsx';
import Shopping_List from './Shopping_List/Shopping_List.tsx';
import My_Recipes from './User_Recipes/My_Receips.tsx';
import Search_Engine from './Search_Engine.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        {/* Restore/sign-in/questionnaire first; successful profiles render the
            unchanged route tree through AppGate's Outlet. */}
        <Route element={<AppGate />}>
          <Route path="/" element={<App />} />
          <Route path="/Dashboard" element={<App />} />
          <Route path="/User-Profile" element={<User_Info />} />
          <Route path="/Notifications" element={<Notifications />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/Stats" element={<Stats />} />
          <Route path="/Calendar" element={<Calendar />} />
          <Route path="/Discover" element={<Discover />} />
          <Route path="/Shopping-List" element={<Shopping_List />} />
          <Route path="/My-Recipes" element={<My_Recipes />} />
          <Route path="/Search" element={<Search_Engine />} />
        </Route>
      </Routes>

    </HashRouter>
  </StrictMode>,
)
