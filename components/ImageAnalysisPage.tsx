import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface ImageAnalysisPageProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

interface Message {
    type: 'user' | 'ai';
    content: string;
}

const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string, dataUrl: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const mimeType = dataUrl.split(':')[1].split(';')[0];
            const base64 = dataUrl.split(',')[1];
            resolve({ base64, mimeType, dataUrl });
        };
        reader.onerror = error => reject(error);
    });
};

const ImageAnalysisPage: React.FC<ImageAnalysisPageProps> = ({ isOpen, onClose, showToast }) => {
    const [image, setImage] = useState<{ base64: string, mimeType: string, dataUrl: string } | null>(null);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversation, setConversation] = useState<Message[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);

    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [conversation, isLoading]);

    const handleFile = useCallback(async (file: File | null) => {
        if (!file || !file.type.startsWith('image/')) return;
        try {
            const imgData = await fileToBase64(file);
            setImage(imgData);
            setConversation([]);
        } catch (error) {
            showToast('Failed to read image.', 'error');
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
            } catch (err) { showToast("Could not access camera.", "error"); }
        }
    };
    
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
    };

    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const v = videoRef.current;
            const c = canvasRef.current;
            c.width = v.videoWidth;
            c.height = v.videoHeight;
            c.getContext('2d')?.drawImage(v, 0, 0, v.videoWidth, v.videoHeight);
            const dataUrl = c.toDataURL('image/jpeg');
            const mimeType = 'image/jpeg';
            const base64 = dataUrl.split(',')[1];
            setImage({ base64, mimeType, dataUrl });
            setConversation([]);
            stopCamera();
        }
    };

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query || !image || !ai) return;

        setIsLoading(true);
        const userMessage: Message = { type: 'user', content: query };
        setConversation(prev => [...prev, userMessage]);
        setQuery('');

        try {
            const imagePart = { inlineData: { data: image.base64, mimeType: image.mimeType } };
            const textPart = { text: query };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });
            const aiMessage: Message = { type: 'ai', content: response.text };
            setConversation(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { type: 'ai', content: 'Sorry, I encountered an error.' };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        stopCamera();
        setImage(null);
        setConversation([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-base-100 z-[10000] flex flex-col p-4 sm:p-6 md:p-8 animate-fade-in">
            <header className="flex-shrink-0 flex items-center gap-2 sm:gap-4 mb-4">
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-base-300 transition-colors" aria-label="Go back">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="font-bangla text-2xl sm:text-3xl font-bold text-primary">AI Image Analyzer</h1>
            </header>
            <main className="flex-grow bg-base-200 border border-primary/20 rounded-2xl flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
                <div className="w-full lg:w-1/2 xl:w-2/5 flex-shrink-0 flex flex-col items-center justify-center bg-base-300/30 rounded-lg p-2">
                    {image ? (
                        <img src={image.dataUrl} alt="User upload" className="max-w-full max-h-full object-contain rounded" />
                    ) : (
                        <div className="text-center">
                            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => handleFile(e.target.files?.[0] || null)} />
                            <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus">Upload Image</button>
                            <button onClick={startCamera} className="mt-2 text-sm text-primary font-semibold hover:underline">Or Use Camera</button>
                        </div>
                    )}
                </div>
                <div className="flex-grow flex flex-col overflow-hidden">
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                        {conversation.map((msg, i) => (
                             <div key={i} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                 <div className={`p-3 rounded-lg max-w-xl ${msg.type === 'user' ? 'bg-primary text-primary-content rounded-br-none' : 'bg-base-300/50 rounded-bl-none'}`}>
                                     {msg.content}
                                 </div>
                             </div>
                        ))}
                        {isLoading && <div className="text-muted-content animate-pulse">AI is thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleAsk} className="flex-shrink-0 pt-4 border-t border-primary/20 flex gap-2">
                        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask about the image..." className="w-full p-3 bg-base-300/50 border border-primary/30 rounded-lg" disabled={!image || isLoading} />
                        <button type="submit" className="px-6 py-3 bg-primary text-primary-content font-bold rounded-lg disabled:opacity-50" disabled={!image || isLoading || !query}>Send</button>
                    </form>
                </div>
            </main>
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

export default ImageAnalysisPage;
