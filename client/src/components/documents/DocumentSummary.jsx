import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';
import Tabs from '../common/Tabs.jsx';
import Button from '../common/Button.jsx';
import ChatPanel from './ChatPanel.jsx';
import { useUI } from '../../context/UIContext.jsx';

export const DocumentSummary = ({ document }) => {
  const [activeTab, setActiveTab] = useState('executive');
  const [expandedSection, setExpandedSection] = useState(0);
  const [copied, setCopied] = useState(false);
  const { addToast } = useUI();

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
    const textToCopy = `PRANPAN Summary: ${document.title}\n\nExecutive Summary:\n${document.executiveSummary}\n\nKey Takeaways:\n${document.keyTakeaways.map((t, i) => `${i + 1}. ${t.title}: ${t.desc}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast('Summary text copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!document) return;
    const markdownContent = `# ${document.title}\n\n*Original File: ${document.fileName} | Pages: ${document.pageCount} | Reading Time: ${document.readingTime}*\n\n## Executive Summary\n\n${document.executiveSummary}\n\n## Key Takeaways\n\n${document.keyTakeaways.map((t, i) => `### ${i + 1}. ${t.title}\n${t.desc}\n`).join('\n')}\n\n---\n*Synthesized via PRANPAN Editorial Document Assistant*`;
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
      {/* Design preview warning banner */}
      <div className="px-5 py-2.5 bg-warm-50 border-b border-surface-border flex items-center justify-between text-xs text-navy-600">
        <span className="flex items-center gap-2 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-accent-600" />
          <span>Design preview &mdash; sample content</span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-navy-400">
          Model: Gemini 1.5 Flash (Reserve)
        </span>
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
            <span>Est. 340 words</span>
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

          {/* Visibly unavailable Regenerate button */}
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              disabled
              icon={RotateCw}
              className="opacity-50 cursor-not-allowed bg-warm-50 text-navy-400"
            >
              Regenerate
            </Button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-30 whitespace-nowrap rounded bg-navy-900 text-white text-[10px] px-2 py-1 shadow-card font-mono">
              Available after AI integration
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 bg-white">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        {/* 1. Executive Brief */}
        {activeTab === 'executive' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-700">
                Core Synthesis
              </h4>
              <p className="text-sm font-serif leading-relaxed text-navy-800 text-justify">
                {document?.executiveSummary}
              </p>
            </div>

            <div className="p-4 rounded-md bg-warm-50 border border-warm-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-navy-900">
                <Clock className="w-4 h-4 text-accent-600" />
                <span>Reading Efficiency Metric</span>
              </div>
              <p className="text-xs text-navy-600 font-sans leading-relaxed">
                Reviewing this executive brief reduces document triage duration from approximately{' '}
                <strong className="text-navy-900">95 minutes</strong> down to{' '}
                <strong className="text-navy-900">5 minutes</strong>, covering 88% of core decision
                criteria.
              </p>
            </div>
          </div>
        )}

        {/* 2. Key Takeaways */}
        {activeTab === 'takeaways' && (
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-700 mb-2">
              Curated Action Items & Findings
            </h4>
            <div className="space-y-3">
              {document?.keyTakeaways?.map((takeaway, idx) => (
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
          </div>
        )}

        {/* 3. Section Analysis */}
        {activeTab === 'sections' && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-700 mb-2">
              Deep-Dive Section Breakdown
            </h4>
            {document?.sections?.map((section, idx) => {
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
                      <span className="text-[10px] font-mono text-navy-400 bg-warm-100 px-1.5 py-0.5 rounded flex-shrink-0">
                        {section.pages}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-navy-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-navy-400 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 py-3 border-t border-surface-border bg-warm-50/50 text-xs text-navy-700 leading-relaxed font-sans">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Chat with Document */}
        {activeTab === 'chat' && <ChatPanel document={document} />}
      </div>
    </div>
  );
};

export default DocumentSummary;
