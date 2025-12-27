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
  // If "All time" or empty period, return all data
  if (!period || period === "All time" || period.trim() === "") {
    return data;
  }
  
  const now = new Date();
  let startDate: Date;
  
  switch (period.trim()) {
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
      // Unknown period, return all data
      return data;
  }
  
  const dateFields = Array.isArray(dateField) ? dateField : [dateField];
  
  return data.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    
    // Try to find a date field in the item
    let dateValue: string | undefined;
    for (const field of dateFields) {
      if (item[field]) {
        dateValue = item[field];
        break;
      }
    }
    
    // If no date field found, include the item (don't filter it out)
    if (!dateValue) {
      // In development, log this for debugging
      if (process.env.NODE_ENV === 'development') {
        console.warn('filterByPeriod: No date field found for item:', item);
      }
      return true; // Include items without dates rather than excluding them
    }
    
    try {
      let date: Date;
      
      // Handle custom format: "26-12-2025/20:10PM"
      if (dateValue.includes('/') && dateValue.includes('-')) {
        const parts = dateValue.split('/');
        if (parts.length === 2) {
          const datePart = parts[0].trim(); // "26-12-2025"
          const timePart = parts[1].trim(); // "20:10PM"
          
          // Parse date part: DD-MM-YYYY
          const dateComponents = datePart.split('-');
          if (dateComponents.length === 3) {
            const day = parseInt(dateComponents[0], 10);
            const month = parseInt(dateComponents[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(dateComponents[2], 10);
            
            // Parse time part: HH:MMAM/PM
            let hours = 0;
            let minutes = 0;
            if (timePart) {
              const isPM = timePart.toUpperCase().includes('PM');
              const timeOnly = timePart.replace(/[AP]M/i, '').trim();
              const timeComponents = timeOnly.split(':');
              if (timeComponents.length >= 2) {
                hours = parseInt(timeComponents[0], 10);
                minutes = parseInt(timeComponents[1], 10);
                if (isPM && hours !== 12) hours += 12;
                if (!isPM && hours === 12) hours = 0;
              }
            }
            
            date = new Date(year, month, day, hours, minutes);
          } else {
            date = new Date(dateValue);
          }
        } else {
          date = new Date(dateValue);
        }
      } else {
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Invalid date, include it anyway (don't filter out)
        return true;
      }
      // Check if date is within the period range
      return date >= startDate && date <= now;
    } catch (error) {
      // Error parsing date, include it anyway (don't filter out)
      if (process.env.NODE_ENV === 'development') {
        console.warn('filterByPeriod: Error parsing date:', dateValue, error);
      }
      return true;
    }
  });
}

