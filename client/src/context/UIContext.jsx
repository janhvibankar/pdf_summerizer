import React, { createContext, useContext, useState, useMemo } from 'react';
import { MOCK_DOCUMENTS, SUMMARY_FORMATS } from '../utils/mockDocuments.js';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [selectedDocumentId, setSelectedDocumentId] = useState(MOCK_DOCUMENTS[0].id);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'takeaways' | 'sections' | 'chat'
  const [activeFormat, setActiveFormat] = useState(SUMMARY_FORMATS[0].id);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast management
  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Selected document helper
  const selectedDocument = useMemo(() => {
    return documents.find((doc) => doc.id === selectedDocumentId) || documents[0] || null;
  }, [documents, selectedDocumentId]);

  // Document actions
  const addDocument = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocumentId(newDoc.id);
    addToast(`"${newDoc.title}" uploaded successfully`, 'success');
  };

  const deleteDocument = (id) => {
    const docToDelete = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));

    if (selectedDocumentId === id) {
      const remaining = documents.filter((d) => d.id !== id);
      setSelectedDocumentId(remaining.length > 0 ? remaining[0].id : null);
    }

    addToast(`"${docToDelete?.title || 'Document'}" removed from library`, 'neutral');
  };

  // Chat message management
  const addChatMessage = (documentId, text, sender = 'user') => {
    const newMsg = {
      id: 'c-' + Date.now(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          return {
            ...doc,
            chatHistory: [...(doc.chatHistory || []), newMsg]
          };
        }
        return doc;
      })
    );

    // If user message, simulate intelligent assistant response after brief pause for realistic UX
    if (sender === 'user') {
      setTimeout(() => {
        const aiResponse = {
          id: 'c-ai-' + Date.now(),
          sender: 'ai',
          text: `Based on "${selectedDocument?.title || 'the document'}", this query references key sections. Key findings indicate that implementation parameters and risk vectors discussed in the primary text are directly aligned with your query. Further quantitative metrics are available in the section analysis tab.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setDocuments((prev) =>
          prev.map((doc) => {
            if (doc.id === documentId) {
              return {
                ...doc,
                chatHistory: [...(doc.chatHistory || []), aiResponse]
              };
            }
            return doc;
          })
        );
      }, 750);
    }
  };

  const value = {
    documents,
    selectedDocument,
    selectedDocumentId,
    setSelectedDocumentId,
    activeTab,
    setActiveTab,
    activeFormat,
    setActiveFormat,
    isUploadModalOpen,
    setIsUploadModalOpen,
    toasts,
    addToast,
    removeToast,
    addDocument,
    deleteDocument,
    addChatMessage
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export default UIContext;

