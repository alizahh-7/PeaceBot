// src/components/ChatBot.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2, Bot, Send, Globe } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'loading' | 'error';
};

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY2 || '');

export const ChatBot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current page content
  useEffect(() => {
    const getPageContent = async () => {
      try {
        //@ts-ignore
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab?.id) {
        //@ts-ignore

          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText
          });
          
          setPageContent(results[0].result.slice(0, 15000)); // Limit content length
          setIsLoading(false);
          
          // Add initial message
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: `I'm analyzing: ${tab.title}\nAsk me about this page's conflict-related content.`,
            timestamp: Date.now()
          }]);
        }
      } catch (error) {
        setMessages([{
          id: 'error',
          role: 'assistant',
          content: 'Failed to analyze page content',
          timestamp: Date.now(),
          status: 'error'
        }]);
        setIsLoading(false);
      }
    };

    getPageContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Analyze this page content for conflict-related information:
      Page Content: ${pageContent}
      User Question: ${input}
      Provide:
      1. Direct answer to question
      2. Relevant quotes from page
      3. Credibility assessment
      4. Additional context`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      setMessages(prev => [
        ...prev.filter(msg => msg.id !== 'loading'),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: text,
          timestamp: Date.now()
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== 'loading'),
        {
          id: 'error',
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Analysis failed',
          timestamp: Date.now(),
          status: 'error'
        }
      ]);
    }
  };

  return (
    <div className="h-[600px] w-[400px] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
      {/* Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b flex items-center gap-3">
        <motion.div 
          className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Globe className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h1 className="font-semibold">Page Analyst</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Context-Aware Conflict Detection</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-xl ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.status === 'error'
                      ? 'bg-red-100 dark:bg-red-900/20 border border-red-200'
                      : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {message.status === 'loading' ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing page...</span>
                    </div>
                  ) : (
                    <>
                      {message.role === 'assistant' && <Bot className="w-5 h-5 mb-2 text-blue-500" />}
                      <div className="prose prose-sm dark:prose-invert">
                        {message.content}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this page..."
            className="w-full pl-4 pr-12 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};