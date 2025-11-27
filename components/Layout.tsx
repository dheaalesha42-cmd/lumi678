import React, { useState } from 'react';
import { NavItem } from '../types';
import { Sparkles, Image as ImageIcon, ScanSearch, Menu, X, History } from 'lucide-react';
import { HistoryDrawer } from './HistoryDrawer';
import { GeneratedImage } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeMode: string;
  onModeChange: (mode: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeMode, onModeChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  const navItems: NavItem[] = [
    { id: 'generate', label: 'Generate', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'edit', label: 'Edit & Upscale', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'analyze', label: 'Analyze', icon: <ScanSearch className="w-5 h-5" /> },
  ];

  const handleNavClick = (id: string) => {
    onModeChange(id);
    setIsMobileMenuOpen(false);
  };

  const handleHistorySelect = (image: GeneratedImage) => {
    // Optional: Logic to restore state from history item could go here
    // For now, we just close the drawer, assuming the user might want to download or view it there.
    // Or we could preview it.
    setIsHistoryOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 fixed h-full z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Lumina
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeMode === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className={`${activeMode === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                {item.icon}
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
           <button 
             onClick={() => setIsHistoryOpen(true)}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
           >
             <History className="w-5 h-5" />
             <span className="font-medium">Gallery</span>
           </button>
           
           <div className="pt-6 border-t border-slate-800">
             <p className="text-xs text-slate-500 text-center">Powered by Gemini & Imagen</p>
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">Lumina</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <History className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-slate-950/95 pt-20 px-6">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg ${
                  activeMode === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* History Drawer */}
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onSelect={handleHistorySelect}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};