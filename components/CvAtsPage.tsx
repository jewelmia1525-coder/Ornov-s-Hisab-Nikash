

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";

// --- Helper Functions & Types ---
type AnalysisState = 'idle' | 'uploading' | 'uploaded' | 'analyzing' | 'showing_result' | 'rewriting' | 'error';
type AnalysisType = 'ats' | 'skill' | 'improve';
interface CvAtsPageProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}
declare const emailjs: any;
declare const jspdf: any;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const formatMarkdown = (text: string) => {
    let html = text
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 border-b-2 border-primary/30 pb-2">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3 border-b border-primary/20 pb-1">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-base-300/50 px-1 py-0.5 rounded text-sm">$1</code>');

    // Handle lists - this is tricky with mixed paragraphs
    const blocks = html.split('\n\n');
    const newBlocks = blocks.map(block => {
        if (block.match(/^\s*[\*\-]\s/)) {
            const listItems = block.split('\n').map(item => `<li>${item.replace(/^\s*[\*\-]\s/, '')}</li>`).join('');
            return `<ul class="list-disc list-inside space-y-1 my-2 pl-4">${listItems}</ul>`;
        }
        // Don't wrap elements that are already html tags
        if (block.match(/^<[a-z][\s\S]*>/i)) {
            return block;
        }
        return `<p>${block.replace(/\n/g, '<br />')}</p>`;
    });

    html = newBlocks.join('');

    return { __html: html };
};


// --- SVG Icons ---
const AtsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);
const SkillIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);
const ImproveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);


