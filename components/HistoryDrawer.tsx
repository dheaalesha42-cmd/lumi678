import React, { useEffect, useState } from 'react';
import { getHistory, deleteHistoryItem, clearHistory } from '../services/history';
import { GeneratedImage } from '../types';
import { X, Trash2, Clock, Download, Image as ImageIcon } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: GeneratedImage) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, onSelect }) => {
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistory(items);
  };

  useEffect(() => {
    if (isOpen) loadHistory();
    
    const handleUpdate = () => loadHistory();
    window.addEventListener('historyUpdated', handleUpdate);
    return () => window.removeEventListener('historyUpdated', handleUpdate);
  }, [isOpen]);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const handleDownload = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina-history-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteHistoryItem(id);
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to delete all history? This cannot be undone.")) {
      await clearHistory();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-slate-950 border-l border-slate-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-white">History & Gallery</h2>
          </div>
          <div className="flex items-center gap-2">
             {history.length > 0 && (
              <button 
                onClick={handleClear}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
              >
                Clear All
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 opacity-20" />
              </div>
              <p>No images generated yet.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-900/10"
              >
                <div className="aspect-square w-full bg-black/20 relative">
                    <img 
                        src={item.url} 
                        alt={item.prompt} 
                        className="w-full h-full object-cover"
                        loading="lazy" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={(e) => handleDownload(e, item.url)}
                                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => handleDelete(e, item.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/30 backdrop-blur-md rounded-lg text-red-200"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-slate-300 line-clamp-2 mb-2">{item.prompt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="uppercase tracking-wider">{item.model.replace('models/', '').replace('gemini-', '').replace('-image', '')}</span>
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};