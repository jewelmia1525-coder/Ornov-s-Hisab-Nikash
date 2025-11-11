import React from 'react';
import { Transaction, Contact, Budget, DashboardModule, DashboardModuleId, Role } from '../types';
import SummaryCards from './SummaryCards';
import TransactionList from './TransactionList';
import Sidebar from './Sidebar';
import WeeklyChart from './WeeklyChart';
import ReportControls from './ReportControls';
import CategoryPieChart from './CategoryPieChart';
import MonthlyChart from './MonthlyChart';
import BudgetProgress from './BudgetProgress';
import AiInsights from './AiInsights';
import BroadcastBanner from './BroadcastBanner';

interface DashboardProps {
    transactions: Transaction[];
    contacts: Contact[];
    budgets: Budget[];
    onEditTransaction: (tx: Transaction) => void;
    onDeleteTransaction: (id: number) => void;
    onToggleCompleted: (id: number) => void;
    onAddTransaction: () => void;
    onEditContact: (type: 'receivable' | 'payable', contact: Contact) => void;
    onDeleteContact: (id: number) => void;
    onAddReceivable: () => void;
    onAddPayable: () => void;
    onGeneratePdf: () => void;
    onOpenEmailModal: () => void;
    onOpenSignatureModal: () => void;
    onOpenBudgetModal: () => void;
    dashboardLayout: DashboardModule[];
    currentUserRole: Role | null;
    adminBroadcast: string;
    viewerBroadcast: string;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const componentsMap: Record<DashboardModuleId, React.ReactNode> = {
        summary: (
            <SummaryCards 
                transactions={props.transactions} 
            />
        ),
        reports: (
             <ReportControls 
                onGeneratePdf={props.onGeneratePdf}
                onOpenEmailModal={props.onOpenEmailModal}
                onOpenSignatureModal={props.onOpenSignatureModal}
                onOpenBudgetModal={props.onOpenBudgetModal}
            />
        ),
        ai_insights: <AiInsights transactions={props.transactions} />,
        budgets: (
            <BudgetProgress 
                transactions={props.transactions} 
                budgets={props.budgets} 
                onOpenBudgetModal={props.onOpenBudgetModal} 
            />
        ),
        visualizations: (
            <section aria-label="Data Visualizations" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-base-200 border border-primary/20 rounded-2xl p-4 shadow-lg min-h-[300px]">
                    <WeeklyChart transactions={props.transactions} />
                </div>
                <CategoryPieChart transactions={props.transactions} />
            </section>
        ),
        monthly_chart: (
            <section aria-label="Monthly Summary Chart" className="bg-base-200 border border-primary/20 rounded-2xl p-4 shadow-lg min-h-[300px]">
                <MonthlyChart transactions={props.transactions} />
            </section>
        ),
        transactions: (
            <TransactionList 
                transactions={props.transactions}
                onEdit={props.onEditTransaction}
                onDelete={props.onDeleteTransaction}
                onAddTransaction={props.onAddTransaction}
                onToggleCompleted={props.onToggleCompleted}
            />
        )
    };
    
    const broadcastText = props.currentUserRole === 'viewer' 
        ? props.viewerBroadcast 
        : (props.currentUserRole === 'admin' ? props.adminBroadcast : '');


    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[380px_1fr_380px] gap-6">
            <div className="hidden xl:block"></div> {/* Spacer for profile card */}
            <div className="flex flex-col gap-6">
                {broadcastText && <BroadcastBanner text={broadcastText} />}
                {props.dashboardLayout
                    .filter(module => module.isVisible)
                    .map(module => <div key={module.id}>{componentsMap[module.id]}</div>)
                }
            </div>
            <aside className="flex flex-col gap-6 lg:relative lg:-top-36">
                <Sidebar
                    contacts={props.contacts}
                    onEdit={props.onEditContact}
                    onDelete={props.onDeleteContact}
                    onAddReceivable={props.onAddReceivable}
                    onAddPayable={props.onAddPayable}
                />
            </aside>
        </div>
    );
};

export default Dashboard;