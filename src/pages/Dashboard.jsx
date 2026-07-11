import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiLock, FiUserPlus } from 'react-icons/fi';
import ChangePasswordForm from '../features/auth/components/ChangePasswordForm';
import CreateUserForm from '../features/auth/components/CreateUserForm';
import { ROLES } from '../constants/roles';
import { getDisplayName } from '../utils/user';

const StatCard = ({ label, value, accent }) => (
  <div
    className="p-4"
    style={{
      backgroundColor: 'var(--card-background)',
      borderRadius: '8px',
      border: '1px solid var(--border)',
    }}
  >
    <p className="text-xs mb-1" style={{ color: 'var(--muted-text)' }}>
      {label}
    </p>
    <p className="text-lg font-semibold" style={{ color: accent || 'var(--heading)' }}>
      {value}
    </p>
  </div>
);

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);

  return (
    <>
      <div className="mb-5">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--heading)' }}>
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
          Overview of your account status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <StatCard label="Role" value={user?.role} />
        <StatCard
          label="Status"
          value={user?.isActive ? 'Active' : 'Inactive'}
          accent={user?.isActive ? 'var(--success)' : 'var(--error)'}
        />
        <StatCard
          label="Email Verified"
          value={user?.emailVerified ? 'Yes' : 'No'}
          accent={user?.emailVerified ? 'var(--success)' : 'var(--error)'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--heading)' }}>
              Account Details
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: getDisplayName(user) },
                { label: 'Email', value: user?.email },
                { label: 'User ID', value: user?.id, mono: true },
                {
                  label: 'Last Login',
                  value: user?.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : 'Never',
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: '1px solid var(--border-light)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--muted-text)' }}>
                    {row.label}
                  </span>
                  <span
                    className={`font-medium text-xs ${row.mono ? 'font-mono' : ''}`}
                    style={{ color: 'var(--heading)' }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--heading)' }}>
              Quick Actions
            </h2>
            <div className="space-y-2">
              {user?.role === ROLES.OWNER && (
                <button
                  type="button"
                  onClick={() => setShowCreateUser(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                  }}
                >
                  <FiUserPlus className="h-3.5 w-3.5" />
                  <span className="font-medium text-xs">Create New User</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowChangePassword(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200"
                style={{
                  backgroundColor: 'var(--surface-muted)',
                  color: 'var(--body-text)',
                  cursor: 'pointer',
                }}
              >
                <FiLock className="h-3.5 w-3.5" />
                <span className="font-medium text-xs">Change Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
      )}
      {showCreateUser && <CreateUserForm onClose={() => setShowCreateUser(false)} />}
    </>
  );
};

export default Dashboard;
