import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../../store/slices/authSlice';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiLock, FiEye, FiEyeOff, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { resetPasswordSchema } from '../schemas/authSchemas';

const ResetPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      navigate('/forgot-password');
      return;
    }

    try {
      await dispatch(
        resetPassword({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        })
      ).unwrap();
      setIsSuccess(true);
      toast.success('Password reset successful!');
    } catch (err) {
      toast.error(err || 'Password reset failed');
    }
  };

  if (isSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--page-background)' }}
      >
        <div
          className="max-w-md w-full p-8 text-center"
          style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6"
            style={{ backgroundColor: 'var(--success-bg)' }}
          >
            <FiCheckCircle className="h-8 w-8" style={{ color: 'var(--success)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--heading)' }}>
            Password Reset Successful
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--muted-text)' }}>
            You can now sign in with your new password.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--page-background)' }}
      >
        <div
          className="max-w-md w-full p-8 text-center"
          style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--heading)' }}>
            Invalid Reset Link
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--muted-text)' }}>
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--page-background)' }}
    >
      <div
        className="max-w-md w-full p-8"
        style={{
          backgroundColor: 'var(--card-background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
        }}
      >
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--heading)' }}>
          Reset Password
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--muted-text)' }}>
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--heading)' }}>
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5" style={{ color: 'var(--muted-text)' }} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none transition"
                style={{ borderColor: errors.password ? 'var(--error)' : 'var(--border)' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5" style={{ color: 'var(--muted-text)' }} />
                ) : (
                  <FiEye className="h-5 w-5" style={{ color: 'var(--muted-text)' }} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--heading)' }}>
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5" style={{ color: 'var(--muted-text)' }} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none transition"
                style={{
                  borderColor: errors.confirmPassword ? 'var(--error)' : 'var(--border)',
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                style={{ cursor: 'pointer' }}
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="h-5 w-5" style={{ color: 'var(--muted-text)' }} />
                ) : (
                  <FiEye className="h-5 w-5" style={{ color: 'var(--muted-text)' }} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <>
                <FiLoader className="h-5 w-5 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Remember your password? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
