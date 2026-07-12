import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const ContentTreeNode = ({
  node,
  depth = 0,
  questionsPath,
  onAddChild,
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = Boolean(node.children?.length);
  const isChapter = node.type === 'CHAPTER';
  const nodeQuestionsPath = questionsPath(node.id);
  const questionCount = node._count?.questions ?? 0;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 rounded-lg border border-transparent px-2 py-2 hover:border-border hover:bg-muted/40'
        )}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          disabled={!hasChildren}
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown />
            ) : (
              <ChevronRight />
            )
          ) : (
            <span className="size-4" />
          )}
        </Button>

        <div
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md',
            isChapter
              ? 'bg-primary/10 text-heading'
              : 'bg-muted text-muted-foreground'
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
            {isChapter ? (
              <span className="truncate text-sm font-medium text-heading">
                {node.title}
              </span>
            ) : (
              <Link
                to={nodeQuestionsPath}
                className="truncate text-sm font-medium text-heading hover:underline"
              >
                {node.title}
              </Link>
            )}
            <Badge variant="secondary" className="capitalize">
              {isChapter ? 'Chapter' : depth === 1 ? 'Topic' : 'Sub-topic'}
            </Badge>
            {!node.isActive ? (
              <Badge
                variant="outline"
                className="border-rose-200 bg-rose-50 text-rose-700"
              >
                Inactive
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isChapter ? (
              <Link
                to={nodeQuestionsPath}
                className="hover:text-heading hover:underline"
                title="View questions from all topics under this chapter"
              >
                {questionCount} questions total
              </Link>
            ) : (
              <Link
                to={nodeQuestionsPath}
                className="hover:text-heading hover:underline"
              >
                {questionCount} questions
              </Link>
            )}
            {isChapter ? ` · ${node._count?.notes ?? 0} notes` : ''}
            {hasChildren ? ` · ${node.children.length} nested` : ''}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label={`Actions for ${node.title}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isChapter ? (
              <DropdownMenuItem asChild>
                <Link to={nodeQuestionsPath}>
                  <CircleHelp />
                  View all questions
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link to={nodeQuestionsPath}>
                  <CircleHelp />
                  Manage questions
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onAddChild(node)}>
              <Plus />
              {isChapter ? 'Add topic' : 'Add sub-topic'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(node)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(node)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && hasChildren ? (
        <div>
          {node.children.map((child) => (
            <ContentTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              questionsPath={questionsPath}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const ContentTree = ({
  nodes = [],
  questionsPath,
  onAddChild,
  onEdit,
  onDelete,
}) => (
  <div className="divide-y divide-border/60 p-2 sm:p-3">
    {nodes.map((node) => (
      <ContentTreeNode
        key={node.id}
        node={node}
        questionsPath={questionsPath}
        onAddChild={onAddChild}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </div>
);

export default ContentTree;
