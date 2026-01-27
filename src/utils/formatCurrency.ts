/**
 * Formats a number or string into a currency string with comma separators.
 * Example: 1200 -> "₦1,200" (removes trailing .00)
 * Example: 1200.50 -> "₦1,200.50"
 * 
 * @param amount The amount to format (number or string)
 * @returns The formatted currency string
 */
export const formatCurrency = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null || amount === "") {
        return "₦0";
    }

    // Convert to string to handle potential string inputs like "1,200" or "₦1200"
    let numStr = String(amount);

    // Remove any non-numeric characters except digits, decimal point and minus sign
    // This makes it robust for values like "₦1,200", "N2,000.00", "+1,000", etc.
    numStr = numStr.replace(/[^\d.-]/g, "").trim();

    // Parse to number
    const num = parseFloat(numStr);

    if (isNaN(num)) {
        return "₦0";
    }

    // Format with commas and remove trailing .00
    // We use 'en-NG' locale for Nigeria, but 'en-US' also works for standard comma separation
    let formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Remove trailing .00
    formatted = formatted.replace(/\.00$/, '');
    
    return `₦${formatted}`;
};
