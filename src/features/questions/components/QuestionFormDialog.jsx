import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
} from '@/features/questions/api/questionsApi';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
} from '@/constants/academic';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const optionSchema = z.object({
  text: z.string(),
  isCorrect: z.boolean(),
  sortOrder: z.number().int().min(0).optional(),
});

const questionFormSchema = z
  .object({
    type: z.enum(['MCQ', 'SHORT_QUESTION', 'LONG_QUESTION']),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    text: z.string().trim().min(1, 'Question text is required'),
    marks: z.coerce.number().positive('Marks must be greater than 0'),
    allowMultipleCorrect: z.boolean(),
    explanation: z.string().optional().or(z.literal('')),
    isActive: z.boolean(),
    options: z.array(optionSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'MCQ') return;

    const options = data.options || [];
    if (options.length < 2) {
      ctx.addIssue({
        code: 'custom',
        message: 'MCQ needs at least 2 options',
        path: ['options'],
      });
      return;
    }

    options.forEach((opt, index) => {
      if (!opt.text?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Option text is required',
          path: ['options', index, 'text'],
        });
      }
    });

    const correctCount = options.filter((opt) => opt.isCorrect).length;
    if (correctCount < 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mark at least one correct option',
        path: ['options'],
      });
    }

    if (!data.allowMultipleCorrect && correctCount > 1) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Only one correct option allowed unless multiple answers is enabled',
        path: ['options'],
      });
    }
  });

const defaultValues = {
  type: 'MCQ',
  difficulty: 'MEDIUM',
  text: '',
  marks: 1,
  allowMultipleCorrect: false,
  explanation: '',
  isActive: true,
  options: [
    { text: '', isCorrect: false, sortOrder: 0 },
    { text: '', isCorrect: false, sortOrder: 1 },
  ],
};

const QuestionFormDialog = ({
  open,
  onOpenChange,
  contentNodeId,
  questionItem = null,
}) => {
  const isEdit = Boolean(questionItem);
  const [createQuestion, { isLoading: isCreating }] = useCreateQuestionMutation();
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateQuestionMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(questionFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const questionType = useWatch({ control, name: 'type' });
  const allowMultipleCorrect = useWatch({
    control,
    name: 'allowMultipleCorrect',
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      return;
    }

    if (questionItem) {
      reset({
        type: questionItem.type,
        difficulty: questionItem.difficulty,
        text: questionItem.text || '',
        marks: Number(questionItem.marks) || 1,
        allowMultipleCorrect: Boolean(questionItem.allowMultipleCorrect),
        explanation: questionItem.explanation || '',
        isActive: questionItem.isActive ?? true,
        options:
          questionItem.type === 'MCQ' && questionItem.options?.length
            ? questionItem.options.map((opt, index) => ({
                text: opt.text,
                isCorrect: Boolean(opt.isCorrect),
                sortOrder: opt.sortOrder ?? index,
              }))
            : defaultValues.options,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, questionItem, reset]);

  useEffect(() => {
    if (questionType === 'MCQ') {
      if (fields.length >= 2) return;
      append({ text: '', isCorrect: false, sortOrder: fields.length });
      return;
    }

    if (fields.length > 0) {
      setValue('options', [], { shouldValidate: false });
      setValue('allowMultipleCorrect', false, { shouldValidate: false });
    }
  }, [questionType, fields.length, append, setValue]);

  const handleOpenChange = (nextOpen) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const onInvalid = () => {
    toast.error('Please fix the highlighted fields');
  };

  const onSubmit = async (values) => {
    const payload = {
      contentNodeId,
      type: values.type,
      difficulty: values.difficulty,
      text: values.text.trim(),
      marks: values.marks,
      allowMultipleCorrect:
        values.type === 'MCQ' ? values.allowMultipleCorrect : false,
      explanation: values.explanation?.trim() || null,
      isActive: values.isActive,
      ...(values.type === 'MCQ'
        ? {
            options: (values.options || []).map((opt, index) => ({
              text: opt.text.trim(),
              isCorrect: Boolean(opt.isCorrect),
              sortOrder: index,
            })),
          }
        : { options: [] }),
    };

    try {
      if (isEdit) {
        await updateQuestion({ id: questionItem.id, ...payload }).unwrap();
        toast.success('Question updated');
      } else {
        await createQuestion(payload).unwrap();
        toast.success('Question added to bank');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save question');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        onPointerDownOutside={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Question' : 'Add Question'}</DialogTitle>
          <DialogDescription>
            Add to the question bank for this topic or section. Short and long
            questions do not store model answers.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-invalid={!!errors.type}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {QUESTION_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.difficulty}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((level) => (
                        <SelectItem key={level} value={level}>
                          {DIFFICULTY_LABELS[level]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-text">Question</Label>
            <Textarea
              id="question-text"
              rows={4}
              placeholder="Enter the question stem…"
              aria-invalid={!!errors.text}
              {...register('text')}
            />
            {errors.text ? (
              <p className="text-xs text-destructive">{errors.text.message}</p>
            ) : null}
          </div>

          <div className="max-w-[8rem] space-y-2">
            <Label htmlFor="question-marks">Marks</Label>
            <Input
              id="question-marks"
              type="number"
              min={0.5}
              step="0.5"
              aria-invalid={!!errors.marks}
              {...register('marks')}
            />
            {errors.marks ? (
              <p className="text-xs text-destructive">{errors.marks.message}</p>
            ) : null}
          </div>

          {questionType === 'MCQ' ? (
            <div className="space-y-3 rounded-xl border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-heading">Options</p>
                  <p className="text-xs text-muted-foreground">
                    Mark the correct answer(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="multi-correct" className="text-xs font-normal">
                    Multiple correct
                  </Label>
                  <Controller
                    name="allowMultipleCorrect"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="multi-correct"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-2 rounded-lg bg-muted/40 p-2"
                  >
                    <Controller
                      name={`options.${index}.isCorrect`}
                      control={control}
                      render={({ field: checkboxField }) => (
                        <Checkbox
                          className="mt-2"
                          checked={checkboxField.value}
                          onCheckedChange={(checked) => {
                            const next = Boolean(checked);
                            if (!allowMultipleCorrect && next) {
                              fields.forEach((_, i) => {
                                setValue(`options.${i}.isCorrect`, i === index, {
                                  shouldValidate: true,
                                });
                              });
                            } else {
                              checkboxField.onChange(next);
                            }
                          }}
                          aria-label={`Mark option ${index + 1} correct`}
                        />
                      )}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        aria-invalid={!!errors.options?.[index]?.text}
                        {...register(`options.${index}.text`)}
                      />
                      {errors.options?.[index]?.text ? (
                        <p className="text-xs text-destructive">
                          {errors.options[index].text.message}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="mt-1"
                      disabled={fields.length <= 2}
                      onClick={() => remove(index)}
                      aria-label="Remove option"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>

              {errors.options?.message || errors.options?.root?.message ? (
                <p className="text-xs text-destructive">
                  {errors.options.message || errors.options.root?.message}
                </p>
              ) : null}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    text: '',
                    isCorrect: false,
                    sortOrder: fields.length,
                  })
                }
              >
                <Plus />
                Add option
              </Button>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="question-explanation">Explanation (optional)</Label>
            <Textarea
              id="question-explanation"
              rows={2}
              placeholder="Shown for review / teachers only"
              {...register('explanation')}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <Label htmlFor="question-active">Active in bank</Label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  id="question-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
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
                'Add Question'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionFormDialog;
