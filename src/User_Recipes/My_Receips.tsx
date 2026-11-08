import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabase.ts';

type Recipe = {
    id: number;                       
    created_at?: string;                
    Name: string | null;
    Link: string | null;
    'Diet type': string[] | null;
    'Meal Type': string | null;
    Symbols: number[] | null;
    'Kitchen Appliances': string[] | null;
    Cuisine: string | null;
    Nutrition: number[] | null;       
    Ingredients: string[] | null;
    Time: number | null;
}; 

type UserRecipe = {
    recipe_id: number;
    status: string;
};

function My_Recipes() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();


  const [newCategory, setNewCategory] = useState<string | null>(null);
  const selectedCategory = newCategory ?? category;
  
  const updateParams = (newCategory: string) => {
    setNewCategory(newCategory);
    navigate(`/My-Recipes/${newCategory}`);
  };

  const [recipes, setRecipes] = useState<Recipe[]>([]);
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

    //all recipes
     useEffect(() => {
            async function fetchRecipes() {
                if (!supabase) {
                    setError('Supabase is not configured.');
                    setLoading(false);
                    return;
                }
                const { data, error } = await supabase
                    .from('recipe')
                    .select('id, Name, Link, "Diet type", "Meal Type", Cuisine, Ingredients, Time');
    
                if (error) {
                    setError(error.message);
                } else {
                    setRecipes((data as Recipe[]) ?? []);
                }
                setLoading(false);
            }
            fetchRecipes();
        }, []);

  const normalizeStatus = (str: string | null | undefined) => 
    str ? str.toLowerCase().replace(/-/g, ' ').trim() : '';

  const filteredUserRecipes = userRecipes.filter((ur) => {
    if (!selectedCategory) return true; // Show all if no category selected
    return normalizeStatus(ur.status) === normalizeStatus(selectedCategory);
  });

  // Then get the full Recipe objects that match those userRecipe IDs
  const displayedRecipes = recipes.filter((recipe) =>
    filteredUserRecipes.some((ur) => ur.recipe_id === recipe.id)
  );

  return (
    <>
      <div>This is my recipes</div>
      <button className="back-button" onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>

      <div className="category-buttons">
        <h2 onClick={() => updateParams('want-to-try')}>Want to Try</h2>
        <h2 onClick={() => updateParams('plan-to-try')}>Plan to Try</h2>
        <h2 onClick={() => updateParams('tried')}>Tried</h2>
      </div>

      <div>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {!loading && !error && (
          <div>
            {displayedRecipes.map((recipe) => (
              <div className = 'displayedRecipe' key={recipe.id}>
                <h3>{recipe.Name}</h3>
                <p>Cuisine: {recipe.Cuisine}</p>
                <p>Time: {recipe.Time} minutes</p>
                {recipe.Link && <a href={recipe.Link} target="_blank" rel="noopener noreferrer">View Recipe</a>}
              </div>
            ))}
            {displayedRecipes.length === 0 && <p>No recipes found for this category.</p>}
          </div>
        )}
      </div>
    </>
  );
}

export default My_Recipes
