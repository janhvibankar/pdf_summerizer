import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, ArrowUpRight } from 'lucide-react';
import StatusPill from '../common/StatusPill.jsx';
import { formatIsoDate } from '../../utils/formatters.js';

export const DocumentList = ({ documents, onDeleteClick }) => {
  return (
    <div className="overflow-x-auto rounded-card border border-surface-border bg-white shadow-card">
      <table className="min-w-full divide-y divide-surface-border text-left">
        <thead className="bg-warm-50 text-[11px] font-semibold text-navy-500 font-mono tracking-wider uppercase">
          <tr>
            <th scope="col" className="px-6 py-3.5">
              Document
            </th>
            <th scope="col" className="px-6 py-3.5 hidden sm:table-cell">
              Category
            </th>
            <th scope="col" className="px-6 py-3.5 hidden md:table-cell">
              Pages / Size
            </th>
            <th scope="col" className="px-6 py-3.5 hidden lg:table-cell">
              Uploaded
            </th>
            <th scope="col" className="px-6 py-3.5">
              Status
            </th>
            <th scope="col" className="px-6 py-3.5 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border text-xs">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-warm-50/60 transition-colors group">
              {/* Document title */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-warm-100 border border-warm-200 text-navy-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-navy-800" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/app/documents/${doc.id}`}
                      className="font-semibold text-navy-900 hover:text-accent-600 transition-colors line-clamp-1 font-serif text-sm"
                    >
                      {doc.title}
                    </Link>
                    <p className="text-[11px] text-navy-400 font-mono truncate mt-0.5">
                      {doc.fileName}
                    </p>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="px-6 py-4 hidden sm:table-cell">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-warm-100 text-navy-700">
                  {doc.category || 'General'}
                </span>
              </td>

              {/* Pages / Size */}
              <td className="px-6 py-4 hidden md:table-cell text-navy-600 font-mono text-[11px]">
                {doc.pageCount} pp &bull; {doc.fileSize}
              </td>

              {/* Date */}
              <td className="px-6 py-4 hidden lg:table-cell text-navy-500 font-mono text-[11px]">
                {formatIsoDate(doc.uploadedAt)}
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <StatusPill status="success" label="Indexed" />
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/app/documents/${doc.id}`}
                    className="p-1.5 rounded text-navy-600 hover:text-navy-900 hover:bg-warm-100 transition-colors"
                    title="Open workspace"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDeleteClick(doc)}
                    className="p-1.5 rounded text-navy-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;
