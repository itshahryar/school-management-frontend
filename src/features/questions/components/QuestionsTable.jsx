import {
  AlertCircle,
  CircleHelp,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
} from '@/constants/academic';
import EmptyState from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const QuestionsTableSkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    ))}
  </div>
);

const QuestionsTable = ({
  questions = [],
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
  hasActiveFilters,
  showTopic = false,
  canCreate = true,
  showActions = true,
}) => {
  if (isLoading) return <QuestionsTableSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn’t load questions"
        description={errorMessage || 'Something went wrong. Please try again.'}
        action={
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!questions.length) {
    return (
      <EmptyState
        icon={CircleHelp}
        title={
          hasActiveFilters ? 'No matching questions' : 'No questions yet'
        }
        description={
          hasActiveFilters
            ? 'Try adjusting your search or filters.'
            : canCreate
              ? 'Add MCQ, short, or long answer questions to this topic’s bank.'
              : 'Add questions under topics and sub-topics — this chapter only shows their total.'
        }
        action={
          !hasActiveFilters && canCreate && onCreate ? (
            <Button type="button" onClick={onCreate}>
              Add Question
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Question</TableHead>
          {showTopic ? <TableHead>Topic</TableHead> : null}
          <TableHead>Type</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Marks</TableHead>
          <TableHead>Status</TableHead>
          {showActions ? <TableHead className="pr-4 text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="max-w-md pl-4">
              <p className="line-clamp-2 text-sm font-medium text-heading">
                {item.text}
              </p>
              {item.type === 'MCQ' ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.options?.length ?? 0} options
                  {item.allowMultipleCorrect ? ' · multi-correct' : ''}
                </p>
              ) : null}
            </TableCell>
            {showTopic ? (
              <TableCell className="max-w-[10rem] truncate text-sm text-muted-foreground">
                {item.contentNode?.title || '—'}
              </TableCell>
            ) : null}
            <TableCell>
              <Badge variant="secondary">
                {QUESTION_TYPE_LABELS[item.type] || item.type}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {DIFFICULTY_LABELS[item.difficulty] || item.difficulty}
              </Badge>
            </TableCell>
            <TableCell className="tabular-nums text-muted-foreground">
              {Number(item.marks)}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  item.isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                )}
              >
                {item.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            {showActions ? (
              <TableCell className="pr-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Question actions"
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Pencil />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default QuestionsTable;
