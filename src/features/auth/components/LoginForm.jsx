import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../../store/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';
import Loader from '../../../components/common/Loader';
import { loginSchema } from '../schemas/authSchemas';

const features = [
  { label: 'Role-based access control' },
  { label: 'End-to-end encrypted auth' },
  { label: 'Real-time data synchronization' },
  { label: 'Multi-institution support' },
];

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(login(data)).unwrap();
      const loggedInUser = result?.data?.user;
      toast.success(
        loggedInUser?.isActive === false
          ? 'Signed in — account is inactive'
          : 'Welcome back!'
      );
      navigate(
        loggedInUser?.isActive === false ? '/account-inactive' : '/dashboard'
      );
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: 'var(--page-background)' }}>
      {/* ──────────── LEFT PANEL ──────────── */}
      <div
        className="hidden lg:flex lg:w-[42%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)' }}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)', transform: 'translate(30%, -40%)' }}
        />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #c7d2fe 0%, transparent 70%)', transform: 'translate(-30%, 40%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <FiShield className="w-4 h-4" style={{ color: '#a5b4fc' }} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-tight">EduCore</h1>
              <p className="text-[9px] uppercase tracking-[0.18em] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Management Suite
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            Trusted by 500+ institutions
          </div>

          <h2 className="text-2xl xl:text-[28px] font-bold text-white leading-[1.2] tracking-tight">
            Everything you need
            <br />
            to <span style={{ color: '#c7d2fe' }}>manage</span> your school
          </h2>

          <p className="text-xs leading-relaxed max-w-[300px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            A unified platform for administration, academics, and communication.
          </p>
        </div>

        <div className="relative z-10 space-y-2.5">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5 group">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                style={{ background: 'rgba(129, 140, 248, 0.15)', border: '1px solid rgba(129, 140, 248, 0.2)' }}
              >
                <FiCheckCircle className="w-2.5 h-2.5" style={{ color: '#818cf8' }} />
              </div>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ──────────── RIGHT PANEL ──────────── */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #eef2ff 100%)',
            }}
          />
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.15]"
            style={{
              background: 'radial-gradient(circle, #c7d2fe 0%, transparent 70%)',
              transform: 'translate(40%, -30%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.12]"
            style={{
              background: 'radial-gradient(circle, #a5b4fc 0%, transparent 70%)',
              transform: 'translate(-30%, 40%)',
              filter: 'blur(50px)',
            }}
          />
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2 px-6 pt-5 pb-2 relative z-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
            <FiShield className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--heading)' }}>EduCore</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8 relative z-10">
          <div className="w-full max-w-[420px]">
            {/* Glassmorphism Card */}
            <div
              className="relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Decorative top gradient */}
              <div
                className="h-2 w-full"
                style={{
                  background: 'linear-gradient(90deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)',
                }}
              />

              <div className="p-5 sm:p-6">
                {/* Header Section */}
                <div className="text-center mb-4">
                  <div
                    className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                      boxShadow: '0 6px 16px rgba(67, 56, 202, 0.25)',
                    }}
                  >
                    <FiShield className="w-5 h-5 text-white" />
                  </div>
                  <h2
                    className="text-lg font-bold tracking-tight mb-1"
                    style={{ color: '#1e1b4b' }}
                  >
                    Welcome back
                  </h2>
                  <p className="text-[11px] leading-relaxed" style={{ color: '#64748b' }}>
                    Sign in to access your dashboard
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-text)' }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-4 w-4" style={{ color: 'var(--muted-text)' }} />
                      </div>
                      <input
                        type="email"
                        {...register('email')}
                        className="w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none transition"
                        style={{
                          borderColor: errors.email ? 'var(--error)' : 'var(--border)',
                          backgroundColor: 'var(--card-background)',
                          color: 'var(--heading)'
                        }}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium" style={{ color: 'var(--muted-text)' }}>
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-[11px] font-medium"
                        style={{ color: 'var(--primary)' }}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-4 w-4" style={{ color: 'var(--muted-text)' }} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        className="w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none transition"
                        style={{
                          borderColor: errors.password ? 'var(--error)' : 'var(--border)',
                          backgroundColor: 'var(--card-background)',
                          color: 'var(--heading)'
                        }}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        style={{ cursor: 'pointer' }}
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-4 w-4" style={{ color: 'var(--muted-text)' }} />
                        ) : (
                          <FiEye className="h-4 w-4" style={{ color: 'var(--muted-text)' }} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="
                        group relative w-full py-3 px-5 rounded-lg text-sm font-semibold
                        transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2.5 overflow-hidden
                      "
                      style={{
                        background: isLoading
                          ? '#4338ca'
                          : 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #4f46e5 100%)',
                        backgroundSize: '200% 200%',
                        color: '#ffffff',
                        boxShadow: isLoading
                          ? 'none'
                          : '0 4px 14px rgba(67, 56, 202, 0.35), 0 2px 6px rgba(67, 56, 202, 0.2)',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.backgroundPosition = '100% 0';
                          e.currentTarget.style.boxShadow =
                            '0 6px 24px rgba(67, 56, 202, 0.45), 0 3px 10px rgba(67, 56, 202, 0.25)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.backgroundPosition = '0% 0';
                          e.currentTarget.style.boxShadow =
                            '0 4px 14px rgba(67, 56, 202, 0.35), 0 2px 6px rgba(67, 56, 202, 0.2)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {!isLoading && (
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.15) 50%, transparent 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s ease-in-out infinite',
                          }}
                        />
                      )}

                      {isLoading ? (
                        <Loader size="sm" text="Signing in…" />
                      ) : (
                        <>
                          <span>Sign In</span>
                          <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div
                className="px-6 py-3 text-center"
                style={{
                  borderTop: '1px solid rgba(203, 213, 225, 0.4)',
                  backgroundColor: 'rgba(248, 250, 252, 0.5)',
                }}
              >
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  First time setup?{' '}
                  <Link to="/setup" className="font-semibold" style={{ color: '#4338ca' }}>
                    Create owner account
                  </Link>
                </p>
              </div>
            </div>

            {/* Bottom copyright */}
            <div className="mt-4 text-center">
              <p className="text-[10px] tracking-wide" style={{ color: '#94a3b8', opacity: 0.7 }}>
                © 2026 EduCore. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;

