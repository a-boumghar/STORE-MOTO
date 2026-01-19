
import React, { useState, useEffect } from 'react';
import { fetchPromoImage } from '../services/mockApi';
import { CloseIcon, StarIcon } from './Icons';

const PromoPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      const url = await fetchPromoImage();
      setImageUrl(url);
      setLoading(false);
    };
    loadImage();
  }, []);

  const toggleModal = () => setIsOpen(!isOpen);

  if (loading || !imageUrl) return null;

  return (
    <>
      {/* Sticky Floating Button */}
      <button
        onClick={toggleModal}
        className="fixed bottom-6 right-6 z-40 bg-red-600 text-white p-4 rounded-full shadow-2xl hover:bg-red-700 transition-all duration-300 transform hover:scale-110 active:scale-95 animate-pulse-slow md:bottom-8 md:right-8"
        aria-label="عرض العرض الترويجي"
      >
        <StarIcon size={28} className="fill-current" />
      </button>

      {/* Popup Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleModal}
      >
        <div 
          className={`relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg transition-transform duration-500 ease-out ${isOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={toggleModal}
            className="absolute top-3 right-3 z-10 p-2 bg-white/90 text-slate-800 rounded-full shadow-md hover:bg-red-600 hover:text-white transition-colors"
          >
            <CloseIcon size={20} />
          </button>

          {/* Image Container (1:1 Aspect Ratio) */}
          <div className="aspect-square w-full">
            <img 
              src={imageUrl} 
              alt="Promo Content" 
              className="w-full h-full object-contain bg-slate-100"
              loading="lazy"
            />
          </div>
          
          {/* Optional: Footer text if needed */}
          <div className="p-4 bg-white text-center">
            <p className="text-slate-600 font-bold">عروض حصرية لفترة محدودة!</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px 10px rgba(220, 38, 38, 0); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
      `}</style>
    </>
  );
};

export default PromoPopup;
