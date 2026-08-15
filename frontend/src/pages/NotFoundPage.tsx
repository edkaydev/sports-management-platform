import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Page not found.</h1>
      <p className="text-sm text-muted mt-2">
        <Link to="/" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
