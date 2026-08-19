import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ServerCrash } from 'lucide-react';

export function ServerErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <ServerCrash className="h-10 w-10 text-red-500" />
        </div>
        <p className="text-7xl font-bold text-gray-200">500</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Server Error</h1>
        <p className="mt-3 text-sm text-gray-500">
          Something went wrong on our end. Our team has been notified. Please try again later.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-umu-red hover:bg-umu-red-dark">
            <Link to="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline" onClick={() => window.location.reload()}>
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
