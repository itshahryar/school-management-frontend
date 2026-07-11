import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { hasRole } from '../../utils/user';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!hasRole(user, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;
