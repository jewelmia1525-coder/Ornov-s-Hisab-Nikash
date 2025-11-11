import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CvData, CvLink, CvLanguage, CvProject, CvSkill } from '../types';
import * as CvTemplates from './cv-templates/CvTemplates';

declare const jspdf: any;
declare const html2canvas: any;

interface CvMakerPageProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

type Status = 'idle' | 'parsing' | 'ready' | 'downloading' | 'error';
type TemplateId = 'classic' | 'modern' | 'minimalist' | 'corporate' | 'creative';

// Helper type to get only the keys of CvData that are arrays
type ArraySectionKey = keyof {
    [K in keyof CvData as CvData[K] extends Array<any> ? K : never]: any
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const createEmptyCvData = (): CvData => ({
    name: "Your Name",
    title: "Your Professional Title",
    contact: { email: "your.email@example.com", phone: "123-456-7890", address: "City, Country" },
    links: [{ label: "LinkedIn", url: "" }],
    summary: "A brief professional summary about yourself.",
    experience: [{ company: "Company Name", role: "Job Title", date: "Month Year - Present", responsibilities: ["Key achievement 1", "Responsibility 2"] }],
    education: [{ institution: "University Name", degree: "Degree, Major", date: "Year - Year" }],
    skills: [{ category: "Core Skills", skills: ["Skill A", "Skill B"] }],
    projects: [{ name: "Project Name", description: "A short description of your project." }],
    languages: [{ lang: "Language", proficiency: "Proficiency Level" }],
    references: "Available upon request.",
});


const CvMakerPage: React.FC<CvMakerPageProps> = ({ isOpen, onClose, showToast }) => {
    const [status, setStatus] = useState<Status>('idle');
    const [fileName, setFileName] = useState<string>('');
    
    // --- State with LocalStorage Persistence ---
    const [cvData, setCvData] = useState<CvData | null>(() => {
        try {
            const saved = localStorage.getItem('cvMakerData');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [photo, setPhoto] = useState<string | null>(() => localStorage.getItem('cvMakerPhoto'));
    const [signature, setSignature] = useState<string | null>(() => localStorage.getItem('cvMakerSignature'));
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(() => {
        return (localStorage.getItem('cvMakerTemplate') as TemplateId) || 'modern';
    });
    
    useEffect(() => {
        if (cvData) {
            localStorage.setItem('cvMakerData', JSON.stringify(cvData));
            setStatus('ready');
        } else {
             localStorage.removeItem('cvMakerData');
             setStatus('idle');
        }
    }, [cvData]);

    useEffect(() => { photo ? localStorage.setItem('cvMakerPhoto', photo) : localStorage.removeItem('cvMakerPhoto') }, [photo]);
    useEffect(() => { signature ? localStorage.setItem('cvMakerSignature', signature) : localStorage.removeItem('cvMakerSignature') }, [signature]);
    useEffect(() => { localStorage.setItem('cvMakerTemplate', selectedTemplate) }, [selectedTemplate]);


    const pdfPreviewRef = useRef<HTMLDivElement>(null);
    const pdfWrapperRef = useRef<HTMLDivElement>(null);
    const [previewScale, setPreviewScale] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

     // Effect for scaling the preview responsively
    useEffect(() => {
        if (status !== 'ready' && status !== 'downloading') return;

        const A4_WIDTH_PX = 794; // 210mm at 96dpi
        const wrapper = pdfWrapperRef.current;

        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                const availableWidth = entry.contentRect.width;
                // Subtract padding from available width
                const scale = (availableWidth - 16) / A4_WIDTH_PX;
                setPreviewScale(scale < 1 ? scale : 1);
            }
        });

        if (wrapper) {
            observer.observe(wrapper);
        }

        return () => {
            if (wrapper) {
                observer.unobserve(wrapper);
            }
        };
    }, [status]);

    const reset = () => {
        setCvData(null);
        setPhoto(null);
        setSignature(null);
        setFileName('');
    };

    const handleFile = async (file: File | null) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            showToast('Only PDF files are supported.', 'error');
            return;
        }
        if (!ai) {
            showToast('AI service is not available.', 'error');
            return;
        }

        setStatus('parsing');
        setFileName(file.name);
        try {
            const base64 = await fileToBase64(file);
            const pdfPart = { inlineData: { mimeType: 'application/pdf', data: base64 } };

            const cvSchema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    title: { type: Type.STRING },
                    contact: { type: Type.OBJECT, properties: { email: { type: Type.STRING }, phone: { type: Type.STRING }, address: { type: Type.STRING }}},
                    links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: {type: Type.STRING }, url: { type: Type.STRING}}}},
                    summary: { type: Type.STRING },
                    experience: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { company: { type: Type.STRING }, role: { type: Type.STRING }, date: { type: Type.STRING }, responsibilities: { type: Type.ARRAY, items: { type: Type.STRING }}}}},
                    education: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { institution: { type: Type.STRING }, degree: { type: Type.STRING }, date: { type: Type.STRING }}}},
                    skills: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, skills: { type: Type.ARRAY, items: {type: Type.STRING}}}} },
                    projects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: {type: Type.STRING}, link: {type: Type.STRING}}}},
                    languages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lang: { type: Type.STRING }, proficiency: { type: Type.STRING }}}},
                    references: { type: Type.STRING }
                },
            };
            
            const prompt = "Analyze the entire multi-page PDF document of the CV provided. Extract all relevant information and structure it into a JSON format according to the provided schema. Pay close attention to all sections, including work experience, education, skills, and personal details, ensuring no information is missed from any page. The extraction must be comprehensive and accurate.";

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [pdfPart, { text: prompt }] },
                config: { responseMimeType: "application/json", responseSchema: cvSchema }
            });

            const parsedData = JSON.parse(response.text) as Partial<CvData>;
            const fullData = { ...createEmptyCvData(), ...parsedData }; // Merge with default to ensure all keys exist
            setCvData(fullData);
            showToast('CV parsed successfully!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to parse CV. The document might be complex or unreadable.', 'error');
            setStatus('error');
        }
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setter(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleDownload = async () => {
        const element = pdfPreviewRef.current;
        if (!element) return;

        setStatus('downloading');
        showToast('Generating PDF...', 'success');
        try {
            const { jsPDF } = jspdf;
            const originalScroll = { x: window.scrollX, y: window.scrollY };
            
            const canvas = await html2canvas(element, { scale: 3, useCORS: true, logging: false, scrollX: -originalScroll.x, scrollY: -originalScroll.y, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });
            
            window.scrollTo(originalScroll.x, originalScroll.y);

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const totalImageHeightInPdf = (canvas.height * pdfWidth) / canvas.width;
            let heightLeft = totalImageHeightInPdf;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImageHeightInPdf);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
                position -= pdf.internal.pageSize.getHeight();
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImageHeightInPdf);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            
            pdf.save(`${cvData?.name || 'CV'}-${selectedTemplate}.pdf`);
        } catch(e) {
            console.error(e);
            showToast("Failed to generate PDF", 'error');
        } finally {
            setStatus('ready');
        }
    };
    
    if (!isOpen) return null;

    const renderContent = () => {
        switch(status) {
            case 'parsing': return <LoadingState fileName={fileName} />;
            case 'error': return <ErrorState onRetry={reset} />;
            case 'idle':
            default:
                return (
                    <IdleState
                        onFileSelect={file => handleFile(file)}
                        fileInputRef={fileInputRef}
                        onStartFromScratch={() => setCvData(createEmptyCvData())}
                    />
                );
        }
    };

    const TemplateComponent = CvTemplates[selectedTemplate];
    const templates: {id: TemplateId, name: string}[] = [
        {id: 'modern', name: 'Modern'}, {id: 'classic', name: 'Classic'}, {id: 'minimalist', name: 'Minimalist'}, {id: 'corporate', name: 'Corporate'}, {id: 'creative', name: 'Creative'}
    ];

    return (
        <div className="fixed inset-0 bg-base-100 z-[10000] flex flex-col p-4 sm:p-6 md:p-8 animate-fade-in">
            <header className="flex-shrink-0 flex items-center gap-2 sm:gap-4 mb-4">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-base-300 transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="font-bangla text-2xl sm:text-3xl font-bold text-primary">Professional CV Builder</h1>
            </header>
            {status !== 'ready' && status !== 'downloading' ? (
                <main className="flex-grow bg-base-200 border border-primary/20 rounded-2xl flex flex-col items-center justify-center">
                    {renderContent()}
                </main>
            ) : (
                <main className="flex-grow grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 min-h-0">
                    <aside className="bg-base-200 border border-primary/20 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto">
                        <EditorSidebar 
                            templates={templates}
                            selectedTemplate={selectedTemplate}
                            setSelectedTemplate={setSelectedTemplate}
                            photoInputRef={photoInputRef}
                            signatureInputRef={signatureInputRef}
                            onImageUpload={handleImageUpload}
                            setPhoto={setPhoto}
                            setSignature={setSignature}
                            onReset={reset}
                            onDownload={handleDownload}
                            isDownloading={status === 'downloading'}
                            cvData={cvData}
                            setCvData={setCvData}
                        />
                    </aside>
                    <div ref={pdfWrapperRef} className="bg-base-300/50 p-2 sm:p-4 rounded-2xl overflow-auto flex justify-center items-start">
                        <div 
                            ref={pdfPreviewRef} 
                            className="a4-aspect-ratio bg-white text-black shadow-lg"
                            style={{ transform: `scale(${previewScale})`, transformOrigin: 'top' }}
                        >
                           {cvData && <TemplateComponent data={cvData} photo={photo} signature={signature} />}
                        </div>
                    </div>
                     <style>{`.a4-aspect-ratio { width: 210mm; min-height: 297mm; }`}</style>
                </main>
            )}
        </div>
    );
};


