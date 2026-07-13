import {
  AlertCircle,
  Eye,
  FileStack,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
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

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
};

const statusClass = (code) => {
  switch (code) {
    case 'DRAFT':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'FINALIZED':
      return 'border-sky-200 bg-sky-50 text-sky-800';
    case 'PUBLISHED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'ARCHIVED':
      return 'border-border bg-muted text-muted-foreground';
    default:
      return '';
  }
};

const PapersTableSkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    ))}
  </div>
);

const PapersTable = ({
  tests = [],
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onCreate,
  onView,
  onEdit,
  onDelete,
  hasActiveFilters,
}) => {
  if (isLoading) return <PapersTableSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn’t load question papers"
        description={errorMessage || 'Something went wrong. Please try again.'}
        action={
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!tests.length) {
    return (
      <EmptyState
        icon={FileStack}
        title={
          hasActiveFilters ? 'No matching papers' : 'No question papers yet'
        }
        description={
          hasActiveFilters
            ? 'Try adjusting your search.'
            : 'Build a paper by picking questions from your bank.'
        }
        action={
          !hasActiveFilters ? (
            <Button type="button" onClick={onCreate}>
              Build paper
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
          <TableHead className="pl-4">Title</TableHead>
          <TableHead>Class / Subject</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Questions</TableHead>
          <TableHead>Marks</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="pr-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tests.map((item) => {
          const code = item.testStatus?.code;
          const isDraft = code === 'DRAFT';

          return (
            <TableRow key={item.id}>
              <TableCell className="max-w-xs pl-4">
                <button
                  type="button"
                  className="line-clamp-2 text-left text-sm font-medium text-heading hover:underline"
                  onClick={() => (isDraft ? onEdit(item) : onView(item))}
                >
                  {item.title}
                </button>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <span className="block truncate">
                  {item.class?.name || '—'}
                </span>
                <span className="block truncate text-xs">
                  {item.subject?.name || '—'}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {item.testType?.name || '—'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(statusClass(code))}
                >
                  {item.testStatus?.name || '—'}
                </Badge>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {item._count?.questions ?? 0}
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {Number(item.totalMarks)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {formatDate(item.updatedAt || item.createdAt)}
              </TableCell>
              <TableCell className="pr-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Paper actions"
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isDraft ? (
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil />
                        Edit draft
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onClick={() => onView(item)}>
                      <Eye />
                      View paper
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default PapersTable;
