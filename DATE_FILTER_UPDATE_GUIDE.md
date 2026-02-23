# Date Filter Implementation Guide

## Overview
This guide provides instructions for updating all admin panel pages to use the new `DateFilter` component that supports both period filters and custom date ranges.

## Components Created

### 1. DateFilter Component (`src/components/DateFilter.tsx`)
- Supports three filter types: `none`, `period`, `custom`
- Period options: Today, This Week, This Month, Last Month, This Year, All time
- Custom date range: date_from and date_to inputs
- Automatically handles priority: period > custom date range

### 2. Helper Functions (`src/utils/dateFilterHelpers.ts`)
- `mapPeriodToApi()` - Maps UI period labels to API values
- `getDateFilterParams()` - Returns period/dateFrom/dateTo for API calls
- `buildDateFilterQueryString()` - Builds query string for URLs

## Update Pattern for Pages

### Step 1: Import DateFilter
```typescript
import DateFilter, { DateFilterState } from "../../../components/DateFilter";
```

### Step 2: Replace Period State
**Before:**
```typescript
const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");
const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
const dateDropdownRef = useRef<HTMLDivElement>(null);
const datePeriodOptions = ["Today", "This Week", "This Month", "All time"];
```

**After:**
```typescript
const [dateFilter, setDateFilter] = useState<DateFilterState>({
  filterType: 'period',
  period: 'All time',
  dateFrom: null,
  dateTo: null,
});
```

### Step 3: Update Query Function Calls
**Before:**
```typescript
const { data } = useQuery({
  queryKey: ['data', currentPage, selectedPeriod],
  queryFn: () => getData(currentPage, selectedPeriod),
});
```

**After:**
```typescript
const { data } = useQuery({
  queryKey: ['data', currentPage, dateFilter.period, dateFilter.dateFrom, dateFilter.dateTo],
  queryFn: () => getData(
    currentPage,
    dateFilter.filterType === 'period' ? dateFilter.period || undefined : undefined,
    dateFilter.filterType === 'custom' ? dateFilter.dateFrom || undefined : undefined,
    dateFilter.filterType === 'custom' ? dateFilter.dateTo || undefined : undefined
  ),
});
```

### Step 4: Replace Date Dropdown UI
**Before:**
```tsx
<div className="relative" ref={dateDropdownRef}>
  <div onClick={handleDateDropdownToggle}>
    {selectedPeriod}
  </div>
  {isDateDropdownOpen && (
    <div>
      {datePeriodOptions.map((option) => (
        <div onClick={() => handleDatePeriodSelect(option)}>
          {option}
        </div>
      ))}
    </div>
  )}
</div>
```

**After:**
```tsx
<DateFilter
  defaultFilterType={dateFilter.filterType}
  defaultPeriod={dateFilter.period || 'All time'}
  defaultDateFrom={dateFilter.dateFrom}
  defaultDateTo={dateFilter.dateTo}
  onFilterChange={handleDateFilterChange}
/>
```

### Step 5: Update Export Config
**Before:**
```typescript
exportConfig={{
  dataType: "dataType",
  period: selectedPeriod !== "All time" ? selectedPeriod : undefined,
}}
```

**After:**
```typescript
exportConfig={{
  dataType: "dataType",
  period: dateFilter.filterType === 'period' && dateFilter.period && dateFilter.period !== 'All time' ? dateFilter.period : undefined,
  dateFrom: dateFilter.filterType === 'custom' ? dateFilter.dateFrom || undefined : undefined,
  dateTo: dateFilter.filterType === 'custom' ? dateFilter.dateTo || undefined : undefined,
}}
```

### Step 6: Remove Old Handlers
Remove:
- `handleDateDropdownToggle`
- `handleDatePeriodSelect`
- `handlePeriodChange` (if only used for date)
- `useEffect` for closing dropdown on outside click
- `dateDropdownRef`
- `isDateDropdownOpen` state
- `datePeriodOptions` array

### Step 7: Update PageHeader
**Before:**
```tsx
<PageHeader 
  title="Page Title" 
  onPeriodChange={handlePeriodChange}
  defaultPeriod={selectedPeriod}
  timeOptions={datePeriodOptions}
/>
```

**After:**
```tsx
<PageHeader 
  title="Page Title" 
  showDropdown={false}
/>
```

## Pages Already Updated
1. ✅ `src/pages/buyers_Mgt/customer_mgt/customer_mgt.tsx`
2. ✅ `src/pages/buyers_Mgt/ordersMgt/ordersMgt.tsx`
3. ✅ `src/pages/buyers_Mgt/Transactions/Transactions.tsx`

## Pages Needing Updates

### Buyers Management
- [ ] `src/pages/buyers_Mgt/customer_mgt/customerDetails/transaction/transaction.tsx`
- [ ] `src/pages/buyers_Mgt/customer_mgt/customerDetails/orders/orders.tsx`
- [ ] `src/pages/buyers_Mgt/customer_mgt/customerDetails/chats/chats.tsx`
- [ ] `src/pages/buyers_Mgt/customer_mgt/customerDetails/activity/activity.tsx`

### Sellers Management
- [ ] `src/pages/sellers_Mgt/Products_services/products_sevices.tsx`
- [ ] `src/pages/sellers_Mgt/stores/stores_mgt.tsx`
- [ ] `src/pages/sellers_Mgt/orders/orders_Mgt.tsx`
- [ ] `src/pages/sellers_Mgt/Transactions/transactions.tsx`
- [ ] `src/pages/sellers_Mgt/store_KYC/storeKYC.tsx`
- [ ] `src/pages/sellers_Mgt/promotions/promotions.tsx`
- [ ] `src/pages/sellers_Mgt/subscription/subscription.tsx`

### General Pages
- [ ] `src/pages/general/support/support.tsx`
- [ ] `src/pages/general/chats/chats.tsx`
- [ ] `src/pages/general/disputes/disputes.tsx`
- [ ] `src/pages/general/notifications/notifications.tsx` (via notificationsfilters.tsx)
- [ ] `src/pages/general/ratingsReviews/ratingsReviews.tsx`
- [ ] `src/pages/general/leaderBoard/leaderBoard.tsx`
- [ ] `src/pages/general/allUsers/allUsers.tsx`
- [ ] `src/pages/general/balance/balance.tsx`
- [ ] `src/pages/general/withdrawalRequests/withdrawalRequests.tsx`

## Query Functions Updated
✅ `getUsersList`
✅ `getBuyerOrders`
✅ `getUserOrders`
✅ `getUserChats`
✅ `getUserTransactions`
✅ `getAdminTransactions`
✅ `getSellerUsers`
✅ `getAdminStores`
✅ `getAllUsers`
✅ `getAdminPromotions`
✅ `getAdminSubscriptions`
✅ `getAdminProducts`
✅ `getAdminServices`
✅ `getSupportTickets` (support.ts)
✅ `getChats` (chats.ts)
✅ `getDisputesList` (disputes.ts)
✅ `getNotifications` (notifications.ts)
✅ `getBanners` (banners.ts)
✅ `getWithdrawalRequests` (withdrawalRequests.ts)

## Notes
- All date filters follow priority: period > date_from/date_to
- Date format must be `YYYY-MM-DD` (e.g., `2025-01-15`)
- Both `date_from` and `date_to` must be provided together for custom range
- When period is provided, `date_from` and `date_to` are ignored by backend
- Export functionality automatically uses the same date filters

