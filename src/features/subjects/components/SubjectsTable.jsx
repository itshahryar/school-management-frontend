import {
  AlertCircle,
  BookOpen,
  FolderTree,
  MoreHorizontal,
  Pencil,
  Trash2,
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

const SubjectsTableSkeleton = () => (
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

const SubjectsTable = ({
  classId,
  subjects = [],
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
  hasActiveFilters,
}) => {
  const contentPath = (subjectId) =>
    `/classes/${classId}/subjects/${subjectId}/content`;

  if (isLoading) return <SubjectsTableSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn’t load subjects"
        description={errorMessage || 'Something went wrong. Please try again.'}
        action={
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!subjects.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title={hasActiveFilters ? 'No matching subjects' : 'No subjects yet'}
        description={
          hasActiveFilters
            ? 'Try adjusting your search or filters.'
            : 'Add subjects to this class to start building chapters and questions.'
        }
        action={
          !hasActiveFilters ? (
            <Button type="button" onClick={onCreate}>
              Create Subject
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
          <TableHead>Code</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
          <TableHead>Content</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="pl-4">
              <Link
                to={contentPath(item.id)}
                className="font-medium text-heading hover:underline"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground md:hidden">
                {item.description || '—'}
              </p>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {item.code || '—'}
            </TableCell>
            <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
              {item.description || '—'}
            </TableCell>
            <TableCell>
              <Button asChild variant="link" size="sm" className="h-auto px-0">
                <Link to={contentPath(item.id)}>
                  {item._count?.nodes ?? 0} nodes
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
                    <Link to={contentPath(item.id)}>
                      <FolderTree />
                      View content
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

export default SubjectsTable;
