'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ArrowLeft, AlertCircle } from 'lucide-react';
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

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams();
  const addressId = params.id as string;
  const { customer, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    address_type: 'shipping',
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    is_default: false,
  });
  const [fieldErrors, setFieldErrors] = useState<{
    full_name?: string;
    address_line1?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && addressId) {
      fetchAddress();
    }
  }, [isAuthenticated, addressId]);

  const fetchAddress = async () => {
    try {
      const response = await fetch(`/api/customer/addresses/${addressId}`);
      if (response.ok) {
        const data = await response.json();
        const address = data.address;
        setFormData({
          address_type: address.address_type || 'shipping',
          full_name: address.full_name || '',
          address_line1: address.address_line1 || '',
          address_line2: address.address_line2 || '',
          city: address.city || '',
          state: address.state || '',
          postal_code: address.postal_code || '',
          country: address.country || '',
          phone: address.phone || '',
          is_default: address.is_default || false,
        });
      } else {
        router.push('/account/addresses');
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
      router.push('/account/addresses');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error for this field when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);

    // Validation
    const errors: typeof fieldErrors = {};

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }

    if (!formData.address_line1.trim()) {
      errors.address_line1 = 'Address is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.postal_code.trim()) {
      errors.postal_code = 'Postal code is required';
    }

    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/account/addresses');
      } else {
        // Map errors to fields if possible
        const errorMessage = data.error || 'Failed to update address';
        if (errorMessage.toLowerCase().includes('name')) {
          setFieldErrors({ full_name: errorMessage });
        } else if (errorMessage.toLowerCase().includes('address')) {
          setFieldErrors({ address_line1: errorMessage });
        } else if (errorMessage.toLowerCase().includes('city')) {
          setFieldErrors({ city: errorMessage });
        } else if (errorMessage.toLowerCase().includes('postal')) {
          setFieldErrors({ postal_code: errorMessage });
        } else {
          setFieldErrors({ full_name: errorMessage });
        }
      }
    } catch (error) {
      setFieldErrors({ full_name: 'An error occurred while updating the address' });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || fetchLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading address...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Link
          href="/account/addresses"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Addresses
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Edit Address</h1>
              <p className="text-gray-600">Update your shipping or billing address</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          {/* Address Type */}
          <div>
            <label htmlFor="address_type" className="block text-sm font-bold text-gray-700 mb-2">
              Address Type
            </label>
            <select
              id="address_type"
              name="address_type"
              value={formData.address_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            >
              <option value="shipping">Shipping</option>
              <option value="billing">Billing</option>
              <option value="both">Both Shipping & Billing</option>
            </select>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-bold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition ${
                fieldErrors.full_name
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
              }`}
              placeholder="John Doe"
            />
            {fieldErrors.full_name && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.full_name}
              </p>
            )}
          </div>

          {/* Address Line 1 */}
          <div>
            <label htmlFor="address_line1" className="block text-sm font-bold text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <input
              type="text"
              id="address_line1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition ${
                fieldErrors.address_line1
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
              }`}
              placeholder="123 Main Street"
            />
            {fieldErrors.address_line1 && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.address_line1}
              </p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label htmlFor="address_line2" className="block text-sm font-bold text-gray-700 mb-2">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              id="address_line2"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="Apt 4B"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-bold text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition ${
                fieldErrors.city
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
              }`}
              placeholder="New York"
            />
            {fieldErrors.city && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.city}
              </p>
            )}
          </div>

          {/* State & Postal Code */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="state" className="block text-sm font-bold text-gray-700 mb-2">
                State/Province (Optional)
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="NY"
              />
            </div>

            <div>
              <label htmlFor="postal_code" className="block text-sm font-bold text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition ${
                  fieldErrors.postal_code
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                }`}
                placeholder="10001"
              />
              {fieldErrors.postal_code && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.postal_code}
                </p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-bold text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition ${
                fieldErrors.country
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
              }`}
              placeholder="USA"
            />
            {fieldErrors.country && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.country}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition ${
                fieldErrors.phone
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {fieldErrors.phone && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.phone}
              </p>
            )}
          </div>

          {/* Set as Default */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </span>
              ) : (
                'Update Address'
              )}
            </button>
            <Link
              href="/account/addresses"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-bold"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