// --- Main Component ---
const CvAtsPage: React.FC<CvAtsPageProps> = ({ isOpen, onClose, showToast }) => {
    const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; base64: string } | null>(null);
    const [activeResult, setActiveResult] = useState<{ title: string; content: string } | null>(null);
    const [modifiedCvText, setModifiedCvText] = useState<string | null>(null);
    const [isResultPageOpen, setIsResultPageOpen] = useState(false);
    
    const dropzoneRef = useRef<HTMLDivElement>(null);
    
    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

    const resetState = useCallback(() => {
        setAnalysisState('idle');
        setUploadProgress(0);
        setUploadedFile(null);
        setActiveResult(null);
        setModifiedCvText(null);
        setIsResultPageOpen(false);
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFile = useCallback(async (file: File | null) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            showToast('শুধুমাত্র PDF ফাইল আপলোড করুন', 'error');
            return;
        }

        setAnalysisState('uploading');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress >= 100) {
                clearInterval(interval);
                progress = 100;
            }
            setUploadProgress(progress);
        }, 200);

        try {
            const base64 = await fileToBase64(file);
            setUploadedFile({ name: file.name, base64 });
            setTimeout(() => {
                clearInterval(interval);
                setUploadProgress(100);
                setAnalysisState('uploaded');
            }, 2500); // Ensure loader shows for a bit
        } catch (error) {
            console.error(error);
            showToast('ফাইল পড়তে ব্যর্থ হয়েছে', 'error');
            setAnalysisState('idle');
            clearInterval(interval);
        }
    }, [showToast]);

    const handleAnalyze = async (type: AnalysisType) => {
        if (!uploadedFile || !ai) {
            showToast(ai ? 'Please upload a CV first.' : 'API Key is not configured.', 'error');
            return;
        }
        setAnalysisState('analyzing');
        
        const prompts = {
            ats: 'Analyze this resume and provide an ATS (Applicant Tracking System) score out of 100. Provide a detailed breakdown of the score, highlighting strengths (like keywords, clear formatting) and weaknesses (like complex tables, missing sections). Format the response in Markdown.',
            skill: 'Extract all technical and soft skills from this resume. Categorize them clearly. Then, compare them against the typical skills required for an "Electrical & Smart Systems Engineer" role. Provide a detailed analysis of skill gaps and strengths. Format the response in Markdown.',
            improve: 'Based on this resume, provide a list of actionable suggestions to improve its quality, clarity, and impact for an "Electrical & Smart Systems Engineer" position. Focus on content, structure, and powerful wording. Give specific examples where possible. Format the response in Markdown.',
        };

        const titles = {
            ats: 'ATS Score Analysis',
            skill: 'Skill Analysis',
            improve: 'Improvement Suggestions',
        };

        try {
            const pdfPart = { inlineData: { mimeType: 'application/pdf', data: uploadedFile.base64 } };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [pdfPart, { text: prompts[type] }] },
            });
            setActiveResult({ title: titles[type], content: response.text });
            setAnalysisState('showing_result');
            setIsResultPageOpen(true);
        } catch (error) {
            console.error("Gemini API error:", error);
            showToast('Analysis failed. Please try again.', 'error');
            setAnalysisState('uploaded');
        }
    };
    
    const handleApplyAts = async () => {
        if (!uploadedFile || !ai) return;
        setAnalysisState('rewriting');
        try {
            const pdfPart = { inlineData: { mimeType: 'application/pdf', data: uploadedFile.base64 } };
            const prompt = "Rewrite this resume text to be highly optimized for Applicant Tracking Systems (ATS). Ensure clear headings (like 'Professional Summary', 'Work Experience', 'Skills', 'Education'). Use standard, professional language. Incorporate relevant keywords for an 'Electrical & Smart Systems Engineer' role. Structure the content logically with bullet points for achievements. The output should be the full, rewritten resume text in plain text format, ready for a clean PDF conversion. Do not include any introductory text or explanations, only the resume content itself.";
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [pdfPart, { text: prompt }] },
            });
            setModifiedCvText(response.text);
            showToast('ATS optimization applied!', 'success');
        } catch (error) {
             console.error("Gemini API error:", error);
             showToast('Failed to apply ATS formatting.', 'error');
        } finally {
            setAnalysisState('showing_result');
        }
    };

    // Drag and drop handlers
    useEffect(() => {
        const dropzone = dropzoneRef.current;
        if (!dropzone) return;

        const onDragOver = (e: DragEvent) => {
            e.preventDefault();
            dropzone.classList.add('border-primary', 'bg-primary/10');
        };
        const onDragLeave = (e: DragEvent) => {
            e.preventDefault();
            dropzone.classList.remove('border-primary', 'bg-primary/10');
        };
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
                <h1 className="font-bangla text-2xl sm:text-3xl font-bold text-primary">সিভি বিশ্লেষণ করুন</h1>
            </header>

            <main className="flex-grow bg-base-200 border border-primary/20 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                {analysisState === 'idle' && <UploadView onFileSelect={handleFile} dropzoneRef={dropzoneRef} />}
                {analysisState === 'uploading' && <LoadingView progress={uploadProgress} />}
                {analysisState === 'uploaded' && uploadedFile && <AnalysisOptionsView onAnalyze={handleAnalyze} fileName={uploadedFile.name} onReset={resetState} />}
                {(analysisState === 'analyzing' || analysisState === 'rewriting') && <AiProcessingView text={analysisState === 'rewriting' ? 'Optimizing CV...' : 'Analyzing...'} />}
            </main>

            {isResultPageOpen && activeResult && (
                <ResultView 
                    result={activeResult} 
                    onClose={() => { setIsResultPageOpen(false); setAnalysisState('uploaded'); }} 
                    onApplyAts={handleApplyAts}
                    modifiedCvText={modifiedCvText}
                    isRewriting={analysisState === 'rewriting'}
                    showToast={showToast}
                />
            )}
        </div>
    );
};

// --- Sub Components ---
const UploadView: React.FC<{onFileSelect: (f: File) => void, dropzoneRef: React.RefObject<HTMLDivElement>}> = ({onFileSelect, dropzoneRef}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return(
        <div ref={dropzoneRef} className="w-full max-w-lg p-8 border-2 border-dashed border-primary/30 rounded-2xl transition-colors">
            <h2 className="font-bangla text-xl font-semibold text-base-content">আপনার রিজিউমে/সিভি</h2>
            <p className="font-bangla text-sm text-muted-content mt-1 mb-6">শুধুমাত্র PDF ফাইল</p>
            <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={e => onFileSelect(e.target.files![0])} />
            <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all">
                ফাইল ব্রাউজ করুন
            </button>
            <p className="text-xs text-muted-content mt-4">or drag and drop here</p>
        </div>
    );
};

