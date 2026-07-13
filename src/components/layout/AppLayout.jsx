import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import AppSidebar from './Sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

const AppLayout = () => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <div className="print:hidden">
        <Header />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 print:gap-0 print:p-0">
        <Outlet />
      </div>
    </SidebarInset>
  </SidebarProvider>
);

export default AppLayout;
