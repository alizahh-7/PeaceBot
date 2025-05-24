// ConflictSummaries.tsx
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, BarChart } from 'lucide-react';

const StatsCard = ({ icon, title, value, trend }:any) => (
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
  return (
    <div className="space-y-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Conflict Intelligence
        </h1>
        <p className="text-sm text-gray-400 mt-2">Real-time global conflict monitoring</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatsCard
          icon={<AlertCircle className="w-6 h-6 text-red-400" />}
          title="Active Conflicts"
          value="12"
          trend={{ value: "+2.1%", color: "text-red-400", icon: BarChart }}
        />

        <StatsCard
          icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
          title="Resolutions"
          value="34"
          trend={{ value: "-1.4%", color: "text-green-400", icon: BarChart }}
        />

        <StatsCard
          icon={<Clock className="w-6 h-6 text-yellow-400" />}
          title="Avg. Resolution Time"
          value="18d"
          trend={{ value: "-3.2%", color: "text-yellow-400", icon: BarChart }}
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
    </div>
  );
};