import React, { useState, useEffect, useCallback } from 'react';
import {
  Copy,
  Download,
  RotateCw,
  ListOrdered,
  Layers,
  MessageSquare,
  Check,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Tabs from '../common/Tabs.jsx';
import Button from '../common/Button.jsx';
import ChatPanel from './ChatPanel.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { documentService } from '../../services/documentService.js';

export const DocumentSummary = ({ document }) => {
  const [activeTab, setActiveTab] = useState('executive');
  const [summaryMode, setSummaryMode] = useState('medium'); // 'short' | 'medium' | 'detailed'
  const [expandedSection, setExpandedSection] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { addToast, updateDocumentSummary } = useUI();

  // Load existing summary from server if not already in document object
  const loadExistingSummary = useCallback(async () => {
    if (!document?.id) return;
    try {
      const response = await documentService.getSummary(document.id, summaryMode);
      if (response?.data?.summary) {
        updateDocumentSummary(document.id, response.data.summary);
      }
    } catch {
      // Ignore 404 if summary hasn't been generated yet
    }
  }, [document?.id, summaryMode, updateDocumentSummary]);

  useEffect(() => {
    if (document?.id && !document.executiveSummary) {
      loadExistingSummary();
    }
  }, [document?.id, document?.executiveSummary, loadExistingSummary]);

  const handleGenerateSummary = async (targetMode = summaryMode) => {
    if (!document?.id || isGenerating) return;
    setIsGenerating(true);
    setApiError(null);

    try {
      const response = await documentService.generateSummary(document.id, targetMode);
      const summaryData = response?.data?.summary;
      if (summaryData) {
        updateDocumentSummary(document.id, summaryData);
        addToast(`AI summary (${targetMode}) generated successfully`, 'success');
      }
    } catch (err) {
      const msg =
        err.message ||
        'Failed to generate summary. Please ensure GEMINI_API_KEY is configured on the server.';
      setApiError(msg);
      addToast(msg, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModeChange = (newMode) => {
    setSummaryMode(newMode);
    handleGenerateSummary(newMode);
  };

  const tabs = [
    { id: 'executive', label: 'Executive Brief', icon: Sparkles },
    { id: 'takeaways', label: 'Key Takeaways', icon: ListOrdered },
    { id: 'sections', label: 'Section Analysis', icon: Layers },
    {
      id: 'chat',
      label: 'Document Chat',
      icon: MessageSquare,
      badge: document?.chatHistory?.length || 0
    }
  ];

  const handleCopy = () => {
    if (!document) return;
    const takeawaysText = (document.keyTakeaways || [])
      .map((t, i) => `${i + 1}. ${t.title}: ${t.desc}`)
      .join('\n');
    const textToCopy = `PRANPAN Summary: ${document.title}\n\nExecutive Summary:\n${document.executiveSummary || 'No summary available.'}\n\nKey Takeaways:\n${takeawaysText}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast('Summary text copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!document) return;
    const takeawaysMd = (document.keyTakeaways || [])
      .map((t, i) => `### ${i + 1}. ${t.title}\n${t.desc}\n`)
      .join('\n');
    const sectionsMd = (document.sections || [])
      .map((s) => `### ${s.title} (${s.pages || 'N/A'})\n${s.content}\n`)
      .join('\n');

    const markdownContent = `# ${document.title}\n\n*Original File: ${document.fileName} | Pages: ${document.pageCount} | Reading Time: ${document.readingTime}*\n\n## Executive Summary\n\n${document.executiveSummary || 'N/A'}\n\n## Key Takeaways\n\n${takeawaysMd || 'None listed.'}\n\n## Section Breakdown\n\n${sectionsMd || 'None listed.'}\n\n---\n*Synthesized via PRANPAN & Google Gemini*`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title.toLowerCase().replace(/\s+/g, '_')}_summary.md`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Summary exported as Markdown file', 'success');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-card border border-surface-border shadow-card overflow-hidden">
      {/* Live AI Engine Status Header */}
      <div className="px-5 py-2 bg-warm-50 border-b border-surface-border flex items-center justify-between text-xs text-navy-600">
        <span className="flex items-center gap-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-accent-600" />
          <span>Google Gemini Document Intelligence</span>
        </span>
        <div className="flex items-center gap-2">
          {/* Depth Selector */}
          <div className="flex items-center bg-white border border-surface-border rounded p-0.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleModeChange('short')}
              className={`px-2 py-0.5 rounded transition-colors ${
                summaryMode === 'short'
                  ? 'bg-navy-900 text-white font-semibold'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Short
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('medium')}
              className={`px-2 py-0.5 rounded transition-colors ${
                summaryMode === 'medium'
                  ? 'bg-navy-900 text-white font-semibold'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('detailed')}
              className={`px-2 py-0.5 rounded transition-colors ${
                summaryMode === 'detailed'
                  ? 'bg-navy-900 text-white font-semibold'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="px-5 py-3.5 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <h3 className="text-base font-serif font-bold text-navy-900 tracking-tight">
            AI Synthesis & Insights
          </h3>
          <p className="text-xs text-navy-500 font-mono mt-0.5 flex items-center gap-2">
            <span>{document?.readingTime}</span>
            <span>&bull;</span>
            <span>{document?.wordCount ? `~${document.wordCount} words extracted` : 'Structural pages ready'}</span>
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={copied ? Check : Copy}
            className={copied ? 'text-emerald-700 border-emerald-300' : ''}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownload} icon={Download}>
            Export .MD
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGenerateSummary(summaryMode)}
            disabled={isGenerating}
            isLoading={isGenerating}
            icon={RotateCw}
            className="hover:border-navy-900"
          >
            {isGenerating ? 'Synthesizing...' : 'Regenerate'}
          </Button>
        </div>
      </div>

      {/* API Notice / Error if Gemini is unconfigured */}
      {apiError && (
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Gemini Configuration Notice</span>
            <span className="text-[11px] leading-relaxed">
              {apiError}. To enable live AI synthesis, set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">server/.env</code>.
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 bg-white">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        {/* Loading overlay during generation */}
        {isGenerating ? (
          <div className="text-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent-600 mx-auto" />
            <h4 className="text-sm font-serif font-bold text-navy-900">
              Generating Gemini AI Summary ({summaryMode})...
            </h4>
            <p className="text-xs text-navy-500 max-w-sm mx-auto">
              Analyzing document hierarchy, extracting key decision criteria, and synthesizing structural takeaways.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Executive Brief */}
            {activeTab === 'executive' && (
              <div className="space-y-6">
                {!document?.executiveSummary ? (
                  <div className="text-center py-12 border border-dashed border-surface-border rounded-md bg-warm-50/50 space-y-3">
                    <Sparkles className="w-6 h-6 text-accent-600 mx-auto" />
                    <p className="text-xs text-navy-600 font-medium">No executive brief generated yet</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleGenerateSummary('medium')}
                      isLoading={isGenerating}
                    >
                      Generate Executive Brief
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-700">
                        Core Synthesis
                      </h4>
                      <p className="text-sm font-serif leading-relaxed text-navy-800 text-justify whitespace-pre-wrap">
                        {document.executiveSummary}
                      </p>
                    </div>

                    <div className="p-4 rounded-md bg-warm-50 border border-warm-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-navy-900">
                        <Clock className="w-4 h-4 text-accent-600" />
                        <span>Reading Efficiency Metric</span>
                      </div>
                      <p className="text-xs text-navy-600 font-sans leading-relaxed">
                        Synthesizing this document reduces reading duration from approximately{' '}
                        <strong className="text-navy-900">{document.readingTime}</strong> down to{' '}
                        <strong className="text-navy-900">under 3 minutes</strong>, capturing critical findings.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2. Key Takeaways */}
            {activeTab === 'takeaways' && (
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-700 mb-2">
                  Curated Action Items & Findings
                </h4>
                {(!document?.keyTakeaways || document.keyTakeaways.length === 0) ? (
                  <div className="text-center py-12 border border-dashed border-surface-border rounded-md bg-warm-50/50 space-y-3">
                    <ListOrdered className="w-6 h-6 text-accent-600 mx-auto" />
                    <p className="text-xs text-navy-600 font-medium">No key takeaways generated yet</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleGenerateSummary('short')}
                      isLoading={isGenerating}
                    >
                      Generate Key Takeaways
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {document.keyTakeaways.map((takeaway, idx) => (
                      <div
                        key={takeaway.id || idx}
                        className="p-4 rounded-md border border-surface-border bg-warm-50/40 hover:bg-white hover:border-navy-300 transition-all shadow-subtle flex gap-3.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-navy-900 text-white text-[10px] font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="text-xs font-semibold text-navy-900 tracking-tight">
                            {takeaway.title}
                          </h5>
                          <p className="text-xs text-navy-600 mt-1 font-sans leading-relaxed">
                            {takeaway.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Section Analysis */}
            {activeTab === 'sections' && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-700 mb-2">
                  Deep-Dive Section Breakdown
                </h4>
                {(!document?.sections || document.sections.length === 0) ? (
                  <div className="text-center py-12 border border-dashed border-surface-border rounded-md bg-warm-50/50 space-y-3">
                    <Layers className="w-6 h-6 text-accent-600 mx-auto" />
                    <p className="text-xs text-navy-600 font-medium">No section analysis generated yet</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleGenerateSummary('detailed')}
                      isLoading={isGenerating}
                    >
                      Generate Detailed Sections
                    </Button>
                  </div>
                ) : (
                  document.sections.map((section, idx) => {
                    const isExpanded = expandedSection === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-md border border-surface-border bg-white overflow-hidden shadow-subtle"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedSection(isExpanded ? -1 : idx)}
                          className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-warm-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-semibold text-navy-900 truncate">
                              {section.title}
                            </span>
                            {section.pages && (
                              <span className="text-[10px] font-mono text-navy-400 bg-warm-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                {section.pages}
                              </span>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-navy-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-navy-400 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 py-3 border-t border-surface-border bg-warm-50/50 text-xs text-navy-700 leading-relaxed font-sans whitespace-pre-wrap">
                            {section.content}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 4. Chat with Document */}
            {activeTab === 'chat' && <ChatPanel document={document} />}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentSummary;
