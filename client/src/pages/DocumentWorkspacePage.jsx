import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Share2, FileSearch } from 'lucide-react';
import DocumentPreview from '../components/documents/DocumentPreview.jsx';
import DocumentSummary from '../components/documents/DocumentSummary.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import Button from '../components/common/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export const DocumentWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, deleteDocument, addToast } = useUI();
  const [docToDelete, setDocToDelete] = useState(false);
  const [layoutMode, setLayoutMode] = useState('split'); // 'split' | 'reader' | 'summary'

  // Lookup document by id or fallback to first document
  const currentDoc = documents.find((d) => d.id === id) || documents[0] || null;

  if (!currentDoc) {
    return (
      <div className="text-center py-16 space-y-4">
        <FileSearch className="w-10 h-10 text-navy-300 mx-auto" />
        <h2 className="text-lg font-serif font-bold text-navy-900">Document Not Found</h2>
        <p className="text-xs text-navy-500">
          The requested document could not be located in your current workspace library.
        </p>
        <Link to="/app/library">
          <Button variant="primary" size="sm" icon={ArrowLeft}>
            Return to Library
          </Button>
        </Link>
      </div>
    );
  }

  const handleDeleteConfirm = () => {
    deleteDocument(currentDoc.id);
    navigate('/app/library');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Document workspace link copied to clipboard', 'info');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] min-h-[600px] space-y-4">
      {/* Workspace Header Bar */}
      <div className="bg-white border border-surface-border rounded-card px-4 sm:px-6 py-3 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        {/* Document identity & Back Link */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/app/library"
            className="p-1.5 rounded text-navy-500 hover:text-navy-900 hover:bg-warm-100 transition-colors flex-shrink-0"
            title="Return to library"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-surface-border hidden sm:block" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-serif font-bold text-navy-900 truncate tracking-tight">
                {currentDoc.title}
              </h1>
              <span className="hidden md:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-warm-100 border border-warm-200 text-navy-700">
                {currentDoc.category}
              </span>
            </div>
            <p className="text-[11px] font-mono text-navy-400 truncate mt-0.5">
              {currentDoc.fileName} &bull; {currentDoc.pageCount} pages &bull; {currentDoc.fileSize}
            </p>
          </div>
        </div>

        {/* View Switchers & Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
          {/* Layout mode switcher for desktop */}
          <div className="hidden lg:flex items-center bg-warm-100 border border-surface-border rounded-md p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLayoutMode('split')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                layoutMode === 'split'
                  ? 'bg-white text-navy-900 shadow-subtle font-semibold'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('reader')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                layoutMode === 'reader'
                  ? 'bg-white text-navy-900 shadow-subtle font-semibold'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Document Only
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('summary')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                layoutMode === 'summary'
                  ? 'bg-white text-navy-900 shadow-subtle font-semibold'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Summary Only
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            icon={Share2}
            className="hidden sm:inline-flex"
          >
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDocToDelete(true)}
            icon={Trash2}
            className="text-navy-400 hover:text-rose-600"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-hidden">
        {/* Left Pane: Document Reader */}
        {(layoutMode === 'split' || layoutMode === 'reader') && (
          <div
            className={`h-full overflow-hidden ${layoutMode === 'reader' ? 'lg:col-span-2' : ''}`}
          >
            <DocumentPreview document={currentDoc} />
          </div>
        )}

        {/* Right Pane: AI Synthesis Panel */}
        {(layoutMode === 'split' || layoutMode === 'summary') && (
          <div
            className={`h-full overflow-hidden ${layoutMode === 'summary' ? 'lg:col-span-2' : ''}`}
          >
            <DocumentSummary document={currentDoc} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={docToDelete}
        onClose={() => setDocToDelete(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        message={`Are you sure you want to remove "${currentDoc.title}" from your workspace?`}
      />
    </div>
  );
};

export default DocumentWorkspacePage;
