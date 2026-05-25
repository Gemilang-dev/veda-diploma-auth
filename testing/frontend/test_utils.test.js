import { describe, it, expect } from 'vitest';

/**
 * Utility function to be tested
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
};

describe('Utility: formatDate', () => {
    it('should format date strings correctly', () => {
        const input = '2023-10-25';
        const result = formatDate(input);
        expect(result).toBe('October 25, 2023');
    });

    it('should return N/A if input is empty', () => {
        expect(formatDate(null)).toBe('N/A');
        expect(formatDate('')).toBe('N/A');
    });

    it('should handle ISO date strings with time', () => {
        const input = '2023-10-25T14:30:00Z';
        expect(formatDate(input)).toBe('October 25, 2023');
    });
});
