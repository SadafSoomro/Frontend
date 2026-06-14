import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { fetchChatHistoryApi } from '../../API/api';
import { API_BASE_URL } from '../../config';
import { MessageCircle, X, Send } from 'lucide-react';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
    const { isAuthenticated, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.isVerified || user?.role === 'admin') return;

        // Fetch history once
        if (!historyLoaded) {
            fetchChatHistoryApi(user._id)
                .then(({ data }) => {
                    setMessages(data);
                    setHistoryLoaded(true);
                })
                .catch(console.error);
        }

        // Connect socket
        const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        const joinRoom = () => {
            socket.emit('join_chat', user._id);
        };

        if (socket.connected) joinRoom();
        socket.on('connect', joinRoom);

        socket.on('receive_message', (msg) => {
            setMessages(prev => {
                // Avoid duplicates by _id
                if (prev.find(m => m._id?.toString() === msg._id?.toString())) return prev;
                return [...prev, msg];
            });
        });

        socket.on('messages_seen', () => {
            setMessages(prev => prev.map(m => 
                (m.senderId?.toString() === user._id?.toString() && m.receiverId === 'admin') 
                ? { ...m, isRead: true } : m
            ));
        });

        return () => {
            socket.disconnect();
        };
    }, [isAuthenticated, user?._id, user?.isVerified, user?.role]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    if (!isAuthenticated || !user?.isVerified || user?.role === 'admin') {
        return null;
    }

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socketRef.current) return;

        socketRef.current.emit('send_message', {
            senderId: user._id,
            receiverId: 'admin',
            message: input
        });

        setInput('');
    };

    // Only show messages relevant to this user
    const userMessages = messages.filter(msg =>
        msg.senderId?.toString() === user._id?.toString() ||
        msg.receiverId?.toString() === user._id?.toString() ||
        msg.receiverId === 'admin' && msg.senderId?.toString() === user._id?.toString()
    );

    return (
        <div className="chatbot-widget-container">
            {isOpen ? (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <MessageCircle size={18} />
                            <span>Support Chat</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="chatbot-close-btn">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="chatbot-messages">
                        {userMessages.length === 0 ? (
                            <div className="chatbot-empty">Send a message to our admin!</div>
                        ) : (
                            userMessages.map((msg, idx) => {
                                const isSent = msg.senderId?.toString() === user._id?.toString();
                                return (
                                    <div key={msg._id || idx} className={`chatbot-bubble-wrapper ${isSent ? 'sent' : 'received'}`}>
                                        <div className={`chatbot-bubble ${isSent ? 'sent' : 'received'}`}>
                                            {msg.message}
                                            <div className="bubble-meta">
                                                <span className="time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isSent && (
                                                    <span className={`tick-marks ${msg.isRead ? 'read' : 'sent'}`}>
                                                        <svg viewBox="0 0 18 12" width="14" height="10" fill="none">
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
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chatbot-input-area" onSubmit={sendMessage}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit"><Send size={16} /></button>
                    </form>
                </div>
            ) : (
                <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={24} />
                </button>
            )}
        </div>
    );
};

export default ChatbotWidget;
