import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { analyzeMatch } from '../services/geminiService';
import PredictionDisplay from './PredictionDisplay';
import BotMenu from './BotMenu';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        {
          id: 'start',
          role: 'assistant',
          content: "👋 Welcome to BetPredict AI Bot!\n\nI provide predictive analysis for football matches using advanced statistical form and real-time market data.\n\nSend me a fixture (e.g. 'Arsenal vs Man City') to get started."
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, manualQuery?: string) => {
    e?.preventDefault();
    const query = manualQuery || inputValue;
    if (!query.trim() || isTyping) return;

    if (query === '/clear') {
      localStorage.removeItem('chat_history');
      setMessages([{ id: Date.now().toString(), role: 'assistant', content: "History cleared." }]);
      setInputValue('');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const prediction = await analyzeMatch(userMessage.content);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `📊 **Analysis for ${prediction.matchName}**`,
        prediction: prediction
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "⚠️ Prediction engine failed to sync. Please try again with a specific fixture."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (id: string) => {
    const date = new Date(parseInt(id) || Date.now());
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-transparent">
      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 tg-scrollbar relative z-10"
      >
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`message-bubble ${msg.role === 'user' ? 'message-out' : 'message-in shadow-sm'}`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.prediction && (
                  <PredictionDisplay 
                    prediction={msg.prediction} 
                    onAction={(action) => handleSubmit(undefined, action)} 
                  />
                )}
                <div className="flex items-center justify-end">
                  <span className="message-time">{formatTime(msg.id)}</span>
                  {msg.role === 'user' && (
                    <span className="read-receipt">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline><polyline points="15 6 9 12 4 12" style={{opacity: 0.5}}></polyline></svg>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="message-bubble message-in flex gap-2 items-center italic text-[#708499]">
                <div className="flex gap-1 py-1">
                  <span className="w-1.5 h-1.5 bg-[#40a7e3] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#40a7e3] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#40a7e3] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-2 bg-[#17212b] border-t border-black/10 relative z-20">
        <BotMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          onSelect={(q) => handleSubmit(undefined, q)} 
        />
        
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto items-center">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isMenuOpen ? 'bg-[#40a7e3] text-white' : 'text-[#708499] hover:bg-white/5'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message"
              className="w-full bg-[#0e1621] text-white border-none rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-0 placeholder:text-[#708499]"
            />
          </div>
          
          <button
            type="submit"
            disabled={isTyping || !inputValue.trim()}
            className="w-10 h-10 bg-[#40a7e3] hover:bg-[#3996cd] disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-all shadow-lg shrink-0"
          >
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;