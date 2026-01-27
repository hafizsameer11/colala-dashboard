/**
 * Permission utility functions
 */

/**
 * Check if a permission string matches a pattern
 * Supports wildcard matching (e.g., "dashboard.*" matches "dashboard.view")
 */
export const matchesPermission = (userPermission: string, requiredPermission: string): boolean => {
  if (!userPermission || !requiredPermission) return false;
  
  // Exact match
  if (userPermission === requiredPermission) return true;
  
  // Wildcard matching: "dashboard.*" matches "dashboard.view", "dashboard.export", etc.
  if (requiredPermission.endsWith('.*')) {
    const module = requiredPermission.slice(0, -2);
    return userPermission.startsWith(module + '.');
  }
  
  return false;
};

/**
 * Check if user has permission (with wildcard support)
 * Admin and super_admin roles have all permissions by default
 */
export const hasPermission = (
  userPermissions: string[], 
  permission: string,
  userRoles?: Array<{ slug: string }> | string[]
): boolean => {
  if (!permission) return false;
  
  // Admin and super_admin roles have all permissions by default
  if (userRoles) {
    const roleSlugs = Array.isArray(userRoles) 
      ? userRoles.map(r => typeof r === 'string' ? r : r.slug)
      : [];
    
    if (roleSlugs.includes('admin') || roleSlugs.includes('super_admin')) {
      return true;
    }
  }
  
  if (!userPermissions || userPermissions.length === 0) return false;
  
  // Check exact match
  if (userPermissions.includes(permission)) return true;
  
  // Check wildcard patterns
  return userPermissions.some((perm) => matchesPermission(perm, permission));
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (
  userPermissions: string[], 
  permissionList: string[],
  userRoles?: Array<{ slug: string }> | string[]
): boolean => {
  if (!permissionList || permissionList.length === 0) return false;
  return permissionList.some((perm) => hasPermission(userPermissions, perm, userRoles));
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (
  userPermissions: string[], 
  permissionList: string[],
  userRoles?: Array<{ slug: string }> | string[]
): boolean => {
  if (!permissionList || permissionList.length === 0) return false;
  return permissionList.every((perm) => hasPermission(userPermissions, perm, userRoles));
};

/**
 * Get module from permission string
 * Example: "dashboard.view" -> "dashboard"
 */
export const getModuleFromPermission = (permission: string): string => {
  if (!permission) return '';
  const parts = permission.split('.');
  return parts[0] || '';
};

/**
 * Get action from permission string
 * Example: "dashboard.view" -> "view"
 */
export const getActionFromPermission = (permission: string): string => {
  if (!permission) return '';
  const parts = permission.split('.');
  return parts.slice(1).join('.') || '';
};

/**
 * Group permissions by module
 */
export const groupPermissionsByModule = (permissions: string[]): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};
  
  permissions.forEach((perm) => {
    const module = getModuleFromPermission(perm);
    if (module) {
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(perm);
    }
  });
  
  return grouped;
};

/**
 * Common permission checks for UI components
 */
export const PermissionChecks = {
  // Dashboard
  canViewDashboard: (perms: string[]) => hasPermission(perms, 'dashboard.view'),
  canExportDashboard: (perms: string[]) => hasPermission(perms, 'dashboard.export'),
  
  // Buyers
  canViewBuyers: (perms: string[]) => hasPermission(perms, 'buyers.view'),
  canEditBuyers: (perms: string[]) => hasPermission(perms, 'buyers.edit'),
  canDeleteBuyers: (perms: string[]) => hasPermission(perms, 'buyers.delete'),
  
  // Sellers
  canViewSellers: (perms: string[]) => hasPermission(perms, 'sellers.view'),
  canEditSellers: (perms: string[]) => hasPermission(perms, 'sellers.edit'),
  canSuspendSellers: (perms: string[]) => hasPermission(perms, 'sellers.suspend'),
  
  // Products
  canViewProducts: (perms: string[]) => hasPermission(perms, 'products.view'),
  canApproveProducts: (perms: string[]) => hasPermission(perms, 'products.approve'),
  canDeleteProducts: (perms: string[]) => hasPermission(perms, 'products.delete'),
  
  // Orders
  canViewOrders: (perms: string[]) => hasAnyPermission(perms, ['buyer_orders.view', 'seller_orders.view']),
  canUpdateOrderStatus: (perms: string[]) => hasAnyPermission(perms, ['buyer_orders.update_status', 'seller_orders.update_status']),
  
  // Settings
  canManageAdmins: (perms: string[]) => hasPermission(perms, 'settings.admin_management'),
  canCreateAdmin: (perms: string[]) => hasPermission(perms, 'settings.create_admin'),
};

