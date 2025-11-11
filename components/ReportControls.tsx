
import React from 'react';

interface ReportControlsProps {
    onGeneratePdf: () => void;
    onOpenEmailModal: () => void;
    onOpenSignatureModal: () => void;
    onOpenBudgetModal: () => void;
}

const ReportControls: React.FC<ReportControlsProps> = ({ onGeneratePdf, onOpenEmailModal, onOpenSignatureModal, onOpenBudgetModal }) => {
    return (
        <div className="bg-base-200 border border-primary/20 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="font-bangla text-xl font-bold text-base-content">Reports &amp; Actions</h2>
            <div className="flex items-center gap-2 flex-wrap justify-center">
                <button onClick={onOpenBudgetModal} className="px-4 py-2 text-sm bg-primary/20 text-primary rounded-lg font-semibold hover:bg-primary/30 transition-colors flex items-center gap-2">📊 Set Budgets</button>
                <button onClick={onGeneratePdf} className="px-4 py-2 text-sm bg-primary/20 text-primary rounded-lg font-semibold hover:bg-primary/30 transition-colors flex items-center gap-2">📄 Download PDF</button>
                <button onClick={onOpenEmailModal} className="px-4 py-2 text-sm bg-primary/20 text-primary rounded-lg font-semibold hover:bg-primary/30 transition-colors flex items-center gap-2">📧 Email Summary</button>
                <button onClick={onOpenSignatureModal} className="px-4 py-2 text-sm bg-base-300 hover:bg-base-300/70 border border-primary/20 rounded-lg font-semibold text-base-content transition-colors flex items-center gap-2">✍️ Set Signature</button>
            </div>
        </div>
    );
};

export default ReportControls;
