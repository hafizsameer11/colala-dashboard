# Backend Requirements: Account Officer Implementation

This document provides step-by-step instructions for implementing the Account Officer feature on the backend (Laravel).

## Overview

The Account Officer feature allows assigning stores/vendors to Account Officers. Account Officers can only view and manage their assigned vendors, while Super Admins can assign Account Officers and view all vendors.

---

## Step 1: Database Migration

### Create Migration File

Run this command:
```bash
php artisan make:migration add_account_officer_to_stores_table
```

### Migration Content

**File**: `database/migrations/YYYY_MM_DD_HHMMSS_add_account_officer_to_stores_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->unsignedBigInteger('account_officer_id')->nullable()->after('user_id');
            $table->foreign('account_officer_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
            $table->index('account_officer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropForeign(['account_officer_id']);
            $table->dropIndex(['account_officer_id']);
            $table->dropColumn('account_officer_id');
        });
    }
};
```

### Run Migration

```bash
php artisan migrate
```

---

## Step 2: Model Updates

### Update Store Model

**File**: `app/Models/Store.php`

Add to `$fillable` array:
```php
protected $fillable = [
    // ... existing fields
    'account_officer_id',
];
```

Add relationship method:
```php
/**
 * Get the account officer assigned to this store
 */
public function accountOfficer()
{
    return $this->belongsTo(User::class, 'account_officer_id');
}
```

Add scope method:
```php
/**
 * Scope a query to only include stores assigned to a specific account officer
 */
public function scopeAssignedTo($query, $userId)
{
    return $query->where('account_officer_id', $userId);
}
```

### Update User Model

**File**: `app/Models/User.php`

Add relationship method:
```php
/**
 * Get all stores assigned to this user as Account Officer
 */
public function assignedVendors()
{
    return $this->hasMany(Store::class, 'account_officer_id');
}
```

Add scope method:
```php
/**
 * Scope a query to only include users with account_officer role
 */
public function scopeAccountOfficers($query)
{
    return $query->whereHas('roles', function($q) {
        $q->where('slug', 'account_officer');
    });
}
```

---

## Step 3: RBAC Permissions Setup

### Create Seeder/Migration for Permissions

**Option A: Create a Seeder** (Recommended)

Run:
```bash
php artisan make:seeder AccountOfficerPermissionsSeeder
```

**File**: `database/seeders/AccountOfficerPermissionsSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountOfficerPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add permissions
        $permissions = [
            [
                'name' => 'View Account Officer Vendors',
                'slug' => 'account_officer_vendors.view',
                'module' => 'account_officer_vendors',
                'description' => 'Access Account Officer Vendors page',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'View Assigned Vendor Details',
                'slug' => 'account_officer_vendors.view_details',
                'module' => 'account_officer_vendors',
                'description' => 'View details of assigned vendors',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Assign Account Officer',
                'slug' => 'sellers.assign_account_officer',
                'module' => 'sellers',
                'description' => 'Assign account officer to store',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->insertOrIgnore($permission);
        }

        // Create Account Officer role if it doesn't exist
        $roleId = DB::table('roles')->where('slug', 'account_officer')->value('id');
        
        if (!$roleId) {
            $roleId = DB::table('roles')->insertGetId([
                'name' => 'Account Officer',
                'slug' => 'account_officer',
                'description' => 'Manages assigned vendors',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Assign permissions to Account Officer role
        $permissionIds = DB::table('permissions')
            ->whereIn('slug', [
                'account_officer_vendors.view',
                'account_officer_vendors.view_details',
                'sellers.view', // Can view assigned stores
                'sellers.view_details', // Can view assigned store details
            ])
            ->pluck('id');

        foreach ($permissionIds as $permissionId) {
            DB::table('role_permissions')->insertOrIgnore([
                'role_id' => $roleId,
                'permission_id' => $permissionId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Account Officer permissions and role created successfully!');
    }
}
```

**Run the seeder:**
```bash
php artisan db:seed --class=AccountOfficerPermissionsSeeder
```

**Option B: Add to existing seeder**

If you have an existing permissions seeder, add the above code to it.

---

## Step 4: Create AccountOfficerController

### Create Controller

Run:
```bash
php artisan make:controller AccountOfficerController
```

