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
      <header className="site-header-container">
        <h1 className="site-name">Apptrition</h1>
        <nav className="header-actions">
            <button aria-label="Notifications" onClick={() => navigate('/Notifications')}>
              <img src="\src\assets\Apptrition_Notifications.png" alt="Notifications" />
            </button>
            <button aria-label="Settings" onClick={() => navigate('/Settings')}>
              <img src="\src\assets\Apptrition_Settings.png" alt="Settings" />
            </button>
            <button aria-label="Profile" onClick={() => navigate('/User-Profile')}>
              <img src="\src\assets\Apptrition_Profile.png" alt="Profile" />
            </button>
          </nav>
      </header>

      <main>
        <button onClick={() => navigate('/Search')}>Discover Recipes!</button>
        <div className="widget-grid" id="widget-grid">
          <section id="stats" className="widget">
            <button onClick={() => navigate('/Stats')}>User Stats</button>
          </section>

          <section id="calendar" className="widget">
            <button onClick={() => navigate('/Calendar')}>Calendar</button>
             <h3>Recipes for this Week:</h3>

          </section>

          <section id="my-recipes" className="widget">
            <button onClick={() => navigate('/My-Recipes')}>My Recipes</button>
            {/* <div className="recipe-categories">
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
            wanted to make my recipes uniform to the other widgets
            */}
            <div className="recipe-categories">
              <div className="category-item">
                <h3>Want to Try</h3>
                <p>{wantToTryRecipes.length}</p>
              </div>
              <div className="category-item">
                <h3>Plan to Try</h3>
                <p>{plannedRecipes.length}</p>
              </div>
              <div className="category-item">
                <h3>Tried</h3>
                <p>{triedRecipes.length}</p>
              </div>
            </div>
          </section>

          <section id="shopping-list" className="widget">
            <button onClick={() => navigate('/Shopping-List')}>Shopping List</button>
          </section>
        </div>
      </main> 
    </div>
  )
}

export default App
