import { useSelector } from 'react-redux';
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

    </>
  );
};

export default Dashboard;
