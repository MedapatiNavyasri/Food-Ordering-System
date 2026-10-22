import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { CATEGORIES } from '../helpers.js';
import FoodCard from '../components/FoodCard.jsx';

function Menu() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';

  // Always fetch fresh data so admin changes show up
  useEffect(() => {
    api('/api/foods')
      .then((data) => setFoods(data.foods))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function chooseCategory(name) {
    if (name) setSearchParams({ category: name });
    else setSearchParams({});
  }

  function resetFilters() {
    setSearch('');
    setSearchParams({});
  }

  const shownFoods = foods.filter((food) => {
    const matchesCategory = !category || food.category === category;
    const matchesSearch = food.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filtersUsed = search.trim() !== '' || category !== '';

  return (
    <div className="container">
      <h2 className="section-title">Our Menu</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search food by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-outline" onClick={resetFilters} disabled={!filtersUsed}>
          Reset
        </button>
      </div>

      <div className="category-tabs">
        <button className={category === '' ? 'tab active' : 'tab'} onClick={() => chooseCategory('')}>All</button>
        {CATEGORIES.map((name) => (
          <button
            key={name}
            className={category === name ? 'tab active' : 'tab'}
            onClick={() => chooseCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {loading && <p className="message">Loading menu...</p>}
      {error && <p className="error-box">{error}</p>}

      {!loading && !error && foods.length === 0 && (
        <p className="message">No food items are available right now. Please check again later.</p>
      )}
      {!loading && !error && foods.length > 0 && shownFoods.length === 0 && (
        <p className="message">No food items match your search. Try a different name or reset the filters.</p>
      )}

      <div className="food-grid">
        {shownFoods.map((food) => <FoodCard key={food._id} food={food} />)}
      </div>
    </div>
  );
}

export default Menu;
