import { useGetClassesCatalogQuery } from '@/features/classes/api/classesApi';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const SchoolSubjectPicker = ({
  selectedSubjectIds = [],
  onChange,
  disabled = false,
}) => {
  const { data: classes = [], isLoading, isError } = useGetClassesCatalogQuery();

  const toggleSubject = (subjectId, checked) => {
    if (disabled) return;
    const next = checked
      ? [...new Set([...selectedSubjectIds, subjectId])]
      : selectedSubjectIds.filter((id) => id !== subjectId);
    onChange(next);
  };

  const toggleClass = (classSubjects, checked) => {
    if (disabled) return;
    const subjectIds = classSubjects.map((subject) => subject.id);
    if (checked) {
      onChange([...new Set([...selectedSubjectIds, ...subjectIds])]);
      return;
    }
    onChange(selectedSubjectIds.filter((id) => !subjectIds.includes(id)));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Failed to load global classes and subjects.
      </p>
    );
  }

  if (!classes.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No global subjects available. Create classes and subjects first.
      </p>
    );
  }

  return (
    <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
      {classes.map((classItem) => {
        const subjectIds = classItem.subjects.map((subject) => subject.id);
        const allSelected =
          subjectIds.length > 0 &&
          subjectIds.every((id) => selectedSubjectIds.includes(id));
        const someSelected =
          subjectIds.some((id) => selectedSubjectIds.includes(id)) &&
          !allSelected;

        return (
          <div key={classItem.id} className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`class-${classItem.id}`}
                checked={
                  allSelected ? true : someSelected ? 'indeterminate' : false
                }
                disabled={disabled || !subjectIds.length}
                onCheckedChange={(checked) =>
                  toggleClass(classItem.subjects, Boolean(checked))
                }
              />
              <Label htmlFor={`class-${classItem.id}`} className="font-medium">
                {classItem.name}
              </Label>
              <span className="text-xs text-muted-foreground">
                ({subjectIds.length} subject{subjectIds.length === 1 ? '' : 's'})
              </span>
            </div>

            {!classItem.subjects.length ? (
              <p className="mt-2 pl-6 text-xs text-muted-foreground">
                No subjects in this class yet.
              </p>
            ) : (
              <div className="mt-3 space-y-2 pl-6">
                {classItem.subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={selectedSubjectIds.includes(subject.id)}
                      disabled={disabled}
                      onCheckedChange={(checked) =>
                        toggleSubject(subject.id, Boolean(checked))
                      }
                    />
                    <Label
                      htmlFor={`subject-${subject.id}`}
                      className="text-sm font-normal"
                    >
                      {subject.name}
                      {subject.code ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({subject.code})
                        </span>
                      ) : null}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SchoolSubjectPicker;
