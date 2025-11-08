'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, updateCustomer } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
      });
    }
  }, [customer]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setProfileSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/customer/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customer?.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfileSuccess('Profile updated successfully!');
        if (updateCustomer) {
          updateCustomer(data.customer);
        }
      } else {
        // Map error to appropriate field
        const error = data.error || 'Failed to update profile';
        if (error.toLowerCase().includes('email')) {
          setFieldErrors({ email: error });
        } else if (error.toLowerCase().includes('name')) {
          setFieldErrors({ name: error });
        } else if (error.toLowerCase().includes('phone')) {
          setFieldErrors({ phone: error });
        } else {
          setFieldErrors({ email: error }); // Default to showing at email field
        }
      }
    } catch (err) {
      setFieldErrors({ email: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setPasswordSuccess('');

    // Validation
    if (passwordData.newPassword === passwordData.currentPassword) {
      setFieldErrors({ newPassword: 'New password must be different from current password' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (!passwordStrength.hasLength || !passwordStrength.hasUppercase ||
        !passwordStrength.hasLowercase || !passwordStrength.hasNumber) {
      setFieldErrors({ newPassword: 'Please meet all password requirements' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/customer/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customer?.id,
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordStrength({
          hasLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
        });
      } else {
        // Map error to appropriate field
        const error = data.error || 'Failed to change password';
        if (error.toLowerCase().includes('current')) {
          setFieldErrors({ currentPassword: error });
        } else {
          setFieldErrors({ newPassword: error });
        }
      }
    } catch (err) {
      setFieldErrors({ currentPassword: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });

    // Check password strength
    if (name === 'newPassword') {
      setPasswordStrength({
        hasLength: value.length >= 8,
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
      });
    }
  };

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Update your account information and password</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Information Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-primary-600" />
              Personal Information
            </h2>

            {/* Profile Success Message */}
            {profileSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{profileSuccess}</p>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 transition ${
                      fieldErrors.name
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 transition ${
                      fieldErrors.email
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 transition ${
                      fieldErrors.phone
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                    }`}
                    placeholder="+44 1234 567890"
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary-600" />
              Change Password
            </h2>

            {/* Password Success Message */}
            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{passwordSuccess}</p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-6">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-bold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInput}
                    required
                    className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 transition ${
                      fieldErrors.currentPassword
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.currentPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-bold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInput}
                    required
                    className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 transition ${
                      fieldErrors.newPassword
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.newPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.newPassword}
                  </p>
                )}

                {/* Password Strength Indicators */}
                {passwordData.newPassword && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className={`w-4 h-4 ${passwordStrength.hasLength ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className={passwordStrength.hasLength ? 'text-green-700' : 'text-gray-500'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className={`w-4 h-4 ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className={passwordStrength.hasUppercase ? 'text-green-700' : 'text-gray-500'}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className={`w-4 h-4 ${passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className={passwordStrength.hasLowercase ? 'text-green-700' : 'text-gray-500'}>
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className={`w-4 h-4 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className={passwordStrength.hasNumber ? 'text-green-700' : 'text-gray-500'}>
                        One number
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInput}
                    required
                    className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 transition ${
                      fieldErrors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
