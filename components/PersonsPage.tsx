
import React from 'react';
import { Contact } from '../types';

interface PersonCardProps {
    contact: Contact;
    onEdit: (type: 'receivable' | 'payable', contact: Contact) => void;
    onDelete: (id: number) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ contact, onEdit, onDelete }) => {
    const isReceivable = contact.type === 'receivable';
    const placeholder = `https://placehold.co/60x60/0f1a30/ffd700?text=${encodeURIComponent(contact.name.charAt(0))}`;

    return (
        <li className="bg-base-300/40 rounded-xl p-4 flex flex-col gap-3 relative group">
            <div className="flex items-center gap-3">
                <img src={contact.photo || placeholder} alt={contact.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/30" />
                <div>
                    <p className="font-semibold font-bangla text-base-content">{contact.name}</p>
                    <span className={`text-xs font-semibold ${isReceivable ? 'text-success' : 'text-danger'}`}>
                        {isReceivable ? 'Receivable' : 'Payable'}
                    </span>
                </div>
            </div>
            <div className={`font-bold font-bangla text-2xl text-center ${isReceivable ? 'text-success' : 'text-danger'}`}>
                ৳{contact.amount.toLocaleString('bn-BD')}
            </div>
            <p className="text-xs text-muted-content text-center italic truncate" title={contact.reason}>{contact.reason || 'No reason specified'}</p>
            <span className="text-xs text-muted-content text-center">{new Date(contact.date).toLocaleDateString('bn-BD')}</span>

            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(contact.type, contact)} className="p-2 rounded-full bg-base-100 hover:bg-primary/20 text-muted-content hover:text-primary transition-colors text-sm" title="Edit" aria-label="Edit person">✏️</button>
                <button onClick={() => onDelete(contact.id)} className="p-2 rounded-full bg-base-100 hover:bg-danger/20 text-muted-content hover:text-danger transition-colors text-sm" title="Delete" aria-label="Delete person">🗑️</button>
            </div>
        </li>
    );
};

interface PersonsPageProps {
    contacts: Contact[];
    onEditContact: (type: 'receivable' | 'payable', contact: Contact) => void;
    onDeleteContact: (id: number) => void;
    onAddReceivable: () => void;
    onAddPayable: () => void;
}

const PersonsPage: React.FC<PersonsPageProps> = ({ contacts, onEditContact, onDeleteContact, onAddReceivable, onAddPayable }) => {
    return (
        <div className="max-w-7xl mx-auto">
            <section aria-labelledby="persons-page-title" className="bg-base-200 border border-primary/20 rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 id="persons-page-title" className="font-bangla text-xl font-bold text-base-content">All Persons</h2>
                    <div className="flex gap-2">
                        <button onClick={onAddReceivable} className="px-4 py-2 text-sm bg-success/20 text-success rounded-lg font-semibold hover:bg-success/30 transition-colors">+ Add Receivable</button>
                        <button onClick={onAddPayable} className="px-4 py-2 text-sm bg-danger/20 text-danger rounded-lg font-semibold hover:bg-danger/30 transition-colors">+ Add Payable</button>
                    </div>
                </div>

                {contacts.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {contacts.sort((a,b) => b.id - a.id).map(contact => (
                            <PersonCard key={contact.id} contact={contact} onEdit={onEditContact} onDelete={onDeleteContact} />
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-content py-16">No persons added yet.</p>
                )}
            </section>
        </div>
    );
};

export default PersonsPage;