**File**: `app/Http/Controllers/AccountOfficerController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AccountOfficerController extends Controller
{
    /**
     * Get all account officers with vendor counts
     * GET /api/admin/account-officers
     * 
     * Access: Super Admin only (has sellers.assign_account_officer permission)
     */
    public function index()
    {
        // Check permission - only Super Admin can view all account officers
        if (!auth()->user()->hasPermission('sellers.assign_account_officer')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Only Super Admins can view account officers.'
            ], 403);
        }

        $accountOfficers = User::accountOfficers()
            ->withCount(['assignedVendors as vendor_count'])
            ->withCount(['assignedVendors as active_vendors' => function($q) {
                $q->where('status', 'active');
            }])
            ->withCount(['assignedVendors as inactive_vendors' => function($q) {
                $q->where('status', '!=', 'active');
            }])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->full_name ?? $user->name ?? $user->user_name ?? 'Unknown',
                    'email' => $user->email,
                    'vendor_count' => $user->vendor_count ?? 0,
                    'active_vendors' => $user->active_vendors ?? 0,
                    'inactive_vendors' => $user->inactive_vendors ?? 0,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $accountOfficers
        ]);
    }

    /**
     * Get vendors assigned to a specific account officer
     * GET /api/admin/account-officers/{id}/vendors
     * 
     * Access: Super Admin OR Account Officer (if viewing own vendors)
     */
    public function getVendors($id, Request $request)
    {
        $user = Auth::user();
        
        // Super Admin can view any account officer's vendors
        // Account Officer can only view their own
        $isSuperAdmin = $user->hasPermission('sellers.assign_account_officer');
        $isAccountOfficer = $user->hasRole('account_officer');
        
        if (!$isSuperAdmin && (!$isAccountOfficer || $user->id != $id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');
        $search = $request->get('search');

        $query = Store::where('account_officer_id', $id)
            ->with(['accountOfficer']);

        // Apply filters
        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('store_name', 'like', "%{$search}%")
                  ->orWhere('store_email', 'like', "%{$search}%");
            });
        }

        $stores = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $stores->items(),
            'pagination' => [
                'current_page' => $stores->currentPage(),
                'per_page' => $stores->perPage(),
                'total' => $stores->total(),
                'last_page' => $stores->lastPage(),
            ]
        ]);
    }

    /**
     * Get dashboard stats for current Account Officer
     * GET /api/admin/account-officers/me/dashboard
     * 
     * Access: Account Officer only
     */
    public function myDashboard()
    {
        $user = Auth::user();
        
        if (!$user->hasRole('account_officer')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Only Account Officers can access this endpoint.'
            ], 403);
        }

        $userId = $user->id;
        $totalVendors = Store::where('account_officer_id', $userId)->count();
        $activeVendors = Store::where('account_officer_id', $userId)
            ->where('status', 'active')
            ->count();
        $inactiveVendors = $totalVendors - $activeVendors;

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_vendors' => $totalVendors,
                'active_vendors' => $activeVendors,
                'inactive_vendors' => $inactiveVendors,
            ]
        ]);
    }

    /**
     * Get vendors assigned to current user (Account Officer)
     * GET /api/admin/vendors/assigned-to-me
     * 
     * Access: Account Officer only
     */
    public function myVendors(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->hasRole('account_officer')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Only Account Officers can access this endpoint.'
            ], 403);
        }

        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');
        $search = $request->get('search');
        $period = $request->get('period');

        $query = Store::where('account_officer_id', $user->id)
            ->with(['accountOfficer']);

        // Apply filters
        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('store_name', 'like', "%{$search}%")
                  ->orWhere('store_email', 'like', "%{$search}%");
            });
        }

        // Apply period filter if provided
        if ($period) {
            $dateFilter = $this->getDateFilter($period);
            if ($dateFilter) {
                $query->whereBetween('created_at', $dateFilter);
            }
        }

        $stores = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $stores->items(),
            'pagination' => [
                'current_page' => $stores->currentPage(),
                'per_page' => $stores->perPage(),
                'total' => $stores->total(),
                'last_page' => $stores->lastPage(),
            ]
        ]);
    }

    /**
     * Helper method to get date range from period string
     */
    private function getDateFilter($period)
    {
        $now = now();
        
        switch ($period) {
            case 'today':
                return [$now->startOfDay(), $now->copy()->endOfDay()];
            case 'this_week':
                return [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()];
            case 'this_month':
                return [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
            case 'last_month':
                return [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()];
            case 'this_year':
                return [$now->copy()->startOfYear(), $now->copy()->endOfYear()];
            default:
                return null;
        }
    }
}
```

