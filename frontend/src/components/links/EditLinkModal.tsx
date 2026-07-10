import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Button } from '@ui/Button.js';
import { Input } from '@ui/Input.js';
import { Modal } from '@ui/Modal.js';
import { Link } from '../../types/index.js';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  link: Link | null;
}

// Zod Validation Schema
const editLinkSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(120, 'Title cannot exceed 120 characters'),
  originalUrl: z
    .string()
    .min(1, 'Original URL is required')
    .url('Invalid URL format')
    .regex(/^https?:\/\//, 'URL must start with http:// or https://'),
  customAlias: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || (val.length >= 3 && val.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(val)),
      {
        message: 'Alias must be 3-20 characters (alphanumeric, hyphens, underscores)',
      }
    ),
  expiresAt: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val) return true;
        // Strip out local timezone off dates when comparing
        return new Date(val) > new Date();
      },
      {
        message: 'Expiry date must be in the future',
      }
    ),
});

type EditLinkFormValues = z.infer<typeof editLinkSchema>;

export const EditLinkModal: React.FC<EditLinkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  link,
}) => {
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditLinkFormValues>({
    resolver: zodResolver(editLinkSchema),
    defaultValues: {
      title: '',
      originalUrl: '',
      customAlias: '',
      expiresAt: '',
    },
  });

  // Pre-fill form fields when the link object changes or is opened
  useEffect(() => {
    if (link && isOpen) {
      setValue('title', link.title || '');
      setValue('originalUrl', link.originalUrl);
      setValue('customAlias', link.customAlias || '');
      
      if (link.expiresAt) {
        // Convert ISO string to YYYY-MM-DDTHH:MM local format for datetime-local input field
        const dateObj = new Date(link.expiresAt);
        // Correct time offset offset for input display
        const tzOffset = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
        setValue('expiresAt', localISOTime);
      } else {
        setValue('expiresAt', '');
      }
    }
  }, [link, isOpen, setValue]);

  const onSubmit = async (values: EditLinkFormValues) => {
    if (!link) return;

    try {
      setApiError(null);
      
      const payload: Record<string, any> = {
        title: values.title,
        originalUrl: values.originalUrl,
        customAlias: values.customAlias || null,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
      };

      await api.put(`/api/links/${link.id}`, payload);

      showToast('Short URL updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update short link';
      setApiError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Short URL Metadata"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {apiError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-250 dark:border-red-900 rounded-lg text-xs font-semibold text-red-650 dark:text-red-400">
            {apiError}
          </div>
        )}

        <Input
          label="Title *"
          placeholder="e.g. Summer Promo Campaigns"
          error={errors.title?.message}
          disabled={isSubmitting}
          {...register('title')}
        />

        <Input
          label="Destination URL *"
          placeholder="e.g. https://mybusiness.com/deals/summer"
          error={errors.originalUrl?.message}
          disabled={isSubmitting}
          {...register('originalUrl')}
        />

        <Input
          label="Custom Alias (Optional)"
          placeholder="e.g. summer-deals (3-20 chars)"
          error={errors.customAlias?.message}
          disabled={isSubmitting}
          {...register('customAlias')}
        />

        <Input
          label="Expiry Date (Optional)"
          type="datetime-local"
          error={errors.expiresAt?.message}
          disabled={isSubmitting}
          {...register('expiresAt')}
        />
      </form>
    </Modal>
  );
};
export default EditLinkModal;
