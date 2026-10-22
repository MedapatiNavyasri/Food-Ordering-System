import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { rupees, formatDate } from '../helpers.js';

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/orders/${id}`)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="container">
      <h2 className="section-title">Order Details</h2>

      {loading && <p className="message">Loading order...</p>}
      {error && <p className="error-box">{error}</p>}

      {order && (
        <div className="detail-box">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
          <p><strong>Status:</strong> <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span></p>
          <p><strong>Name:</strong> {order.customerName}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Delivery address:</strong> {order.address}</p>
          <p><strong>Payment method:</strong> {order.paymentMethod}</p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Food</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{rupees(item.price)}</td>
                    <td>{item.quantity}</td>
                    <td>{rupees(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="total-line">Total: <strong>{rupees(order.totalAmount)}</strong></p>
        </div>
      )}

      <p><Link to="/my-orders" className="btn btn-outline">Back to My Orders</Link></p>
    </div>
  );
}

export default OrderDetails;
