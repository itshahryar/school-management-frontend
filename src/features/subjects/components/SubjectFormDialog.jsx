import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
} from '@/features/subjects/api/subjectsApi';
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
import { Textarea } from '@/components/ui/textarea';

const subjectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must be at most 120 characters'),
  code: z
    .string()
    .max(40, 'Code must be at most 40 characters')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional()
    .or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0, 'Order must be 0 or greater'),
  isActive: z.boolean(),
});

const defaultValues = {
  name: '',
  code: '',
  description: '',
  sortOrder: 0,
  isActive: true,
};

const SubjectFormDialog = ({
  open,
  onOpenChange,
  classId,
  subjectItem = null,
}) => {
  const isEdit = Boolean(subjectItem);
  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subjectFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      return;
    }

    if (subjectItem) {
      reset({
        name: subjectItem.name || '',
        code: subjectItem.code || '',
        description: subjectItem.description || '',
        sortOrder: subjectItem.sortOrder ?? 0,
        isActive: subjectItem.isActive ?? true,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, subjectItem, reset]);

  const handleOpenChange = (nextOpen) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      code: values.code?.trim() || null,
      description: values.description?.trim() || null,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    try {
      if (isEdit) {
        await updateSubject({ id: subjectItem.id, ...payload }).unwrap();
        toast.success('Subject updated successfully');
      } else {
        await createSubject({ ...payload, classId }).unwrap();
        toast.success('Subject created successfully');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} subject`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Subject' : 'Create Subject'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update subject details for this class.'
              : 'Add a subject under this class for chapters and questions.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="subject-name">Name</Label>
            <Input
              id="subject-name"
              placeholder="e.g. Mathematics"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-code">Code</Label>
            <Input
              id="subject-code"
              placeholder="e.g. MATH-10"
              aria-invalid={!!errors.code}
              {...register('code')}
            />
            {errors.code ? (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-description">Description</Label>
            <Textarea
              id="subject-description"
              placeholder="Optional short description"
              rows={3}
              aria-invalid={!!errors.description}
              {...register('description')}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject-sort-order">Sort order</Label>
              <Input
                id="subject-sort-order"
                type="number"
                min={0}
                aria-invalid={!!errors.sortOrder}
                {...register('sortOrder')}
              />
              {errors.sortOrder ? (
                <p className="text-xs text-destructive">
                  {errors.sortOrder.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-active">Active</Label>
              <div className="flex h-8 items-center">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="subject-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
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
                'Create Subject'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectFormDialog;
