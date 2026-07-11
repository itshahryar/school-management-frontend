import { Link } from 'react-router-dom';

const Unauthorized = () => {
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
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--heading)' }}>
          Access Denied
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--muted-text)' }}>
          You do not have permission to view this page.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
