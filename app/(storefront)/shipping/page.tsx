import { Package, Truck, Globe, Clock, MapPin, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
            <Truck className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">Shipping Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fast, reliable delivery to your doorstep. Free UK shipping on orders over £50
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Shipping Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* UK Standard */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-primary-200 transition-all hover:shadow-xl">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white">
              <MapPin className="w-10 h-10 mb-3" />
              <h3 className="text-2xl font-bold">UK Standard</h3>
              <p className="text-primary-100 text-sm">2-3 business days</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-black text-gray-900">FREE</span>
                  <span className="text-gray-600">over £50</span>
                </div>
                <div className="text-gray-600">£4.99 under £50</div>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Tracked delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Delivery to your door</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Email notifications</span>
                </li>
              </ul>
            </div>
          </div>

          {/* UK Express */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-primary-300 hover:border-primary-400 transition-all hover:shadow-xl relative">
            <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
              FASTEST
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 text-white">
              <Package className="w-10 h-10 mb-3" />
              <h3 className="text-2xl font-bold">UK Express</h3>
              <p className="text-yellow-100 text-sm">Next business day</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-black text-gray-900">£9.99</span>
                </div>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Next day delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Priority handling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Real-time tracking</span>
                </li>
              </ul>
            </div>
          </div>

          {/* International */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-primary-200 transition-all hover:shadow-xl">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
              <Globe className="w-10 h-10 mb-3" />
              <h3 className="text-2xl font-bold">International</h3>
              <p className="text-blue-100 text-sm">Worldwide shipping</p>
            </div>
            <div className="p-6">
              <div className="mb-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Europe:</span>
                  <span className="font-bold text-gray-900">£15.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">USA & Canada:</span>
                  <span className="font-bold text-gray-900">£24.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rest of World:</span>
                  <span className="font-bold text-gray-900">£29.99</span>
                </div>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">5-14 days depending on location</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Process Timeline */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">Shipping Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">1. Order Placed</h3>
              <p className="text-sm text-gray-600">You'll receive instant confirmation via email</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2. Processing</h3>
              <p className="text-sm text-gray-600">Orders processed within 24 hours on weekdays</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">3. Shipped</h3>
              <p className="text-sm text-gray-600">Tracking number sent to your email</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">4. Delivered</h3>
              <p className="text-sm text-gray-600">Arrives at your doorstep safely</p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Tracking */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Track Your Order</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Once your order ships, you'll receive a tracking number via email. Track your package in real-time
                  on our shipping partner's website. Allow 24 hours for tracking to update.
                </p>
              </div>
            </div>
          </div>

          {/* Restrictions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Shipping Restrictions</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  We cannot ship to PO boxes or military addresses at this time. Please ensure your address is
                  complete and accurate to avoid delays.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Damaged or Lost Packages */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Damaged or Lost Packages?</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                If your package arrives damaged or doesn't arrive within the expected timeframe, please contact us
                immediately. We'll work with our shipping partners to resolve the issue promptly and ensure you
                receive your products.
              </p>
              <a
                href="mailto:info@plantprotein.com"
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md hover:shadow-lg"
              >
                <Package className="w-5 h-5" />
                Report an Issue
              </a>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl p-10 text-white text-center">
          <h2 className="text-3xl font-black mb-3">Questions about shipping?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Check our FAQ for more information or contact our support team
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/faq"
              className="inline-flex items-center justify-center gap-3 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-lg hover:shadow-2xl hover:scale-105"
            >
              Visit FAQ
            </a>
            <a
              href="mailto:info@plantprotein.com"
              className="inline-flex items-center justify-center gap-3 border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-primary-600 transition-all hover:scale-105"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
