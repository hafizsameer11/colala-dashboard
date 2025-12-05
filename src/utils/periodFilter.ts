/**
 * Utility function to filter data by time period
 * @param data - Array of items to filter
 * @param period - Time period string ("This Week", "Last Month", "Last 6 Months", "Last Year", "All time")
 * @param dateField - Field name(s) to check for date (can be string or array of strings)
 * @returns Filtered array of items
 */
export function filterByPeriod<T extends Record<string, any>>(
  data: T[],
  period: string,
  dateField: string | string[] = ['created_at', 'date', 'formatted_date', 'order_date', 'last_message_at', 'chat_date']
): T[] {
  if (period === "All time") return data;
  
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case "This Week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "Last Month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case "Last 6 Months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case "Last Year":
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      return data;
  }
  
  const dateFields = Array.isArray(dateField) ? dateField : [dateField];
  
  return data.filter((item) => {
    // Try to find a date field in the item
    let dateValue: string | undefined;
    for (const field of dateFields) {
      if (item[field]) {
        dateValue = item[field];
        break;
      }
    }
    
    if (!dateValue) return false;
    
    try {
      const date = new Date(dateValue);
      // Check if date is valid
      if (isNaN(date.getTime())) return false;
      return date >= startDate && date <= now;
    } catch {
      return false;
    }
  });
}

