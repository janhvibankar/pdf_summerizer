import React from 'react';
import Modal from '../common/Modal.jsx';
import UploadDropzone from './UploadDropzone.jsx';
import { useUI } from '../../context/UIContext.jsx';

export const UploadModal = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, addDocument } = useUI();

  const handleComplete = (newDoc) => {
    addDocument(newDoc);
    setIsUploadModalOpen(false);
  };

  return (
    <Modal
      isOpen={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
      title="Upload Document"
      subtitle="Select a PDF document to index and summarize"
      maxWidth="max-w-xl"
    >
      <UploadDropzone onComplete={handleComplete} onCancel={() => setIsUploadModalOpen(false)} />
    </Modal>
  );
};

export default UploadModal;
