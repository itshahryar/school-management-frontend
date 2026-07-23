import { Plus, Trash2 } from 'lucide-react';
import { useGetSchoolsQuery } from '@/features/schools/api/schoolsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const UserSchoolAssignments = ({
  assignments = [],
  onChange,
  disabled = false,
}) => {
  const { data, isLoading } = useGetSchoolsQuery({
    page: 1,
    limit: 100,
    isActive: 'true',
  });

  const schools = data?.schools ?? [];
  const assignedSchoolIds = assignments.map((item) => item.schoolId);
  const availableSchools = schools.filter(
    (school) => !assignedSchoolIds.includes(school.id)
  );

  const addAssignment = (schoolId) => {
    if (!schoolId || disabled) return;
    onChange([...assignments, { schoolId, designation: '' }]);
  };

  const removeAssignment = (schoolId) => {
    if (disabled) return;
    onChange(assignments.filter((item) => item.schoolId !== schoolId));
  };

  const updateDesignation = (schoolId, designation) => {
    if (disabled) return;
    onChange(
      assignments.map((item) =>
        item.schoolId === schoolId ? { ...item, designation } : item
      )
    );
  };

  const getSchoolLabel = (schoolId) => {
    const school = schools.find((item) => item.id === schoolId);
    return school?.name || schoolId;
  };

  if (isLoading) {
    return <Skeleton className="h-24" />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Assign to school</Label>
        <Select
          disabled={disabled || !availableSchools.length}
          onValueChange={addAssignment}
          value=""
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                availableSchools.length
                  ? 'Select a school'
                  : schools.length
                    ? 'All schools assigned'
                    : 'Create a school first'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableSchools.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!assignments.length ? (
        <p className="text-sm text-muted-foreground">
          No schools assigned. Users can belong to one or more schools.
        </p>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.schoolId}
              className="rounded-lg border p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">
                  {getSchoolLabel(assignment.schoolId)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => removeAssignment(assignment.schoolId)}
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`user-designation-${assignment.schoolId}`}>
                  Designation at this school
                </Label>
                <Input
                  id={`user-designation-${assignment.schoolId}`}
                  placeholder="e.g. Principal, Teacher"
                  value={assignment.designation || ''}
                  disabled={disabled}
                  onChange={(event) =>
                    updateDesignation(assignment.schoolId, event.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {availableSchools.length ? (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Plus className="h-3 w-3" />
          Assign multiple schools if needed
        </p>
      ) : null}
    </div>
  );
};

export default UserSchoolAssignments;
