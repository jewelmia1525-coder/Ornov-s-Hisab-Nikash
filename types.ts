export type Role = 'viewer' | 'admin' | 'super-admin';

export type Page = 'dashboard' | 'persons' | 'tools';

export type Widget = 'password' | 'calculator' | 'email' | 'theme' | 'about' | 'data' | 'adminManagement' | 'broadcast' | 'importPasswords' | 'profileSettings' | 'adminOverview';

export type DashboardModuleId = 'summary' | 'reports' | 'ai_insights' | 'budgets' | 'visualizations' | 'monthly_chart' | 'transactions';

export interface DashboardModule {
    id: DashboardModuleId;
    name: string;
    isVisible: boolean;
}

export interface Transaction {
    id: number;
    type: 'income' | 'cost';
    amount: number;
    details: string;
    date: string;
    category: string;
    dueDate?: string;
    completed: boolean;
}

export interface Contact {
    id: number;
    type: 'receivable' | 'payable';
    name: string;
    amount: number;
    reason: string;
    photo?: string; // Base64 string
    date: string;
}

export interface Budget {
    category: string;
    amount: number;
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    mobile: string;
    password: string;
    photo?: string; // Base64 string for profile picture
    signature?: string; // Base64 string for signature
}

export interface Message {
    id: number;
    sender: string; // 'super-admin' or admin username
    recipient: string; // 'super-admin' or admin username
    text: string;
    attachment?: {
        type: 'image' | 'video' | 'link';
        content: string; // dataURL for image/video, URL for link
        fileName?: string;
    };
    timestamp: string;
    isRead: boolean;
}


// --- AI Character Types ---
export type CartoonCharacter = 'blob' | 'bot' | 'pixie';
export type CartoonStyle = 'default' | 'hat' | 'bowtie';

// --- CV Maker Types ---

export interface CvLink {
    label: string;
    url: string;
}

export interface CvLanguage {
    lang: string;
    proficiency: string;
}

export interface CvProject {
    name: string;
    description: string;
    link?: string;
}

export interface CvSkill {
    category: string;
    skills: string[];
}

export interface CvData {
    name: string;
    title: string;
    contact: {
        email: string;
        phone: string;
        address: string;
    };
    links: CvLink[];
    summary: string;
    experience: Array<{
        company: string;
        role: string;
        date: string;
        responsibilities: string[];
    }>;
    education: Array<{
        institution: string;
        degree: string;
        date: string;
    }>;
    skills: CvSkill[];
    projects: CvProject[];
    languages: CvLanguage[];
    references: string;
}

// --- Typing Master Types ---
export type TypingLevel = 'easy' | 'medium' | 'hard';
export type TypingLanguage = 'english' | 'bangla';

export interface TypingResult {
    wpm: number;
    accuracy: number;
    time: number;
    level: TypingLevel;
    language: TypingLanguage;
}

export interface CertificateData extends TypingResult {
    userName: string;
    userAddress: string;
    userPhoto: string | null;
    userSignature: string | null;
    date: string;
}