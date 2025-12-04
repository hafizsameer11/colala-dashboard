/**
 * Formats a number or string into a currency string with comma separators.
 * Example: 1200 -> "₦1,200.00"
 * 
 * @param amount The amount to format (number or string)
 * @returns The formatted currency string
 */
export const formatCurrency = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null || amount === "") {
        return "₦0.00";
    }

    // Convert to string to handle potential string inputs like "1,200" or "₦1200"
    let numStr = String(amount);

    // Remove existing currency symbols and commas
    numStr = numStr.replace(/[₦,]/g, "").trim();

    // Parse to number
    const num = parseFloat(numStr);

    if (isNaN(num)) {
        return "₦0.00";
    }

    // Format with commas and 2 decimal places
    // We use 'en-NG' locale for Nigeria, but 'en-US' also works for standard comma separation
    return `₦${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
