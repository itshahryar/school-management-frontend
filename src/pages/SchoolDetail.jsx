import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import SchoolSubjectPicker from '@/features/schools/components/SchoolSubjectPicker';
import SchoolUserPicker from '@/features/schools/components/SchoolUserPicker';
import {
  useGetSchoolQuery,
  useUpdateSchoolMutation,
} from '@/features/schools/api/schoolsApi';
import PageHeader from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SchoolDetail = () => {
  const { schoolId } = useParams();
  const { data: school, isLoading, isError, error, refetch } =
    useGetSchoolQuery(schoolId);
  const [updateSchool, { isLoading: isSaving }] = useUpdateSchoolMutation();

  const [members, setMembers] = useState([]);
  const [subjectIds, setSubjectIds] = useState([]);

  useEffect(() => {
    if (!school) return;
    setMembers(
      (school.members || []).map((member) => ({
        userId: member.user.id,
        designation: member.designation || '',
      }))
    );
    setSubjectIds((school.subjects || []).map((item) => item.subject.id));
  }, [school]);

  const assignedSummary = useMemo(() => {
    const classNames = new Set(
      (school?.subjects || []).map((item) => item.subject.class.name)
    );
    return {
      users: school?._count?.members || 0,
      subjects: school?._count?.subjects || 0,
      classes: classNames.size,
    };
  }, [school]);

  const handleSaveAssignments = async () => {
    try {
      await updateSchool({
        id: schoolId,
        members: members.map((member) => ({
          userId: member.userId,
          designation: member.designation?.trim() || null,
        })),
        subjectIds,
      }).unwrap();
      toast.success('School assignments saved');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save assignments');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !school) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link to="/schools">
            <ArrowLeft />
            Back to schools
          </Link>
        </Button>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {error?.data?.message || 'School not found'}
          </p>
          <Button className="mt-4" variant="outline" onClick={refetch}>
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link to="/schools">
            <ArrowLeft />
            Schools
          </Link>
        </Button>
      </div>

      <PageHeader
        title={school.name}
        description="Assign users and map global class → subject pairs to this school."
        actions={
          <Badge
            variant="outline"
            className={
              school.isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }
          >
            {school.isActive ? 'Active' : 'Inactive'}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Assigned users</p>
          <p className="text-2xl font-semibold">{assignedSummary.users}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Assigned classes</p>
          <p className="text-2xl font-semibold">{assignedSummary.classes}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Assigned subjects</p>
          <p className="text-2xl font-semibold">{assignedSummary.subjects}</p>
        </Card>
      </div>

      <Card className="p-4">
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="curriculum">Class → Subjects</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Multiple users can be assigned to this school. Each user can also
              belong to other schools with a different designation.
            </p>
            <SchoolUserPicker
              members={members}
              onChange={setMembers}
              disabled={isSaving}
            />
          </TabsContent>

          <TabsContent value="curriculum" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Classes and subjects remain in the global catalog. Select which
              subject(s) this school can access.
            </p>
            <SchoolSubjectPicker
              selectedSubjectIds={subjectIds}
              onChange={setSubjectIds}
              disabled={isSaving}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end border-t pt-4">
          <Button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAssignments}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save />
                Save assignments
              </>
            )}
          </Button>
        </div>
      </Card>

      {(school.address || school.primaryPhone || school.postalCode) && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">School details</h3>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {school.address ? (
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd>{school.address}</dd>
              </div>
            ) : null}
            {school.postalCode ? (
              <div>
                <dt className="text-muted-foreground">Postal code</dt>
                <dd>{school.postalCode}</dd>
              </div>
            ) : null}
            {school.primaryPhone ? (
              <div>
                <dt className="text-muted-foreground">Primary phone</dt>
                <dd>{school.primaryPhone}</dd>
              </div>
            ) : null}
            {school.secondaryPhone ? (
              <div>
                <dt className="text-muted-foreground">Secondary phone</dt>
                <dd>{school.secondaryPhone}</dd>
              </div>
            ) : null}
          </dl>
        </Card>
      )}
    </div>
  );
};

export default SchoolDetail;
