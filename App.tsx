import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Editor } from './components/Editor';

const IMAGE_STYLES = [
  "None",
  "Cinematic",
  "Digital Art",
  "Photography",
  "Anime",
  "Oil Painting",
  "Watercolor",
  "Cyberpunk",
  "Vintage",
  "3D Render",
  "Sketch",
  "Minimalist",
  "Chalermchai Kositpipat",
  "Modern Thai Murals",
  "Lai Thai"
];

const STYLE_DETAILS: Record<string, string> = {
  "Chalermchai Kositpipat": "painting in the style of Chalermchai Kositpipat, Thai contemporary traditional spiritual art, highly detailed and refined, inspired by Buddhist and mythological themes, intricate Thai traditional patterns (Lai Thai), luminous glowing colors of gold, blue, violet, and white, sacred and ethereal atmosphere, elegant flowing lines and fine brush details, golden ornaments, divine beings, celestial architecture, radiant aura, painted in the style of modern Thai temple murals, ultra-detailed, vibrant, luminous, visionary masterpiece.",
  "Modern Thai Murals": "painting in the style of Modern Thai Murals, Thai contemporary traditional spiritual art, highly detailed and refined, inspired by mythological themes, intricate Thai traditional patterns (Lai Thai), luminous glowing colors of gold, blue, violet, and white, sacred and ethereal atmosphere, elegant flowing lines and fine brush details, golden ornaments, celestial architecture, radiant aura, painted in the style of modern Thai murals, ultra-detailed, vibrant, luminous, visionary masterpiece.",
  "Lai Thai": "painting in the style of Modern Thai Art, Thai contemporary traditional art, highly detailed and refined, inspired by intricate Thai traditional patterns (Lai Thai), luminous glowing colors of gold, blue, violet, and white, elegant flowing lines and fine brush details, radiant aura, ultra-detailed, vibrant, luminous, visionary masterpiece."
};

