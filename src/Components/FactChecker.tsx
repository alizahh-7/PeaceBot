import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

type FactCheckResult = {
  credibilityScore: number;
  claims: string[];
  sources: string[];
  analysis: string;
};

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
        //@ts-ignore
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab?.id) throw new Error('No active tab found');
        //@ts-ignore
        
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.body.innerText
        });
        
        const pageContent = results[0].result.slice(0, 15000);
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analyze this web page content for factual accuracy:
        ${pageContent}

        Respond with JSON format ONLY (no markdown, no extra text):
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

  return (
    <div className="h-[600px] flex flex-col p-4 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="w-6 h-6 text-blue-500 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Fact Check Report
        </h2>
      </div>

      {state.loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : state.error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-red-500 p-4">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-center">{state.error}</p>
        </div>
      ) : state.result ? (
        <div className="flex-1 overflow-y-auto pb-4 pr-2">
          <div className="space-y-4">
            {/* Credibility Score */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Credibility Score
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {state.result.credibilityScore}/100
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${state.result.credibilityScore}%` }}
                />
              </div>
            </div>

            {/* Key Claims */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                Key Claims Verified
              </h3>
              <ul className="list-disc pl-4 space-y-2">
                {state.result.claims.map((claim, i) => (
                  <li 
                    key={i} 
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    {claim}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cited Sources */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                Cited Sources
              </h3>
              <div className="flex flex-wrap gap-2">
                {state.result.sources.map((source, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                Detailed Analysis
              </h3>
              <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {state.result.analysis}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};