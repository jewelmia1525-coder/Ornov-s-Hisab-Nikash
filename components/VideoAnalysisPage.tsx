import React, { useState, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";

interface VideoAnalysisPageProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

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

const VideoAnalysisPage: React.FC<VideoAnalysisPageProps> = ({ isOpen, onClose, showToast }) => {
    const [videoFile, setVideoFile] = useState<{ name: string; dataUrl: string; base64: string; mimeType: string; } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [transcriptionResult, setTranscriptionResult] = useState('');
    const [currentTask, setCurrentTask] = useState<'analysis' | 'transcription' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

    const reset = () => {
        setVideoFile(null);
        setPrompt('');
        setIsLoading(false);
        setResult('');
        setTranscriptionResult('');
        setCurrentTask(null);
    };
    
    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFile = useCallback(async (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            showToast('Please upload a valid video file.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const { base64, mimeType } = await fileToBase64(file);
            const dataUrl = `data:${mimeType};base64,${base64}`;
            setVideoFile({ name: file.name, dataUrl, base64, mimeType });
            setResult('');
            setTranscriptionResult('');
        } catch (error) {
            showToast('Failed to read the video file.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const runAnalysis = async (analysisPrompt: string) => {
        if (!videoFile || !analysisPrompt || !ai) {
            showToast(ai ? 'Please upload a video and provide a prompt.' : 'API Key is not configured.', 'error');
            return;
        }

        setIsLoading(true);
        setCurrentTask('analysis');
        setResult('');
        // Do not clear transcription result when running analysis
        setPrompt(analysisPrompt);

        try {
            const videoPart = { inlineData: { data: videoFile.base64, mimeType: videoFile.mimeType } };
            const textPart = { text: analysisPrompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [videoPart, textPart] },
            });
            
            setResult(response.text);

        } catch (error) {
            console.error("Video analysis failed:", error);
            showToast('Video analysis failed. The video might be too long or in an unsupported format.', 'error');
            setResult('Error during analysis.');
        } finally {
            setIsLoading(false);
            setCurrentTask(null);
        }
    };

    const runTranscription = async () => {
        if (!videoFile || !ai) {
            showToast(ai ? 'Please upload a video first.' : 'API Key is not configured.', 'error');
            return;
        }

        setIsLoading(true);
        setCurrentTask('transcription');
        setTranscriptionResult('');
        // Do not clear analysis result or prompt when running transcription
        
        try {
            const videoPart = { inlineData: { data: videoFile.base64, mimeType: videoFile.mimeType } };
            const textPart = { text: "Transcribe the audio from this video. Provide only the text of the transcription, without any additional comments, headings, or summaries." };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [videoPart, textPart] },
            });
            
            setTranscriptionResult(response.text);

        } catch (error) {
            console.error("Video transcription failed:", error);
            showToast('Video transcription failed. The video might be too long or in an unsupported format.', 'error');
            setTranscriptionResult('Error during transcription.');
        } finally {
            setIsLoading(false);
            setCurrentTask(null);
        }
    };
    
    const handleManualAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        runAnalysis(prompt);
    };

    const handleQuickAnalysis = (type: 'summarize' | 'extract') => {
        const quickPrompts = {
            summarize: "Provide a concise summary of this video. The summary should capture the main events, topics, and overall message of the video.",
            extract: "Extract the key talking points from this video as a bulleted list. Each point should be a clear and concise statement representing a main idea or topic discussed."
        };
        runAnalysis(quickPrompts[type]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-base-100 z-[10000] flex flex-col p-4 sm:p-6 md:p-8 animate-fade-in">
            <header className="flex-shrink-0 flex items-center gap-2 sm:gap-4 mb-4">
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-base-300 transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="font-bangla text-2xl sm:text-3xl font-bold text-primary">AI Video Analyzer</h1>
            </header>
            <main className="flex-grow bg-base-200 border border-primary/20 rounded-2xl flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
                <div className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-4">
                    <div className="h-48 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                        <input type="file" accept="video/*" ref={fileInputRef} className="hidden" onChange={e => handleFile(e.target.files?.[0] || null)} />
                        <button onClick={() => fileInputRef.current?.click()} className="text-primary font-semibold hover:underline">Upload Video</button>
                        <p className="text-xs text-muted-content mt-1">MP4, MOV, etc.</p>
                        {videoFile && <p className="text-xs text-success mt-2 truncate">Loaded: {videoFile.name}</p>}
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleQuickAnalysis('summarize')} disabled={isLoading || !videoFile} className="w-full py-2 bg-primary/20 text-primary text-sm font-semibold rounded-lg hover:bg-primary/30 transition-all disabled:opacity-50">
                            📝 Summarize
                        </button>
                        <button onClick={() => handleQuickAnalysis('extract')} disabled={isLoading || !videoFile} className="w-full py-2 bg-primary/20 text-primary text-sm font-semibold rounded-lg hover:bg-primary/30 transition-all disabled:opacity-50">
                            🎯 Extract Points
                        </button>
                    </div>
                    <button onClick={runTranscription} disabled={isLoading || !videoFile} className="w-full py-2 bg-primary/20 text-primary text-sm font-semibold rounded-lg hover:bg-primary/30 transition-all disabled:opacity-50">
                        {isLoading && currentTask === 'transcription' ? 'Transcribing...' : '🎤 Transcribe Video'}
                    </button>
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Or type your own question..." className="w-full flex-grow p-2 bg-base-300/50 border border-primary/20 rounded-lg resize-none" disabled={isLoading} />
                    <button onClick={handleManualAnalyze} disabled={isLoading || !videoFile || !prompt} className="w-full py-3 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all disabled:opacity-50">
                        {isLoading && currentTask === 'analysis' ? 'Analyzing...' : 'Analyze Custom Prompt'}
                    </button>
                </div>
                <div className="flex-grow flex flex-col gap-4 min-h-0">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                        <div className="bg-base-300/30 rounded-lg p-2 flex flex-col items-center justify-center">
                            <h3 className="text-sm font-semibold text-muted-content mb-2 flex-shrink-0">Video Preview</h3>
                            <div className="w-full h-full flex items-center justify-center relative flex-grow">
                                {videoFile ? <video src={videoFile.dataUrl} controls className="max-w-full max-h-full object-contain rounded" /> : <p className="text-muted-content text-sm">Upload a video to start</p>}
                            </div>
                        </div>
                        <div className="bg-base-300/30 rounded-lg p-2 flex flex-col">
                            <h3 className="text-sm font-semibold text-muted-content mb-2">AI Analysis Result</h3>
                            <div className="w-full flex-grow overflow-y-auto p-2">
                                {isLoading && currentTask === 'analysis' && <div className="text-primary animate-pulse">Thinking...</div>}
                                {result && <pre className="whitespace-pre-wrap text-sm text-base-content font-sans">{result}</pre>}
                                {!isLoading && !result && <p className="text-muted-content text-sm">Analysis results will appear here.</p>}
                            </div>
                        </div>
                    </div>
                    <div className="bg-base-300/30 rounded-lg p-2 flex flex-col flex-1 min-h-0">
                        <h3 className="text-sm font-semibold text-muted-content mb-2">Transcription</h3>
                        <div className="w-full flex-grow overflow-y-auto p-2">
                            {isLoading && currentTask === 'transcription' && <div className="text-primary animate-pulse">Transcribing...</div>}
                            {transcriptionResult && <pre className="whitespace-pre-wrap text-sm text-base-content font-sans">{transcriptionResult}</pre>}
                            {!isLoading && !transcriptionResult && <p className="text-muted-content text-sm">Transcription will appear here.</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VideoAnalysisPage;