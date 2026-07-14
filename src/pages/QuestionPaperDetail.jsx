import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  FileDown,
  Loader2,
  Lock,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useDeleteTestMutation,
  useGetTestQuery,
  useTransitionTestMutation,
} from '@/features/tests/api/testsApi';
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPES,
} from '@/constants/academic';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const letterFor = (index) => String.fromCharCode(65 + index);

const SECTION_TAB_LABELS = {
  MCQ: "MCQ's",
  SHORT_QUESTION: 'Short Questions',
  LONG_QUESTION: 'Long Questions',
};

const statusClass = (code) => {
  switch (code) {
    case 'DRAFT':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'FINALIZED':
      return 'border-sky-200 bg-sky-50 text-sky-800';
    case 'PUBLISHED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    default:
      return '';
  }
};

const QuestionPaperDetail = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [pdfBusy, setPdfBusy] = useState(null);
  const [deleteTest, { isLoading: isDeleting }] = useDeleteTestMutation();
  const [transition, { isLoading: isTransitioning }] =
    useTransitionTestMutation();

  const {
    data: paper,
    isLoading,
    isError,
    error,
  } = useGetTestQuery(paperId, { skip: !paperId });

  const handleDelete = async () => {
    try {
      await deleteTest(paperId).unwrap();
      toast.success('Question paper deleted');
      navigate('/papers');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete paper');
    }
  };

  const handleFinalize = async () => {
    try {
      await transition({ id: paperId, action: 'finalize' }).unwrap();
      toast.success('Paper finalized — it can no longer be edited');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to finalize');
    }
  };

  const handlePublish = async () => {
    try {
      await transition({ id: paperId, action: 'publish' }).unwrap();
      toast.success('Paper published');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to publish');
    }
  };

  const handlePreviewPdf = async () => {
    if (!paper) return;
    setPdfBusy('preview');
    try {
      const { previewQuestionPaperPdf } = await import(
        '@/features/tests/pdf/generateQuestionPaperPdf'
      );
      await previewQuestionPaperPdf(paper);
    } catch (err) {
      toast.error(err?.message || 'Failed to preview PDF');
    } finally {
      setPdfBusy(null);
    }
  };

  const handleExportPdf = async () => {
    if (!paper) return;
    setPdfBusy('export');
    try {
      const { downloadQuestionPaperPdf } = await import(
        '@/features/tests/pdf/generateQuestionPaperPdf'
      );
      await downloadQuestionPaperPdf(paper);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error(err?.message || 'Failed to export PDF');
    } finally {
      setPdfBusy(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !paper) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {error?.data?.message || 'Question paper not found.'}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/papers">Back to papers</Link>
        </Button>
      </Card>
    );
  }

  const questions = paper.questions ?? [];
  const statusCode = paper.testStatus?.code;
  const isDraft = statusCode === 'DRAFT';
  const isFinalized = statusCode === 'FINALIZED';

  const questionSections = QUESTION_TYPES.map((questionType) => {
    const items = questions.filter((item) => item.questionType === questionType);
    const marks = items.reduce(
      (sum, item) => sum + (Number(item.marks) || 0),
      0
    );
    return { questionType, items, marks };
  });

  const activeSections = questionSections.filter(
    (section) => section.items.length > 0
  );
  const defaultTab = activeSections[0]?.questionType || QUESTION_TYPES[0];

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
          <Link to="/papers">
            <ArrowLeft />
            Back to papers
          </Link>
        </Button>

        <PageHeader
          title={paper.title}
          description={[
            paper.class?.name,
            paper.subject?.name,
            paper.testType?.name,
          ]
            .filter(Boolean)
            .join(' · ')}
          actions={
            <div className="flex flex-wrap gap-2">
              {isDraft ? (
                <>
                  <Button asChild variant="outline">
                    <Link to={`/papers/${paper.id}/edit`}>
                      <Pencil />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    disabled={isTransitioning}
                    onClick={handleFinalize}
                  >
                    {isTransitioning ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Lock />
                    )}
                    Finalize
                  </Button>
                </>
              ) : null}
              {isFinalized ? (
                <Button
                  type="button"
                  disabled={isTransitioning}
                  onClick={handlePublish}
                >
                  {isTransitioning ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send />
                  )}
                  Publish
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={Boolean(pdfBusy)}
                onClick={handlePreviewPdf}
              >
                {pdfBusy === 'preview' ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Eye />
                )}
                Preview PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={Boolean(pdfBusy)}
                onClick={handleExportPdf}
              >
                {pdfBusy === 'export' ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <FileDown />
                )}
                Export PDF
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Trash2 />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this paper?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the paper snapshot only. Bank questions stay
                      intact.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancel
                    </AlertDialogCancel>
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
          }
          className="mb-0"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className={cn(statusClass(statusCode))}
        >
          {paper.testStatus?.name || '—'}
        </Badge>
        <Badge variant="secondary">{questions.length} questions</Badge>
        <Badge variant="outline">{Number(paper.totalMarks)} marks</Badge>
        {paper.durationMinutes ? (
          <Badge variant="outline">{paper.durationMinutes} min</Badge>
        ) : null}
      </div>

      {(paper.description || paper.instructions) && (
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            {paper.description ? (
              <p className="text-muted-foreground">{paper.description}</p>
            ) : null}
            {paper.instructions ? (
              <div>
                <p className="mb-1 font-medium text-heading">Instructions</p>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {paper.instructions}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-b pt-6 pb-4">
          <CardTitle className="text-base">Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {!questions.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No questions on this paper yet.
            </p>
          ) : (
            <Tabs defaultValue={defaultTab} className="gap-4">
              <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
                {questionSections.map((section) => (
                  <TabsTrigger
                    key={section.questionType}
                    value={section.questionType}
                    disabled={!section.items.length}
                    className="px-3 py-1.5"
                  >
                    {SECTION_TAB_LABELS[section.questionType]}
                    <span className="text-muted-foreground">
                      ({section.items.length})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {questionSections.map((section) => (
                <TabsContent
                  key={section.questionType}
                  value={section.questionType}
                  className="space-y-3"
                >
                  <p className="text-xs text-muted-foreground">
                    {section.items.length}{' '}
                    {section.items.length === 1 ? 'question' : 'questions'} ·{' '}
                    {section.marks} marks
                  </p>

                  {!section.items.length ? (
                    <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                      No {SECTION_TAB_LABELS[section.questionType].toLowerCase()}{' '}
                      on this paper.
                    </p>
                  ) : (
                    <div className="divide-y rounded-lg border">
                      {section.items.map((item, index) => (
                        <div key={item.id} className="space-y-3 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="text-sm font-medium text-heading">
                              <span className="mr-2 text-muted-foreground">
                                Q{index + 1}.
                              </span>
                              {item.text}
                            </p>
                            <div className="flex shrink-0 flex-wrap gap-1.5">
                              <Badge variant="outline">
                                {DIFFICULTY_LABELS[item.difficulty] ||
                                  item.difficulty}
                              </Badge>
                              <Badge variant="secondary">
                                {Number(item.marks)} marks
                              </Badge>
                            </div>
                          </div>

                          {item.sourcePath ? (
                            <p className="text-xs text-muted-foreground">
                              Source: {item.sourcePath}
                            </p>
                          ) : null}

                          {item.questionType === 'MCQ' &&
                          item.options?.length ? (
                            <ul className="space-y-1.5 pl-1">
                              {item.options.map((opt, optIndex) => (
                                <li
                                  key={opt.id}
                                  className={
                                    opt.isCorrect
                                      ? 'text-sm font-medium text-emerald-700'
                                      : 'text-sm text-muted-foreground'
                                  }
                                >
                                  {letterFor(optIndex)}) {opt.text}
                                  {opt.isCorrect ? ' ✓' : ''}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionPaperDetail;
