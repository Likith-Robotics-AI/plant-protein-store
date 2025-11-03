import { Shield, Lock, Eye, Share2, Cookie, Mail, UserX, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy matters. Learn how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Privacy Promise Banner */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white mb-10 text-center">
          <Lock className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-black mb-3">Our Privacy Promise</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            At LIVOZA, we take your privacy seriously. We never sell your personal information and only use it to
            provide you with the best possible service. Your data is encrypted and securely stored.
          </p>
        </div>

        {/* What We Collect */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">Information We Collect</h2>
          </div>
          <p className="text-gray-700 mb-6">We collect information that you provide directly to us, including:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900">Personal Information</span>
              </div>
              <p className="text-sm text-gray-600">Name, email address, phone number, shipping address</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900">Payment Information</span>
              </div>
              <p className="text-sm text-gray-600">Credit card details (securely processed through payment provider)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900">Order Information</span>
              </div>
              <p className="text-sm text-gray-600">Purchase history, product preferences</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900">Technical Data</span>
              </div>
              <p className="text-sm text-gray-600">IP address, browser type, device information</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900">Usage Data</span>
              </div>
              <p className="text-sm text-gray-600">Pages visited, time spent on site, clickstream data</p>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">How We Use Your Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700">Process and fulfill your orders efficiently</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700">Communicate with you about your orders and our products</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700">Send you marketing communications (with your consent)</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700">Improve our website and customer service</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700">Prevent fraud and enhance security</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700">Comply with legal obligations</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700">Analyze website usage and trends</span>
            </div>
          </div>
        </div>

        {/* Information Sharing */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Share2 className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">We Do Not Sell Your Information</h2>
              <p className="text-gray-700">
                We do not sell your personal information to third parties. We may share your information only with:
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-gray-900">Service Providers</span>
              </div>
              <p className="text-sm text-gray-600">Shipping companies, payment processors, email service providers who help us operate our business</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-gray-900">Legal Requirements</span>
              </div>
              <p className="text-sm text-gray-600">When required by law or to protect our rights and the safety of our users</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-gray-900">Business Transfers</span>
              </div>
              <p className="text-sm text-gray-600">In connection with a merger, sale, or acquisition of our business</p>
            </div>
          </div>
        </div>

        {/* Data Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Data Security</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              We implement appropriate technical and organizational security measures to protect your personal information.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>SSL encryption for all transactions</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Secure servers with firewalls</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Regular security audits</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Your Rights</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              Under GDPR and UK data protection laws, you have the right to:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Access your personal data</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Correct inaccurate data</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Request deletion of your data</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Object to data processing</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Request data portability</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Cookie className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Cookies and Tracking</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic,
                and personalize content. Cookies are small text files stored on your device that help us remember
                your preferences and improve site functionality.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Cookie Control:</strong> You can control cookie settings through your browser preferences.
                  Note that disabling cookies may affect site functionality.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Marketing Communications */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Marketing Communications</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                You can opt out of marketing emails at any time by clicking the "unsubscribe" link in our emails or
                contacting us directly. Note that you'll still receive transactional emails related to your orders,
                such as order confirmations and shipping updates.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Easy unsubscribe
                </span>
                <span className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Essential emails only option
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Children's Privacy & Changes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Children's Privacy</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              Our website is not intended for children under 16. We do not knowingly collect personal information from
              children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Policy Changes</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We'll notify you of any changes by posting the
              new policy on this page and updating the "Last Updated" date.
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl p-10 text-white text-center">
          <h2 className="text-3xl font-black mb-3">Questions about your privacy?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            If you have questions about this Privacy Policy or our data practices, we're here to help
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:privacy@plantprotein.com"
              className="inline-flex items-center justify-center gap-3 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-lg hover:shadow-2xl hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              privacy@plantprotein.com
            </a>
            <a
              href="tel:+441234567890"
              className="inline-flex items-center justify-center gap-3 border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-primary-600 transition-all hover:scale-105"
            >
              +44 1234 567 890
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
