import { useMemo } from 'react';
import {
  FiUsers,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiShield,
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROLES } from '../../constants/roles';
import { getDisplayName, getInitials } from '../../utils/user';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const menuItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: FiGrid, path: '/dashboard' },
      ...(user?.role === ROLES.OWNER
        ? [{ id: 'users', label: 'Users', icon: FiUsers, path: '/users' }]
        : []),
      { id: 'settings', label: 'Settings', icon: FiSettings, path: '/settings' },
    ],
    [user?.role]
  );

  const activePath = location.pathname;

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const goTo = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-14' : 'lg:w-44'} lg:translate-x-0`}
        style={{
          width: isCollapsed ? '56px' : '176px',
          backgroundColor: 'var(--card-background)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <div
          className={`border-b flex items-center justify-between ${isCollapsed ? 'p-3' : 'p-4'}`}
          style={{ borderColor: 'var(--border-light)' }}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-md"
                style={{ backgroundColor: 'var(--primary-light)' }}
              >
                <FiShield className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              </div>
              <h1 className="text-sm font-semibold" style={{ color: 'var(--heading)' }}>
                EduCore
              </h1>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-md transition-colors"
            style={{
              backgroundColor: 'var(--surface-muted)',
              color: 'var(--muted-text)',
              cursor: 'pointer',
            }}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <FiChevronRight className="h-3 w-3" />
            ) : (
              <FiChevronLeft className="h-3 w-3" />
            )}
          </button>
        </div>

        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activePath === item.path || activePath.startsWith(`${item.path}/`);

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => goTo(item.path)}
                    className={`w-full flex items-center justify-center rounded-md transition-all duration-200 ${
                      isActive ? '' : 'hover:opacity-80'
                    } ${isCollapsed ? 'py-2' : 'px-2 py-2'}`}
                    style={{
                      backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? 'var(--text-inverse)' : 'var(--body-text)',
                      cursor: 'pointer',
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: isActive ? 'var(--text-inverse)' : 'inherit' }}
                    />
                    {!isCollapsed && (
                      <span className="font-medium text-xs ml-2">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={`absolute bottom-0 left-0 right-0 border-t ${isCollapsed ? 'p-2' : 'p-3'}`}
          style={{ borderColor: 'var(--border-light)' }}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-7 w-7 rounded-md flex items-center justify-center font-semibold text-xs"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
              >
                {getInitials(user)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--heading)' }}>
                  {getDisplayName(user)}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-text)' }}>
                  {user?.email}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
              isCollapsed ? 'px-2' : ''
            }`}
            style={{
              backgroundColor: 'var(--surface-muted)',
              color: 'var(--body-text)',
              cursor: 'pointer',
            }}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <FiLogOut className="h-3 w-3 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
