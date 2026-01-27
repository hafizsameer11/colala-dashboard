# RBAC Frontend Implementation Guide

This guide explains how to use the Role-Based Access Control (RBAC) system in the Colala Admin Dashboard frontend.

## Overview

The RBAC system has been fully integrated into the frontend with the following components:

1. **usePermissions Hook** - React hook for permission checks
2. **AuthContext** - Extended to include permissions and roles
3. **ProtectedRoute** - Route protection with permission checks
4. **RoleAccessModal** - UI component for viewing/managing roles
5. **Permission Utilities** - Helper functions for permission checks

---

## Quick Start

### 1. Using the usePermissions Hook

The `usePermissions` hook is the primary way to check permissions in components:

```tsx
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermissions();

  return (
    <div>
      {/* Check single permission */}
      {hasPermission('dashboard.view') && (
        <DashboardStats />
      )}

      {/* Check multiple permissions (any) */}
      {hasAnyPermission(['dashboard.export', 'analytics.export']) && (
        <ExportButton />
      )}

      {/* Check multiple permissions (all) */}
      {hasAllPermissions(['buyers.view', 'buyers.edit']) && (
        <EditBuyerButton />
      )}

      {/* Check role */}
      {hasRole('super_admin') && (
        <AdminOnlyFeature />
      )}
    </div>
  );
};
```

### 2. Using AuthContext Directly

You can also access permissions directly from AuthContext:

```tsx
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/permissions';

const MyComponent = () => {
  const { permissions } = useAuth();

  return (
    <div>
      {hasPermission(permissions, 'dashboard.view') && (
        <DashboardStats />
      )}
    </div>
  );
};
```

### 3. Route Protection

Protect routes with permission requirements:

```tsx
// In App.tsx
import ProtectedRoute from './components/ProtectedRoute';

<Route
  path="/buyers"
  element={
    <ProtectedRoute permission="buyers.view">
      <BuyersPage />
    </ProtectedRoute>
  }
/>
```

With custom fallback:

```tsx
<Route
  path="/settings"
  element={
    <ProtectedRoute 
      permission="settings.admin_management"
      fallback={<div>You need admin management access</div>}
    >
      <SettingsPage />
    </ProtectedRoute>
  }
/>
```

---

## Examples

### Example 1: Conditional Button Rendering

```tsx
import { usePermissions } from '../hooks/usePermissions';

const UserActions = ({ userId }: { userId: number }) => {
  const { hasPermission } = usePermissions();

  return (
    <div className="flex gap-2">
      {hasPermission('buyers.view_details') && (
        <button onClick={() => viewDetails(userId)}>
          View Details
        </button>
      )}
      
      {hasPermission('buyers.edit') && (
        <button onClick={() => editUser(userId)}>
          Edit
        </button>
      )}
      
      {hasPermission('buyers.delete') && (
        <button onClick={() => deleteUser(userId)}>
          Delete
        </button>
      )}
    </div>
  );
};
```

### Example 2: Menu Item Filtering

```tsx
import { usePermissions } from '../hooks/usePermissions';
import { Buyers_links, Sellers_links, General_links } from '../constants';

const Sidebar = () => {
  const { hasPermission } = usePermissions();

  // Filter menu items based on permissions
  const visibleBuyerLinks = Buyers_links.filter(link => {
    const permissionMap: Record<string, string> = {
      '/customer-mgt': 'buyers.view',
      '/orders-mgt-buyers': 'buyer_orders.view',
      '/transactions-buyers': 'buyer_transactions.view',
    };
    return hasPermission(permissionMap[link.link] || 'dashboard.view');
  });

  return (
    <nav>
      {visibleBuyerLinks.map(link => (
        <Link key={link.link} to={link.link}>
          {link.name}
        </Link>
      ))}
    </nav>
  );
};
```

### Example 3: Bulk Actions Based on Permissions

```tsx
import { usePermissions } from '../hooks/usePermissions';

const BulkActions = ({ selectedItems }: { selectedItems: any[] }) => {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const actions = [
    {
      label: 'Export',
      permission: 'buyers.export',
      onClick: () => exportData(selectedItems),
    },
    {
      label: 'Delete',
      permission: 'buyers.delete',
      onClick: () => deleteItems(selectedItems),
    },
    {
      label: 'Suspend',
      permission: 'buyers.suspend',
      onClick: () => suspendItems(selectedItems),
    },
  ].filter(action => hasPermission(action.permission));

  return (
    <div>
      {actions.map(action => (
        <button key={action.label} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  );
};
```

### Example 4: Using RoleAccessModal

```tsx
import { useState } from 'react';
import RoleAccessModal from '../components/roleAccessModal';

const UserDetails = ({ user }: { user: any }) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { hasPermission } = usePermissions();

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      
      {hasPermission('settings.admin_management') && (
        <button onClick={() => setShowRoleModal(true)}>
          Manage Roles & Permissions
        </button>
      )}

      <RoleAccessModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        userId={user.id}
        userName={user.name}
        userEmail={user.email}
      />
    </div>
  );
};
```

### Example 5: Permission-Based Table Columns

