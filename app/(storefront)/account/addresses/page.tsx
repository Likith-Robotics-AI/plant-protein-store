'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Plus, Edit2, Trash2, Home, Building, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Address {
  id: string;
  address_type: 'shipping' | 'billing' | 'both';
  is_default: boolean;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export default function AddressesPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && customer) {
      fetchAddresses();
    }
  }, [isAuthenticated, customer]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`/api/customer/addresses?customer_id=${customer?.id}`);
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Address deleted successfully');
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete address');
      }
    } catch (error) {
      setError('An error occurred while deleting the address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/customer/addresses/${addressId}/set-default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_id: customer?.id }),
      });

      if (response.ok) {
        setSuccess('Default address updated');
        fetchAddresses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update default address');
      }
    } catch (error) {
      setError('An error occurred');
    }
  };

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Account
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Saved Addresses</h1>
                <p className="text-gray-600">Manage your shipping and billing addresses</p>
              </div>
            </div>
            <Link
              href="/account/addresses/new"
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Address
            </Link>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Addresses List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">No Addresses Yet</h2>
            <p className="text-gray-600 mb-6">Add your first address to make checkout faster</p>
            <Link
              href="/account/addresses/new"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-bold"
            >
              <Plus className="w-5 h-5" />
              Add Your First Address
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-xl shadow-md p-6 relative ${
                  address.is_default ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {address.is_default && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      DEFAULT
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  {address.address_type === 'shipping' ? (
                    <Home className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  ) : address.address_type === 'billing' ? (
                    <Building className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  ) : (
                    <MapPin className="w-6 h-6 text-green-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{address.full_name}</h3>
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {address.address_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{address.address_line1}</p>
                    {address.address_line2 && (
                      <p className="text-sm text-gray-700">{address.address_line2}</p>
                    )}
                    <p className="text-sm text-gray-700">
                      {address.city}
                      {address.state && `, ${address.state}`} {address.postal_code}
                    </p>
                    <p className="text-sm text-gray-700">{address.country}</p>
                    {address.phone && (
                      <p className="text-sm text-gray-600 mt-1">📞 {address.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
                    >
                      Set as Default
                    </button>
                  )}
                  <Link
                    href={`/account/addresses/${address.id}/edit`}
                    className="ml-auto text-sm font-semibold text-gray-600 hover:text-gray-800 transition flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-700 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
