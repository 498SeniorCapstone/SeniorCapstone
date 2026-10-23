import { useState, useEffect, useMemo } from 'react';
import { Search, X, } from 'lucide-react';

function Search_Engine() {
    //get recipe data from database and store it in a variable called MOCK_DATA
    const MOCK_DATA: { id: number; title: string; description: string }[] = useMemo(() => {
     return ([
        { id: 1, title: 'Spaghetti Bolognese', description: 'A classic Italian pasta dish with rich meat sauce.' },
        { id: 2, title: 'Chicken Tikka Masala', description: 'Tender chicken pieces in a creamy tomato sauce.' },
        { id: 3, title: 'Beef Stroganoff', description: 'Sautéed beef in a sour cream sauce served over noodles.' },
        { id: 4, title: 'Vegetable Stir Fry', description: 'A mix of fresh vegetables sautéed in a savory sauce.' },
        { id: 5, title: 'Fish Tacos', description: 'Grilled fish served in soft tortillas with fresh toppings.' }
     ]
      );
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const searchResults = useMemo(() => {
        if (!debouncedSearchTerm.trim()) {
            return []; // Return no results if nothing is searched
        }
        return MOCK_DATA.filter(item =>
            item.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [MOCK_DATA, debouncedSearchTerm]);

    useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

return(
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
            <h1>Recipe Search</h1>
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
                {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                        <div key={item.id} className="result-item">
                            <h2>{item.title}</h2>
                            <p>{item.description}</p>
                        </div>
                    ))
                ) : (
                    <p>No recipes found.</p>
                )}
            </div>
        </div>
    );
}

export default Search_Engine;