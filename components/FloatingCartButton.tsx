import React, { useContext } from 'react';
import { CartContext } from '../App';
import { ShoppingCartIcon } from './Icons';

interface FloatingCartButtonProps {
    onClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick }) => {
    const cartContext = useContext(CartContext);

    if (!cartContext) {
        return null;
    }

    const { cartItems } = cartContext;
    // The cartItemCount now reflects the number of unique models (array length), not the total quantity.
    const cartItemCount = cartItems.length;

    if (cartItemCount === 0) {
        return null;
    }

    return (
        <button
            onClick={onClick}
            className="fixed top-24 left-4 z-30 bg-green-500 text-white font-bold py-3 px-5 rounded-full shadow-lg flex items-center gap-3 hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
            aria-label={`افتح سلة التسوق، ${cartItemCount} أنواع من المنتجات`}
        >
            <ShoppingCartIcon size={20} />
            <span>سلة</span>
            <span className="bg-white text-green-600 font-black rounded-full h-6 w-6 flex items-center justify-center text-sm">
                {cartItemCount}
            </span>
        </button>
    );
};

export default FloatingCartButton;
