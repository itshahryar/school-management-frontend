import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import CreateUserForm from '@/features/auth/components/CreateUserForm';
import UsersPagination from '@/features/users/components/UsersPagination';
import UsersTable from '@/features/users/components/UsersTable';
import UsersToolbar from '@/features/users/components/UsersToolbar';
import { useGetUsersQuery } from '@/features/users/api/usersApi';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 10;

const Users = () => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, isActive]);

  const queryArgs = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    role,
    isActive,
  };

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetUsersQuery(queryArgs);

  const users = data?.users ?? [];
  const pagination = data?.pagination;
  const hasActiveFilters = Boolean(debouncedSearch || role || isActive);
  const errorMessage =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    'Failed to load users';

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

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b p-4">
          <UsersToolbar
            search={search}
            onSearchChange={setSearch}
            role={role}
            onRoleChange={setRole}
            isActive={isActive}
            onIsActiveChange={setIsActive}
          />
        </div>

        <div className={isFetching && !isLoading ? 'opacity-70 transition-opacity' : ''}>
          <UsersTable
            users={users}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            onRetry={refetch}
            onCreateUser={() => setShowCreateUser(true)}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <UsersPagination
          pagination={pagination}
          onPageChange={setPage}
          isFetching={isFetching}
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
