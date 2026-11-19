import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { MOCK_DOCUMENTS, SUMMARY_FORMATS } from '../utils/mockDocuments.js';
import { useAuth } from './AuthContext.jsx';
import { documentService } from '../services/documentService.js';

const UIContext = createContext(null);

export function normalizeDocument(doc) {
  if (!doc) return null;
  const id = doc.id || doc._id?.toString() || `doc-${Date.now()}`;
  const title = doc.displayName || doc.title || doc.originalName || 'Untitled Document';
  const fileName = doc.originalName || doc.fileName || 'document.pdf';
  const fileSize =
    doc.fileSizeFormatted ||
    (typeof doc.fileSize === 'number'
      ? `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB`
      : doc.fileSize || '1.0 MB');
  const pageCount = doc.pageCount || (doc.pages ? doc.pages.length : 1);
  const readingTime =
    doc.readingTimeFormatted ||
    (doc.readingTimeMin ? `${doc.readingTimeMin} min read` : doc.readingTime || '2 min read');

  return {
    ...doc,
    id,
    title,
    fileName,
    fileSize,
    pageCount,
    readingTime,
    wordCount: doc.wordCount || 0,
    characterCount: doc.characterCount || 0,
    category: doc.category || 'Uploaded',
    uploadedAt: doc.createdAt || doc.uploadedAt || new Date().toISOString(),
    status: doc.processingStatus || doc.status || 'completed',
    executiveSummary: doc.executiveSummary || '',
    keyTakeaways: doc.keyTakeaways || [],
    sections: doc.sections || [],
    chatHistory: doc.chatHistory || [],
    pages: doc.pages || []
  };
}

export const UIProvider = ({ children }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState(() => (user ? [] : MOCK_DOCUMENTS.map(normalizeDocument)));
  const [selectedDocumentId, setSelectedDocumentId] = useState(() => (user ? null : MOCK_DOCUMENTS[0]?.id));
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'takeaways' | 'sections' | 'chat'
  const [activeFormat, setActiveFormat] = useState(SUMMARY_FORMATS[0].id);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast management
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch real documents from backend whenever authenticated user is active
  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setIsLoadingDocuments(true);
    try {
      const response = await documentService.getDocuments();
      const serverDocs = response?.data?.documents || [];
      if (serverDocs.length > 0) {
        const normalized = serverDocs.map(normalizeDocument);
        setDocuments(normalized);
        setSelectedDocumentId((prevId) => {
          const exists = normalized.some((d) => d.id === prevId);
          return exists ? prevId : normalized[0].id;
        });
      } else {
        // If user is authenticated but has no server documents yet, keep empty or clear mock
        setDocuments([]);
        setSelectedDocumentId(null);
      }
    } catch {
      // If server or database is unreachable, preserve existing state gracefully
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    } else {
      setDocuments(MOCK_DOCUMENTS.map(normalizeDocument));
      setSelectedDocumentId(MOCK_DOCUMENTS[0]?.id || null);
    }
  }, [user, fetchDocuments]);

  // Selected document helper
  const selectedDocument = useMemo(() => {
    return documents.find((doc) => doc.id === selectedDocumentId) || documents[0] || null;
  }, [documents, selectedDocumentId]);

  // Document actions
  const addDocument = useCallback((rawDoc) => {
    const newDoc = normalizeDocument(rawDoc);
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    setSelectedDocumentId(newDoc.id);
    addToast(`"${newDoc.title}" ingested successfully`, 'success');
  }, [addToast]);

  const deleteDocument = useCallback(async (id) => {
    const docToDelete = documents.find((d) => d.id === id);
    try {
      await documentService.deleteDocument(id);
    } catch {
      // Even if server call fails (e.g. offline mock doc), proceed with client update
    }

    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDocumentId === id) {
      const remaining = documents.filter((d) => d.id !== id);
      setSelectedDocumentId(remaining.length > 0 ? remaining[0].id : null);
    }

    addToast(`"${docToDelete?.title || 'Document'}" removed from library`, 'neutral');
  }, [documents, selectedDocumentId, addToast]);

  const updateDocumentSummary = useCallback((documentId, summaryData) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          return {
            ...doc,
            executiveSummary: summaryData.executiveSummary || doc.executiveSummary,
            keyTakeaways: summaryData.keyTakeaways || doc.keyTakeaways,
            sections: summaryData.sections || doc.sections,
            summaryContent: summaryData.summaryContent || doc.summaryContent,
            summaryType: summaryData.summaryType || doc.summaryType
          };
        }
        return doc;
      })
    );
  }, []);

  // Chat message management
  const addChatMessage = useCallback((documentId, text, sender = 'user', pageReferences = []) => {
    const newMsg = {
      id: 'c-' + Date.now(),
      sender,
      text,
      pageReferences,
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

    return newMsg;
  }, []);

  const value = {
    documents,
    selectedDocument,
    selectedDocumentId,
    setSelectedDocumentId,
    isLoadingDocuments,
    fetchDocuments,
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
    updateDocumentSummary,
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
