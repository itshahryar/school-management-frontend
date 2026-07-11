import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiLock } from 'react-icons/fi';
import ChangePasswordForm from '../features/auth/components/ChangePasswordForm';
import { getDisplayName } from '../utils/user';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <>

      <div
        style={{
          backgroundColor: 'var(--card-background)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          marginBottom: '16px',
        }}
      >
        <div className="p-4">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--heading)' }}>
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-text)' }}>
                Name
              </p>
              <p className="font-medium text-xs" style={{ color: 'var(--heading)' }}>
                {getDisplayName(user)}
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-text)' }}>
                Email
              </p>
              <p className="font-medium text-xs" style={{ color: 'var(--heading)' }}>
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-text)' }}>
                Role
              </p>
              <p className="font-medium text-xs" style={{ color: 'var(--heading)' }}>
                {user?.role}
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-text)' }}>
                Last Login
              </p>
              <p className="font-medium text-xs" style={{ color: 'var(--heading)' }}>
                {user?.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : 'Never'}
              </p>
            </div>
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
            Security
          </h2>
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

      {showChangePassword && (
        <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
};

export default Settings;
