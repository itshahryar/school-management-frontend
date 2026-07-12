import { Search } from 'lucide-react';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
} from '@/constants/academic';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const QUESTION_SORT_OPTIONS = [
  { value: 'latest', label: 'Latest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'marks_desc', label: 'Highest marks' },
  { value: 'marks_asc', label: 'Lowest marks' },
];

const QuestionsToolbar = ({
  search,
  onSearchChange,
  type,
  onTypeChange,
  difficulty,
  onDifficultyChange,
  sort = 'latest',
  onSortChange,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between',
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
        placeholder="Search questions…"
        className="pl-8"
        aria-label="Search questions"
      />
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={type || 'all'}
        onValueChange={(value) => onTypeChange(value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-[150px]" aria-label="Filter by type">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {QUESTION_TYPES.map((value) => (
            <SelectItem key={value} value={value}>
              {QUESTION_TYPE_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={difficulty || 'all'}
        onValueChange={(value) =>
          onDifficultyChange(value === 'all' ? '' : value)
        }
      >
        <SelectTrigger className="w-[140px]" aria-label="Filter by difficulty">
          <SelectValue placeholder="All levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All levels</SelectItem>
          {DIFFICULTIES.map((value) => (
            <SelectItem key={value} value={value}>
              {DIFFICULTY_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {onSortChange ? (
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-[150px]" aria-label="Sort questions">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  </div>
);

export default QuestionsToolbar;
