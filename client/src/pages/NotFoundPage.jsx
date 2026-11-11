import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion, LayoutDashboard } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-6 text-navy-900">
      <Card className="text-center max-w-md w-full !p-8 shadow-card">
        <div className="w-12 h-12 rounded-full bg-warm-100 border border-warm-200 text-navy-600 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-6 h-6 text-navy-800" />
        </div>
        <span className="font-mono text-[11px] uppercase tracking-wider text-accent-700 font-semibold block">
          Error 404
        </span>
        <h1 className="text-2xl font-serif font-bold text-navy-900 tracking-tight mt-1">
          Page Not Found
        </h1>
        <p className="text-xs text-navy-500 mt-2 font-sans leading-relaxed">
          The requested route does not exist within the PRANPAN product workspace.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" icon={ArrowLeft} className="w-full">
              Back to Home
            </Button>
          </Link>
          <Link to="/app" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" icon={LayoutDashboard} className="w-full">
              Go to App Workspace
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
