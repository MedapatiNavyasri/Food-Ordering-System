import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { useCart } from './CartContext.jsx';

function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">Food Corner</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          {user && user.role === 'customer' && <NavLink to="/my-orders">My Orders</NavLink>}
          {user && user.role === 'admin' && <NavLink to="/admin">Admin Dashboard</NavLink>}
          <NavLink to="/cart">Cart ({totalItems})</NavLink>
          {!user && <NavLink to="/login">Login</NavLink>}
          {!user && <NavLink to="/register">Sign Up</NavLink>}
          {!user && <NavLink to="/admin/login">Admin Login</NavLink>}
          {user && <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>}
          {user && <button className="link-button" onClick={handleLogout}>Logout</button>}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;