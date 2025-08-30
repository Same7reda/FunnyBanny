import React from 'react';
import Modal from './Modal';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  type: 'success' | 'error';
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, title, message, type }) => {
  if (!isOpen) return null;

  const iconClass = type === 'success' ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-solid fa-circle-xmark text-rose-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start gap-4">
        <div className="text-3xl">
            <i className={iconClass}></i>
        </div>
        <div className="text-gray-700 flex-1">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
      </div>
      <div className="flex justify-end pt-6">
        <button
          onClick={onClose}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
        >
          إغلاق
        </button>
      </div>
    </Modal>
  );
};

export default AlertModal;