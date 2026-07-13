import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { getDashboardPath } from '@/constants/roles';
import Loader from './Loader';

const AuthLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <Loader size="lg" text="Loading..." />
  </div>
);

const ProtectedRoute = ({ children, allowInactive = false }) => {
  const { isAuthenticated, isCheckingAuth, user } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  if (isCheckingAuth) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isActive && !allowInactive) {
    return <Navigate to="/account-inactive" replace />;
  }

  if (user?.isActive && allowInactive) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
