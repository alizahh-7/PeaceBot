// Layout.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { ChatAnalysis } from './ChatAnalysis';
import { ConflictSummaries } from './ConflictSummariser'

export const Layout = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'conflicts' | 'other'>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-[600px] w-[400px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] overflow-hidden relative">
      {/* Sidebar */}
      <motion.div
        className={`${sidebarOpen ? 'w-14' : 'w-0'} transition-all duration-300`}
        animate={{ width: sidebarOpen ? 56 : 0 }}
      >
        <Sidebar 
          activeTab={activeTab}
          //@ts-ignore
          onTabChange={setActiveTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </motion.div>

      {/* Main Content */}
      <motion.main 
        className="flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {activeTab === 'chat' ? (
          <ChatAnalysis />
        ) : activeTab === 'conflicts' ? (
          <ConflictSummaries />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-sm">Coming soon</p>
          </div>
        )}
      </motion.main>
    </div>
  );
};