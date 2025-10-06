import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CartItem } from './types';
import { fetchProducts as mockFetchProducts } from './services/mockApi';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import CartModal from './components/CartModal';
import FloatingCartButton from './components/FloatingCartButton';

export const CartContext = React.createContext<{
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
} | null>(null);


function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
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
  }, []);

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
  
  return (
    <CartContext.Provider value={cartContextValue}>
      <div className="bg-slate-900 text-white min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="ابحث عن المنتج"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:w-1/2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            <div className="flex-grow flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-700 hover:bg-slate-600'
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

        <FloatingCartButton onClick={() => setIsCartOpen(true)} />
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartContext.Provider>
  );
}

export default App;
