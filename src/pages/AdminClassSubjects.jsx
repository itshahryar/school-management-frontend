import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useGetClassQuery } from '@/features/classes/api/classesApi';
import { useGetSchoolCurriculumQuery } from '@/features/schools/api/schoolsApi';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const AdminClassSubjects = () => {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const schoolId = searchParams.get('schoolId') || '';
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSearch('');
  }, [classId, schoolId]);

  const {
    data: classRecord,
    isLoading: isClassLoading,
    isError: isClassError,
    error: classError,
  } = useGetClassQuery(classId, { skip: !classId });

  const {
    data: curriculum,
    isLoading: isCurriculumLoading,
    isError: isCurriculumError,
    error: curriculumError,
    refetch,
  } = useGetSchoolCurriculumQuery(schoolId, {
    skip: !schoolId,
  });

  const subjects = useMemo(() => {
    const classSubjects =
      curriculum?.classes?.find((item) => item.id === classId)?.subjects ?? [];

    if (!search.trim()) return classSubjects;

    const term = search.trim().toLowerCase();
    return classSubjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(term) ||
        subject.code?.toLowerCase().includes(term)
    );
  }, [curriculum, classId, search]);

  const backLink = schoolId
    ? '/admin/classes'
    : '/admin/classes';

  const errorMessage =
    curriculumError?.data?.message ||
    (typeof curriculumError?.data === 'string' ? curriculumError.data : null) ||
    'Failed to load assigned subjects';

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
          <Link to={backLink}>Back to Classes</Link>
        </Button>
      </Card>
    );
  }

  if (!schoolId) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Open this class from your school list to view assigned subjects.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={backLink}>Back to Classes</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
          <Link to={backLink}>
            <ArrowLeft />
            Back to Classes
          </Link>
        </Button>

        <PageHeader
          title={`Subjects · ${classRecord.name}`}
          description="View subjects assigned to your school for this class."
          className="mb-0"
        />
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subjects..."
            className="w-full max-w-sm px-3 py-2 text-sm border rounded-md"
          />
        </div>

        {isCurriculumLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
        ) : isCurriculumError ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
            <Button variant="outline" onClick={refetch}>
              Try again
            </Button>
          </div>
        ) : !subjects.length ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No assigned subjects found for this class.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/admin/classes/${classId}/subjects/${subject.id}/content?schoolId=${schoolId}`}
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
                  {subject.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {subject.description}
                    </p>
                  ) : null}
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
