import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// Shows the page only to logged-in users (and only to admins when adminOnly is set).
// The server checks permissions again on every API call.
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="message">Loading...</p>;

  if (!user) {
    return <Navigate to={adminOnly ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="container">
        <p className="error-box">You do not have permission to open this page.</p>
      </div>
    );
  }
  return children;
}

export default ProtectedRoute;
