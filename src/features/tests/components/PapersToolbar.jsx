import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PapersToolbar = ({ search, onSearchChange, className }) => (
  <div
    className={cn(
      'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
      className
    )}
  >
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search papers…"
        className="pl-8"
        aria-label="Search question papers"
      />
    </div>
  </div>
);

export default PapersToolbar;
