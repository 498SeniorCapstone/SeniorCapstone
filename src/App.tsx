import './App.css'
import { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import { supabase } from './lib/supabase.ts';


type UserRecipe = {
    recipe_id: number;
    status: string;
};

function App() {

  //navigation
  const navigate = useNavigate();

  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      async function fetchUserRecipes() {
          if (!supabase) {
              setError('Supabase is not configured.');
              setLoading(false);
              return;
          }
          const { data, error } = await supabase
              .from('my_recipes')
              .select('recipe_id, status');
  
          if (error) {
              setError(error.message);
          } else {
              setUserRecipes((data as UserRecipe[]) ?? []);
          }
          setLoading(false);
      }
      fetchUserRecipes();
    }, []);

  const plannedRecipes = userRecipes.filter((userRecipe) => userRecipe.status === 'plan to try');
  const wantToTryRecipes = userRecipes.filter((userRecipe) => userRecipe.status === 'want to try');
  const triedRecipes = userRecipes.filter((userRecipe) => userRecipe.status === 'tried');

  return (
    <div className="Dashboard">
       {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
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
            <h2 >My Recipes</h2>
            <div className="recipe-categories">
              <div className="category-item">
                <h3 onClick={() => navigate('/My-Recipes/want-to-try')}>Want to Try</h3>
                <p>{wantToTryRecipes.length}</p>
              </div>
              <div className="category-item">
                <h3 onClick={() => navigate('/My-Recipes/plan-to-try')}>Plan to Try</h3>
                <p>{plannedRecipes.length}</p>
              </div>
              <div className="category-item">
                <h3 onClick={() => navigate('/My-Recipes/tried')}>Tried</h3>
                <p>{triedRecipes.length}</p>
              </div>
            </div>
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
