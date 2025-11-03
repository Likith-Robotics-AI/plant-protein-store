import { FileText, Scale, ShoppingCart, CreditCard, Truck, AlertCircle, Shield, UserCheck, Globe, Mail, Phone } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
            <Scale className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our website or purchasing our products
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Agreement Banner */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white mb-10 text-center">
          <UserCheck className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-black mb-3">Agreement to Terms</h2>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
            By accessing and using the LIVOZA website, you agree to be bound by these Terms and Conditions and all
            applicable laws. If you do not agree with any of these terms, you are prohibited from using this site.
          </p>
        </div>

        {/* Key Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Use License */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Use License</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3 leading-relaxed">
              Permission is granted to temporarily download one copy of materials on LIVOZA's website for personal,
              non-commercial viewing only.
            </p>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-700"><strong>Note:</strong> This is a license grant, not a transfer of title</p>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Product Information</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3 leading-relaxed">
              We strive to provide accurate product descriptions and nutritional information. However, we reserve
              the right to correct errors at any time.
            </p>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-700"><strong>Quality:</strong> All information provided in good faith</p>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Payment Terms</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3 leading-relaxed">
              Payment must be received before orders are processed. We accept major credit cards and other payment
              methods as indicated on our site.
            </p>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-gray-700"><strong>Secure:</strong> All payments encrypted and protected</p>
            </div>
          </div>

          {/* Shipping & Delivery */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Shipping & Delivery</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3 leading-relaxed">
              Delivery times are estimates and not guaranteed. Risk of loss and title pass to you upon delivery
              to the carrier.
            </p>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs text-gray-700"><strong>Note:</strong> Not liable for carrier delays</p>
            </div>
          </div>
        </div>

        {/* Restrictions Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Use Restrictions</h2>
              <p className="text-gray-700 mb-4">Under this license, you may NOT:</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Modify or copy the materials</span>
            </div>
            <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Use materials for commercial purposes</span>
            </div>
            <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Decompile or reverse engineer software</span>
            </div>
            <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Remove copyright or proprietary notations</span>
            </div>
            <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Transfer materials to another person</span>
            </div>
            <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Mirror materials on another server</span>
            </div>
          </div>
        </div>

        {/* Pricing & Availability */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-7 h-7 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Pricing and Availability</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                All prices are in British Pounds (GBP) and are subject to change without notice. We reserve the right to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                  <strong>•</strong> Limit quantities per order
                </div>
                <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                  <strong>•</strong> Refuse any order
                </div>
                <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                  <strong>•</strong> Discontinue products
                </div>
                <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                  <strong>•</strong> Correct pricing errors
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health & Safety */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Health and Safety Disclaimer</h3>
              <p className="text-gray-700 leading-relaxed">
                Our products are dietary supplements and are not intended to diagnose, treat, cure, or prevent any disease.
                Consult with a healthcare professional before use if you are pregnant, nursing, taking medication, or have
                a medical condition. Keep out of reach of children.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Intellectual Property */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Intellectual Property</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, is the property of
              LIVOZA and protected by copyright and trademark laws.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Limitation of Liability</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              LIVOZA shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
              Total liability shall not exceed the amount paid for the product(s).
            </p>
          </div>

          {/* Indemnification */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Indemnification</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              You agree to indemnify and hold harmless LIVOZA from any claims, damages, losses, liabilities, and
              expenses arising from your use of the website or violation of these terms.
            </p>
          </div>

          {/* Governing Law */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Governing Law</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of England and Wales.
              Disputes subject to exclusive jurisdiction of courts of England and Wales.
            </p>
          </div>
        </div>

        {/* Returns & Refunds Reference */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Returns and Refunds</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Our return policy is outlined in our Returns Policy page. By making a purchase, you agree to these terms.
                All returns must comply with our stated return conditions.
              </p>
              <a
                href="/returns"
                className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors"
              >
                View Return Policy
                <FileText className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Changes to Terms */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Changes to Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to revise these Terms and Conditions at any time. By continuing to use the website
                after changes are posted, you agree to be bound by the revised terms. We recommend checking this page
                periodically for updates.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl p-10 text-white text-center">
          <h2 className="text-3xl font-black mb-3">Questions about our Terms?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            If you have questions about these Terms and Conditions, please don't hesitate to reach out
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:legal@plantprotein.com"
              className="inline-flex items-center justify-center gap-3 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-lg hover:shadow-2xl hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              legal@plantprotein.com
            </a>
            <a
              href="tel:+441234567890"
              className="inline-flex items-center justify-center gap-3 border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-primary-600 transition-all hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              +44 1234 567 890
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
