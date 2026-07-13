import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PapersPagination = ({ pagination, onPageChange, isFetching }) => {
  if (!pagination || pagination.total === 0) return null;

  const { page, totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-heading">{from}</span>
        {' – '}
        <span className="font-medium text-heading">{to}</span>
        {' of '}
        <span className="font-medium text-heading">{total}</span> papers
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!pagination.hasPrevPage || isFetching}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
          Previous
        </Button>
        <span className="min-w-16 text-center text-xs text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!pagination.hasNextPage || isFetching}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default PapersPagination;
