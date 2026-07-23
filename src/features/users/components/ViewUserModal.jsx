import {
  Building,
  Calendar,
  CheckCircle,
  Hash,
  IdCard,
  Briefcase,
  Mail,
  Phone,
  Shield,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getDisplayName } from '@/utils/user';
import { cn } from '@/lib/utils';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {label}
    </div>
    <div className="rounded-lg border bg-muted/50 px-3 py-1.5 text-xs break-words">
      {value?.trim?.() || value || '—'}
    </div>
  </div>
);

const ViewUserModal = ({ open, onOpenChange, user = null }) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center border-b px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-primary">User Details</h2>
            <p className="text-xs text-muted-foreground">
              View account information
            </p>
          </div>
        </div>

        <div className="space-y-4 px-4 py-3">
          <div className="rounded-md border bg-muted/50 p-3">
            <h3 className="text-sm font-semibold">{getDisplayName(user)}</h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Hash className="h-2.5 w-2.5" />
              ID: {user.id}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 rounded-md border p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Shield className="h-3 w-3" />
                Role
              </div>
              <Badge variant="secondary" className="capitalize text-xs">
                {user.role?.toLowerCase()}
              </Badge>
            </div>

            <div className="space-y-1.5 rounded-md border p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  user.isActive
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-rose-500 bg-rose-50 text-rose-700'
                )}
              >
                <span className="flex items-center gap-1">
                  {user.isActive ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </Badge>
            </div>

            <div className="space-y-1.5 rounded-md border p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Account Created
              </div>
              <p className="text-xs font-medium">{formatDate(user.createdAt)}</p>
            </div>

            <div className="space-y-1.5 rounded-md border p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Phone Verified
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  user.primaryPhoneVerified
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-amber-500 bg-amber-50 text-amber-800'
                )}
              >
                <span className="flex items-center gap-1">
                  {user.primaryPhoneVerified ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {user.primaryPhoneVerified ? 'Verified' : 'Not verified'}
                </span>
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contact & identity
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow
                icon={Phone}
                label="Primary Phone"
                value={user.primaryPhone}
              />
              <DetailRow
                icon={Phone}
                label="Secondary Phone"
                value={user.secondaryPhone}
              />
            </div>

            <DetailRow
              icon={IdCard}
              label="CNIC / National ID"
              value={user.nationalId}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              School memberships
            </h4>

            {!user.schools?.length ? (
              <p className="text-xs text-muted-foreground">
                Not assigned to any school yet.
              </p>
            ) : (
              <div className="space-y-2">
                {user.schools.map((membership) => (
                  <div
                    key={membership.id}
                    className="rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Building className="h-3.5 w-3.5" />
                      {membership.school.name}
                    </div>
                    {membership.designation ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Briefcase className="h-3 w-3" />
                        {membership.designation}
                      </p>
                    ) : null}
                    {membership.school.address ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {membership.school.address}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t bg-muted/30 px-4 py-3">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-8 min-w-[80px] text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserModal;
