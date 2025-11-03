'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Package, Clock, Shield, Leaf, Mail, Phone, Search, X } from 'lucide-react';

export default function FAQPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const faqs = [
    {
      question: "What are plant-based proteins made from?",
      answer: "Our plant-based proteins are made from high-quality sources including pea protein isolate, brown rice protein, and hemp protein. These are enriched with real fruit powders like banana, mango, berries, and superfoods such as spirulina and matcha for added nutrition and natural flavor.",
      icon: Leaf,
      category: "Product"
    },
    {
      question: "How much protein do I need per day?",
      answer: "The recommended daily protein intake varies by individual factors. Generally, adults need about 0.8-1g of protein per kg of body weight. Athletes and active individuals may need 1.2-2g per kg. Our products provide 20-23g of protein per 30g serving, making it easy to meet your daily requirements.",
      icon: HelpCircle,
      category: "Nutrition"
    },
    {
      question: "Are your products suitable for vegans?",
      answer: "Yes! All our products are 100% plant-based and suitable for vegans. They contain no animal-derived ingredients, making them perfect for anyone following a vegan or vegetarian lifestyle.",
      icon: Leaf,
      category: "Product"
    },
    {
      question: "How do I use the protein powder?",
      answer: "Mix 1-2 scoops (30-60g) with 200-300ml of water, plant milk, or your favorite beverage. Blend it with fruits and vegetables for a delicious smoothie. Best consumed post-workout for muscle recovery, as a meal replacement, or between meals as a protein boost.",
      icon: HelpCircle,
      category: "Usage"
    },
    {
      question: "Do you offer bulk discounts?",
      answer: "Yes! We offer weight-based discounts on all our products. Buy 2kg and save 5%, 3kg saves 10%, 4kg saves 15%, and 5kg saves 20%. The discount is automatically applied at checkout.",
      icon: Package,
      category: "Pricing"
    },
    {
      question: "What is your shipping policy?",
      answer: "We offer free shipping on orders over £50 within the UK. Standard delivery takes 2-3 business days. Orders are processed within 24 hours on weekdays. We also ship internationally - check our shipping policy page for specific rates and delivery times.",
      icon: Package,
      category: "Shipping"
    },
    {
      question: "Are your products gluten-free?",
      answer: "Yes, all our protein powders are certified gluten-free, non-GMO, and vegan. We clearly label any potential allergens on each product page and packaging.",
      icon: Shield,
      category: "Product"
    },
    {
      question: "How should I store the product?",
      answer: "Store in a cool, dry place away from direct sunlight. Keep the container tightly closed after use to maintain freshness. For best quality, consume within 3 months of opening.",
      icon: HelpCircle,
      category: "Usage"
    },
    {
      question: "Can I return a product if I'm not satisfied?",
      answer: "Yes! We offer a 30-day satisfaction guarantee. If you're not happy with your purchase, contact us within 30 days for a full refund or exchange. See our return policy for complete details.",
      icon: Clock,
      category: "Returns"
    },
    {
      question: "Do your products contain artificial sweeteners?",
      answer: "No, we only use natural sweeteners like monk fruit and stevia. Our products are free from artificial colors, flavors, and preservatives. Everything is naturally sourced for the best quality and taste.",
      icon: Leaf,
      category: "Product"
    }
  ];

  const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
            <HelpCircle className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about LIVOZA plant-based protein products
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {(searchQuery || selectedCategory !== 'All') && (
          <div className="text-center mb-6 text-gray-600">
            Showing <span className="font-bold text-primary-600">{filteredFaqs.length}</span> {filteredFaqs.length === 1 ? 'result' : 'results'}
          </div>
        )}

        {/* FAQ List */}
        <div className="space-y-4 mb-12">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const Icon = faq.icon;
              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl border-2 border-transparent hover:border-primary-100"
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="w-full px-6 py-5 flex items-start gap-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isExpanded ? 'bg-primary-600' : 'bg-primary-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-primary-600'}`} />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-1 block">
                        {faq.category}
                      </span>
                      <span className="font-bold text-gray-900 text-lg block pr-4">{faq.question}</span>
                    </div>
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-primary-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-6 pb-6 pl-20 animate-slide-up">
                      <div className="text-gray-700 leading-relaxed text-base bg-gray-50 rounded-lg p-4">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl p-10 text-white text-center">
          <h2 className="text-3xl font-black mb-3">Still have questions?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Our customer support team is here to help you Monday through Friday, 9am-6pm GMT
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@plantprotein.com"
              className="inline-flex items-center justify-center gap-3 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-lg hover:shadow-2xl hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Email Us
            </a>
            <a
              href="tel:+441234567890"
              className="inline-flex items-center justify-center gap-3 border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-primary-600 transition-all hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
