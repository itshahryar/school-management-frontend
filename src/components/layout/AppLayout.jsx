import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiMenu } from 'react-icons/fi';
import Sidebar from './Sidebar';
import Header from '../common/Header';
import { getInitials } from '../../utils/user';

const AppLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--page-background)' }}>
      <div className="flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-14' : 'lg:ml-44'
          }`}
        >
          <header
            className="lg:hidden p-3"
            style={{
              backgroundColor: 'var(--card-background)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-md"
                style={{
                  backgroundColor: 'var(--surface-muted)',
                  color: 'var(--body-text)',
                  cursor: 'pointer',
                }}
                aria-label="Open menu"
              >
                <FiMenu className="h-4 w-4" />
              </button>
              <div
                className="h-6 w-6 rounded-md flex items-center justify-center font-semibold text-xs"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
              >
                {getInitials(user)}
              </div>
            </div>
          </header>

          <div className="hidden lg:block fixed top-0 right-0 left-0 z-40">
            <div
              className={`transition-all duration-300 ${
                sidebarCollapsed ? 'ml-14' : 'ml-44'
              }`}
            >
              <Header />
            </div>
          </div>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 lg:pt-20">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
