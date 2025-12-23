/**
 * UI Utilities
 * Helper functions for UI interactions
 */

/**
 * Show error message in an element
 */
export function showError(elementId: string, message: string): void {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.remove("hidden");
    }
}

/**
 * Hide error message
 */
export function hideError(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add("hidden");
    }
}

/**
 * Show success message
 */
export function showSuccess(elementId: string, message: string): void {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.remove("hidden");
    }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

/**
 * Format datetime
 */
export function formatDateTime(date: string): string {
    return new Date(date).toLocaleString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Download file
 */
export function downloadFile(
    content: string,
    filename: string,
    type: string = "text/csv"
): void {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

/**
 * Confirm dialog
 */
export function confirm(message: string): boolean {
    return window.confirm(message);
}
