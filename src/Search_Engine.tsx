import { useState, useEffect, useMemo } from 'react';
import { Search, X, } from 'lucide-react';
import {supabase} from './lib/supabase';
import { useNavigate } from "react-router-dom";

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

function Search_Engine() {
    const navigate = useNavigate();

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Fetch recipes from Supabase once, when the component mounts
    useEffect(() => {
        async function fetchRecipes() {
            const { data, error } = await supabase
                .from('Recipe')
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

    // Debounce the search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const searchResults = useMemo(() => {
        const term = debouncedSearchTerm.trim().toLowerCase();
        if (!term) return [];
        return recipes.filter(item =>
            item.Name?.toLowerCase().includes(term) ||
            item.Cuisine?.toLowerCase().includes(term) ||
            item.Ingredients?.some(ing => ing.toLowerCase().includes(term)) || 
            item['Diet type']?.some(diet => diet.toLowerCase().includes(term)) ||
            item['Meal Type']?.toLowerCase().includes(term)
        );
    }, [recipes, debouncedSearchTerm]);

  return (
        <div>
            <div>
                <button onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>
                <h1>Search</h1>
            </div>
            <div style={{ maxWidth: '600px', margin: '50px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
            <div className="search-container">
                <Search className="search-icon" />
                <input
                    type="text"
                    placeholder="Search for recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear-button" onClick={() => setSearchTerm('')}>
                        <X size={16} />
                    </button>
                )}
            </div>
            <div className="results-container">
                {loading ? (
                    <p>Loading recipes...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : searchResults.length > 0 ? (
                    searchResults.map((item) => (
                        <div key={item.id} className="result-item">
                            <h2>{item.Name}</h2>
                            <p>
                                {[item.Cuisine, item['Meal Type'], item.Time ? `${item.Time} min` : null]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                            {item.Link && (
                                <a href={item.Link} target="_blank" rel="noreferrer">
                                    View recipe
                                </a>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No recipes found.</p>
                )}
            </div>
        </div>
        </div>
    );
}

export default Search_Engine;