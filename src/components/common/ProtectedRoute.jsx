import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';

const AuthLoading = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ backgroundColor: 'var(--page-background)' }}
  >
    <div className="text-center">
      <FiLoader
        className="h-10 w-10 animate-spin mx-auto mb-3"
        style={{ color: 'var(--primary)' }}
      />
      <p style={{ color: 'var(--muted-text)' }}>Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isCheckingAuth) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
