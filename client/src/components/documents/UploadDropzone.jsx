import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, ShieldCheck, Loader2 } from 'lucide-react';
import Button from '../common/Button.jsx';
import { documentService } from '../../services/documentService.js';

export const SUMMARY_OPTIONS = [
  {
    id: 'medium',
    label: 'Executive Brief',
    description: 'High-level synthesis, strategic takeaways, and decision-maker impact.',
    badge: 'Recommended'
  },
  {
    id: 'short',
    label: 'Concise Overview',
    description: 'Quick bulleted summary highlighting core facts and action items.',
    badge: 'Fast'
  },
  {
    id: 'detailed',
    label: 'Deep Analytical',
    description: 'Comprehensive section-by-section breakdown and quantitative findings.',
    badge: 'In-Depth'
  }
];

export const UploadDropzone = ({ onComplete, onCancel }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
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
    setUploadProgress(0);
    setStatusMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setUploadProgress(10);
    setStatusMessage('Transferring PDF document to server...');

    try {
      const response = await documentService.uploadDocument(selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 75) / progressEvent.total);
          setUploadProgress(Math.max(15, percent));
        }
      });

      setStatusMessage('Extracting document pages and validating structure...');
      setUploadProgress(90);

      const uploadedDoc = response?.data?.document;
      if (!uploadedDoc) {
        throw new Error('Upload succeeded but no document record was returned by the server.');
      }

      setUploadProgress(100);
      setStatusMessage('Document indexed successfully.');

      if (onComplete) {
        onComplete({
          ...uploadedDoc,
          preferredFormat: selectedFormat
        });
      }
    } catch (err) {
      const errMsg =
        err.message ||
        err.details ||
        'Failed to process document. Please check your network or try again.';
      setError(errMsg);
      setUploadProgress(0);
      setStatusMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleUploadSubmit} className="space-y-5">
      {/* Scope / Security Banner */}
      <div className="p-3 rounded-md bg-warm-50 border border-warm-200 text-xs text-navy-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <span className="font-semibold text-navy-800">Secure Ingestion:</span> Documents are
          verified via PDF signature bytes, stored privately, and extracted with full page
          preservation. OCR is not supported for scanned images.
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
                  {formatFileSize(selectedFile.size)} &bull; Ready to ingest
                </p>
              </div>
            </div>
            {!isProcessing && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded text-navy-400 hover:text-navy-700 hover:bg-warm-100 transition-colors"
                aria-label="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload & Ingestion Progress */}
          {isProcessing ? (
            <div className="mt-4 pt-3 border-t border-surface-border space-y-2">
              <div className="flex items-center justify-between text-xs text-navy-700 font-mono">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-600" />
                  {statusMessage || 'Processing...'}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-warm-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-accent-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-emerald-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                PDF format checked
              </span>
              <span className="text-navy-400 font-mono text-[11px]">Ready for extraction</span>
            </div>
          )}
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Upload Failed</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Summary Format Selector */}
      {selectedFile && !isProcessing && (
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-navy-900">
            Select Initial Summary Target
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SUMMARY_OPTIONS.map((fmt) => (
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
          {isProcessing ? 'Ingesting PDF...' : 'Upload & Ingest PDF'}
        </Button>
      </div>
    </form>
  );
};

export default UploadDropzone;
