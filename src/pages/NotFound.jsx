import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import { getDashboardPath } from '@/constants/roles';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dashboardPath = getDashboardPath(user?.role);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
        <PageHeader
          title="Page Not Found"
          description="The page you're looking for doesn't exist or has been moved."
        />
      </div>
      
      <Button onClick={() => navigate(dashboardPath)}>
        <Home className="mr-2 h-4 w-4" />
        Go to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
