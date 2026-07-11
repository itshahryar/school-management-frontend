import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getInitials, getDisplayName } from '../../utils/user';

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
    setDropdownOpen(false);
  };

  const navigateToSettings = () => {
    navigate('/settings');
    setDropdownOpen(false);
  };

  return (
    <header
      className="flex items-center justify-between px-6 h-14"
      style={{
        backgroundColor: 'var(--card-background)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center h-8 w-8 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-accent) 100%)',
            boxShadow: '0 2px 8px rgba(79, 110, 247, 0.25)',
          }}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'var(--text-inverse)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </div>
        <h1
          className="text-sm font-semibold tracking-tight"
          style={{ color: 'var(--heading)' }}
        >
          Dashboard
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* User Info (hidden on very small screens) */}
        <div className="hidden sm:flex flex-col items-end">
          <span
            className="text-xs font-medium leading-tight"
            style={{ color: 'var(--heading)' }}
          >
            {getDisplayName(user)}
          </span>
          <span
            className="text-[11px] leading-tight"
            style={{ color: 'var(--muted-text)' }}
          >
            {user?.email}
          </span>
        </div>

        {/* Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg transition-all duration-200"
            style={{
              cursor: 'pointer',
              backgroundColor: dropdownOpen ? 'var(--primary-light)' : 'transparent',
              border: '1px solid',
              borderColor: dropdownOpen ? 'var(--primary)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!dropdownOpen) {
                e.currentTarget.style.backgroundColor = 'var(--surface-muted)';
              }
            }}
            onMouseLeave={(e) => {
              if (!dropdownOpen) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center font-semibold text-xs"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-accent) 100%)',
                color: 'var(--text-inverse)',
                boxShadow: '0 1px 4px rgba(79, 110, 247, 0.2)',
              }}
            >
              {getInitials(user)}
            </div>
            <FiChevronDown
              className="h-3.5 w-3.5 transition-transform duration-200"
              style={{
                color: 'var(--muted-text)',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {/* Dropdown Menu */}
          <div
            className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden z-50"
            style={{
              backgroundColor: 'var(--card-background)',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
              opacity: dropdownOpen ? 1 : 0,
              transform: dropdownOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              pointerEvents: dropdownOpen ? 'auto' : 'none',
              transformOrigin: 'top right',
            }}
          >
            {/* User Header - shown on mobile */}
            <div
              className="sm:hidden px-4 py-3"
              style={{
                borderBottom: '1px solid var(--border-light)',
                backgroundColor: 'var(--surface-muted)',
              }}
            >
              <p
                className="text-xs font-medium"
                style={{ color: 'var(--heading)' }}
              >
                {getDisplayName(user)}
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: 'var(--muted-text)' }}
              >
                {user?.email}
              </p>
            </div>

            {/* Menu Items */}
            <div className="p-1.5">
              <button
                type="button"
                onClick={navigateToSettings}
                className="menu-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  color: 'var(--heading)',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  e.currentTarget.style.color = 'var(--primary-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--heading)';
                }}
              >
                <span
                  className="flex items-center justify-center h-7 w-7 rounded-md"
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}
                >
                  <FiUser className="h-3.5 w-3.5" />
                </span>
                Profile & Settings
              </button>

              <div
                className="my-1.5 mx-2"
                style={{ borderTop: '1px solid var(--border-light)' }}
              />

              <button
                type="button"
                onClick={handleLogout}
                className="menu-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  color: 'var(--error)',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--error-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span
                  className="flex items-center justify-center h-7 w-7 rounded-md"
                  style={{
                    backgroundColor: 'var(--error-bg)',
                    color: 'var(--error)',
                  }}
                >
                  <FiLogOut className="h-3.5 w-3.5" />
                </span>
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
