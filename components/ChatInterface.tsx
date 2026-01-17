
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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            id: 'start',
            role: 'assistant',
            content: "👋 Welcome to BetPredict AI Bot!\n\nSend me any football match (e.g., 'Real Madrid vs Liverpool') or use the /menu for quick options."
          }
        ]);
      }, 500);
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent, manualQuery?: string) => {
    e?.preventDefault();
    const query = manualQuery || inputValue;
    if (!query.trim() || isTyping) return;

    if (query.toLowerCase() === '/menu') {
      setIsMenuOpen(true);
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
        content: `📊 Prediction for ${prediction.matchName}:`,
        prediction: prediction
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "❌ Sorry, I couldn't process that request. Please try again with a clear match name."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="tg-pattern"></div>
      
      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 tg-scrollbar relative z-10"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`message-bubble ${msg.role === 'user' ? 'message-out' : 'message-in shadow-md'}`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.prediction && (
                <PredictionDisplay 
                  prediction={msg.prediction} 
                  onAction={(action) => handleSubmit(undefined, action)} 
                />
              )}
              <div className="text-[10px] text-right mt-1 opacity-40">
                {new Date(parseInt(msg.id) || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="message-bubble message-in flex gap-1 items-center italic text-[#708499]">
              <span className="animate-pulse">bot is analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2 bg-[#17212b] border-t border-white/5 relative z-10">
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
