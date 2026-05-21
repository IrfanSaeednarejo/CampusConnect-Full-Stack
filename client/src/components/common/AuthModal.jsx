import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import { useNavigate } from 'react-router-dom';
import useHomeTheme from '../../hooks/useHomeTheme';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuth } = useAuth();
  const navigate = useNavigate();
  const isDark = useHomeTheme();

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
        className={`theme-surface relative w-full max-w-md rounded-2xl p-8 animate-in zoom-in-95 duration-200 ${
          isDark ? "" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          onClick={closeAuth}
          className="absolute right-4 top-4"
          label="Close authentication dialog"
          icon="close"
          variant="ghost"
          size="sm"
        />

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="material-symbols-outlined text-4xl text-primary">lock</span>
          </div>
          
          <h2 className="mb-3 text-2xl font-semibold text-text-primary">
            Authentication Required
          </h2>
          
          <p className="mb-8 text-base text-text-secondary">
            You are not authorized to perform this action. Please log in or create an account to continue.
          </p>

          <div className="w-full space-y-3">
            <Button 
              variant="primary" 
              size="md"
              className="w-full"
              onClick={handleLogin}
            >
              Log In
            </Button>
            
            <Button 
              variant="ghost"
              size="md"
              className="w-full"
              onClick={handleSignup}
            >
              Don't have an account? Sign Up
            </Button>
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
