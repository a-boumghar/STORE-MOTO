
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CartItem } from './types';
import { fetchProducts as mockFetchProducts } from './services/mockApi';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import CartModal from './components/CartModal';
import FloatingCartButton from './components/FloatingCartButton';
import AuthModal from './components/AuthModal'; // Import the new component

export const CartContext = React.createContext<{
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
} | null>(null);

const AUTH_KEY = 'motorino_auth_token';

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check for auth token on initial load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(AUTH_KEY);
      if (storedToken) {
        const { expiry } = JSON.parse(storedToken);
        if (new Date().getTime() < expiry) {
          setIsAuthorized(true);
        } else {
          localStorage.removeItem(AUTH_KEY); // Token expired
        }
      }
    } catch (error) {
      console.error("Failed to parse auth token from localStorage", error);
      localStorage.removeItem(AUTH_KEY);
    }
    setIsAuthLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    const expiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days
    localStorage.setItem(AUTH_KEY, JSON.stringify({ authorized: true, expiry }));
    setIsAuthorized(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthorized(false);
  };
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('motorino-cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  // Persist cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('motorino-cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  useEffect(() => {
    if (!isAuthorized) return; // Don't fetch products if not authorized
    
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // In a real application, this would be:
        // google.script.run.withSuccessHandler((data) => { ... }).getProducts();
        const fetchedProducts = await mockFetchProducts();
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        const uniqueCategories = ['الكل', ...Array.from(new Set(fetchedProducts.map(p => p.category)))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        // Handle error display to the user
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [isAuthorized]); // Re-run when authorization status changes

  useEffect(() => {
    let result = products;
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategory !== 'الكل') {
      result = result.filter(p => p.category === selectedCategory);
    }
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    if (quantity <= 0) return;
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const cartContextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal
  };

  if (isAuthLoading) {
    return (
      <div className="bg-slate-50 min-h-screen flex justify-center items-center">
        <div className="text-xl">جاري التحقق من الدخول...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <AuthModal onSuccess={handleLoginSuccess} />;
  }
  
  return (
    <CartContext.Provider value={cartContextValue}>
      <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="ابحث عن المنتج"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:w-1/2 bg-white border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-slate-900"
            />
            <div className="flex-grow flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-20 text-xl">جاري تحميل المنتجات...</div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </main>

        <footer className="bg-slate-100 border-t border-slate-200 py-6">
            <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
                <button
                    onClick={handleLogout}
                    className="text-sm text-slate-500 hover:text-red-600 transition-colors mb-2"
                    title="تسجيل الخروج"
                >
                    تسجيل الخروج
                </button>
                <p>&copy; {new Date().getFullYear()} متجر قطع غيار الدراجات النارية. كل الحقوق محفوظة.</p>
            </div>
        </footer>

        <FloatingCartButton onClick={() => setIsCartOpen(true)} />
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartContext.Provider>
  );
}

export default App;
