import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { rupees, formatDate, shortId } from '../helpers.js';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/orders/my')
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h2 className="section-title">My Orders</h2>

      {loading && <p className="message">Loading your orders...</p>}
      {error && <p className="error-box">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div>
          <p className="message">You have not placed any orders yet.</p>
          <p className="center"><Link to="/menu" className="btn">Order something tasty</Link></p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td title={order._id}>{shortId(order._id)}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    {order.items.map((item) => (
                      <div key={item.name}>{item.name} x {item.quantity}</div>
                    ))}
                  </td>
                  <td>{rupees(order.totalAmount)}</td>
                  <td>{order.paymentMethod}</td>
                  <td><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td><Link to={`/orders/${order._id}`} className="btn btn-small">View Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyOrders;
