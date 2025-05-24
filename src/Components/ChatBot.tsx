// src/components/ChatBot.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Bot, Send, Sparkles, ShieldAlert, Space } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'loading' | 'error';
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -50 }
};

export const ChatBot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm PeaceBot 🌍\nAsk me about conflicts, peace initiatives, or verify information.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    
    const loadingMessage: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'loading'
    };

    setInput('');
    setMessages(prev => [...prev, userMessage, loadingMessage]);

    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm a demo version. For full analysis, please configure the AI API.",
        timestamp: Date.now()
      };

      setMessages(prev => [
        ...prev.filter(msg => msg.id !== 'loading'),
        botMessage
      ]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: 'error',
        role: 'assistant',
        content: 'Analysis failed. Please try again.',
        timestamp: Date.now(),
        status: 'error'
      };

      setMessages(prev => [
        ...prev.filter(msg => msg.id !== 'loading'),
        errorMessage
      ]);
    }
  };

  return (
    <div className="h-[600px] w-[400px] flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      {/* Chat Header */}
      <div className="p-4 border-b border-blue-100 dark:border-blue-900/50 bg-white dark:bg-gray-800 flex items-center gap-3">
        <div className="relative">
          <motion.div
            className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          >
            <Space className="w-5 h-5 text-white" />
          </motion.div>
          <Sparkles className="absolute -right-1 -top-1 w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <h2 className="font-semibold">PeaceBot Chat</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Interactive Conflict Analyst</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.status === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50'
                    : 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700'
              }`}>
                {message.status === 'loading' ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        {message.status === 'error' ? (
                          <ShieldAlert className="w-5 h-5 text-red-500" />
                        ) : (
                          <Bot className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    )}
                    <div className="prose prose-sm dark:prose-invert">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-blue-100 dark:border-blue-900/50 bg-white dark:bg-gray-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about conflicts or peace initiatives..."
            className="w-full pl-4 pr-12 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};