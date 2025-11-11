import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";

interface ImageEditorPageProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const mimeType = result.split(':')[1].split(';')[0];
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType });
        };
        reader.onerror = error => reject(error);
    });
};

const ImageEditorPage: React.FC<ImageEditorPageProps> = ({ isOpen, onClose, showToast }) => {
    const [originalImage, setOriginalImage] = useState<{ base64: string, mimeType: string, dataUrl: string } | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropzoneRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);

    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

    const reset = () => {
        setOriginalImage(null);
        setGeneratedImage(null);
        setPrompt('');
        setIsLoading(false);
        stopCamera();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFile = useCallback(async (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Please upload a valid image file.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const { base64, mimeType } = await fileToBase64(file);
            const dataUrl = `data:${mimeType};base64,${base64}`;
            setOriginalImage({ base64, mimeType, dataUrl });
            setGeneratedImage(null);
        } catch (error) {
            showToast('Failed to read the image.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    setIsCameraOn(true);
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                showToast("Could not access camera. Please check permissions.", "error");
            }
        }
    };
    
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
    };

    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            const mimeType = 'image/jpeg';
            const base64 = dataUrl.split(',')[1];
            setOriginalImage({ base64, mimeType, dataUrl });
            setGeneratedImage(null);
            stopCamera();
        }
    };

    const handleGenerate = async () => {
        if (!originalImage || !prompt || !ai) {
            showToast(ai ? 'Please upload an image and enter a prompt.' : 'API Key is not configured.', 'error');
            return;
        }

        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: originalImage.base64, mimeType: originalImage.mimeType } },
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                    setGeneratedImage(imageUrl);
                    break;
                }
            }
        } catch (error) {
            console.error("Image generation failed:", error);
            showToast('Image generation failed. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Drag and drop handlers
    useEffect(() => {
        const dropzone = dropzoneRef.current;
        if (!dropzone) return;

        const onDragOver = (e: DragEvent) => { e.preventDefault(); dropzone.classList.add('border-primary', 'bg-primary/10'); };
        const onDragLeave = (e: DragEvent) => { e.preventDefault(); dropzone.classList.remove('border-primary', 'bg-primary/10'); };
        const onDrop = (e: DragEvent) => {
            e.preventDefault();
            dropzone.classList.remove('border-primary', 'bg-primary/10');
            const file = e.dataTransfer?.files[0];
            if (file) handleFile(file);
        };

        dropzone.addEventListener('dragover', onDragOver);
        dropzone.addEventListener('dragleave', onDragLeave);
        dropzone.addEventListener('drop', onDrop);
        return () => {
            dropzone.removeEventListener('dragover', onDragOver);
            dropzone.removeEventListener('dragleave', onDragLeave);
            dropzone.removeEventListener('drop', onDrop);
        };
    }, [handleFile]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-base-100 z-[10000] flex flex-col p-4 sm:p-6 md:p-8 animate-fade-in">
            <header className="flex-shrink-0 flex items-center gap-2 sm:gap-4 mb-4">
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-base-300 transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="font-bangla text-2xl sm:text-3xl font-bold text-primary">AI Image Editor</h1>
            </header>

            <main className="flex-grow bg-base-200 border border-primary/20 rounded-2xl flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
                {/* Controls */}
                <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4">
                    <div ref={dropzoneRef} className="h-48 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center p-4 text-center transition-colors">
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => handleFile(e.target.files?.[0] || null)} />
                        <button onClick={() => fileInputRef.current?.click()} className="text-primary font-semibold hover:underline">Upload Image</button>
                        <p className="text-xs text-muted-content mt-1">or drag and drop</p>
                        <button onClick={startCamera} className="text-sm text-primary font-semibold hover:underline mt-2">Use Camera</button>
                    </div>

                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Describe your edits... e.g., 'Add a retro filter' or 'Remove the person in the background'"
                        className="w-full h-24 p-2 bg-base-300/50 border border-primary/20 rounded-lg resize-none"
                        disabled={isLoading}
                    />
                    <button onClick={handleGenerate} disabled={isLoading || !originalImage || !prompt} className="w-full py-3 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all disabled:opacity-50">
                        {isLoading ? 'Generating...' : '✨ Generate'}
                    </button>
                    {generatedImage && (
                        <a href={generatedImage} download="edited-image.png" className="w-full text-center py-2 bg-success text-white font-semibold rounded-lg hover:bg-green-600 transition-all">
                            Download Image
                        </a>
                    )}
                </div>

                {/* Image Previews */}
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                    <div className="bg-base-300/30 rounded-lg p-2 flex flex-col items-center justify-center">
                        <h3 className="text-sm font-semibold text-muted-content mb-2">Original</h3>
                        <div className="w-full h-full flex items-center justify-center">
                            {originalImage ? <img src={originalImage.dataUrl} alt="Original" className="max-w-full max-h-full object-contain rounded" /> : <p className="text-muted-content text-sm">Upload an image to start</p>}
                        </div>
                    </div>
                    <div className="bg-base-300/30 rounded-lg p-2 flex flex-col items-center justify-center">
                        <h3 className="text-sm font-semibold text-muted-content mb-2">Generated</h3>
                        <div className="w-full h-full flex items-center justify-center">
                            {isLoading && <div className="text-primary animate-pulse">Processing...</div>}
                            {generatedImage && <img src={generatedImage} alt="Generated" className="max-w-full max-h-full object-contain rounded" />}
                            {!isLoading && !generatedImage && <p className="text-muted-content text-sm">Your edited image will appear here</p>}
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Camera Modal */}
            {isCameraOn && (
                <div className="fixed inset-0 bg-black/80 z-20 flex flex-col items-center justify-center p-4">
                    <video ref={videoRef} className="max-w-full max-h-[80%] rounded-lg"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="flex gap-4 mt-4">
                        <button onClick={takePicture} className="px-6 py-3 bg-primary text-primary-content font-bold rounded-full">Take Picture</button>
                        <button onClick={stopCamera} className="px-6 py-3 bg-base-300 text-base-content font-semibold rounded-full">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageEditorPage;
