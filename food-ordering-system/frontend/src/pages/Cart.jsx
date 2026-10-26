import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext.jsx';
import FoodImage from '../components/FoodImage.jsx';
import { rupees, MAX_QTY } from '../helpers.js';

function Cart() {
  const { items, cartLoading, totalAmount, changeQuantity, removeItem, checkCart, fixCart } = useCart();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');

  // When the cart changes, compare it with the latest menu from the database
  useEffect(() => {
    if (cartLoading) return;
    if (items.length === 0) {
      setIssues([]);
      return;
    }
    setChecking(true);
    checkCart()
      .then((found) => {
        setIssues(found);
        setCheckError('');
      })
      .catch((err) => setCheckError(err.message))
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, cartLoading]);

  function handleFixCart() {
    fixCart(issues);
    setIssues([]);
  }

  if (cartLoading) {
    return (
      <div className="container">
        <h2 className="section-title">Your Cart</h2>
        <p className="message">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <h2 className="section-title">Your Cart</h2>
        <p className="message">Your cart is empty.</p>
        <p className="center"><Link to="/menu" className="btn">Browse Menu</Link></p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="section-title">Your Cart</h2>

      {checkError && <p className="error-box">{checkError}</p>}

      {issues.length > 0 && (
        <div className="warning-box">
          <strong>Some items in your cart have changed:</strong>
          <ul>
            {issues.map((issue) => (
              <li key={issue.foodId + issue.type}>
                {issue.type === 'unavailable'
                  ? `${issue.name} is no longer available and will be removed.`
                  : `The price of ${issue.name} changed from ${rupees(issue.oldPrice)} to ${rupees(issue.newPrice)}.`}
              </li>
            ))}
          </ul>
          <button className="btn" onClick={handleFixCart}>Update my cart</button>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Food</th>
              <th>Unit price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.foodId}>
                <td>
                  <div className="cart-food">
                    <FoodImage src={item.image} alt={item.name} className="cart-image" />
                    <span>{item.name}</span>
                  </div>
                </td>
                <td>{rupees(item.price)}</td>
                <td>
                  <div className="qty-box">
                    <button onClick={() => changeQuantity(item.foodId, -1)} disabled={item.quantity <= 1}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => changeQuantity(item.foodId, 1)} disabled={item.quantity >= MAX_QTY}>+</button>
                  </div>
                </td>
                <td>{rupees(item.price * item.quantity)}</td>
                <td><button className="btn btn-small btn-danger" onClick={() => removeItem(item.foodId)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="total-line">Total: <strong>{rupees(totalAmount)}</strong></p>
      <p className="small-text">You can order up to {MAX_QTY} of each item. The final price is confirmed by the server when you place the order.</p>

      <div className="button-row">
        <Link to="/menu" className="btn btn-outline">Continue Shopping</Link>
        <button className="btn" onClick={() => navigate('/checkout')} disabled={issues.length > 0 || checking}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;