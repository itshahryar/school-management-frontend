import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGetContentNodeQuery } from '@/features/contentNodes/api/contentNodesApi';
import { useGetSubjectQuery } from '@/features/subjects/api/subjectsApi';
import QuestionsPagination from '@/features/questions/components/QuestionsPagination';
import QuestionsTable from '@/features/questions/components/QuestionsTable';
import QuestionsToolbar from '@/features/questions/components/QuestionsToolbar';
import {
  useGetQuestionsQuery,
} from '@/features/questions/api/questionsApi';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 10;

const AdminNodeQuestions = () => {
  const { classId, subjectId, nodeId } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('latest');

  const debouncedSearch = useDebounce(search, 400);

  const contentPath = `/admin/classes/${classId}/subjects/${subjectId}/content`;

  const {
    data: node,
    isLoading: isNodeLoading,
    isError: isNodeError,
    error: nodeError,
  } = useGetContentNodeQuery(nodeId, { skip: !nodeId });

  const { data: subject } = useGetSubjectQuery(subjectId, {
    skip: !subjectId,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, type, difficulty, sort, nodeId]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetQuestionsQuery(
    {
      page,
      limit: PAGE_SIZE,
      contentNodeId: nodeId,
      search: debouncedSearch,
      type,
      difficulty,
      sort,
    },
    { skip: !nodeId }
  );

  const questions = data?.questions ?? [];
  const pagination = data?.pagination;
  const isChapter = node?.type === 'CHAPTER';
  const hasActiveFilters = Boolean(debouncedSearch || type || difficulty);
  const errorMessage =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    'Failed to load questions';

  if (isNodeLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isNodeError || !node) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {nodeError?.data?.message || 'Content node not found.'}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={contentPath}>Back to Content</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
          <Link to={contentPath}>
            <ArrowLeft />
            Back to Content
          </Link>
        </Button>

        <PageHeader
          title={`Questions · ${node.title}`}
          description={
            isChapter
              ? `${subject?.name ? `${subject.name} — ` : ''}Combined questions from all topics and sub-topics under this chapter.`
              : subject?.name
                ? `${subject.name} — question bank for this topic.`
                : 'Question bank for this topic.'
          }
          className="mb-0"
        />
      </div>

      {isChapter ? (
        <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Chapters don't store their own questions — this list is the total from
          nested topics.
        </p>
      ) : null}

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b p-4">
          <QuestionsToolbar
            search={search}
            onSearchChange={setSearch}
            type={type}
            onTypeChange={setType}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        <div
          className={
            isFetching && !isLoading ? 'opacity-70 transition-opacity' : ''
          }
        >
          <QuestionsTable
            questions={questions}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            onRetry={refetch}
            hasActiveFilters={hasActiveFilters}
            showTopic={isChapter}
            canCreate={false}
            showActions={false}
          />
        </div>

        <QuestionsPagination
          pagination={pagination}
          onPageChange={setPage}
          isFetching={isFetching}
        />
      </Card>
    </div>
  );
};

export default AdminNodeQuestions;
