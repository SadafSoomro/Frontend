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
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.isVerified || user?.role === 'admin') return;

        // Fetch history
        fetchChatHistoryApi(user._id).then(({ data }) => setMessages(data)).catch(console.error);

        // Connect socket
        socketRef.current = io(API_BASE_URL);
        
        socketRef.current.on('connect', () => {
            socketRef.current.emit('join_chat', user._id);
        });

        socketRef.current.on('receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [isAuthenticated, user?._id, user?.isVerified, user?.role]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    if (!isAuthenticated || !user?.isVerified || user?.role === 'admin') {
        return null; // Don't show for unverified users or admins
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
                        {messages.length === 0 ? (
                            <div className="chatbot-empty">Send a message to our admin!</div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`chatbot-bubble ${msg.senderId === user._id ? 'sent' : 'received'}`}>
                                    {msg.message}
                                </div>
                            ))
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
