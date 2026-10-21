'use client';

import { useState } from 'react';
import { useOfferAttachments, OfferAttachment } from './useOfferAttachments';

export interface OfferFormValues {
  title: string;
  description: string;
  category: string;
  budget: string;
  currency: string;
  deadline: string;
}

export interface OfferFormProps {
  initialValues?: Partial<OfferFormValues>;
  initialAttachments?: OfferAttachment[];
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (values: OfferFormValues, files: File[]) => Promise<void> | void;
  onCancel?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'content', label: 'Content' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD'];

const DEFAULT_VALUES: OfferFormValues = {
  title: '',
  description: '',
  category: 'design',
  budget: '',
  currency: 'USD',
  deadline: '',
};

export function OfferForm({
  initialValues,
  initialAttachments,
  mode,
  isSubmitting = false,
  submitError = null,
  onSubmit,
  onCancel,
}: OfferFormProps) {
  const [values, setValues] = useState<OfferFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const { attachments, newFiles, addFiles, removeAttachment } = useOfferAttachments({
    initialAttachments,
    onError: (err) => setValidationError(err),
  });

  const update = (key: keyof OfferFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!values.title.trim()) {
      setValidationError('Title is required.');
      return;
    }
    if (!values.description.trim()) {
      setValidationError('Description is required.');
      return;
    }
    if (!values.budget || Number.isNaN(Number(values.budget)) || Number(values.budget) <= 0) {
      setValidationError('Budget must be a positive number.');
      return;
    }

    await onSubmit(values, newFiles);
  };

  const displayError = validationError ?? submitError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {displayError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {displayError}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Offer Details</h2>
        <div>
          <label htmlFor="offer-title" className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="offer-title"
            type="text"
            value={values.title}
            onChange={update('title')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="E.g. Brand redesign for new product line"
          />
        </div>
        <div>
          <label htmlFor="offer-description" className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="offer-description"
            value={values.description}
            onChange={update('description')}
            rows={5}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Describe the scope, deliverables, and expectations..."
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="offer-category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="offer-category"
              value={values.category}
              onChange={update('category')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="offer-deadline" className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              id="offer-deadline"
              type="date"
              value={values.deadline}
              onChange={update('deadline')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="offer-budget" className="block text-sm font-medium text-gray-700">
              Budget <span className="text-red-500">*</span>
            </label>
            <input
              id="offer-budget"
              type="number"
              min="0"
              step="0.01"
              value={values.budget}
              onChange={update('budget')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label htmlFor="offer-currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              id="offer-currency"
              value={values.currency}
              onChange={update('currency')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {CURRENCY_OPTIONS.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
        <input
          type="file"
          multiple
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          } }
          className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
        {attachments.length > 0 && (
          <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
            {attachments.map((att) => (
              <li key={att.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="truncate text-sm text-gray-800">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Offer' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
