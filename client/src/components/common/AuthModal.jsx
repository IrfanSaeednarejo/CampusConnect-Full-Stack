import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuth } = useAuth();
  const navigate = useNavigate();

  if (!isAuthModalOpen) return null;

  const handleLogin = () => {
    closeAuth();
    navigate('/login');
  };

  const handleSignup = () => {
    closeAuth();
    navigate('/signup');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={closeAuth}
          className="absolute top-4 right-4 text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#238636]/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-[#238636]">lock</span>
          </div>
          
          <h2 className="text-2xl font-bold text-[#c9d1d9] mb-3">
            Authentication Required
          </h2>
          
          <p className="text-[#8b949e] text-base mb-8">
            You are not authorized to perform this action. Please log in or create an account to continue.
          </p>

          <div className="w-full space-y-3">
            <Button 
              variant="primary" 
              className="w-full h-12 text-base font-semibold"
              onClick={handleLogin}
            >
              Log In
            </Button>
            
            <button 
              className="w-full py-2 text-[#58a6ff] hover:underline text-sm transition-all"
              onClick={handleSignup}
            >
              Don't have an account? Sign Up
            </button>
          </div>
        </div>
      </div>
      
      {/* Backdrop overlay listener */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={closeAuth}
      />
    </div>
  );
}
