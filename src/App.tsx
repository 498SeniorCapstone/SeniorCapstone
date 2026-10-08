//import { useState } from 'react'
import Stats from './User_Stats/Stats'
import Questionaire from './User_Info/Questionaire'
import User_Info from './User_Info/User_Info'
import './App.css'

function App() {

  return (
    // <>
    //   <div className='User_Info'>
    //     <Questionaire />
    //     <User_Info />
    //   </div>
    //   <div className='User_Stats'>
    //     <Stats />
    //   </div>
    // </> 

    <>
    <header className="site-header">
      <a className="profile-link" href="#">Profile</a>
      <a className="site-name" href="#">Website Name</a>
      <div className="header-actions">
        <button aria-label="Notifications">Notifications</button>
        <button aria-label="Settings">Settings</button>
      </div>
    </header>

    <nav className="site-nav" aria-label="Main navigation">
      <a href="#stats">Stats</a>
      <a href="#calendar">Calendar</a>
      <a href="#discover">Discover</a>
      <a href="#my-recipes">My Recipes</a>
      <a href="#learn">Learn</a>
      <a href="#shopping-list">Shopping List</a>
    </nav>

    </>



  )
}

export default App
