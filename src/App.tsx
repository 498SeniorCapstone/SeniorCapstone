import { useState, useEffect } from 'react'
import Stats from './User_Stats/Stats'
import Calendar from './Calendar/Calendar' 
import './App.css'
import Discover from './Discover/Discover';
import Shopping_List from './Shopping_List/Shopping_List';
import My_Recipes from './User_Recipes/My_Receips';
import { useNavigate } from "react-router-dom";

function App() {

  //navigation
  const navigate = useNavigate();

  //tab rendering/navigation state
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('activeTab') || 'stats';
  });

  //save tab
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);


  return (
    <div className="Dashboard">
    <div className="site-header-container">
        <header className="site-header">
        <a className="site-name">Website Name</a>
        <div className="header-actions">
          <button aria-label="Notifications" onClick={() => navigate('/Notifications')}>Notifications</button>
          <button aria-label="Settings" onClick={() => navigate('/Settings')}>Settings</button>
          <button aria-label="Profile" onClick={() => navigate('/User-Profile')}>Profile</button>
        </div>
      </header>

      <nav className="site-nav" aria-label="Main navigation">
        {/*add clickability to the following tabs*/}
        <button aria-label="stats" onClick={() => setActiveTab('stats')}>Stats</button>
        <button aria-label="calendar" onClick={() => setActiveTab('calendar')}>Calendar</button>
        <button aria-label="discover" onClick={() => setActiveTab('discover')}>Discover</button>
        <button aria-label="my-recipes" onClick={() => setActiveTab('my-recipes')}>My Recipes</button>
        {/* {<button aria-label="learn" onClick={() => setActiveTab('learn')}>Learn</button> */}
        <button aria-label="shopping-list" onClick={() => setActiveTab('shopping-list')}>Shopping List</button>
      </nav>
     <div className="recipe-search-container">
       <form className="recipe-search" role="search">
          <label htmlFor="recipe-query">Search Recipes</label>
          <input id="recipe-query" name="search" type="search" />
          <button type="submit">Search</button>
          {/* add functionality here to generate recipe from database */}
        </form>
     </div>
    </div>

    <main>

      {activeTab === 'stats' && <Stats />}
      {activeTab === 'calendar' && <Calendar />}
      {activeTab === 'discover' && <Discover />}
      {activeTab === 'my-recipes' && <My_Recipes />}
      {activeTab === 'shopping-list' && <Shopping_List />}
      
      {/* <div className="user-stats">
        <section id="stats" className="panel widget">
          <h2>User Stats</h2>
          {add functionality and return from individual files/functions }
        </section>

        <section id="calendar" className="panel widget">
          <h2>Calendar</h2>
          {add functionality here to generate recipe from database}
        </section>

        <section id="my-recipes" className="panel widget">
          <h2>My Recipes</h2>
          {add functionality here to generate recipe from database}
        </section>

        <section id="learn" className="panel widget">
          <h2>Learn</h2>
          {add functionality here to generate recipe from database}
        </section>
      </div>

        <section id="discover" className="panel widget discover-panel">
          <h2>Discover</h2>
          <div className="recipe-list">
            {add functionality here to generate recipe from database}
          </div>
        </section> 
        */}
    </main>

    </div>



  )
}

export default App