```tsx
import { usePermissions } from '../hooks/usePermissions';

const UsersTable = ({ users }: { users: any[] }) => {
  const { hasPermission } = usePermissions();

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    ...(hasPermission('buyers.view_details') 
      ? [{ key: 'details', label: 'Details' }] 
      : []),
    ...(hasPermission('buyers.edit') 
      ? [{ key: 'edit', label: 'Edit' }] 
      : []),
    ...(hasPermission('buyers.delete') 
      ? [{ key: 'delete', label: 'Delete' }] 
      : []),
  ];

  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            {columns.map(col => (
              <td key={col.key}>
                {col.key === 'details' && hasPermission('buyers.view_details') && (
                  <button onClick={() => viewDetails(user.id)}>View</button>
                )}
                {col.key === 'edit' && hasPermission('buyers.edit') && (
                  <button onClick={() => editUser(user.id)}>Edit</button>
                )}
                {col.key === 'delete' && hasPermission('buyers.delete') && (
                  <button onClick={() => deleteUser(user.id)}>Delete</button>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## Permission Utility Functions

The `src/utils/permissions.ts` file provides utility functions:

```tsx
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  groupPermissionsByModule,
  PermissionChecks
} from '../utils/permissions';

// Direct permission checks
const canView = hasPermission(userPermissions, 'dashboard.view');
const canExport = hasAnyPermission(userPermissions, ['dashboard.export', 'analytics.export']);

// Group permissions by module
const grouped = groupPermissionsByModule(userPermissions);
// Result: { dashboard: ['dashboard.view', 'dashboard.export'], buyers: [...] }

// Use predefined checks
const canViewDashboard = PermissionChecks.canViewDashboard(userPermissions);
const canEditBuyers = PermissionChecks.canEditBuyers(userPermissions);
```

---

## Best Practices

### 1. Cache Permissions
Permissions are automatically cached in AuthContext and usePermissions hook. They refresh on login and can be manually refreshed using `refreshPermissions()`.

### 2. Check Before Rendering
Always check permissions before rendering UI elements:

```tsx
// ✅ Good
{hasPermission('buyers.edit') && <EditButton />}

// ❌ Bad - Don't render and then check
<EditButton disabled={!hasPermission('buyers.edit')} />
```

### 3. Use Permission Groups
For complex permission checks, use permission groups:

```tsx
const canManageBuyers = hasAllPermissions([
  'buyers.view',
  'buyers.edit',
  'buyers.delete'
]);
```

### 4. Fallback UI
Provide fallback UI when permissions are missing:

```tsx
{hasPermission('dashboard.view') ? (
  <Dashboard />
) : (
  <div>You don't have permission to view the dashboard</div>
)}
```

### 5. Route-Level Protection
Always protect routes at the route level, not just in components:

```tsx
<Route
  path="/settings"
  element={
    <ProtectedRoute permission="settings.view">
      <Settings />
    </ProtectedRoute>
  }
/>
```

---

## Common Permission Patterns

### Pattern 1: View + Action Permissions

```tsx
const { hasPermission } = usePermissions();

// User can view the page
{hasPermission('buyers.view') && (
  <div>
    <BuyersList />
    
    {/* But can only edit if they have edit permission */}
    {hasPermission('buyers.edit') && (
      <EditButton />
    )}
  </div>
)}
```

### Pattern 2: Module-Level Access

```tsx
const { hasAnyPermission } = usePermissions();

// Show buyers section if user has any buyer-related permission
{hasAnyPermission([
  'buyers.view',
  'buyer_orders.view',
  'buyer_transactions.view'
]) && (
  <BuyersSection />
)}
```

### Pattern 3: Role-Based Features

```tsx
const { hasRole } = usePermissions();

// Super admin only features
{hasRole('super_admin') && (
  <AdminSettings />
)}
```

---

## Troubleshooting

### Permissions Not Loading

1. Check that user is authenticated
2. Verify API endpoint is correct: `/api/admin/rbac/me/permissions`
3. Check browser console for errors
4. Ensure token is valid

### Permission Checks Not Working

1. Verify permission slug matches exactly (case-sensitive)
2. Check that permissions are loaded: `console.log(permissions)`
3. Ensure you're using the correct hook: `usePermissions()` or `useAuth()`

### Route Protection Not Working

1. Ensure `ProtectedRoute` wraps the route
2. Check permission slug is correct
3. Verify user has the required permission

---

## API Integration

The RBAC system uses the following API endpoints (defined in `src/utils/queries/rbac.ts`):

- `GET /api/admin/rbac/me/permissions` - Get current user's permissions
- `GET /api/admin/rbac/roles` - Get all roles
- `GET /api/admin/rbac/permissions` - Get all permissions
- `GET /api/admin/rbac/users/{userId}/roles` - Get user's roles
- `GET /api/admin/rbac/users/{userId}/permissions` - Get user's permissions

All endpoints require authentication via Bearer token.

---

## Files Created/Modified

### New Files
- `src/hooks/usePermissions.ts` - Permission hook
- `src/utils/queries/rbac.ts` - RBAC API queries
- `src/utils/permissions.ts` - Permission utilities
- `src/components/roleAccessModal.tsx` - Role management modal

### Modified Files
- `src/contexts/AuthContext.tsx` - Added permissions and roles
- `src/components/ProtectedRoute.tsx` - Added permission checks
- `src/config/apiConfig.ts` - Added RBAC endpoints

---

## Next Steps

1. **Update Sidebar** - Filter menu items based on permissions
2. **Update Components** - Add permission checks to action buttons
3. **Update Routes** - Add permission requirements to routes
4. **Test Permissions** - Test with different user roles
5. **Add Role Management UI** - Create UI for assigning roles to users (backend API needed)

---

## Support

For questions or issues:
1. Check the backend API documentation: `RBAC_FRONTEND_API_DOCUMENTATION.md`
2. Review module inventory: `RBAC_MODULES_INVENTORY.md`
3. Check console logs for permission data
4. Contact backend team for API issues

