import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccountOfficers } from "../../../../../utils/queries/accountOfficer";
import { assignAccountOfficerToStore } from "../../../../../utils/mutations/sellers";
import { usePermissions } from "../../../../../hooks/usePermissions";
import images from "../../../../../constants/images";

interface AccountOfficerAssignmentProps {
  storeId: string | number;
  currentAccountOfficer?: {
    id: number;
    name: string;
    email: string;
  } | null;
  onUpdate?: () => void;
}

const AccountOfficerAssignment: React.FC<AccountOfficerAssignmentProps> = ({
  storeId,
  currentAccountOfficer,
  onUpdate,
}) => {
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [selectedOfficerId, setSelectedOfficerId] = useState<number | string | null>(
    currentAccountOfficer?.id || null
  );
  const [isEditing, setIsEditing] = useState(false);

  // Check if user has permission to assign account officers
  const canAssign = hasPermission("sellers.assign_account_officer");

  // Fetch account officers
  const { data: accountOfficersData, isLoading: loadingOfficers } = useQuery({
    queryKey: ["accountOfficers"],
    queryFn: getAccountOfficers,
    enabled: canAssign,
  });

  const accountOfficers = accountOfficersData?.data || [];

  // Assignment mutation
  const assignMutation = useMutation({
    mutationFn: (accountOfficerId: number | string | null) =>
      assignAccountOfficerToStore(storeId, accountOfficerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerDetails", storeId] });
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    },
    onError: (error: any) => {
      console.error("Failed to assign account officer:", error);
      alert(error?.message || "Failed to assign account officer. Please try again.");
    },
  });

  useEffect(() => {
    if (currentAccountOfficer) {
      setSelectedOfficerId(currentAccountOfficer.id);
    } else {
      setSelectedOfficerId(null);
    }
  }, [currentAccountOfficer]);

  const handleSave = () => {
    assignMutation.mutate(selectedOfficerId);
  };

  const handleCancel = () => {
    setSelectedOfficerId(currentAccountOfficer?.id || null);
    setIsEditing(false);
  };

  const handleUnassign = () => {
    if (window.confirm("Are you sure you want to unassign this account officer?")) {
      assignMutation.mutate(null);
    }
  };

  if (!canAssign) {
    return null; // Don't show if user doesn't have permission
  }

  return (
    <div
      className="flex flex-col border border-[#989898] rounded-2xl w-full h-fit mt-5"
      style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <div className="bg-[#F2F2F2] p-4 rounded-t-2xl flex flex-row justify-between items-center">
        <div className="text-xl font-medium">Account Officer Assignment</div>
        {!isEditing && currentAccountOfficer && (
          <button
            className="bg-[#E53E3E] text-white rounded-xl px-6 py-2 cursor-pointer hover:bg-[#D32F2F] transition-colors"
            onClick={() => setIsEditing(true)}
          >
            Edit Assignment
          </button>
        )}
      </div>
      <div className="bg-white p-5 flex flex-col gap-5 rounded-b-2xl">
        <div className="text-[#00000080] text-md">
          Assign an Account Officer to manage this store. Account Officers can view and manage assigned stores.
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Account Officer
              </label>
              {loadingOfficers ? (
                <div className="text-gray-500">Loading account officers...</div>
              ) : (
                <select
                  value={selectedOfficerId || ""}
                  onChange={(e) =>
                    setSelectedOfficerId(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                >
                  <option value="">-- Unassigned --</option>
                  {accountOfficers.map((officer: any) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} ({officer.email}) - {officer.vendor_count || 0} vendors
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={assignMutation.isPending}
                className="bg-[#E53E3E] text-white rounded-xl px-6 py-2.5 cursor-pointer hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                {assignMutation.isPending ? "Saving..." : "Save Assignment"}
              </button>
              <button
                onClick={handleCancel}
                disabled={assignMutation.isPending}
                className="border border-gray-300 text-gray-700 rounded-xl px-6 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {currentAccountOfficer ? (
              <div className="flex flex-col gap-3">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col">
                      <div className="font-semibold text-lg text-gray-900">
                        {currentAccountOfficer.name}
                      </div>
                      <div className="text-sm text-gray-600">{currentAccountOfficer.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        Assigned
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleUnassign}
                  disabled={assignMutation.isPending}
                  className="border border-red-300 text-red-600 rounded-xl px-4 py-2 cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {assignMutation.isPending ? "Unassigning..." : "Unassign Account Officer"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-300 rounded-xl">
                <div className="text-gray-400 text-lg mb-2">No Account Officer Assigned</div>
                <div className="text-gray-500 text-sm mb-4">
                  This store is not assigned to any Account Officer
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#E53E3E] text-white rounded-xl px-6 py-2 cursor-pointer hover:bg-[#D32F2F] transition-colors"
                >
                  Assign Account Officer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountOfficerAssignment;


