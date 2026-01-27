import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import images from "../constants/images";
import { getAllPermissions, getRoleDetails, updateRolePermissions } from "../utils/queries/rbac";
import { useToast } from "../contexts/ToastContext";

interface RolePermissionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: number | string;
  roleName?: string;
}

interface Permission {
  id: number;
  name: string;
  slug: string;
  module: string;
  description?: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  permissions?: Permission[];
}

const RolePermissionEditModal: React.FC<RolePermissionEditModalProps> = ({
  isOpen,
  onClose,
  roleId,
  roleName,
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalPermissionIds, setOriginalPermissionIds] = useState<Set<number>>(new Set());

  // Fetch role details
  const {
    data: roleData,
    isLoading: loadingRole,
  } = useQuery({
    queryKey: ["roleDetails", roleId],
    queryFn: () => getRoleDetails(roleId),
    enabled: isOpen && !!roleId,
  });

  // Fetch all permissions
  const {
    data: permissionsData,
    isLoading: loadingPermissions,
  } = useQuery({
    queryKey: ["allPermissions"],
    queryFn: () => getAllPermissions(),
    enabled: isOpen,
  });

  const role: Role | null = roleData?.data || null;
  const permissionsRaw = permissionsData?.data || {};
  const permissions = typeof permissionsRaw === 'object' && !Array.isArray(permissionsRaw) 
    ? permissionsRaw 
    : {};

  // Initialize selected permissions from role
  useEffect(() => {
    if (role?.permissions && role.permissions.length > 0) {
      const permIds = new Set(role.permissions.map(p => p.id));
      setSelectedPermissions(new Set(permIds));
      setOriginalPermissionIds(new Set(permIds));
      setHasUnsavedChanges(false);
    } else {
      setSelectedPermissions(new Set());
      setOriginalPermissionIds(new Set());
      setHasUnsavedChanges(false);
    }
  }, [role]);

  // Expand all modules by default
  useEffect(() => {
    if (Object.keys(permissions).length > 0) {
      setExpandedModules(new Set(Object.keys(permissions)));
    }
  }, [permissions]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = 
      selectedPermissions.size !== originalPermissionIds.size ||
      Array.from(selectedPermissions).some(id => !originalPermissionIds.has(id)) ||
      Array.from(originalPermissionIds).some(id => !selectedPermissions.has(id));
    setHasUnsavedChanges(hasChanges);
  }, [selectedPermissions, originalPermissionIds]);

  // Group permissions by module and filter by search
  const groupedPermissions = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    const searchLower = searchQuery.toLowerCase();

    Object.entries(permissions).forEach(([module, perms]: [string, any]) => {
      if (Array.isArray(perms)) {
        const filtered = perms.filter((perm: Permission) => {
          if (!searchQuery) return true;
          return (
            perm.name.toLowerCase().includes(searchLower) ||
            perm.slug.toLowerCase().includes(searchLower) ||
            perm.module.toLowerCase().includes(searchLower) ||
            (perm.description && perm.description.toLowerCase().includes(searchLower))
          );
        });
        if (filtered.length > 0) {
          grouped[module] = filtered;
        }
      }
    });

    return grouped;
  }, [permissions, searchQuery]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (permissionIds: number[]) => updateRolePermissions(roleId, permissionIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["roleDetails", roleId] });
      queryClient.invalidateQueries({ queryKey: ["allRoles"] });
      setOriginalPermissionIds(new Set(selectedPermissions));
      setHasUnsavedChanges(false);
      showToast("Permissions updated successfully", "success");
      onClose();
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.message || "Failed to update permissions",
        "error"
      );
    },
  });

  const handlePermissionToggle = (permissionId: number) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleModuleToggle = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const handleSelectAllModule = (module: string) => {
    const modulePerms = groupedPermissions[module] || [];
    const modulePermIds = modulePerms.map(p => p.id);
    const allSelected = modulePermIds.every(id => selectedPermissions.has(id));

    const newSelected = new Set(selectedPermissions);
    if (allSelected) {
      modulePermIds.forEach(id => newSelected.delete(id));
    } else {
      modulePermIds.forEach(id => newSelected.add(id));
    }
    setSelectedPermissions(newSelected);
  };

  const handleSelectAll = () => {
    const allPermIds = Object.values(groupedPermissions)
      .flat()
      .map(p => p.id);
    const allSelected = allPermIds.every(id => selectedPermissions.has(id));

    const newSelected = new Set(selectedPermissions);
    if (allSelected) {
      allPermIds.forEach(id => newSelected.delete(id));
    } else {
      allPermIds.forEach(id => newSelected.add(id));
    }
    setSelectedPermissions(newSelected);
  };

  const handleSave = () => {
    const permissionIds = Array.from(selectedPermissions);
    updateMutation.mutate(permissionIds);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        setSelectedPermissions(new Set(originalPermissionIds));
        setHasUnsavedChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          if (hasUnsavedChanges) {
            handleSave();
          }
        }
      }
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasUnsavedChanges, selectedPermissions]);

  if (!isOpen) return null;

  const totalPermissions = Object.values(groupedPermissions).flat().length;
  const selectedCount = selectedPermissions.size;
  const allModuleKeys = Object.keys(groupedPermissions);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#E53E3E] to-[#D32F2F] text-white">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {roleName || role?.name || "Edit Role Permissions"}
            </h2>
            {hasUnsavedChanges && (
              <span className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-full font-semibold">
                Unsaved Changes
              </span>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="text-white hover:text-gray-200 transition-colors p-2"
          >
            <img src={images.close} alt="Close" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column - Role Info */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-6 overflow-y-auto">
            {loadingRole ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
              </div>
            ) : role ? (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Role Name
                  </label>
                  <p className="text-gray-900 font-medium">{role.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Description
                  </label>
                  <p className="text-gray-600 text-sm">{role.description}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Slug
                  </label>
                  <code className="bg-gray-200 px-2 py-1 rounded text-sm text-gray-800">
                    {role.slug}
                  </code>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Status
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      role.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {role.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Permissions Summary
                    </label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Selected:</span>
                      <span className="font-semibold text-[#E53E3E]">{selectedCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Available:</span>
                      <span className="font-semibold text-gray-900">{totalPermissions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Modules:</span>
                      <span className="font-semibold text-gray-900">{allModuleKeys.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">Role not found</div>
            )}
          </div>

          {/* Right Column - Permissions Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Controls */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <img src={images.close} alt="Clear" className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {Object.values(groupedPermissions)
                    .flat()
                    .every(p => selectedPermissions.has(p.id))
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {Object.values(groupedPermissions).flat().length} of {totalPermissions} permissions
              </div>
            </div>

            {/* Permissions List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingPermissions ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                </div>
              ) : allModuleKeys.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  {searchQuery ? "No permissions match your search" : "No permissions available"}
                </div>
              ) : (
                <div className="space-y-4">
                  {allModuleKeys.map((module) => {
                    const modulePerms = groupedPermissions[module] || [];
                    const moduleSelectedCount = modulePerms.filter(p =>
                      selectedPermissions.has(p.id)
                    ).length;
                    const isExpanded = expandedModules.has(module);
                    const allModuleSelected = modulePerms.length > 0 &&
                      modulePerms.every(p => selectedPermissions.has(p.id));

                    return (
                      <div
                        key={module}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                      >
                        {/* Module Header */}
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => handleModuleToggle(module)}
                              className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <svg
                                className={`w-5 h-5 transition-transform ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                            <h3 className="font-semibold text-gray-900 uppercase text-sm">
                              {module.replace(/_/g, " ")}
                            </h3>
                            <span className="text-xs text-gray-500">
                              ({moduleSelectedCount}/{modulePerms.length})
                            </span>
                          </div>
                          <button
                            onClick={() => handleSelectAllModule(module)}
                            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                          >
                            {allModuleSelected ? "Deselect All" : "Select All"}
                          </button>
                        </div>

                        {/* Module Permissions */}
                        {isExpanded && (
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {modulePerms.map((perm) => {
                                const isSelected = selectedPermissions.has(perm.id);
                                return (
                                  <label
                                    key={perm.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                      isSelected
                                        ? "border-[#E53E3E] bg-red-50"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handlePermissionToggle(perm.id)}
                                      className="mt-1 w-4 h-4 text-[#E53E3E] border-gray-300 rounded focus:ring-[#E53E3E]"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm text-gray-900">
                                        {perm.name}
                                      </div>
                                      <code className="text-xs text-gray-600 block mt-1 break-all">
                                        {perm.slug}
                                      </code>
                                      {perm.description && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {perm.description}
                                        </div>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+S</kbd> to save,{" "}
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Esc</kbd> to cancel
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || !hasUnsavedChanges}
              className="px-6 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionEditModal;

