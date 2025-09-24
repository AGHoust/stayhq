import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SearchBarSlim } from './search';

interface NavBarProps {
  onSearch?: (query: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Fixed Top Nav */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <div className="bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] rounded-2xl px-6 py-3 flex items-center justify-between shadow-[var(--shadow)]">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--petrol)] to-[var(--ember)] rounded-lg"></div>
            <span className="font-bold text-xl text-[var(--ink)]">StayHQ</span>
          </div>

          {/* Slim Search */}
          <div className="flex-1 max-w-md mx-8">
            <SearchBarSlim onSearch={onSearch} />
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 text-[var(--ink)] hover:text-[var(--petrol)] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Slide Over Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-[var(--card)] border-l border-[var(--border)] shadow-[var(--shadow)]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-[var(--ink)]">Menu</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-[var(--petrol)] text-white rounded-xl font-medium hover:bg-[var(--petrol)]/90 transition-colors">
                  Log in
                </button>
                <button className="w-full text-left p-4 border border-[var(--border)] text-[var(--ink)] rounded-xl font-medium hover:bg-[var(--surface)] transition-colors">
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
