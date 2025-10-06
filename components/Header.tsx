import React from 'react';

const Header: React.FC = () => {
  const ktmLogoUrl = 'https://i.ibb.co/XfBfNLv5/all-logo-brand-copy-png.png';

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-200">
      <div className="container mx-auto px-4 py-2 flex justify-center items-center">
        <img 
          src={ktmLogoUrl} 
          alt="KTM Brand Logo" 
          className="h-16 object-contain" 
        />
      </div>
    </header>
  );
};

export default Header;