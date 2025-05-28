import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {  Globe, HeartHandshake, BarChart4, Leaf, Sparkles,  Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'demo-key');

type PeaceImpact = {
  peaceScore: number;
  conflictResolutionPotential: number;
  impactAreas: {
    diplomacy: number;
    humanitarian: number;
    education: number;
    economic: number;
  };
  projectedOutcomes: string[];
  visualizationPrompt: string;
};

type AnalysisResult = {
  conflictDetected: boolean;
  peaceImpact: PeaceImpact;
  keyOpportunities: string[];
  summary: string;
};

type PageContent = {
  title: string;
  content: string;
  url: string;
};

const generateDiamondVisualization = (impact: PeaceImpact) => {
  const { diplomacy, humanitarian, education, economic } = impact.impactAreas;
  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Diamond shape */}
        <polygon 
          points="100,20 180,100 100,180 20,100" 
          fill="url(#diamondGradient)" 
          stroke="#4F46E5" 
          strokeWidth="2"
        />
        
        {/* Impact points */}
        <motion.circle
          cx={100 + diplomacy * 6} 
          cy={100 - diplomacy * 6} 
          r={8}
          fill="#10B981"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <title>Diplomacy: {diplomacy}/10</title>
        </motion.circle>
        
        <motion.circle
          cx={100 - humanitarian * 6} 
          cy={100 - humanitarian * 6} 
          r={8}
          fill="#3B82F6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <title>Humanitarian: {humanitarian}/10</title>
        </motion.circle>
        
        <motion.circle
          cx={100} 
          cy={100 + education * 6} 
          r={8}
          fill="#8B5CF6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <title>Education: {education}/10</title>
        </motion.circle>
        
        <motion.circle
          cx={100 + economic * 6} 
          cy={100} 
          r={8}
          fill="#F59E0B"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <title>Economic: {economic}/10</title>
        </motion.circle>
        
        <defs>
          <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const ImpactMeter = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}/10</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <motion.div 
        className={`h-2.5 rounded-full`}
        style={{ backgroundColor: color, width: `${value * 10}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value * 10}%` }}
        transition={{ duration: 1 }}
      />
    </div>
  </div>
);

