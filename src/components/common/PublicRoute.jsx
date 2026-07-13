import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { getDashboardPath } from '@/constants/roles';
import Loader from './Loader';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth, user } = useSelector(
    (state) => state.auth
  );

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
    if (!user?.isActive) {
      return <Navigate to="/account-inactive" replace />;
    }
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
};

export default PublicRoute;
