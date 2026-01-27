# RBAC UI Permission Guide

## Overview

This guide ensures that action buttons (Edit, Delete, Update, etc.) are hidden when users only have view permissions. All action buttons must be conditionally rendered based on user permissions.

## Permission Pattern

### View-Only Permissions
- `{module}.view` - Can only view/list items
- `{module}.view_details` - Can only view details

### Action Permissions (Required for Buttons)
- `{module}.edit` - Required for Edit buttons
- `{module}.delete` - Required for Delete buttons
- `{module}.update_status` - Required for status update buttons
- `{module}.approve` - Required for approve buttons
- `{module}.reject` - Required for reject buttons
- `{module}.assign` - Required for assignment buttons

## Implementation Pattern

### Using usePermissions Hook

```typescript
import { usePermissions } from '../../../hooks/usePermissions';

const MyComponent = () => {
  const { hasPermission } = usePermissions();
  
  // Check permissions
  const canEdit = hasPermission('orders.edit');
  const canDelete = hasPermission('orders.delete');
  const canUpdateStatus = hasPermission('orders.update_status');
  
  return (
    <div>
      {/* Always visible - view permission */}
      <div>Order Details</div>
      
      {/* Conditionally render action buttons */}
      {canEdit && (
        <button onClick={handleEdit}>Edit</button>
      )}
      
      {canDelete && (
        <button onClick={handleDelete}>Delete</button>
      )}
      
      {canUpdateStatus && (
        <button onClick={handleUpdateStatus}>Update Status</button>
      )}
    </div>
  );
};
```

## Common Permission Mappings

### Orders
- View: `buyer_orders.view` or `seller_orders.view`
- Edit: `buyer_orders.edit` or `seller_orders.edit`
- Update Status: `buyer_orders.update_status` or `seller_orders.update_status`
- Delete: `buyer_orders.delete` or `seller_orders.delete`
- Cancel: `buyer_orders.cancel`

### Stores/Vendors
- View: `sellers.view`
- Edit: `sellers.edit`
- Delete: `sellers.delete`
- Suspend: `sellers.suspend`
- Assign Account Officer: `sellers.assign_account_officer`

### Products
- View: `products.view`
- Edit: `products.edit`
- Delete: `products.delete`
- Approve: `products.approve`
- Reject: `products.reject`

### Users
- View: `buyers.view` or `all_users.view`
- Edit: `buyers.edit` or `all_users.edit`
- Delete: `buyers.delete` or `all_users.delete`

## Components to Update

The following components need permission checks added:

1. **Order Components**
   - `src/components/orderOverview.tsx` - Status dropdown, action buttons
   - `src/components/buyerOrderDetails.tsx` - Release escrow, accept order buttons
   - `src/pages/sellers_Mgt/Modals/orderDetails.tsx` - Update status button

2. **Store Components**
   - `src/pages/sellers_Mgt/stores/storeTable.tsx` - Edit, delete, block buttons
   - `src/pages/sellers_Mgt/stores/storeDetails/` - All edit/update buttons

3. **Product Components**
   - `src/pages/sellers_Mgt/Modals/overview.tsx` - Edit, boost buttons
   - `src/pages/sellers_Mgt/Products_services/products_sevices.tsx` - Action buttons

4. **User Components**
   - `src/pages/general/allUsers/components/allUsersTable.tsx` - Edit, delete buttons
   - `src/pages/buyers_Mgt/customer_mgt/usersTable.tsx` - Action buttons

5. **Other Components**
   - Announcements, Subscriptions, Promotions, etc.

## Example: Before and After

### Before (No Permission Check)
```typescript
<button onClick={handleEdit}>Edit</button>
<button onClick={handleDelete}>Delete</button>
<button onClick={handleUpdateStatus}>Update Status</button>
```

### After (With Permission Check)
```typescript
{hasPermission('orders.edit') && (
  <button onClick={handleEdit}>Edit</button>
)}
{hasPermission('orders.delete') && (
  <button onClick={handleDelete}>Delete</button>
)}
{hasPermission('orders.update_status') && (
  <button onClick={handleUpdateStatus}>Update Status</button>
)}
```

## Best Practices

1. **Always check permissions before rendering action buttons**
2. **Use the `usePermissions` hook for consistency**
3. **Hide entire action sections if user has no action permissions**
4. **Provide visual feedback when actions are disabled (if needed)**
5. **Backend must also enforce permissions - UI hiding is not security**

## Testing Checklist

- [ ] User with only view permission cannot see edit buttons
- [ ] User with only view permission cannot see delete buttons
- [ ] User with only view permission cannot see update buttons
- [ ] User with edit permission can see edit buttons
- [ ] User with delete permission can see delete buttons
- [ ] Super Admin sees all buttons (has all permissions)

