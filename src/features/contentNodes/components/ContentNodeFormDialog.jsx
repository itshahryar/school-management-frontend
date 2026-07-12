import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateContentNodeMutation,
  useUpdateContentNodeMutation,
} from '@/features/contentNodes/api/contentNodesApi';
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

const nodeFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
});

const defaultValues = {
  title: '',
  description: '',
  isActive: true,
};

const ContentNodeFormDialog = ({
  open,
  onOpenChange,
  subjectId,
  parentId = null,
  parentType = null,
  nodeItem = null,
}) => {
  const isEdit = Boolean(nodeItem);
  const isChapter = isEdit ? nodeItem?.type === 'CHAPTER' : !parentId;
  const label = isChapter
    ? 'Chapter'
    : parentType === 'CHAPTER'
      ? 'Topic'
      : 'Sub-topic';

  const [createNode, { isLoading: isCreating }] = useCreateContentNodeMutation();
  const [updateNode, { isLoading: isUpdating }] = useUpdateContentNodeMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(nodeFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      return;
    }

    if (nodeItem) {
      reset({
        title: nodeItem.title || '',
        description: nodeItem.description || '',
        isActive: nodeItem.isActive ?? true,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, nodeItem, reset]);

  const handleOpenChange = (nextOpen) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      isActive: values.isActive,
    };

    try {
      if (isEdit) {
        await updateNode({ id: nodeItem.id, ...payload }).unwrap();
        toast.success(`${label} updated`);
      } else {
        await createNode({
          ...payload,
          subjectId,
          parentId: parentId || null,
        }).unwrap();
        toast.success(`${label} created`);
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save');
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
          <DialogTitle>
            {isEdit ? `Edit ${label}` : `Add ${label}`}
          </DialogTitle>
          <DialogDescription>
            {isChapter
              ? 'Chapters group topics under a subject. Questions are added on topics and sub-topics.'
              : parentType === 'CHAPTER'
                ? 'Topics sit under a chapter and hold questions or nested sub-topics.'
                : 'Sub-topics nest under a topic and can hold their own questions.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="node-title">Title</Label>
            <Input
              id="node-title"
              placeholder={
                isChapter
                  ? 'e.g. Chapter 1 — Force and Motion'
                  : parentType === 'CHAPTER'
                    ? 'e.g. Introduction to Force'
                    : 'e.g. Types of Force'
              }
              aria-invalid={!!errors.title}
              {...register('title')}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-description">Description</Label>
            <Textarea
              id="node-description"
              placeholder="Optional description"
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

          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
            <div>
              <Label htmlFor="node-active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive items stay hidden from new papers
              </p>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  id="node-active"
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
                  Saving…
                </>
              ) : isEdit ? (
                'Save changes'
              ) : (
                `Add ${label}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentNodeFormDialog;
