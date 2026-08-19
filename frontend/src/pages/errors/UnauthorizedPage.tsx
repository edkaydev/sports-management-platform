import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldOff } from 'lucide-react';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <ShieldOff className="h-10 w-10 text-red-500" />
        </div>
        <p className="text-7xl font-bold text-gray-200">401</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Unauthorized Access</h1>
        <p className="mt-3 text-sm text-gray-500">
          You are not signed in or your session has expired. Please sign in to continue.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-umu-red hover:bg-umu-red-dark">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
