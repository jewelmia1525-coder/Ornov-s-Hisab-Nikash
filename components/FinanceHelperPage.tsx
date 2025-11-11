

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface FinanceHelperPageProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

interface Location {
    latitude: number;
    longitude: number;
}

interface Message {
    type: 'user' | 'ai';
    content: string;
    chunks?: any[];
}

const AiProcessingView: React.FC = () => (
    <div className="flex items-center gap-3 p-4 bg-base-300/50 rounded-lg self-start">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xl flex-shrink-0">
            🗺️
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
        </div>
    </div>
);

// Simple Markdown-like text to HTML parser
const formatResponse = (text: string) => {
    // Replace **text** with <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace * list items with <li>
    text = text.replace(/^\s*\*\s+(.*)/gm, '<li>$1</li>');
    // Wrap list items in <ul>
    text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // Replace newlines with <br>
    text = text.replace(/\n/g, '<br />');
    // Fix <br> inside ul
    text = text.replace(/<ul><br \/>/g, '<ul>').replace(/<\/li><br \/>/g, '</li>');
    
    return { __html: text };
};

const FinanceHelperPage: React.FC<FinanceHelperPageProps> = ({ isOpen, onClose, showToast }) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(true);
    const [locationError, setLocationError] = useState<string>('');
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversation, setConversation] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [conversation, isLoading]);

    const getLocation = () => {
        setLocationError('');
        setIsGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    showToast('Location acquired!', 'success');
                    setIsGettingLocation(false);
                },
                (error) => {
                    setLocationError(`Error: ${error.message}. Grant permission and retry.`);
                    showToast(`Error: ${error.message}`, 'error');
                    setIsGettingLocation(false);
                }
            );
        } else {
            const errorMsg = "Geolocation is not supported by this browser.";
            setLocationError(errorMsg);
            showToast(errorMsg, 'error');
            setIsGettingLocation(false);
        }
    };
    
    useEffect(() => {
        if(isOpen) {
            setConversation([]);
            setQuery('');
            getLocation();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent, prompt?: string) => {
        e.preventDefault();
        const currentQuery = prompt || query;
        if (!currentQuery) return;
        if (!ai) { showToast('API Key not configured.', 'error'); return; }
        if (!location) { showToast('Location not available. Please allow location access.', 'error'); return; }

        setIsLoading(true);
        setConversation(prev => [...prev, { type: 'user', content: currentQuery }]);
        setQuery('');

        try {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: currentQuery,
                config: {
                    tools: [{ googleMaps: {} }],
                    toolConfig: { retrievalConfig: { latLng: location } }
                },
            });

            const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setConversation(prev => [...prev, { type: 'ai', content: result.text, chunks }]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            const errorMessage = "An error occurred while fetching information. Please try again.";
            showToast(errorMessage, 'error');
            setConversation(prev => [...prev, { type: 'ai', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const suggestions = [
        "Find ATMs near me",
        "Good lunch spots for under ৳300",
        "Compare mobile repair shops nearby",
        "Where can I buy cheap electronics?",
    ];
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-base-100 z-[10000] flex flex-col p-4 sm:p-6 md:p-8 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="finance-helper-title">
            <header className="flex-shrink-0 flex items-center gap-2 sm:gap-4 mb-4">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-base-300 transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 id="finance-helper-title" className="font-bangla text-2xl sm:text-3xl font-bold text-primary">Nearby Finance Helper</h1>
            </header>

            <main className="flex-grow bg-base-200 border border-primary/20 rounded-2xl flex flex-col p-4 overflow-hidden">
                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    {conversation.map((msg, index) => (
                        <div key={index} className={`flex flex-col gap-2 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                            {msg.type === 'user' ? (
                                <div className="max-w-xl bg-primary text-primary-content p-3 rounded-lg rounded-br-none">
                                    <p>{msg.content}</p>
                                </div>
                            ) : (
                                <div className="max-w-xl flex items-start gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xl flex-shrink-0">🗺️</div>
                                    <div className="bg-base-300/50 p-3 rounded-lg rounded-bl-none">
                                        <div dangerouslySetInnerHTML={formatResponse(msg.content)} className="prose prose-sm text-base-content" />
                                        {msg.chunks && msg.chunks.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-primary/20">
                                                <h4 className="font-semibold text-primary mb-2 text-xs uppercase">Sources & Places</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {msg.chunks.map((chunk, i) => (
                                                        (chunk.maps && chunk.maps.uri) &&
                                                        <a href={chunk.maps.uri} key={i} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full hover:bg-primary/20 transition-colors">
                                                            📍 {chunk.maps.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                     {isLoading && <AiProcessingView />}
                    <div ref={messagesEndRef} />
                    {conversation.length === 0 && !isLoading && (
                         <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <h2 className="text-2xl font-bold text-base-content">What can I help you find?</h2>
                            <p className="text-muted-content mt-2 max-w-md">Get AI-powered financial suggestions based on your current location.</p>
                             <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {suggestions.map(s => (
                                    <button key={s} onClick={(e) => handleSubmit(e, s)} className="px-3 py-1.5 bg-base-300/50 text-primary text-sm font-semibold rounded-full hover:bg-primary/20 transition-colors">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 pt-4 border-t border-primary/20">
                    {locationError && 
                        <div className="flex items-center justify-center gap-2 text-xs text-danger mb-2">
                            <span>{locationError}</span>
                            <button onClick={getLocation} className="font-bold underline">Retry</button>
                        </div>
                    }
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input 
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={
                                isGettingLocation ? "Acquiring location..." : 
                                location ? "Ask a location-based question..." : 
                                "Location access needed..."
                            }
                            className="w-full px-4 py-3 bg-base-300/50 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                            disabled={!location || isLoading || isGettingLocation}
                            aria-label="Your financial question"
                        />
                        <button type="submit" className="px-6 py-3 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all disabled:opacity-50" disabled={!location || isLoading || !query}>
                            Ask
                        </button>
                    </form>
                </div>
            </main>
             <style>{`
                .prose ul { padding-left: 1.25rem; }
                .prose li { margin-bottom: 0.25rem; }
             `}</style>
        </div>
    );
};

export default FinanceHelperPage;