import React, { useState } from 'react';
import { generateImage, enhancePrompt, generatePromptIdeas } from '../services/gemini';
import { saveToHistory } from '../services/history';
import { ImageSize, AspectRatio, GENERATION_MODELS, GenerationModel, STYLE_PRESETS, StylePreset, PROMPT_TEMPLATES, PromptTemplateSection } from '../types';
import { Download, Loader2, Wand2, AlertCircle, Cpu, Sparkles, Palette, Ban, Layers, Copy, Lightbulb, X, ChevronRight, RefreshCw } from 'lucide-react';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [selectedModel, setSelectedModel] = useState<GenerationModel>('gemini-2.5-flash-image');
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>('none');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  // Change resultImage to an array
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<PromptTemplateSection[]>(PROMPT_TEMPLATES);
  const [generatingTemplates, setGeneratingTemplates] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (err) {
      console.error("Enhance failed", err);
    } finally {
      setEnhancing(false);
    }
  };

  const handleGeneratePrompts = async () => {
    setGeneratingTemplates(true);
    try {
      const newTemplates = await generatePromptIdeas();
      if (newTemplates.length > 0) {
        setTemplates(newTemplates);
      }
    } catch (err) {
      console.error("Failed to generate templates", err);
    } finally {
      setGeneratingTemplates(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setResultImages([]);

    try {
      // Append style to prompt if selected
      let finalPrompt = prompt;
      if (selectedStyle !== 'none') {
        const styleLabel = STYLE_PRESETS.find(s => s.id === selectedStyle)?.label;
        if (styleLabel) {
           finalPrompt = `${styleLabel} style. ${prompt}`;
        }
      }

      const images = await generateImage(finalPrompt, '1K', aspectRatio, selectedModel, negativePrompt, numberOfImages);
      setResultImages(images);

      // Save each generated image to history
      await Promise.all(images.map(imgUrl => 
        saveToHistory({
          url: imgUrl,
          prompt: finalPrompt, // Save the actual prompt used
          model: selectedModel,
          type: 'generated',
          aspectRatio,
        })
      ));

    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina-gen-${Date.now()}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 relative">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Generate Images</h2>
        <p className="text-slate-400">Create creative visuals with Magic Prompt and Style Presets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Model Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Model
            </label>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as GenerationModel)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            >
              {GENERATION_MODELS.map(model => (
                <option key={model} value={model}>{model.replace('models/', '')}</option>
              ))}
            </select>
          </div>

          {/* Prompt Area */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-300">Prompt</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowTemplates(true)}
                  className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <Lightbulb className="w-3 h-3" />
                  Inspiration
                </button>
                <button 
                  onClick={handleEnhancePrompt}
                  disabled={enhancing || !prompt}
                  className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
                >
                  {enhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Magic Enhance
                </button>
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your imagination..."
              className="w-full h-28 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
            />
          </div>

          {/* Style & Settings */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                   <Palette className="w-3 h-3" /> Style Preset
                </label>
                <select 
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value as StylePreset)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                >
                  {STYLE_PRESETS.map(style => (
                    <option key={style.id} value={style.id}>{style.label}</option>
                  ))}
                </select>
             </div>
             
             <div className="space-y-2">
               <label className="text-xs font-medium text-slate-400">Aspect Ratio</label>
               <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                >
                  {(['1:1', '16:9', '9:16', '3:4', '4:3'] as AspectRatio[]).map(ar => (
                    <option key={ar} value={ar}>{ar}</option>
                  ))}
                </select>
             </div>

             <div className="space-y-2">
               <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                 <Layers className="w-3 h-3" /> Image Count
               </label>
               <select 
                  value={numberOfImages}
                  onChange={(e) => setNumberOfImages(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                >
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>{num} Image{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
             </div>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
               <Ban className="w-3 h-3" /> Negative Prompt
             </div>
             <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blur, low quality, distorted..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
             />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
            {loading ? `Generating ${numberOfImages} Image${numberOfImages > 1 ? 's' : ''}...` : 'Generate'}
          </button>
          
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Preview Grid */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl min-h-[500px] relative p-4">
          {resultImages.length > 0 ? (
            <div className={`grid gap-4 h-full ${
              resultImages.length === 1 ? 'grid-cols-1' : 
              resultImages.length === 2 ? 'grid-cols-2' : 
              'grid-cols-2 grid-rows-2'
            }`}>
              {resultImages.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900 w-full h-full">
                  <img 
                    src={img} 
                    alt={`Generated ${idx + 1}`} 
                    className="w-full h-full object-contain" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => downloadImage(img, idx)}
                      className="p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors border border-white/10"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        // Quick copy to clipboard if supported, or just feedback
                        navigator.clipboard.writeText(img);
                      }}
                       className="p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors border border-white/10"
                       title="Copy Base64 (Dev)"
                    >
                       <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-center text-slate-500 p-8">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="animate-pulse">Dreaming up {numberOfImages} masterpiece{numberOfImages > 1 ? 's' : ''}...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <Wand2 className="w-10 h-10 text-slate-600" />
                  </div>
                  <p>Enter a prompt and settings to start dreaming.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
             onClick={() => setShowTemplates(false)}
           />
           <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Prompt Library</h3>
                      <p className="text-sm text-slate-400">Choose a template to get started</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={handleGeneratePrompts}
                     disabled={generatingTemplates}
                     className="flex items-center gap-2 px-3 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                   >
                     <RefreshCw className={`w-3.5 h-3.5 ${generatingTemplates ? 'animate-spin' : ''}`} />
                     {generatingTemplates ? 'Dreaming...' : 'New Ideas'}
                   </button>
                   <button 
                     onClick={() => setShowTemplates(false)}
                     className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                   >
                     <X className="w-5 h-5" />
                   </button>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                 {templates.map((section) => (
                    <div key={section.category} className="space-y-3">
                       <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider sticky top-0 bg-slate-950 py-2 z-10">
                         {section.category}
                       </h4>
                       <div className="grid grid-cols-1 gap-3">
                          {section.prompts.map((template, idx) => (
                             <button
                               key={idx}
                               onClick={() => {
                                 setPrompt(template);
                                 setShowTemplates(false);
                               }}
                               className="group text-left p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all"
                             >
                                <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                  {template}
                                </p>
                                <div className="mt-2 flex items-center text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                   Use Template <ChevronRight className="w-3 h-3 ml-1" />
                                </div>
                             </button>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
