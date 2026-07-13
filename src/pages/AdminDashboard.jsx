import { useSelector } from 'react-redux';
import {
  CheckCircle2,
  MailCheck,
  Shield,
  FileText,
  Eye,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getDisplayName } from '@/utils/user';
import { cn } from '@/lib/utils';

const StatCard = ({ icon: Icon, label, value, description, tone = 'default' }) => (
  <Card size="sm">
    <CardHeader className="flex flex-row items-start justify-between gap-3">
      <div className="space-y-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl text-heading">{value}</CardTitle>
      </div>
      <div
        className={cn(
          'flex size-9 items-center justify-center rounded-lg',
          tone === 'success' && 'bg-emerald-500/10 text-emerald-600',
          tone === 'danger' && 'bg-destructive/10 text-destructive',
          tone === 'default' && 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="size-4" />
      </div>
    </CardHeader>
    {description ? (
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    ) : null}
  </Card>
);

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${getDisplayName(user) || 'Admin'}`}
        description="Manage question papers and view content from your admin dashboard."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Shield}
          label="Role"
          value="Admin"
          description="Access to question paper management."
          tone="success"
        />
        <StatCard
          icon={user?.isActive ? CheckCircle2 : Eye}
          label="Account Status"
          value={user?.isActive ? 'Active' : 'Inactive'}
          tone={user?.isActive ? 'success' : 'danger'}
          description="Your account status."
        />
        <StatCard
          icon={MailCheck}
          label="Email Verified"
          value={user?.emailVerified ? 'Verified' : 'Pending'}
          tone={user?.emailVerified ? 'success' : 'danger'}
          description="Email confirmation status."
        />
        <StatCard
          icon={FileText}
          label="Question Papers"
          value="Manage Papers"
          description="Generate and manage exam papers."
        />
        <StatCard
          icon={Eye}
          label="View Content"
          value="Browse Content"
          description="View classes, subjects, and content."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            As an Admin, you can manage question papers and view educational content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Generate and manage question papers</p>
            <p>• View and edit existing question papers</p>
            <p>• Browse classes and subjects</p>
            <p>• View subject content and questions</p>
            <p>• Manage your account settings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
