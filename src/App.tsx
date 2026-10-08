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
      <a className="site-name">Website Name</a>
      <div className="header-actions">
        <button aria-label="Notifications">Notifications</button>
        <button aria-label="Settings">Settings</button>
        <button aria-label="Profile">Profile</button>
      </div>
    </header>

    <nav className="site-nav" aria-label="Main navigation">
      {/*add clickability to the following tabs*/}
      <button aria-label="stats">Stats</button>
      <button aria-label="calendar">Calendar</button>
      <button aria-label="discover">Discover</button>
      <button aria-label="my-recipes">My Recipes</button>
      <button aria-label="learn">Learn</button>
      <button aria-label="shopping-list">Shopping List</button>
    </nav>

    <main>
      <form className="recipe-search" role="search">
        <label htmlFor="recipe-query">Search Recipes</label>
        <input id="recipe-query" name="search" type="search" />
        <button type="submit">Search</button>
        {/* add functionality here to generate recipe from database */}
      </form>
      <div className="user-stats">
        <section id="stats" className="panel widget">
          <h2>User Stats</h2>
          {/* add functionality and return from individual files/functions */}
        </section>

        <section id="calendar" className="panel widget">
          <h2>Calendar</h2>
          {/* add functionality here to generate recipe from database */}
        </section>

        <section id="my-recipes" className="panel widget">
          <h2>My Recipes</h2>
          {/* add functionality here to generate recipe from database */}
        </section>

        <section id="learn" className="panel widget">
          <h2>Learn</h2>
          {/* add functionality here to generate recipe from database */}
        </section>
      </div>

        <section id="discover" className="panel widget discover-panel">
          <h2>Discover</h2>
          <div className="recipe-list">
            {/* add functionality here to generate recipe from database */}
          </div>
        </section>
    </main>

    </>



  )
}

export default App
