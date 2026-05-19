import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Xin chào! E-Tech có thể giúp gì cho bạn?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Lấy thông tin người dùng đang đăng nhập từ LocalStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));

        const userMsg = { text: input, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Gửi cả tin nhắn và thông tin user lên Backend
            const response = await axios.post('http://localhost:3000/chat', { 
                message: input,
                user: storedUser 
            });
            
            // Lấy đúng trường .reply từ dữ liệu trả về của Gemini
            const botMsg = { 
                text: response.data.data.reply || response.data.data, 
                isBot: true 
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Lỗi Chatbot:", error);
            setMessages(prev => [...prev, { text: "Rất tiếc, mình đang bận một chút!", isBot: true }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`chatbot-wrapper ${isOpen ? 'active' : ''}`}>
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-comment-dots"></i>}
            </button>

            <div className="chatbot-container">
                <div className="chatbot-header">
                    <div className="header-info">
                        <div className="online-dot"></div>
                        <div>
                            <h3>E-Tech Assistant</h3>
                            <span>Trực tuyến</span>
                        </div>
                    </div>
                </div>

                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
                            {msg.isBot && <div className="bot-avatar">E</div>}
                            <div className="message-content">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message-wrapper bot">
                            <div className="bot-avatar">E</div>
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chatbot-input" onSubmit={handleSendMessage}>
                    <input 
                        type="text" 
                        placeholder="Hỏi E-Tech về sản phẩm..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" disabled={!input.trim()}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;