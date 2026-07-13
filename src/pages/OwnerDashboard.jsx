import { useSelector } from 'react-redux';
import {
  CheckCircle2,
  MailCheck,
  Shield,
  Users,
  FileText,
  GraduationCap,
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

const OwnerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${getDisplayName(user) || 'Owner'}`}
        description="Manage your school, classes, and users from your owner dashboard."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Shield}
          label="Role"
          value="Owner"
          description="Full access to all system features."
          tone="success"
        />
        <StatCard
          icon={user?.isActive ? CheckCircle2 : Users}
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
          icon={Users}
          label="User Management"
          value="Manage Users"
          description="Create and manage admin accounts."
        />
        <StatCard
          icon={GraduationCap}
          label="Classes"
          value="Manage Classes"
          description="Create and manage classes and subjects."
        />
        <StatCard
          icon={FileText}
          label="Question Papers"
          value="Generate Papers"
          description="Create and manage exam papers."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Owner Dashboard</CardTitle>
          <CardDescription>
            As an Owner, you have full control over the school management system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Manage all users and their roles</p>
            <p>• Create and manage classes and subjects</p>
            <p>• Add content to subjects and create questions</p>
            <p>• Generate and manage question papers</p>
            <p>• Configure system settings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard;
