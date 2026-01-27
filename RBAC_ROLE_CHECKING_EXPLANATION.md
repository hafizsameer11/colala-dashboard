# RBAC Role Checking Explanation

## How Role Checking Works at Login

### Two Types of Role Data

1. **Legacy Role (String)** - `user.role`
   - Stored as a simple string: `"admin"`, `"moderator"`, `"super_admin"`
   - Comes from the login API response: `response.data.user?.role`
   - Stored in cookies as part of `userData`
   - **Used for:** Basic user identification and legacy compatibility
   - **Location:** `AuthContext.tsx` - `User` interface has `role: string`

2. **RBAC Roles (Array of Objects)** - `roles[]`
   - Stored as array of role objects with full details:
     ```typescript
     {
       id: number,
       name: string,
       slug: string,  // "admin", "moderator", "super_admin"
       description: string,
       is_active: boolean,
       permissions: Permission[]
     }
     ```
   - Fetched from RBAC API: `GET /api/admin/rbac/me/permissions`
   - **Used for:** Permission checking and access control
   - **Location:** `AuthContext.tsx` - `roles: Role[]`

### Login Flow

```
1. User logs in → POST /auth/admin-login
   ↓
2. Response contains: { user: { role: "admin" }, token: "..." }
   ↓
3. Store in cookies: userData = { email, name, role: "admin" }
   ↓
4. Call fetchPermissions() → GET /api/admin/rbac/me/permissions
   ↓
5. Response contains: { roles: [{ id: 1, slug: "admin", ... }], permissions: [...] }
   ↓
6. Store in AuthContext: roles[] and permissions[]
```

### Permission Checking Logic

The `hasPermission()` function checks in this order:

1. **Check if user has admin/super_admin role** (from `roles[]` array)
   ```typescript
   const roleSlugs = roles.map(r => r.slug);
   if (roleSlugs.includes('admin') || roleSlugs.includes('super_admin')) {
     return true; // Grant all permissions
   }
   ```

2. **Check exact permission match** (from `permissions[]` array)
   ```typescript
   if (userPermissions.includes(permission)) return true;
   ```

3. **Check wildcard patterns** (e.g., `dashboard.*` matches `dashboard.view`)
   ```typescript
   return userPermissions.some(perm => matchesPermission(perm, permission));
   ```

### Key Points

- **Role checking uses `roles[]` array (RBAC), NOT `user.role` string**
- The `user.role` string is legacy data, kept for backward compatibility
- Permission checks look at `roles[].slug` to determine admin status
- All permission checks go through `hasPermission(permissions, permission, roles)`
- Admin/super_admin roles automatically bypass all permission checks

### Example

```typescript
// User logs in with role: "admin" (string)
// But RBAC API returns:
roles = [
  {
    id: 2,
    slug: "admin",  // ← This is what permission checks use
    name: "Admin",
    ...
  }
]

// Permission check:
hasPermission(permissions, "dashboard.view", roles)
// Checks: roles[].slug includes "admin" → returns true
```

## Current Implementation Status

✅ **Working:**
- Roles fetched from RBAC API on login
- Permissions fetched from RBAC API on login
- Permission checks use `roles[]` array with slug property
- Admin bypass works correctly

⚠️ **Note:**
- The `user.role` string is still stored but not used for permission checks
- Both are maintained for compatibility


