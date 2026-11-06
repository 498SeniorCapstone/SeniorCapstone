import './App.css'
import { useNavigate } from "react-router-dom";

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
        </header>
      </div>

      <main>
        <h1 onClick={() => navigate('/Search')}>Discover Recipes!</h1>

        <div className="widget-grid" id="widget-grid">
          <section id="stats" className="widget">
            <h2 onClick={() => navigate('/Stats')}>User Stats</h2>
          </section>

          <section id="calendar" className="widget">
            <h2 onClick={() => navigate('/Calendar')}>Calendar</h2>
             <h3>Recipes for this Week:</h3>

          </section>

          <section id="my-recipes" className="widget">
            <h2 onClick={() => navigate('/My-Recipes')}>My Recipes</h2>
          </section>

          <section id="shopping-list" className="widget">
            <h2 onClick={() => navigate('/Shopping-List')}>Shopping List</h2>
          </section>
        </div>
      </main> 
      

    </div>



  )
}

export default App
