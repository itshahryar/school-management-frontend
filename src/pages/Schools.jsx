import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Loader2, Plus, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SchoolFormDialog from '@/features/schools/components/SchoolFormDialog';
import {
  useDeleteSchoolMutation,
  useGetSchoolsQuery,
} from '@/features/schools/api/schoolsApi';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

const Schools = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [deletingSchool, setDeletingSchool] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const [deleteSchool, { isLoading: isDeleting }] = useDeleteSchoolMutation();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetSchoolsQuery({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch,
    });

  const schools = data?.schools ?? [];
  const errorMessage =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    'Failed to load schools';

  const handleDelete = async () => {
    if (!deletingSchool) return;
    try {
      await deleteSchool(deletingSchool.id).unwrap();
      toast.success('School deleted successfully');
      setDeletingSchool(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete school');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schools"
        description="Create schools, assign users, and map global classes and subjects to each school."
        actions={
          <Button type="button" onClick={() => setFormOpen(true)}>
            <Plus />
            Create School
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b p-4">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search schools..."
            className="max-w-sm"
          />
        </div>

        <div
          className={
            isFetching && !isLoading ? 'opacity-70 transition-opacity' : ''
          }
        >
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-36" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="mb-4 text-sm text-muted-foreground">{errorMessage}</p>
              <Button variant="outline" onClick={refetch}>
                Try again
              </Button>
            </div>
          ) : !schools.length ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No schools found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {schools.map((school) => (
                <Card
                  key={school.id}
                  className={cn(
                    'gap-0 p-4',
                    !school.isActive && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">{school.name}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        school.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      )}
                    >
                      {school.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {school.address ? (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {school.address}
                    </p>
                  ) : null}

                  <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                    <span>{school._count?.members || 0} user(s)</span>
                    <span>{school._count?.subjects || 0} subject(s)</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/schools/${school.id}`}>
                        <Settings2 />
                        Manage
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSchool(school);
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingSchool(school)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      <SchoolFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingSchool(null);
        }}
        school={editingSchool}
      />

      <AlertDialog
        open={Boolean(deletingSchool)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingSchool(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete school?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{' '}
              <span className="font-medium text-heading">
                {deletingSchool?.name}
              </span>{' '}
              and all user and subject assignments for this school.
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

export default Schools;
