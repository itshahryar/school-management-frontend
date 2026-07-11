import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loader from '../../../components/common/Loader';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  if (isCheckingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--page-background)' }}
      >
        <Loader size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
