import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Role, TypingLevel, TypingLanguage, TypingResult, CertificateData } from '../types';
import { typingLessons } from '../typingLessons';

declare const html2canvas: any;
declare const jspdf: any;

interface TypingMasterPageProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    role: Role | null;
}

function TypingMasterPage({
    isOpen,
    onClose,
    showToast,
    role,
}: TypingMasterPageProps) {
    const [screen, setScreen] = useState<'selection' | 'typing' | 'results' | 'certificate'>('selection');
    const [language, setLanguage] = useState<TypingLanguage>('english');
    const [typingConfig, setTypingConfig] = useState<{ level: TypingLevel; lesson: number; topic: number } | null>(null);
    const [lastResult, setLastResult] = useState<TypingResult | null>(null);
    const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);

    const handleStart = (level: TypingLevel, lesson: number, topic: number) => {
        setTypingConfig({ level, lesson, topic });
        setScreen('typing');
    };
    
    const handleComplete = (result: TypingResult) => {
        setLastResult(result);
        setScreen('results');
    };
    
    const handleTryAgain = () => {
        setScreen('typing');
    };

    const handleGoHome = () => {
        setTypingConfig(null);
        setLastResult(null);
        setScreen('selection');
    };
    
    const handleCertificate = () => {
        setIsSuperAdminMode(false);
        setScreen('certificate');
    };
    
    const handleSuperAdminGenerate = () => {
        setIsSuperAdminMode(true);
        setScreen('certificate');
    };

    const handleClose = () => {
        setScreen('selection');
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    const renderScreen = () => {
        switch (screen) {
            case 'typing':
                if (typingConfig) {
                    return <TypingScreen level={typingConfig.level} lessonIndex={typingConfig.lesson} topicIndex={typingConfig.topic} language={language} onComplete={handleComplete} />;
                }
                return null; // Should not happen
            case 'results':
                if (lastResult) {
                    return <ResultsScreen results={lastResult} onTryAgain={handleTryAgain} onGoHome={handleGoHome} onCertificate={handleCertificate} />;
                }
                return null;
            case 'certificate':
                return <CertificateScreen results={lastResult} onClose={handleGoHome} showToast={showToast} isSuperAdminMode={isSuperAdminMode} />;
            case 'selection':
            default:
                return <SelectionScreen onStart={handleStart} language={language} setLanguage={setLanguage} role={role} onSuperAdminGenerate={handleSuperAdminGenerate} />;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-base-100 z-[10000] flex flex-col p-4 sm:p-6 md:p-8 animate-fade-in">
            <header className="flex-shrink-0 flex items-center gap-2 sm:gap-4 mb-4">
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-base-300 transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="font-bangla text-2xl sm:text-3xl font-bold text-primary">Typing Master</h1>
            </header>
            <main className="flex-grow bg-base-200 border border-primary/20 rounded-2xl flex flex-col items-center justify-center">
                {renderScreen()}
            </main>
        </div>
    );
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- Sub-component: SelectionScreen ---
const SelectionScreen: React.FC<{
    onStart: (level: TypingLevel, lesson: number, topic: number) => void;
    language: TypingLanguage;
    setLanguage: (lang: TypingLanguage) => void;
    role: Role | null;
    onSuperAdminGenerate: () => void;
}> = ({ onStart, language, setLanguage, role, onSuperAdminGenerate }) => {
    const [selectedLevel, setSelectedLevel] = useState<TypingLevel>('easy');
    const [openLesson, setOpenLesson] = useState<number | null>(0);
    const levels: TypingLevel[] = ['easy', 'medium', 'hard'];
    
    const levelData = typingLessons[language][selectedLevel];

    return (
        <div className="w-full max-w-4xl animate-fade-in p-4">
            <div className="flex justify-center items-center gap-2 mb-6">
                <div className="p-1 bg-base-300/50 rounded-lg flex gap-1">
                    <button onClick={() => setLanguage('english')} className={`px-4 py-2 text-sm rounded-md transition-colors ${language === 'english' ? 'bg-primary text-primary-content' : 'hover:bg-primary/20'}`}>English</button>
                    <button onClick={() => setLanguage('bangla')} className={`px-4 py-2 text-sm rounded-md transition-colors ${language === 'bangla' ? 'bg-primary text-primary-content' : 'hover:bg-primary/20'}`}>Bangla</button>
                </div>
                 {role === 'super-admin' && (
                    <button onClick={onSuperAdminGenerate} className="px-4 py-2.5 text-xs bg-success/20 text-success rounded-lg font-semibold hover:bg-success/30 transition-colors animate-pulse">
                        ✨ Special Generate
                    </button>
                )}
            </div>
            <div className="flex justify-center gap-4 mb-6">
                {levels.map(level => (
                    <button key={level} onClick={() => setSelectedLevel(level)} className={`px-6 py-3 text-lg font-bold rounded-lg transition-all border-2 ${selectedLevel === level ? 'bg-primary text-primary-content border-primary' : 'bg-base-300/50 border-transparent hover:border-primary/50'}`}>
                        {typingLessons[language][level].title}
                    </button>
                ))}
            </div>

            <div className="space-y-2 text-left max-h-[60vh] overflow-y-auto pr-2">
                {levelData.lessons.map((lesson, lessonIndex) => (
                    <div key={lessonIndex} className="bg-base-300/30 rounded-lg">
                        <button onClick={() => setOpenLesson(openLesson === lessonIndex ? null : lessonIndex)} className="w-full p-4 flex justify-between items-center font-semibold text-base-content">
                            <span>{lesson.title}</span>
                            <span className={`transition-transform transform ${openLesson === lessonIndex ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        {openLesson === lessonIndex && (
                            <div className="p-4 border-t border-primary/20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {lesson.topics.map((topic, topicIndex) => (
                                    <button key={topicIndex} onClick={() => onStart(selectedLevel, lessonIndex, topicIndex)} className="p-3 bg-base-100 rounded-lg text-center hover:bg-primary/20 transition-colors">
                                        <p className="font-semibold text-primary">{topic.title}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Sub-component: TypingScreen ---
const TypingScreen: React.FC<{
    level: TypingLevel;
    lessonIndex: number;
    topicIndex: number;
    language: TypingLanguage;
    onComplete: (result: TypingResult) => void;
}> = ({ level, lessonIndex, topicIndex, language, onComplete }) => {
    const TIME_LIMIT = 60; // 1 minute
    const topic = useMemo(() => typingLessons[language][level].lessons[lessonIndex].topics[topicIndex], [language, level, lessonIndex, topicIndex]);
    const textToType = topic.text;
    const isHard = level === 'hard';

    const [userInput, setUserInput] = useState('');
    const [time, setTime] = useState(TIME_LIMIT);
    const [isTyping, setIsTyping] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingAreaRef = useRef<HTMLDivElement>(null);
    const synth = window.speechSynthesis;
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const finishTest = useCallback(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error("Could not exit fullscreen", err));
        }
        setIsTyping(false);
        const typedChars = userInput.length;
        const correctChars = typedChars - mistakes;
        const timeTaken = TIME_LIMIT - time;
        
        const wpm = timeTaken > 0 ? Math.round(((typedChars / 5) - mistakes) / (timeTaken / 60)) : 0;
        const accuracy = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 0;

        onComplete({
            wpm: Math.max(0, wpm),
            accuracy: Math.max(0, accuracy),
            time: timeTaken,
            level,
            language
        });
    }, [userInput, mistakes, time, level, language, onComplete]);

    useEffect(() => {
        let timerId: number | undefined;
        if (isTyping && time > 0) {
            timerId = window.setInterval(() => {
                setTime(prev => prev - 1);
            }, 1000);
        } else if (time === 0 && isTyping) {
            finishTest();
        }
        return () => clearInterval(timerId);
    }, [isTyping, time, finishTest]);
    
     useEffect(() => {
        if (time <= 10 && time > 0 && isTyping) {
            const utterance = new SpeechSynthesisUtterance(String(time));
            utterance.rate = 1.2;
            synth.speak(utterance);
        }
        if (time === 0 && isTyping) {
             const utterance = new SpeechSynthesisUtterance("Stop");
             synth.speak(utterance);
        }
    }, [time, isTyping, synth]);

    useEffect(() => {
        return () => {
            if (synth && synth.speaking) {
                synth.cancel();
            }
        }
    }, [synth]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (time === 0) return;
        if (!isTyping) {
            setIsTyping(true);
            typingAreaRef.current?.requestFullscreen().catch(err => {
                console.warn(`Could not enter fullscreen mode: ${err.message}`);
            });
        }

        const value = e.target.value;
        setUserInput(value);

        let currentMistakes = 0;
        value.split('').forEach((char, index) => {
            if (char !== textToType[index]) {
                currentMistakes++;
            }
        });
        setMistakes(currentMistakes);

        if (value.length === textToType.length) {
            finishTest();
        }
    };
    
    const textChars = useMemo(() => textToType.split(''), [textToType]);

    return (
        <div ref={typingAreaRef} className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in relative bg-base-200">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <p className="font-mono text-3xl font-bold text-primary">{time}</p>
            </div>
            <div onClick={() => inputRef.current?.focus()} className={`w-full max-w-4xl p-6 bg-base-300/50 rounded-lg text-2xl leading-relaxed tracking-wider text-left select-none font-sans ${isHard ? 'font-cursive' : (language === 'bangla' ? 'font-bangla' : 'font-sans')}`}>
                {textChars.map((char, index) => {
                    let className = 'text-muted-content';
                    if (index < userInput.length) {
                        className = char === userInput[index] ? 'text-success' : 'text-danger bg-danger/20';
                    }
                    if (index === userInput.length) {
                        className = 'text-primary animate-pulse border-b-2 border-primary';
                    }
                    return <span key={index} className={className}>{char}</span>;
                })}
            </div>
            <input ref={inputRef} type="text" value={userInput} onChange={handleInputChange} className="absolute opacity-0" />
        </div>
    );
};


// --- Sub-component: ResultsScreen ---
const ResultsScreen: React.FC<{
    results: TypingResult;
    onTryAgain: () => void;
    onGoHome: () => void;
    onCertificate: () => void;
}> = ({ results, onTryAgain, onGoHome, onCertificate }) => {
    
    const [showPopup, setShowPopup] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowPopup(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const canGetCertificate = results.accuracy >= 90; // Certificate eligibility

    return (
        <>
            {showPopup && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10020] animate-fade-in">
                    <div className="bg-base-200 border border-primary rounded-2xl shadow-2xl p-8 text-center animate-scale-in">
                        <h2 className="text-3xl font-bold text-primary mb-2">Congratulations!</h2>
                        <p className="text-lg text-base-content">You've completed the test.</p>
                    </div>
                 </div>
            )}

            <div className="flex flex-col items-center justify-center p-4 animate-fade-in">
                <div className="bg-base-300/40 p-8 rounded-2xl shadow-lg w-full max-w-lg">
                    <h2 className="text-3xl font-bold text-primary mb-6">Your Results</h2>
                    <div className="grid grid-cols-2 gap-6 text-center">
                        <div className="bg-base-100 p-4 rounded-lg">
                            <p className="text-sm text-muted-content">WPM</p>
                            <p className="text-5xl font-bold text-base-content">{results.wpm}</p>
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg">
                            <p className="text-sm text-muted-content">Accuracy</p>
                            <p className="text-5xl font-bold text-base-content">{results.accuracy}%</p>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button onClick={onTryAgain} className="w-full py-3 bg-primary/80 text-primary-content font-bold rounded-lg hover:bg-primary transition-all">Try Again</button>
                        <button onClick={onGoHome} className="w-full py-3 bg-base-100 text-base-content font-bold rounded-lg hover:bg-base-300/50 transition-all">Home</button>
                    </div>
                     {canGetCertificate && (
                        <button onClick={onCertificate} className="w-full mt-4 py-3 bg-success text-white font-bold rounded-lg hover:bg-green-600 transition-all animate-pulse">
                            Generate Certificate
                        </button>
                     )}
                </div>
            </div>
        </>
    );
};

// --- Sub-component: CertificateScreen ---
const CertificateScreen: React.FC<{
    results: TypingResult | null;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    isSuperAdminMode: boolean;
}> = ({ results, onClose, showToast, isSuperAdminMode }) => {
    const [userName, setUserName] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [userSignature, setUserSignature] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Super admin state
    const [superAdminLevel, setSuperAdminLevel] = useState<TypingLevel>('easy');

    const certificateData: CertificateData | null = useMemo(() => {
        const baseResult = isSuperAdminMode ? { wpm: 0, accuracy: 100, time: 0, level: superAdminLevel, language: 'english' as TypingLanguage } : results;
        if (!baseResult) return null;
        
        return {
            ...baseResult,
            userName,
            userAddress,
            userPhoto,
            userSignature,
            date: new Date().toLocaleDateString('en-GB'),
        };
    }, [results, isSuperAdminMode, superAdminLevel, userName, userAddress, userPhoto, userSignature]);

    const handleDownloadPdf = async () => {
        if (!certificateData) return;
        setIsGenerating(true);
        showToast('Generating certificate...', 'success');

        const certificateElement = document.getElementById('certificate-render-container');
        if (!certificateElement) {
            showToast('Certificate template not found!', 'error');
            setIsGenerating(false);
            return;
        }

        try {
            const canvas = await html2canvas(certificateElement, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = jspdf;
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${userName}-Typing-Certificate-${certificateData.level}.pdf`);
        } catch (error) {
            console.error(error);
            showToast('Failed to generate PDF.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center p-4 gap-6 animate-fade-in">
            <div className="w-full lg:w-96 flex-shrink-0 bg-base-300/40 p-6 rounded-2xl flex flex-col gap-4">
                <h2 className="text-xl font-bold text-primary">Certificate Details</h2>
                {isSuperAdminMode && (
                     <div>
                        <label className="text-sm font-semibold text-muted-content">Select Level</label>
                        <select value={superAdminLevel} onChange={e => setSuperAdminLevel(e.target.value as TypingLevel)} className="w-full mt-1 p-2 bg-base-100 rounded-md border border-primary/20">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                )}
                <Input label="Your Full Name" value={userName} onChange={e => setUserName(e.target.value)} />
                <Input label="Your Address" value={userAddress} onChange={e => setUserAddress(e.target.value)} />
                <ImageUpload label="Upload Your Photo" onUpload={setUserPhoto} />
                <ImageUpload label="Upload Your Signature" onUpload={setUserSignature} />
                <div className="flex-grow"></div>
                <button onClick={handleDownloadPdf} disabled={isGenerating || !userName || !userPhoto || !userSignature} className="w-full py-3 bg-success text-white font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50">
                    {isGenerating ? 'Generating...' : 'Download Certificate'}
                </button>
                 <button onClick={onClose} className="w-full py-2 bg-base-100 text-base-content font-semibold rounded-lg hover:bg-base-300/50">Back</button>
            </div>
            
            <div id="certificate-render-container" className="fixed -left-[9999px] -top-[9999px]">
                {certificateData && <CertificateTemplate data={certificateData} />}
            </div>
        </div>
    );
};


// --- Helper components for Certificate Screen ---
const Input: React.FC<{ label: string } & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, ...props }) => (
    <div>
        <label className="text-sm font-semibold text-muted-content">{label}</label>
        <input {...props} className="w-full text-base p-2 bg-base-100 rounded-md mt-1 border border-primary/20" />
    </div>
);
const ImageUpload: React.FC<{ label: string; onUpload: (dataUrl: string) => void; }> = ({ label, onUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const dataUrl = await fileToDataUrl(file);
            setPreview(dataUrl);
            onUpload(dataUrl);
        }
    };
    
    return (
        <div>
            <label className="text-sm font-semibold text-muted-content">{label}</label>
            <div onClick={() => inputRef.current?.click()} className="mt-1 w-full h-24 bg-base-100 rounded-md border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer">
                <input type="file" accept="image/*" ref={inputRef} onChange={handleChange} className="hidden" />
                {preview ? <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-muted-content">Click to upload</span>}
            </div>
        </div>
    );
};

// --- Certificate Template Component (rendered off-screen) ---
// This component is designed to be exactly A4 landscape size (297mm x 210mm)
const CertificateTemplate: React.FC<{ data: CertificateData }> = ({ data }) => {
    // Using inline styles for PDF generation compatibility
    return (
        <div style={{
            width: '297mm',
            height: '210mm',
            padding: '15mm',
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: '#fdfbf2', // A very light cream/gold background
            position: 'relative',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            color: '#383838'
        }}>
            {/* The decorative border */}
            <div style={{
                position: 'absolute',
                top: '10mm', left: '10mm', right: '10mm', bottom: '10mm',
                border: '1.5px solid #C1A77C',
                padding: '4mm',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    width: '100%', height: '100%',
                    border: '5px solid #C1A77C',
                    boxSizing: 'border-box'
                }}></div>
            </div>
            
            {/* Content inside the border */}
            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, padding: '0 10mm' }}>
                
                {/* Fixed photo of me in the top left */}
                <img 
                    src="https://i.postimg.cc/brTGQ2wL/rsz-1unnamed.jpg" 
                    alt="Ornov Bin Tusher Jewel" 
                    crossOrigin="anonymous"
                    style={{
                        position: 'absolute',
                        top: '18mm',
                        left: '18mm',
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        border: '2px solid #C1A77C'
                    }} 
                />

                <h1 style={{ fontFamily: 'serif', fontSize: '32px', fontWeight: 'bold', color: '#80673A', marginTop: '10mm', letterSpacing: '2px' }}>
                    Certificate of Accomplishment
                </h1>

                <p style={{ marginTop: '5mm', fontSize: '14px', color: '#555' }}>This Certification is Hereby Awarded to:</p>
                
                {/* Uploaded user photo */}
                {data.userPhoto && (
                    <img 
                        src={data.userPhoto} 
                        alt={data.userName} 
                        crossOrigin="anonymous"
                        style={{
                            width: '80mm', // This is large
                            height: '80mm',
                            maxWidth: '90px', // But capped
                            maxHeight: '90px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid #C1A77C',
                            marginTop: '5mm',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                    />
                )}

                <h2 style={{ fontFamily: "'Cedarville Cursive', cursive", fontSize: '42px', color: '#333', marginTop: '5mm' }}>
                    {data.userName}
                </h2>
                {data.userAddress && <p style={{ fontSize: '12px', color: '#666', marginTop: '-8mm' }}>from {data.userAddress}</p>}

                <p style={{ marginTop: '8mm', fontSize: '14px', maxWidth: '60%', textAlign: 'center' }}>
                    For successfully completing the official Typing Master test with exceptional skill and dedication.
                </p>

                <div style={{ display: 'flex', gap: '20mm', marginTop: '8mm' }}>
                    <div style={{ border: '1px solid #ddd', padding: '5mm 8mm', borderRadius: '5px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>Avg. Speed</p>
                        <p style={{ margin: '2px 0 0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{data.wpm} WPM</p>
                    </div>
                     <div style={{ border: '1px solid #ddd', padding: '5mm 8mm', borderRadius: '5px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>Avg. Accuracy</p>
                        <p style={{ margin: '2px 0 0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{data.accuracy}%</p>
                    </div>
                </div>

                <p style={{ marginTop: '8mm', fontSize: '12px', color: '#666' }}>On the Date of {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                <div style={{ flexGrow: 1 }}></div> {/* Spacer to push bottom content down */}

                {/* Bottom section with signatures and seal */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    width: '100%',
                    padding: '0 10mm',
                    boxSizing: 'border-box',
                    marginBottom: '5mm'
                }}>
                    {/* Left: User Signature */}
                    <div style={{ textAlign: 'center' }}>
                        {data.userSignature && <img src={data.userSignature} alt="User Signature" crossOrigin="anonymous" style={{ maxHeight: '40px', maxWidth: '150px', marginBottom: '5px' }} />}
                        <div style={{ width: '180px', height: '1px', backgroundColor: '#333' }}></div>
                        <p style={{ fontSize: '12px', margin: '5px 0 0 0', fontWeight: 'bold' }}>{data.userName}</p>
                    </div>

                    {/* Middle: Seal */}
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', border: '4px double #8C6B26',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdfbf2',
                        color: '#8C6B26',
                        textAlign: 'center',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            width: '90%', height: '90%', borderRadius: '50%', border: '1px solid #C1A77C',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            <span style={{ fontFamily: 'serif', fontWeight: 'bold', fontSize: '24px' }}>OBJ</span>
                            <span style={{ fontSize: '8px', letterSpacing: '1px', marginTop: '2px' }}>VERIFIED</span>
                        </div>
                    </div>
                    
                    {/* Right: My Signature */}
                    <div style={{ textAlign: 'center' }}>
                         <img src="https://i.postimg.cc/Gp3kyfFG/rsz_assistant-a-background-white-mor-1.jpg" alt="Auth Signature" crossOrigin="anonymous" style={{ maxHeight: '40px', maxWidth: '150px', marginBottom: '5px' }}/>
                        <div style={{ width: '180px', height: '1px', backgroundColor: '#333' }}></div>
                        <p style={{ fontSize: '12px', margin: '5px 0 0 0', fontWeight: 'bold' }}>Ornov Bin Tusher Jewel</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TypingMasterPage;
