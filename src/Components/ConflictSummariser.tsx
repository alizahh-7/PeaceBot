import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, BarChart, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY2 || '');

type ConflictStats = {
  activeConflicts: number;
  resolutions: number;
  avgResolutionTime: string;
  trends: {
    active: { value: string; direction: 'up' | 'down' };
    resolutions: { value: string; direction: 'up' | 'down' };
    resolutionTime: { value: string; direction: 'up' | 'down' };
  };
};

const StatsCard = ({ icon, title, value, trend }: any) => (
  <motion.div 
    className="bg-gradient-to-br from-[#1e1e1e] to-[#151515] p-5 rounded-2xl border border-white/5 shadow-xl"
    whileHover={{ y: -2 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-white/5 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-2xl font-semibold text-white mt-1">{value}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className={`${trend.color}`}>{trend.value}</span>
      <trend.icon className={`w-4 h-4 ${trend.color}`} />
    </div>
  </motion.div>
);

export const ConflictSummaries = () => {
  const [stats, setStats] = useState<ConflictStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConflictData = async () => {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const prompt = `Provide current global conflict statistics in this JSON format:
        {
          "activeConflicts": number,
          "resolutions": number,
          "avgResolutionTime": string,
          "trends": {
            "active": { "value": string, "direction": "up"|"down" },
            "resolutions": { "value": string, "direction": "up"|"down" },
            "resolutionTime": { "value": string, "direction": "up"|"down" }
          }
        }
        Include real recent data and meaningful trends.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const data = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
        setStats(data);
      } catch (err) {
        setError('Failed to load conflict data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchConflictData();
  }, []);

  const getTrendData = (trend: { value: string; direction: 'up' | 'down' }) => ({
    value: `${trend.value}%`,
    color: trend.direction === 'up' ? 'text-red-400' : 'text-green-400',
    icon: BarChart
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 p-4 text-center">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="h-[600px] overflow-y-auto px-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Conflict Intelligence
        </h1>
        <p className="text-sm text-gray-400 mt-2">Real-time global conflict monitoring</p>
      </motion.div>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StatsCard
              icon={<AlertCircle className="w-6 h-6 text-red-400" />}
              title="Active Conflicts"
              value={stats.activeConflicts}
              trend={getTrendData(stats.trends.active)}
            />

            <StatsCard
              icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
              title="Resolutions"
              value={stats.resolutions}
              trend={getTrendData(stats.trends.resolutions)}
            />

            <StatsCard
              icon={<Clock className="w-6 h-6 text-yellow-400" />}
              title="Avg. Resolution Time"
              value={stats.avgResolutionTime}
              trend={getTrendData(stats.trends.resolutionTime)}
            />
          </div>

          <motion.div 
            className="bg-gradient-to-br from-[#1e1e1e] to-[#151515] p-5 rounded-2xl border border-white/5 shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Conflict Map</h3>
              <span className="text-sm text-blue-400">Live Feed</span>
            </div>
            <div className="h-48 bg-gradient-to-br from-black/30 to-[#121212] rounded-xl border border-white/5 flex items-center justify-center">
              <p className="text-sm text-gray-500">Global heatmap visualization</p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};