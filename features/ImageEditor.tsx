import React, { useState, useRef } from 'react';
import { editImage, fileToBase64, InputImage } from '../services/gemini';
import { saveToHistory } from '../services/history';
import { AspectRatio } from '../types';
import { Upload, ArrowRight, Download, Loader2, Sparkles, RefreshCcw, LayoutTemplate, Plus, Trash2, TrendingUp, X, Image as ImageIcon, Settings2 } from 'lucide-react';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';

interface EditorImage {
  id: string;
  data: string;
  mimeType: string;
}

export const ImageEditor: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<EditorImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadIndex = useRef<number | null>(null);

  const triggerUpload = (index: number | null) => {
    activeUploadIndex.current = index;
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        const newImage: EditorImage = {
          id: crypto.randomUUID(),
          data: base64,
          mimeType: file.type,
        };

        setUploadedImages(prev => {
          const newArray = [...prev];
          if (activeUploadIndex.current !== null && activeUploadIndex.current < newArray.length) {
            newArray[activeUploadIndex.current] = newImage;
          } else {
            if (newArray.length < 3) {
              newArray.push(newImage);
            }
          }
          return newArray;
        });

        if (activeUploadIndex.current === 0 || uploadedImages.length === 0) {
          setResultImage(null);
        }
      } catch (err) {
        console.error("Error reading file", err);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (index === 0) setResultImage(null);
  };

  const handleEdit = async () => {
    if (uploadedImages.length === 0 || !prompt.trim()) return;

    setLoading(true);
    setResultImage(null);

    try {
      const serviceImages: InputImage[] = uploadedImages.map(img => ({
        data: img.data,
        mimeType: img.mimeType
      }));

      const editedBase64 = await editImage(serviceImages, prompt, aspectRatio, 'gemini-2.5-flash-image');
      setResultImage(editedBase64);
      
      await saveToHistory({
        url: editedBase64,
        prompt: prompt,
        model: 'gemini-2.5-flash-image',
        type: 'edited',
        aspectRatio,
      });

    } catch (err) {
      console.error("Edit failed", err);
      alert("Failed to edit image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpscale = async () => {
    if (uploadedImages.length === 0) return;

    setLoading(true);
    setResultImage(null);

    try {
      const serviceImages: InputImage[] = uploadedImages.map(img => ({
        data: img.data,
        mimeType: img.mimeType
      }));

      const upscalePrompt = "Upscale this image to high resolution 4K. Enhance fine details, sharpen textures, improve lighting, and remove noise while maintaining the original composition exactly. Photorealistic quality.";

      const editedBase64 = await editImage(serviceImages, upscalePrompt, aspectRatio, 'gemini-2.5-flash-image');
      setResultImage(editedBase64);
      
      await saveToHistory({
        url: editedBase64,
        prompt: "Upscale & Enhance",
        model: 'gemini-2.5-flash-image',
        type: 'edited',
        aspectRatio,
      });

    } catch (err) {
      console.error("Upscale failed", err);
      alert("Failed to upscale image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `lumina-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Edit & Upscale</h2>
        <p className="text-slate-400">Transform images with AI-powered editing and upscaling tools.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Source Images (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 space-y-5 h-full">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/50">
               <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                 <ImageIcon className="w-4 h-4 text-indigo-400" />
               </div>
               <h3 className="font-semibold text-slate-200">Source Material</h3>
            </div>

            {/* Primary Image */}
            <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Primary Input</label>
                 {uploadedImages[0] && (
                    <button onClick={() => handleRemoveImage(0)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                 )}
               </div>
               <div 
                 onClick={() => triggerUpload(uploadedImages.length > 0 ? 0 : null)}
                 className={`relative group cursor-pointer w-full aspect-[4/3] rounded-xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden bg-slate-950 ${
                   uploadedImages[0] ? 'border-indigo-500/50' : 'border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-900'
                 }`}
               >
                 {uploadedImages[0] ? (
                   <>
                    <img src={`data:${uploadedImages[0].mimeType};base64,${uploadedImages[0].data}`} alt="Primary" className="w-full h-full object-contain bg-slate-950" />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                      <p className="text-white text-sm font-medium flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> Change
                      </p>
                    </div>
                   </>
                 ) : (
                   <div className="text-center p-4">
                     <Upload className="w-8 h-8 text-slate-600 mx-auto mb-3 group-hover:text-indigo-500 transition-colors" />
                     <p className="text-sm text-slate-500">Upload Main Image</p>
                   </div>
                 )}
               </div>
            </div>

            {/* References */}
            <div className="space-y-3 pt-2">
               <div className="flex justify-between items-center">
                 <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">References (Optional)</label>
                 <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-500 border border-slate-700">{Math.max(0, uploadedImages.length - 1)}/2</span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map((slotIndex) => {
                    const img = uploadedImages[slotIndex];
                    const canUpload = uploadedImages.length > 0 && (img || slotIndex === uploadedImages.length);
                    
                    return (
                      <div 
                        key={slotIndex}
                        onClick={() => canUpload ? triggerUpload(img ? slotIndex : null) : null}
                        className={`relative group h-24 w-full rounded-lg border border-dashed transition-all flex items-center justify-center overflow-hidden bg-slate-950 ${
                          img ? 'border-indigo-500/30' : canUpload ? 'border-slate-700 hover:border-indigo-500/40 cursor-pointer' : 'border-slate-800 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        {img ? (
                          <>
                            <img src={`data:${img.mimeType};base64,${img.data}`} alt={`Ref ${slotIndex}`} className="w-full h-full object-cover" />
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemoveImage(slotIndex); }}
                              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500/90 text-white rounded-md transition-colors backdrop-blur-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Plus className={`w-4 h-4 ${canUpload ? 'text-slate-600' : 'text-slate-800'}`} />
                            <span className={`text-[10px] ${canUpload ? 'text-slate-600' : 'text-slate-800'}`}>Add</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
               </div>
            </div>
            
            <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileSelect} 
               accept="image/*" 
               className="hidden" 
             />
          </div>
        </div>

        {/* Right Panel: Controls (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
           
           {/* Prompt Card */}
           <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-1 shadow-sm">
              <div className="px-5 pt-4 pb-2 border-b border-slate-800/50 flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-indigo-400" />
                 <span className="text-sm font-semibold text-slate-300">Edit Instructions</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how you want to change the image (e.g., 'Make it look like a cyberpunk city', 'Add snow', 'Remove the person')..."
                className="w-full h-32 bg-transparent border-none p-5 text-base text-white placeholder-slate-600 focus:ring-0 resize-none leading-relaxed"
              />
           </div>

           {/* Settings Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Aspect Ratio */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-3">
                 <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
                    <LayoutTemplate className="w-3.5 h-3.5" /> Output Aspect Ratio
                 </label>
                 <div className="flex gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/50">
                    {(['1:1', '16:9', '9:16', '3:4', '4:3'] as AspectRatio[]).map((ar) => (
                      <button
                        key={ar}
                        onClick={() => setAspectRatio(ar)}
                        className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                          aspectRatio === ar
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {ar}
                      </button>
                    ))}
                 </div>
              </div>
              
              {/* Quick Actions / Upscale */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                       <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Quick Upscale
                    </label>
                    <p className="text-[10px] text-slate-500">Enhance to 4K resolution & detail</p>
                 </div>
                 <button 
                   onClick={handleUpscale}
                   disabled={loading || uploadedImages.length === 0}
                   className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/20 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                   Upscale
                 </button>
              </div>
           </div>

           {/* Primary Generate Button */}
           <button
             onClick={handleEdit}
             disabled={loading || uploadedImages.length === 0 || !prompt}
             className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-indigo-500/20"
           >
             {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
             {loading ? 'Processing Edit...' : 'Generate Edit'}
           </button>
        </div>

        {/* Result Area (Full width below) */}
        {resultImage && uploadedImages[0] && (
           <div className="lg:col-span-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-1 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  
                  {/* Slider */}
                  <div className="flex-1 min-h-[500px] bg-black/50 relative">
                     <BeforeAfterSlider 
                        beforeImage={`data:${uploadedImages[0].mimeType};base64,${uploadedImages[0].data}`} 
                        afterImage={resultImage} 
                        className="h-full"
                     />
                  </div>

                  {/* Sidebar for Result Actions */}
                  <div className="lg:w-72 bg-slate-950/50 border-t lg:border-t-0 lg:border-l border-slate-800 p-6 flex flex-col justify-center space-y-6">
                     <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Settings2 className="text-indigo-400 w-5 h-5" /> Result Options
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Compare the original and the AI-edited version. You can download the result or use it as a new input.
                        </p>
                     </div>
                     
                     <div className="space-y-3">
                        <button 
                            onClick={downloadImage}
                            className="w-full px-4 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Download Result
                        </button>
                        <button 
                            onClick={() => {
                              const resultBase64 = resultImage.split(',')[1];
                              setUploadedImages([{
                                id: crypto.randomUUID(),
                                data: resultBase64,
                                mimeType: 'image/png'
                              }]);
                              setResultImage(null);
                              setPrompt('');
                            }}
                            className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700"
                        >
                            <ArrowRight className="w-4 h-4" /> Use as Input
                        </button>
                     </div>
                  </div>

                </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};