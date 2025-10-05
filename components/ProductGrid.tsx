
import React, { useContext, useState } from 'react';
import { Product } from '../types';
import { CartContext } from '../App';
import { PlusIcon } from './Icons';

interface ProductGridProps {
  products: Product[];
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const cartContext = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  
  if (!cartContext) return null;
  const { addToCart } = cartContext;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value, 10) || 1);
    setQuantity(value);
  };

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-amber-500/20 group flex flex-col">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-100">{product.name}</h3>
        <p className="text-sm text-slate-400 mb-4">{product.category}</p>
        
        <div className="mt-auto pt-4 border-t border-slate-700/50">
          <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-slate-300">السعر:</p>
              <p className="text-xl font-black text-amber-500">{
                // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                product.price.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
              } <span className="text-sm">درهم</span></p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              className="w-[70%] bg-slate-700 border border-slate-600 rounded-md text-center py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="الكمية"
            />
            <button
              onClick={() => addToCart(product, quantity)}
              className="w-[30%] bg-amber-500 text-slate-900 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transform transition-transform duration-200 group-hover:bg-amber-400 active:scale-95"
            >
              <PlusIcon />
              <span>أضف</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return <div className="text-center py-20 text-xl text-slate-400">لم يتم العثور على منتجات تطابق بحثك.</div>;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;