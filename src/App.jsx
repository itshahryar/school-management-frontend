import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import { getCurrentUser } from './store/slices/authSlice';
import { ROLES } from './constants/roles';

import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import AppLayout from './components/layout/AppLayout';

import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Unauthorized from './pages/Unauthorized';

import LoginForm from './features/auth/components/LoginForm';
import ForgotPasswordForm from './features/auth/components/ForgotPasswordForm';
import ResetPasswordForm from './features/auth/components/ResetPasswordForm';
import SetupOwnerForm from './features/auth/components/SetupOwnerForm';

const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginForm />
        </PublicRoute>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <PublicRoute>
          <ForgotPasswordForm />
        </PublicRoute>
      }
    />
    <Route
      path="/reset-password"
      element={
        <PublicRoute>
          <ResetPasswordForm />
        </PublicRoute>
      }
    />
    <Route
      path="/setup"
      element={
        <PublicRoute>
          <SetupOwnerForm />
        </PublicRoute>
      }
    />

    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="settings" element={<Settings />} />
      <Route
        path="users"
        element={
          <RoleBasedRoute allowedRoles={[ROLES.OWNER]}>
            <Users />
          </RoleBasedRoute>
        }
      />
      <Route
        path="admin"
        element={
          <RoleBasedRoute allowedRoles={[ROLES.OWNER, ROLES.ADMIN]}>
            <Dashboard />
          </RoleBasedRoute>
        }
      />
    </Route>

    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <AuthBootstrap>
          <AppRoutes />
        </AuthBootstrap>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
