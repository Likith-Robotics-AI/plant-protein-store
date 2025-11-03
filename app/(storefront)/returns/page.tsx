import { RefreshCw, Package, Mail, CheckCircle, X, Clock, Shield, AlertCircle, ArrowRight } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <RefreshCw className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">Return & Refund Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            30-Day Satisfaction Guarantee. Not happy? We'll make it right.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* 30-Day Guarantee Banner */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-8 text-white mb-10 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-black mb-3">30-Day Satisfaction Guarantee</h2>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            We want you to be completely satisfied with your purchase. If you're not happy with your LIVOZA product
            for any reason, return it within 30 days for a full refund or exchange.
          </p>
        </div>

        {/* Return Conditions */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6">Return Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Within 30 Days</h3>
                <p className="text-gray-600 text-sm">Returned within 30 days of delivery date</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Original Packaging</h3>
                <p className="text-gray-600 text-sm">Products must be unopened and sealed</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Proof of Purchase</h3>
                <p className="text-gray-600 text-sm">Include receipt or order confirmation</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Good Condition</h3>
                <p className="text-gray-600 text-sm">Products must not be expired or damaged</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Return - Step by Step */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">How to Return</h2>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-black text-primary-600">1</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">Contact Us</h3>
                </div>
                <p className="text-gray-700">
                  Email us at <a href="mailto:info@plantprotein.com" className="text-primary-600 hover:underline font-semibold">info@plantprotein.com</a> with
                  your order number and reason for return. Our team will respond within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-300 rotate-90" />
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-black text-primary-600">2</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">Receive Authorization</h3>
                </div>
                <p className="text-gray-700">
                  We'll send you a Return Authorization (RA) number and a prepaid return shipping label via email.
                  Save these for the next steps.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-300 rotate-90" />
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-black text-primary-600">3</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">Pack Your Item</h3>
                </div>
                <p className="text-gray-700">
                  Securely package the product in its original packaging. Write the RA number clearly on the outside
                  of the box. Include your order confirmation inside.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-300 rotate-90" />
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-black text-primary-600">4</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">Ship It Back</h3>
                </div>
                <p className="text-gray-700">
                  Use the prepaid shipping label we provided or ship via your preferred carrier. Drop off at any
                  postal location. Keep the tracking number for your records.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Process */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Refund Process</h2>
              <p className="text-gray-700">
                Once we receive your returned item, we'll inspect it and process your refund within 5-7 business days.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">Original Payment Method</span>
              </div>
              <p className="text-sm text-gray-600">Refunds credited to your original payment method</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">Email Confirmation</span>
              </div>
              <p className="text-sm text-gray-600">You'll receive confirmation once refund is processed</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">5-10 Business Days</span>
              </div>
              <p className="text-sm text-gray-600">Allow time for refund to appear in your account</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">Shipping Costs</span>
              </div>
              <p className="text-sm text-gray-600">Non-refundable unless return is due to our error</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Exchanges */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Exchanges</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Want to exchange a product for a different flavor or size? Follow the return process above and place
              a new order for your desired product. This ensures you receive your new product as quickly as possible.
            </p>
          </div>

          {/* Damaged Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Damaged or Defective</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Received a damaged or defective product? Contact us immediately with photos. We'll send a replacement
              at no cost, including free return shipping for the defective item.
            </p>
          </div>
        </div>

        {/* Non-Returnable Items */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <X className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Non-Returnable Items</h3>
              <p className="text-gray-700 mb-4">The following items cannot be returned:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Opened or used products (for hygiene and safety reasons)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Products returned more than 30 days after delivery</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Items not in original packaging</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Gift cards or promotional items</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl p-10 text-white text-center">
          <h2 className="text-3xl font-black mb-3">Questions about returns?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Our customer service team is here to help you through the return process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@plantprotein.com"
              className="inline-flex items-center justify-center gap-3 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-lg hover:shadow-2xl hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </a>
            <a
              href="/faq"
              className="inline-flex items-center justify-center gap-3 border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-primary-600 transition-all hover:scale-105"
            >
              Visit FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
