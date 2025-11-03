// Export Utilities
// Functions to export data to CSV and other formats

import { Order, Customer, AnalyticsEvent, Product } from './types';

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: any[], headers: string[]): string {
  if (!data || data.length === 0) return '';

  // Create header row
  const headerRow = headers.join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];

      // Handle different data types
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'object') {
        // Convert objects/arrays to JSON string
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else if (typeof value === 'string') {
        // Escape quotes in strings
        return `"${value.replace(/"/g, '""')}"`;
      } else {
        return value;
      }
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(filename: string, csvContent: string): void {
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
 * Export orders to CSV
 */
export function exportOrdersToCSV(orders: Order[], filename = 'orders.csv'): void {
  const headers = [
    'id',
    'customer_name',
    'contact',
    'total',
    'fulfillment_status',
    'payment_status',
    'tracking_number',
    'created_at',
    'updated_at',
  ];

  const flattenedOrders = orders.map(order => ({
    id: order.id,
    customer_name: order.customer_name,
    contact: order.contact,
    total: order.total,
    fulfillment_status: order.fulfillment_status,
    payment_status: order.payment_status,
    tracking_number: order.tracking_number || '',
    created_at: new Date(order.created_at).toLocaleString(),
    updated_at: order.updated_at ? new Date(order.updated_at).toLocaleString() : '',
  }));

  const csv = convertToCSV(flattenedOrders, headers);
  downloadCSV(filename, csv);
}

/**
 * Export customers to CSV
 */
export function exportCustomersToCSV(customers: Customer[], filename = 'customers.csv'): void {
  const headers = [
    'id',
    'name',
    'email',
    'phone',
    'total_orders',
    'total_spent',
    'average_order_value',
    'last_order_date',
    'first_order_date',
    'created_at',
  ];

  const flattenedCustomers = customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone || '',
    total_orders: customer.total_orders,
    total_spent: customer.total_spent,
    average_order_value: customer.average_order_value,
    last_order_date: customer.last_order_date ? new Date(customer.last_order_date).toLocaleString() : '',
    first_order_date: customer.first_order_date ? new Date(customer.first_order_date).toLocaleString() : '',
    created_at: new Date(customer.created_at).toLocaleString(),
  }));

  const csv = convertToCSV(flattenedCustomers, headers);
  downloadCSV(filename, csv);
}

/**
 * Export products to CSV
 */
export function exportProductsToCSV(products: Product[], filename = 'products.csv'): void {
  const headers = [
    'id',
    'name',
    'category',
    'flavor',
    'price',
    'stock',
    'description',
    'ingredients',
    'created_at',
  ];

  const flattenedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    flavor: product.flavor,
    price: product.price,
    stock: product.stock,
    description: product.description,
    ingredients: product.ingredients,
    created_at: new Date(product.created_at).toLocaleString(),
  }));

  const csv = convertToCSV(flattenedProducts, headers);
  downloadCSV(filename, csv);
}

/**
 * Export analytics to CSV
 */
export function exportAnalyticsToCSV(analytics: AnalyticsEvent[], filename = 'analytics.csv'): void {
  const headers = [
    'id',
    'event_type',
    'product_id',
    'page',
    'session_id',
    'duration_seconds',
    'scroll_depth_percentage',
    'device_type',
    'browser',
    'created_at',
  ];

  const flattenedAnalytics = analytics.map(event => ({
    id: event.id,
    event_type: event.event_type,
    product_id: event.product_id || '',
    page: event.page,
    session_id: event.session_id || '',
    duration_seconds: event.duration_seconds || '',
    scroll_depth_percentage: event.scroll_depth_percentage || '',
    device_type: event.device_type || '',
    browser: event.browser || '',
    created_at: new Date(event.created_at).toLocaleString(),
  }));

  const csv = convertToCSV(flattenedAnalytics, headers);
  downloadCSV(filename, csv);
}

/**
 * Export orders with full details (including products) to CSV
 */
export function exportDetailedOrdersToCSV(orders: Order[], filename = 'detailed-orders.csv'): void {
  // Flatten orders with product details
  const flattenedOrders: any[] = [];

  orders.forEach(order => {
    order.products.forEach(item => {
      flattenedOrders.push({
        order_id: order.id,
        order_date: new Date(order.created_at).toLocaleString(),
        customer_name: order.customer_name,
        customer_contact: order.contact,
        product_name: item.product.name,
        product_flavor: item.product.flavor,
        quantity: item.quantity,
        weight_kg: item.selectedWeight,
        price_per_kg: item.pricePerKg,
        discount_applied: item.appliedDiscount * 100 + '%',
        product_total: (item.pricePerKg * item.selectedWeight * (1 - item.appliedDiscount)).toFixed(2),
        order_total: order.total,
        fulfillment_status: order.fulfillment_status,
        payment_status: order.payment_status,
        tracking_number: order.tracking_number || '',
      });
    });
  });

  const headers = [
    'order_id',
    'order_date',
    'customer_name',
    'customer_contact',
    'product_name',
    'product_flavor',
    'quantity',
    'weight_kg',
    'price_per_kg',
    'discount_applied',
    'product_total',
    'order_total',
    'fulfillment_status',
    'payment_status',
    'tracking_number',
  ];

  const csv = convertToCSV(flattenedOrders, headers);
  downloadCSV(filename, csv);
}

/**
 * Export data with custom mapping
 */
export function exportToCSV<T>(
  data: T[],
  headers: (keyof T)[],
  filename: string,
  mapper?: (item: T) => any
): void {
  const mappedData = mapper ? data.map(mapper) : data;
  const csv = convertToCSV(mappedData, headers as string[]);
  downloadCSV(filename, csv);
}

/**
 * Format date for filename
 */
export function getExportFilename(prefix: string, extension = 'csv'): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `${prefix}_${dateStr}_${timeStr}.${extension}`;
}

/**
 * Print data (open print dialog)
 */
export function printData(htmlContent: string, title = 'Print'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

/**
 * Convert data to JSON and download
 */
export function exportToJSON(data: any, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
