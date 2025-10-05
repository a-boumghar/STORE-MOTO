import React from 'react';
import { ShoppingCartIcon, HistoryIcon } from './Icons';

interface HeaderProps {
  onCartClick: () => void;
  onHistoryClick: () => void;
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, onHistoryClick, cartItemCount }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-500 tracking-wider">
          MOTORINO
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onHistoryClick}
            className="relative text-slate-300 hover:text-amber-500 transition-colors p-2 rounded-full hover:bg-slate-700"
            aria-label="عرض سجل الطلبات"
          >
            <HistoryIcon />
          </button>
          <button
            onClick={onCartClick}
            className="relative text-slate-300 hover:text-amber-500 transition-colors p-2 rounded-full hover:bg-slate-700"
            aria-label="افتح سلة التسوق"
          >
            <ShoppingCartIcon />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -start-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