const LoadingView: React.FC<{progress: number}> = ({progress}) => {
    const circumference = 2 * Math.PI * 54;
    return(
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
                 <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--color-primary)/0.1)" strokeWidth="12" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--color-primary))" strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={circumference - (progress / 100) * circumference} strokeLinecap="round" transform="rotate(-90 60 60)" className="transition-all duration-150" />
                </svg>
                 <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">{progress}%</span>
            </div>
            <p className="text-lg font-semibold text-base-content mt-4 animate-pulse">Uploading...</p>
        </div>
    );
};

const AnalysisOptionsView: React.FC<{onAnalyze: (t: AnalysisType) => void, fileName: string, onReset: () => void}> = ({onAnalyze, fileName, onReset}) => {
    return(
        <div className="w-full max-w-4xl animate-fade-in">
            <div className="flex items-center justify-center gap-2 bg-base-300/50 p-2 rounded-lg mb-8 max-w-md mx-auto">
                 <span className="text-green-500">✔</span>
                 <p className="text-sm font-semibold text-base-content truncate">Uploaded: {fileName}</p>
                 <button onClick={onReset} className="text-xs text-muted-content hover:text-primary underline flex-shrink-0">Upload new</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnalysisCard icon={<AtsIcon />} title="ATS স্কোর" description="আপনার সিভি ATS সাপোর্টেট কি না? চেক করুন ATS স্কোর কত?" onClick={() => onAnalyze('ats')} />
                <AnalysisCard icon={<SkillIcon />} title="স্কিল বিশ্লেষণ" description="আপনার স্কিলসেট চেক করুন এবং ইন্ডাস্ট্রি জবের সাথে ম্যাচ করুন" onClick={() => onAnalyze('skill')} />
                <AnalysisCard icon={<ImproveIcon />} title="ইমপ্রুভমেন্ট" description="জব ম্যাচিং এর জন্য আরও কি ইমপ্রুভমেন্ট দরকার দেখুন" onClick={() => onAnalyze('improve')} />
            </div>
        </div>
    );
};

const AnalysisCard: React.FC<{icon: React.ReactNode, title: string, description: string, onClick: () => void}> = ({icon, title, description, onClick}) => (
    <button onClick={onClick} className="bg-base-100 p-6 rounded-2xl text-center group transition-all duration-300 hover:bg-base-300/50 hover:-translate-y-2">
        <div className="text-primary mx-auto transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <h3 className="font-bangla text-xl font-bold text-base-content mt-4">{title}</h3>
        <p className="font-bangla text-sm text-muted-content mt-2 filter blur-[3px] group-hover:blur-none transition-all duration-300">{description}</p>
    </button>
);

const AiProcessingView: React.FC<{text: string}> = ({text}) => (
    <div className="flex flex-col items-center justify-center text-primary">
         <svg className="w-16 h-16 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         <p className="text-lg font-semibold mt-4">{text}</p>
    </div>
);

