import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize, AspectRatio, GenerationModel, PromptTemplateSection } from "../types";

// Helper to get a fresh AI instance. 
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert AI prompt engineer. Rewrite the following simple prompt to be highly detailed, descriptive, and optimized for image generation models. 
      Focus on lighting, texture, composition, and mood. 
      Keep the original intent but elevate the quality.
      
      Original Prompt: "${originalPrompt}"
      
      Return ONLY the enhanced prompt text, nothing else.`,
    });
    return response.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Prompt enhancement failed:", error);
    return originalPrompt;
  }
};

export const generatePromptIdeas = async (): Promise<PromptTemplateSection[]> => {
  const ai = getAIClient();
  const prompt = `Generate a collection of 4 distinct, creative categories for AI image generation prompts. 
  For each category, provide 3 unique, highly detailed, and descriptive prompts. 
  Categories can be things like 'Cyberpunk', 'Nature Photography', 'Abstract Art', 'Fantasy', 'Architecture', etc.
  Make them inspiring and diverse.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    prompts: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["category", "prompts"]
                }
              }
            }
          }
        }
    });

    if (response.text) {
      const json = JSON.parse(response.text);
      return json.sections || [];
    }
    return [];
  } catch (e) {
      console.error("Failed to parse prompt ideas", e);
      return [];
  }
};

export const generateImage = async (
  prompt: string, 
  size: ImageSize = '1K', 
  aspectRatio: AspectRatio = '1:1',
  model: string = 'gemini-2.5-flash-image',
  negativePrompt?: string,
  numberOfImages: number = 1
): Promise<string[]> => {
  const ai = getAIClient();

  // Combine negative prompt if present (simple appending for broad compatibility)
  const finalPrompt = negativePrompt 
    ? `${prompt} --no ${negativePrompt}` 
    : prompt;

  try {
    // Check if the model is an Imagen model
    if (model.includes('imagen')) {
      const response = await ai.models.generateImages({
        model: model,
        prompt: finalPrompt,
        config: {
          numberOfImages: numberOfImages,
          aspectRatio: aspectRatio,
          outputMimeType: 'image/png',
        }
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => 
          `data:image/png;base64,${img.image.imageBytes}`
        );
      }
      throw new Error("No image data found in Imagen response");
    } 
    
    // Default to Gemini generation (e.g. gemini-2.5-flash-image)
    // Gemini generateContent usually returns 1 image per request. 
    // To support multiple, we run parallel requests.
    else {
      const generateSingle = async () => {
        const response = await ai.models.generateContent({
          model: model,
          contents: {
            parts: [{ text: finalPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio,
            }
          },
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
        throw new Error("No image data found in Gemini response");
      };

      // Run requests in parallel
      const promises = Array(numberOfImages).fill(null).map(() => generateSingle());
      const results = await Promise.all(promises);
      return results;
    }

  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

export interface InputImage {
  data: string;
  mimeType: string;
}

export const editImage = async (
  images: InputImage[], 
  prompt: string,
  aspectRatio: AspectRatio = '1:1',
  model: string = 'gemini-2.5-flash-image'
): Promise<string> => {
  const ai = getAIClient();
  
  if (images.length === 0) {
    throw new Error("At least one image is required for editing.");
  }

  // Ensure we are using a supported editing model
  if (!model.includes('gemini') && !model.includes('flash-image')) {
     throw new Error(`Model ${model} does not support image editing. Please use gemini-2.5-flash-image.`);
  }

  try {
    // Construct parts: Images first, then prompt
    const parts = [
      ...images.map(img => ({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType,
        },
      })),
      { text: prompt },
    ];

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No edited image returned");
  } catch (error) {
    console.error("Image editing failed:", error);
    throw error;
  }
};

export const analyzeImage = async (
  base64Image: string, 
  mimeType: string, 
  prompt: string,
  model: string = 'gemini-2.5-flash'
): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt || "Analyze this image in detail." },
        ],
      },
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Image analysis failed:", error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};
