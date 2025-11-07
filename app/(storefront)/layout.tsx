import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';
import { SearchProvider } from '@/lib/search-context';
import { AuthProvider } from '@/lib/auth-context';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}
