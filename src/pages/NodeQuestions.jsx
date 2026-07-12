import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ListPlus, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetContentNodeQuery } from '@/features/contentNodes/api/contentNodesApi';
import { useGetSubjectQuery } from '@/features/subjects/api/subjectsApi';
import BulkImportDialog from '@/features/questions/components/BulkImportDialog';
import QuestionFormDialog from '@/features/questions/components/QuestionFormDialog';
import QuestionsPagination from '@/features/questions/components/QuestionsPagination';
import QuestionsTable from '@/features/questions/components/QuestionsTable';
import QuestionsToolbar from '@/features/questions/components/QuestionsToolbar';
import {
  useDeleteQuestionMutation,
  useGetQuestionsQuery,
} from '@/features/questions/api/questionsApi';
import PageHeader from '@/components/common/PageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 10;

const NodeQuestions = () => {
  const { classId, subjectId, nodeId } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('latest');
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const [deleteQuestion, { isLoading: isDeleting }] =
    useDeleteQuestionMutation();

  const contentPath = `/classes/${classId}/subjects/${subjectId}/content`;

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
  const canManage = Boolean(node) && !isChapter;
  const hasActiveFilters = Boolean(debouncedSearch || type || difficulty);
  const errorMessage =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    'Failed to load questions';

  const openCreate = () => {
    if (!canManage) return;
    setEditingQuestion(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingQuestion(item);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open) => {
    setFormOpen(open);
    if (!open) setEditingQuestion(null);
  };

  const handleDelete = async () => {
    if (!deletingQuestion) return;
    try {
      await deleteQuestion(deletingQuestion.id).unwrap();
      toast.success('Question deleted');
      setDeletingQuestion(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete question');
    }
  };

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
              ? `${subject?.name ? `${subject.name} — ` : ''}Combined questions from all topics and sub-topics under this chapter. Add new questions on a topic.`
              : subject?.name
                ? `${subject.name} — question bank for this topic.`
                : 'Question bank for this topic.'
          }
          actions={
            canManage ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBulkOpen(true)}
                >
                  <ListPlus />
                  Bulk import
                </Button>
                <Button type="button" onClick={openCreate}>
                  <Plus />
                  Add Question
                </Button>
              </div>
            ) : null
          }
          className="mb-0"
        />
      </div>

      {isChapter ? (
        <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Chapters don’t store their own questions — this list is the total from
          nested topics. Open a topic or sub-topic to add or import questions.
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
            onCreate={canManage ? openCreate : undefined}
            onEdit={openEdit}
            onDelete={setDeletingQuestion}
            hasActiveFilters={hasActiveFilters}
            showTopic={isChapter}
            canCreate={canManage}
          />
        </div>

        <QuestionsPagination
          pagination={pagination}
          onPageChange={setPage}
          isFetching={isFetching}
        />
      </Card>

      <QuestionFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        contentNodeId={editingQuestion?.contentNodeId || nodeId}
        questionItem={editingQuestion}
      />

      {canManage ? (
        <BulkImportDialog
          open={bulkOpen}
          onOpenChange={setBulkOpen}
          contentNodeId={nodeId}
        />
      ) : null}

      <AlertDialog
        open={Boolean(deletingQuestion)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingQuestion(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the question from the bank. Existing generated papers
              keep their snapshots.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NodeQuestions;
