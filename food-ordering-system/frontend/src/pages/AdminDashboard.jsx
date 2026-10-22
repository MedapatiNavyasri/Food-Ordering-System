import { useState } from 'react';
import AdminFoods from '../components/AdminFoods.jsx';
import AdminOrders from '../components/AdminOrders.jsx';

function AdminDashboard() {
  const [tab, setTab] = useState('foods');

  return (
    <div className="container">
      <h2 className="section-title">Admin Dashboard</h2>
      <div className="category-tabs">
        <button className={tab === 'foods' ? 'tab active' : 'tab'} onClick={() => setTab('foods')}>
          Manage Food
        </button>
        <button className={tab === 'orders' ? 'tab active' : 'tab'} onClick={() => setTab('orders')}>
          Manage Orders
        </button>
      </div>

      {tab === 'foods' ? <AdminFoods /> : <AdminOrders />}
    </div>
  );
}

export default AdminDashboard;
