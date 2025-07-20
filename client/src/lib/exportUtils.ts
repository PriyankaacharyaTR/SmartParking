/**
 * Utility functions for exporting data to CSV and other formats
 */

/**
 * Convert an array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Optional custom headers (defaults to object keys)
 * @returns CSV formatted string
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) return '';
  
  // Use provided headers or extract from first object
  const columnHeaders = headers || Object.keys(data[0]);
  
  // Create CSV header row
  let csv = columnHeaders.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = columnHeaders.map(header => {
      // Get value, handle special cases
      const value = item[header]?.toString() || '';
      
      // Escape commas and quotes
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

/**
 * Download data as a CSV file
 * @param data Array of objects to convert to CSV
 * @param filename Filename for the download (without extension)
 * @param headers Optional custom headers
 */
export function downloadCSV(data: any[], filename: string, headers?: string[]): void {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  // Add to DOM, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Prepare analytics data for export
 * @param dataType Type of data to export
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Formatted data ready for export
 */
export function prepareAnalyticsDataForExport(
  dataType: 'revenue' | 'occupancy' | 'vehicles' | 'bookings' | 'all',
  startDate?: Date,
  endDate?: Date
): any[] {
  // This is where you would normally fetch from API or filter existing data
  // For now using sample data
  
  switch (dataType) {
    case 'revenue':
      return [
        { date: '2023-05-01', revenue: 12400, forecast: false },
        { date: '2023-05-02', revenue: 14800, forecast: false },
        { date: '2023-05-03', revenue: 15900, forecast: false },
        { date: '2023-05-04', revenue: 19200, forecast: false },
        { date: '2023-05-05', revenue: 24500, forecast: false },
        { date: '2023-05-06', revenue: 28700, forecast: false },
        { date: '2023-05-07', revenue: 31200, forecast: true },
        { date: '2023-05-08', revenue: 33800, forecast: true },
      ];
      
    case 'occupancy':
      return [
        { day: 'Monday', occupancy: 62, peak_hour: '18:00' },
        { day: 'Tuesday', occupancy: 68, peak_hour: '17:00' },
        { day: 'Wednesday', occupancy: 72, peak_hour: '17:30' },
        { day: 'Thursday', occupancy: 83, peak_hour: '18:00' },
        { day: 'Friday', occupancy: 92, peak_hour: '18:00' },
        { day: 'Saturday', occupancy: 78, peak_hour: '14:00' },
        { day: 'Sunday', occupancy: 56, peak_hour: '15:00' },
      ];
      
    case 'vehicles':
      return [
        { type: 'Car', count: 620, percentage: 62 },
        { type: 'EV', count: 150, percentage: 15 },
        { type: 'SUV', count: 120, percentage: 12 },
        { type: 'Bike', count: 80, percentage: 8 },
        { type: 'Truck', count: 30, percentage: 3 },
      ];
      
    case 'bookings':
      return [
        { date: '2023-05-01', total: 145, completed: 142, cancelled: 3 },
        { date: '2023-05-02', total: 156, completed: 152, cancelled: 4 },
        { date: '2023-05-03', total: 162, completed: 159, cancelled: 3 },
        { date: '2023-05-04', total: 178, completed: 170, cancelled: 8 },
        { date: '2023-05-05', total: 210, completed: 203, cancelled: 7 },
        { date: '2023-05-06', total: 187, completed: 180, cancelled: 7 },
        { date: '2023-05-07', total: 148, completed: 142, cancelled: 6 },
      ];
      
    case 'all':
    default:
      // Combine all data
      return [
        { date: '2023-05-01', revenue: 12400, occupancy_percentage: 62, bookings_count: 145 },
        { date: '2023-05-02', revenue: 14800, occupancy_percentage: 68, bookings_count: 156 },
        { date: '2023-05-03', revenue: 15900, occupancy_percentage: 72, bookings_count: 162 },
        { date: '2023-05-04', revenue: 19200, occupancy_percentage: 83, bookings_count: 178 },
        { date: '2023-05-05', revenue: 24500, occupancy_percentage: 92, bookings_count: 210 },
        { date: '2023-05-06', revenue: 28700, occupancy_percentage: 78, bookings_count: 187 },
        { date: '2023-05-07', revenue: 31200, occupancy_percentage: 56, bookings_count: 148 },
      ];
  }
}
