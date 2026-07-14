import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';
import { useGetClassesQuery } from '@/features/classes/api/classesApi';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 50;

const AdminClasses = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 400);

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
  } = useGetClassesQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });

  const classes = data?.classes ?? [];
  const errorMessage =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    'Failed to load classes';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="View all classes in the school. Click on a class to view its subjects."
      />

      <Card className="p-4">
        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes..."
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
        ) : !classes.length ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No classes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <Link
                key={classItem.id}
                to={`/admin/classes/${classItem.id}/subjects`}
              >
                <Card
                  className={cn(
                    'p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
                    !classItem.isActive && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">{classItem.name}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        classItem.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      )}
                    >
                      {classItem.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {classItem.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {classItem.description}
                    </p>
                  )}
                  <div className="mt-3 text-xs text-muted-foreground">
                    {classItem._count?.subjects || 0} subject(s)
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminClasses;
