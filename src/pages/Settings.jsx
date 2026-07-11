import { useState } from 'react';
import { useSelector } from 'react-redux';
import { KeyRound, Mail, Shield, UserRound } from 'lucide-react';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import PageHeader from '@/components/common/PageHeader';
import { getDisplayName } from '@/utils/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="size-4" />
    </div>
    <div className="min-w-0 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium text-heading">{children}</div>
    </div>
  </div>
);

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account details and security preferences."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Details associated with your EduCore account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <InfoRow icon={UserRound} label="Name">
              {getDisplayName(user) || '—'}
            </InfoRow>
            <Separator />
            <InfoRow icon={Mail} label="Email">
              {user?.email || '—'}
            </InfoRow>
            <Separator />
            <InfoRow icon={Shield} label="Role">
              {user?.role ? (
                <Badge variant="secondary" className="capitalize">
                  {user.role.toLowerCase()}
                </Badge>
              ) : (
                '—'
              )}
            </InfoRow>
            <Separator />
            <InfoRow icon={KeyRound} label="Last Login">
              {user?.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : 'Never'}
            </InfoRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Keep your account secure by updating your password regularly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-heading">Password</p>
                  <p className="text-xs text-muted-foreground">
                    Change your current password to a new secure one.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChangePassword(true)}
                >
                  <KeyRound />
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordForm
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </div>
  );
};

export default Settings;
