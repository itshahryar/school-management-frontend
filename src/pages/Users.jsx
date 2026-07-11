import { useState } from 'react';
import { UserPlus, UsersRound } from 'lucide-react';
import CreateUserForm from '@/features/auth/components/CreateUserForm';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Users = () => {
  const [showCreateUser, setShowCreateUser] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Create and manage user accounts for your school."
        actions={
          <Button type="button" onClick={() => setShowCreateUser(true)}>
            <UserPlus />
            Create User
          </Button>
        }
      />

      <Card>
        <EmptyState
          icon={UsersRound}
          title="No users to display yet"
          description="User listing will be available in a future update. You can still create accounts now."
          action={
            <Button type="button" onClick={() => setShowCreateUser(true)}>
              <UserPlus />
              Create User
            </Button>
          }
        />
      </Card>

      <CreateUserForm
        open={showCreateUser}
        onOpenChange={setShowCreateUser}
      />
    </div>
  );
};

export default Users;
