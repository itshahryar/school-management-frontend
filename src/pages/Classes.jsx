import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ClassFormDialog from '@/features/classes/components/ClassFormDialog';
import ClassesPagination from '@/features/classes/components/ClassesPagination';
import ClassesTable from '@/features/classes/components/ClassesTable';
import ClassesToolbar from '@/features/classes/components/ClassesToolbar';
import {
  useDeleteClassMutation,
  useGetClassesQuery,
} from '@/features/classes/api/classesApi';
import PageHeader from '@/components/common/PageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 10;

const Classes = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deletingClass, setDeletingClass] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, isActive]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetClassesQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    isActive,
  });

  const classes = data?.classes ?? [];
  const pagination = data?.pagination;
  const hasActiveFilters = Boolean(debouncedSearch || isActive);
  const errorMessage =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    'Failed to load classes';

  const openCreate = () => {
    setEditingClass(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingClass(item);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open) => {
    setFormOpen(open);
    if (!open) setEditingClass(null);
  };

  const handleDelete = async () => {
    if (!deletingClass) return;
    try {
      await deleteClass(deletingClass.id).unwrap();
      toast.success('Class deleted successfully');
      setDeletingClass(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete class');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Organize your school into classes that hold subjects and content."
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus />
            Create Class
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b p-4">
          <ClassesToolbar
            search={search}
            onSearchChange={setSearch}
            isActive={isActive}
            onIsActiveChange={setIsActive}
          />
        </div>

        <div
          className={
            isFetching && !isLoading ? 'opacity-70 transition-opacity' : ''
          }
        >
          <ClassesTable
            classes={classes}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            onRetry={refetch}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={setDeletingClass}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <ClassesPagination
          pagination={pagination}
          onPageChange={setPage}
          isFetching={isFetching}
        />
      </Card>

      <ClassFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        classItem={editingClass}
      />

      <AlertDialog
        open={Boolean(deletingClass)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingClass(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete class?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-medium text-heading">
                {deletingClass?.name}
              </span>{' '}
              and all of its subjects and content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Classes;
