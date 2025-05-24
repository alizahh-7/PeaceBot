// 3. Updated ChatAnalysis Component
import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Bot, AlertCircle, Loader2 } from 'lucide-react';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const ChatAnalysis = () => {
  const [analysis, setAnalysis] = useState<{
    content: string | null;
    summary: string | null;
    error: string | null;
    loading: boolean;
  }>({
    content: null,
    summary: null,
    error: null,
    loading: false
  });

  const analyzePageContent = async () => {
    setAnalysis(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // @ts-ignore
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Get page content through service worker
      // @ts-ignore

      const pageContent = await chrome.runtime.sendMessage({
        action: "analyzePageContent",
        tabId: tab.id
      });

      if (!pageContent?.textContent) {
        throw new Error("No content found on this page");
      }

      // Analyze with Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Analyze this web page content for conflict-related information:
      
      Page Title: ${pageContent.metadata.title}
      Content: ${pageContent.textContent.slice(0, 30000)} 

      Provide:
      1. Boolean conflict presence
      2. 3 key points if conflict exists
      3. Source credibility assessment
      
      Format: JSON
      `;

      const result = await model.generateContent(prompt);
      const response = JSON.parse(result.response.text());

      setAnalysis({
        content: pageContent.textContent,
        summary: response,
        error: null,
        loading: false
      });

    } catch (error) {
      setAnalysis({
        content: null,
        summary: null,
        //@ts-ignore
        error: error.message,
        loading: false
      });
    }
  };

  useEffect(() => {
    analyzePageContent();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold">Page Conflict Analysis</h2>
            <p className="text-xs text-gray-400 mt-1">Real-time content scanning</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {analysis.loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : analysis.error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="font-medium mb-2">Analysis Failed</h3>
            <p className="text-sm text-gray-400">{analysis.error}</p>
          </div>
        ) : analysis.summary ? (
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="font-medium mb-2">Page Analysis Result</h3>
              <div className="space-y-2 text-sm">
                    {/* @ts-ignore */}

                <p>Conflict Detected: {analysis.summary.conflictPresence ? 'Yes' : 'No'}</p>
                    {/* @ts-ignore */}

                {analysis.summary.keyPoints && (
                  <ul className="list-disc pl-4 space-y-1">
                    {/* @ts-ignore */}
                    {analysis.summary.keyPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                )}
                <p className="pt-2 border-t border-white/10 mt-2">
                {/* @ts-ignore */}
                  Credibility: {analysis.summary.credibility}/10
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};