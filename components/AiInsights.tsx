import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';
import { GoogleGenAI } from "@google/genai";

interface AiInsightsProps {
    transactions: Transaction[];
}

const AiInsights: React.FC<AiInsightsProps> = ({ transactions }) => {
    const [insight, setInsight] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

    const fetchInsight = async () => {
        if (!ai) {
            setError("API key not configured.");
            setIsLoading(false);
            return;
        }

        if (transactions.length < 5) {
            setInsight("Keep logging transactions to unlock personalized insights!");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Get transactions from the last 60 days
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            const recentTransactions = transactions
                .filter(t => new Date(t.date) > sixtyDaysAgo)
                .map(({ id, ...rest }) => rest); // Strip id as it's not needed for analysis

            if (recentTransactions.length < 5) {
                 setInsight("Not enough recent activity for an insight. Keep tracking!");
                 setIsLoading(false);
                 return;
            }

            const prompt = `Analyze these recent financial transactions. Today's date is ${new Date().toLocaleDateString()}.
Provide a single, short, actionable insight for the user. 
Focus on spending habits, category trends, or potential savings. 
Compare the current month's spending to the previous month if possible. 
Your response must be a single sentence, friendly, and under 25 words. 
If there is not enough data for an insight, respond with: "Keep logging transactions to unlock personalized insights!"

Data:
${JSON.stringify(recentTransactions)}
`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setInsight(response.text.trim());
        } catch (err) {
            console.error("AI Insight Error:", err);
            setError("Could not generate insight. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchInsight();
    }, [transactions, ai]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="animate-pulse h-4 bg-base-300/50 rounded w-3/4"></div>;
        }
        if (error) {
            return <p className="text-sm text-danger">{error}</p>;
        }
        return <p className="text-sm font-semibold text-base-content">{insight}</p>;
    };

    return (
        <section aria-labelledby="ai-insight-title" className="bg-base-200 border border-primary/20 rounded-2xl p-4 shadow-lg flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xl">
                💡
            </div>
            <div className="flex-grow">
                <h2 id="ai-insight-title" className="font-bold text-primary">AI Insight</h2>
                {renderContent()}
            </div>
            <button onClick={fetchInsight} disabled={isLoading} className="p-2 rounded-full hover:bg-base-300/50 disabled:opacity-50 disabled:cursor-wait" title="Refresh Insight">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-muted-content ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 013.5 13.5" /></svg>
            </button>
        </section>
    );
};

export default AiInsights;
