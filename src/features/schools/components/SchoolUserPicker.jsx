import { Plus, Trash2 } from 'lucide-react';
import { useGetUsersQuery } from '@/features/users/api/usersApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const SchoolUserPicker = ({
  members = [],
  onChange,
  disabled = false,
}) => {
  const { data, isLoading } = useGetUsersQuery({
    page: 1,
    limit: 100,
    isActive: 'true',
  });

  const users = data?.users ?? [];
  const assignedUserIds = members.map((member) => member.userId);

  const availableUsers = users.filter(
    (user) => !assignedUserIds.includes(user.id)
  );

  const addMember = (userId) => {
    if (!userId || disabled) return;
    onChange([...members, { userId, designation: '' }]);
  };

  const removeMember = (userId) => {
    if (disabled) return;
    onChange(members.filter((member) => member.userId !== userId));
  };

  const updateDesignation = (userId, designation) => {
    if (disabled) return;
    onChange(
      members.map((member) =>
        member.userId === userId ? { ...member, designation } : member
      )
    );
  };

  const getUserLabel = (userId) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return userId;
    return `${user.firstName} ${user.lastName} (${user.email})`;
  };

  if (isLoading) {
    return <Skeleton className="h-24" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label>Add user to school</Label>
          <Select
            disabled={disabled || !availableUsers.length}
            onValueChange={addMember}
            value=""
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  availableUsers.length
                    ? 'Select a user'
                    : 'All active users are assigned'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} — {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!members.length ? (
        <p className="text-sm text-muted-foreground">
          No users assigned yet. Select a user above to add them to this school.
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.userId}
              className="rounded-lg border p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{getUserLabel(member.userId)}</p>
                  <p className="text-xs text-muted-foreground">
                    Multiple users can belong to the same school
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => removeMember(member.userId)}
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`designation-${member.userId}`}>Designation</Label>
                <Input
                  id={`designation-${member.userId}`}
                  placeholder="e.g. Principal, Teacher"
                  value={member.designation || ''}
                  disabled={disabled}
                  onChange={(event) =>
                    updateDesignation(member.userId, event.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {availableUsers.length ? (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Plus className="h-3 w-3" />
          A user can belong to one or more schools
        </p>
      ) : null}
    </div>
  );
};

export default SchoolUserPicker;