---

## Step 5: Update StoreController

### Add Method to StoreController

**File**: `app/Http/Controllers/StoreController.php` (or wherever your store controller is)

Add this method:

```php
/**
 * Assign or unassign account officer to a store
 * PUT /api/admin/stores/{id}/assign-account-officer
 * 
 * Access: Super Admin only
 */
public function assignAccountOfficer($id, Request $request)
{
    // Only Super Admin can assign account officers
    if (!auth()->user()->hasPermission('sellers.assign_account_officer')) {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthorized. Only Super Admins can assign account officers.'
        ], 403);
    }

    $store = Store::findOrFail($id);
    
    $request->validate([
        'account_officer_id' => 'nullable|exists:users,id'
    ]);

    // Verify user has account_officer role if provided
    if ($request->account_officer_id) {
        $user = User::findOrFail($request->account_officer_id);
        if (!$user->hasRole('account_officer')) {
            return response()->json([
                'status' => 'error',
                'message' => 'User must have Account Officer role'
            ], 422);
        }
    }

    $store->account_officer_id = $request->account_officer_id;
    $store->save();

    // Load relationship for response
    $store->load('accountOfficer');

    return response()->json([
        'status' => 'success',
        'message' => $request->account_officer_id 
            ? 'Account Officer assigned successfully' 
            : 'Account Officer unassigned successfully',
        'data' => $store
    ]);
}
```

### Update Existing Store List Endpoint

**File**: `app/Http/Controllers/StoreController.php`

Update the `index()` method to filter by account officer:

```php
public function index(Request $request)
{
    $query = Store::query();

    // Account Officer sees only assigned stores
    if (auth()->user()->hasRole('account_officer') && 
        !auth()->user()->hasPermission('sellers.assign_account_officer')) {
        $query->where('account_officer_id', auth()->id());
    }

    // Super Admin can filter by account_officer_id
    if ($request->has('account_officer_id') && 
        auth()->user()->hasPermission('sellers.assign_account_officer')) {
        $query->where('account_officer_id', $request->account_officer_id);
    }

    // ... rest of your existing filtering logic (status, search, etc.)
    
    $stores = $query->paginate($request->get('per_page', 15));

    return response()->json([
        'status' => 'success',
        'data' => $stores->items(),
        'pagination' => [
            'current_page' => $stores->currentPage(),
            'per_page' => $stores->perPage(),
            'total' => $stores->total(),
            'last_page' => $stores->lastPage(),
        ]
    ]);
}
```

### Update Existing Store Details Endpoint

**File**: `app/Http/Controllers/StoreController.php`

Update the `show()` method to check access:

```php
public function show($id)
{
    $store = Store::findOrFail($id);

    // Account Officer can only view assigned stores
    if (auth()->user()->hasRole('account_officer') && 
        !auth()->user()->hasPermission('sellers.assign_account_officer')) {
        if ($store->account_officer_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. You can only view stores assigned to you.'
            ], 403);
        }
    }

    // Load account officer relationship if exists
    $store->load('accountOfficer');

    // ... rest of your existing logic to return store details
    
    return response()->json([
        'status' => 'success',
        'data' => [
            'store_info' => [
                // ... your existing store_info fields
                'account_officer' => $store->accountOfficer ? [
                    'id' => $store->accountOfficer->id,
                    'name' => $store->accountOfficer->full_name ?? $store->accountOfficer->name,
                    'email' => $store->accountOfficer->email,
                ] : null,
                // ... rest of store_info
            ],
            // ... rest of your response structure
        ]
    ]);
}
```

---

## Step 6: Add Routes

**File**: `routes/api.php` (or your API routes file)

Add these routes:

```php
// Account Officer routes
Route::prefix('admin/account-officers')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/', [AccountOfficerController::class, 'index']);
    Route::get('/me/dashboard', [AccountOfficerController::class, 'myDashboard']);
    Route::get('/{id}/vendors', [AccountOfficerController::class, 'getVendors']);
});

// Alternative route for my vendors (Account Officer)
Route::prefix('admin/vendors')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/assigned-to-me', [AccountOfficerController::class, 'myVendors']);
});

// Store routes - add to existing store routes
Route::prefix('admin/stores')->middleware(['auth:sanctum'])->group(function () {
    // ... your existing routes
    Route::put('/{id}/assign-account-officer', [StoreController::class, 'assignAccountOfficer']);
});
```

