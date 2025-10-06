import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-500 tracking-wider">
          MOTORINO
        </h1>
      </div>
    </header>
  );
};

export default Header;
