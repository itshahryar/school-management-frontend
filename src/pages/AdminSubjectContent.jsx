import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { useGetClassQuery } from '@/features/classes/api/classesApi';
import { useGetSubjectQuery } from '@/features/subjects/api/subjectsApi';
import {
  useGetContentTreeQuery,
} from '@/features/contentNodes/api/contentNodesApi';
import ContentStructureInfo from '@/components/common/ContentStructureInfo';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const AdminContentTreeNode = ({
  node,
  depth = 0,
  questionsPath,
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

        <Button
          type="button"
          variant="ghost"
          size="sm"
          asChild
        >
          <Link to={nodeQuestionsPath}>
            <CircleHelp className="h-4 w-4" />
            View Question Bank
          </Link>
        </Button>
      </div>

      {expanded && hasChildren ? (
        <div>
          {node.children.map((child) => (
            <AdminContentTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              questionsPath={questionsPath}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const AdminSubjectContent = () => {
  const { classId, subjectId } = useParams();

  const {
    data: classRecord,
    isLoading: isClassLoading,
  } = useGetClassQuery(classId, { skip: !classId });

  const {
    data: subject,
    isLoading: isSubjectLoading,
    isError: isSubjectError,
    error: subjectError,
  } = useGetSubjectQuery(subjectId, { skip: !subjectId });

  const {
    data: nodes = [],
    isLoading: isTreeLoading,
    isFetching,
    isError: isTreeError,
    error: treeError,
    refetch,
  } = useGetContentTreeQuery({ subjectId }, { skip: !subjectId });

  const backToSubjects = `/admin/classes/${classId}/subjects`;

  if (isClassLoading || isSubjectLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isSubjectError || !subject) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {subjectError?.data?.message || 'Subject not found.'}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={backToSubjects}>Back to Subjects</Link>
        </Button>
      </Card>
    );
  }

  const className = classRecord?.name;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
          <Link to={backToSubjects}>
            <ArrowLeft />
            Back to Subjects
          </Link>
        </Button>

        <PageHeader
          title={`Content · ${subject.name}`}
          description={
            className
              ? `${className} — chapters, topics, and nested sections for this subject.`
              : 'Chapters, topics, and nested sections for this subject.'
          }
          className="mb-0"
        />
      </div>

      <ContentStructureInfo />

      <Card className="gap-0 overflow-hidden py-0">
        <div
          className={
            isFetching && !isTreeLoading ? 'opacity-70 transition-opacity' : ''
          }
        >
          {isTreeLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : isTreeError ? (
            <EmptyState
              icon={AlertCircle}
              title="Couldn't load content"
              description={
                treeError?.data?.message ||
                'Something went wrong. Please try again.'
              }
              action={
                <Button type="button" variant="outline" onClick={refetch}>
                  Try again
                </Button>
              }
            />
          ) : !nodes.length ? (
            <EmptyState
              icon={FolderOpen}
              title="No chapters yet"
              description="This subject has no content added yet."
            />
          ) : (
            <div className="divide-y divide-border/60 p-2 sm:p-3">
              {nodes.map((node) => (
                <AdminContentTreeNode
                  key={node.id}
                  node={node}
                  questionsPath={(nodeId) =>
                    `/admin/classes/${classId}/subjects/${subjectId}/content/${nodeId}/questions`
                  }
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminSubjectContent;
