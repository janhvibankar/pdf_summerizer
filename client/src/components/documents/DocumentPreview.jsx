import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';

export const DocumentPreview = ({ document }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const { addToast } = useUI();

  const totalPages = document?.pageCount || 1;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(150, prev + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(70, prev - 10));
  };

  const handleDownloadOriginal = () => {
    addToast('PDF download will be served via the storage pipeline in Phase 3', 'info');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-card border border-surface-border shadow-card overflow-hidden">
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-warm-50 border-b border-surface-border text-xs">
        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded text-navy-600 hover:bg-warm-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs font-medium text-navy-800 px-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded text-navy-600 hover:bg-warm-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-surface-border rounded px-1.5 py-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-0.5 rounded text-navy-500 hover:text-navy-900"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-navy-600 px-1">{zoomLevel}%</span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-0.5 rounded text-navy-500 hover:text-navy-900"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadOriginal}
            className="p-1 rounded text-navy-500 hover:text-navy-900 hover:bg-warm-200 transition-colors"
            title="Download source PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Reader Canvas (Simulated Page View) */}
      <div className="flex-1 overflow-y-auto p-6 bg-warm-100 flex justify-center items-start">
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-2xl bg-white rounded-sm shadow-editorial border border-surface-border p-8 sm:p-12 text-navy-900 min-h-[640px] transition-transform duration-100"
        >
          {/* Page header marker */}
          <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-6 text-[10px] font-mono text-navy-400">
            <span>{document?.fileName || 'Document.pdf'}</span>
            <span>SECTION OVERVIEW &bull; PAGE {currentPage}</span>
          </div>

          {/* Document Content Simulation */}
          <article className="prose prose-sm max-w-none space-y-4">
            <h2 className="text-xl font-serif font-bold text-navy-900 tracking-tight">
              {document?.title}
            </h2>
            <div className="h-0.5 w-12 bg-navy-900 my-2" />

            <p className="text-xs text-navy-600 font-serif leading-relaxed italic">
              {document?.executiveSummary}
            </p>

            <div className="my-6 p-4 rounded bg-warm-50 border-l-2 border-accent-600 text-xs text-navy-800 space-y-1">
              <span className="font-mono font-semibold text-[10px] uppercase text-accent-700 block">
                Primary Findings Highlight
              </span>
              <p className="leading-relaxed font-sans">
                {document?.keyTakeaways?.[0]?.desc ||
                  'The operational targets formulated in this mandate establish an empirical precedent for performance evaluation.'}
              </p>
            </div>

            <h3 className="text-sm font-semibold text-navy-900 tracking-tight mt-6">
              Empirical Methodology & Scope
            </h3>
            <p className="text-xs text-navy-700 leading-relaxed font-sans">
              Data collection spans multi-quarter comparative reporting units across standardized
              metrics. All figures are adjusted for seasonal volatility and represent vetted
              institutional metrics compiled by the editorial review board.
            </p>

            <div className="mt-8 pt-4 border-t border-surface-border flex justify-between text-[10px] font-mono text-navy-400">
              <span>Confidential & Proprietary</span>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
