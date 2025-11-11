import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signature: string) => void;
    currentSignature: string | null;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSave, currentSignature }) => {
    const [preview, setPreview] = useState<string | null>(currentSignature);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreview(currentSignature);
    }, [currentSignature, isOpen]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (preview) {
            onSave(preview);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload Signature">
            <div className="flex flex-col items-center gap-4">
                <div className="w-full h-32 bg-base-300/50 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/30 p-2">
                    {preview ? (
                        <img src={preview} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                        <p className="text-muted-content">No signature uploaded</p>
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/png, image/jpeg" className="hidden" />
                <div className="w-full flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="flex-grow py-2 bg-base-300 hover:bg-base-300/70 border border-primary/20 rounded-lg font-semibold text-base-content transition-colors">
                        Choose Image
                    </button>
                    {preview && <button onClick={() => setPreview(null)} className="flex-shrink-0 px-4 py-2 bg-danger/20 text-danger rounded-lg font-semibold hover:bg-danger/30 transition-colors">Remove</button>}
                </div>
                <button onClick={handleSave} disabled={!preview} className="w-full py-2.5 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all disabled:bg-primary/50 disabled:cursor-not-allowed">
                    Save Signature
                </button>
            </div>
        </Modal>
    );
};

export default SignatureModal;
