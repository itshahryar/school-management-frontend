import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Loader2,
  Lock,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetClassesQuery } from '@/features/classes/api/classesApi';
import { useGetSubjectsQuery } from '@/features/subjects/api/subjectsApi';
import { useGetContentTreeQuery } from '@/features/contentNodes/api/contentNodesApi';
import { useGetQuestionsQuery } from '@/features/questions/api/questionsApi';
import { useGetTestTypesQuery } from '@/features/tests/api/testMetaApi';
import {
  useCreateManualTestMutation,
  useReplaceTestQuestionsMutation,
  useUpdateTestMutation,
} from '@/features/tests/api/testsApi';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
} from '@/constants/academic';
import PageHeader from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const flattenSections = (nodes, depth = 0, acc = []) => {
  for (const node of nodes || []) {
    acc.push({
      id: node.id,
      title: node.title,
      type: node.type,
      depth,
      questions: node._count?.questions ?? 0,
    });
    if (node.children?.length) {
      flattenSections(node.children, depth + 1, acc);
    }
  }
  return acc;
};

const toCartItem = (question) => ({
  id: question.questionId || question.id,
  text: question.text,
  type: question.type || question.questionType,
  difficulty: question.difficulty,
  marks: Number(question.marks),
  marksOverride: '',
  sourcePath: question.sourcePath || question.contentNode?.title || '',
  options: question.options || [],
});

