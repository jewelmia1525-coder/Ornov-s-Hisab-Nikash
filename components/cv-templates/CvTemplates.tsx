import React from 'react';
import { CvData } from '../../types';

interface TemplateProps {
    data: CvData;
    photo: string | null;
    signature: string | null;
}

// --- Icons for Contact Details ---
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;


// --- Template 1: Classic ---
export const classic: React.FC<TemplateProps> = ({ data, photo }) => {
    return (
        <div style={{ fontFamily: 'Georgia, serif', padding: '20mm', color: '#333' }}>
            <header className="text-center mb-10">
                {photo && <img src={photo} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />}
                <h1 className="text-4xl font-bold tracking-wider">{data.name}</h1>
                <p className="text-xl text-gray-600 mt-2">{data.title}</p>
                <div className="text-sm mt-4 text-gray-500">
                    <span>{data.contact.email}</span> | <span>{data.contact.phone}</span> | <span>{data.contact.address}</span>
                </div>
            </header>
            <Section title="Summary"><p className="text-gray-700 leading-relaxed">{data.summary}</p></Section>
            <Section title="Experience">
                {data.experience.map((exp, i) => (
                    <div key={i} className="mb-4">
                        <h3 className="text-lg font-semibold">{exp.role}</h3>
                        <div className="flex justify-between text-sm text-gray-600"><p>{exp.company}</p><p>{exp.date}</p></div>
                        <ul className="list-disc pl-5 text-gray-700 mt-1">{exp.responsibilities.map((r, j) => <li key={j}>{r}</li>)}</ul>
                    </div>
                ))}
            </Section>
            <Section title="Projects">
                {data.projects.map((proj, i) => (
                    <div key={i} className="mb-4">
                        <h3 className="text-lg font-semibold">{proj.name} {proj.link && <a href={proj.link} className="text-blue-600 text-sm">(link)</a>}</h3>
                        <p className="text-gray-700 mt-1">{proj.description}</p>
                    </div>
                ))}
            </Section>
            <Section title="Education">
                 {data.education.map((edu, i) => (
                    <div key={i} className="mb-3">
                        <h3 className="text-lg font-semibold">{edu.degree}</h3>
                        <div className="flex justify-between text-sm text-gray-600"><p>{edu.institution}</p><p>{edu.date}</p></div>
                    </div>
                ))}
            </Section>
            <Section title="Skills">
                {data.skills.map((skillCat, i) => (
                    <div key={i} className="mb-2"><strong className="font-semibold">{skillCat.category}: </strong><span>{skillCat.skills.join(', ')}</span></div>
                ))}
            </Section>
        </div>
    );
};
const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <section className="mb-6"><h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-3">{title}</h2>{children}</section>
);


// --- Template 2: Modern ---
export const modern: React.FC<TemplateProps> = ({ data, photo }) => {
    return (
        <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11pt' }} className="flex min-h-full">
            <aside className="w-1/3 bg-gray-800 text-white p-6 flex flex-col">
                {photo && <img src={photo} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-gray-600" />}
                <div className="text-center">
                    <h1 className="text-3xl font-bold">{data.name}</h1>
                    <p className="text-lg text-gray-300 mt-1">{data.title}</p>
                </div>
                <div className="mt-8">
                    <h2 className="text-xl font-semibold uppercase tracking-wider border-b-2 border-gray-500 pb-1">Contact</h2>
                    <div className="mt-3 space-y-2 text-sm">
                        <p><MailIcon />{data.contact.email}</p>
                        <p><PhoneIcon />{data.contact.phone}</p>
                        <p><LocationIcon />{data.contact.address}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <h2 className="text-xl font-semibold uppercase tracking-wider border-b-2 border-gray-500 pb-1">Links</h2>
                    <div className="mt-3 space-y-2 text-sm">
                        {data.links.map((link, i) => <p key={i}><LinkIcon /><a href={link.url} className="hover:underline">{link.label}</a></p>)}
                    </div>
                </div>
                 <div className="mt-6">
                    <h2 className="text-xl font-semibold uppercase tracking-wider border-b-2 border-gray-500 pb-1">Skills</h2>
                    <div className="mt-3 space-y-3 text-sm">
                        {data.skills.map((skillCat, i) => (
                            <div key={i}><h4 className="font-bold mb-1">{skillCat.category}</h4><ul className="list-disc list-inside">{skillCat.skills.map((s,j) => <li key={j}>{s}</li>)}</ul></div>
                        ))}
                    </div>
                </div>
                 <div className="mt-6">
                    <h2 className="text-xl font-semibold uppercase tracking-wider border-b-2 border-gray-500 pb-1">Languages</h2>
                    <div className="mt-3 space-y-2 text-sm">
                        {data.languages.map((lang, i) => <p key={i}><strong>{lang.lang}:</strong> {lang.proficiency}</p>)}
                    </div>
                </div>
            </aside>
            <main className="w-2/3 p-8">
                <ModernSection title="Summary"><p className="text-gray-700 leading-relaxed">{data.summary}</p></ModernSection>
                <ModernSection title="Experience">
                    {data.experience.map((exp, i) => (
                         <div key={i} className="mb-4">
                            <h3 className="text-lg font-semibold">{exp.role}</h3>
                            <div className="flex justify-between text-sm text-gray-600 italic"><p>{exp.company}</p><p>{exp.date}</p></div>
                            <ul className="list-disc pl-5 text-gray-700 mt-1">{exp.responsibilities.map((r, j) => <li key={j}>{r}</li>)}</ul>
                        </div>
                    ))}
                </ModernSection>
                <ModernSection title="Projects">
                    {data.projects.map((proj, i) => (
                         <div key={i} className="mb-4">
                            <h3 className="text-lg font-semibold">{proj.name} {proj.link && <a href={proj.link} className="text-blue-600 text-sm">(link)</a>}</h3>
                            <p className="text-gray-700 mt-1">{proj.description}</p>
                        </div>
                    ))}
                </ModernSection>
                <ModernSection title="Education">
                    {data.education.map((edu, i) => (
                         <div key={i} className="mb-3">
                            <h3 className="text-lg font-semibold">{edu.degree}</h3>
                            <div className="flex justify-between text-sm text-gray-600 italic"><p>{edu.institution}</p><p>{edu.date}</p></div>
                        </div>
                    ))}
                </ModernSection>
            </main>
        </div>
    );
};
const ModernSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <section className="mb-6"><h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300 pb-1 mb-3">{title}</h2>{children}</section>
);


