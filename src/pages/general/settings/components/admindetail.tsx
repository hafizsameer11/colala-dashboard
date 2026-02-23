import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import images from "../../../../constants/images";
import { getProfilePictureUrl } from "../../../../utils/imageUtils";
import BulkActionDropdown from "../../../../components/BulkActionDropdown";
import RoleAccessModal from "../../../../components/roleAccessModal";
import { usePermissions } from "../../../../hooks/usePermissions";
import { useToast } from "../../../../contexts/ToastContext";
import { assignUserRoles, getAllRoles } from "../../../../utils/queries/rbac";
import { updateUserStatus } from "../../../../utils/queries/users";

interface Admin {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  profile_picture: string | null;
  role: "admin" | "moderator" | "super_admin";
  is_active: boolean;
  is_disabled?: boolean | number;
  wallet_balance: string;
  created_at: string;
  user_name?: string;
}

interface UserDetails {
  user_info: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    user_name: string;
    country: string;
    state: string;
    role: "buyer" | "seller";
    status: "active" | "inactive";
    profile_picture: string | null;
    user_code: string;
    created_at: string;
    updated_at: string;
  };
  wallet_info: {
    id: number;
    balance: string | null;
    escrow_balance: string | null;
    points_balance: string | null;
    created_at: string;
  };
  store_info: any | null;
  statistics: {
    total_orders: number;
    total_transactions: number;
    total_loyalty_points: number;
    total_spent: number;
    average_order_value: number;
  };
  recent_orders: any[];
  activities: Array<{
    id: number;
    activity: string;
    created_at: string;
  }>;
  recent_transactions: any[];
}

interface AdminDetailProps {
  admin: Admin;
  userDetails?: UserDetails | null;
  onBack: () => void;
  loading?: boolean;
  error?: any;
}

interface ActivityItem {
  id: string;
  activity: string;
  date: string;
}

