import React, { useState } from 'react';
import { filesToZip } from '../fileContents';

declare const JSZip: any;
declare const saveAs: any;

const DownloadProjectTool: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const zip = new JSZip();
            filesToZip.forEach(file => {
                zip.file(file.path, file.content);
            });
            const blob = await zip.generateAsync({ type: 'blob' });
            saveAs(blob, 'finance-dashboard-project.zip');
        } catch (error) {
            console.error("Failed to create zip file", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <button
            onClick={handleDownload}
            disabled={isLoading}
            className="bg-base-200 border border-primary/20 rounded-2xl p-6 text-left group transition-all duration-300 hover:bg-base-300/50 hover:-translate-y-1 flex flex-col disabled:opacity-70 disabled:cursor-wait md:col-span-2"
        >
            <div className="flex items-start gap-4">
                <div className="text-4xl">{isLoading ? '⏳' : '📦'}</div>
                <div>
                    <h3 className="font-bangla text-lg sm:text-xl font-bold text-base-content">
                        {isLoading ? 'Zipping Project...' : 'Download Full Project'}
                    </h3>
                    <p className="font-bangla text-sm text-muted-content mt-1">
                        {isLoading ? 'Please wait...' : 'Download all source code and assets as a ZIP file.'}
                    </p>
                </div>
            </div>
        </button>
    );
};

export default DownloadProjectTool;
