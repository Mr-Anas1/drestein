/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional array of header names. If not provided, uses object keys
 * @returns {string} CSV formatted string
 */
export function convertToCSV(data, headers = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = csvHeaders.map(header => `"${String(header).replace(/"/g, '""')}"`).join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }

      // Handle objects and arrays
      if (typeof value === 'object') {
        return `"${String(JSON.stringify(value)).replace(/"/g, '""')}"`;
      }

      // Handle strings with special characters
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export events data to CSV
 * @param {Array} events - Array of event objects
 */
export function exportEventsToCSV(events) {
  const headers = ['id', 'title', 'description', 'category', 'venue', 'date', 'time', 'department', 'registrationDeadline', 'maxParticipants'];
  const csv = convertToCSV(events, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `events_${timestamp}.csv`);
}

/**
 * Export special events data to CSV
 * @param {Array} specialEvents - Array of special event objects
 */
export function exportSpecialEventsToCSV(specialEvents) {
  const headers = ['id', 'title', 'description', 'category', 'location', 'date', 'time', 'department', 'maxParticipants', 'registrationDeadline'];
  const csv = convertToCSV(specialEvents, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `special_events_${timestamp}.csv`);
}

/**
 * Export passes data to CSV
 * @param {Array} passes - Array of pass objects
 */
export function exportPassesToCSV(passes) {
  const headers = ['id', 'userName', 'userEmail', 'userUid', 'passType', 'passName', 'passPrice', 'paymentVerified', 'paymentStatus', 'status', 'orderId', 'purchasedAt'];
  const csv = convertToCSV(passes, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `passes_${timestamp}.csv`);
}
