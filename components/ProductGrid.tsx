

import React, { useContext, useState } from 'react';
import { Product } from '../types';
import { CartContext } from '../App';
import { PlusIcon } from './Icons';

interface ProductGridProps {
  products: Product[];
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const cartContext = useContext(CartContext);
  const [quantity, setQuantity] = useState<number | ''>('');
  
  if (!cartContext) return null;
  const { addToCart } = cartContext;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
        setQuantity('');
    } else {
        const value = parseInt(rawValue, 10);
        // set quantity only if it's a valid positive number
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    }
  };

  const handleAddToCart = () => {
    const numQuantity = Number(quantity) || 1; // Default to 1 if input is empty
    addToCart(product, numQuantity);
    setQuantity(''); // Reset to show placeholder
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-200 group flex flex-col">
      <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
        {product.piecesPerCarton && (
          <p className="text-xs text-sky-600 mt-1">
            (كرتون : {product.piecesPerCarton} قطعة)
          </p>
        )}
        {product.sku && (
          <p className="text-xs text-slate-500 mt-1">
            (SKU : {product.sku})
          </p>
        )}
        <p className="text-sm text-slate-500 mb-4">{product.category}</p>
        
        <div className="mt-auto pt-4 border-t border-slate-200/80">
          <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-slate-600">السعر:</p>
              <p className="text-xl font-black text-red-600">{
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
              placeholder="كمية"
              className="w-[70%] bg-slate-100 border border-slate-300 text-slate-900 rounded-md text-center py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              aria-label="الكمية"
            />
            <button
              onClick={handleAddToCart}
              className="w-[30%] bg-red-600 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transform transition-transform duration-200 group-hover:bg-red-500 active:scale-95"
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
    return <div className="text-center py-20 text-xl text-slate-500">لم يتم العثور على منتجات تطابق بحثك.</div>;
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
