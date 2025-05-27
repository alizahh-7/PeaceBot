// FactChecker.tsx
import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export const FactChecker = () => {
  const [state, setState] = useState({
    loading: true,
    error: null as string | null,
    credibilityScore: 0,
    claims: [] as string[],
    sources: [] as string[],
    analysis: '',
  });

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

        Respond with JSON format:
        {
          "credibilityScore": 0-100,
          "claims": ["claim1", "claim2", "claim3"],
          "sources": ["source1.com", "source2.org"],
          "analysis": "detailed summary"
        }`;

        const result = await model.generateContent(prompt);
        const response = JSON.parse(result.response.text());

        setState({
          loading: false,
          error: null,
          credibilityScore: response.credibilityScore,
          claims: response.claims,
          sources: response.sources,
          analysis: response.analysis
        });
      } catch (error) {
        setState({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : 'Fact check failed'
        });
      }
    };

    analyzePage();
  }, []);

  return (
    <div className="h-full flex flex-col p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-6 h-6 text-green-500" />
        <h2 className="text-lg font-semibold">Fact Check Report</h2>
      </div>

      {state.loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : state.error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p>{state.error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Credibility Score</span>
              <span className="font-medium">{state.credibilityScore}/100</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${state.credibilityScore}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Key Claims Verified</h3>
            <ul className="list-disc pl-4 space-y-2">
              {state.claims.map((claim, i) => (
                <li key={i} className="text-sm">{claim}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Cited Sources</h3>
            <div className="flex flex-wrap gap-2">
              {state.sources.map((source, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Detailed Analysis</h3>
            <p className="text-sm whitespace-pre-wrap">{state.analysis}</p>
          </div>
        </div>
      )}
    </div>
  );
};