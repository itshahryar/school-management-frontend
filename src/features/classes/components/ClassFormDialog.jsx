import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateClassMutation,
  useUpdateClassMutation,
} from '@/features/classes/api/classesApi';
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

const classFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must be at most 120 characters'),
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
  description: '',
  sortOrder: 0,
  isActive: true,
};

const ClassFormDialog = ({ open, onOpenChange, classItem = null }) => {
  const isEdit = Boolean(classItem);
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      return;
    }

    if (classItem) {
      reset({
        name: classItem.name || '',
        description: classItem.description || '',
        sortOrder: classItem.sortOrder ?? 0,
        isActive: classItem.isActive ?? true,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, classItem, reset]);

  const handleOpenChange = (nextOpen) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    try {
      if (isEdit) {
        await updateClass({ id: classItem.id, ...payload }).unwrap();
        toast.success('Class updated successfully');
      } else {
        await createClass(payload).unwrap();
        toast.success('Class created successfully');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} class`);
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
          <DialogTitle>{isEdit ? 'Edit Class' : 'Create Class'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update class details used across subjects and content.'
              : 'Add a class to organize subjects and academic content.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="class-name">Name</Label>
            <Input
              id="class-name"
              placeholder="e.g. Grade 10"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-description">Description</Label>
            <Textarea
              id="class-description"
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
              <Label htmlFor="class-sort-order">Sort order</Label>
              <Input
                id="class-sort-order"
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
              <Label htmlFor="class-active">Active</Label>
              <div className="flex h-8 items-center">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="class-active"
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
                'Create Class'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassFormDialog;