**Note**: Adjust middleware as needed (e.g., if you use `auth:api` instead of `auth:sanctum`).

---

## Step 7: Helper Methods Required

### User Model - Check Role Method

**File**: `app/Models/User.php`

Ensure you have a method to check if user has a role:

```php
/**
 * Check if user has a specific role
 */
public function hasRole($roleSlug)
{
    return $this->roles()->where('slug', $roleSlug)->where('is_active', 1)->exists();
}
```

### User Model - Check Permission Method

**File**: `app/Models/User.php`

Ensure you have a method to check permissions:

```php
/**
 * Check if user has a specific permission
 * Super Admin and Admin roles have all permissions
 */
public function hasPermission($permissionSlug)
{
    // Super Admin and Admin have all permissions
    if ($this->hasRole('super_admin') || $this->hasRole('admin')) {
        return true;
    }

    // Check if user has the permission through their roles
    return $this->roles()
        ->where('is_active', 1)
        ->whereHas('permissions', function($q) use ($permissionSlug) {
            $q->where('slug', $permissionSlug);
        })
        ->exists();
}
```

---

## Step 8: Testing Checklist

After implementation, test these scenarios:

### Super Admin Tests
- [ ] Can view all account officers via `GET /api/admin/account-officers`
- [ ] Can view vendors for any account officer via `GET /api/admin/account-officers/{id}/vendors`
- [ ] Can assign account officer to store via `PUT /api/admin/stores/{id}/assign-account-officer`
- [ ] Can unassign account officer (set to null)
- [ ] Can view all stores regardless of assignment
- [ ] Can filter stores by `account_officer_id`

### Account Officer Tests
- [ ] Can view own dashboard stats via `GET /api/admin/account-officers/me/dashboard`
- [ ] Can view own assigned vendors via `GET /api/admin/vendors/assigned-to-me`
- [ ] Can view details of assigned stores via `GET /api/admin/stores/{id}`
- [ ] Cannot view stores not assigned to them (403 error)
- [ ] Cannot assign/unassign account officers (403 error)
- [ ] Cannot view other account officers' vendors (403 error)

### Edge Cases
- [ ] Store with no account officer (null) - should work fine
- [ ] Account officer deleted - stores should have `account_officer_id` set to null (FK constraint)
- [ ] Invalid account_officer_id in assignment - should return 422 validation error
- [ ] User without account_officer role assigned as account officer - should return 422 error

---

## API Request/Response Examples

### 1. Assign Account Officer

