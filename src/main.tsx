import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
import App from './App.tsx'
import {HashRouter, Route, Routes} from "react-router-dom";
import User_Info from "./User_Info/User_Info.tsx";
import Notifications from './Notifications/Notifications.tsx';
import Settings from './Settings/Settings.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/Dashboard" element={<App />} />
        <Route path="/User-Profile" element={<User_Info />} />
        <Route path="/Notifications" element={<Notifications />} />
        <Route path="/Settings" element={<Settings />} />
      </Routes>

    </HashRouter>
  </StrictMode>,
)
