// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { CustomerOrderSummary } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import CustomerCard from '@/components/admin/CustomerCard';
import { Search, Download, Users } from 'lucide-react';
import { exportCustomersToCSV, getExportFilename } from '@/lib/export-utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'total_spent' | 'total_orders' | 'last_order_date'>('total_spent');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_order_summary')
        .select('*')
        .order('total_spent', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers
    .filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'total_orders':
          return b.total_orders - a.total_orders;
        case 'total_spent':
          return b.total_spent - a.total_spent;
        case 'last_order_date':
          if (!a.last_order_date) return 1;
          if (!b.last_order_date) return -1;
          return new Date(b.last_order_date).getTime() - new Date(a.last_order_date).getTime();
        default:
          return 0;
      }
    });

  const handleExport = () => {
    exportCustomersToCSV(customers, getExportFilename('customers'));
  };

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const avgOrderValue = totalCustomers > 0 ? totalRevenue / customers.reduce((sum, c) => sum + c.total_orders, 0) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-600 mt-1">Manage and view customer information</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Customers</p>
              <p className="text-3xl font-bold">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <span className="text-white text-xl font-bold">£</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold">£{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-3 rounded-lg">
              <span className="text-white text-xl font-bold">Ø</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Avg Order Value</p>
              <p className="text-3xl font-bold">£{avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="total_spent">Sort by Total Spent</option>
            <option value="total_orders">Sort by Total Orders</option>
            <option value="name">Sort by Name</option>
            <option value="last_order_date">Sort by Last Order</option>
          </select>
        </div>
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}