const PaperBuilder = ({ initialPaper = null }) => {
  const navigate = useNavigate();
  const isEdit = Boolean(initialPaper?.id);
  const statusCode = initialPaper?.testStatus?.code || 'DRAFT';
  const isLocked = statusCode !== 'DRAFT';

  const [paperId, setPaperId] = useState(initialPaper?.id || null);
  const [title, setTitle] = useState(initialPaper?.title || '');
  const [description, setDescription] = useState(
    initialPaper?.description || ''
  );
  const [instructions, setInstructions] = useState(
    initialPaper?.instructions || ''
  );
  const [classId, setClassId] = useState(initialPaper?.classId || '');
  const [subjectId, setSubjectId] = useState(initialPaper?.subjectId || '');
  const [testTypeId, setTestTypeId] = useState(initialPaper?.testTypeId || '');
  const [durationMinutes, setDurationMinutes] = useState(
    initialPaper?.durationMinutes != null
      ? String(initialPaper.durationMinutes)
      : '60'
  );
  const [selected, setSelected] = useState(() =>
    (initialPaper?.questions || []).map((q) => ({
      ...toCartItem(q),
      marksOverride: '',
    }))
  );

  const [chapterId, setChapterId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [bankPage, setBankPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [createManual, { isLoading: isCreating }] =
    useCreateManualTestMutation();
  const [updateTest, { isLoading: isUpdatingMeta }] = useUpdateTestMutation();
  const [replaceQuestions, { isLoading: isReplacing }] =
    useReplaceTestQuestionsMutation();

  const isBusy = isCreating || isUpdatingMeta || isReplacing;

  const { data: classesData } = useGetClassesQuery({
    page: 1,
    limit: 100,
    isActive: 'true',
  });
  const { data: subjectsData } = useGetSubjectsQuery(
    { page: 1, limit: 100, classId, isActive: 'true' },
    { skip: !classId }
  );
  const { data: tree = [] } = useGetContentTreeQuery(
    { subjectId, isActive: 'true' },
    { skip: !subjectId }
  );
  const { data: testTypes = [] } = useGetTestTypesQuery();

  const chapters = useMemo(
    () => (tree || []).filter((node) => node.type === 'CHAPTER'),
    [tree]
  );

  const topicOptions = useMemo(() => {
    if (!chapterId) return [];
    const chapter = chapters.find((node) => node.id === chapterId);
    if (!chapter?.children?.length) return [];
    return flattenSections(chapter.children, 0);
  }, [chapters, chapterId]);

  const {
    data: bankData,
    isLoading: isBankLoading,
    isFetching: isBankFetching,
  } = useGetQuestionsQuery(
    {
      page: bankPage,
      limit: 20,
      subjectId: appliedFilters?.subjectId || '',
      contentNodeId: appliedFilters?.contentNodeId || '',
      type: appliedFilters?.type || '',
      difficulty: appliedFilters?.difficulty || '',
      search: appliedFilters?.search || '',
      isActive: 'true',
      sort: 'latest',
    },
    { skip: !appliedFilters?.subjectId }
  );

  const classes = classesData?.classes ?? [];
  const subjects = subjectsData?.subjects ?? [];
  const bankQuestions = bankData?.questions ?? [];
  const bankPagination = bankData?.pagination;

  const resetBankDraftFilters = () => {
    setChapterId('');
    setTopicId('');
    setType('');
    setDifficulty('');
    setSearch('');
    setBankPage(1);
    setAppliedFilters(null);
    setHasSearched(false);
  };

  const handleSearchBank = () => {
    if (!classId || !subjectId) {
      toast.error('Select a class and subject first');
      return;
    }

    setBankPage(1);
    setHasSearched(true);
    setAppliedFilters({
      subjectId,
      contentNodeId: topicId || chapterId || '',
      type,
      difficulty,
      search: search.trim(),
    });
  };

  useEffect(() => {
    if (!isEdit) {
      setSubjectId('');
      setSelected([]);
      resetBankDraftFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when class changes for new papers
  }, [classId, isEdit]);

  useEffect(() => {
    if (!isEdit) {
      resetBankDraftFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, isEdit]);

  useEffect(() => {
    setTopicId('');
  }, [chapterId]);

  useEffect(() => {
    if (!testTypeId && testTypes.length) {
      setTestTypeId(testTypes[0].id);
    }
  }, [testTypes, testTypeId]);
  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.id)),
    [selected]
  );

  const totalMarks = useMemo(
    () =>
      selected.reduce((sum, item) => {
        const marks = item.marksOverride
          ? Number(item.marksOverride)
          : Number(item.marks);
        return sum + (Number.isFinite(marks) ? marks : 0);
      }, 0),
    [selected]
  );

  const selectedGrouped = useMemo(() => {
    const groups = QUESTION_TYPES.map((questionType) => {
      const items = selected
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.type === questionType);
      const marks = items.reduce((sum, { item }) => {
        const value = item.marksOverride
          ? Number(item.marksOverride)
          : Number(item.marks);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0);
      return { questionType, items, marks };
    });
    return groups.filter((group) => group.items.length > 0);
  }, [selected]);

  const toggleBankQuestion = (question) => {
    if (isLocked) return;
    setSelected((prev) => {
      if (prev.some((item) => item.id === question.id)) {
        return prev.filter((item) => item.id !== question.id);
      }
      const nextItem = toCartItem(question);
      const lastSameTypeIndex = prev.reduce(
        (last, row, index) => (row.type === nextItem.type ? index : last),
        -1
      );
      if (lastSameTypeIndex === -1) return [...prev, nextItem];
      const next = [...prev];
      next.splice(lastSameTypeIndex + 1, 0, nextItem);
      return next;
    });
  };

  const moveSelected = (index, direction) => {
    if (isLocked) return;
    setSelected((prev) => {
      const current = prev[index];
      if (!current) return prev;
      const sameTypeIndexes = prev
        .map((row, rowIndex) => (row.type === current.type ? rowIndex : -1))
        .filter((rowIndex) => rowIndex >= 0);
      const position = sameTypeIndexes.indexOf(index);
      const targetPosition = position + direction;
      if (targetPosition < 0 || targetPosition >= sameTypeIndexes.length) {
        return prev;
      }
      const targetIndex = sameTypeIndexes[targetPosition];
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const removeSelected = (id) => {
    if (isLocked) return;
    setSelected((prev) => prev.filter((item) => item.id !== id));
  };

  const buildQuestionsPayload = () => {
    const ordered = [
      ...QUESTION_TYPES.flatMap((questionType) =>
        selected.filter((item) => item.type === questionType)
      ),
      ...selected.filter(
        (item) => !QUESTION_TYPES.includes(item.type)
      ),
    ];

    return ordered.map((item, index) => ({
      questionId: item.id,
      sortOrder: index + 1,
      ...(item.marksOverride
        ? { marks: Number(item.marksOverride) }
        : {}),
    }));
  };
  const validateMeta = () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!classId || !subjectId) {
      toast.error('Select a class and subject');
      return false;
    }
    if (!testTypeId) {
      toast.error('Select a paper type');
      return false;
    }
    if (!selected.length) {
      toast.error('Select at least one question');
      return false;
    }
    return true;
  };

  const handleComplete = async () => {
    if (isLocked) {
      navigate(`/papers/${paperId || initialPaper?.id}`);
      return;
    }
    if (!validateMeta()) return;

    const meta = {
      title: title.trim(),
      description: description.trim() || undefined,
      instructions: instructions.trim() || undefined,
      classId,
      subjectId,
      testTypeId,
      ...(durationMinutes
        ? { durationMinutes: Number(durationMinutes) }
        : {}),
    };

    try {
      let paper;
      if (!paperId) {
        paper = await createManual({
          ...meta,
          questions: buildQuestionsPayload(),
        }).unwrap();
      } else {
        await updateTest({ id: paperId, ...meta }).unwrap();
        paper = await replaceQuestions({
          id: paperId,
          questions: buildQuestionsPayload(),
        }).unwrap();
      }
      toast.success('Paper saved — review it on the next page');
      navigate(`/papers/${paper.id}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save paper');
    }
  };

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
          title={isEdit ? 'Edit Question Paper' : 'Build Question Paper'}
          description="Fill paper details, pick questions from the bank, then click Complete to review."
          className="mb-0"
        />
      </div>

      {isLocked ? (
        <p className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Lock className="size-4" />
          This paper is {statusCode.toLowerCase()} and can no longer be edited.
          Use Preview / Export from the paper view.
        </p>
      ) : null}

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base">Paper details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="paper-title">Title</Label>
              <Input
                id="paper-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isBusy || isLocked}
                placeholder="e.g. Unit Test 1 — Force and Motion"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select
                value={classId || undefined}
                onValueChange={setClassId}
                disabled={isBusy || isLocked}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select
                value={subjectId || undefined}
                onValueChange={setSubjectId}
                disabled={!classId || isBusy || isLocked}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      classId ? 'Select subject' : 'Select a class first'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Paper type</Label>
              <Select
                value={testTypeId || undefined}
                onValueChange={setTestTypeId}
                disabled={isBusy || isLocked}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {testTypes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paper-duration">Duration (min)</Label>
              <Input
                id="paper-duration"
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                disabled={isBusy || isLocked}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="paper-description">Description</Label>
              <Textarea
                id="paper-description"
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isBusy || isLocked}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
              <Label htmlFor="paper-instructions">Instructions</Label>
              <Textarea
                id="paper-instructions"
                rows={2}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                disabled={isBusy || isLocked}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Question bank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Chapter</Label>
                <Select
                  value={chapterId || 'all'}
                  onValueChange={(value) =>
                    setChapterId(value === 'all' ? '' : value)
                  }
                  disabled={!subjectId || isBusy || isLocked}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All chapters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All chapters</SelectItem>
                    {chapters.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Topic / sub-topic</Label>
                <Select
                  value={topicId || 'all'}
                  onValueChange={(value) =>
                    setTopicId(value === 'all' ? '' : value)
                  }
                  disabled={!chapterId || isBusy || isLocked}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        chapterId
                          ? 'All topics in chapter'
                          : 'Select a chapter first'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All topics in chapter</SelectItem>
                    {topicOptions.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.depth > 0 ? `${'—'.repeat(node.depth)} ` : ''}
                        {node.title}
                        {node.depth === 0 ? ' (topic)' : ' (sub-topic)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={type || 'all'}
                  onValueChange={(value) =>
                    setType(value === 'all' ? '' : value)
                  }
                  disabled={!subjectId || isBusy || isLocked}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select
                  value={difficulty || 'all'}
                  onValueChange={(value) =>
                    setDifficulty(value === 'all' ? '' : value)
                  }
                  disabled={!subjectId || isBusy || isLocked}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bank-search">Question text</Label>
                <Input
                  id="bank-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Optional keywords…"
                  disabled={!subjectId || isBusy || isLocked}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSearchBank();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                disabled={!subjectId || isBusy || isLocked}
                onClick={handleSearchBank}
              >
                <Search />
                Search questions
              </Button>
              {hasSearched ? (
                <p className="text-xs text-muted-foreground">
                  Showing results for your last search. Change filters and
                  search again to refresh.
                </p>
              ) : null}
            </div>

            {!subjectId ? (
              <p className="rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
                Select a class and subject in Paper details, set filters, then
                click Search.
              </p>
            ) : !hasSearched ? (
              <p className="rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
                Set your filters, then click <strong>Search questions</strong>{' '}
                to load the bank.
              </p>
            ) : isBankLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading questions…
              </div>
            ) : !bankQuestions.length ? (
              <p className="rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
                No questions match these filters.
              </p>
            ) : (
              <div
                className={cn(
                  'max-h-[32rem] space-y-2 overflow-y-auto pr-1',
                  isBankFetching && 'opacity-70'
                )}
              >
                {bankQuestions.map((question) => {
                  const checked = selectedIds.has(question.id);
                  return (
                    <label
                      key={question.id}
                      className={cn(
                        'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
                        checked
                          ? 'border-primary/40 bg-primary/5'
                          : 'hover:bg-muted/40',
                        isLocked && 'cursor-default opacity-70'
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={isLocked || isBusy}
                        onCheckedChange={() => toggleBankQuestion(question)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="line-clamp-3 text-sm text-heading">
                          {question.text}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary">
                            {QUESTION_TYPE_LABELS[question.type]}
                          </Badge>
                          <Badge variant="outline">
                            {DIFFICULTY_LABELS[question.difficulty]}
                          </Badge>
                          <Badge variant="outline">
                            {Number(question.marks)} marks
                          </Badge>
                          {question.contentNode?.title ? (
                            <Badge variant="outline">
                              {question.contentNode.title}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      {!checked && !isLocked ? (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="shrink-0"
                          onClick={(event) => {
                            event.preventDefault();
                            toggleBankQuestion(question);
                          }}
                          aria-label="Add question"
                        >
                          <Plus />
                        </Button>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            )}

            {bankPagination && bankPagination.totalPages > 1 ? (
              <div className="flex items-center justify-between gap-2 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  Page {bankPagination.page} / {bankPagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!bankPagination.hasPrevPage || isBankFetching}
                    onClick={() => setBankPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!bankPagination.hasNextPage || isBankFetching}
                    onClick={() => setBankPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="gap-0 overflow-hidden py-0">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b py-4">
              <div>
                <CardTitle className="text-base">Selected questions</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selected.length} question{selected.length === 1 ? '' : 's'} ·{' '}
                  {totalMarks} marks
                </p>
              </div>
            </CardHeader>
            <CardContent className="max-h-[36rem] space-y-4 overflow-y-auto p-3">
              {!selected.length ? (
                <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                  Tick questions from the bank to add them here.
                </p>
              ) : (
                selectedGrouped.map((group) => {
                  const sameTypeIndexes = group.items.map(({ index }) => index);
                  return (
                    <div key={group.questionType} className="space-y-2">
                      <div className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
                        <p className="text-sm font-medium text-heading">
                          {QUESTION_TYPE_LABELS[group.questionType]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {group.items.length} · {group.marks} marks
                        </p>
                      </div>
                      {group.items.map(({ item, index }, localIndex) => (
                        <div
                          key={item.id}
                          className="rounded-lg border bg-muted/20 p-3"
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                              {localIndex + 1}.
                            </span>
                            <div className="min-w-0 flex-1 space-y-2">
                              <p className="line-clamp-3 text-sm text-heading">
                                {item.text}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">
                                  {DIFFICULTY_LABELS[item.difficulty] ||
                                    item.difficulty}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Label className="text-xs text-muted-foreground">
                                    Marks
                                  </Label>
                                  <Input
                                    type="number"
                                    min={0.5}
                                    step="0.5"
                                    className="h-7 w-16"
                                    placeholder={String(item.marks)}
                                    value={item.marksOverride}
                                    disabled={isBusy || isLocked}
                                    onChange={(event) =>
                                      setSelected((prev) =>
                                        prev.map((row) =>
                                          row.id === item.id
                                            ? {
                                                ...row,
                                                marksOverride:
                                                  event.target.value,
                                              }
                                            : row
                                        )
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            {!isLocked ? (
                              <div className="flex shrink-0 flex-col gap-0.5">
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="ghost"
                                  disabled={localIndex === 0 || isBusy}
                                  onClick={() => moveSelected(index, -1)}
                                  aria-label="Move up"
                                >
                                  <ArrowUp />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="ghost"
                                  disabled={
                                    localIndex === sameTypeIndexes.length - 1 ||
                                    isBusy
                                  }
                                  onClick={() => moveSelected(index, 1)}
                                  aria-label="Move down"
                                >
                                  <ArrowDown />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="ghost"
                                  disabled={isBusy}
                                  onClick={() => removeSelected(item.id)}
                                  aria-label="Remove"
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={isBusy || isLocked}
              onClick={handleComplete}
              className="min-w-36"
            >
              {isBusy ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle2 />
              )}
              Complete
            </Button>
            {isLocked && (paperId || initialPaper?.id) ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate(`/papers/${paperId || initialPaper.id}`)
                }
              >
                View paper
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperBuilder;