// --- Sub-components for states and UI parts ---

const IdleState: React.FC<{onFileSelect: (f: File) => void; fileInputRef: React.RefObject<HTMLInputElement>; onStartFromScratch: () => void;}> = ({onFileSelect, fileInputRef, onStartFromScratch}) => (
    <div className="text-center p-8 max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-base-content">Create Your Professional CV</h2>
        <p className="text-muted-content mt-2 mb-6">Start by uploading your existing PDF for AI-powered parsing, or build a new one from scratch.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={e => onFileSelect(e.target.files?.[0] || null)} />
            <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all">
                ✨ Upload & Parse CV
            </button>
            <button onClick={onStartFromScratch} className="px-6 py-3 bg-base-300/60 text-base-content font-bold rounded-lg hover:bg-base-300 transition-all">
                📄 Start from Scratch
            </button>
        </div>
    </div>
);

const LoadingState: React.FC<{fileName: string}> = ({fileName}) => (
    <div className="text-center">
        <svg className="w-16 h-16 text-primary mx-auto animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-lg font-semibold text-base-content mt-4">AI is reading your CV...</p>
        <p className="text-sm text-muted-content">{fileName}</p>
        <p className="text-xs text-muted-content mt-2">This may take a moment for multi-page documents.</p>
    </div>
);

