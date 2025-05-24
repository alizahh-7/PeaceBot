// src/components/Sidebar.tsx
import { motion } from 'framer-motion';
import { MessageCircle, AlertCircle, User, Book, ScanEye } from 'lucide-react';

export const Sidebar = ({ 
  activeTab,
  onTabChange,
}: { 
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => {
  const menuItems = [
    { icon: <MessageCircle size={18} />, label: 'chat', component: 'ChatBot' },
    { icon: <AlertCircle size={18} />, label: 'conflicts', component: 'ConflictSummaries' },
    { icon: <User size={18} />, label: 'profile', component: 'Profile' },
    { icon: <Book size={18} />, label: 'docs', component: 'Docs' },
    { icon: <ScanEye size={18} />, label: 'analysis', component: 'ChatAnalysis' },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex flex-col items-center py-4 border-r border-white/10 backdrop-blur-lg w-14">
      <nav className="flex-1 space-y-3 w-full px-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.label}
            onClick={() => onTabChange(item.component)}
            className={`relative w-full flex items-center justify-center p-2 rounded-lg transition-colors
              ${activeTab === item.component 
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-inner-glow'
                : 'hover:bg-white/5'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={`transition-colors ${activeTab === item.component ? 'text-blue-400' : 'text-gray-400'}`}>
              {item.icon}
            </span>
            
            {activeTab === item.component && (
              <motion.div 
                className="absolute -right-1 w-1 h-6 bg-blue-400 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </motion.button>
        ))}
      </nav>
    </div>
  );
};