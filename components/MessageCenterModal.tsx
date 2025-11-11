import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from './Modal';
import { Message, Role } from '../types';

interface MessageCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    currentUserIdentifier: string;
    onSendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void;
    onMarkConversationAsRead: (participant: string) => void;
    role: Role;
    showToast: (message: string, type?: 'success' | 'error') => void;
    initialSelectedUser: string | null;
}

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const MessageCenterModal: React.FC<MessageCenterModalProps> = ({ isOpen, onClose, messages, currentUserIdentifier, onSendMessage, onMarkConversationAsRead, role, showToast, initialSelectedUser }) => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const adminUsers = useMemo(() => {
        const users = new Set<string>();
        messages.forEach(msg => {
            if (msg.sender !== 'super-admin' && msg.sender !== currentUserIdentifier) users.add(msg.sender);
            if (msg.recipient !== 'super-admin' && msg.recipient !== currentUserIdentifier) users.add(msg.recipient);
        });
        return Array.from(users);
    }, [messages, currentUserIdentifier]);

    useEffect(() => {
        if (isOpen) {
            if (initialSelectedUser) {
                setSelectedUser(initialSelectedUser);
                onMarkConversationAsRead(initialSelectedUser);
            } else if (role === 'admin') {
                setSelectedUser('super-admin');
                onMarkConversationAsRead('super-admin');
            } else if (role === 'super-admin' && adminUsers.length > 0 && !selectedUser) {
                const defaultUser = adminUsers[0];
                setSelectedUser(defaultUser);
                onMarkConversationAsRead(defaultUser);
            }
        } else {
            setSelectedUser(null);
        }
    }, [isOpen, initialSelectedUser, role, adminUsers, onMarkConversationAsRead]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedUser]);
    
    const handleSelectUser = (user: string) => {
        setSelectedUser(user);
        onMarkConversationAsRead(user);
    };

    const handleSendMessage = (attachment?: Message['attachment']) => {
        if ((!newMessage.trim() && !attachment) || !selectedUser) return;
        
        onSendMessage({
            sender: currentUserIdentifier,
            recipient: selectedUser,
            text: newMessage,
            attachment,
        });
        setNewMessage('');
    };
    
     const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (role === 'admin' && !isImage) {
            showToast('Admins can only send images.', 'error');
            return;
        }
        if (role === 'admin' && file.size > 1 * 1024 * 1024) { // 1MB limit for admin
            showToast('Image size cannot exceed 1MB.', 'error');
            return;
        }
        if (role === 'super-admin' && isVideo && file.size > 5 * 1024 * 1024) { // 5MB limit for video
            showToast('Video size cannot exceed 5MB.', 'error');
            return;
        }

        try {
            const content = await fileToDataURL(file);
            handleSendMessage({
                type: isVideo ? 'video' : 'image',
                content,
                fileName: file.name
            });
        } catch (error) {
            showToast('Failed to upload file.', 'error');
        }
    };
    
    const conversation = useMemo(() => {
        if (!selectedUser) return [];
        return messages.filter(m => 
            (m.sender === currentUserIdentifier && m.recipient === selectedUser) ||
            (m.sender === selectedUser && m.recipient === currentUserIdentifier)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, selectedUser, currentUserIdentifier]);
    
    const unreadCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        messages.forEach(msg => {
            if (msg.recipient === currentUserIdentifier && !msg.isRead) {
                counts[msg.sender] = (counts[msg.sender] || 0) + 1;
            }
        });
        return counts;
    }, [messages, currentUserIdentifier]);

    const renderAttachment = (attachment: Message['attachment']) => {
        if (!attachment) return null;
        switch(attachment.type) {
            case 'image': return <img src={attachment.content} alt={attachment.fileName} className="max-w-xs rounded-md mt-2"/>;
            case 'video': return <video src={attachment.content} controls className="max-w-xs rounded-md mt-2" />;
            case 'link': return <a href={attachment.content} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline mt-2 block">{attachment.content}</a>;
            default: return null;
        }
    };

    const UserList = (
         <div className="w-full lg:w-1/3 border-r border-primary/20 flex flex-col">
            <h3 className="p-4 font-bold text-lg border-b border-primary/20">Conversations</h3>
            <div className="flex-grow overflow-y-auto">
                {adminUsers.length === 0 && <p className="p-4 text-sm text-muted-content">No admin conversations yet.</p>}
                {adminUsers.map(user => (
                    <button key={user} onClick={() => handleSelectUser(user)} className={`w-full text-left p-4 flex justify-between items-center transition-colors ${selectedUser === user ? 'bg-primary/20' : 'hover:bg-base-300/50'}`}>
                        <span className="font-semibold">{user}</span>
                        {unreadCounts[user] > 0 && <span className="bg-danger text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCounts[user]}</span>}
                    </button>
                ))}
            </div>
        </div>
    );

    const ConversationView = (
        <div className="w-full lg:w-2/3 flex flex-col">
            {selectedUser ? (
                <>
                    <div className="p-4 border-b border-primary/20 flex-shrink-0">
                        <h3 className="font-bold text-lg">{selectedUser}</h3>
                    </div>
                    <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                        {conversation.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === currentUserIdentifier ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-md p-3 rounded-lg ${msg.sender === currentUserIdentifier ? 'bg-primary text-primary-content rounded-br-none' : 'bg-base-300/60 rounded-bl-none'}`}>
                                    <p>{msg.text}</p>
                                    {renderAttachment(msg.attachment)}
                                </div>
                                <p className="text-xs text-muted-content mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                            </div>
                        ))}
                         <div ref={messagesEndRef}></div>
                    </div>
                    <div className="p-4 border-t border-primary/20 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="w-full p-2 bg-base-100 border border-primary/20 rounded-lg"/>
                             <label className="p-2 cursor-pointer text-muted-content hover:text-primary">
                                📎
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                            <button onClick={() => handleSendMessage()} className="px-4 py-2 bg-primary text-primary-content font-bold rounded-lg">Send</button>
                        </div>
                    </div>
                </>
            ) : <div className="flex items-center justify-center h-full text-muted-content">Select a conversation to start messaging.</div>}
        </div>
    );
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Message Center">
            <div className="flex flex-col lg:flex-row h-[70vh] -m-6 rounded-2xl overflow-hidden">
                {role === 'super-admin' ? UserList : null}
                {role === 'super-admin' ? ConversationView : <div className="w-full">{ConversationView}</div>}
            </div>
        </Modal>
    );
};

export default MessageCenterModal;