const AdminDetail: React.FC<AdminDetailProps> = ({ 
  admin, 
  userDetails, 
  onBack, 
  loading = false, 
  error = null 
}) => {
  const { hasPermission, hasRole } = usePermissions();
  const [activeTab, setActiveTab] = useState("Admin Management");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectAllActivities, setSelectAllActivities] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: admin.full_name,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
  });
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const canManageRoles = hasRole("admin") || hasRole("super_admin") || hasPermission("settings.admin_management");

  // Fetch all available roles for the dropdown
  const { data: rolesData } = useQuery({
    queryKey: ['allRoles'],
    queryFn: getAllRoles,
    staleTime: 5 * 60 * 1000,
  });

  const availableRoles = rolesData?.data || [];

  // Suspend / enable admin mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (payload: { status: "active" | "inactive"; is_disabled: boolean }) => {
      return await updateUserStatus(admin.id, payload);
    },
    onSuccess: (response) => {
      showToast("Admin status updated successfully", "success");
      const data = (response as any)?.data;
      if (data) {
        (admin as any).is_disabled = data.is_disabled;
        (admin as any).is_active = data.status === "active";
      }
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["userDetails", admin.id] });
      setIsActionsDropdownOpen(false);
    },
    onError: (error: any) => {
      console.error("Update admin status error:", error);
      showToast(error?.message || "Failed to update admin status", "error");
    },
  });

  // Mutation to update admin user
  const updateAdminMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = Cookies.get('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      // Use the all-users update endpoint (admin users are part of all-users)
      return await apiCall(
        API_ENDPOINTS.ALL_USERS.Update(admin.id),
        'POST',
        formData,
        token
      );
    },
    onSuccess: async () => {
      showToast("Admin account updated successfully", "success");
      setShowEditModal(false);
      // Update role via RBAC if role changed
      if (editFormData.role !== admin.role) {
        const role = availableRoles.find((r) => r.slug === editFormData.role);
        if (role) {
          try {
            await assignUserRoles(admin.id, [role.id]);
          } catch (error) {
            console.error("Failed to update role:", error);
          }
        }
      }
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userDetails', admin.id] });
    },
    onError: (error: any) => {
      console.error("Update admin error:", error);
      showToast(error?.message || "Failed to update admin account", "error");
    },
  });

  const handleEditClick = () => {
    setEditFormData({
      full_name: admin.full_name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
    });
    setShowEditModal(true);
    setIsActionsDropdownOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("full_name", editFormData.full_name);
    formData.append("email", editFormData.email);
    formData.append("phone", editFormData.phone);
    formData.append("role", editFormData.role);
    updateAdminMutation.mutate(formData);
  };

  const handleToggleSuspend = () => {
    const currentlyDisabled = Boolean(admin.is_disabled);
    const nextDisabled = !currentlyDisabled;
    const nextStatus: "active" | "inactive" = nextDisabled ? "inactive" : "active";

    toggleStatusMutation.mutate({
      status: nextStatus,
      is_disabled: nextDisabled,
    });
  };

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Orders:", action);
    // Add your custom logic here
  };

  // Use real activity data from API
  const activities: ActivityItem[] = userDetails?.activities?.map(activity => ({
    id: activity.id.toString(),
    activity: activity.activity,
    date: new Date(activity.created_at).toLocaleString()
  })) || [];

  const handleSelectAllActivities = () => {
    if (selectAllActivities) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(activities.map((activity) => activity.id));
    }
    setSelectAllActivities(!selectAllActivities);
  };

  const handleActivitySelect = (activityId: string) => {
    let newSelectedActivities;
    if (selectedActivities.includes(activityId)) {
      newSelectedActivities = selectedActivities.filter(
        (id) => id !== activityId
      );
    } else {
      newSelectedActivities = [...selectedActivities, activityId];
    }
    setSelectedActivities(newSelectedActivities);
    setSelectAllActivities(newSelectedActivities.length === activities.length);
  };

  const CustomHeader = () => (
    <div className="flex items-center justify-between p-6 bg-white border-b border-t border-[#787878]">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500 text-xl">User Management</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 text-xl font-medium">User Details</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Main Tabs Group */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2 overflow-x-auto">
          {["General", "Admin Management", "Categories", "Service Categories", "Brands", "FAQs", "Knowledge Base", "Terms"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#E53E3E] text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading user details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading user details. Please try again.</div>
      </div>
    );
  }

  return (
    <>
      <CustomHeader />
      <div className="p-6">
        {/* Admin Profile Card */}
        <div className="bg-[#E53E3E] rounded-2xl h-[277px] p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center  gap-4">
              <img
                src={getProfilePictureUrl(admin.profile_picture, images.admin)}
                alt={admin.full_name}
                className="w-16 h-16 rounded-full -mt-26 object-cover border-2 border-white"
              />
              <div className="space-y-3">
                {/* Name and Location */}
                <div className="flex gap-12">
                  <div>
                    <div className="text-sm text-[#FFFFFF80] opacity-90 mb-4">
                      Name
                    </div>
                    <div className="font-xs text-[14px]">{admin.full_name}</div>
                  </div>
                  <div>
                    <div className="text-sm ml-22 text-[#FFFFFF80] opacity-90 mb-4">
                      Location
                    </div>
                    <div className="font-xs ml-22 text-[14px]">
                      {userDetails?.user_info?.country && userDetails?.user_info?.state 
                        ? `${userDetails.user_info.state}, ${userDetails.user_info.country}`
                        : "Not specified"}
                    </div>
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="flex gap-12">
                  <div>
                    <div className="text-sm text-[#FFFFFF80] opacity-90 mb-4">
                      Email
                    </div>
                    <div className="font-xs text-[14px]">
                      {admin.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm ml-4 text-[#FFFFFF80] opacity-90 mb-4">
                      Phone
                    </div>
                    <div className="font-xs ml-4 text-[14px]">
                      {admin.phone}
                    </div>
                  </div>
                </div>

                {/* Account Creation */}
                <div className="flex gap-8">
                  <div>
                    <div className="text-sm text-[#FFFFFF80] opacity-90 mb-4">
                      Account Creation
                    </div>
                    <div className="font-xs text-[14px]">
                      {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#FFFFFF80] opacity-90 mb-4">
                      Status
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                        {admin.is_active ? "Active" : "Inactive"}
                      </span>
                      {typeof admin.is_disabled !== "undefined" && (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          admin.is_disabled ? "bg-red-500/70" : "bg-green-500/70"
                        }`}>
                          {admin.is_disabled ? "Suspended" : "Enabled"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-[0.1] mt-48">
              <button 
                onClick={handleEditClick}
                className="p-2  bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <img
                  src={images.edit}
                  alt="Edit"
                  className="w-10 h-10 cursor-pointer"
                />
              </button>
              <button className="p-2  bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                <img
                  src={images.bell}
                  alt="Delete"
                  className="w-10 h-10 cursor-pointer"
                />
              </button>
              <div className="relative">
                <button
                  onClick={() =>
                    setIsActionsDropdownOpen(!isActionsDropdownOpen)
                  }
                  className="p-2  bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <img
                    src={images.dot}
                    alt="More"
                    className="w-10 h-10 cursor-pointer "
                  />
                </button>

                {isActionsDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg z-10">
                    {canManageRoles && (
                      <button 
                        onClick={() => {
                          setShowRoleModal(true);
                          setIsActionsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 first:rounded-t-lg"
                      >
                        <img
                          src={images.settings}
                          alt="Manage Roles"
                          className="w-4 h-4"
                        />
                        Manage Roles
                      </button>
                    )}
                    <button 
                      onClick={handleToggleSuspend}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <img
                        src="/public/assets/layout/block.svg"
                        alt="Suspend"
                        className="w-4 h-4"
                      />
                      {admin.is_disabled ? "Enable Admin" : "Suspend Admin"}
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 last:rounded-b-lg">
                      <img
                        src={images.delete1}
                        alt="Delete"
                        className="w-4 h-4"
                      />
                      Delete Admin
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Date Filter Dropdown */}
            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
              <div>Today</div>
              <div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>
            </div>

            {/* Bulk Action */}
            <div>
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>
        </div>

        {/* User Activity Section */}
        <div className="border border-[#989898] rounded-2xl w-full">
          <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
            User Activity
          </div>
          <div className="bg-white rounded-b-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F2F2F2]">
                <tr>
                  <th className="text-center p-3 font-semibold text-[14px] w-12">
                    <input
                      type="checkbox"
                      checked={selectAllActivities}
                      onChange={handleSelectAllActivities}
                      className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                    />
                  </th>
                  <th className="text-left p-3 font-semibold">
                    Activity
                  </th>
                  <th className="text-left p-3 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, index) => (
                  <tr
                    key={activity.id}
                    className={`border-t border-[#E5E5E5] transition-colors ${
                      index === activities.length - 1 ? "" : "border-b"
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity.id)}
                        onChange={() => handleActivitySelect(activity.id)}
                        className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-4  text-black">
                      {activity.activity}
                    </td>
                    <td className="p-4  text-black">
                      {activity.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Access Modal */}
      {showRoleModal && (
        <RoleAccessModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          userId={admin.id}
          userName={admin.full_name}
          userEmail={admin.email}
        />
      )}

      {/* Edit Admin Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Admin Account</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as "admin" | "moderator" | "super_admin" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] capitalize"
                  required
                >
                  {availableRoles
                    .filter((r) => r.is_active)
                    .map((role) => (
                      <option key={role.id} value={role.slug}>
                        {role.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={updateAdminMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updateAdminMutation.isPending}
                >
                  {updateAdminMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDetail;
