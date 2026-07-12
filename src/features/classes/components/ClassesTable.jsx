import {
  AlertCircle,
  BookOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

const ClassesTableSkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-16" />
      </div>
    ))}
  </div>
);

const ClassesTable = ({
  classes = [],
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
  hasActiveFilters,
}) => {
  if (isLoading) return <ClassesTableSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn’t load classes"
        description={errorMessage || 'Something went wrong. Please try again.'}
        action={
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!classes.length) {
    return (
      <EmptyState
        icon={Layers}
        title={hasActiveFilters ? 'No matching classes' : 'No classes yet'}
        description={
          hasActiveFilters
            ? 'Try adjusting your search or filters.'
            : 'Create your first class to organize subjects and content.'
        }
        action={
          !hasActiveFilters ? (
            <Button type="button" onClick={onCreate}>
              Create Class
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
          <TableHead className="pl-4">Name</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
          <TableHead>Subjects</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="pl-4">
              <Link
                to={`/classes/${item.id}/subjects`}
                className="font-medium text-heading hover:underline"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground md:hidden">
                {item.description || '—'}
              </p>
            </TableCell>
            <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
              {item.description || '—'}
            </TableCell>
            <TableCell>
              <Button asChild variant="link" size="sm" className="h-auto px-0">
                <Link to={`/classes/${item.id}/subjects`}>
                  {item._count?.subjects ?? 0} subjects
                </Link>
              </Button>
            </TableCell>
            <TableCell className="tabular-nums text-muted-foreground">
              {item.sortOrder}
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
            <TableCell className="pr-4 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${item.name}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/classes/${item.id}/subjects`}>
                      <BookOpen />
                      View subjects
                    </Link>
                  </DropdownMenuItem>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClassesTable;
