import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles, Bot, User, Bookmark, Loader2 } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import Button from '../common/Button.jsx';
import { documentService } from '../../services/documentService.js';

export const ChatPanel = ({ document }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const { addToast } = useUI();

  const suggestedQuestions = [
    'What are the primary operational risks identified?',
    'Summarize the core quantitative takeaways.',
    'What policy or regulatory recommendations are made?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  // Load chat history from server on mount
  const loadChatHistory = useCallback(async () => {
    if (!document?.id) return;
    try {
      const response = await documentService.getChatHistory(document.id);
      const history = response?.data?.messages || [];
      if (history.length > 0) {
        setChatMessages(
          history.map((m) => ({
            id: m.id || m._id || 'msg-' + Date.now(),
            sender: m.role === 'model' || m.role === 'assistant' || m.sender === 'ai' ? 'ai' : 'user',
            text: m.content || m.text,
            pageReferences: m.pageReferences || [],
            timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        );
      } else if (document.chatHistory && document.chatHistory.length > 0) {
        setChatMessages(document.chatHistory);
      }
    } catch {
      if (document.chatHistory && document.chatHistory.length > 0) {
        setChatMessages(document.chatHistory);
      }
    }
  }, [document?.id, document?.chatHistory]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const executeQuestion = async (questionText) => {
    if (!questionText.trim() || !document?.id || isLoading) return;

    const userMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await documentService.sendChatMessage(document.id, questionText.trim());
      const answerData = response?.data;

      const aiMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: answerData?.answer || 'Response generated from document context.',
        pageReferences: answerData?.pageReferences || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMsg =
        err.message ||
        'Failed to query document. Ensure GEMINI_API_KEY is configured on the backend server.';

      const errorMessage = {
        id: 'err-' + Date.now(),
        sender: 'ai',
        text: `Error: ${errorMsg}\n\nPlease check server/.env to ensure GEMINI_API_KEY is defined.`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, errorMessage]);
      addToast('Document inquiry failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    executeQuestion(input);
  };

  const handleSuggestionClick = (question) => {
    executeQuestion(question);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-b-card">
      {/* Grounded RAG Header notice */}
      <div className="p-3 bg-warm-50 border-b border-surface-border flex items-start gap-2 text-xs text-navy-600">
        <Sparkles className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <span className="font-semibold text-navy-800">Grounded Intelligence:</span> Inquiries are
          retrieved via structural keyword relevance across document pages and answered by Gemini with strict factual citations.
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
              disabled={isLoading}
              onClick={() => handleSuggestionClick(q)}
              className="text-left text-[11px] px-2.5 py-1 rounded bg-white border border-surface-border text-navy-700 hover:border-navy-400 hover:text-navy-900 transition-colors shadow-subtle disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[380px]">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8 text-navy-400 text-xs">
            <Bot className="w-6 h-6 mx-auto mb-2 text-navy-300" />
            <p className="font-medium text-navy-600">No questions asked yet.</p>
            <p className="text-[11px] mt-1">
              Select a suggested inquiry above or enter a question about this document.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.isError ? 'bg-rose-600 text-white' : 'bg-navy-900 text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-warm-100" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-md px-3.5 py-2.5 leading-relaxed font-sans ${
                  msg.sender === 'user'
                    ? 'bg-navy-900 text-white'
                    : msg.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-warm-50 border border-surface-border text-navy-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Page citations if available */}
                {msg.pageReferences && msg.pageReferences.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-surface-border/60 flex flex-wrap items-center gap-1 text-[10px] font-mono text-navy-600">
                    <Bookmark className="w-3 h-3 text-accent-600 inline mr-0.5" />
                    <span>Citations:</span>
                    {msg.pageReferences.map((page) => (
                      <span
                        key={page}
                        className="px-1.5 py-0.2 rounded bg-warm-200 text-navy-800 font-semibold"
                      >
                        Page {page}
                      </span>
                    ))}
                  </div>
                )}

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

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 text-xs justify-start items-center">
            <div className="w-6 h-6 rounded bg-navy-900 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-warm-100" />
            </div>
            <div className="rounded-md px-3.5 py-2 bg-warm-50 border border-surface-border text-navy-700 flex items-center gap-2 font-mono text-[11px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-600" />
              <span>Retrieving pages and analyzing with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
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
          disabled={isLoading}
          className="flex-1 rounded-md border border-surface-border bg-white px-3.5 py-2 text-xs text-navy-900 placeholder:text-navy-400 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 disabled:opacity-50"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!input.trim() || isLoading}
          isLoading={isLoading}
          icon={Send}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel;
