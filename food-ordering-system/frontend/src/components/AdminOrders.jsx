import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { rupees, formatDate, shortId } from '../helpers.js';

const STATUS_FILTERS = ['All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered', 'Cancelled', 'Rejected'];

// Button text for each status the admin can move an order to
const BUTTON_LABELS = {
  Accepted: 'Accept',
  Rejected: 'Reject',
  Preparing: 'Mark Preparing',
  Ready: 'Mark Ready',
  Delivered: 'Mark Delivered',
  Cancelled: 'Cancel Order'
};

function StatusButtons({ order, busy, onChange }) {
  if (order.nextStatuses.length === 0) {
    return <span className="small-text">No further actions</span>;
  }
  return (
    <div className="action-buttons">
      {order.nextStatuses.map((status) => (
        <button
          key={status}
          className={status === 'Rejected' || status === 'Cancelled' ? 'btn btn-small btn-danger' : 'btn btn-small'}
          disabled={busy}
          onClick={() => onChange(order, status)}
        >
          {BUTTON_LABELS[status]}
        </button>
      ))}
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  async function loadOrders() {
    try {
      const data = await api('/api/admin/orders');
      setOrders(data.orders);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function changeStatus(order, status) {
    if ((status === 'Rejected' || status === 'Cancelled') &&
        !window.confirm(`Are you sure you want to mark this order as ${status}?`)) {
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const data = await api(`/api/admin/orders/${order._id}/status`, { method: 'PATCH', body: { status } });
      setOrders((list) => list.map((o) => (o._id === order._id ? data.order : o)));
      setMessage(`Order ${shortId(order._id)} is now ${status}.`);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const shownOrders = orders.filter((o) => filter === 'All' || o.status === filter);
  const selected = orders.find((o) => o._id === selectedId);

  return (
    <div>
      <div className="filter-bar">
        <label>Show orders:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-outline" onClick={loadOrders}>Refresh</button>
      </div>

      {message && <p className="success-box">{message}</p>}
      {error && <p className="error-box">{error}</p>}
      {loading && <p className="message">Loading orders...</p>}
      {!loading && orders.length === 0 && <p className="message">No orders have been placed yet.</p>}
      {!loading && orders.length > 0 && shownOrders.length === 0 && (
        <p className="message">No orders with status "{filter}".</p>
      )}

      {selected && (
        <div className="detail-box">
          <h3>Order {shortId(selected._id)} - Full Details</h3>
          <p><strong>Order ID:</strong> {selected._id}</p>
          <p><strong>Date:</strong> {formatDate(selected.createdAt)}</p>
          <p><strong>Status:</strong> <span className={`status status-${selected.status.toLowerCase()}`}>{selected.status}</span></p>
          <p><strong>Customer account:</strong> {selected.customer ? `${selected.customer.name} (${selected.customer.email})` : 'Account removed'}</p>
          <p><strong>Delivery name:</strong> {selected.customerName}</p>
          <p><strong>Phone:</strong> {selected.phone}</p>
          <p><strong>Address:</strong> {selected.address}</p>
          <p><strong>Payment:</strong> {selected.paymentMethod}</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Food</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
              <tbody>
                {selected.items.map((item) => (
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
          <p className="total-line">Total: <strong>{rupees(selected.totalAmount)}</strong></p>
          <StatusButtons order={selected} busy={busy} onChange={changeStatus} />
          <p><button className="btn btn-outline btn-small" onClick={() => setSelectedId(null)}>Close details</button></p>
        </div>
      )}

      {shownOrders.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shownOrders.map((order) => (
                <tr key={order._id}>
                  <td title={order._id}>{shortId(order._id)}</td>
                  <td>{order.customerName}</td>
                  <td>{order.phone}</td>
                  <td>{order.address}</td>
                  <td>
                    {order.items.map((item) => (
                      <div key={item.name}>{item.name} x {item.quantity}</div>
                    ))}
                  </td>
                  <td>{rupees(order.totalAmount)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-small btn-outline" onClick={() => setSelectedId(order._id)}>View</button>
                      <StatusButtons order={order} busy={busy} onChange={changeStatus} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
