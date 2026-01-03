/**
 * Format currency for Indian Rupees
 * Helper function used across the application
 */
export function formatCurrency(amount: number): string {
    if (amount === 0) return "₹0"

    // Format for Indian numbering system
    if (amount >= 10000000) { // 1 Crore
        return `₹${(amount / 10000000).toFixed(1)} Cr`
    } else if (amount >= 100000) { // 1 Lakh
        return `₹${(amount / 100000).toFixed(1)} L`
    } else if (amount >= 1000) { // 1 Thousand
        return `₹${(amount / 1000).toFixed(1)}k`
    } else {
        return `₹${amount.toFixed(0)}`
    }
}