export const PeaceImpactAnalysis = () => {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    analysis: AnalysisResult | null;
    pageContent: PageContent | null;
    generatedImage: string | null;
  }>({
    loading: true,
    error: null,
    analysis: null,
    pageContent: null,
    generatedImage: null
  });

  const fetchPageContent = async (): Promise<PageContent> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout - page content fetch took too long'));
      }, 10000);

      try {
        //@ts-ignore
        chrome.runtime.sendMessage(
          { action: "getPageContent" },
          (response: PageContent | { error: string }) => {
            clearTimeout(timeout);
            //@ts-ignore
            if (chrome.runtime.lastError) {
              //@ts-ignore
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            
            if (!response || 'error' in response) {
              reject(new Error(response?.error || 'No response received'));
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
      // Demo mode handling
      if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'demo-key') {
        return {
          conflictDetected: Math.random() > 0.5,
          peaceImpact: {
            peaceScore: Math.floor(Math.random() * 40) + 60,
            conflictResolutionPotential: Math.floor(Math.random() * 7) + 3,
            impactAreas: {
              diplomacy: Math.floor(Math.random() * 8) + 2,
              humanitarian: Math.floor(Math.random() * 8) + 2,
              education: Math.floor(Math.random() * 8) + 2,
              economic: Math.floor(Math.random() * 8) + 2
            },
            projectedOutcomes: [
              'Potential to reduce violence by 35% in affected regions',
              'Could foster diplomatic relations between conflicting parties',
              'May create economic opportunities for 50,000 people'
            ],
            visualizationPrompt: 'A vibrant tree growing from a cracked battlefield with diverse hands watering it'
          },
          keyOpportunities: [
            'Mention of community dialogue programs',
            'References to economic development initiatives',
            'Educational exchange proposals'
          ],
          summary: 'This content shows strong potential for peace-building through multiple approaches.'
        };
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Perform a comprehensive peace impact analysis of this content:

      Content:
      ${content.slice(0, 15000)}
      
      Respond with JSON in this exact structure:
      {
        "conflictDetected": boolean,
        "peaceImpact": {
          "peaceScore": number_0_to_100,
          "conflictResolutionPotential": number_1_to_10,
          "impactAreas": {
            "diplomacy": number_1_to_10,
            "humanitarian": number_1_to_10,
            "education": number_1_to_10,
            "economic": number_1_to_10
          },
          "projectedOutcomes": ["outcome1", "outcome2", "outcome3"],
          "visualizationPrompt": "description_for_peace_visualization_image"
        },
        "keyOpportunities": ["opportunity1", "opportunity2", "opportunity3"],
        "summary": "brief_summary_of_peace_impact"
      }
      
      Analysis should focus on:
      - Potential for conflict resolution and peace-building
      - Impact across diplomatic, humanitarian, educational, and economic dimensions
      - Visual metaphor representing the peace-building potential
      - Actionable opportunities for peace enhancement`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const cleanedResponse = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
      
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generatePeaceVisualization = async (prompt: string) => {
    if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'demo-key') {
      return null;
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      //@ts-ignore
      const result = await model.generateContent(`Generate a base64 encoded image that visually represents this peace-building concept: ${prompt}`);
      
      // Gemini doesn't directly return images, so we simulate a generated image
      return `data:image/svg+xml;base64,...simulated-image-data...`;
    } catch (error) {
      console.error('Image generation failed:', error);
      return null;
    }
  };

  useEffect(() => {
    const processAnalysis = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const pageContent = await fetchPageContent();
        if (!pageContent.content || pageContent.content.trim().length < 10) {
          throw new Error('Page content is too short for meaningful analysis');
        }

        const analysis = await analyzeContent(pageContent.content);
        let generatedImage = null;
        
        if (analysis.peaceImpact.visualizationPrompt) {
          generatedImage = await generatePeaceVisualization(analysis.peaceImpact.visualizationPrompt);
        }
        
        setState({
          loading: false,
          error: null,
          analysis,
          pageContent,
          generatedImage
        });
        
      } catch (error) {
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          analysis: null,
          pageContent: null,
          generatedImage: null
        });
      }
    };

    processAnalysis();
  }, []);

  const retryAnalysis = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="h-[600px] flex flex-col bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <HeartHandshake className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Peace Impact Analysis
        </h2>
      </div>

      {state.loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Globe className="w-12 h-12 text-blue-500" />
          </motion.div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">
            Scanning for peace-building potential...
          </p>
        </div>
      ) : state.error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4 px-4">
            {state.error}
          </p>
          <button 
            onClick={retryAnalysis}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry Analysis
          </button>
        </div>
      ) : state.analysis ? (
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Peace Impact Score */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-block p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Peace Impact Score
            </h3>
            <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {state.analysis.peaceImpact.peaceScore}/100
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {state.analysis.peaceImpact.peaceScore > 70 
                ? "High potential for positive peace-building impact" 
                : state.analysis.peaceImpact.peaceScore > 40 
                  ? "Moderate peace-building potential" 
                  : "Limited peace-building opportunities detected"}
            </p>
          </motion.div>

          {/* Impact Diamond Visualization */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart4 className="w-5 h-5 text-purple-500" />
              Peace Impact Dimensions
            </h3>
            {generateDiamondVisualization(state.analysis.peaceImpact)}
          </motion.div>

          {/* Impact Areas Breakdown */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Impact Area Analysis
            </h3>
            <ImpactMeter 
              value={state.analysis.peaceImpact.impactAreas.diplomacy} 
              label="Diplomacy Potential" 
              color="#10B981" 
            />
            <ImpactMeter 
              value={state.analysis.peaceImpact.impactAreas.humanitarian} 
              label="Humanitarian Impact" 
              color="#3B82F6" 
            />
            <ImpactMeter 
              value={state.analysis.peaceImpact.impactAreas.education} 
              label="Educational Value" 
              color="#8B5CF6" 
            />
            <ImpactMeter 
              value={state.analysis.peaceImpact.impactAreas.economic} 
              label="Economic Potential" 
              color="#F59E0B" 
            />
          </motion.div>

          {/* Projected Outcomes */}
          {state.analysis.peaceImpact.projectedOutcomes.length > 0 && (
            <motion.div 
              className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Potential Peace Outcomes
              </h3>
              <ul className="space-y-3">
                {state.analysis.peaceImpact.projectedOutcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-gray-700 dark:text-gray-300">{outcome}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Key Opportunities */}
          {state.analysis.keyOpportunities.length > 0 && (
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Key Peace Opportunities
              </h3>
              <div className="space-y-3">
                {state.analysis.keyOpportunities.map((opportunity, i) => (
                  <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <p className="text-gray-700 dark:text-gray-300">{opportunity}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ) : null}
    </div>
  );
};