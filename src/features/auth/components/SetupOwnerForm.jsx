import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { setupOwner } from '../../../store/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiLoader, FiShield, FiArrowLeft } from 'react-icons/fi';
import { setupOwnerSchema } from '../schemas/authSchemas';

const SetupOwnerForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(setupOwnerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const userData = { ...data };
      delete userData.confirmPassword;
      await dispatch(setupOwner(userData)).unwrap();
      toast.success('Owner account created. You can now sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err || 'Failed to create owner account');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--page-background)' }}
    >
      <div
        className="w-full max-w-md p-8"
        style={{
          backgroundColor: 'var(--card-background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
        }}
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm mb-6"
          style={{ color: 'var(--muted-text)' }}
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3"
            style={{ backgroundColor: 'var(--primary-light)' }}
          >
            <FiShield className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--heading)' }}>
            Initial Setup
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Create the first owner account for EduCore
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                {...register('firstName')}
                className="w-full px-3 py-2.5 rounded-md focus:outline-none text-sm"
                style={{
                  backgroundColor: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--body-text)',
                }}
                placeholder="First name"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                {...register('lastName')}
                className="w-full px-3 py-2.5 rounded-md focus:outline-none text-sm"
                style={{
                  backgroundColor: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--body-text)',
                }}
                placeholder="Last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2.5 rounded-md focus:outline-none text-sm"
              style={{
                backgroundColor: 'var(--surface-muted)',
                border: '1px solid var(--border)',
                color: 'var(--body-text)',
              }}
              placeholder="Email address"
            />
            {errors.email && (
              <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full px-3 py-2.5 rounded-md focus:outline-none text-sm"
                style={{
                  backgroundColor: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--body-text)',
                }}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                style={{ color: 'var(--muted-text)', cursor: 'pointer' }}
              >
                {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="w-full px-3 py-2.5 rounded-md focus:outline-none text-sm"
                style={{
                  backgroundColor: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--body-text)',
                }}
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                style={{ color: 'var(--muted-text)', cursor: 'pointer' }}
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="h-4 w-4" />
                ) : (
                  <FiEye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-md font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Owner Account'
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-text)' }}>
          This endpoint only works when no users exist yet.
        </p>
      </div>
    </div>
  );
};

export default SetupOwnerForm;
