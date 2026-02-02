import { apiCall } from '../customApiCall';
import Cookies from 'js-cookie';
import { API_ENDPOINTS } from '../../config/apiConfig';

/**
 * Get current user's permissions and roles
 */
export const getCurrentUserPermissions = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.RBAC.MePermissions, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get current user permissions error:', error);
    throw error;
  }
};

/**
 * Get all modules
 */
export const getAllModules = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.RBAC.Modules, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get all modules error:', error);
    throw error;
  }
};

/**
 * Get all permissions (optionally filtered by module)
 */
export const getAllPermissions = async (module?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = API_ENDPOINTS.RBAC.Permissions;
    if (module) {
      url += `?module=${module}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get all permissions error:', error);
    throw error;
  }
};

/**
 * Get permissions by module
 */
export const getPermissionsByModule = async (module: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.RBAC.PermissionsByModule(module), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get permissions by module error:', error);
    throw error;
  }
};

/**
 * Get permission details
 */
export const getPermissionDetails = async (permissionId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.RBAC.PermissionDetails(permissionId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get permission details error:', error);
    throw error;
  }
};

/**
 * Get all roles
 */
export const getAllRoles = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.RBAC.Roles, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get all roles error:', error);
    throw error;
  }
};

/**
 * Get role details
 */
export const getRoleDetails = async (roleId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.RBAC.RoleDetails(roleId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get role details error:', error);
    throw error;
  }
};

/**
 * Get user's roles
 */
export const getUserRoles = async (userId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.RBAC.UserRoles(userId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get user roles error:', error);
    throw error;
  }
};

/**
 * Get user's permissions
 */
export const getUserPermissions = async (userId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.RBAC.UserPermissions(userId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get user permissions error:', error);
    throw error;
  }
};

/**
 * Check if user has a specific permission
 */
export const checkUserPermission = async (userId: number | string, permission: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(
      API_ENDPOINTS.RBAC.CheckPermission(userId),
      'POST',
      { permission },
      token
    );
    return response;
  } catch (error) {
    console.error('Check user permission error:', error);
    throw error;
  }
};

/**
 * Update role permissions
 * @param roleId - Role ID
 * @param permissionIds - Array of permission IDs to assign to the role
 */
export const updateRolePermissions = async (roleId: number | string, permissionIds: number[]) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(
      API_ENDPOINTS.RBAC.UpdateRolePermissions(roleId),
      'POST',
      { permission_ids: permissionIds },
      token
    );
    return response;
  } catch (error) {
    console.error('Update role permissions error:', error);
    throw error;
  }
};

/**
 * Assign/sync roles to a user
 * @param userId - User ID
 * @param roleIds - Array of role IDs to assign to the user
 */
export const assignUserRoles = async (userId: number | string, roleIds: number[]) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(
      API_ENDPOINTS.RBAC.AssignUserRoles(userId),
      'POST',
      { role_ids: roleIds },
      token
    );
    return response;
  } catch (error) {
    console.error('Assign user roles error:', error);
    throw error;
  }
};

