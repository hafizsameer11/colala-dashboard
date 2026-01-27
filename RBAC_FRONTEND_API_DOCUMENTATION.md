# RBAC Frontend API Documentation

This document has been moved to the backend repository. The frontend uses the API endpoints documented in the backend RBAC API documentation.

## Quick Reference

**Base URL:** `/api/admin/rbac`

**Authentication:** All endpoints require Bearer token in Authorization header

## Main Endpoint

**Get Current User's Permissions:**
```http
GET /api/admin/rbac/me/permissions
```

This is the primary endpoint used by the frontend to fetch user permissions on login and app initialization.

## Frontend Implementation

The frontend RBAC system is implemented in:

- **Hook:** `src/hooks/usePermissions.ts`
- **API Queries:** `src/utils/queries/rbac.ts`
- **Context:** `src/contexts/AuthContext.tsx` (extended with permissions)
- **Utilities:** `src/utils/permissions.ts`

See `RBAC_FRONTEND_IMPLEMENTATION_GUIDE.md` for usage examples.

