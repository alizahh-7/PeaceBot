// Layout.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { ConflictSummaries } from './ConflictSummariser';

export const Layout = () => {
  const [activeTab, setActiveTab] = useState('Conflicts');

  return (
    <div className="flex h-[600px] w-[400px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <motion.main 
        className="flex-1 overflow-y-auto custom-scrollbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {activeTab === 'Conflicts' ? (
          <ConflictSummaries />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-sm"
            >
              Select a feature
            </motion.p>
          </div>
        )}
      </motion.main>
    </div>
  );
};