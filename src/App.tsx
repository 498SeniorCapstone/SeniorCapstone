//import { useState } from 'react'
import Stats from './User_Stats/Stats'
import Questionaire from './User_Info/Questionaire'
import User_Info from './User_Info/User_Info'
import './App.css'

function App() {

  return (
    <>
    <header className="site-header">
      <h1>Recipe App</h1>
      <a aria-label="Notifications">Notifications</a>
      <a aria-label="Settings">Settings</a>
      <a aria-label="Profile">Profile</a>
    </header>

    <nav className="nav-bar">
      {/*add clickability to the following tabs*/}
      <a href="#stats">Stats</a>
      <a href="#calendar">Calendar</a>
      <a href="#discover">Discover</a>
      <a href="#my-recipes">My Recipes</a>
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
