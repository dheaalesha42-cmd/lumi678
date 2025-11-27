import React, { useState, useRef } from 'react';
import { analyzeImage, fileToBase64 } from '../services/gemini';
import { Upload, Search, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ImageAnalyzer: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setSourceImage(base64);
        setFileType(file.type);
      } catch (err) {
        console.error("Error reading file", err);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!sourceImage) return;

    setLoading(true);
    // Do not clear previous result immediately to allow comparison if needed, 
    // or clear it if that's cleaner. Let's clear to show fresh loading state.
    setResultText(null);

    try {
      const text = await analyzeImage(sourceImage, fileType, prompt);
      setResultText(text);
    } catch (err) {
      console.error("Analysis failed", err);
      setResultText("Error analyzing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 space-y-2">
        <h2 className="text-3xl font-bold text-white">Visual Analysis</h2>
        <p className="text-slate-400">Upload an image and ask detailed questions using Gemini 2.5 Flash.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Left Column: Image & Input */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          {/* Image Preview */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 min-h-[300px] bg-slate-900/50 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
              sourceImage ? 'border-slate-700' : 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50'
            }`}
          >
            {sourceImage ? (
               <img 
                 src={`data:${fileType};base64,${sourceImage}`} 
                 alt="Analysis Target" 
                 className="w-full h-full object-contain p-4" 
               />
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-300">Drop an image here</h3>
                <p className="text-sm text-slate-500 mt-1">or click to browse</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Prompt Input */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask about this image (e.g., 'Extract text', 'Describe the mood')..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <button
                onClick={handleAnalyze}
                disabled={!sourceImage || loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 overflow-y-auto custom-scrollbar">
          {resultText ? (
            <div className="prose prose-invert max-w-none">
              <div className="flex items-center gap-2 mb-4 text-indigo-400 border-b border-slate-800 pb-2">
                <FileText className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-wider text-sm">Analysis Result</span>
              </div>
              <ReactMarkdown>{resultText}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-8">
              {loading ? (
                <div className="space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
                  <p className="text-slate-400">Analyzing visual data...</p>
                </div>
              ) : (
                <>
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p>Upload an image and ask a question to see the AI analysis here.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};