const IMAGE_MODELS = [
  { id: 'gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Image (High Quality)' },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro Image (Premium)' },
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image (Standard)' },
  { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0' },
  { id: 'gemini-flash-image-latest', name: 'Gemini Flash Image Latest' },
  { id: 'gemini-pro-image-latest', name: 'Gemini Pro Image Latest' },
  { id: 'gemini-flash-latest', name: 'gemini-flash-latest' },
  { id: 'gemini-flash-lite-latest', name: 'gemini-flash-lite-latest' },
  { id: 'gemini-3-flash-preview', name: 'gemini-3-flash-preview' },
  { id: 'gemini-3.1-pro-preview', name: 'gemini-3.1-pro-preview' },
];

const TEXT_REASONING_MODELS = [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro Preview' },
    { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite Preview' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' },
    { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite Latest' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-pro-latest', name: 'Gemini Pro (Latest Stable)' },
];

const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"];

const App: React.FC = () => {
  // --- API Key States ---
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');

  // --- App States ---
  const [story, setStory] = useState<string>('');
  const [modifiedStory, setModifiedStory] = useState<string>('');
  const [imageStyle, setImageStyle] = useState<string>(IMAGE_STYLES[0]);
  const [imageConcept, setImageConcept] = useState<string>('');
  const [imageConceptEnglish, setImageConceptEnglish] = useState<string>('');
  
  const [firstFramePrompt, setFirstFramePrompt] = useState<string>('');
  const [maxPromptLength, setMaxPromptLength] = useState<string>('800');
  const [videoPrompt, setVideoPrompt] = useState<string>('');
  
  const [selectedModel, setSelectedModel] = useState<string>(IMAGE_MODELS[0].id);
  const [selectedTextModel, setSelectedTextModel] = useState<string>(TEXT_REASONING_MODELS[0].id);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("16:9");
  
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedFirstFrameUrl, setGeneratedFirstFrameUrl] = useState<string | null>(null);

  const [isGeneratingThai, setIsGeneratingThai] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isCreatingImage, setIsCreatingImage] = useState<boolean>(false);
  const [isCreatingFirstFrameImage, setIsCreatingFirstFrameImage] = useState<boolean>(false);
  const [isCreatingVideoPrompt, setIsCreatingVideoPrompt] = useState<boolean>(false);

  // --- API Key Handlers ---
  useEffect(() => {
    // Check localStorage on component mount (avoids hydration errors in SSR/Vercel)
    const storedKey = localStorage.getItem('google_ai_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setApiKeyInput(storedKey);
    } else {
      setApiKeyInput('no API key');
    }
  }, []);

  const handleSaveApiKey = useCallback(() => {
    const keyToSave = apiKeyInput.trim();
    if (!keyToSave || keyToSave === 'no API key') {
      alert('Please enter a valid API key before sending.');
      return;
    }
    localStorage.setItem('google_ai_api_key', keyToSave);
    setApiKey(keyToSave);
    alert('API Key saved to browser storage!');
  }, [apiKeyInput]);

  const handleCopyApiKey = useCallback(() => {
    const keyToCopy = apiKeyInput === 'no API key' ? '' : apiKeyInput;
    if (!keyToCopy) {
      alert('No API Key to copy.');
      return;
    }
    navigator.clipboard.writeText(keyToCopy).then(() => alert('API Key copied to clipboard!'));
  }, [apiKeyInput]);

  const handleClearApiKey = useCallback(() => {
    localStorage.removeItem('google_ai_api_key');
    setApiKey('');
    setApiKeyInput(''); // ลบให้กลายเป็นช่องว่างตามที่ต้องการ
  }, []);

  const handleFocusApiKey = useCallback(() => {
    // หากผู้ใช้คลิกช่องตอนที่เป็น 'no API key' ให้เคลียร์เป็นช่องว่างเพื่อให้พิมพ์ง่ายขึ้น
    if (apiKeyInput === 'no API key') {
      setApiKeyInput('');
    }
  }, [apiKeyInput]);

  // --- Feature Handlers ---
  const handlePostStory = useCallback(() => {
    setModifiedStory(story);
  }, [story]);

  const handleGenerateThaiConcept = useCallback(async () => {
    if (!apiKey) {
      alert('Please enter and Send your Google AI Studio API Key at the top first.');
      return;
    }
    if (!modifiedStory.trim()) {
      alert('Please provide a Modified Story first.');
      return;
    }

    setIsGeneratingThai(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const styleInfo = imageStyle !== "None" ? `Style: ${imageStyle}. Details: ${STYLE_DETAILS[imageStyle] || ''}` : "Style: Automatic (Choose the most appropriate style for the story).";
      
      const systemInstruction = `คุณคือผู้เชี่ยวชาญด้านการสร้างภาพประกอบ (Image Concept Creator) ที่มีความรู้ความสามารถสูง 
เชี่ยวชาญในด้านจิตวิทยาการเรียนการสอน การถ่ายทอดความรู้ และการสื่อสารที่ชัดเจนผ่านภาพ 
คุณมีศิลปะในการสร้างสรรค์ภาพที่สวยงาม โดดเด่น ดึงดูดสายตา และเข้าใจง่าย 
คุณมีความเข้าใจในหลักธรรมคำสอนของพระพุทธศาสนาอย่างลึกซึ้ง

หน้าที่ของคุณคือ:
1. วิเคราะห์ "เรื่องราวที่ปรับปรุงแล้ว" (Modified Story) ที่ได้รับ
2. แนะนำแนวคิดภาพประกอบ (Image Concept) ในสไตล์: ${styleInfo}
3. ออกแบบแนวคิดภาพให้มีความหมายลึกซึ้ง สวยงาม และดึงดูดใจ
4. ต้องปฏิบัติตามกฎระเบียบของ YouTube อย่างเคร่งครัด (Safe for work, no violence, appropriate content)
5. เขียนคำอธิบายแนวคิดภาพเป็นภาษาไทยที่ละเอียดและเห็นภาพชัดเจน เพื่อใช้เป็นจุดเริ่มต้นในการสร้างภาพนิ่ง (First frame)

ส่งคำตอบกลับมาเป็นเฉพาะข้อความคำอธิบายแนวคิดภาพภาษาไทยเท่านั้น`;

      const response = await ai.models.generateContent({
        model: selectedTextModel,
        contents: `Modified Story: ${modifiedStory}`,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        },
      });

      const result = response.text;
      if (result) {
        setImageConcept(result.trim());
      }
    } catch (error: any) {
      console.error('Error generating Thai concept:', error);
      alert(`Failed to generate concept. Please check your API key and try again. Error: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingThai(false);
    }
  }, [modifiedStory, imageStyle, apiKey, selectedTextModel]);

  const handleGenerateEnglishConcept = useCallback(async () => {
    if (!apiKey) {
      alert('Please enter and Send your Google AI Studio API Key at the top first.');
      return;
    }
    if (!imageConcept.trim()) {
      alert('Please generate or enter an Image Concept in Thai first.');
      return;
    }

    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const styleInfo = imageStyle !== "None" ? `The intended style is: ${imageStyle}.` : "";

      const systemInstruction = `You are a world-class AI Image Prompt Engineer and expert translator. 
Your task is to translate and refine the provided Thai "Image Concept" into a high-quality, professional English prompt for AI image generation models.

Guidelines:
1. Carefully translate the Thai visual description into clear, descriptive, and technical English.
2. Optimize the language for AI models to ensure the generated image is as accurate and visually stunning as possible.
3. Incorporate the requested style effectively: ${styleInfo}
4. Focus on lighting, composition, mood, and fine details mentioned in the Thai text.
5. Ensure the result is safe and complies with general content safety standards.

Provide ONLY the translated and refined English prompt as your output.`;

      const response = await ai.models.generateContent({
        model: selectedTextModel,
        contents: `Thai Image Concept: ${imageConcept}`,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const result = response.text;
      if (result) {
        setImageConceptEnglish(result.trim());
      }
    } catch (error: any) {
      console.error('Error translating to English:', error);
      alert(`Failed to translate concept. Please try again. Error: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsTranslating(false);
    }
  }, [imageConcept, imageStyle, apiKey, selectedTextModel]);

  const generateUniversalImage = async (prompt: string, style: string, model: string, ratio: string, currentApiKey: string) => {
    if (model.includes('pro-image') || model.includes('imagen') || model.includes('3.1-flash-image')) {
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey?.();
      // Only trigger if aistudio logic exists in your environment, otherwise we rely on our provided API Key
      if (hasKey === false) {
        alert('Please select a paid API key for this model generation.');
        await (window as any).aistudio?.openSelectKey?.();
      }
    }

    const ai = new GoogleGenAI({ apiKey: currentApiKey });
    const fullPrompt = `${prompt}${style !== "None" ? `, ${STYLE_DETAILS[style] || style}` : ""}`;

    if (model.includes('imagen')) {
      try {
        const response = await ai.models.generateImages({
          model: model,
          prompt: fullPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: ratio as any,
          },
        });
        return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
      } catch (error: any) {
        console.warn("Error with aspectRatio in generateImages, retrying without it:", error);
        const fallbackResponse = await ai.models.generateImages({
          model: model,
          prompt: fullPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
          },
        });
        return `data:image/png;base64,${fallbackResponse.generatedImages[0].image.imageBytes}`;
      }
    } else {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: {
            parts: [{ text: fullPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: ratio as any,
              ...(model.includes('pro-image') || model.includes('3.1-flash-image') ? { imageSize: "1K" } : {})
            },
          },
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData?.data) {
          return `data:image/png;base64,${imagePart.inlineData.data}`;
        } else {
          throw new Error('No image data found in response');
        }
      } catch (error: any) {
        console.warn("Error with imageConfig, retrying without it:", error);
        const fallbackResponse = await ai.models.generateContent({
          model: model,
          contents: {
            parts: [{ text: fullPrompt }],
          }
        });
        const imagePart = fallbackResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData?.data) {
          return `data:image/png;base64,${imagePart.inlineData.data}`;
        } else {
          throw new Error('No image data found in fallback response');
        }
      }
    }
  };

  const handleCreateImage = useCallback(async () => {
    if (!apiKey) {
      alert('Please enter and Send your Google AI Studio API Key at the top first.');
      return;
    }
    if (!imageConceptEnglish.trim()) {
      alert('Please provide an English Image Concept first.');
      return;
    }

    setIsCreatingImage(true);
    try {
      const url = await generateUniversalImage(imageConceptEnglish, imageStyle, selectedModel, selectedAspectRatio, apiKey);
      setGeneratedImageUrl(url);
    } catch (error: any) {
      console.error('Error creating image:', error);
      if (error.message?.includes("Requested entity was not found")) {
        alert("The API key might not have access to this model. Please use a valid key.");
      } else {
        alert('Failed to create image. Please check your prompt or API Key and try again.');
      }
    } finally {
      setIsCreatingImage(false);
    }
  }, [imageConceptEnglish, imageStyle, selectedModel, selectedAspectRatio, apiKey]);

  const handleCreateFirstFrameImage = useCallback(async () => {
    if (!apiKey) {
      alert('Please enter and Send your Google AI Studio API Key at the top first.');
      return;
    }
    if (!firstFramePrompt.trim()) {
      alert('Please generate or enter a First Frame Prompt first.');
      return;
    }

    setIsCreatingFirstFrameImage(true);
    try {
      const url = await generateUniversalImage(firstFramePrompt, imageStyle, selectedModel, selectedAspectRatio, apiKey);
      setGeneratedFirstFrameUrl(url);
    } catch (error: any) {
      console.error('Error creating first frame image:', error);
      if (error.message?.includes("Requested entity was not found")) {
        alert("The API key might not have access to this model. Please use a valid key.");
      } else {
        alert('Failed to create image. Please check your prompt or API Key and try again.');
      }
    } finally {
      setIsCreatingFirstFrameImage(false);
    }
  }, [firstFramePrompt, imageStyle, selectedModel, selectedAspectRatio, apiKey]);

  const handleCreateVideoPrompt = useCallback(async () => {
    if (!apiKey) {
      alert('Please enter and Send your Google AI Studio API Key at the top first.');
      return;
    }
    if (!imageConcept.trim()) {
      alert('Please generate an Image Concept in Thai first.');
      return;
    }

    setIsCreatingVideoPrompt(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const maxLength = parseInt(maxPromptLength) || 800;

      const systemInstruction = `You are a world-class Prompt Engineer and visual storyteller. 
You possess deep knowledge in educational psychology, visual communication, and cinematic arts. 
You are also deeply familiar with Buddhist teachings.

Your task:
1. Analyze the "Image Concept in Thai" and the "Modified Story".
2. Design a stunning video clip that explains the story's core message beautifully and effectively, adhering to YouTube's current safety guidelines.
3. Generate a highly detailed English "First Frame Prompt" for a high-quality image generation AI.
   - CONSTRAINT: The total character count (including spaces) of this First Frame Prompt MUST NOT EXCEED ${maxLength} characters.
4. Generate an English "Video Prompt" (Image-to-Video) based on that first frame to achieve the designed motion and visual storytelling.

FORMAT YOUR RESPONSE AS JSON:
{
  "firstFramePrompt": "the detailed English prompt for the image here",
  "videoPrompt": "the English prompt for the video motion here"
}`;

      const response = await ai.models.generateContent({
        model: selectedTextModel,
        contents: `Modified Story: ${modifiedStory}\nImage Concept in Thai: ${imageConcept}`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const result = JSON.parse(response.text);
      if (result.firstFramePrompt) {
        setFirstFramePrompt(result.firstFramePrompt.trim());
      }
      if (result.videoPrompt) {
        setVideoPrompt(result.videoPrompt.trim());
      }
    } catch (error: any) {
      console.error('Error creating video prompt:', error);
      alert(`Failed to create video prompt. Please check your API key and try again. Error: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsCreatingVideoPrompt(false);
    }
  }, [imageConcept, modifiedStory, maxPromptLength, apiKey, selectedTextModel]);

  // --- Copy & Clear Handlers ---
  const handleCopyStory = useCallback(() => {
    if (!story) return;
    navigator.clipboard.writeText(story).then(() => alert('Original story copied!'));
  }, [story]);
  const handleClearStory = useCallback(() => setStory(''), []);

  const handleCopyModified = useCallback(() => {
    if (!modifiedStory) return;
    navigator.clipboard.writeText(modifiedStory).then(() => alert('Modified story copied!'));
  }, [modifiedStory]);
  const handleClearModified = useCallback(() => setModifiedStory(''), []);

  const handleCopyConcept = useCallback(() => {
    if (!imageConcept) return;
    navigator.clipboard.writeText(imageConcept).then(() => alert('Image concept (Thai) copied!'));
  }, [imageConcept]);
  const handleClearConcept = useCallback(() => setImageConcept(''), []);

  const handleCopyConceptEnglish = useCallback(() => {
    if (!imageConceptEnglish) return;
    navigator.clipboard.writeText(imageConceptEnglish).then(() => alert('Image concept (English) copied!'));
  }, [imageConceptEnglish]);
  const handleClearConceptEnglish = useCallback(() => setImageConceptEnglish(''), []);

  const handleCopyFirstFrame = useCallback(() => {
    if (!firstFramePrompt) return;
    navigator.clipboard.writeText(firstFramePrompt).then(() => alert('First frame prompt copied!'));
  }, [firstFramePrompt]);
  const handleClearFirstFrame = useCallback(() => setFirstFramePrompt(''), []);

  const handleCopyVideoPrompt = useCallback(() => {
    if (!videoPrompt) return;
    navigator.clipboard.writeText(videoPrompt).then(() => alert('Video prompt copied!'));
  }, [videoPrompt]);
  const handleClearVideoPrompt = useCallback(() => setVideoPrompt(''), []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8 pb-20">
        
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Story Image Generator</h1>
          <p className="text-slate-500">Transform your words into visual art</p>
          <p className="text-sm font-bold text-gray-500 mt-2 tracking-widest">ts</p>
        </header>

        {/* --- API Key Section (New) --- */}
        <section className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-3">
          <div className="flex flex-col space-y-1">
            <label className="text-slate-700 font-bold text-lg tracking-tight">Google AI Studio API Key</label>
            <p className="text-xs text-slate-500 mb-2">
              Please enter your API Key. It will be stored securely in your browser's local storage.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onFocus={handleFocusApiKey}
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste your API Key here..."
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSaveApiKey} 
                className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
              >
                Send
              </button>
              <button 
                onClick={handleCopyApiKey} 
                className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm active:scale-95"
              >
                Copy
              </button>
              <button 
                onClick={handleClearApiKey} 
                className="px-5 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-sm active:scale-95"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        <section>
          <Editor label="Story" value={story} onChange={setStory} onCopy={handleCopyStory} onClear={handleClearStory} onPost={handlePostStory} />
        </section>

        <section>
          <Editor label="Modified Story" value={modifiedStory} onChange={setModifiedStory} onCopy={handleCopyModified} onClear={handleClearModified} />
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-6">
          <div className="flex flex-col space-y-3">
            <label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">Text Reasoning Model</label>
            <div className="relative">
              <select value={selectedTextModel} onChange={(e) => setSelectedTextModel(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 appearance-none cursor-pointer">
                {TEXT_REASONING_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <p className="text-xs text-slate-500">Used for all text processing tasks (e.g., generating concepts, translating, creating prompts).</p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-6">
          <div className="flex flex-col space-y-3">
            <label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">Image Style</label>
            <div className="relative">
              <select value={imageStyle} onChange={(e) => setImageStyle(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 appearance-none cursor-pointer">
                {IMAGE_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleGenerateThaiConcept} disabled={isGeneratingThai} className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center ${isGeneratingThai ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            {isGeneratingThai ? 'Thinking...' : 'Image Concept in Thai'}
          </button>
        </section>

        <section>
          <Editor label="Image Concept in Thai" heightClass="h-[240px]" value={imageConcept} onChange={setImageConcept} onCopy={handleCopyConcept} onClear={handleClearConcept} />
        </section>

        <section className="flex flex-col items-center">
          <button onClick={handleGenerateEnglishConcept} disabled={isTranslating} className={`w-full max-w-md py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center ${isTranslating ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
            {isTranslating ? 'Translating...' : 'Image Concept in English'}
          </button>
        </section>

        <section>
          <Editor label="Image Concept in English" heightClass="h-[240px]" value={imageConceptEnglish} onChange={setImageConceptEnglish} onCopy={handleCopyConceptEnglish} onClear={handleClearConceptEnglish} />
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">AI Image Model</label>
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {IMAGE_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">Aspect Ratio</label>
              <select value={selectedAspectRatio} onChange={(e) => setSelectedAspectRatio(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {ASPECT_RATIOS.map((ar) => <option key={ar} value={ar}>{ar}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleCreateImage} disabled={isCreatingImage} className={`w-full py-5 rounded-xl font-black text-xl transition-all flex items-center justify-center ${isCreatingImage ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {isCreatingImage ? 'Creating...' : 'Create Image'}
          </button>
        </section>

        {/* First Frame & Video Prompt Generation Section */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <label className="text-slate-700 font-bold text-xl block">First Frame Prompt</label>
              <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
                <span>Max Prompt Length :</span>
                <div className="relative w-20">
                  <input 
                    type="text" 
                    value={maxPromptLength} 
                    onChange={(e) => setMaxPromptLength(e.target.value)}
                    className="w-full p-1 text-center font-handwriting bg-yellow-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <span>characters</span>
              </div>
            </div>
            <button 
              onClick={handleCreateVideoPrompt} 
              disabled={isCreatingVideoPrompt}
              className={`px-8 py-3 rounded-xl font-bold transition-all shadow-md ${isCreatingVideoPrompt ? 'bg-slate-100 text-slate-400' : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'}`}
            >
              {isCreatingVideoPrompt ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-purple-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Designing...
                </span>
              ) : 'Create Video Prompt'}
            </button>
          </div>

          <Editor 
            label="First Frame Prompt" 
            heightClass="h-[240px]" 
            value={firstFramePrompt} 
            onChange={setFirstFramePrompt} 
            onCopy={handleCopyFirstFrame} 
            onClear={handleClearFirstFrame} 
          />
          
          <Editor 
            label="Video Prompt" 
            heightClass="h-[240px]" 
            value={videoPrompt} 
            onChange={setVideoPrompt} 
            onCopy={handleCopyVideoPrompt} 
            onClear={handleClearVideoPrompt} 
          />

          <div className="flex flex-col items-center pt-4">
            <button
              onClick={handleCreateFirstFrameImage}
              disabled={isCreatingFirstFrameImage}
              className={`w-full max-w-md py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center shadow-lg ${
                isCreatingFirstFrameImage 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-900 text-white hover:bg-black active:scale-[0.98]'
              }`}
            >
              {isCreatingFirstFrameImage ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating First Frame...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Create First Frame Image
                </>
              )}
            </button>
          </div>

          {generatedFirstFrameUrl && (
            <div className="flex flex-col items-center pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="w-full max-w-[500px] bg-white p-2 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                  <img 
                    src={generatedFirstFrameUrl} 
                    alt="First Frame Masterpiece" 
                    className="w-full h-auto rounded-2xl block shadow-inner"
                  />
                  <div className="mt-4 p-4 flex justify-between items-center border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Type</span>
                      <span className="text-slate-700 font-semibold">First Frame</span>
                    </div>
                    <a 
                      href={generatedFirstFrameUrl} 
                      download={`first-frame-${Date.now()}.png`}
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg active:scale-95"
                    >
                      Download
                    </a>
                  </div>
               </div>
            </div>
          )}
        </section>

        {generatedImageUrl && (
          <section className="flex flex-col items-center">
             <div className="w-full max-w-[500px] bg-white p-2 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <img src={generatedImageUrl} alt="Masterpiece" className="w-full h-auto rounded-2xl block" />
                <div className="mt-4 p-4 flex justify-between items-center border-t border-slate-50">
                  <span className="text-slate-700 font-semibold">{selectedAspectRatio}</span>
                  <a href={generatedImageUrl} download="image.png" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold">Download</a>
                </div>
             </div>
          </section>
        )}

        <footer className="py-12 text-center text-slate-400 text-sm">
          <p>© 2024 Story Image Generator • Creative Visual Workflow</p>
        </footer>
      </div>
    </div>
  );
};

export default App;