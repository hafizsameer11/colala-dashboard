import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import images from "../constants/images";
import {
  getAllRoles,
  getUserRoles,
  getUserPermissions,
  getRoleDetails,
} from "../utils/queries/rbac";

interface RoleAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | string;
  userName?: string;
  userEmail?: string;
}

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

interface Permission {
  id: number;
  name: string;
  slug: string;
  module: string;
}

const RoleAccessModal: React.FC<RoleAccessModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
}) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  // Fetch all available roles
  const {
    data: allRolesData,
    isLoading: loadingRoles,
    error: rolesError,
  } = useQuery({
    queryKey: ["allRoles"],
    queryFn: getAllRoles,
    enabled: isOpen,
  });

  // Fetch user's current roles
  const {
    data: userRolesData,
    isLoading: loadingUserRoles,
    refetch: refetchUserRoles,
  } = useQuery({
    queryKey: ["userRoles", userId],
    queryFn: () => getUserRoles(userId),
    enabled: isOpen && !!userId,
  });

  // Fetch user's current permissions
  const {
    data: userPermissionsData,
    isLoading: loadingUserPermissions,
    refetch: refetchUserPermissions,
  } = useQuery({
    queryKey: ["userPermissions", userId],
    queryFn: () => getUserPermissions(userId),
    enabled: isOpen && !!userId,
  });

  // Fetch selected role details
  const {
    data: roleDetailsData,
    isLoading: loadingRoleDetails,
  } = useQuery({
    queryKey: ["roleDetails", selectedRole?.id],
    queryFn: () => getRoleDetails(selectedRole!.id),
    enabled: isOpen && !!selectedRole?.id,
  });

  useEffect(() => {
    if (userRolesData?.data) {
      setUserRoles(Array.isArray(userRolesData.data) ? userRolesData.data : []);
    }
  }, [userRolesData]);

  useEffect(() => {
    if (userPermissionsData?.data) {
      setUserPermissions(
        Array.isArray(userPermissionsData.data) ? userPermissionsData.data : []
      );
    }
  }, [userPermissionsData]);

  if (!isOpen) return null;

  const allRoles: Role[] = allRolesData?.data || [];
  const roleDetails: Role | null = roleDetailsData?.data || null;
  const rolePermissions: Permission[] = roleDetails?.permissions || [];

  // Group permissions by module
  const groupedPermissions: Record<string, Permission[]> = {};
  rolePermissions.forEach((perm) => {
    if (!groupedPermissions[perm.module]) {
      groupedPermissions[perm.module] = [];
    }
    groupedPermissions[perm.module].push(perm);
  });

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
  };

  const handleClose = () => {
    setSelectedRole(null);
    setActiveTab("roles");
    onClose();
  };

  const isRoleAssigned = (roleId: number): boolean => {
    return userRoles.some((role) => role.id === roleId);
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[600px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-5 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Role & Access Management</h2>
              {userName && (
                <p className="text-sm text-gray-600 mt-1">
                  {userName} {userEmail && `(${userEmail})`}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <img className="w-7 h-7" src={images.close} alt="Close" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E5E5E5] px-5">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("roles")}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === "roles"
                  ? "border-[#E53E3E] text-[#E53E3E] font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Roles
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === "permissions"
                  ? "border-[#E53E3E] text-[#E53E3E] font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Permissions
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeTab === "roles" && (
            <div>
              <h3 className="text-md font-semibold mb-4">Available Roles</h3>

              {loadingRoles ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                </div>
              ) : rolesError ? (
                <div className="text-center text-red-500 py-10">
                  <p>Error loading roles</p>
                </div>
              ) : allRoles.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p>No roles available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allRoles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => handleRoleClick(role)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRole?.id === role.id
                          ? "border-[#E53E3E] bg-[#E53E3E10]"
                          : "border-[#E5E5E5] hover:border-[#E53E3E] hover:bg-gray-50"
                      } ${isRoleAssigned(role.id) ? "bg-green-50 border-green-300" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-[15px]">{role.name}</h4>
                            {isRoleAssigned(role.id) && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                Assigned
                              </span>
                            )}
                            {!role.is_active && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Slug: <code className="bg-gray-100 px-1 rounded">{role.slug}</code>
                          </p>
                        </div>
                        <img
                          src={images.rightarrow}
                          alt="View"
                          className="w-5 h-5 opacity-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Role Details */}
              {selectedRole && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Role Details</h4>
                    <button
                      onClick={() => setSelectedRole(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <img src={images.close} alt="Close" className="w-4 h-4" />
                    </button>
                  </div>

                  {loadingRoleDetails ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E53E3E]"></div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <strong>Name:</strong> {roleDetails?.name || selectedRole.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Description:</strong>{" "}
                          {roleDetails?.description || selectedRole.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Status:</strong>{" "}
                          {roleDetails?.is_active !== undefined
                            ? roleDetails.is_active
                              ? "Active"
                              : "Inactive"
                            : selectedRole.is_active
                            ? "Active"
                            : "Inactive"}
                        </p>
                      </div>

                      {rolePermissions.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-2">
                            Permissions ({rolePermissions.length})
                          </p>
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {Object.entries(groupedPermissions).map(([module, perms]) => (
                              <div key={module} className="mb-2">
                                <p className="text-xs font-semibold text-gray-700 uppercase mb-1">
                                  {module}
                                </p>
                                <div className="pl-2 space-y-1">
                                  {perms.map((perm) => (
                                    <div
                                      key={perm.id}
                                      className="text-xs text-gray-600 bg-white p-1 rounded"
                                    >
                                      • {perm.name} ({perm.slug})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* User's Current Roles */}
              {loadingUserRoles ? (
                <div className="mt-6 flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E53E3E]"></div>
                </div>
              ) : userRoles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-3">Current Roles</h3>
                  <div className="space-y-2">
                    {userRoles.map((role) => (
                      <div
                        key={role.id}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{role.name}</p>
                            <p className="text-xs text-gray-600">{role.description}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "permissions" && (
            <div>
              <h3 className="text-md font-semibold mb-4">User Permissions</h3>

              {loadingUserPermissions ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                </div>
              ) : userPermissions.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p>No permissions assigned</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Total Permissions: <strong>{userPermissions.length}</strong>
                  </p>

                  {/* Group permissions by module */}
                  {(() => {
                    const grouped: Record<string, string[]> = {};
                    userPermissions.forEach((perm) => {
                      const module = perm.split(".")[0];
                      if (!grouped[module]) {
                        grouped[module] = [];
                      }
                      grouped[module].push(perm);
                    });

                    return (
                      <div className="space-y-4">
                        {Object.entries(grouped).map(([module, perms]) => (
                          <div key={module} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-sm mb-2 uppercase text-gray-700">
                              {module.replace(/_/g, " ")}
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {perms.map((perm) => (
                                <div
                                  key={perm}
                                  className="text-xs bg-gray-50 p-2 rounded border border-gray-100"
                                >
                                  <code className="text-gray-700">{perm}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E5E5] px-5 py-4 sticky bottom-0 bg-white">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                refetchUserRoles();
                refetchUserPermissions();
              }}
              className="px-6 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAccessModal;

