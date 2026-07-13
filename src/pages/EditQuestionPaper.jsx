import { Link, useParams } from 'react-router-dom';
import { useGetTestQuery } from '@/features/tests/api/testsApi';
import PaperBuilder from '@/features/tests/components/PaperBuilder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const EditQuestionPaper = () => {
  const { paperId } = useParams();
  const { data: paper, isLoading, isError, error } = useGetTestQuery(paperId, {
    skip: !paperId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
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

  if (paper.testStatus?.code !== 'DRAFT') {
    return (
      <Card className="space-y-3 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Only draft papers can be edited. This paper is{' '}
          {paper.testStatus?.name || 'locked'}.
        </p>
        <div className="flex justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/papers">Back to papers</Link>
          </Button>
          <Button asChild>
            <Link to={`/papers/${paper.id}`}>View paper</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return <PaperBuilder initialPaper={paper} />;
};

export default EditQuestionPaper;
