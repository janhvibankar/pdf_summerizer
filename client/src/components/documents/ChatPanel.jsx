import React, { useState } from 'react';
import { Send, Sparkles, Bot, User, ShieldAlert } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import Button from '../common/Button.jsx';

export const ChatPanel = ({ document }) => {
  const [input, setInput] = useState('');
  const { addChatMessage } = useUI();

  const suggestedQuestions = [
    'What are the primary operational risks identified?',
    'Summarize the core quantitative takeaways.',
    'What policy or regulatory recommendations are made?'
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !document) return;

    addChatMessage(document.id, input.trim(), 'user');
    setInput('');
  };

  const handleSuggestionClick = (question) => {
    if (!document) return;
    addChatMessage(document.id, question, 'user');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-b-card">
      {/* Design preview notice */}
      <div className="p-3 bg-warm-50 border-b border-surface-border flex items-start gap-2 text-xs text-navy-600">
        <ShieldAlert className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <span className="font-semibold text-navy-800">Design Preview:</span> Interactive chat UI
          prototype. Live multi-turn Q&A grounded in document text with Gemini will connect in
          subsequent phases.
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="px-5 py-3 border-b border-surface-border bg-warm-50/50">
        <p className="text-[11px] font-mono uppercase tracking-wider text-navy-500 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent-600" />
          Suggested Inquiries
        </p>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(q)}
              className="text-left text-[11px] px-2.5 py-1 rounded bg-white border border-surface-border text-navy-700 hover:border-navy-400 hover:text-navy-900 transition-colors shadow-subtle"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[380px]">
        {!document?.chatHistory || document.chatHistory.length === 0 ? (
          <div className="text-center py-8 text-navy-400 text-xs">
            <Bot className="w-6 h-6 mx-auto mb-2 text-navy-300" />
            <p className="font-medium text-navy-600">No questions asked yet.</p>
            <p className="text-[11px] mt-1">
              Select a suggested inquiry above or enter a question about this document.
            </p>
          </div>
        ) : (
          document.chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded bg-navy-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-warm-100" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-md px-3.5 py-2.5 leading-relaxed font-sans ${
                  msg.sender === 'user'
                    ? 'bg-navy-900 text-white'
                    : 'bg-warm-50 border border-surface-border text-navy-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`mt-1 text-[10px] font-mono ${
                    msg.sender === 'user' ? 'text-navy-300 text-right' : 'text-navy-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded bg-accent-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-surface-border bg-white flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question regarding this document..."
          className="flex-1 rounded-md border border-surface-border bg-white px-3.5 py-2 text-xs text-navy-900 placeholder:text-navy-400 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900"
        />
        <Button type="submit" variant="primary" size="sm" disabled={!input.trim()} icon={Send}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel;
