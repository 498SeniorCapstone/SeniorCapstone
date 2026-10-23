import './App.css'
import { useNavigate } from "react-router-dom";
import Search_Engine from './Search_Engine';

function App() {

  //navigation
  const navigate = useNavigate();

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
          {/* <div className="recipe-search-container">
            <form className="recipe-search" role="search">
              <label htmlFor="recipe-query">Search Recipes</label>
              <input id="recipe-query" name="search" type="search" />
              <button type="submit">Search</button>
            </form>
          </div> */}
          
        </header>
      </div>

      <main>
        <Search_Engine />
        <div className="widget-grid" id="widget-grid">
          <section id="stats" className="widget">
            <h2 onClick={() => navigate('/Stats')}>User Stats</h2>
          </section>

          <section id="calendar" className="widget">
            <h2 onClick={() => navigate('/Calendar')}>Calendar</h2>
          </section>

          <section id="my-recipes" className="widget">
            <h2 onClick={() => navigate('/My-Recipes')}>My Recipes</h2>
          </section>

          <section id="shopping-list" className="widget">
            <h2 onClick={() => navigate('/Shopping-List')}>Shopping List</h2>
          </section>

          <section id="discover" className="widget discover-panel">
            <h2 onClick={() => navigate('/Discover')}>Discover</h2>
          </section>
        </div>
      </main> 
      

    </div>



  )
}

export default App
