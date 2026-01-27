import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserPermissions } from '../utils/queries/rbac';

interface Permission {
  id: number;
  name: string;
  slug: string;
  module: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  permissions: Permission[];
}

interface UserPermissionsData {
  user_id: number;
  roles: Role[];
  permissions: string[];
}

interface UsePermissionsReturn {
  permissions: string[];
  roles: Role[];
  loading: boolean;
  error: any;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissionList: string[]) => boolean;
  hasAllPermissions: (permissionList: string[]) => boolean;
  hasRole: (roleSlug: string) => boolean;
  refreshPermissions: () => void;
}

/**
 * Custom hook for managing user permissions
 * Fetches permissions from API and provides helper methods
 */
export const usePermissions = (): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const {
    data: permissionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userPermissions'],
    queryFn: async () => {
      const response = await getCurrentUserPermissions();
      return response.data as UserPermissionsData;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  useEffect(() => {
    if (permissionsData) {
      setPermissions(permissionsData.permissions || []);
      setRoles(permissionsData.roles || []);
    }
  }, [permissionsData]);

  /**
   * Check if user has a specific permission
   * Admin and super_admin roles have all permissions by default
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permission) return false;
      
      // Admin and super_admin roles have all permissions by default
      const roleSlugs = roles.map(r => r.slug);
      if (roleSlugs.includes('admin') || roleSlugs.includes('super_admin')) {
        return true;
      }
      
      return permissions.includes(permission);
    },
    [permissions, roles]
  );

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (permissionList: string[]): boolean => {
      if (!permissionList || permissionList.length === 0) return false;
      return permissionList.some((perm) => hasPermission(perm));
    },
    [hasPermission]
  );

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (permissionList: string[]): boolean => {
      if (!permissionList || permissionList.length === 0) return false;
      return permissionList.every((perm) => hasPermission(perm));
    },
    [hasPermission]
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (roleSlug: string): boolean => {
      if (!roleSlug) return false;
      return roles.some((role) => role.slug === roleSlug && role.is_active);
    },
    [roles]
  );

  /**
   * Refresh permissions from API
   */
  const refreshPermissions = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    permissions,
    roles,
    loading: isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    refreshPermissions,
  };
};

export default usePermissions;

