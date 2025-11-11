import React from 'react';
import { Widget, Role } from '../types';

interface ToolCardProps {
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
    isFeatured?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, onClick, isFeatured }) => (
    <button 
        onClick={onClick}
        className={`bg-base-200 border border-primary/20 rounded-2xl p-6 text-left group transition-all duration-300 hover:bg-base-300/50 hover:-translate-y-1 flex flex-col ${isFeatured ? 'md:col-span-2' : ''}`}
    >
        <div className="flex items-start gap-4">
            <div className="text-4xl">{icon}</div>
            <div>
                <h3 className="font-bangla text-lg sm:text-xl font-bold text-base-content">{title}</h3>
                <p className="font-bangla text-sm text-muted-content mt-1">{description}</p>
            </div>
        </div>
    </button>
);


interface ToolsPageProps {
    onOpenCvAts: () => void;
    onOpenConvertPage: () => void;
    onOpenFinanceHelper: () => void;
    onOpenCvMaker: () => void;
    onOpenCvParser: () => void;
    onOpenImageEditor: () => void;
    onOpenVideoAnalysis: () => void;
    onOpenTts: () => void;
    onOpenImageAnalysis: () => void;
    onOpenTypingMaster: () => void;
    onWidgetSelect: (widget: Widget) => void;
    role: Role | null;
}

const MAIN_TOOLS = [
    { id: 'cv-maker', icon: '🧑‍💼', title: 'Professional CV Builder', description: 'Upload your CV and transform it into a professional, modern design with AI assistance. Choose from multiple templates, edit live, and download as a high-quality PDF.', roles: ['admin', 'super-admin'], featured: true },
    { id: 'image-analyzer', icon: '👁️', title: 'AI Image Analyzer', description: 'Upload a photo and ask questions to understand its content. Powered by Gemini vision.', roles: ['admin', 'super-admin'], featured: true },
    { id: 'image-editor', icon: '🎨', title: 'AI Image Editor', description: 'Use text prompts to edit your images with Gemini AI. Add filters, remove objects, and more.', roles: ['admin', 'super-admin'], featured: true },
    { id: 'video-analyzer', icon: '🎥', title: 'AI Video Analyzer', description: 'Extract key information, summarize, or ask questions about a video file using Gemini.', roles: ['admin', 'super-admin'], featured: true },
    { id: 'tts', icon: '🔊', title: 'Text-to-Speech', description: 'Convert text into natural-sounding speech with Gemini AI voices.', roles: ['admin', 'super-admin'], featured: true },
    { id: 'cv-ats', icon: '📄', title: 'CV ATS Analyzer', description: 'Analyze your CV for ATS compatibility, check skill gaps, and get improvement suggestions with AI.', roles: ['admin', 'super-admin'], featured: true },
    { id: 'typing-master', icon: '⌨️', title: 'Typing Master', description: 'Test and improve your typing speed and accuracy. Earn professional certificates for your performance.', roles: ['admin', 'super-admin'], featured: true },
    { id: 'file-converter', icon: '✨', title: 'File Converter', description: 'A suite of tools to resize images, convert PDF to Text, Text to PDF, and HTML to PDF.', roles: ['admin', 'super-admin'], featured: true },
    { id: 'finance-helper', icon: '🗺️', title: 'Nearby Finance Helper', description: 'Get location-based financial suggestions, find nearby ATMs, or discover budget-friendly places using Google Maps data.', roles: ['admin', 'super-admin'], featured: true },
    { id: 'cv-parser', icon: '📑', title: 'AI CV Parser', description: 'Upload a CV (PDF) and use AI to extract key information into a structured JSON format. Perfect for developers and data entry.', roles: ['admin', 'super-admin'], featured: true },
];


const WIDGETS: { id: Widget; icon: string; name: string; description: string; roles: Role[] }[] = [
    { id: 'broadcast', icon: '📢', name: 'Broadcast Controls', description: 'Send scrolling announcements to users.', roles: ['super-admin'] },
    { id: 'password', icon: '🔧', name: 'Password Assignment', description: 'Assign unique passwords to new admin users.', roles: ['super-admin'] },
    { id: 'importPasswords', icon: '📥', name: 'Import Passwords', description: 'Generate and import new passwords into the pool.', roles: ['super-admin'] },
    { id: 'data', icon: '💾', name: 'Data Management', description: 'Import/Export your financial data as CSV.', roles: ['super-admin'] },
    { id: 'adminManagement', icon: '👥', name: 'Admin Management', description: 'Manage all admin user accounts.', roles: ['super-admin'] },
    { id: 'calculator', icon: '🧮', name: 'Calculator', description: 'A simple calculator for quick math.', roles: ['super-admin', 'admin', 'viewer'] },
    { id: 'email', icon: '✉️', name: 'Email CV', description: 'Send your pre-formatted CV via email.', roles: ['super-admin', 'admin', 'viewer'] },
    { id: 'theme', icon: '🎨', name: 'Theme Manager', description: 'Customize the look and feel of the app.', roles: ['super-admin', 'admin', 'viewer'] },
    { id: 'about', icon: '👤', name: 'About Me', description: 'Learn more about the developer.', roles: ['super-admin', 'admin', 'viewer'] },
];

const ToolsPage: React.FC<ToolsPageProps> = (props) => {
    const { role, onWidgetSelect, ...toolActions } = props;

    const toolClickMap: Record<string, () => void> = {
        'cv-maker': toolActions.onOpenCvMaker,
        'image-analyzer': toolActions.onOpenImageAnalysis,
        'image-editor': toolActions.onOpenImageEditor,
        'video-analyzer': toolActions.onOpenVideoAnalysis,
        'tts': toolActions.onOpenTts,
        'cv-ats': toolActions.onOpenCvAts,
        'typing-master': toolActions.onOpenTypingMaster,
        'file-converter': toolActions.onOpenConvertPage,
        'finance-helper': toolActions.onOpenFinanceHelper,
        'cv-parser': toolActions.onOpenCvParser,
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
             <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out; } @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <section aria-labelledby="tools-page-title" className="space-y-8">
                <div>
                    <h2 id="tools-page-title" className="font-bangla text-2xl sm:text-3xl font-bold text-base-content mb-2">Tools & Utilities</h2>
                    <p className="text-muted-content">Powerful tools to help you manage your data and workflow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MAIN_TOOLS.filter(tool => role && tool.roles.includes(role)).map(tool => (
                        <ToolCard
                            key={tool.id}
                            icon={tool.icon}
                            title={tool.title}
                            description={tool.description}
                            onClick={toolClickMap[tool.id]}
                            isFeatured={tool.featured}
                        />
                    ))}
                </div>
                
                <div>
                    <h3 className="font-bangla text-2xl font-bold text-base-content mb-4 mt-8">Widgets</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {WIDGETS.map(widget => (
                            (role && widget.roles.includes(role)) && (
                                <ToolCard
                                    key={widget.id}
                                    icon={widget.icon}
                                    title={widget.name}
                                    description={widget.description}
                                    onClick={() => onWidgetSelect(widget.id)}
                                />
                            )
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ToolsPage;
