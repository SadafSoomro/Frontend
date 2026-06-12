import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { fetchChatContactsApi, fetchChatHistoryApi } from '../../API/api';
import { API_BASE_URL } from '../../config';
import { MessageCircle, Send, Users, Search } from 'lucide-react';
import './AdminChat.css';

const AdminChat = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const contactsRef = useRef([]);

    // Keep contactsRef updated with current contacts
    useEffect(() => {
        contactsRef.current = contacts;
    }, [contacts]);

    // Load contacts on mount
    useEffect(() => {
        const loadContacts = async () => {
            try {
                const { data } = await fetchChatContactsApi();
                setContacts(data);
            } catch (err) {
                console.error('Failed to load chat contacts:', err);
            } finally {
                setLoadingContacts(false);
            }
        };
        loadContacts();
    }, []);

    // Connect to socket
    useEffect(() => {
        if (!user?._id) return undefined;

        socketRef.current = io(API_BASE_URL);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join_admin');
        });

        socketRef.current.on('receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);

            // If this message is from a new user not in contacts, refresh contacts
            const senderId = msg.senderId?.toString();
            if (senderId && senderId !== user?._id && !contactsRef.current.find(c => c._id === senderId)) {
                fetchChatContactsApi()
                    .then(({ data }) => setContacts(data))
                    .catch(console.error);
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user?._id]);

    // Load messages when selecting a contact
    useEffect(() => {
        if (!selectedContact) return;

        const loadMessages = async () => {
            setLoadingMessages(true);
            try {
                const { data } = await fetchChatHistoryApi(selectedContact._id);
                setMessages(data);
            } catch (err) {
                console.error('Failed to load messages:', err);
            } finally {
                setLoadingMessages(false);
            }
        };
        loadMessages();
    }, [selectedContact]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socketRef.current || !selectedContact) return;

        socketRef.current.emit('send_message', {
            senderId: user._id,
            receiverId: selectedContact._id,
            message: input,
        });

        setInput('');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredContacts = contacts.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter messages relevant to the selected contact
    const relevantMessages = selectedContact
        ? messages.filter(msg =>
            msg.senderId === selectedContact._id ||
            msg.receiverId === selectedContact._id ||
            msg.senderId?.toString() === selectedContact._id ||
            msg.receiverId?.toString() === selectedContact._id
          )
        : [];

    return (
        <div className="admin-chat-container">
            {/* ── Contact List Panel ── */}
            <div className="chat-contacts-panel">
                <div className="contacts-header">
                    <h3>
                        <MessageCircle size={18} />
                        Messages
                    </h3>
                    <p>{contacts.length} conversation{contacts.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="contacts-search">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="contacts-list">
                    {loadingContacts ? (
                        <div className="chat-loading">
                            Loading
                            <div className="chat-loading-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="contacts-empty">
                            <Users size={36} />
                            <p>{searchTerm ? 'No matching users' : 'No conversations yet'}</p>
                        </div>
                    ) : (
                        filteredContacts.map((contact) => (
                            <div
                                key={contact._id}
                                className={`contact-item ${selectedContact?._id === contact._id ? 'active' : ''}`}
                                onClick={() => setSelectedContact(contact)}
                            >
                                <div className="contact-avatar">
                                    {getInitials(contact.name)}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-name">{contact.name}</div>
                                    <div className="contact-email">{contact.email}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Chat Window Panel ── */}
            <div className="chat-window-panel">
                {selectedContact ? (
                    <>
                        <div className="chat-window-header">
                            <div className="contact-avatar">
                                {getInitials(selectedContact.name)}
                            </div>
                            <div className="chat-user-info">
                                <h4>{selectedContact.name}</h4>
                                <span>{selectedContact.email}</span>
                            </div>
                            <div className="chat-status-badge">
                                <span className="chat-status-dot"></span>
                                Active
                            </div>
                        </div>

                        <div className="chat-messages-area">
                            {loadingMessages ? (
                                <div className="chat-loading">
                                    Loading messages
                                    <div className="chat-loading-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            ) : relevantMessages.length === 0 ? (
                                <div className="contacts-empty" style={{ height: '100%' }}>
                                    <MessageCircle size={36} />
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                relevantMessages.map((msg, idx) => {
                                    const isSent = msg.senderId === user._id || msg.senderId?.toString() === user._id;
                                    return (
                                        <div key={msg._id || idx} className={`chat-message-row ${isSent ? 'sent' : 'received'}`}>
                                            <div className="chat-msg-bubble">
                                                {msg.message}
                                                <span className="chat-msg-time">
                                                    {formatTime(msg.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-bar" onSubmit={sendMessage}>
                            <input
                                type="text"
                                placeholder="Type your reply..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="chat-send-btn" title="Send message">
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-no-selection">
                        <div className="chat-no-selection-icon">
                            <MessageCircle size={36} strokeWidth={1.5} color="#6366f1" />
                        </div>
                        <h3>Select a Conversation</h3>
                        <p>Choose a user from the left panel to view and respond to their messages.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
