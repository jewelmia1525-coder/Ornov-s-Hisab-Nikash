

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";

declare const jspdf: any;
declare const html2canvas: any;

// --- Helper Types & Interfaces ---
interface ConvertPageProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}
type Tool = 'resize' | 'pdf2txt' | 'txt2pdf' | 'html2pdf';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- Tool Sub-components ---

// Tool 1: Picture Resize
const PictureResizeTool: React.FC<{ showToast: ConvertPageProps['showToast'] }> = ({ showToast }) => {
    const [images, setImages] = useState<Array<{ file: File; dataUrl: string; originalWidth: number; originalHeight: number }>>([]);
    const [width, setWidth] = useState(300);
    const [height, setHeight] = useState(300);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const imagePromises = Array.from(files).map(file => {
            return new Promise<{ file: File; dataUrl: string; originalWidth: number; originalHeight: number }>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        resolve({
                            file,
                            dataUrl: event.target?.result as string,
                            originalWidth: img.width,
                            originalHeight: img.height,
                        });
                    };
                    img.onerror = reject;
                    img.src = event.target?.result as string;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then(newImages => {
            setImages(prev => [...prev, ...newImages]);
            showToast(`${newImages.length} image(s) added!`, 'success');
        }).catch(err => {
            console.error(err);
            showToast('Error reading image file.', 'error');
        });
        
        if (e.target) e.target.value = '';
    };

    const handleDownload = async () => {
        if (images.length === 0) return;
        showToast(`Starting download of ${images.length} images...`, 'success');
        
        for (const imageData of images) {
            const img = new Image();
            img.src = imageData.dataUrl;
            await new Promise<void>(resolve => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve();
                        return;
                    }
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    const link = document.createElement('a');
                    const originalFileName = imageData.file.name.split('.').slice(0, -1).join('.') || 'resized-image';
                    link.download = `${originalFileName}-${width}x${height}.jpg`;
                    link.href = canvas.toDataURL('image/jpeg', 0.9);
                    link.click();
                    resolve();
                };
            });
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    };
    
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full max-w-6xl p-4 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-base-content mb-4">Batch Picture Resizer</h3>
            <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <input type="file" accept="image/*" multiple ref={fileInputRef} className="hidden" onChange={handleFilesChange} />
                        <button onClick={() => fileInputRef.current?.click()} className="flex-grow py-3 bg-base-300/60 border border-dashed border-primary/30 rounded-lg hover:bg-primary/20 transition-colors text-base-content font-semibold">Upload Image(s)</button>
                        <div className="flex items-center gap-2">
                            <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value))} className="w-24 p-2 bg-base-300/50 rounded-lg text-center" />
                            <span className="font-bold">x</span>
                            <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="w-24 p-2 bg-base-300/50 rounded-lg text-center" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-base-300/30 rounded-lg h-80 overflow-y-auto">
                        {images.length === 0 && <p className="col-span-full text-center text-muted-content self-center">Upload images to see previews here.</p>}
                        {images.map((img, index) => (
                            <div key={index} className="relative group aspect-square">
                                <img src={img.dataUrl} alt={img.file.name} className="w-full h-full object-cover rounded-md" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 rounded-md text-white text-xs text-center">
                                    <p className="font-semibold truncate">{img.file.name}</p>
                                    <p>Original: {img.originalWidth}x{img.originalHeight}</p>
                                </div>
                                <button onClick={() => removeImage(index)} className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                     <div className="bg-base-300/50 rounded-lg p-4">
                        <h4 className="font-semibold text-base-content mb-2">Instructions</h4>
                        <ul className="text-xs text-muted-content space-y-1 text-left list-disc list-inside">
                            <li>Upload one or more images.</li>
                            <li>Set your desired width and height.</li>
                            <li>All images will be resized to these dimensions.</li>
                            <li>Click "Download All" to save them as JPGs.</li>
                        </ul>
                    </div>
                    <button onClick={handleDownload} disabled={images.length === 0} className="w-full py-3 bg-success text-white font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50">Download All as JPG</button>
                    <button onClick={() => setImages([])} disabled={images.length === 0} className="w-full py-2 bg-danger/80 text-white font-semibold rounded-lg hover:bg-danger transition-all disabled:opacity-50 text-sm">Clear All</button>
                </div>
            </div>
        </div>
    );
};

// Tool 2: PDF to TXT
const PdfToTxtTool: React.FC<{ showToast: ConvertPageProps['showToast'] }> = ({ showToast }) => {
    const [results, setResults] = useState<Array<{ fileName: string; text: string; size: number }>>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !ai) {
            if (!ai) showToast('API Key not configured', 'error');
            return;
        }
        setIsLoading(true);
        setResults([]);
        setActiveIndex(0);

        const newResults = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setLoadingMessage(`Processing ${i + 1}/${files.length}: ${file.name}`);
            try {
                const base64 = await fileToBase64(file);
                const pdfPart = { inlineData: { mimeType: 'application/pdf', data: base64 } };
                const prompt = "Extract all text from this PDF document. Provide only the raw text content without any formatting, explanations, or introductory sentences.";
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [pdfPart, { text: prompt }] } });
                newResults.push({ fileName: file.name, text: response.text, size: file.size });
            } catch (error) {
                console.error(error);
                showToast(`Failed to process ${file.name}`, 'error');
            }
        }
        setResults(newResults);
        if (newResults.length > 0) showToast(`${newResults.length} file(s) processed!`, 'success');
        setIsLoading(false);
        setLoadingMessage('');
        if (e.target) e.target.value = '';
    };

    const handleDownload = async (index: number) => {
        const result = results[index];
        if (!result) return;
        const blob = new Blob([result.text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${result.fileName.replace('.pdf', '')}.txt`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadAll = async () => {
        if (results.length === 0) return;
        showToast(`Downloading ${results.length} text files...`, 'success');
        for (let i = 0; i < results.length; i++) {
            await handleDownload(i);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    };
    
    const handleCopy = () => {
        if (currentResult) {
            navigator.clipboard.writeText(currentResult.text).then(() => showToast('Copied to clipboard!', 'success'));
        }
    };

    const currentResult = results[activeIndex];
    const stats = useMemo(() => {
        const text = currentResult?.text || '';
        return {
            chars: text.length,
            words: text.split(/\s+/).filter(Boolean).length,
        };
    }, [currentResult]);

    return (
        <div className="w-full max-w-7xl p-4 flex flex-col items-center h-full">
            <input type="file" accept=".pdf" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <div className="w-full flex-grow grid grid-cols-1 lg:grid-cols-[300px_1fr_250px] gap-6 min-h-0">
                {/* Left: File List */}
                <div className="flex flex-col gap-4">
                    <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full py-3 bg-base-300/60 border border-dashed border-primary/30 rounded-lg hover:bg-primary/20 transition-colors text-base-content font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                        {isLoading ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                         Upload PDF(s)
                    </button>
                    {isLoading && <p className="text-xs text-center text-muted-content">{loadingMessage}</p>}
                    <div className="flex-grow bg-base-300/30 rounded-lg p-2 overflow-y-auto">
                        {results.length === 0 && !isLoading && <p className="text-center text-xs text-muted-content p-4">No files processed.</p>}
                        <ul className="space-y-1">
                            {results.map((r, i) => (
                                <li key={i}>
                                    <button onClick={() => setActiveIndex(i)} className={`w-full text-left text-sm p-2 rounded-md truncate transition-colors ${activeIndex === i ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-primary/10'}`}>
                                        {r.fileName}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Middle: Text Preview */}
                <textarea 
                    value={currentResult?.text || ''} 
                    readOnly 
                    placeholder={isLoading ? "Processing..." : "Upload PDF file(s) to see the extracted text here..."}
                    className="w-full h-full p-3 bg-base-300/50 rounded-lg resize-none border border-primary/20 focus:outline-none focus:ring-1 focus:ring-primary"
                ></textarea>

                {/* Right: Stats & Actions */}
                <div className="flex flex-col gap-4">
                    <div className="bg-base-300/50 rounded-lg p-4 text-left">
                        <h4 className="font-semibold text-base-content mb-3">File Info</h4>
                        {currentResult ? (
                            <div className="space-y-2 text-sm">
                                <p><strong className="text-muted-content">File:</strong> <span className="font-mono text-primary truncate">{currentResult.fileName}</span></p>
                                <p><strong className="text-muted-content">Size:</strong> <span className="font-mono text-primary">{(currentResult.size / 1024).toFixed(2)} KB</span></p>
                                <p><strong className="text-muted-content">Chars:</strong> <span className="font-mono text-primary">{stats.chars.toLocaleString()}</span></p>
                                <p><strong className="text-muted-content">Words:</strong> <span className="font-mono text-primary">{stats.words.toLocaleString()}</span></p>
                            </div>
                        ) : <p className="text-xs text-muted-content">No file selected.</p>}
                    </div>
                    <button onClick={handleCopy} disabled={!currentResult} className="w-full py-2 bg-primary/80 text-primary-content text-sm font-bold rounded-lg hover:bg-primary transition-all disabled:opacity-50">Copy Current Text</button>
                    <button onClick={() => currentResult && handleDownload(activeIndex)} disabled={!currentResult} className="w-full py-2 bg-success text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50">Download Current (.txt)</button>
                    <button onClick={handleDownloadAll} disabled={results.length === 0} className="w-full py-2 bg-success text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50">Download All (.txt)</button>
                </div>
            </div>
        </div>
    );
};

// Tool 3: Text to PDF
const TxtToPdfTool: React.FC<{ showToast: ConvertPageProps['showToast'] }> = ({ showToast }) => {
    const [text, setText] = useState('');

    const stats = useMemo(() => {
        const chars = text.length;
        const words = text.split(/\s+/).filter(Boolean).length;
        return { chars, words };
    }, [text]);

    const handleDownload = () => {
        if (!text) return;
        const { jsPDF } = jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 15;
        const usableWidth = pdf.internal.pageSize.getWidth() - margin * 2;
        const lines = pdf.splitTextToSize(text, usableWidth);
        const pageHeight = pdf.internal.pageSize.getHeight();
        let cursorY = margin;

        const footer = (pageNum: number, totalPages: number) => {
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            pdf.text(`Page ${pageNum} of ${totalPages}`, pdf.internal.pageSize.getWidth() / 2, pageHeight - 7, { align: 'center' });
        };
        
        let pageCount = 1;
        lines.forEach((line: string) => {
             if (cursorY + 5 > pageHeight - margin) {
                pageCount++;
                cursorY = margin;
             }
             cursorY += 5;
        });

        cursorY = margin;
        let currentPage = 1;
        pdf.setFontSize(11);
        pdf.setTextColor(0);
        footer(currentPage, pageCount);
        lines.forEach((line: string) => {
            if (cursorY + 5 > pageHeight - margin) {
                pdf.addPage();
                currentPage++;
                cursorY = margin;
                footer(currentPage, pageCount);
            }
            pdf.text(line, margin, cursorY);
            cursorY += 5;
        });

        pdf.save('text-document.pdf');
        showToast('PDF generated!', 'success');
    };

    return (
        <div className="w-full max-w-4xl p-4 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-base-content mb-4">Text to PDF Converter</h3>
            <textarea placeholder="Paste your text here..." value={text} onChange={e => setText(e.target.value)} className="w-full h-64 p-3 bg-base-300/50 rounded-lg resize-y mb-2"></textarea>
            <p className="text-xs text-muted-content w-full text-right mb-4 pr-2">{stats.chars.toLocaleString()} characters / {stats.words.toLocaleString()} words</p>
            <button onClick={handleDownload} disabled={!text} className="w-full max-w-md py-3 bg-success text-white font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50">Generate PDF</button>
        </div>
    );
};

// Tool 4: HTML to PDF
const HtmlToPdfTool: React.FC<{ showToast: ConvertPageProps['showToast'] }> = ({ showToast }) => {
    const [htmlFile, setHtmlFile] = useState<{ name: string; content: string; size: number } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pageSize, setPageSize] = useState('a4');
    const [customWidth, setCustomWidth] = useState(210);
    const [customHeight, setCustomHeight] = useState(297);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const content = await fileToText(file);
        setHtmlFile({ name: file.name, content, size: file.size });
    };

    const handleGenerate = () => {
        const printableElement = document.getElementById('printable-html');
        if (!printableElement || !htmlFile) return;
        
        setIsGenerating(true);
        showToast('Generating PDF, please wait...', 'success');

        html2canvas(printableElement, { scale: 2, useCORS: true, allowTaint: true }).then((canvas: any) => {
            const { jsPDF } = jspdf;
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            
            const pdfOptions: any = { orientation: 'p', unit: 'mm', format: 'a4' };

            if (pageSize === 'custom') {
                pdfOptions.format = [customWidth, customHeight];
                pdfOptions.orientation = customWidth > customHeight ? 'l' : 'p';
            } else {
                pdfOptions.format = pageSize;
            }

            const pdf = new jsPDF(pdfOptions);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasAspectRatio = canvas.width / canvas.height;
            const scaledHeight = pdfWidth / canvasAspectRatio;
            let position = 0;
            let heightLeft = scaledHeight;

            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save('html-document.pdf');
            setIsGenerating(false);
        }).catch((err: any) => {
            console.error(err);
            showToast('Error generating PDF', 'error');
            setIsGenerating(false);
        });
    };
    
    const printableStyle: React.CSSProperties = {
        position: 'absolute', left: '-9999px', top: 0, backgroundColor: 'white'
    };

    if (pageSize === 'custom') {
        printableStyle.width = `${customWidth}mm`;
        printableStyle.minHeight = `${customHeight}mm`;
    } else {
        const dimensions: { [key: string]: { w: number, h: number } } = {
            a4: { w: 210, h: 297 }, a5: { w: 148, h: 210 }, letter: { w: 216, h: 279 }, legal: { w: 216, h: 356 }
        };
        const selectedDim = dimensions[pageSize] || dimensions['a4'];
        printableStyle.width = `${selectedDim.w}mm`;
        printableStyle.minHeight = `${selectedDim.h}mm`;
    }

    return (
        <div className="w-full max-w-6xl p-4 flex flex-col items-center">
             <style>{`.animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes fade-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <h3 className="text-2xl font-bold text-base-content mb-4">HTML to PDF Converter</h3>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                    <input type="file" accept=".html" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-base-300/60 border border-dashed border-primary/30 rounded-lg hover:bg-primary/20 transition-colors text-base-content font-semibold">Upload HTML File</button>
                    {htmlFile && <p className="text-xs text-muted-content -mt-2">Loaded: {htmlFile.name} ({(htmlFile.size / 1024).toFixed(2)} KB)</p>}
                    
                    <div className="bg-base-300/50 p-3 rounded-lg flex flex-col gap-2">
                        <label htmlFor="pageSize" className="text-sm font-semibold text-muted-content text-left">Page Size</label>
                        <select id="pageSize" value={pageSize} onChange={e => setPageSize(e.target.value)} className="w-full px-3 py-2 bg-base-100 border border-primary/20 rounded-md focus:outline-none focus:ring-1 focus:ring-primary">
                            <option value="a4">A4 (210 x 297 mm)</option> <option value="a5">A5 (148 x 210 mm)</option> <option value="letter">Letter (216 x 279 mm)</option> <option value="legal">Legal (216 x 356 mm)</option> <option value="custom">Custom</option>
                        </select>
                        {pageSize === 'custom' && (
                            <div className="flex items-center gap-2 mt-2 animate-fade-in">
                                <input type="number" value={customWidth} onChange={e => setCustomWidth(parseInt(e.target.value))} className="w-full p-2 bg-base-100 rounded-lg text-center" placeholder="Width (mm)"/>
                                <span className="font-bold">x</span>
                                <input type="number" value={customHeight} onChange={e => setCustomHeight(parseInt(e.target.value))} className="w-full p-2 bg-base-100 rounded-lg text-center" placeholder="Height (mm)"/>
                            </div>
                        )}
                    </div>

                    <button onClick={handleGenerate} disabled={!htmlFile || isGenerating} className="w-full py-3 bg-success text-white font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50">
                        {isGenerating ? 'Generating...' : 'Generate PDF'}
                    </button>
                </div>
                <div className="bg-white rounded-lg p-2 min-h-[300px]">
                    <iframe srcDoc={htmlFile?.content || ''} title="HTML Preview" className="w-full h-full border-0"></iframe>
                </div>
            </div>
            <div id="printable-html" style={printableStyle}>
                 <div style={{ padding: '15mm' }} dangerouslySetInnerHTML={{ __html: htmlFile?.content || '' }}></div>
            </div>
        </div>
    );
};


// Tool Selection Screen
const ToolSelection: React.FC<{ onSelect: (tool: Tool) => void }> = ({ onSelect }) => (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        <ToolCard title="Picture Resizer" icon="🖼️" description="Resize multiple photos and signatures to custom dimensions." onClick={() => onSelect('resize')} />
        <ToolCard title="PDF to Text" icon="📄" description="Extract all text content from multiple PDF files." onClick={() => onSelect('pdf2txt')} />
        <ToolCard title="Text to PDF" icon="✍️" description="Convert plain text into a professional PDF document." onClick={() => onSelect('txt2pdf')} />
        <ToolCard title="HTML to PDF" icon="🌐" description="Convert a full HTML file into a high-quality PDF." onClick={() => onSelect('html2pdf')} />
    </div>
);

const ToolCard: React.FC<{ title: string, icon: string, description: string, onClick: () => void }> = ({ title, icon, description, onClick }) => (
    <button onClick={onClick} className="bg-base-100 p-6 rounded-2xl text-center group transition-all duration-300 hover:bg-base-300/50 hover:-translate-y-2 flex flex-col items-center">
        <div className="text-5xl transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <h3 className="font-bangla text-xl font-bold text-base-content mt-4">{title}</h3>
        <p className="font-bangla text-sm text-muted-content mt-2 flex-grow">{description}</p>
    </button>
);


// --- Main Page Component ---
const ConvertPage: React.FC<ConvertPageProps> = ({ isOpen, onClose, showToast }) => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);

    const handleBack = () => setActiveTool(null);
    
    const handleClose = () => {
        setActiveTool(null);
        onClose();
    };

    if (!isOpen) return null;
    
    const pageTitle = {
        resize: "Picture Resizer",
        pdf2txt: "PDF to Text",
        txt2pdf: "Text to PDF",
        html2pdf: "HTML to PDF"
    }[activeTool!] || "File Converter";

    return (
        <div className="fixed inset-0 bg-base-100 z-[10000] flex flex-col p-4 sm:p-6 md:p-8 animate-fade-in">
            <header className="flex-shrink-0 flex items-center gap-2 sm:gap-4 mb-4">
                <button onClick={activeTool ? handleBack : handleClose} className="p-2 rounded-full hover:bg-base-300 transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="font-bangla text-2xl sm:text-3xl font-bold text-primary">{pageTitle}</h1>
            </header>
            <main className="flex-grow bg-base-200 border border-primary/20 rounded-2xl flex flex-col items-center justify-center p-2 sm:p-4 text-center overflow-y-auto">
                {!activeTool && <ToolSelection onSelect={setActiveTool} />}
                {activeTool === 'resize' && <PictureResizeTool showToast={showToast} />}
                {activeTool === 'pdf2txt' && <PdfToTxtTool showToast={showToast} />}
                {activeTool === 'txt2pdf' && <TxtToPdfTool showToast={showToast} />}
                {activeTool === 'html2pdf' && <HtmlToPdfTool showToast={showToast} />}
            </main>
        </div>
    );
};

export default ConvertPage;