const ResultView: React.FC<{
    result: { title: string, content: string }, 
    onClose: () => void,
    onApplyAts: () => void,
    modifiedCvText: string | null,
    isRewriting: boolean,
    showToast: (message: string, type?: 'success' | 'error') => void,
}> = ({ result, onClose, onApplyAts, modifiedCvText, isRewriting, showToast }) => {
    
    const [pageCount, setPageCount] = useState<number>(0); // 0 for default
    const [emailTo, setEmailTo] = useState('');
    const [emailSubject, setEmailSubject] = useState('My Professional CV');
    const [isEmailing, setIsEmailing] = useState(false);
    
    const downloadPdf = () => {
        const textToUse = modifiedCvText || "Please apply ATS optimization first to generate the new CV.";
        if(!modifiedCvText) {
            showToast(textToUse, 'error');
            return;
        }

        const { jsPDF } = jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 15;
        const usableWidth = pdf.internal.pageSize.getWidth() - margin * 2;
        const usableHeight = pdf.internal.pageSize.getHeight() - margin * 2;
        
        let fontSize = 10;
        if (pageCount === 1) fontSize = 8;
        if (pageCount >= 3) fontSize = 12;

        pdf.setFontSize(fontSize);
        
        const lines = pdf.splitTextToSize(textToUse, usableWidth);
        
        let cursorY = margin;
        let pageNum = 1;

        lines.forEach((line: string) => {
            if (cursorY + (pdf.getLineHeight() / pdf.internal.scaleFactor) > usableHeight + margin) {
                if (pageCount > 0 && pageNum >= pageCount) return;
                pdf.addPage();
                pageNum++;
                cursorY = margin;
            }
            pdf.text(line, margin, cursorY);
            cursorY += (pdf.getLineHeight() / pdf.internal.scaleFactor);
        });

        pdf.save('ATS_Optimized_CV.pdf');
        showToast('Download started!', 'success');
    };

    const handleEmailSend = (e: React.FormEvent) => {
        e.preventDefault();
        const textToUse = modifiedCvText;
        if (!textToUse) {
            showToast('Please apply ATS optimization before emailing.', 'error');
            return;
        }
        setIsEmailing(true);
        
        const templateParams = { to_email: emailTo, subject: emailSubject, reply_to: 'no-reply@system.com', from_name: 'CV ATS Analyzer', cv_text: textToUse };
        const SERVICE_ID = 'service_7bnmsc5', TEMPLATE_ID = 'template_txw5kbb', PUBLIC_KEY = 'xn72TxUTNzE92DKwt';
        
        emailjs.init({ publicKey: PUBLIC_KEY });
        emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
            .then(() => {
                showToast('CV sent successfully!', 'success');
                setEmailTo('');
                setEmailSubject('My Professional CV');
            }, (err: any) => {
                console.error(err);
                showToast('Failed to send email.', 'error');
            })
            .finally(() => setIsEmailing(false));
    };

    return (
        <div className="absolute inset-0 bg-base-100 z-10 flex flex-col p-4 sm:p-6 md:p-8 animate-fade-in">
             <header className="flex-shrink-0 flex items-center gap-2 sm:gap-4 mb-4">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-base-300 transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="font-bangla text-2xl sm:text-3xl font-bold text-primary">{result.title}</h1>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6 min-h-0">
                <div className="bg-base-200 border border-primary/20 rounded-2xl p-4 overflow-y-auto">
                    <div 
                        className="text-left text-sm text-base-content leading-relaxed space-y-4" 
                        dangerouslySetInnerHTML={formatMarkdown(result.content)}
                    />
                </div>
                <div className="bg-base-200 border border-primary/20 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto">
                    <button onClick={onApplyAts} disabled={isRewriting} className="w-full py-3 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all disabled:opacity-50 flex items-center justify-center">
                        {isRewriting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        Apply ATS Format
                    </button>
                    <div className="flex-grow bg-base-300/50 rounded-lg p-3 overflow-y-auto min-h-[150px]">
                         <pre className="text-left whitespace-pre-wrap font-sans text-xs text-muted-content">{modifiedCvText || 'Click "Apply ATS Format" to generate an optimized version of your CV here.'}</pre>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={downloadPdf} disabled={!modifiedCvText} className="px-4 py-2 bg-success text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50">Download</button>
                        <div className="flex items-center gap-2">
                             <label htmlFor="pageCount" className="text-sm font-semibold text-muted-content flex-shrink-0">Pages:</label>
                             <input type="number" id="pageCount" value={pageCount} onChange={e => setPageCount(parseInt(e.target.value))} min="0" className="w-20 px-2 py-1.5 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Default"/>
                        </div>
                    </div>
                    <form onSubmit={handleEmailSend} className="border-t border-primary/20 pt-4 flex flex-col gap-2">
                         <h4 className="font-semibold text-base-content">Email CV</h4>
                         <input type="email" placeholder="Recipient's Email" value={emailTo} onChange={e => setEmailTo(e.target.value)} className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg text-sm" required/>
                         <input type="text" placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg text-sm" required/>
                         <button type="submit" disabled={!modifiedCvText || isEmailing} className="w-full py-2 bg-primary/80 text-primary-content font-semibold rounded-lg hover:bg-primary transition-all disabled:opacity-50">{isEmailing ? 'Sending...' : 'Send Email'}</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CvAtsPage;
