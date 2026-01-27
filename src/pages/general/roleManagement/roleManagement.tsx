import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import RoleAccessModal from "../../../components/roleAccessModal";
import RolePermissionEditModal from "../../../components/RolePermissionEditModal";
import { getAllRoles, getAllPermissions, getRoleDetails } from "../../../utils/queries/rbac";
import { usePermissions } from "../../../hooks/usePermissions";
import images from "../../../constants/images";

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  permissions?: Array<{
    id: number;
    name: string;
    slug: string;
    module: string;
  }>;
}

// Role Details Modal Component
interface RoleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  roleDetails: Role | null;
  loadingRoleDetails: boolean;
  onEditPermissions: () => void;
}

const RoleDetailsModal: React.FC<RoleDetailsModalProps> = ({
  isOpen,
  onClose,
  role,
  roleDetails,
  loadingRoleDetails,
  onEditPermissions,
}) => {
  if (!isOpen || !role) return null;

  const rolePermissions = roleDetails?.permissions || [];
  const groupedRolePermissions: Record<string, typeof rolePermissions> = {};
  rolePermissions.forEach((perm) => {
    if (!groupedRolePermissions[perm.module]) {
      groupedRolePermissions[perm.module] = [];
    }
    groupedRolePermissions[perm.module].push(perm);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E53E3E] to-[#D32F2F] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{role.name}</h2>
              <p className="text-white text-opacity-90 text-sm mt-1">Role Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
          >
            <img src={images.close} alt="Close" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loadingRoleDetails ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Role Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Status
                  </label>
                  {roleDetails?.is_active !== undefined ? (
                    roleDetails.is_active ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        Inactive
                      </span>
                    )
                  ) : role.is_active ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      Inactive
                    </span>
                  )}
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Total Permissions
                  </label>
                  <div className="text-3xl font-bold text-[#E53E3E]">{rolePermissions.length}</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                  Description
                </label>
                <p className="text-gray-900 leading-relaxed">
                  {roleDetails?.description || role.description || "No description available"}
                </p>
              </div>

              {/* Slug */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                  Slug
                </label>
                <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-800 font-mono block">
                  {roleDetails?.slug || role.slug}
                </code>
              </div>

              {/* Permissions */}
              {rolePermissions.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                        Permissions
                      </label>
                      <p className="text-sm text-gray-600">
                        {rolePermissions.length} permission{rolePermissions.length !== 1 ? 's' : ''} assigned
                      </p>
                    </div>
                    <button
                      onClick={onEditPermissions}
                      className="px-4 py-2 bg-[#E53E3E] hover:bg-[#D32F2F] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Permissions
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {Object.entries(groupedRolePermissions).map(([module, perms]) => (
                      <div key={module} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-5 bg-[#E53E3E] rounded-full"></div>
                          <h6 className="text-sm font-bold text-gray-900 uppercase">
                            {module.replace(/_/g, " ")}
                          </h6>
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                            {perms.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {perms.map((perm) => (
                            <div
                              key={perm.id}
                              className="bg-white p-3 rounded-lg border border-gray-200 hover:border-[#E53E3E] hover:shadow-md transition-all group"
                            >
                              <div className="font-medium text-sm text-gray-900 mb-1 group-hover:text-[#E53E3E] transition-colors">
                                {perm.name}
                              </div>
                              <code className="text-gray-600 text-[10px] break-all block font-mono">
                                {perm.slug}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rolePermissions.length === 0 && (
                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-gray-600 font-medium mb-2">No Permissions Assigned</p>
                  <p className="text-sm text-gray-500 mb-4">This role doesn't have any permissions yet.</p>
                  <button
                    onClick={onEditPermissions}
                    className="px-4 py-2 bg-[#E53E3E] hover:bg-[#D32F2F] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Add Permissions
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white p-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={onEditPermissions}
            className="px-6 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

const RoleManagement: React.FC = () => {
  const { hasRole } = usePermissions();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEditPermissionsModal, setShowEditPermissionsModal] = useState(false);
  const [showRoleDetailsModal, setShowRoleDetailsModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | string | null>(null);
  const [editingRoleName, setEditingRoleName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  // Fetch all roles
  const {
    data: rolesData,
    isLoading: loadingRoles,
    error: rolesError,
  } = useQuery({
    queryKey: ["allRoles"],
    queryFn: getAllRoles,
  });

  // Fetch all modules (for future use)
  // const {
  //   data: modulesData,
  //   isLoading: loadingModules,
  // } = useQuery({
  //   queryKey: ["allModules"],
  //   queryFn: getAllModules,
  // });

  // Fetch all permissions (without module filter)
  const {
    data: permissionsData,
    isLoading: loadingPermissions,
    error: permissionsError,
  } = useQuery({
    queryKey: ["allPermissions"],
    queryFn: () => getAllPermissions(), // Call without parameters
  });

  const roles: Role[] = rolesData?.data || [];
  // const modules = modulesData?.data || [];
  
  // Handle permissions data - API returns object with module keys
  const permissionsRaw = permissionsData?.data || {};
  const permissions = typeof permissionsRaw === 'object' && !Array.isArray(permissionsRaw) 
    ? permissionsRaw 
    : {};

  // Debug logging
  useEffect(() => {
    if (rolesData) {
      console.log('Roles Data:', rolesData);
    }
    if (permissionsData) {
      console.log('Permissions Data:', permissionsData);
      console.log('Permissions Data.data:', permissionsData?.data);
      console.log('Permissions keys:', Object.keys(permissionsData?.data || {}));
    }
  }, [rolesData, permissionsData]);

  // Fetch role details when a role is selected
  const {
    data: roleDetailsData,
    isLoading: loadingRoleDetails,
  } = useQuery({
    queryKey: ["roleDetails", selectedRole?.id],
    queryFn: () => getRoleDetails(selectedRole!.id),
    enabled: !!selectedRole?.id,
  });

  const roleDetails: Role | null = roleDetailsData?.data || null;
  const rolePermissions = roleDetails?.permissions || [];

  // Group permissions by module for display
  const groupedRolePermissions: Record<string, typeof rolePermissions> = {};
  rolePermissions.forEach((perm) => {
    if (!groupedRolePermissions[perm.module]) {
      groupedRolePermissions[perm.module] = [];
    }
    groupedRolePermissions[perm.module].push(perm);
  });

  const [selectedPermission, setSelectedPermission] = useState<any | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const handleViewRoleDetails = (role: Role) => {
    setSelectedRole(role);
    setShowRoleDetailsModal(true);
  };

  const handleEditPermissions = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRoleId(role.id);
    setEditingRoleName(role.name);
    setShowEditPermissionsModal(true);
  };

  // const handleManageUserRoles = (userId: number | string) => {
  //   setSelectedUserId(userId);
  //   setShowRoleModal(true);
  // };

  const handleViewPermissionDetails = (permission: any) => {
    setSelectedPermission(permission);
    setShowPermissionModal(true);
  };

  // Check if user can manage roles (admin or super_admin only)
  const canManageRoles = hasRole("admin") || hasRole("super_admin");

  if (!canManageRoles) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Only administrators can access role management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Role Management" />

      <div className="p-3 sm:p-4 md:p-5 bg-gray-50 min-h-screen">
        {/* Tabs */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex space-x-1 p-1">
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                activeTab === "roles"
                  ? "bg-[#E53E3E] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Roles
              </div>
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                activeTab === "permissions"
                  ? "bg-[#E53E3E] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Permissions
              </div>
            </button>
          </div>
        </div>

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">All Roles</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage roles and their permissions
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-[#E53E3E] bg-opacity-10 rounded-lg">
                    <span className="text-[#E53E3E] font-bold text-lg">{roles.length}</span>
                    <span className="text-gray-600 text-sm ml-1">Roles</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loadingRoles ? (
                  <div className="flex flex-col justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E] mb-4"></div>
                    <p className="text-gray-600">Loading roles...</p>
                  </div>
                ) : rolesError ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Error loading roles</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {rolesError instanceof Error ? rolesError.message : 'Unknown error'}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors font-medium"
                    >
                      Retry
                    </button>
                  </div>
                ) : roles.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">No roles available</p>
                    <p className="text-sm text-gray-500">The API may not have returned any roles</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#E53E3E] hover:shadow-xl transition-all duration-300 cursor-pointer"
                        onClick={() => handleViewRoleDetails(role)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#E53E3E] to-[#D32F2F] rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#E53E3E] transition-colors">
                                {role.name}
                              </h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              {role.is_active ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                                  Inactive
                                </span>
                              )}
                              {role.permissions && role.permissions.length > 0 && (
                                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                  {role.permissions.length} Permissions
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{role.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <code className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                                {role.slug}
                              </code>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRoleDetails(role);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPermissions(role, e);
                            }}
                            className="flex-1 px-4 py-2 bg-[#E53E3E] hover:bg-[#D32F2F] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === "permissions" && (
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">All Permissions by Module</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Browse and view all available permissions
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-800 font-bold text-lg">
                      {Object.values(permissions).flat().length}
                    </span>
                    <span className="text-gray-600 text-sm ml-1">Permissions</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loadingPermissions ? (
                  <div className="flex flex-col justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E] mb-4"></div>
                    <p className="text-gray-600">Loading permissions...</p>
                  </div>
                ) : permissionsError ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Error loading permissions</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {permissionsError instanceof Error ? permissionsError.message : 'Unknown error'}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors font-medium"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      // Handle API response - should be object with module keys
                      const moduleKeys = Object.keys(permissions);
                      
                      if (moduleKeys.length === 0) {
                        return (
                          <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <p className="text-lg font-semibold text-gray-900 mb-2">No permissions available</p>
                            <p className="text-sm text-gray-500">
                              The API returned an empty response. Check browser console for details.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {moduleKeys.map((module) => {
                            const perms = permissions[module];
                            if (!Array.isArray(perms) || perms.length === 0) return null;
                            
                            return (
                              <div key={module} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#E53E3E] transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-1 h-8 bg-gradient-to-b from-[#E53E3E] to-[#D32F2F] rounded-full"></div>
                                  <h4 className="font-bold text-base uppercase text-gray-900">
                                    {module.replace(/_/g, " ")}
                                  </h4>
                                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                    {perms.length} permission{perms.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {perms.map((perm: any) => (
                                    <div
                                      key={perm.id || perm.slug}
                                      onClick={() => handleViewPermissionDetails(perm)}
                                      className="group bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:border-[#E53E3E] hover:bg-red-50 hover:shadow-md transition-all cursor-pointer"
                                    >
                                      <div className="font-medium text-sm text-gray-900 mb-2 group-hover:text-[#E53E3E] transition-colors">
                                        {perm.name || perm.slug}
                                      </div>
                                      <code className="text-gray-600 text-[10px] break-all block font-mono mb-2">
                                        {perm.slug}
                                      </code>
                                      {perm.description && (
                                        <div className="text-[10px] text-gray-500 line-clamp-2 group-hover:text-gray-700">
                                          {perm.description}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 text-blue-900">Role Management</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                To assign roles to users, go to Settings → Admin Management and click on a user to manage their roles and permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Access Modal for User */}
      {selectedUserId && (
        <RoleAccessModal
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUserId(null);
          }}
          userId={selectedUserId}
        />
      )}

      {/* Role Permission Edit Modal */}
      {editingRoleId && (
        <RolePermissionEditModal
          isOpen={showEditPermissionsModal}
          onClose={() => {
            setShowEditPermissionsModal(false);
            setEditingRoleId(null);
            setEditingRoleName("");
          }}
          roleId={editingRoleId}
          roleName={editingRoleName}
        />
      )}

      {/* Role Details Modal */}
      {showRoleDetailsModal && selectedRole && (
        <RoleDetailsModal
          isOpen={showRoleDetailsModal}
          onClose={() => {
            setShowRoleDetailsModal(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
          roleDetails={roleDetails}
          loadingRoleDetails={loadingRoleDetails}
          onEditPermissions={() => {
            setEditingRoleId(selectedRole.id);
            setEditingRoleName(selectedRole.name);
            setShowEditPermissionsModal(true);
            setShowRoleDetailsModal(false);
          }}
        />
      )}

      {/* Permission Details Modal */}
      {showPermissionModal && selectedPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-gradient-to-r from-[#E53E3E] to-[#D32F2F] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Permission Details</h3>
              </div>
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setSelectedPermission(null);
                }}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
              >
                <img src={images.close} alt="Close" className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-5">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Name
                  </label>
                  <p className="text-gray-900 text-lg font-medium">{selectedPermission.name || 'N/A'}</p>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Slug
                  </label>
                  <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-800 font-mono block">
                    {selectedPermission.slug || 'N/A'}
                  </code>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Module
                  </label>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {selectedPermission.module ? selectedPermission.module.replace(/_/g, " ") : 'N/A'}
                  </span>
                </div>
                
                {selectedPermission.description && (
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      Description
                    </label>
                    <p className="text-gray-900 leading-relaxed">{selectedPermission.description}</p>
                  </div>
                )}
                
                {selectedPermission.id && (
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      Permission ID
                    </label>
                    <p className="text-gray-900 font-mono">{selectedPermission.id}</p>
                  </div>
                )}
                
                {selectedPermission.created_at && (
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      Created At
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedPermission.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 bg-white p-4 flex justify-end">
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setSelectedPermission(null);
                }}
                className="px-6 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleManagement;

