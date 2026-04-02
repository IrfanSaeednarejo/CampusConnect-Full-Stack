import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useModal, MODAL_TYPES } from "@/contexts/ModalContext.jsx";
import Avatar from "../common/Avatar";

export default function MentorUserMenu({ avatarSrc }) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none group transition-all"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Avatar 
          src={avatarSrc} 
          size="10" 
          border 
          className={`group-hover:border-[#1dc964] transition-colors ${isOpen ? 'border-[#1dc964]' : ''}`} 
        />
        <span className="material-symbols-outlined text-text-secondary group-hover:text-white transition-colors text-sm">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border bg-background/50">
            <p className="text-sm font-bold text-white truncate">{user?.name || "Mentor"}</p>
            <p className="text-[11px] text-text-secondary truncate">{user?.email}</p>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/mentor-profile-view");
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-[#30363d] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">person</span>
              View Profile
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                openModal(MODAL_TYPES.EDIT_PROFILE);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-[#30363d] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Edit Profile
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/mentor/dashboard");
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-[#30363d] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              Dashboard
            </button>
          </div>

          <div className="py-2 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#f85149] hover:bg-[#f85149]/10 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
