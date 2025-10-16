
import React from 'react';

interface HeaderProps {
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const ktmLogoUrl = 'https://i.ibb.co/XfBfNLv5/all-logo-brand-copy-png.png';

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-200">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Empty div to balance the flexbox */}
        <div className="w-24"></div> 
        
        <div className="flex-1 flex justify-center">
          <img 
            src={ktmLogoUrl} 
            alt="KTM Brand Logo" 
            className="h-16 object-contain" 
          />
        </div>
        
        <div className="w-24 flex justify-end">
          <button
            onClick={onLogout}
            className="text-sm text-slate-500 hover:text-red-600 transition-colors"
            title="تسجيل الخروج"
          >
            خروج
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
