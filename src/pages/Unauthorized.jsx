import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Unauthorized = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <Card className="w-full max-w-md text-center">
      <CardHeader className="items-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <ShieldAlert className="size-5" />
        </div>
        <CardTitle className="text-xl text-heading">Access Denied</CardTitle>
        <CardDescription>
          You do not have permission to view this page.
        </CardDescription>
      </CardHeader>
      <CardContent />
      <CardFooter className="justify-center border-0 bg-transparent">
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </CardFooter>
    </Card>
  </div>
);

export default Unauthorized;
