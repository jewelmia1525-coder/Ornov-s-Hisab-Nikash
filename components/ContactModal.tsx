

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Contact } from '../types';
import Modal from './Modal';
import { GoogleGenAI, Modality } from "@google/genai";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Omit<Contact, 'date'>) => void;
    contact: Contact | null;
    type: 'receivable' | 'payable';
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSave, contact, type }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New states for image generation
    const [showGenerator, setShowGenerator] = useState(false);
    const [generatorPrompt, setGeneratorPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

    const placeholder = `https://placehold.co/60x60/0f1a30/ffd700?text=?`;

    useEffect(() => {
        if (contact) {
            setName(contact.name);
            setAmount(String(contact.amount));
            setReason(contact.reason);
            setPhoto(contact.photo);
        } else {
            setName('');
            setAmount('');
            setReason('');
            setPhoto(undefined);
        }
        setShowGenerator(false);
        setGeneratorPrompt('');
        setIsGenerating(false);
    }, [contact, isOpen]);

    useEffect(() => {
        if (showGenerator) {
            setGeneratorPrompt(`A simple, professional cartoon avatar for ${name}, who is associated with: ${reason}. Minimalist, flat design, icon.`);
        }
    }, [showGenerator, name, reason]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_DIM = 200;
                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_DIM) {
                        height *= MAX_DIM / width;
                        width = MAX_DIM;
                    }
                } else {
                    if (height > MAX_DIM) {
                        width *= MAX_DIM / height;
                        height = MAX_DIM;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setPhoto(dataUrl);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleGeneratePhoto = async () => {
        if (!generatorPrompt || !ai) return;
        setIsGenerating(true);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: generatorPrompt }],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
    
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                    setPhoto(imageUrl);
                    break;
                }
            }
            setShowGenerator(false);
        } catch (error) {
            console.error("Image generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: contact?.id,
            type: contact ? contact.type : type,
            name,
            amount: parseFloat(amount),
            reason,
            photo,
        });
    };

    const title = contact 
        ? `Edit ${contact.type}` 
        : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-4 mb-4">
                    <img src={photo || placeholder} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"/>
                    <div className="flex-grow space-y-2">
                        <div className="flex gap-2">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-sm text-center py-2 bg-base-300/50 border border-dashed border-primary/30 rounded-lg hover:bg-primary/20 transition-colors">Upload</button>
                            <button type="button" onClick={() => setShowGenerator(s => !s)} className="w-full text-sm text-center py-2 bg-base-300/50 border border-dashed border-primary/30 rounded-lg hover:bg-primary/20 transition-colors">{showGenerator ? 'Cancel' : '✨ Generate'}</button>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                         {photo && <button type="button" onClick={() => setPhoto(undefined)} className="w-full text-xs text-center text-danger hover:underline">Remove Photo</button>}
                    </div>
                </div>

                {showGenerator && (
                    <div className="mb-4 space-y-2">
                        <label className="block text-sm font-medium text-muted-content" htmlFor="gen-prompt">Image Prompt</label>
                        <textarea 
                            id="gen-prompt"
                            value={generatorPrompt}
                            onChange={e => setGeneratorPrompt(e.target.value)}
                            placeholder="A simple, professional icon..."
                            className="w-full text-sm px-2 py-1.5 bg-base-300/50 border border-primary/20 rounded-lg"
                            rows={3}
                            disabled={isGenerating}
                        />
                        <button
                            type="button"
                            onClick={handleGeneratePhoto}
                            disabled={isGenerating || !generatorPrompt}
                            className="w-full text-sm text-center py-2 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Image'}
                        </button>
                    </div>
                )}
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-muted-content mb-1" htmlFor="contact-name">Name</label>
                    <input id="contact-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-muted-content mb-1" htmlFor="contact-amount">Amount</label>
                    <input id="contact-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                 <div className="mb-6">
                    <label className="block text-sm font-medium text-muted-content mb-1" htmlFor="contact-reason">Reason</label>
                    <input id="contact-reason" type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all">{contact ? 'Update' : 'Save'}</button>
            </form>
        </Modal>
    );
};

export default ContactModal;