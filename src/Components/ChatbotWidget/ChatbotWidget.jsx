import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Headphones, Sparkles } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { fetchChatHistoryApi, fetchProductsApi } from '../../API/api';
import { API_BASE_URL } from '../../config';
import { getShoppingReply, shortcuts } from './shoppingReplies';
import './ChatbotWidget.css';

function SupportChat({ userId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState('');
    const socketRef = useRef(null);
    const endRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;
        socket.on('connect', () => {
            socket.emit('join_chat', userId);
            setConnected(true);
        });
        socket.on('disconnect', () => setConnected(false));
        socket.on('receive_message', message => {
            setMessages(previous => previous.some(item => item._id === message._id) ? previous : [...previous, message]);
        });
        socket.on('messages_seen', () => {
            setMessages(previous => previous.map(message => String(message.senderId) === userId ? { ...message, isRead: true } : message));
        });
        fetchChatHistoryApi(userId).then(({ data }) => {
            if (!cancelled) setMessages(previous => [...data, ...previous.filter(message => !data.some(item => item._id === message._id))]);
        }).catch(() => {
            if (!cancelled) setStatus('Chat history could not be loaded.');
        });
        return () => {
            cancelled = true;
            socket.disconnect();
        };
    }, [userId]);

    useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);

    const send = event => {
        event.preventDefault();
        const text = input.trim();
        if (!text || !socketRef.current?.connected) return;
        socketRef.current.emit('send_message', { senderId: userId, receiverId: 'admin', message: text });
        setInput('');
    };

    return <>
        <div className="chatbot-messages" role="log">
            <p className="chatbot-note">{connected ? 'Message the Makskin support team.' : 'Connecting to support. You can still use the shopping assistant.'}</p>
            {status && <p className="chatbot-note">{status}</p>}
            {messages.filter(message => String(message.senderId) === userId || String(message.receiverId) === userId).map(message => {
                const sent = String(message.senderId) === userId;
                return <div key={message._id} className={`chatbot-bubble ${sent ? 'sent' : 'received'}`}>
                    {message.message}
                    {sent && <small>{message.isRead ? 'Seen' : 'Sent'}</small>}
                </div>;
            })}
            <div ref={endRef} />
        </div>
        <form className="chatbot-input-area" onSubmit={send}>
            <input value={input} onChange={event => setInput(event.target.value)} placeholder="Message support" aria-label="Message support" maxLength={500} />
            <button type="submit" disabled={!connected || !input.trim()} aria-label="Send support message"><Send size={17} /></button>
        </form>
    </>;
}

export default function ChatbotWidget() {
    const { isAuthenticated, user } = useAuth();
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState('assistant');
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const [replies, setReplies] = useState([]);
    const catalogRef = useRef(null);
    const endRef = useRef(null);

    useEffect(() => {
        if (isOpen && tab === 'assistant') endRef.current?.scrollIntoView({ block: 'nearest' });
    }, [isOpen, tab, replies, busy]);

    const ask = async question => {
        const text = question.trim();
        if (!text || busy) return;
        setInput('');
        setBusy(true);
        setReplies(previous => [...previous, { question: text }]);
        const reply = await getShoppingReply(text, async () => {
            if (!catalogRef.current) {
                catalogRef.current = fetchProductsApi().then(({ data }) => data).catch(error => {
                    catalogRef.current = null;
                    throw error;
                });
            }
            return catalogRef.current;
        });
        setReplies(previous => previous.map((item, index) => index === previous.length - 1 ? { ...item, reply } : item));
        setBusy(false);
    };

    if (pathname === '/admin' || pathname.startsWith('/admin/') || user?.role === 'admin') return null;

    return <div className="chatbot-widget-container">
        {isOpen && <section className="chatbot-window" aria-label="Makskin help" onKeyDown={event => {
            if (event.key === 'Escape') setIsOpen(false);
        }}>
            <header className="chatbot-header">
                <div className="chatbot-title"><MessageCircle size={20} /><div><strong>Makskin Help</strong><small>Shopping and order support</small></div></div>
                <button className="chatbot-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat"><X size={20} /></button>
            </header>
            <div className="chatbot-tabs" aria-label="Help mode">
                <button type="button" aria-pressed={tab === 'assistant'} onClick={() => setTab('assistant')}><Sparkles size={15} /> Assistant</button>
                <button type="button" aria-pressed={tab === 'support'} onClick={() => setTab('support')}><Headphones size={15} /> Support</button>
            </div>
            {tab === 'support' ? (
                isAuthenticated && user?.isVerified && user?._id
                    ? <SupportChat key={user._id} userId={String(user._id)} />
                    : <div className="chatbot-messages"><p className="chatbot-note">Sign in with a verified account to message the Makskin team.</p><Link className="chatbot-link" to="/login" onClick={() => setIsOpen(false)}>Sign in</Link></div>
            ) : <>
                <div className="chatbot-messages" role="log">
                    <div className="chatbot-bubble received">Hi! Ask me about products, orders, delivery or payments.</div>
                    {replies.length === 0 && <div className="chatbot-shortcuts">
                        {shortcuts.map(question => <button type="button" key={question} onClick={() => ask(question)}>{question}</button>)}
                    </div>}
                    {replies.map(({ question, reply }, index) => <div className="chatbot-exchange" key={index}>
                        <div className="chatbot-bubble sent">{question}</div>
                        {reply && <div className="chatbot-bubble received">
                            {reply.text}
                            {reply.link && <Link className="chatbot-link" to={reply.link} onClick={() => setIsOpen(false)}>{reply.label}</Link>}
                            {reply.products?.map(product => <Link key={product.id} className="chatbot-link chatbot-product-link" to={`/product/${product.id}`} onClick={() => setIsOpen(false)}>
                                {product.name}<small>Rs. {product.price.toLocaleString()} PKR</small>
                            </Link>)}
                            {reply.support && <button className="chatbot-link" type="button" onClick={() => setTab('support')}>Open support</button>}
                        </div>}
                    </div>)}
                    {busy && <p className="chatbot-note">Checking the catalog…</p>}
                    <div ref={endRef} />
                </div>
                <form className="chatbot-input-area" onSubmit={event => { event.preventDefault(); ask(input); }}>
                    <input value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about Makskin" aria-label="Ask the shopping assistant" maxLength={300} />
                    <button type="submit" disabled={busy || !input.trim()} aria-label="Send question"><Send size={17} /></button>
                </form>
            </>}
        </section>}
        <button type="button" className="chatbot-toggle-btn" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-label={isOpen ? 'Minimize Makskin help' : 'Open Makskin help'}>
            {isOpen ? <X size={23} /> : <MessageCircle size={25} />}
        </button>
    </div>;
}
