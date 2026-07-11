import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  if (isCheckingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--page-background)' }}
      >
        <FiLoader
          className="h-10 w-10 animate-spin"
          style={{ color: 'var(--primary)' }}
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
