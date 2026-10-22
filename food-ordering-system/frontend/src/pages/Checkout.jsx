import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../components/AuthContext.jsx';
import { useCart } from '../components/CartContext.jsx';
import { rupees, cleanPhone } from '../helpers.js';

function Checkout() {
  const { user } = useAuth();
  const { items, totalAmount, clearCart, checkCart } = useCart();

  const [form, setForm] = useState({
    customerName: user ? user.name : '',
    phone: '',
    address: '',
    paymentMethod: 'Cash on Delivery'
  });
  const [issues, setIssues] = useState([]);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check the cart against the current menu before the customer pays
  useEffect(() => {
    if (items.length === 0) {
      setChecking(false);
      return;
    }
    checkCart()
      .then(setIssues)
      .catch((err) => setError(err.message))
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    if (form.customerName.trim().length < 2) return 'Please enter your name.';
    if (!/^[6-9]\d{9}$/.test(cleanPhone(form.phone))) return 'Please enter a valid 10-digit Indian mobile number.';
    if (form.address.trim().length < 10) return 'Please enter your full delivery address (at least 10 characters).';
    return '';
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (submitting) return; // stops double clicks

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      // Only ids and quantities are sent. The server finds the real prices itself.
      const data = await api('/api/orders', {
        method: 'POST',
        body: {
          items: items.map((item) => ({ foodId: item.foodId, quantity: item.quantity })),
          customerName: form.customerName,
          phone: form.phone,
          address: form.address,
          paymentMethod: form.paymentMethod
        }
      });
      clearCart();
      // Full page load so Express can show the EJS confirmation page
      window.location.href = '/order-confirmation/' + data.order._id;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <h2 className="section-title">Checkout</h2>
        <p className="message">Your cart is empty. Add some food before checking out.</p>
        <p className="center"><Link to="/menu" className="btn">Browse Menu</Link></p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="section-title">Checkout</h2>

      {issues.length > 0 && (
        <div className="warning-box">
          Some items in your cart have changed (price or availability).
          Please <Link to="/cart">review your cart</Link> before placing the order.
        </div>
      )}

      <div className="checkout-layout">
        <form className="form-box wide" onSubmit={handlePlaceOrder}>
          <h3>Delivery Details</h3>
          {error && <p className="error-box">{error}</p>}

          <label>Name</label>
          <input type="text" name="customerName" value={form.customerName} onChange={handleChange} />

          <label>Phone number</label>
          <input type="tel" name="phone" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} />

          <label>Delivery address</label>
          <textarea name="address" rows="4" value={form.address} onChange={handleChange}></textarea>

          <label>Payment method</label>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
            <option value="Cash on Delivery">Cash on Delivery</option>
          </select>

          <button className="btn btn-full" disabled={submitting || checking || issues.length > 0}>
            {submitting ? 'Placing order...' : 'Place Order'}
          </button>
        </form>

        <div className="summary-box">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div className="summary-row" key={item.foodId}>
              <span>{item.name} x {item.quantity}</span>
              <span>{rupees(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <span>{rupees(totalAmount)}</span>
          </div>
          <p className="small-text">Pay in cash when your food arrives.</p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
