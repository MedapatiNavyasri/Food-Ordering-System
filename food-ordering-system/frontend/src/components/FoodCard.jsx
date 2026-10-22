import { useState } from 'react';
import { useCart } from './CartContext.jsx';
import FoodImage from './FoodImage.jsx';
import { rupees } from '../helpers.js';

function FoodCard({ food }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(food);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  return (
    <div className="food-card">
      <FoodImage src={food.image} alt={food.name} className="food-image" />
      <div className="food-body">
        <h3>{food.name}</h3>
        <p className="food-category">{food.category}</p>
        <p className="food-description">{food.description}</p>
        <div className="food-row">
          <span className="price">{rupees(food.price)}</span>
          <span className={food.available ? 'badge badge-green' : 'badge badge-red'}>
            {food.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <button className="btn btn-full" onClick={handleAdd} disabled={!food.available}>
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default FoodCard;
