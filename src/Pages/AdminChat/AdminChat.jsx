import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { fetchChatContactsApi, fetchChatHistoryApi } from '../../API/api';
import { API_BASE_URL } from '../../config';
import { MessageCircle, Send, Users, RefreshCw, Search, Wifi, WifiOff } from 'lucide-react';
import './AdminChat.css';

const AdminChat = () => {
    const { user } = useAuth();
    const [contacts, setContacts]               = useState([]);
    const [selectedContact, setSelectedContact] = useState(() => {
        const saved = sessionStorage.getItem('adminChatSelectedContact');
        return saved ? JSON.parse(saved) : null;
    });
    const [messagesMap, setMessagesMap]         = useState({});   // { contactId: Message[] }
    const [unreadMap, setUnreadMap]             = useState({});   // { contactId: count }
    const [input, setInput]                     = useState('');
    const [searchTerm, setSearchTerm]           = useState('');
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [connected, setConnected]             = useState(false);

    const socketRef           = useRef(null);
    const messagesEndRef      = useRef(null);
    const selectedContactRef  = useRef(null);
    const contactsRef         = useRef([]);

    useEffect(() => { contactsRef.current = contacts; },       [contacts]);
    useEffect(() => { 
        selectedContactRef.current = selectedContact; 
        if (selectedContact) {
            sessionStorage.setItem('adminChatSelectedContact', JSON.stringify(selectedContact));
        } else {
            sessionStorage.removeItem('adminChatSelectedContact');
        }
    }, [selectedContact]);

    /* ── Load Contacts ── */
    const loadContacts = useCallback(async () => {
        try {
            const { data } = await fetchChatContactsApi();
            setContacts(data);
            
            // Count unread for each contact
            const newUnread = {};
            data.forEach(c => { 
                newUnread[c._id] = c.unreadCount || 0; 
            });
            
            setUnreadMap(prev => {
                const combined = { ...prev };
                // Update with latest DB counts, unless we already have a higher count locally (rare)
                Object.keys(newUnread).forEach(id => {
                    combined[id] = newUnread[id];
                });
                return combined;
            });
        } catch (err) {
            console.error('Failed to load contacts:', err);
        } finally {
            setLoadingContacts(false);
        }
    }, []);

    useEffect(() => { loadContacts(); }, [loadContacts]);

    // Refresh contacts every 30s to catch offline-sent messages
    useEffect(() => {
        const timer = setInterval(loadContacts, 30000);
        return () => clearInterval(timer);
    }, [loadContacts]);

    /* ── Socket ── */
    useEffect(() => {
        if (!user?._id) return;

        const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        const joinAdmin = () => {
            socket.emit('join_admin');
            setConnected(true);
        };

        if (socket.connected) joinAdmin();
        socket.on('connect', joinAdmin);
        socket.on('disconnect', () => setConnected(false));

        socket.on('receive_message', (msg) => {
            const msgSenderId   = msg.senderId?.toString();
            const msgReceiverId = msg.receiverId?.toString();
            const adminId       = user._id?.toString();

            // Which contact does this message belong to?
            let contactId = null;
            if (msgSenderId && msgSenderId !== adminId) {
                contactId = msgSenderId;          // user → admin
            } else if (msgReceiverId && msgReceiverId !== 'admin' && msgReceiverId !== adminId) {
                contactId = msgReceiverId;        // admin → user
            }

            if (!contactId) return;

            setMessagesMap(prev => {
                const existing = prev[contactId] || [];
                if (existing.find(m => m._id?.toString() === msg._id?.toString())) return prev;
                return { ...prev, [contactId]: [...existing, msg] };
            });

            // Increment unread if this contact is not currently selected
            if (selectedContactRef.current?._id !== contactId) {
                setUnreadMap(prev => ({ ...prev, [contactId]: (prev[contactId] || 0) + 1 }));
            } else {
                // Auto-mark as read since admin is viewing
                socket.emit('mark_read', { userId: contactId });
            }

            // Add to contacts list if new user
            if (!contactsRef.current.find(c => c._id?.toString() === contactId)) {
                loadContacts();
            }
        });

        return () => { socket.disconnect(); };
    }, [user?._id, loadContacts]);

    /* ── Load messages when contact selected ── */
    useEffect(() => {
        if (!selectedContact) return;
        const contactId = selectedContact._id;

        // Always reload from DB to get latest (including offline msgs)
        const load = async () => {
            setLoadingMessages(true);
            try {
                const { data } = await fetchChatHistoryApi(contactId);
                setMessagesMap(prev => ({ ...prev, [contactId]: data }));
                // Mark as read
                if (socketRef.current?.connected) {
                    socketRef.current.emit('mark_read', { userId: contactId });
                }
                // Clear unread badge
                setUnreadMap(prev => ({ ...prev, [contactId]: 0 }));
            } catch (err) {
                console.error('Failed to load messages:', err);
            } finally {
                setLoadingMessages(false);
            }
        };
        load();
    }, [selectedContact]);

    /* ── Auto-scroll ── */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messagesMap, selectedContact]);

    /* ── Send ── */
    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socketRef.current || !selectedContact) return;

        socketRef.current.emit('send_message', {
            senderId:   user._id,
            receiverId: selectedContact._id,
            message:    input,
        });
        setInput('');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatTime = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (d) => {
        if (!d) return '';
        const date = new Date(d);
        const today = new Date();
        const diff  = today.setHours(0,0,0,0) - date.setHours(0,0,0,0);
        if (diff === 0) return 'Today';
        if (diff === 86400000) return 'Yesterday';
        return new Date(d).toLocaleDateString();
    };

    const filteredContacts = contacts.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentMessages = selectedContact ? (messagesMap[selectedContact._id] || []) : [];

    // Group messages by date
    const groupedMessages = currentMessages.reduce((acc, msg) => {
        const day = formatDate(msg.createdAt);
        if (!acc[day]) acc[day] = [];
        acc[day].push(msg);
        return acc;
    }, {});

    return (
        <div className="admin-chat-container">

            {/* ══ Contact List Panel ══ */}
            <div className="chat-contacts-panel">
                <div className="contacts-header">
                    <div className="contacts-header-top">
                        <div className="contacts-header-title">
                            <MessageCircle size={18} />
                            <span>Messages</span>
                        </div>
                        <div className={`connection-badge ${connected ? 'online' : 'offline'}`}>
                            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                            {connected ? 'Live' : 'Offline'}
                        </div>
                    </div>
                    <p>{contacts.length} conversation{contacts.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="contacts-search">
                    <Search size={14} className="search-icon-chat" />
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
                            Loading<div className="chat-loading-dots"><span/><span/><span/></div>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="contacts-empty">
                            <Users size={36} />
                            <p>{searchTerm ? 'No matching users' : 'No conversations yet'}</p>
                        </div>
                    ) : (
                        filteredContacts.map((contact) => {
                            const msgs   = messagesMap[contact._id] || [];
                            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : contact.lastMessage;
                            const unread  = unreadMap[contact._id] || 0;
                            return (
                                <div
                                    key={contact._id}
                                    className={`contact-item ${selectedContact?._id === contact._id ? 'active' : ''}`}
                                    onClick={() => setSelectedContact(contact)}
                                >
                                    <div className="contact-avatar">{getInitials(contact.name)}</div>
                                    <div className="contact-info">
                                        <div className="contact-name">{contact.name}</div>
                                        <div className="contact-email">
                                            {lastMsg ? lastMsg.message.slice(0, 28) + (lastMsg.message.length > 28 ? '…' : '') : contact.email}
                                        </div>
                                    </div>
                                    <div className="contact-meta">
                                        {lastMsg && <span className="contact-time">{formatTime(lastMsg.createdAt)}</span>}
                                        {unread > 0 && <span className="unread-badge">{unread}</span>}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ══ Chat Window Panel ══ */}
            <div className="chat-window-panel">
                {selectedContact ? (
                    <>
                        {/* Header */}
                        <div className="chat-window-header">
                            <div className="contact-avatar">{getInitials(selectedContact.name)}</div>
                            <div className="chat-user-info">
                                <h4>{selectedContact.name}</h4>
                                <span>{selectedContact.email}</span>
                            </div>
                            <div className="chat-header-actions">
                                <div className="chat-status-badge">
                                    <span className="chat-status-dot" />
                                    Online
                                </div>
                                <button
                                    className="chat-refresh-btn"
                                    onClick={() => setSelectedContact({ ...selectedContact })}
                                    title="Reload messages"
                                >
                                    <RefreshCw size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages-area">
                            {loadingMessages ? (
                                <div className="chat-loading">
                                    Loading messages<div className="chat-loading-dots"><span/><span/><span/></div>
                                </div>
                            ) : currentMessages.length === 0 ? (
                                <div className="contacts-empty" style={{ height: '100%' }}>
                                    <MessageCircle size={40} opacity={0.3} />
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                Object.entries(groupedMessages).map(([day, msgs]) => (
                                    <React.Fragment key={day}>
                                        <div className="chat-date-divider"><span>{day}</span></div>
                                        {msgs.map((msg, idx) => {
                                            const isSent = msg.senderId?.toString() === user._id?.toString();
                                            return (
                                                <div key={msg._id || idx} className={`chat-message-row ${isSent ? 'sent' : 'received'}`}>
                                                    {!isSent && (
                                                        <div className="msg-avatar-small">{getInitials(selectedContact.name)}</div>
                                                    )}
                                                    <div className="chat-msg-bubble">
                                                        <span className="bubble-text">{msg.message}</span>
                                                        <div className="bubble-footer">
                                                            <span className="chat-msg-time">{formatTime(msg.createdAt)}</span>
                                                            {isSent && (
                                                                <span className={`tick-marks ${msg.isRead ? 'read' : 'sent'}`}>
                                                                    {/* Double tick SVG */}
                                                                    <svg viewBox="0 0 18 12" width="16" height="11" fill="none">
                                                                        <path d="M1 6l4 4L12 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                                        <path d="M6 10l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                                        <path d="M9 6l3-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    </svg>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form className="chat-input-bar" onSubmit={sendMessage}>
                            <input
                                type="text"
                                placeholder="Type your reply…"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-no-selection">
                        <div className="chat-no-selection-icon">
                            <MessageCircle size={40} strokeWidth={1.5} />
                        </div>
                        <h3>Select a Conversation</h3>
                        <p>Choose a user from the left panel to view and reply to their messages.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
