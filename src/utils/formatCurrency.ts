/**
 * Shared currency formatter — standardized to PKR throughout the app.
 * Use this instead of inline Intl.NumberFormat calls.
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
    }).format(amount);
}
