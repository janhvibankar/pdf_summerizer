import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';
import Button from '../common/Button.jsx';
import { SUMMARY_FORMATS } from '../../utils/mockDocuments.js';

export const UploadDropzone = ({ onComplete, onCancel }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('executive');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

  const handleFiles = (file) => {
    setError(null);
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file format. Please select a valid PDF document (.pdf).');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File exceeds the 15 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);

    // Simulate local document addition for Phase 1 UI/UX demonstration
    setTimeout(() => {
      const newDoc = {
        id: 'doc-' + Date.now(),
        title: selectedFile.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
        fileName: selectedFile.name,
        fileSize: (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB',
        pageCount: Math.max(4, Math.floor(selectedFile.size / 75000)),
        category: 'Uploaded',
        uploadedAt: new Date().toISOString(),
        status: 'completed',
        readingTime: '4 min summary',
        executiveSummary: `Sample summary for "${selectedFile.name}". This document was uploaded locally during Phase 1 UI validation. Full AI processing and text extraction will be performed via the backend pipeline in subsequent phases.`,
        keyTakeaways: [
          {
            id: 't-1',
            title: 'Uploaded Document Ingestion',
            desc: `File "${selectedFile.name}" was verified client-side.`
          },
          {
            id: 't-2',
            title: 'Summary Target Mode',
            desc: `Configured for ${SUMMARY_FORMATS.find((f) => f.id === selectedFormat)?.label || 'Executive'} synthesis.`
          }
        ],
        sections: [
          {
            title: '1. Document Overview',
            pages: 'pp. 1–2',
            content: 'Client-side file metadata parsed successfully.'
          }
        ],
        chatHistory: []
      };

      setIsProcessing(false);
      if (onComplete) onComplete(newDoc);
    }, 600);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleUploadSubmit} className="space-y-5">
      {/* Scope Notice */}
      <div className="p-3 rounded-md bg-warm-50 border border-warm-200 text-xs text-navy-600 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <span className="font-semibold text-navy-800">Phase 1 UI Testing:</span> File validation
          and addition occur locally in-browser. Backend extraction and Gemini summarization will
          connect in later phases.
        </p>
      </div>

      {/* Drag & Drop Area */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-card p-8 sm:p-10 text-center cursor-pointer transition-all duration-150 ${
            dragActive
              ? 'border-accent-600 bg-accent-50/50'
              : 'border-surface-border hover:border-navy-400 bg-warm-50/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-white border border-surface-border text-navy-700 flex items-center justify-center mx-auto mb-3 shadow-subtle">
            <UploadCloud className="w-6 h-6 text-accent-600" />
          </div>
          <p className="text-sm font-semibold text-navy-900 tracking-tight font-serif">
            Drop your PDF here or <span className="text-accent-600 underline">browse files</span>
          </p>
          <p className="text-xs text-navy-400 mt-1">Standard PDF documents up to 15 MB</p>
        </div>
      ) : (
        /* Selected file display */
        <div className="p-4 rounded-card border border-surface-border bg-white shadow-subtle">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded bg-navy-900 text-white flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-warm-100" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-navy-400 font-mono mt-0.5">
                  {formatFileSize(selectedFile.size)} &bull; Ready to index
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded text-navy-400 hover:text-navy-700 hover:bg-warm-100 transition-colors"
              aria-label="Remove selected file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-emerald-700">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              PDF format verified
            </span>
            <span className="text-navy-400 font-mono text-[11px]">Local client staging</span>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Format Selector */}
      {selectedFile && (
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-navy-900">
            Select Initial Summary Target
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUMMARY_FORMATS.map((fmt) => (
              <label
                key={fmt.id}
                className={`flex items-start gap-2.5 p-3 rounded-md border text-left cursor-pointer transition-colors ${
                  selectedFormat === fmt.id
                    ? 'border-navy-900 bg-warm-50 shadow-subtle'
                    : 'border-surface-border hover:border-navy-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="summaryFormat"
                  value={fmt.id}
                  checked={selectedFormat === fmt.id}
                  onChange={() => setSelectedFormat(fmt.id)}
                  className="mt-0.5 text-navy-900 focus:ring-accent-600"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-navy-900">{fmt.label}</span>
                    <span className="text-[10px] bg-warm-200 text-navy-600 px-1.5 py-0.2 rounded font-mono">
                      {fmt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5 line-clamp-2">{fmt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!selectedFile || isProcessing}
          isLoading={isProcessing}
        >
          {isProcessing ? 'Staging Document...' : 'Stage Document to Workspace'}
        </Button>
      </div>
    </form>
  );
};

export default UploadDropzone;
