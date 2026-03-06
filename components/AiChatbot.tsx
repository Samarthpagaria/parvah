'use client'

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { aiAPI } from '@/utils/backend_api_endpoints';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatbotProps {
  role: 'citizen' | 'admin';
}

import ReactMarkdown from 'react-markdown';

export default function AiChatbot({ role }: AiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm the Parvah Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMessageContent } as Message];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiAPI.chat(newMessages, role);
      setMessages([...newMessages, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl w-[350px] sm:w-[400px] h-[550px] flex flex-col mb-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#576CDB] to-[#088395] p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                <h3 className="font-semibold text-lg">Parvah Assistant</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/50">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[90%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-[#576CDB] text-white' : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[#088395]'}`}>
                      {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div 
                      className={`p-3 rounded-2xl text-[13px] sm:text-sm leading-relaxed ${
                        message.role === 'user' 
                          ? 'bg-[#576CDB] text-white rounded-tr-none' 
                          : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                        {message.role === 'user' ? (
                            message.content
                        ) : (
                            <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none space-y-2 pb-0 mb-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:text-[#088395] [&_a]:underline">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[#088395] flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-tl-none shadow-sm flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleSubmit}
              className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#576CDB]/50 dark:text-zinc-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-[#576CDB] text-white rounded-full hover:bg-[#576CDB]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                 <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gradient-to-r from-[#576CDB] to-[#088395] hover:shadow-lg scale-100 hover:scale-105'} transition-all duration-300 text-white rounded-full p-4 shadow-xl flex items-center justify-center group`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
