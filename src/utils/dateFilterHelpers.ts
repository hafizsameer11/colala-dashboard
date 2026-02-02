import { DateFilterState } from '../components/DateFilter';

/**
 * Map UI period options to API period values
 */
export const mapPeriodToApi = (period: string): string | null => {
  const periodMap: Record<string, string> = {
    'Today': 'today',
    'This Week': 'this_week',
    'This Month': 'this_month',
    'Last Month': 'last_month',
    'This Year': 'this_year',
    'Last Year': 'this_year',
  };
  
  if (period === 'All time' || !period) {
    return null;
  }
  
  return periodMap[period] || null;
};

/**
 * Build date filter query parameters for API calls
 * Priority: period > date_from/date_to
 * @param dateFilter - DateFilterState from DateFilter component
 * @returns Object with period, dateFrom, dateTo for API calls
 */
export const getDateFilterParams = (dateFilter: DateFilterState) => {
  if (dateFilter.filterType === 'period' && dateFilter.period) {
    return {
      period: dateFilter.period !== 'All time' ? dateFilter.period : undefined,
      dateFrom: undefined,
      dateTo: undefined,
    };
  } else if (dateFilter.filterType === 'custom' && dateFilter.dateFrom && dateFilter.dateTo) {
    return {
      period: undefined,
      dateFrom: dateFilter.dateFrom,
      dateTo: dateFilter.dateTo,
    };
  }
  
  return {
    period: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  };
};

/**
 * Build date filter query string for URL construction
 * @param dateFilter - DateFilterState from DateFilter component
 * @returns Query string with date filter parameters
 */
export const buildDateFilterQueryString = (dateFilter: DateFilterState): string => {
  let query = '';
  
  if (dateFilter.filterType === 'period' && dateFilter.period && dateFilter.period !== 'All time') {
    const apiPeriod = mapPeriodToApi(dateFilter.period);
    if (apiPeriod) {
      query += `&period=${apiPeriod}`;
    }
    return query; // Period takes priority
  }
  
  if (dateFilter.filterType === 'custom' && dateFilter.dateFrom && dateFilter.dateTo) {
    query += `&date_from=${dateFilter.dateFrom}`;
    query += `&date_to=${dateFilter.dateTo}`;
  }
  
  return query;
};

