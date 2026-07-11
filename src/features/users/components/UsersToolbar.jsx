import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLE_VALUES } from '@/constants/roles';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const UsersToolbar = ({
  search,
  onSearchChange,
  role,
  onRoleChange,
  isActive,
  onIsActiveChange,
  className,
}) => (
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
        placeholder="Search by name or email…"
        className="pl-8"
        aria-label="Search users"
      />
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={role || 'all'}
        onValueChange={(value) => onRoleChange(value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-[140px]" aria-label="Filter by role">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          {ROLE_VALUES.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={isActive || 'all'}
        onValueChange={(value) =>
          onIsActiveChange(value === 'all' ? '' : value)
        }
      >
        <SelectTrigger className="w-[140px]" aria-label="Filter by status">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default UsersToolbar;
