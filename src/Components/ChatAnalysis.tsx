// ==== src/components/ChatAnalysis.tsx ====
import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2, AlertCircle, Bot, Shield, CheckCircle } from 'lucide-react';

type AnalysisResult = {
  conflictDetected: boolean;
  keyPoints: string[];
  credibilityScore: number;
  summary: string;
};

type PageContent = {
  title: string;
  content: string;
  url: string;
};

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'demo-key');

export const ChatAnalysis = () => {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    analysis: AnalysisResult | null;
    pageContent: PageContent | null;
  }>({
    loading: true,
    error: null,
    analysis: null,
    pageContent: null
  });

  const fetchPageContent = async (): Promise<PageContent> => {
    return new Promise((resolve, reject) => {
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout - page content fetch took too long'));
      }, 10000); // 10 second timeout

      try {
        console.log('Requesting page content...');
        //@ts-ignore
        chrome.runtime.sendMessage(
          { action: "getPageContent" },
          (response: PageContent | { error: string }) => {
            clearTimeout(timeout);
            
            console.log('Received response:', response);
        //@ts-ignore
            
            if (chrome.runtime.lastError) {
        //@ts-ignore

              console.error('Chrome runtime error:', chrome.runtime.lastError);
        //@ts-ignore

              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            
            if (!response) {
              reject(new Error('No response received from background script'));
              return;
            }
            
            if ('error' in response) {
              reject(new Error(response.error));
              return;
            }
            
            // Validate response structure
            if (!response.title && !response.content && !response.url) {
              reject(new Error('Invalid response format'));
              return;
            }
            
            resolve(response as PageContent);
          }
        );
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error(`Message sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  };

  const analyzeContent = async (content: string): Promise<AnalysisResult> => {
    try {
      // Check if we have a valid API key
      if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'demo-key') {
        // Return mock analysis for demo
        return {
          conflictDetected: content.toLowerCase().includes('conflict') || content.toLowerCase().includes('war'),
          keyPoints: [
            'Content analysis completed using demo mode',
            'To enable full AI analysis, add your Gemini API key to VITE_GEMINI_API_KEY',
            content.length > 100 ? 'Substantial content detected for analysis' : 'Limited content available'
          ],
          credibilityScore: Math.floor(Math.random() * 4) + 6, // Random score 6-10
          summary: `Analyzed ${content.length} characters of content. ${content.toLowerCase().includes('news') ? 'News content detected.' : 'General web content.'} Configure API key for detailed AI analysis.`
        };
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Analyze this web page content for conflict-related information, misinformation, or peace-building opportunities:

Content to analyze:
${content.slice(0, 15000)}

Please respond with a valid JSON object in this exact format:
{
  "conflictDetected": boolean,
  "keyPoints": ["point1", "point2", "point3"],
  "credibilityScore": number_between_1_and_10,
  "summary": "brief_summary_of_analysis"
}

Focus on:
- Whether the content discusses conflicts, wars, or violence
- Credibility and potential misinformation
- Opportunities for peace-building or constructive dialogue
- Overall tone and bias assessment`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Clean up the response
      const cleanedResponse = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
      
      console.log('AI Response:', cleanedResponse);
      
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (typeof parsed.conflictDetected !== 'boolean' ||
          !Array.isArray(parsed.keyPoints) ||
          typeof parsed.credibilityScore !== 'number' ||
          typeof parsed.summary !== 'string') {
        throw new Error('Invalid AI response format');
      }
      
      return parsed;
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    const processAnalysis = async () => {
      try {
        console.log('Starting content analysis...');
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const pageContent = await fetchPageContent();
        console.log('Page content fetched:', pageContent.title);
        
        if (!pageContent.content || pageContent.content.trim().length < 10) {
          throw new Error('Page content is too short or empty for meaningful analysis');
        }

        setState(prev => ({ ...prev, pageContent }));
        
        const analysis = await analyzeContent(pageContent.content);
        console.log('Analysis completed:', analysis);
        
        setState({
          loading: false,
          error: null,
          analysis,
          pageContent
        });
        
      } catch (error) {
        console.error('Process analysis error:', error);
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          analysis: null,
          pageContent: null
        });
      }
    };

    processAnalysis();
  }, []);

  const retryAnalysis = () => {
    setState(prev => ({ ...prev, loading: true, error: null, analysis: null }));
    // Trigger re-analysis by calling useEffect logic
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="h-[500px] flex flex-col p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          PeaceBot Analysis
        </h2>
      </div>

      {state.loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Analyzing page content...
          </p>
        </div>
      ) : state.error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
          <p className="text-red-600 dark:text-red-400 mb-4">
            {state.error}
          </p>
          <button 
            onClick={retryAnalysis}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      ) : state.analysis ? (
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Page Info */}
          {state.pageContent && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {state.pageContent.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {state.pageContent.url}
              </p>
            </div>
          )}

          {/* Analysis Results */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              {state.analysis.conflictDetected ? (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              <h3 className="font-medium text-gray-900 dark:text-white">
                {state.analysis.conflictDetected ? 'Conflict-Related Content Detected' : 'No Conflict Content Found'}
              </h3>
            </div>
            
            {state.analysis.keyPoints.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Points:
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {state.analysis.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Credibility Score: {state.analysis.credibilityScore}/10
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(state.analysis.credibilityScore / 10) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {state.analysis.summary}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};