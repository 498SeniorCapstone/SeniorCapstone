import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.ts';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

type PlannedRecipe = {
  id: number;
  recipe: {
    id: number;
    Name: string | null;
    Link: string | null;
    Cuisine: string | null;
    Time: number | null;
  } | null;
};

function User_Calendar() {
  const navigate = useNavigate();

  const [value, onChange] = useState<Value>(new Date());
  
  const [planned, setPlanned] = useState<PlannedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanned() {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('my_recipes')
        .select('id, recipe(id, Name, Link, Cuisine, Time)')
        .eq('status', 'plan to try');

      if (error) setError(error.message);
      else setPlanned((data as unknown as PlannedRecipe[]) ?? []);
      setLoading(false);
    }
    fetchPlanned();
  }, []);


  return (
    <>
      <div className="header">
        <h1>Calendar</h1>
        <button className="back-button" onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>
      </div>
      <div>
        <Calendar onChange={onChange} value={value} />
      </div>
      <div className="planned-recipes">
        <h2>Recipes you plan to try</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : planned.length === 0 ? (
          <p>No planned recipes yet.</p>
        ) : (
          <ul>
            {planned.map((p) => (
              <li key={p.id}>
                <strong>{p.recipe?.Name}</strong>
                {p.recipe?.Time ? ` · ${p.recipe.Time} min` : ''}
                {p.recipe?.Link && (
                  <> · <a href={p.recipe.Link} target="_blank" rel="noreferrer">View recipe</a></>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default User_Calendar
