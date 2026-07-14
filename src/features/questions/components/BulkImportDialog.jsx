import { useMemo, useState } from 'react';
import { Loader2, ListPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBulkCreateQuestionsMutation } from '@/features/questions/api/questionsApi';
import { parseBulkQuestions } from '@/features/questions/utils/parseBulkQuestions';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
} from '@/constants/academic';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const EXAMPLES = {
  MCQ: `1. Force is defined as: A) Energy B) Power C) A push or a pull D) Work

Answer: C

2. Dynamics is the branch of physics that studies: A) Light B) Heat C) Forces causing motion D) Sound

Answer: C`,
  SHORT_QUESTION: `1. Define force and explain its effects with five examples.

2. What is dynamics? How is it different from kinematics?`,
  LONG_QUESTION: `1. Write a detailed note on the concept of force.

2. Discuss different examples of forces acting in everyday life.`,
};

const BulkImportDialog = ({ open, onOpenChange, contentNodeId }) => {
  const [type, setType] = useState('SHORT_QUESTION');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [marks, setMarks] = useState('1');
  const [rawText, setRawText] = useState('');
  const [bulkCreate, { isLoading }] = useBulkCreateQuestionsMutation();

  const parsed = useMemo(
    () => parseBulkQuestions(rawText, type),
    [rawText, type]
  );

  const marksValue = Number(marks);
  const marksValid = Number.isFinite(marksValue) && marksValue > 0;

  const resetForm = () => {
    setType('SHORT_QUESTION');
    setDifficulty('MEDIUM');
    setMarks('1');
    setRawText('');
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && isLoading) return;
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleImport = async () => {
    if (!marksValid) {
      toast.error('Marks must be greater than 0');
      return;
    }

    if (!parsed.questions.length) {
      toast.error(
        parsed.errors.length
          ? 'Fix parse errors before importing'
          : 'Paste numbered questions first'
      );
      return;
    }

    if (parsed.errors.length) {
      toast.error(
        `${parsed.errors.length} question(s) could not be parsed — fix or remove them`
      );
      return;
    }

    const payload = {
      contentNodeId,
      questions: parsed.questions.map((item) => ({
        type,
        difficulty,
        marks: marksValue,
        text: item.text,
        allowMultipleCorrect: Boolean(item.allowMultipleCorrect),
        ...(type === 'MCQ' ? { options: item.options } : {}),
      })),
    };

    try {
      const result = await bulkCreate(payload).unwrap();
      toast.success(`${result.count} questions imported`);
      handleOpenChange(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to import questions');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2">
            <ListPlus className="size-5" />
            Bulk import questions
          </DialogTitle>
          <DialogDescription>
            Paste a numbered list. Questions are split by{' '}
            <span className="font-medium text-foreground">1. 2. 3.</span> (or{' '}
            <span className="font-medium text-foreground">1)</span>). For MCQs,
            put options as A) B) C) D) and an{' '}
            <span className="font-medium text-foreground">Answer: C</span> line
            under each question. Section titles like “Difficult MCQs” are
            ignored.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="bulk-type">Type</Label>
              <Select
                value={type}
                onValueChange={setType}
                disabled={isLoading}
              >
                <SelectTrigger id="bulk-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {QUESTION_TYPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bulk-difficulty">Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={setDifficulty}
                disabled={isLoading}
              >
                <SelectTrigger id="bulk-difficulty" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {DIFFICULTY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bulk-marks">Marks (each)</Label>
              <Input
                id="bulk-marks"
                type="number"
                min="0.5"
                step="0.5"
                value={marks}
                onChange={(event) => setMarks(event.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="bulk-paste">Paste questions</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                disabled={isLoading}
                onClick={() => setRawText(EXAMPLES[type] || EXAMPLES.SHORT_QUESTION)}
              >
                Insert example
              </Button>
            </div>
            <Textarea
              id="bulk-paste"
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              disabled={isLoading}
              rows={12}
              placeholder={EXAMPLES[type]}
              className="min-h-[200px] font-mono text-xs leading-relaxed"
            />
          </div>

          {rawText.trim() ? (
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">
                Preview · {parsed.questions.length} ready
                {parsed.errors.length
                  ? ` · ${parsed.errors.length} with errors`
                  : ''}
                {parsed.totalBlocks
                  ? ` · ${parsed.totalBlocks} numbered block(s)`
                  : ''}
              </p>

              {parsed.errors.length > 0 ? (
                <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-destructive">
                  {parsed.errors.slice(0, 8).map((err) => (
                    <li key={`err-${err.number}`}>
                      #{err.number}: {err.error}
                    </li>
                  ))}
                  {parsed.errors.length > 8 ? (
                    <li>…and {parsed.errors.length - 8} more</li>
                  ) : null}
                </ul>
              ) : null}

              {parsed.questions.length > 0 ? (
                <ul className="max-h-40 space-y-2 overflow-y-auto text-xs text-muted-foreground">
                  {parsed.questions.slice(0, 12).map((item) => (
                    <li key={`q-${item.number}`} className="leading-snug">
                      <span className="font-medium text-foreground">
                        #{item.number}
                      </span>{' '}
                      {item.text.length > 100
                        ? `${item.text.slice(0, 100)}…`
                        : item.text}
                      {type === 'MCQ' && item.options ? (
                        <span className="text-muted-foreground">
                          {' '}
                          ({item.options.length} options
                          {item.allowMultipleCorrect ? ', multi' : ''})
                        </span>
                      ) : null}
                    </li>
                  ))}
                  {parsed.questions.length > 12 ? (
                    <li>…and {parsed.questions.length - 12} more</li>
                  ) : null}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No numbered questions detected yet. Start each item with 1. /
                  2. etc.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              isLoading ||
              !marksValid ||
              !parsed.questions.length ||
              parsed.errors.length > 0
            }
            onClick={handleImport}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Importing…
              </>
            ) : (
              `Import ${parsed.questions.length} question${
                parsed.questions.length === 1 ? '' : 's'
              }`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportDialog;
