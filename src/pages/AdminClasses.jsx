import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import {
  useGetMySchoolsQuery,
  useGetSchoolCurriculumQuery,
} from '@/features/schools/api/schoolsApi';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const AdminClasses = () => {
  const { data: mySchools = [], isLoading: schoolsLoading } = useGetMySchoolsQuery();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  useEffect(() => {
    if (!selectedSchoolId && mySchools.length) {
      setSelectedSchoolId(mySchools[0].id);
    }
  }, [mySchools, selectedSchoolId]);

  const {
    data: curriculum,
    isLoading: curriculumLoading,
    isError,
    error,
    refetch,
  } = useGetSchoolCurriculumQuery(selectedSchoolId, {
    skip: !selectedSchoolId,
  });

  const classes = curriculum?.classes ?? [];
  const selectedSchool = useMemo(
    () => mySchools.find((school) => school.id === selectedSchoolId),
    [mySchools, selectedSchoolId]
  );

  const errorMessage =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    'Failed to load assigned classes';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="View classes and subjects assigned to your school."
      />

      <Card className="p-4 space-y-4">
        {schoolsLoading ? (
          <Skeleton className="h-10 max-w-sm" />
        ) : !mySchools.length ? (
          <p className="text-sm text-muted-foreground">
            You are not assigned to any school yet. Ask the owner to assign you.
          </p>
        ) : (
          <>
            {mySchools.length > 1 ? (
              <div className="max-w-sm space-y-2">
                <p className="text-sm font-medium">Select school</p>
                <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {mySchools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                School: <span className="font-medium text-heading">{selectedSchool?.name}</span>
                {selectedSchool?.designation ? (
                  <span> — {selectedSchool.designation}</span>
                ) : null}
              </p>
            )}

            {curriculumLoading ? (
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
                <p className="text-sm text-muted-foreground">
                  No classes or subjects have been assigned to this school yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((classItem) => (
                  <Link
                    key={classItem.id}
                    to={`/admin/classes/${classItem.id}/subjects?schoolId=${selectedSchoolId}`}
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
                      {classItem.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {classItem.description}
                        </p>
                      ) : null}
                      <div className="mt-3 text-xs text-muted-foreground">
                        {classItem.subjects?.length || 0} assigned subject(s)
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminClasses;
