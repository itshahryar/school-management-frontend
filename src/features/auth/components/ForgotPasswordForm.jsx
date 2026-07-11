import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../../store/slices/authSlice';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import Loader from '../../../components/common/Loader';
import { forgotPasswordSchema } from '../schemas/authSchemas';

const ForgotPasswordForm = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(forgotPassword(data.email)).unwrap();
      setIsSubmitted(true);
      if (result?.data?.resetToken) {
        setDevResetToken(result.data.resetToken);
      }
      toast.success('If that email exists, a reset link will be sent.');
    } catch (err) {
      toast.error(err || 'Failed to send reset link');
    }
  };

  if (isSubmitted) {
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
            Check Your Email
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--muted-text)' }}>
            If an account exists for that address, password reset instructions have been sent.
          </p>
          {devResetToken && (
            <p className="mb-4 text-xs break-all" style={{ color: 'var(--muted-text)' }}>
              Dev reset link:{' '}
              <Link
                to={`/reset-password?token=${devResetToken}`}
                style={{ color: 'var(--primary)' }}
              >
                Reset password
              </Link>
            </p>
          )}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-medium text-sm"
            style={{ color: 'var(--primary)' }}
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Login
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
        <Link
          to="/login"
          className="inline-flex items-center gap-2 mb-6 text-sm"
          style={{ color: 'var(--muted-text)' }}
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--heading)' }}>
          Forgot Password?
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--muted-text)' }}>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--heading)' }}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5" style={{ color: 'var(--muted-text)' }} />
              </div>
              <input
                type="email"
                {...register('email')}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none transition"
                style={{
                  borderColor: errors.email ? 'var(--error)' : 'var(--border)',
                  color: 'var(--heading)',
                }}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                {errors.email.message}
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
              <Loader size="md" text="Sending..." />
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
