// frontend/src/utils/csvUtils.js

/**
 * Converts an array of objects to CSV format.
 * @param {Array<Object>} data The array of objects to convert.
 * @param {Array<string>} headers Optional array of header keys to include and their order.
 * @returns {string} The CSV formatted string.
 */
export const convertToCSV = (data, headers) => {
    if (!data || data.length === 0) {
        return '';
    }

    // Determine headers if not provided
    const keys = headers || Object.keys(data[0]);

    // Create CSV header row
    const csvHeader = keys.join(',');

    // Create CSV data rows
    const csvBody = data.map(row => {
        return keys.map(key => {
            let value = row[key];
            if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                // Enclose string with double quotes if it contains comma, double quotes or new line
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    }).join('\n');

    return `${csvHeader}\n${csvBody}`;
};

/**
 * Downloads a CSV string as a file.
 * @param {string} csvString The CSV data as a string.
 * @param {string} filename The desired filename for the download.
 */
export const downloadCSV = (csvString, filename = 'data.csv') => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
    } else {
        // Fallback for browsers that do not support the download attribute
        window.open(`data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`);
    }
};
