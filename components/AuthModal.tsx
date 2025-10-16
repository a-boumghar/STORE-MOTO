
import React, { useState } from 'react';

// IMPORTANT: Replace this with your actual Google Apps Script deployment URL
const AUTH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrKUVpmbl682NpC6yx9l9jkyPk60x9SNlW5mhucd09cC452inIox3n6pJ7wOexkUe8Qw/exec';

interface AuthModalProps {
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (AUTH_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
        alert('Please replace "YOUR_DEPLOYMENT_ID" in components/AuthModal.tsx with your actual Google Apps Script URL.');
        return;
    }

    setError('');
    setIsLoading(true);

    try {
      // NOTE: We use a standard CORS POST request. 
      // The Google Apps Script `doPost` with `ContentService` will handle CORS headers automatically.
      // Using `mode: 'no-cors'` would result in an opaque response, preventing us from reading the success status.
      const response = await fetch(AUTH_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Send as plain text to be safe
        },
        body: JSON.stringify({ password }),
      });
      
      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError('كلمة السر غير صحيحة، حاول مرة أخرى.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-95 flex justify-center items-center p-4 z-50 transition-opacity duration-300 animate-fadeIn">
      <div className="bg-white text-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-8 text-center animate-scaleIn">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          أدخل كلمة السر للدخول إلى الموقع
        </h2>
        <p className="text-slate-500 mb-6">
          هذا الموقع محمي بكلمة سر.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة السر"
            dir="ltr"
            className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 mb-4 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-900"
            aria-label="كلمة السر"
            required
          />
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري التحقق...' : 'تأكيد'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AuthModal;
