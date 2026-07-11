import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import AppSidebar from './Sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

const AppLayout = () => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <Outlet />
      </div>
    </SidebarInset>
  </SidebarProvider>
);

export default AppLayout;