// --- Template 3: Minimalist ---
export const minimalist: React.FC<TemplateProps> = ({ data }) => {
    return (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10pt', letterSpacing: '0.5px' }} className="p-16 bg-white min-h-full">
            <h1 className="text-5xl font-extrabold text-gray-800">{data.name}</h1>
            <h2 className="text-xl font-light text-gray-500 mt-2 mb-10">{data.title}</h2>
            <div className="grid grid-cols-3 gap-12">
                <aside className="col-span-1">
                    <MinimalistSection title="Contact">
                        <div className="space-y-2 text-gray-700"><p>{data.contact.email}</p><p>{data.contact.phone}</p><p>{data.contact.address}</p></div>
                    </MinimalistSection>
                    <MinimalistSection title="Links">
                        {data.links.map((link, i) => <p key={i}><a href={link.url} className="text-blue-600 hover:underline">{link.label}</a></p>)}
                    </MinimalistSection>
                    <MinimalistSection title="Skills">
                         {data.skills.map((skillCat, i) => (
                            <div key={i} className="mb-2"><h4 className="font-semibold">{skillCat.category}</h4><ul className="list-none text-gray-700">{skillCat.skills.map((s,j) => <li key={j}>{s}</li>)}</ul></div>
                        ))}
                    </MinimalistSection>
                </aside>
                <main className="col-span-2">
                    <MinimalistSection title="Profile"><p className="text-gray-700 leading-relaxed">{data.summary}</p></MinimalistSection>
                    <MinimalistSection title="Experience">
                        {data.experience.map((exp, i) => (
                            <div key={i} className="mb-5">
                                <div className="flex justify-between items-baseline"><h4 className="text-lg font-bold text-gray-800">{exp.role}</h4><p className="text-xs text-gray-500 font-medium">{exp.date}</p></div>
                                <p className="text-md text-gray-600 mb-1">{exp.company}</p>
                                <ul className="list-disc pl-5 text-gray-700">{exp.responsibilities.map((r, j) => <li key={j}>{r}</li>)}</ul>
                            </div>
                        ))}
                    </MinimalistSection>
                    <MinimalistSection title="Education">
                         {data.education.map((edu, i) => (
                             <div key={i} className="mb-3">
                                <div className="flex justify-between items-baseline"><h4 className="text-lg font-bold text-gray-800">{edu.degree}</h4><p className="text-xs text-gray-500 font-medium">{edu.date}</p></div>
                                <p className="text-md text-gray-600">{edu.institution}</p>
                            </div>
                        ))}
                    </MinimalistSection>
                </main>
            </div>
        </div>
    );
};
const MinimalistSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <section className="mb-8"><h3 className="text-sm font-semibold uppercase text-gray-400 tracking-widest mb-4">{title}</h3>{children}</section>
);


