import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Button } from '@ui/Button.js';
import { Modal } from '@ui/Modal.js';
import { Link } from '../../types/index.js';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  link: Link | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  link,
}) => {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!link) return;

    try {
      setIsDeleting(true);
      await api.delete(`/api/links/${link.id}`);
      showToast('Short URL deleted successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete short link';
      showToast(errMsg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Short URL"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Link
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-lg shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            Are you sure you want to delete this link?
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This will soft-delete <strong className="text-slate-700 dark:text-slate-300 font-semibold">"{link?.title}"</strong> ({link?.shortCode}). Users visiting this short code will receive a 404 page, and click statistics will no longer accumulate. This action is irreversible.
          </span>
        </div>
      </div>
    </Modal>
  );
};
export default DeleteConfirmModal;
