import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // orders, customers, products, analytics
    const format = searchParams.get('format') || 'json'; // json, csv

    if (!type) {
      return NextResponse.json(
        { error: 'Export type is required' },
        { status: 400 }
      );
    }

    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'orders':
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (ordersError) throw ordersError;
        data = orders || [];
        filename = `orders_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'customers':
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });
        if (customersError) throw customersError;
        data = customers || [];
        filename = `customers_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'products':
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false});
        if (productsError) throw productsError;
        data = products || [];
        filename = `products_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'analytics':
        const { data: analytics, error: analyticsError } = await supabase
          .from('analytics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10000);
        if (analyticsError) throw analyticsError;
        data = analytics || [];
        filename = `analytics_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        );
    }

    if (format === 'csv') {
      // Convert to CSV
      if (data.length === 0) {
        return NextResponse.json(
          { error: 'No data to export' },
          { status: 404 }
        );
      }

      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')];

      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      });

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // Default: return JSON
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
