import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import CreateUserForm from '../features/auth/components/CreateUserForm';

const Users = () => {
  const [showCreateUser, setShowCreateUser] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--heading)' }}>
            Users
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Create and manage user accounts
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateUser(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs transition-all duration-200"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--text-inverse)',
            cursor: 'pointer',
          }}
        >
          <FiUserPlus className="h-3.5 w-3.5" />
          Create User
        </button>
      </div>

      <div
        className="p-6 text-center"
        style={{
          backgroundColor: 'var(--card-background)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
          User listing will be available in a future update. Use Create User to add accounts
          now.
        </p>
      </div>

      {showCreateUser && <CreateUserForm onClose={() => setShowCreateUser(false)} />}
    </>
  );
};

export default Users;
