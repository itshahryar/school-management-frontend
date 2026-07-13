import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const NodeRow = ({
  node,
  depth = 0,
  selectedIds,
  onToggle,
}) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = Boolean(node.children?.length);
  const isChapter = node.type === 'CHAPTER';
  const checked = selectedIds.has(node.id);
  const questionCount = node._count?.questions ?? 0;

  return (
    <div>
      <div
        className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        <button
          type="button"
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground disabled:opacity-30"
          disabled={!hasChildren}
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )
          ) : (
            <span className="size-4" />
          )}
        </button>

        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggle(node.id)}
          className="mt-0.5"
          aria-label={`Select ${node.title}`}
        />

        <div
          className={cn(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded',
            isChapter ? 'text-heading' : 'text-muted-foreground'
          )}
        >
          {isChapter ? (
            <FolderOpen className="size-3.5" />
          ) : (
            <FileText className="size-3.5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-heading">
              {node.title}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {isChapter ? 'Chapter' : depth === 1 ? 'Topic' : 'Sub-topic'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {questionCount} question{questionCount === 1 ? '' : 's'}
            {isChapter ? ' total' : ''}
          </p>
        </div>
      </div>

      {expanded && hasChildren
        ? node.children.map((child) => (
            <NodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          ))
        : null}
    </div>
  );
};

const ContentNodePicker = ({
  nodes = [],
  selectedIds,
  onChange,
  disabled = false,
}) => {
  const selectedSet =
    selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);

  const handleToggle = (id) => {
    if (disabled) return;
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  if (!nodes.length) {
    return (
      <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
        No chapters or topics yet for this subject.
      </p>
    );
  }

  return (
    <div
      className={cn(
        'max-h-72 overflow-y-auto rounded-lg border p-2',
        disabled && 'pointer-events-none opacity-60'
      )}
    >
      {nodes.map((node) => (
        <NodeRow
          key={node.id}
          node={node}
          selectedIds={selectedSet}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
};

export default ContentNodePicker;