const ErrorState: React.FC<{onRetry: () => void}> = ({onRetry}) => (
    <div className="text-center"><p className="text-lg font-semibold text-danger">Something went wrong.</p><button onClick={onRetry} className="mt-4 px-4 py-2 bg-primary text-primary-content rounded-lg">Try Again</button></div>
);


// --- Editor Sidebar ---
interface EditorSidebarProps {
    templates: {id: TemplateId, name: string}[];
    selectedTemplate: TemplateId;
    setSelectedTemplate: (id: TemplateId) => void;
    photoInputRef: React.RefObject<HTMLInputElement>;
    signatureInputRef: React.RefObject<HTMLInputElement>;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => void;
    setPhoto: React.Dispatch<React.SetStateAction<string | null>>;
    setSignature: React.Dispatch<React.SetStateAction<string | null>>;
    onReset: () => void;
    onDownload: () => void;
    isDownloading: boolean;
    cvData: CvData | null;
    setCvData: React.Dispatch<React.SetStateAction<CvData | null>>;
}
const EditorSidebar: React.FC<EditorSidebarProps> = (props) => {
    const { cvData, setCvData } = props;
    if (!cvData) return null;

    const handleFieldChange = (path: string, value: string) => {
        const keys = path.split('.');
        setCvData(prev => {
            if (!prev) return null;
            const newData = JSON.parse(JSON.stringify(prev));
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    // More robustly typed handler for array updates.
    // It ensures that the 'section' key corresponds to an array property on CvData,
    // and that 'field' and 'value' are valid for the elements of that specific array.
    const handleArrayChange = <
        S extends ArraySectionKey,
        T extends CvData[S][number],
        K extends keyof T
    >(
        section: S,
        index: number,
        field: K,
        value: T[K]
    ) => {
        setCvData(prev => {
            if (!prev) return null;
            const newData = JSON.parse(JSON.stringify(prev)) as CvData;
            const sectionArray = newData[section] as T[];
            if (sectionArray?.[index]) {
                sectionArray[index][field] = value;
            }
            return newData;
        });
    };
    
    const handleAddArrayItem = <T,>(section: keyof CvData, newItem: T) => {
        setCvData(prev => {
             if (!prev) return null;
             const newData = JSON.parse(JSON.stringify(prev));
             (newData[section] as T[]).push(newItem);
             return newData;
        });
    };
    
    const handleRemoveArrayItem = (section: keyof CvData, index: number) => {
         setCvData(prev => {
             if (!prev) return null;
             const newData = JSON.parse(JSON.stringify(prev));
             (newData[section] as any[]).splice(index, 1);
             return newData;
        });
    };

    const handleReorderArrayItem = (section: keyof CvData, index: number, direction: 'up' | 'down') => {
        setCvData(prev => {
            if (!prev) return null;
            const list = prev[section] as any[];
            if ((direction === 'up' && index === 0) || (direction === 'down' && index === list.length - 1)) {
                return prev;
            }
            const newData = JSON.parse(JSON.stringify(prev));
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            const item = (newData[section] as any[]).splice(index, 1)[0];
            (newData[section] as any[]).splice(targetIndex, 0, item);
            return newData;
        });
    };

    return <>
        <div>
            <h3 className="font-semibold mb-2">Template</h3>
            <div className="grid grid-cols-2 gap-2">
                {props.templates.map(t => (
                    <button key={t.id} onClick={() => props.setSelectedTemplate(t.id)} className={`px-3 py-2 text-sm rounded-md transition-colors text-center ${props.selectedTemplate === t.id ? 'bg-primary text-primary-content' : 'bg-base-300 hover:bg-base-300/60'}`}>
                        {t.name}
                    </button>
                ))}
            </div>
        </div>
        <div className="border-t border-primary/20"></div>
        <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Customize</h3>
            <input type="file" accept="image/*" ref={props.photoInputRef} className="hidden" onChange={(e) => props.onImageUpload(e, props.setPhoto)} />
            <button onClick={() => props.photoInputRef.current?.click()} className="w-full text-sm py-2 bg-base-300 hover:bg-base-300/60 rounded-md">Upload Photo</button>
            <input type="file" accept="image/*" ref={props.signatureInputRef} className="hidden" onChange={(e) => props.onImageUpload(e, props.setSignature)} />
            <button onClick={() => props.signatureInputRef.current?.click()} className="w-full text-sm py-2 bg-base-300 hover:bg-base-300/60 rounded-md">Upload Signature</button>
        </div>
        <div className="border-t border-primary/20"></div>

        {/* Editor Forms */}
        <Collapsible title="Personal Info">
            <Input label="Full Name" value={cvData.name} onChange={e => handleFieldChange('name', e.target.value)} />
            <Input label="Title" value={cvData.title} onChange={e => handleFieldChange('title', e.target.value)} />
            <Input label="Email" value={cvData.contact.email} onChange={e => handleFieldChange('contact.email', e.target.value)} />
            <Input label="Phone" value={cvData.contact.phone} onChange={e => handleFieldChange('contact.phone', e.target.value)} />
            <Input label="Address" value={cvData.contact.address} onChange={e => handleFieldChange('contact.address', e.target.value)} />
        </Collapsible>
        
        <Collapsible title="Summary">
            <Textarea label="Professional Summary" value={cvData.summary} onChange={e => handleFieldChange('summary', e.target.value)} rows={5} />
        </Collapsible>

        <Collapsible title={`Experience (${cvData.experience.length})`}>
            {cvData.experience.map((exp, i) => (
                <ArrayItem key={i} index={i} onRemove={() => handleRemoveArrayItem('experience', i)} onReorder={(dir) => handleReorderArrayItem('experience', i, dir)}>
                    <Input label="Role" value={exp.role} onChange={e => handleArrayChange('experience', i, 'role', e.target.value)} />
                    <Input label="Company" value={exp.company} onChange={e => handleArrayChange('experience', i, 'company', e.target.value)} />
                    <Input label="Date" value={exp.date} onChange={e => handleArrayChange('experience', i, 'date', e.target.value)} />
                    <Textarea label="Responsibilities" value={exp.responsibilities.join('\n')} onChange={e => handleArrayChange('experience', i, 'responsibilities', e.target.value.split('\n'))} />
                </ArrayItem>
            ))}
            <button onClick={() => handleAddArrayItem('experience', { company: "", role: "", date: "", responsibilities: [] })} className="text-sm text-primary font-semibold mt-2">+ Add Experience</button>
        </Collapsible>

        <Collapsible title={`Skills (${cvData.skills.length})`}>
             {cvData.skills.map((skill, i) => (
                <ArrayItem key={i} index={i} onRemove={() => handleRemoveArrayItem('skills', i)} onReorder={(dir) => handleReorderArrayItem('skills', i, dir)}>
                    <Input label="Category" value={skill.category} onChange={e => handleArrayChange('skills', i, 'category', e.target.value)} />
                    <Textarea label="Skills (one per line)" value={skill.skills.join('\n')} onChange={e => handleArrayChange('skills', i, 'skills', e.target.value.split('\n'))} />
                </ArrayItem>
             ))}
             <button onClick={() => handleAddArrayItem('skills', { category: "New Category", skills: []})} className="text-sm text-primary font-semibold mt-2">+ Add Skill Category</button>
        </Collapsible>

         <Collapsible title={`Education (${cvData.education.length})`}>
             {cvData.education.map((edu, i) => (
                <ArrayItem key={i} index={i} onRemove={() => handleRemoveArrayItem('education', i)} onReorder={(dir) => handleReorderArrayItem('education', i, dir)}>
                    <Input label="Degree" value={edu.degree} onChange={e => handleArrayChange('education', i, 'degree', e.target.value)} />
                    <Input label="Institution" value={edu.institution} onChange={e => handleArrayChange('education', i, 'institution', e.target.value)} />
                    <Input label="Date" value={edu.date} onChange={e => handleArrayChange('education', i, 'date', e.target.value)} />
                </ArrayItem>
             ))}
             <button onClick={() => handleAddArrayItem('education', { degree: "", institution: "", date: ""})} className="text-sm text-primary font-semibold mt-2">+ Add Education</button>
        </Collapsible>

        <Collapsible title={`Projects (${cvData.projects.length})`}>
            {cvData.projects.map((proj, i) => (
                <ArrayItem key={i} index={i} onRemove={() => handleRemoveArrayItem('projects', i)} onReorder={(dir) => handleReorderArrayItem('projects', i, dir)}>
                    <Input label="Project Name" value={proj.name} onChange={e => handleArrayChange('projects', i, 'name', e.target.value)} />
                    <Input label="Link (Optional)" value={proj.link || ''} onChange={e => handleArrayChange('projects', i, 'link', e.target.value)} />
                    <Textarea label="Description" value={proj.description} onChange={e => handleArrayChange('projects', i, 'description', e.target.value)} />
                </ArrayItem>
            ))}
            <button onClick={() => handleAddArrayItem('projects', { name: "", description: ""})} className="text-sm text-primary font-semibold mt-2">+ Add Project</button>
        </Collapsible>

         <Collapsible title={`Links (${cvData.links.length})`}>
            {cvData.links.map((link, i) => (
                <ArrayItem key={i} index={i} onRemove={() => handleRemoveArrayItem('links', i)} onReorder={(dir) => handleReorderArrayItem('links', i, dir)}>
                    <Input label="Label (e.g., LinkedIn)" value={link.label} onChange={e => handleArrayChange('links', i, 'label', e.target.value)} />
                    <Input label="URL" value={link.url} onChange={e => handleArrayChange('links', i, 'url', e.target.value)} />
                </ArrayItem>
            ))}
            <button onClick={() => handleAddArrayItem('links', { label: "", url: ""})} className="text-sm text-primary font-semibold mt-2">+ Add Link</button>
        </Collapsible>
        
         <Collapsible title={`Languages (${cvData.languages.length})`}>
            {cvData.languages.map((lang, i) => (
                <ArrayItem key={i} index={i} onRemove={() => handleRemoveArrayItem('languages', i)} onReorder={(dir) => handleReorderArrayItem('languages', i, dir)}>
                    <Input label="Language" value={lang.lang} onChange={e => handleArrayChange('languages', i, 'lang', e.target.value)} />
                    <Input label="Proficiency" value={lang.proficiency} onChange={e => handleArrayChange('languages', i, 'proficiency', e.target.value)} />
                </ArrayItem>
            ))}
            <button onClick={() => handleAddArrayItem('languages', { lang: "", proficiency: ""})} className="text-sm text-primary font-semibold mt-2">+ Add Language</button>
        </Collapsible>

         <Collapsible title="References">
            <Textarea label="References" value={cvData.references} onChange={e => handleFieldChange('references', e.target.value)} />
        </Collapsible>


        <div className="mt-auto flex flex-col gap-2 pt-4">
            <button onClick={props.onReset} className="w-full py-2 bg-danger/80 text-white font-semibold rounded-lg hover:bg-danger transition-all text-sm">Start Over</button>
            <button onClick={props.onDownload} disabled={props.isDownloading} className="w-full py-3 bg-success text-white font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50">
                {props.isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
        </div>
    </>;
};

// --- Form Elements & Helpers ---
const Collapsible: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-t border-primary/20 py-2">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left font-semibold">
                {title}
                <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="mt-2 space-y-2 animate-fade-in">{children}</div>}
             <style>{`.animate-fade-in { animation: fade-in 0.3s ease; } @keyframes fade-in { 0% { opacity: 0; transform: translateY(-5px); } 100% { opacity: 1; transform: translateY(0); }}`}</style>
        </div>
    );
};
const Input: React.FC<{label: string} & React.InputHTMLAttributes<HTMLInputElement>> = ({label, ...props}) => (
    <div>
        <label className="text-xs text-muted-content">{label}</label>
        <input {...props} className="w-full text-sm p-1.5 bg-base-100 border border-primary/20 rounded-md mt-1"/>
    </div>
);
const Textarea: React.FC<{label: string} & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({label, ...props}) => (
    <div>
        <label className="text-xs text-muted-content">{label}</label>
        <textarea {...props} className="w-full text-sm p-1.5 bg-base-100 border border-primary/20 rounded-md mt-1" rows={props.rows || 3}/>
    </div>
);
const ArrayItem: React.FC<{index: number, onRemove: () => void, onReorder: (dir: 'up' | 'down') => void, children: React.ReactNode}> = ({ index, onRemove, onReorder, children }) => (
    <div className="p-2 border border-primary/20 rounded-lg bg-base-100 relative">
        <div className="space-y-2">{children}</div>
        <div className="absolute top-1 right-1 flex gap-1">
            <button onClick={() => onReorder('up')} className="text-xs">▲</button>
            <button onClick={() => onReorder('down')} className="text-xs">▼</button>
            <button onClick={onRemove} className="text-xs text-danger">✖</button>
        </div>
    </div>
);

export default CvMakerPage;