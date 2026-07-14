import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  FolderTree,
  Loader2,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetClassQuery } from '@/features/classes/api/classesApi';
import { useGetSubjectQuery } from '@/features/subjects/api/subjectsApi';
import ContentNodeFormDialog from '@/features/contentNodes/components/ContentNodeFormDialog';
import ContentTree from '@/features/contentNodes/components/ContentTree';
import {
  useDeleteContentNodeMutation,
  useGetContentTreeQuery,
} from '@/features/contentNodes/api/contentNodesApi';
import ContentStructureInfo from '@/components/common/ContentStructureInfo';
import EmptyState from '@/components/common/EmptyState';
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

const findNodeType = (tree, nodeId) => {
  if (!nodeId) return null;
  for (const node of tree) {
    if (node.id === nodeId) return node.type;
    if (node.children?.length) {
      const found = findNodeType(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
};

const SubjectContent = () => {
  const { classId, subjectId } = useParams();
  const [formOpen, setFormOpen] = useState(false);
  const [parentId, setParentId] = useState(null);
  const [parentType, setParentType] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [deletingNode, setDeletingNode] = useState(null);

  const [deleteNode, { isLoading: isDeleting }] =
    useDeleteContentNodeMutation();

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

  const openCreateChapter = () => {
    setEditingNode(null);
    setParentId(null);
    setParentType(null);
    setFormOpen(true);
  };

  const openAddChild = (node) => {
    setEditingNode(null);
    setParentId(node.id);
    setParentType(node.type);
    setFormOpen(true);
  };

  const openEdit = (node) => {
    setEditingNode(node);
    setParentId(null);
    setParentType(findNodeType(nodes, node.parentId));
    setFormOpen(true);
  };

  const handleFormOpenChange = (open) => {
    setFormOpen(open);
    if (!open) {
      setEditingNode(null);
      setParentId(null);
      setParentType(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingNode) return;
    try {
      await deleteNode(deletingNode.id).unwrap();
      toast.success(
        deletingNode.type === 'CHAPTER'
          ? 'Chapter deleted'
          : 'Section deleted'
      );
      setDeletingNode(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete');
    }
  };

  const backToSubjects = `/classes/${classId}/subjects`;

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
          actions={
            <Button type="button" onClick={openCreateChapter}>
              <Plus />
              Add Chapter
            </Button>
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
              title="Couldn’t load content"
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
              icon={FolderTree}
              title="No chapters yet"
              description="Add a chapter, then nest topics and sub-topics under it."
              action={
                <Button type="button" onClick={openCreateChapter}>
                  <Plus />
                  Add Chapter
                </Button>
              }
            />
          ) : (
            <ContentTree
              nodes={nodes}
              questionsPath={(nodeId) =>
                `/classes/${classId}/subjects/${subjectId}/content/${nodeId}/questions`
              }
              onAddChild={openAddChild}
              onEdit={openEdit}
              onDelete={setDeletingNode}
            />
          )}
        </div>
      </Card>

      <ContentNodeFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        subjectId={subjectId}
        parentId={parentId}
        parentType={parentType}
        nodeItem={editingNode}
      />

      <AlertDialog
        open={Boolean(deletingNode)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingNode(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{' '}
              {deletingNode?.type === 'CHAPTER' ? 'chapter' : 'section'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-medium text-heading">
                {deletingNode?.title}
              </span>{' '}
              and all nested sections, questions, and notes under it.
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

export default SubjectContent;
