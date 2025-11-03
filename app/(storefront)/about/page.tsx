import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-green-500 text-white py-32 overflow-hidden z-0">
        <div className="absolute inset-0 opacity-10 z-0">
          <Image
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&h=600&fit=crop"
            alt="Healthy lifestyle"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-black mb-6">About LIVOZA</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Pure plant-based protein crafted with real fruit powder and sustainable practices
            </p>
          </div>
        </div>
      </div>

      {/* Our Story with Image */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-12 text-center">Our Story</h2>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=600&fit=crop"
                  alt="Fresh fruits and plant-based ingredients"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  It all started with a simple belief: <strong className="text-primary-600">healthy nutrition shouldn't mean compromising on taste or the planet.</strong> We were tired of protein powders filled with artificial flavours and unrecognizable ingredients.
                </p>

                <p>
                  So we created something better. Something <strong className="text-green-600">pure, powerful, and planet-friendly.</strong> We partnered with trusted farms worldwide, sourcing only the finest plant-based ingredients.
                </p>

                <p>
                  Then we did something revolutionary: we added <strong>real fruit powder</strong> - not artificial flavours, but actual fruit! This wasn't just about taste; it was about integrity.
                </p>

                <div className="bg-primary-50 rounded-xl p-6 border-l-4 border-primary-600">
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    The Result?
                  </p>
                  <p className="text-gray-700">
                    Protein that delights your taste buds while keeping all essential nutrients intact. Every scoop delivers 25g of premium plant protein with vitamins, fiber, and antioxidants.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values with Background Image */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gray-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 text-center">Our Values</h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
              These principles guide everything we do, from sourcing ingredients to serving our customers
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparency</h3>
                <p className="text-gray-700 leading-relaxed">
                  Every ingredient is clearly listed and sourced from trusted suppliers. We believe you deserve to know exactly what you're putting in your body.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl">🌍</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sustainability</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our plant-based proteins are ethically sourced from farms that prioritize environmental stewardship. Good for you, great for the planet.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality</h3>
                <p className="text-gray-700 leading-relaxed">
                  We use gentle processing methods that preserve nutrients, flavor, and texture. Every batch is tested to ensure it meets our high standards.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl">💡</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Innovation</h3>
                <p className="text-gray-700 leading-relaxed">
                  From real fruit powder to sustainable packaging, we're constantly pushing boundaries to create better products for you and the environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Different */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-gray-900 mb-12 text-center">Why We're Different</h2>

            <div className="space-y-8">
              <div className="border-l-4 border-primary-600 pl-6 py-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">All Essential Nutrients Retained</h3>
                <p className="text-gray-700 leading-relaxed">
                  Packed with protein, vitamins, fiber, and antioxidants from real plant sources. We use gentle processing methods that preserve the natural goodness of every ingredient. Unlike many competitors who use harsh extraction processes, we maintain the integrity of our ingredients from farm to scoop.
                </p>
              </div>

              <div className="border-l-4 border-green-600 pl-6 py-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Real Fruit Powder - Not Artificial Flavours</h3>
                <p className="text-gray-700 leading-relaxed">
                  Actual fruit powder keeping all the natural goodness intact! Experience authentic berry sweetness, tropical mango, or creamy vanilla - all from real food sources. This means you get the vitamins, minerals, and antioxidants from the fruit itself, not just synthetic flavoring.
                </p>
              </div>

              <div className="border-l-4 border-blue-600 pl-6 py-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">100% Plant-Based & Sustainably Sourced</h3>
                <p className="text-gray-700 leading-relaxed">
                  Premium quality ingredients from sustainable farms worldwide. We visit our partner farms regularly, ensuring they meet our strict environmental and ethical standards. We believe in taking care of our planet while taking care of you!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-br from-primary-50 to-green-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Have Questions?</h2>
            <p className="text-lg text-gray-700 mb-8">
              We love hearing from our customers and welcome any questions about our products, ingredients, or mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:info@livoza.com"
                className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition-all inline-flex items-center gap-2"
              >
                Contact Us
              </a>
              <Link
                href="/"
                className="text-primary-600 hover:text-primary-700 font-bold underline"
              >
                Back to Home →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
