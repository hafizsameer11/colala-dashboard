import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectOnboardingField } from '../utils/mutations/sellers';
import type { OnboardingFieldKey } from '../constants/onboardingFields';
import { ONBOARDING_FIELDS, getFieldsByLevel } from '../constants/onboardingFields';

interface RejectFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: number | string;
  level: 1 | 2 | 3;
  onSuccess?: () => void;
  preselectedField?: OnboardingFieldKey;
}

const RejectFieldModal: React.FC<RejectFieldModalProps> = ({
  isOpen,
  onClose,
  storeId,
  level,
  onSuccess,
  preselectedField,
}) => {
  const [selectedField, setSelectedField] = useState<OnboardingFieldKey | ''>(preselectedField || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const fieldsForLevel = getFieldsByLevel(level);

  // Update selected field when preselectedField changes
  React.useEffect(() => {
    if (preselectedField && isOpen) {
      setSelectedField(preselectedField);
    }
  }, [preselectedField, isOpen]);

  const rejectMutation = useMutation({
    mutationFn: ({ fieldKey, reason }: { fieldKey: OnboardingFieldKey; reason: string }) =>
      rejectOnboardingField(storeId, fieldKey, reason),
    onSuccess: () => {
      // Invalidate queries to refresh store details
      queryClient.invalidateQueries({ queryKey: ['adminStoreDetails', storeId] });
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      
      // Reset form
      setSelectedField('');
      setRejectionReason('');
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    },
    onError: (error: any) => {
      console.error('Error rejecting field:', error);
      alert(error?.response?.data?.message || 'Failed to reject field. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!selectedField) {
      alert('Please select a field to reject');
      return;
    }

    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (rejectionReason.trim().length > 1000) {
      alert('Rejection reason must be 1000 characters or less');
      return;
    }

    rejectMutation.mutate({
      fieldKey: selectedField as OnboardingFieldKey,
      reason: rejectionReason.trim(),
    });
  };

  const handleClose = () => {
    setSelectedField(preselectedField || '');
    setRejectionReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Reject Onboarding Field</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Field Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Field to Reject <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value as OnboardingFieldKey | '')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
            >
              <option value="">-- Select Field --</option>
              {fieldsForLevel.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label} - {field.description}
                </option>
              ))}
            </select>
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection (max 1000 characters)..."
              rows={5}
              maxLength={1000}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Provide clear feedback so the seller knows what to fix
              </p>
              <p className="text-xs text-gray-500">
                {rejectionReason.length}/1000
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> When a field is rejected, the seller must re-upload or correct it before proceeding. The rejection will be automatically cleared when they re-submit.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            disabled={rejectMutation.isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#E53E3E] text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={rejectMutation.isPending || !selectedField || !rejectionReason.trim()}
          >
            {rejectMutation.isPending ? 'Rejecting...' : 'Reject Field'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectFieldModal;