**Request:**
```
PUT /api/admin/stores/123/assign-account-officer
Headers: Authorization: Bearer {token}
Body: {
  "account_officer_id": 5
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Account Officer assigned successfully",
  "data": {
    "id": 123,
    "store_name": "Example Store",
    "account_officer_id": 5,
    "account_officer": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 2. Unassign Account Officer

**Request:**
```
PUT /api/admin/stores/123/assign-account-officer
Headers: Authorization: Bearer {token}
Body: {
  "account_officer_id": null
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Account Officer unassigned successfully",
  "data": {
    "id": 123,
    "store_name": "Example Store",
    "account_officer_id": null,
    "account_officer": null
  }
}
```

### 3. Get Account Officers List

**Request:**
```
GET /api/admin/account-officers
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "vendor_count": 15,
      "active_vendors": 12,
      "inactive_vendors": 3
    }
  ]
}
```

### 4. Get Account Officer Vendors

**Request:**
```
GET /api/admin/account-officers/5/vendors?page=1&per_page=15&status=active&search=store
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "store_name": "Example Store",
      "store_email": "store@example.com",
      "status": "active",
      "account_officer": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 15,
    "last_page": 1
  }
}
```

### 5. Get My Dashboard (Account Officer)

**Request:**
```
GET /api/admin/account-officers/me/dashboard
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_vendors": 15,
    "active_vendors": 12,
    "inactive_vendors": 3
  }
}
```

---

## API Usage Examples (Practical)

### 1. Assign Account Officer to Store

**Request:**
```http
PUT /api/admin/stores/123/assign-account-officer
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "account_officer_id": 5
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Account Officer assigned successfully",
  "data": {
    "id": 123,
    "store_name": "Example Store",
    "account_officer_id": 5,
    "account_officer": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Note:** To unassign, send `"account_officer_id": null`

---

### 2. Get All Account Officers (Super Admin)

**Request:**
```http
GET /api/admin/account-officers
Authorization: Bearer {super_admin_token}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "vendor_count": 15,
      "active_vendors": 12,
      "inactive_vendors": 3
    },
    {
      "id": 6,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "vendor_count": 8,
      "active_vendors": 7,
      "inactive_vendors": 1
    }
  ]
}
```

---

### 3. Get My Dashboard (Account Officer)

**Request:**
```http
GET /api/admin/account-officers/me/dashboard?period=this_month
Authorization: Bearer {account_officer_token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_vendors": 15,
    "active_vendors": 12,
    "inactive_vendors": 3
  }
}
```

**Query Parameters:**
- `period` (optional): `today`, `this_week`, `this_month`, `last_month`, `this_year`, or omit for all time

---

### 4. Get My Assigned Vendors (Account Officer)

**Request:**
```http
GET /api/admin/vendors/assigned-to-me?page=1&per_page=15&status=active&search=store&period=this_month
Authorization: Bearer {account_officer_token}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "store_name": "Example Store",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "account_officer": {
        "id": 5,
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 45
  }
}
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `per_page` (optional, default: 15): Items per page
- `status` (optional): `active`, `pending`, `suspended`, or omit for all
- `search` (optional): Search by store name
- `period` (optional): `today`, `this_week`, `this_month`, `last_month`, `this_year`, or omit for all time

---

### 5. Get Vendors for Specific Account Officer (Super Admin)

**Request:**
```http
GET /api/admin/account-officers/5/vendors?page=1&per_page=15&status=active&search=store
Authorization: Bearer {super_admin_token}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "store_name": "Example Store",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 45
  }
}
```

---

## Features Summary

### Super Admin Capabilities
- ✅ View all account officers with vendor counts
- ✅ Assign/unassign account officers to stores
- ✅ View vendors for any account officer
- ✅ Filter stores by account officer
- ✅ Full access to all stores and vendors

### Account Officer Capabilities
- ✅ View only assigned vendors
- ✅ View dashboard stats (total, active, inactive vendors)
- ✅ Access assigned vendor details
- ✅ Filter assigned vendors by status and search
- ❌ Cannot view unassigned stores
- ❌ Cannot assign/unassign vendors
- ❌ Cannot view other account officers' vendors

### Access Control
- ✅ Account Officers are restricted to their assigned stores only
- ✅ Super Admins have full access to all stores
- ✅ Proper permission checks on all endpoints
- ✅ Role-based middleware enforcement
- ✅ Backend validation prevents unauthorized access

---

## Important Notes

1. **Authentication**: All endpoints require authentication. Use your existing auth middleware.

2. **Permission Checks**: 
   - Super Admin has `sellers.assign_account_officer` permission (or all permissions via `*.*`)
   - Account Officer has `account_officer_vendors.view` and `account_officer_vendors.view_details` permissions

3. **Role Checks**: 
   - Use `hasRole('account_officer')` to check if user is Account Officer
   - Use `hasPermission('sellers.assign_account_officer')` to check if user can assign

4. **Store Details Response**: Make sure the store details endpoint (`GET /api/admin/stores/{id}/details`) includes `account_officer` in the response:
   ```json
   {
     "store_info": {
       "id": 123,
       "store_name": "...",
       "account_officer": {
         "id": 5,
         "name": "John Doe",
         "email": "john@example.com"
       }
     }
   }
   ```

5. **Error Responses**: Always return consistent error format:
   ```json
   {
     "status": "error",
     "message": "Error description"
   }
   ```

---

## Summary

**Files to Create/Modify:**

1. ✅ Migration: `add_account_officer_to_stores_table.php`
2. ✅ Model: `Store.php` (add relationship, scope, fillable)
3. ✅ Model: `User.php` (add relationship, scope, helper methods)
4. ✅ Seeder: `AccountOfficerPermissionsSeeder.php`
5. ✅ Controller: `AccountOfficerController.php` (new)
6. ✅ Controller: `StoreController.php` (add method, update existing methods)
7. ✅ Routes: `api.php` (add new routes)

**Database Changes:**
- Add `account_officer_id` column to `stores` table
- Add foreign key constraint
- Add index

**RBAC Setup:**
- Create 3 new permissions
- Create `account_officer` role
- Assign permissions to role

**API Endpoints:**
- 4 new endpoints in AccountOfficerController
- 1 new endpoint in StoreController
- 2 updated endpoints in StoreController

Once all these are implemented, the frontend will work seamlessly!


