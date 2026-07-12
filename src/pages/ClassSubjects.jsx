import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetClassQuery } from '@/features/classes/api/classesApi';
import SubjectFormDialog from '@/features/subjects/components/SubjectFormDialog';
import SubjectsPagination from '@/features/subjects/components/SubjectsPagination';
import SubjectsTable from '@/features/subjects/components/SubjectsTable';
import SubjectsToolbar from '@/features/subjects/components/SubjectsToolbar';
import {
  useDeleteSubjectMutation,
  useGetSubjectsQuery,
} from '@/features/subjects/api/subjectsApi';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 10;

const ClassSubjects = () => {
  const { classId } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const [deleteSubject, { isLoading: isDeleting }] = useDeleteSubjectMutation();

  const {
    data: classRecord,
    isLoading: isClassLoading,
    isError: isClassError,
    error: classError,
  } = useGetClassQuery(classId, { skip: !classId });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, isActive, classId]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSubjectsQuery(
    {
      page,
      limit: PAGE_SIZE,
      classId,
      search: debouncedSearch,
      isActive,
    },
    { skip: !classId }
  );

  const subjects = data?.subjects ?? [];
  const pagination = data?.pagination;
  const hasActiveFilters = Boolean(debouncedSearch || isActive);
  const errorMessage =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    'Failed to load subjects';

  const openCreate = () => {
    setEditingSubject(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingSubject(item);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open) => {
    setFormOpen(open);
    if (!open) setEditingSubject(null);
  };

  const handleDelete = async () => {
    if (!deletingSubject) return;
    try {
      await deleteSubject(deletingSubject.id).unwrap();
      toast.success('Subject deleted successfully');
      setDeletingSubject(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete subject');
    }
  };

  if (isClassLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isClassError || !classRecord) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {classError?.data?.message || 'Class not found.'}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/classes">Back to Classes</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
          <Link to="/classes">
            <ArrowLeft />
            Back to Classes
          </Link>
        </Button>

        <PageHeader
          title={`Subjects · ${classRecord.name}`}
          description="Manage subjects for this class. Each subject holds chapters, topics, and questions."
          actions={
            <Button type="button" onClick={openCreate}>
              <Plus />
              Create Subject
            </Button>
          }
          className="mb-0"
        />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b p-4">
          <SubjectsToolbar
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
          <SubjectsTable
            classId={classId}
            subjects={subjects}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            onRetry={refetch}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={setDeletingSubject}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <SubjectsPagination
          pagination={pagination}
          onPageChange={setPage}
          isFetching={isFetching}
        />
      </Card>

      <SubjectFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        classId={classId}
        subjectItem={editingSubject}
      />

      <AlertDialog
        open={Boolean(deletingSubject)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingSubject(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-medium text-heading">
                {deletingSubject?.name}
              </span>{' '}
              and all of its chapters, topics, questions, and notes.
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

export default ClassSubjects;
