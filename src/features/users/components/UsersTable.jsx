import { AlertCircle, UsersRound } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getDisplayName } from '@/utils/user';
import { cn } from '@/lib/utils';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const UsersTableSkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-14" />
      </div>
    ))}
  </div>
);

const UsersTable = ({
  users = [],
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onCreateUser,
  hasActiveFilters,
}) => {
  if (isLoading) {
    return <UsersTableSkeleton />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn’t load users"
        description={errorMessage || 'Something went wrong. Please try again.'}
        action={
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!users.length) {
    return (
      <EmptyState
        icon={UsersRound}
        title={hasActiveFilters ? 'No matching users' : 'No users yet'}
        description={
          hasActiveFilters
            ? 'Try adjusting your search or filters.'
            : 'Create the first user account to get started.'
        }
        action={
          !hasActiveFilters ? (
            <Button type="button" onClick={onCreateUser}>
              Create User
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Email</TableHead>
          <TableHead className="pr-4">Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="pl-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-heading">
                  {getDisplayName(user)}
                </p>
                <p className="truncate text-xs text-muted-foreground sm:hidden">
                  {user.email}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {user.role?.toLowerCase()}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  user.isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                )}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {user.email}
            </TableCell>
            <TableCell className="pr-4 text-muted-foreground">
              {formatDate(user.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
