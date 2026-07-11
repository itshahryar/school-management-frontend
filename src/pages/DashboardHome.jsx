import { useSelector } from 'react-redux';
import {
  CheckCircle2,
  MailCheck,
  Shield,
  UserRound,
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

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${getDisplayName(user) || 'there'}`}
        description="Overview of your account status and workspace access."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={Shield}
          label="Role"
          value={user?.role || '—'}
          description="Your current access level in EduCore."
        />
        <StatCard
          icon={user?.isActive ? CheckCircle2 : UserRound}
          label="Status"
          value={user?.isActive ? 'Active' : 'Inactive'}
          tone={user?.isActive ? 'success' : 'danger'}
          description="Whether this account can sign in."
        />
        <StatCard
          icon={MailCheck}
          label="Email Verified"
          value={user?.emailVerified ? 'Verified' : 'Pending'}
          tone={user?.emailVerified ? 'success' : 'danger'}
          description="Email confirmation status for this account."
        />
      </div>
    </div>
  );
};

export default Dashboard;
