import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountOfficers } from '../../../utils/queries/accountOfficer';
import { assignAccountOfficerToStore } from '../../../utils/mutations/sellers';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../contexts/ToastContext';
import images from '../../../constants/images';

interface AssignAccountOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeIds: (string | number)[]; // Array of store IDs for bulk assignment
  storeNames?: string[]; // Optional store names for display
}

const AssignAccountOfficerModal: React.FC<AssignAccountOfficerModalProps> = ({
  isOpen,
  onClose,
  storeIds,
  storeNames = [],
}) => {
  const queryClient = useQueryClient();
  const { hasPermission, hasRole } = usePermissions();
  const { showToast } = useToast();
  // Account officers should NEVER be able to assign account officers, even if they have the permission
  const canAssignAccountOfficer = hasPermission('sellers.assign_account_officer') && !hasRole('account_officer');
  
  const [selectedOfficerId, setSelectedOfficerId] = useState<number | null>(null);

  // Fetch account officers
  const { data: accountOfficersData, isLoading: isLoadingOfficers } = useQuery({
    queryKey: ['accountOfficers'],
    queryFn: getAccountOfficers,
    enabled: isOpen && canAssignAccountOfficer,
  });

  const accountOfficers = accountOfficersData?.data || [];

  // Bulk assignment mutation
  const assignMutation = useMutation({
    mutationFn: async ({ storeIds, accountOfficerId }: { storeIds: (string | number)[]; accountOfficerId: number | null }) => {
      // Assign to all stores in parallel
      const promises = storeIds.map(storeId => 
        assignAccountOfficerToStore(storeId, accountOfficerId)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      const count = storeIds.length;
      showToast(
        count === 1 
          ? 'Account Officer assigned successfully!' 
          : `Account Officer assigned to ${count} stores successfully!`,
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['sellerUsers'] });
      queryClient.invalidateQueries({ queryKey: ['sellersList'] });
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['accountOfficers'] });
      onClose();
      setSelectedOfficerId(null);
    },
    onError: (error: any) => {
      console.error('Failed to assign account officer:', error);
      showToast(error.message || 'Failed to assign Account Officer.', 'error');
    },
  });

  const handleAssign = () => {
    if (!selectedOfficerId) {
      showToast('Please select an Account Officer', 'error');
      return;
    }
    
    if (storeIds.length === 0) {
      showToast('No stores selected', 'error');
      return;
    }

    const selectedOfficer = accountOfficers.find((o: any) => o.id === selectedOfficerId);
    const confirmMessage = storeIds.length === 1
      ? `Assign ${selectedOfficer?.name || 'this Account Officer'} to the selected store?`
      : `Assign ${selectedOfficer?.name || 'this Account Officer'} to ${storeIds.length} stores?`;

    if (window.confirm(confirmMessage)) {
      assignMutation.mutate({ storeIds, accountOfficerId: selectedOfficerId });
    }
  };

  const handleUnassign = () => {
    if (storeIds.length === 0) {
      showToast('No stores selected', 'error');
      return;
    }

    const confirmMessage = storeIds.length === 1
      ? 'Are you sure you want to unassign the Account Officer from this store?'
      : `Are you sure you want to unassign Account Officers from ${storeIds.length} stores?`;

    if (window.confirm(confirmMessage)) {
      assignMutation.mutate({ storeIds, accountOfficerId: null });
      setSelectedOfficerId(null);
    }
  };

  if (!isOpen) return null;

  if (!canAssignAccountOfficer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4 gap-4">
            <h3 className="text-xl font-semibold flex-1">Access Denied</h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <img 
                src={images.close} 
                alt="Close" 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </button>
          </div>
          <p className="text-gray-600">You don't have permission to assign Account Officers.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-[#E53E3E] text-white py-2 rounded-lg hover:bg-[#D32F2F] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full my-auto">
        <div className="p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4 gap-4">
            <h3 className="text-xl font-semibold text-gray-900 flex-1">
              {storeIds.length === 1 ? 'Assign Account Officer' : 'Bulk Assign Account Officer'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <img 
                src={images.close} 
                alt="Close" 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </button>
          </div>

          {storeIds.length > 1 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">{storeIds.length} stores</span> selected for assignment
              </p>
            </div>
          )}

          {storeNames.length > 0 && storeNames.length <= 3 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Selected stores:</p>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {storeNames.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="accountOfficer" className="block text-sm font-medium text-gray-700 mb-2">
              Select Account Officer
            </label>
            <select
              id="accountOfficer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-[#E53E3E] transition-shadow"
              value={selectedOfficerId || ''}
              onChange={(e) => setSelectedOfficerId(e.target.value ? parseInt(e.target.value) : null)}
              disabled={isLoadingOfficers || assignMutation.isPending}
            >
              <option value="">-- Select Account Officer --</option>
              {isLoadingOfficers ? (
                <option disabled>Loading...</option>
              ) : accountOfficers.length === 0 ? (
                <option disabled>No Account Officers available</option>
              ) : (
                accountOfficers.map((officer: any) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name} ({officer.email})
                    {officer.vendor_count !== undefined && ` - ${officer.vendor_count} vendors`}
                  </option>
                ))
              )}
            </select>
            {accountOfficers.length === 0 && !isLoadingOfficers && (
              <p className="mt-2 text-sm text-gray-500">
                No Account Officers found. Please create Account Officers first.
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAssign}
              disabled={assignMutation.isPending || selectedOfficerId === null || isLoadingOfficers}
              className="flex-1 px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </button>
            <button
              onClick={handleUnassign}
              disabled={assignMutation.isPending}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {assignMutation.isPending ? 'Unassigning...' : 'Unassign'}
            </button>
            <button
              onClick={onClose}
              disabled={assignMutation.isPending}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignAccountOfficerModal;

