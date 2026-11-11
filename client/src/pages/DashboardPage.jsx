import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import DocumentCard from '../components/documents/DocumentCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { useUI } from '../context/UIContext.jsx';

export const DashboardPage = () => {
  const { documents, setIsUploadModalOpen, deleteDocument } = useUI();
  const [docToDelete, setDocToDelete] = useState(null);

  const sampleStats = [
    {
      label: 'Documents Indexed',
      value: documents.length.toString(),
      desc: 'Active in workspace library'
    },
    { label: 'Total Pages Synthesized', value: '114', desc: 'Across vetted corpora' },
    { label: 'Est. Reading Time Saved', value: '4.5 hrs', desc: 'Versus full reading rate' }
  ];

  const recentActivity = [
    {
      id: 'a-1',
      title: 'Synthesized Executive Brief',
      document: 'Global Renewable Energy Transition Strategy 2026–2030',
      time: '12 mins ago'
    },
    {
      id: 'a-2',
      title: 'Exported Markdown Summary',
      document: 'Q3 Enterprise Software Financial Performance & SaaS Metrics',
      time: '2 hours ago'
    },
    {
      id: 'a-3',
      title: 'Indexed Document Metadata',
      document: 'Constitutional AI & Large Language Model Safety Architecture',
      time: '1 day ago'
    }
  ];

  const handleDeleteConfirm = () => {
    if (docToDelete) {
      deleteDocument(docToDelete.id);
      setDocToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Upload Hero Banner */}
      <div className="rounded-card border border-surface-border bg-white p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-pill bg-warm-100 border border-warm-200 text-xs font-mono text-navy-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-accent-600" />
            <span>Workspace Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy-900 tracking-tight">
            Welcome to PRANPAN
          </h1>
          <p className="text-xs sm:text-sm text-navy-600 mt-2 font-sans leading-relaxed">
            Your intelligence workspace for ingesting, summarizing, and interrogating complex PDF
            documents. Choose an active document below or upload a new one to begin.
          </p>
        </div>

        <div className="flex-shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsUploadModalOpen(true)}
            icon={Upload}
          >
            Upload PDF Document
          </Button>
        </div>
      </div>

      {/* Illustrative Sample Statistics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-navy-500 font-semibold">
            Workspace Metrics
          </h2>
          <span className="text-[10px] font-mono text-navy-400 bg-warm-100 px-2 py-0.5 rounded">
            Illustrative Sample Data
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sampleStats.map((stat, idx) => (
            <Card key={idx} className="!p-5">
              <span className="text-xs font-medium text-navy-500">{stat.label}</span>
              <p className="text-2xl font-serif font-bold text-navy-900 mt-1 font-mono">
                {stat.value}
              </p>
              <p className="text-[11px] text-navy-400 mt-1">{stat.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-navy-900 tracking-tight">
              Recent Documents
            </h2>
            <p className="text-xs text-navy-500">
              Select any document to review its executive brief, takeaways, or start an inquiry.
            </p>
          </div>
          <Link
            to="/app/library"
            className="text-xs font-semibold text-navy-900 hover:text-accent-600 inline-flex items-center gap-1 transition-colors"
          >
            <span>View Library ({documents.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {documents.length === 0 ? (
          <EmptyState
            title="No documents uploaded yet"
            description="Your workspace library is currently empty. Upload your first PDF to generate an executive brief and key findings."
            actionLabel="Upload PDF Document"
            onAction={() => setIsUploadModalOpen(true)}
            actionIcon={Upload}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.slice(0, 3).map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDeleteClick={(d) => setDocToDelete(d)} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Timeline */}
      <Card title="Recent Activity" subtitle="Sample audit log of workspace actions">
        <ul className="divide-y divide-surface-border -my-2 text-xs">
          {recentActivity.map((activity) => (
            <li key={activity.id} className="py-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-warm-100 text-navy-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-600" />
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{activity.title}</p>
                  <p className="text-navy-500 text-[11px] font-sans mt-0.5 line-clamp-1">
                    {activity.document}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-navy-400 whitespace-nowrap">
                {activity.time}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Document from Library"
        message={`Are you sure you want to remove "${docToDelete?.title || 'this document'}"? In Phase 1, this will clear it from your local workspace state.`}
      />
    </div>
  );
};

export default DashboardPage;
