import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import store from './store/store';
import { clearSession, getCurrentUser } from './store/slices/authSlice';
import { ROLES } from './constants/roles';

import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import AppLayout from './components/layout/AppLayout';

import DashboardHome from './pages/DashboardHome';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Classes from './pages/Classes';
import ClassSubjects from './pages/ClassSubjects';
import SubjectContent from './pages/SubjectContent';
import NodeQuestions from './pages/NodeQuestions';
import QuestionPapers from './pages/QuestionPapers';
import GenerateQuestionPaper from './pages/GenerateQuestionPaper';
import EditQuestionPaper from './pages/EditQuestionPaper';
import QuestionPaperDetail from './pages/QuestionPaperDetail';
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

const AuthUnauthorizedListener = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(clearSession());
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [dispatch, navigate]);

  return null;
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
      <Route path="dashboard" element={<DashboardHome />} />
      <Route path="settings" element={<Settings />} />
      <Route
        path="classes"
        element={
          <RoleBasedRoute allowedRoles={[ROLES.OWNER]}>
            <Classes />
          </RoleBasedRoute>
        }
      />
      <Route
        path="classes/:classId/subjects"
        element={
          <RoleBasedRoute allowedRoles={[ROLES.OWNER]}>
            <ClassSubjects />
          </RoleBasedRoute>
        }
      />
      <Route
        path="classes/:classId/subjects/:subjectId/content"
        element={
          <RoleBasedRoute allowedRoles={[ROLES.OWNER]}>
            <SubjectContent />
          </RoleBasedRoute>
        }
      />
      <Route
        path="classes/:classId/subjects/:subjectId/content/:nodeId/questions"
        element={
          <RoleBasedRoute allowedRoles={[ROLES.OWNER]}>
            <NodeQuestions />
          </RoleBasedRoute>
        }
      />
      <Route
        path="papers"
        element={
          <RoleBasedRoute allowedRoles={[ROLES.OWNER]}>
            <QuestionPapers />
          </RoleBasedRoute>
        }
      />
      <Route
        path="papers/generate"
        element={
          <RoleBasedRoute allowedRoles={[ROLES.OWNER]}>
            <GenerateQuestionPaper />
          </RoleBasedRoute>
        }
      />
      <Route
        path="papers/:paperId/edit"
        element={
          <RoleBasedRoute allowedRoles={[ROLES.OWNER]}>
            <EditQuestionPaper />
          </RoleBasedRoute>
        }
      />
      <Route
        path="papers/:paperId"
        element={
          <RoleBasedRoute allowedRoles={[ROLES.OWNER]}>
            <QuestionPaperDetail />
          </RoleBasedRoute>
        }
      />
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
            <DashboardHome />
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
        <TooltipProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <AuthBootstrap>
            <AuthUnauthorizedListener />
            <AppRoutes />
          </AuthBootstrap>
        </TooltipProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
