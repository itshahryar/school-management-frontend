import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { useGetClassQuery } from '@/features/classes/api/classesApi';
import { useGetSubjectsQuery } from '@/features/subjects/api/subjectsApi';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 50;

const AdminClassSubjects = () => {
  const { classId } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, classId]);

  const {
    data: classRecord,
    isLoading: isClassLoading,
    isError: isClassError,
    error: classError,
  } = useGetClassQuery(classId, { skip: !classId });

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
    },
    { skip: !classId }
  );

  const subjects = data?.subjects ?? [];
  const errorMessage =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    'Failed to load subjects';

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
          <Link to="/admin/classes">Back to Classes</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
          <Link to="/admin/classes">
            <ArrowLeft />
            Back to Classes
          </Link>
        </Button>

        <PageHeader
          title={`Subjects · ${classRecord.name}`}
          description="View all subjects for this class. Click on a subject to view its topics and questions."
          className="mb-0"
        />
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full max-w-sm px-3 py-2 text-sm border rounded-md"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
            <Button variant="outline" onClick={refetch}>
              Try again
            </Button>
          </div>
        ) : !subjects.length ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No subjects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/admin/classes/${classId}/subjects/${subject.id}/content`}
              >
                <Card
                  className={cn(
                    'p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
                    !subject.isActive && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">{subject.name}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        subject.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      )}
                    >
                      {subject.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {subject.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminClassSubjects;
