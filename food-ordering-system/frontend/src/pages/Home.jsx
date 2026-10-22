import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { CATEGORIES } from '../helpers.js';
import FoodCard from '../components/FoodCard.jsx';

function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    api('/api/foods')
      .then((data) => setFoods(data.foods))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const popular = foods.slice(0, 4);
  // Background pictures for the welcome section come from the menu images in MongoDB
  const slides = foods.filter((food) => food.image).slice(0, 6);

  // Move to the next picture every 4 seconds
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setSlideIndex((current) => (current + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div>
      <section className="hero">
        {slides.length > 0 && (
          <div className="hero-track" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
            {slides.map((food) => (
              <div
                key={food._id}
                className="hero-slide"
                style={{ backgroundImage: `url("${food.image}")` }}
              ></div>
            ))}
          </div>
        )}
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1>Welcome to Food Corner</h1>
          <p>Hot and tasty food delivered to your door. Pick your favourite dish and order in a few clicks.</p>
          <Link to="/menu" className="btn btn-big">Order Now</Link>
        </div>

        {slides.length > 1 && (
          <div className="hero-dots">
            {slides.map((food, i) => (
              <button
                key={food._id}
                className={i === slideIndex ? 'dot active' : 'dot'}
                onClick={() => setSlideIndex(i)}
                aria-label={`Show picture ${i + 1}`}
              ></button>
            ))}
          </div>
        )}
      </section>

      <div className="container">
        <h2 className="section-title">Food Categories</h2>
        <div className="category-list">
          {CATEGORIES.map((category) => (
            <Link key={category} to={`/menu?category=${category}`} className="category-box">
              {category}
            </Link>
          ))}
        </div>

        <h2 className="section-title">Popular Food</h2>
        {loading && <p className="message">Loading food...</p>}
        {error && <p className="error-box">{error}</p>}
        {!loading && !error && popular.length === 0 && (
          <p className="message">No food items are available right now. Please check again later.</p>
        )}
        <div className="food-grid">
          {popular.map((food) => <FoodCard key={food._id} food={food} />)}
        </div>
      </div>
    </div>
  );
}

export default Home;