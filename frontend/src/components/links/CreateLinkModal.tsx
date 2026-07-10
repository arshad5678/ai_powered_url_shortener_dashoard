import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Button } from '@ui/Button.js';
import { Input } from '@ui/Input.js';
import { Modal } from '@ui/Modal.js';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Zod Validation Schema
const createLinkSchema = z.object({
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
      (val) => !val || new Date(val) > new Date(),
      {
        message: 'Expiry date must be in the future',
      }
    ),
});

type CreateLinkFormValues = z.infer<typeof createLinkSchema>;

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLinkFormValues>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      title: '',
      originalUrl: '',
      customAlias: '',
      expiresAt: '',
    },
  });

  const onSubmit = async (values: CreateLinkFormValues) => {
    try {
      setApiError(null);
      
      // Clean request payload: remove empty strings for optional attributes
      const payload: Record<string, any> = {
        title: values.title,
        originalUrl: values.originalUrl,
      };
      
      if (values.customAlias) payload.customAlias = values.customAlias;
      if (values.expiresAt) payload.expiresAt = new Date(values.expiresAt).toISOString();

      await api.post('/api/links', payload);

      showToast('Short URL created successfully!', 'success');
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create short link';
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
      title="Create New Short URL"
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
            Create Link
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
export default CreateLinkModal;
