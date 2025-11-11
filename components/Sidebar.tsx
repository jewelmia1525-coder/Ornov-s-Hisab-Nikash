

import React from 'react';
import { Contact } from '../types';

interface ContactListProps {
    title: string;
    contacts: Contact[];
    type: 'receivable' | 'payable';
    onEdit: (type: 'receivable' | 'payable', contact: Contact) => void;
    onDelete: (id: number) => void;
    onAdd: () => void;
}

const ContactListItem: React.FC<{ contact: Contact; onEdit: () => void; onDelete: () => void; }> = ({ contact, onEdit, onDelete }) => {
    const isReceivable = contact.type === 'receivable';
    const placeholder = `https://placehold.co/60x60/0f1a30/ffd700?text=${encodeURIComponent(contact.name.charAt(0))}`;

    return (
        <li className="flex items-center gap-3">
            <img src={contact.photo || placeholder} alt={contact.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/30" />
            <div className="flex-grow">
                <p className="font-semibold font-bangla text-base-content leading-tight">{contact.name}</p>
                <span className="text-xs text-muted-content">{contact.reason}</span>
            </div>
             <div className={`font-bold font-bangla text-lg ${isReceivable ? 'text-success' : 'text-danger'}`}>
                ৳{contact.amount.toLocaleString('bn-BD')}
            </div>
            <div className="flex gap-1">
                <button onClick={onEdit} className="p-2 rounded-full hover:bg-primary/20 text-muted-content hover:text-primary transition-colors text-sm" title="Edit" aria-label="Edit contact">✏️</button>
                <button onClick={onDelete} className="p-2 rounded-full hover:bg-danger/20 text-muted-content hover:text-danger transition-colors text-sm" title="Delete" aria-label="Delete contact">🗑️</button>
            </div>
        </li>
    );
};

const ContactList: React.FC<ContactListProps> = ({ title, contacts, type, onEdit, onDelete, onAdd }) => {
    const filteredContacts = contacts.filter(c => c.type === type).sort((a,b) => b.id - a.id);
    const titleId = `contact-list-${type}`;
    return (
        <section aria-labelledby={titleId} className="bg-base-200 border border-primary/20 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 id={titleId} className="font-bangla text-base font-bold text-base-content">{title}</h2>
                <button onClick={onAdd} className="w-8 h-8 rounded-full bg-primary text-primary-content text-xl font-semibold flex items-center justify-center hover:bg-primary-focus transition-transform hover:scale-110" title={`Add ${type}`}>+</button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
                {filteredContacts.length > 0 ? (
                    <ul className="space-y-4">
                        {filteredContacts.map(contact => (
                            <ContactListItem key={contact.id} contact={contact} onEdit={() => onEdit(type, contact)} onDelete={() => onDelete(contact.id)} />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 text-muted-content">
                        <svg className="mx-auto h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <p className="mt-2 text-xs font-bangla text-base-content font-semibold">
                            {type === 'receivable'
                                ? 'কোন Receivable নেই'
                                : 'কোন Payable নেই'
                            }
                        </p>
                         <button 
                            onClick={onAdd}
                            className="mt-4 px-4 py-2 bg-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary/30 transition-all"
                        >
                           {`Add New ${type === 'receivable' ? 'Receivable' : 'Payable'}`}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

interface SidebarProps {
    contacts: Contact[];
    onEdit: (type: 'receivable' | 'payable', contact: Contact) => void;
    onDelete: (id: number) => void;
    onAddReceivable: () => void;
    onAddPayable: () => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
    return (
        <>
            <ContactList 
                title="আমি পাবো (Receivable)"
                contacts={props.contacts}
                type="receivable"
                onEdit={props.onEdit}
                onDelete={props.onDelete}
                onAdd={props.onAddReceivable}
            />
            <ContactList 
                title="আমার কাছে পাবে (Payable)"
                contacts={props.contacts}
                type="payable"
                onEdit={props.onEdit}
                onDelete={props.onDelete}
                onAdd={props.onAddPayable}
            />
        </>
    );
};

export default Sidebar;