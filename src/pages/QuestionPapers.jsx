import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FilePlus2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PapersPagination from '@/features/tests/components/PapersPagination';
import PapersTable from '@/features/tests/components/PapersTable';
import PapersToolbar from '@/features/tests/components/PapersToolbar';
import {
  useDeleteTestMutation,
  useGetTestsQuery,
} from '@/features/tests/api/testsApi';
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

const QuestionPapers = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deletingPaper, setDeletingPaper] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const [deleteTest, { isLoading: isDeleting }] = useDeleteTestMutation();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetTestsQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });

  const tests = data?.tests ?? [];
  const pagination = data?.pagination;
  const hasActiveFilters = Boolean(debouncedSearch);
  const errorMessage =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    'Failed to load question papers';

  const handleDelete = async () => {
    if (!deletingPaper) return;
    try {
      await deleteTest(deletingPaper.id).unwrap();
      toast.success('Question paper deleted');
      setDeletingPaper(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete paper');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Papers"
        description="Build and manage question papers from your class question banks."
        actions={
          <Button asChild>
            <Link to="/papers/generate">
              <FilePlus2 />
              Build paper
            </Link>
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b p-4">
          <PapersToolbar search={search} onSearchChange={setSearch} />
        </div>

        <div
          className={
            isFetching && !isLoading ? 'opacity-70 transition-opacity' : ''
          }
        >
          <PapersTable
            tests={tests}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            onRetry={refetch}
            onCreate={() => navigate('/papers/generate')}
            onView={(item) => navigate(`/papers/${item.id}`)}
            onEdit={(item) => navigate(`/papers/${item.id}/edit`)}
            onDelete={setDeletingPaper}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <PapersPagination
          pagination={pagination}
          onPageChange={setPage}
          isFetching={isFetching}
        />
      </Card>

      <AlertDialog
        open={Boolean(deletingPaper)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingPaper(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question paper?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the generated paper and its snapshot.
              Questions in the bank are not deleted.
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

export default QuestionPapers;
