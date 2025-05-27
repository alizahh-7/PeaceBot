import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2, ShieldCheck, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FactCheckResult = {
  credibilityScore: number;
  claims: string[];
  sources: string[];
  analysis: string;
};

const ScoreGauge = ({ score }: { score: number }) => (
  <motion.div 
    className="relative w-48 h-48"
    initial={{ rotate: -135 }}
    animate={{ rotate: 135 }}
    transition={{ duration: 1.5, type: 'spring' }}
  >
    <svg className="w-full h-full" viewBox="0 0 100 100">
      <path
        className="text-gray-200 dark:text-gray-700"
        strokeWidth="8"
        strokeLinecap="round"
        stroke="currentColor"
        fill="none"
        d="M18,82 a32,32 0 1,1 64,0"
      />
      <path
        className={`${score > 70 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500'}`}
        strokeWidth="8"
        strokeLinecap="round"
        stroke="currentColor"
        fill="none"
        d="M18,82 a32,32 0 1,1 64,0"
        strokeDasharray={`${score}, 100`}
        style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        {score}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
    </div>
  </motion.div>
);

export const FactChecker = () => {
  const [state, setState] = useState({
    loading: true,
    error: null as string | null,
    result: null as FactCheckResult | null,
  });

  const cleanJsonResponse = (text: string) => {
    try {
      let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      cleaned = cleaned.replace(/^json\s*/i, '');
      cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
      return cleaned;
    } catch (error) {
      throw new Error('Failed to clean API response');
    }
  };

  const validateResult = (data: any): data is FactCheckResult => {
    return (
      typeof data.credibilityScore === 'number' &&
      Array.isArray(data.claims) &&
      Array.isArray(data.sources) &&
      typeof data.analysis === 'string'
    );
  };

  useEffect(() => {
    const analyzePage = async () => {
      try {
        // @ts-ignore
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab?.id) throw new Error('No active tab found');
        
        // @ts-ignore
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.body.innerText
        });
        
        const pageContent = results[0].result.slice(0, 15000);
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analyze this web page content for factual accuracy:
        ${pageContent}

        Respond with JSON format ONLY:
        {
          "credibilityScore": 0-100,
          "claims": ["array of factual claims"],
          "sources": ["array of source domains"],
          "analysis": "string with detailed summary"
        }`;

        const result = await model.generateContent(prompt);
        const rawText = result.response.text();
        const cleanedText = cleanJsonResponse(rawText);
        const parsedData = JSON.parse(cleanedText);

        if (!validateResult(parsedData)) {
          throw new Error('Invalid response structure from API');
        }

        setState({
          loading: false,
          error: null,
          result: parsedData
        });
      } catch (error) {
        console.error('Fact check error:', error);
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Fact check failed',
          result: null
        });
      }
    };

    analyzePage();
  }, []);

  const handleRetry = () => {
    setState({
      loading: true,
      error: null,
      result: null
    });
    //@ts-ignore
    analyzePage();
  };

  return (
    <div className="h-[600px] flex flex-col bg-white dark:bg-gray-900 overflow-hidden group">
      {/* Animated Header */}
      <motion.div 
        className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-white/10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="p-2 bg-white/10 rounded-xl backdrop-blur-sm"
            whileHover={{ rotate: 15 }}
          >
            <ShieldCheck className="w-6 h-6 text-white/90" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-white">Fact Check Report</h2>
            <p className="text-sm text-white/80">Comprehensive content analysis</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {state.loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center space-y-4"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Loader2 className="w-12 h-12 text-blue-500/80" />
            </motion.div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Analyzing page content...
            </p>
          </motion.div>
        ) : state.error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full"
            >
              <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
            </motion.div>
            <p className="text-center text-red-500 dark:text-red-400 max-w-sm">
              {state.error}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all"
              onClick={handleRetry}
            >
              Retry Analysis
            </motion.button>
          </motion.div>
        ) : state.result ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto scroll-smooth hover:scroll-auto"
          >
            <div className="p-6 space-y-8">
              {/* Credibility Score Card */}
              <motion.div 
                className="bg-gradient-to-br from-white dark:from-gray-800 to-gray-50 dark:to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Credibility Assessment
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Based on content analysis
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${
                    state.result.credibilityScore > 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                    state.result.credibilityScore > 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {state.result.credibilityScore > 70 ? 'High' : 
                     state.result.credibilityScore > 40 ? 'Medium' : 'Low'}
                  </div>
                </div>
                <div className="flex justify-center">
                  <ScoreGauge score={state.result.credibilityScore} />
                </div>
              </motion.div>

              {/* Claims & Sources Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Verified Claims */}
                <motion.div 
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Verified Claims
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {state.result.claims.map((claim, i) => (
                      <motion.div
                        key={i}
                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/20 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700/30"
                        whileHover={{ x: 5 }}
                      >
                        <div className="mt-1 w-2 h-2 bg-green-400 rounded-full" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {claim}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Source Analysis */}
                <motion.div 
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <ExternalLink className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Source Analysis
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {state.result.sources.map((source, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/20 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700/30"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-xs font-medium text-blue-500">●</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {source}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Detailed Analysis */}
              <motion.div 
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Detailed Analysis
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                  {state.result.analysis.split('\n').map((line, i) => (
                    <p key={i} className="mb-3 leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};