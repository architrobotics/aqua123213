import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ai } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hi! I'm your Aqua AI coach. How can I help you with your hydration and skin goals today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    // Initialize chat session once
    chatRef.current = ai.chats.create({
      model: 'gemini-3.1-pro-preview',
      config: {
        systemInstruction: "You are Aqua, an AI hydration and skin health coach. Be encouraging, concise, and helpful.",
      }
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      
      if (response.text) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'model', text: response.text },
        ]);
      }
    } catch (error) {
      console.error('Chat error', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting right now. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[calc(100vh-8rem)] flex-col gap-4 md:h-[calc(100vh-5rem)]"
    >
      <header className="flex items-center gap-3 pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">AI Coach</h1>
          <p className="text-sm text-text-secondary">Ask me anything about hydration.</p>
        </div>
      </header>

      <Card className="flex flex-1 flex-col overflow-hidden bg-slate-50/50">
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-primary text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
                  }`}>
                    {msg.role === 'user' ? (
                      msg.text
                    ) : (
                      <div className="markdown-body prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Bot size={16} />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-4 shadow-sm border border-slate-100">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about skin health..."
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0 rounded-2xl">
              <Send size={18} />
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}
