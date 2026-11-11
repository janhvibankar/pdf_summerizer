import React, { useState, useMemo } from 'react';
import { Search, Upload, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import DocumentCard from '../components/documents/DocumentCard.jsx';
import DocumentList from '../components/documents/DocumentList.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { useUI } from '../context/UIContext.jsx';

export const LibraryPage = () => {
  const { documents, setIsUploadModalOpen, deleteDocument } = useUI();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'title' | 'pages'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [docToDelete, setDocToDelete] = useState(null);

  const categories = ['All', 'Research', 'Finance', 'Technical', 'Uploaded'];

  // Client-side search and filtering
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        const matchesSearch =
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.executiveSummary.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'pages') {
          return b.pageCount - a.pageCount;
        }
        // newest
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });
  }, [documents, searchQuery, selectedCategory, sortBy]);

  const handleDeleteConfirm = () => {
    if (docToDelete) {
      deleteDocument(docToDelete.id);
      setDocToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900 tracking-tight">
            Document Library
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Browse, search, and manage your synthesized PDF documents and executive briefs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            icon={Upload}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, keyword, or synthesis..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-surface-border bg-white text-xs text-navy-900 placeholder:text-navy-400 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 shadow-subtle"
          />
        </div>

        {/* Categories, Sort & View Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-white border border-surface-border rounded-md p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-navy-900 text-white font-semibold'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-warm-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-surface-border rounded-md px-2.5 py-1 text-xs text-navy-700 shadow-subtle">
            <ArrowUpDown className="w-3.5 h-3.5 text-navy-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-xs text-navy-800 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest Uploaded</option>
              <option value="title">Alphabetical (A–Z)</option>
              <option value="pages">Page Count</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-white border border-surface-border rounded-md p-1 shadow-subtle">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-warm-200 text-navy-900'
                  : 'text-navy-400 hover:text-navy-700'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-warm-200 text-navy-900'
                  : 'text-navy-400 hover:text-navy-700'
              }`}
              title="List view"
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Display */}
      {documents.length === 0 ? (
        <EmptyState
          title="Document library is empty"
          description="You haven't added any documents to your workspace yet. Click the upload button to add your first PDF."
          actionLabel="Upload PDF Document"
          onAction={() => setIsUploadModalOpen(true)}
          actionIcon={Upload}
        />
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching documents found"
          description={`No documents matched your query "${searchQuery}" in category "${selectedCategory}". Try adjusting your keywords or filter.`}
          actionLabel="Reset Search & Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDeleteClick={(d) => setDocToDelete(d)} />
          ))}
        </div>
      ) : (
        <DocumentList documents={filteredDocuments} onDeleteClick={(d) => setDocToDelete(d)} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Document from Library"
        message={`Are you sure you want to remove "${docToDelete?.title || 'this document'}"? This action removes the document from your local workspace state.`}
      />
    </div>
  );
};

export default LibraryPage;