// --- Template 4: Corporate ---
export const corporate: React.FC<TemplateProps> = ({ data, photo, signature }) => {
    return (
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: '10pt' }} className="p-12 min-h-full">
            <header className="flex items-center justify-between pb-4 border-b-4 border-blue-800">
                <div>
                    <h1 className="text-4xl font-bold text-blue-900">{data.name}</h1>
                    <h2 className="text-xl font-semibold text-gray-700">{data.title}</h2>
                </div>
                {photo && <img src={photo} alt="Profile" className="w-28 h-28 object-cover border-4 border-gray-200" />}
            </header>
            <div className="flex justify-end text-xs text-gray-600 mt-2 space-x-4">
                 <span>{data.contact.email}</span><span>{data.contact.phone}</span><span>{data.contact.address}</span>
            </div>
            <CorpSection title="Professional Summary"><p className="text-gray-700">{data.summary}</p></CorpSection>
            <CorpSection title="Work Experience">
                {data.experience.map((exp, i) => (
                    <div key={i} className="mb-4">
                        <div className="flex justify-between"><h3 className="text-lg font-bold">{exp.role}</h3><p className="font-semibold text-gray-600">{exp.date}</p></div>
                        <p className="italic text-gray-700 mb-1">{exp.company}</p>
                        <ul className="list-disc pl-5 text-gray-700">{exp.responsibilities.map((r, j) => <li key={j}>{r}</li>)}</ul>
                    </div>
                ))}
            </CorpSection>
             <CorpSection title="Education">
                 {data.education.map((edu, i) => (
                    <div key={i} className="mb-3 flex justify-between">
                        <div><h3 className="text-lg font-bold">{edu.degree}</h3><p className="text-gray-700">{edu.institution}</p></div>
                        <p className="font-semibold text-gray-600">{edu.date}</p>
                    </div>
                ))}
            </CorpSection>
            <CorpSection title="Core Competencies">
                <div className="grid grid-cols-2 gap-x-4">
                    {data.skills.map((skillCat, i) => (
                        <div key={i} className="mb-2"><h4 className="font-bold">{skillCat.category}</h4><ul className="list-disc pl-5">{skillCat.skills.map((s,j) => <li key={j}>{s}</li>)}</ul></div>
                    ))}
                </div>
            </CorpSection>
            <div className="mt-8 text-right">
                {signature && <img src={signature} alt="Signature" className="max-h-16 ml-auto" />}
                <p className="text-sm mt-2">{data.references}</p>
            </div>
        </div>
    );
};
const CorpSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <section className="mt-6"><h2 className="text-sm font-bold text-blue-800 bg-gray-200 p-2 uppercase tracking-wider mb-3">{title}</h2>{children}</section>
);


// --- Template 5: Creative ---
export const creative: React.FC<TemplateProps> = ({ data, photo }) => {
    return (
        <div style={{ fontFamily: "'Montserrat', sans-serif" }} className="p-10 bg-gray-50 flex min-h-full">
            <main className="w-2/3 pr-8">
                 <h1 className="text-5xl font-extrabold text-teal-600">{data.name}</h1>
                 <h2 className="text-xl font-medium text-gray-600 mt-2">{data.title}</h2>
                 <div className="w-16 h-1 bg-teal-500 my-6"></div>
                 <CreativeSection title="About Me"><p>{data.summary}</p></CreativeSection>
                 <CreativeSection title="My Journey">
                    {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 relative pl-6 before:absolute before:left-1 before:top-2 before:w-2 before:h-2 before:bg-teal-500 before:rounded-full">
                            <h3 className="text-lg font-bold">{exp.role}</h3>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-400 mb-1">{exp.date}</p>
                            <ul className="list-disc pl-5 text-sm">{exp.responsibilities.map((r, j) => <li key={j}>{r}</li>)}</ul>
                        </div>
                    ))}
                 </CreativeSection>
                 <CreativeSection title="My Projects">
                    {data.projects.map((proj, i) => (
                        <div key={i} className="mb-4"><h3 className="text-lg font-bold">{proj.name}</h3><p className="text-sm">{proj.description}</p></div>
                    ))}
                 </CreativeSection>
            </main>
            <aside className="w-1/3 pl-8 border-l-2 border-gray-200">
                {photo && <img src={photo} alt="Profile" className="w-full object-cover mb-6" />}
                 <CreativeSection title="Get In Touch">
                    <p>{data.contact.email}</p><p>{data.contact.phone}</p><p>{data.contact.address}</p>
                    {data.links.map((link, i) => <p key={i}><a href={link.url} className="text-teal-600 hover:underline">{link.label}</a></p>)}
                 </CreativeSection>
                  <CreativeSection title="My Skills">
                     <div className="space-y-3">
                        {data.skills.map((skillCat, i) => (
                             <div key={i}>
                                <h4 className="font-bold mb-1">{skillCat.category}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {skillCat.skills.map((skill, j) => (<span key={j} className="bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">{skill}</span>))}
                                </div>
                             </div>
                        ))}
                     </div>
                 </CreativeSection>
                  <CreativeSection title="Education">
                    {data.education.map((edu, i) => (
                        <div key={i} className="mb-3">
                            <h3 className="font-bold">{edu.degree}</h3>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                            <p className="text-xs text-gray-400">{edu.date}</p>
                        </div>
                    ))}
                 </CreativeSection>
            </aside>
        </div>
    );
};
const CreativeSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <section className="mb-8">
        <h2 className="text-xl font-bold uppercase tracking-wider text-gray-700 mb-3">{title}</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
    </section>
);
