'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';
import { Tag, Lock, Truck, X, Check, AlertCircle, Gift, Mail, Sparkles, MapPin, Plus } from 'lucide-react';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total } = useCart();
  const { customer, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Address management
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true); // For logged-in users

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'United Kingdom',
  });

  // Field-specific errors (localized)
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    zipCode: '',
  });

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    description?: string;
    amount: number;
    type: string;
  } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');

  // Calculate subtotal and discount
  const subtotal = cart.reduce((sum, item) => {
    return sum + (item.pricePerKg * item.selectedWeight * item.quantity);
  }, 0);

  const bulkDiscount = subtotal - total;
  const discountCodeAmount = appliedDiscount?.amount || 0;
  const finalTotal = Math.max(total - discountCodeAmount, 0);

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    if (isAuthenticated && customer) {
      fetchSavedAddresses();
      // Pre-fill name and email from customer
      setFormData(prev => ({
        ...prev,
        name: customer.name || '',
        email: customer.email || '',
        mobile: customer.phone || '',
      }));
    }
  }, [isAuthenticated, customer]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch(`/api/customer/addresses?customer_id=${customer?.id}`);
      if (response.ok) {
        const data = await response.json();
        const addresses = data.addresses || [];
        setSavedAddresses(addresses);

        // Auto-select default address if exists
        const defaultAddress = addresses.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
          populateFormFromAddress(defaultAddress);
        } else if (addresses.length > 0) {
          // If no default, select first address
          setSelectedAddress(addresses[0].id);
          populateFormFromAddress(addresses[0]);
        } else {
          // No saved addresses, use new address form
          setUseNewAddress(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setUseNewAddress(true);
    }
  };

  const populateFormFromAddress = (address: Address) => {
    setFormData(prev => ({
      ...prev,
      address: address.address_line1 + (address.address_line2 ? ', ' + address.address_line2 : ''),
      city: address.city,
      zipCode: address.postal_code,
      country: address.country,
      mobile: address.phone || prev.mobile,
    }));
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      populateFormFromAddress(address);
      setUseNewAddress(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user types
    setFieldErrors({
      ...fieldErrors,
      [name]: '',
    });
  };

  const validateStep1 = () => {
    const errors: any = {};
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Please enter your full name';
      isValid = false;
    }

    // Validate email or mobile (at least one required)
    if (!formData.email.trim() && !formData.mobile.trim()) {
      errors.email = 'Please provide an email address';
      errors.mobile = 'Or provide a mobile number';
      isValid = false;
    } else {
      // Validate email if provided
      if (formData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          errors.email = 'Please enter a valid email address';
          isValid = false;
        }
      }

      // Validate mobile if provided
      if (formData.mobile.trim()) {
        const mobileRegex = /^[\d\s\-\+\(\)]+$/;
        if (!mobileRegex.test(formData.mobile) || formData.mobile.replace(/\D/g, '').length < 10) {
          errors.mobile = 'Please enter a valid mobile number (at least 10 digits)';
          isValid = false;
        }
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const validateStep2 = () => {
    const errors: any = {};
    let isValid = true;

    if (!formData.address.trim()) {
      errors.address = 'Please enter your street address';
      isValid = false;
    }

    if (!formData.city.trim()) {
      errors.city = 'Please enter your city';
      isValid = false;
    }

    if (!formData.zipCode.trim()) {
      errors.zipCode = 'Please enter your postcode';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setDiscountLoading(true);
    setDiscountError('');

    try {
      const response = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode,
          subtotal: total,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedDiscount({
          code: data.code,
          description: data.description,
          amount: data.discountAmount,
          type: data.type,
        });
        setDiscountCode('');
      } else {
        setDiscountError(data.error || 'Invalid discount code');
      }
    } catch (err) {
      setDiscountError('Failed to apply discount code');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;

      setLoading(true);
      try {
        // Save address if logged in and saveAddress is checked and using new address
        if (isAuthenticated && customer && useNewAddress && saveAddress) {
          await saveNewAddress();
        }

        // Send discount code email
        const response = await fetch('/api/send-discount-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            mobile: formData.mobile,
            name: formData.name,
            orderTotal: finalTotal,
          }),
        });

        if (!response.ok) {
          console.warn('Discount email service unavailable - continuing with checkout');
          // Don't throw error, just log warning and continue
        }

        setCurrentStep(3);
      } catch (err) {
        console.error('Error:', err);
        // Still proceed to step 3 even if email fails
        setCurrentStep(3);
      } finally {
        setLoading(false);
      }
    }
  };

  const saveNewAddress = async () => {
    try {
      // Split address line if it contains comma
      const addressParts = formData.address.split(',').map(part => part.trim());
      const address_line1 = addressParts[0] || formData.address;
      const address_line2 = addressParts.length > 1 ? addressParts.slice(1).join(', ') : '';

      await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer?.id,
          address_type: 'shipping',
          is_default: savedAddresses.length === 0, // Set as default if it's the first address
          full_name: formData.name,
          address_line1,
          address_line2: address_line2 || null,
          city: formData.city,
          postal_code: formData.zipCode,
          country: formData.country,
          phone: formData.mobile || null,
        }),
      });
    } catch (error) {
      console.error('Failed to save address:', error);
      // Don't block checkout if address save fails
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Add some products to checkout!</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order securely</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  currentStep >= step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 transition-all ${
                    currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-2">
            <span className={`text-sm font-medium ${currentStep === 1 ? 'text-primary-600' : 'text-gray-500'}`}>
              Personal Info
            </span>
            <span className={`text-sm font-medium ${currentStep === 2 ? 'text-primary-600' : 'text-gray-500'}`}>
              Shipping
            </span>
            <span className={`text-sm font-medium ${currentStep === 3 ? 'text-primary-600' : 'text-gray-500'}`}>
              Complete
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold">Secure Checkout</h2>
              </div>

              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                      Personal Information
                    </h3>

                    <div className="space-y-4">
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          autoComplete="name"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                            fieldErrors.name ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="John Doe"
                        />
                        {fieldErrors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Email Field */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                              fieldErrors.email ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="john@example.com"
                          />
                          {fieldErrors.email && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {fieldErrors.email}
                            </p>
                          )}
                        </div>

                        {/* Mobile Field */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mobile Number
                          </label>
                          <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            autoComplete="tel"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                              fieldErrors.mobile ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="+44 7700 900000"
                          />
                          {fieldErrors.mobile && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {fieldErrors.mobile}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 italic">
                        * Please provide at least one contact method (email or mobile)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-black text-lg shadow-lg hover:shadow-xl"
                  >
                    Continue to Shipping
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      Shipping Address
                    </h3>

                    {/* Saved Addresses - For logged-in users */}
                    {isAuthenticated && savedAddresses.length > 0 && !useNewAddress && (
                      <div className="space-y-3 mb-4">
                        <p className="text-sm font-semibold text-gray-700">Select a saved address:</p>
                        {savedAddresses.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => handleAddressSelect(address.id)}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                              selectedAddress === address.id
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="w-4 h-4 text-primary-600" />
                                  <span className="font-bold text-gray-900">{address.full_name}</span>
                                  {address.is_default && (
                                    <span className="text-xs font-bold bg-primary-600 text-white px-2 py-0.5 rounded">
                                      DEFAULT
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700">{address.address_line1}</p>
                                {address.address_line2 && (
                                  <p className="text-sm text-gray-700">{address.address_line2}</p>
                                )}
                                <p className="text-sm text-gray-700">
                                  {address.city}, {address.postal_code}
                                </p>
                                <p className="text-sm text-gray-700">{address.country}</p>
                              </div>
                              {selectedAddress === address.id && (
                                <Check className="w-5 h-5 text-primary-600" />
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => setUseNewAddress(true)}
                          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 text-gray-600 py-3 rounded-lg hover:border-primary-400 hover:text-primary-600 transition font-semibold"
                        >
                          <Plus className="w-5 h-5" />
                          Use a different address
                        </button>
                      </div>
                    )}

                    {/* New Address Form - For guests or when adding new address */}
                    {(!isAuthenticated || savedAddresses.length === 0 || useNewAddress) && (
                      <div className="space-y-4">
                      {/* Address Field */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Street Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={3}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none ${
                            fieldErrors.address ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="123 Main Street, Flat 4B"
                        />
                        {fieldErrors.address && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {fieldErrors.address}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* City Field */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                              fieldErrors.city ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="London"
                          />
                          {fieldErrors.city && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {fieldErrors.city}
                            </p>
                          )}
                        </div>

                        {/* Postcode Field */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Postcode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                              fieldErrors.zipCode ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="SW1A 1AA"
                          />
                          {fieldErrors.zipCode && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {fieldErrors.zipCode}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Country
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white"
                        >
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Ireland">Ireland</option>
                        </select>
                      </div>

                      {/* Save Address Checkbox - For logged-in users using new address */}
                      {isAuthenticated && useNewAddress && (
                        <div className="flex items-center bg-primary-50 border border-primary-200 rounded-lg p-3">
                          <input
                            type="checkbox"
                            id="saveAddress"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700">
                            Save this address for future orders
                          </label>
                        </div>
                      )}

                      {/* Back to Saved Addresses Button */}
                      {isAuthenticated && savedAddresses.length > 0 && useNewAddress && (
                        <button
                          onClick={() => {
                            setUseNewAddress(false);
                            if (savedAddresses.length > 0) {
                              const defaultAddr = savedAddresses.find(a => a.is_default) || savedAddresses[0];
                              setSelectedAddress(defaultAddr.id);
                              populateFormFromAddress(defaultAddr);
                            }
                          }}
                          className="w-full text-sm text-primary-600 hover:text-primary-700 font-semibold"
                        >
                          ← Back to saved addresses
                        </button>
                      )}
                    </div>
                    )}

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-900 mb-1">Free Delivery</p>
                      <p className="text-sm text-blue-800">Your order will be shipped within 24 hours and delivered in 2-3 business days.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-50 transition-all font-bold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-black shadow-lg hover:shadow-xl"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Coming Soon Message */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Exciting Coming Soon Message */}
                  <div className="bg-gradient-to-br from-primary-50 via-primary-100 to-purple-50 rounded-2xl p-8 text-center border-2 border-primary-200">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 mb-4">
                      We're Working on Something Special!
                    </h2>

                    <p className="text-lg text-gray-700 mb-6 max-w-xl mx-auto">
                      We're currently experiencing technical difficulties with our payment processor, but we don't want you to miss out on these amazing products!
                    </p>

                    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Gift className="w-8 h-8 text-primary-600" />
                        <h3 className="text-2xl font-black text-gray-900">Special Thank You Gift!</h3>
                      </div>

                      <p className="text-gray-700 mb-4">
                        For being one of our early supporters, we're sending you a{' '}
                        <span className="font-black text-primary-600">15% OFF</span> discount code!
                      </p>

                      <div className="flex items-center justify-center gap-2 bg-primary-50 border-2 border-primary-300 rounded-lg py-3 px-4 mb-4">
                        <Mail className="w-5 h-5 text-primary-700" />
                        <p className="font-bold text-primary-900">
                          Check your email: <span className="text-primary-600">{formData.email || formData.mobile}</span>
                        </p>
                      </div>

                      <p className="text-sm text-gray-600">
                        Your exclusive discount code will arrive within the next 24 hours. Use it when we launch payments!
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-600" />
                        <span>Your cart has been saved</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-600" />
                        <span>We'll notify you when payment is ready</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-600" />
                        <span>Your discount code is on its way!</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/products')}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-black text-lg shadow-lg hover:shadow-xl"
                    >
                      Continue Shopping
                    </button>

                    <button
                      onClick={() => setCurrentStep(2)}
                      className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                    >
                      Back to Shipping
                    </button>
                  </div>

                  {/* Social Proof */}
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Join <span className="font-bold text-primary-600">5,000+ customers</span> waiting for our launch!
                    </p>
                    <p className="text-xs text-gray-500">
                      Be the first to know when we're ready. We'll send you an email with your exclusive discount.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-black text-gray-900 mb-6">Order Summary</h2>

              {/* Product List */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 max-h-80 overflow-y-auto">
                {cart.map((item, index) => {
                  const basePrice = item.pricePerKg * item.selectedWeight;
                  const discountedPrice = basePrice * (1 - item.appliedDiscount);
                  const itemTotal = discountedPrice * item.quantity;

                  return (
                    <div key={`${item.product.id}-${item.selectedWeight}-${index}`} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-100">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        {item.quantity > 1 && (
                          <div className="absolute -top-1 -right-1 bg-primary-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow">
                            {item.quantity}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 mb-1 line-clamp-2">
                          {item.product.name}
                        </h4>
                        <div className="flex flex-wrap gap-1 mb-1">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {item.product.flavor}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                            {item.selectedWeight}kg
                          </span>
                          {item.appliedDiscount > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                              -{(item.appliedDiscount * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-black text-primary-700">
                          £{itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Discount Code Input */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Code
                </label>
                {appliedDiscount ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-bold text-green-900">{appliedDiscount.code}</p>
                        {appliedDiscount.description && (
                          <p className="text-xs text-green-700">{appliedDiscount.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-green-700 hover:text-green-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase());
                          setDiscountError('');
                        }}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={discountLoading || !discountCode.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {discountLoading ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {discountError && (
                      <p className="text-xs text-red-600 mt-2">{discountError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">£{subtotal.toFixed(2)}</span>
                </div>

                {bulkDiscount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Bulk Discount
                    </span>
                    <span className="font-bold">-£{bulkDiscount.toFixed(2)}</span>
                  </div>
                )}

                {appliedDiscount && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {appliedDiscount.code}
                    </span>
                    <span className="font-bold">-£{discountCodeAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary-700">
                    £{finalTotal.toFixed(2)}
                  </div>
                  {(bulkDiscount + discountCodeAmount) > 0 && (
                    <div className="text-xs text-gray-500">
                      You save £{(bulkDiscount + discountCodeAmount).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
