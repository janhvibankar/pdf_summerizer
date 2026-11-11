import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2, ArrowUpRight } from 'lucide-react';
import Card from '../common/Card.jsx';
import StatusPill from '../common/StatusPill.jsx';

export const DocumentCard = ({ document, onDeleteClick }) => {
  return (
    <Card className="flex flex-col justify-between hover:border-navy-300 transition-all duration-150 group">
      <div>
        {/* Header: Tag & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-warm-100 border border-warm-200 text-navy-700 font-medium">
            {document.category || 'General'}
          </span>
          <StatusPill status="success" label="Indexed" />
        </div>

        {/* Title */}
        <Link
          to={`/app/documents/${document.id}`}
          className="block group-hover:text-accent-600 transition-colors"
        >
          <h3 className="text-sm font-semibold text-navy-900 tracking-tight font-serif line-clamp-2">
            {document.title}
          </h3>
        </Link>

        {/* Executive summary snippet */}
        <p className="text-xs text-navy-500 mt-2 line-clamp-3 leading-relaxed font-sans">
          {document.executiveSummary}
        </p>
      </div>

      {/* Meta Footer */}
      <div className="mt-5 pt-3 border-t border-surface-border">
        <div className="flex items-center justify-between text-[11px] text-navy-400 font-mono mb-3">
          <span>
            {document.pageCount} pages &bull; {document.fileSize}
          </span>
          <span className="flex items-center gap-1 text-navy-500">
            <Clock className="w-3 h-3 text-accent-600" />
            {document.readingTime.split(' ')[0]} {document.readingTime.split(' ')[1]}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/app/documents/${document.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-accent-600 transition-colors"
          >
            <span>Open Workspace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onDeleteClick(document)}
            className="p-1 rounded text-navy-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete document"
            aria-label={`Delete ${document.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default DocumentCard;
