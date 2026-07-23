import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
} from '@/features/schools/api/schoolsApi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const schoolFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be at most 200 characters'),
  code: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  primaryPhone: z.string().max(30).optional().or(z.literal('')),
  secondaryPhone: z.string().max(30).optional().or(z.literal('')),
  isActive: z.boolean(),
});

const defaultValues = {
  name: '',
  code: '',
  address: '',
  postalCode: '',
  primaryPhone: '',
  secondaryPhone: '',
  isActive: true,
};

const SchoolFormDialog = ({ open, onOpenChange, school = null }) => {
  const isEdit = Boolean(school);
  const [createSchool, { isLoading: isCreating }] = useCreateSchoolMutation();
  const [updateSchool, { isLoading: isUpdating }] = useUpdateSchoolMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schoolFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      return;
    }

    if (school) {
      reset({
        name: school.name || '',
        code: school.code || '',
        address: school.address || '',
        postalCode: school.postalCode || '',
        primaryPhone: school.primaryPhone || '',
        secondaryPhone: school.secondaryPhone || '',
        isActive: school.isActive ?? true,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, school, reset]);

  const handleOpenChange = (nextOpen) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      code: values.code?.trim() || null,
      address: values.address?.trim() || null,
      postalCode: values.postalCode?.trim() || null,
      primaryPhone: values.primaryPhone?.trim() || null,
      secondaryPhone: values.secondaryPhone?.trim() || null,
      isActive: values.isActive,
    };

    try {
      if (isEdit) {
        await updateSchool({ id: school.id, ...payload }).unwrap();
        toast.success('School updated successfully');
      } else {
        await createSchool(payload).unwrap();
        toast.success('School created successfully');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} school`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit School' : 'Create School'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update school details and contact information.'
              : 'Create a school and assign users and curriculum from the school detail page.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input
                id="school-name"
                placeholder="e.g. Springfield High School"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="school-code">School Code</Label>
              <Input
                id="school-code"
                placeholder="Optional code"
                {...register('code')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school-postal-code">Postal Code</Label>
              <Input
                id="school-postal-code"
                placeholder="e.g. 54000"
                {...register('postalCode')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="school-address">Address</Label>
            <Input
              id="school-address"
              placeholder="Street, City, State"
              {...register('address')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="school-primary-phone">Primary Phone</Label>
              <Input
                id="school-primary-phone"
                type="tel"
                placeholder="+1 234 567 8900"
                {...register('primaryPhone')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-secondary-phone">Secondary Phone</Label>
              <Input
                id="school-secondary-phone"
                type="tel"
                placeholder="+1 234 567 8900"
                {...register('secondaryPhone')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <Label htmlFor="school-active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive schools are hidden from admin users
              </p>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  id="school-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {isEdit ? 'Saving…' : 'Creating…'}
                </>
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Create School'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolFormDialog;
