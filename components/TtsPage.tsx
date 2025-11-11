import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";

interface TtsPageProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

// Base64 decode function from guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Audio decoding function from guidelines
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const TtsPage: React.FC<TtsPageProps> = ({ isOpen, onClose, showToast }) => {
    const [text, setText] = useState('Hello! This is a demonstration of Text-to-Speech powered by Gemini.');
    const [isLoading, setIsLoading] = useState(false);
    const [voice, setVoice] = useState('Kore');
    const audioContext = useMemo(() => new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }), []);

    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

    const handleGenerateAndPlay = async () => {
        if (!text || !ai) {
            showToast(ai ? 'Please enter some text to generate speech.' : 'API Key is not configured.', 'error');
            return;
        }
        setIsLoading(true);

        try {
            const response = await ai.models.generateContent({
              model: "gemini-2.5-flash-preview-tts",
              contents: [{ parts: [{ text }] }],
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
              },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
            } else {
                throw new Error("No audio data received.");
            }
        } catch (error) {
            console.error("TTS generation failed:", error);
            showToast('Failed to generate speech. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const voices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

    return (
        <div className="fixed inset-0 bg-base-100 z-[10000] flex flex-col p-4 sm:p-6 md:p-8 animate-fade-in">
            <header className="flex-shrink-0 flex items-center gap-2 sm:gap-4 mb-4">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-base-300 transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="font-bangla text-2xl sm:text-3xl font-bold text-primary">Text-to-Speech</h1>
            </header>
            <main className="flex-grow bg-base-200 border border-primary/20 rounded-2xl flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl flex flex-col gap-4">
                    <textarea value={text} onChange={e => setText(e.target.value)} rows={8} placeholder="Enter text here..." className="w-full p-3 bg-base-300/50 border border-primary/20 rounded-lg resize-y focus:outline-none focus:ring-1 focus:ring-primary" />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow flex items-center gap-2">
                             <label htmlFor="voice-select" className="text-sm font-semibold text-muted-content">Voice:</label>
                             <select id="voice-select" value={voice} onChange={e => setVoice(e.target.value)} className="w-full p-3 bg-base-300/50 border border-primary/20 rounded-lg text-base-content focus:outline-none focus:ring-1 focus:ring-primary">
                                {voices.map(v => <option key={v} value={v}>{v}</option>)}
                             </select>
                        </div>
                        <button onClick={handleGenerateAndPlay} disabled={isLoading || !text} className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading ? 'Generating...' : '🔊 Generate & Play'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TtsPage;
