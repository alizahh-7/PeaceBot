// Sidebar.tsx
import { motion } from 'framer-motion';
import { Home, AlertCircle, User, FileText, Mail, Settings } from 'lucide-react';

export const Sidebar = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { icon: <Home className="w-4 h-4" />, label: 'Home' },
    { icon: <AlertCircle className="w-4 h-4" />, label: 'Conflicts' },
    { icon: <User className="w-4 h-4" />, label: 'Profile' },
    { icon: <FileText className="w-4 h-4" />, label: 'Docs' },
    { icon: <Settings className="w-4 h-4" />, label: 'Settings' },
  ];

  return (
    <motion.div 
      className="w-14 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex flex-col items-center py-4 border-r border-white/10 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mb-6">
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">PW</span>
        </div>
      </div>

      <nav className="flex-1 space-y-4">
        {menuItems.map((item) => (
          <motion.button
            key={item.label}
            onClick={() => onTabChange(item.label)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all
              ${activeTab === item.label 
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-inner-glow'
                : 'hover:bg-white/5'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={`transition-colors ${activeTab === item.label ? 'text-blue-400' : 'text-gray-400'}`}>
              {item.icon}
            </span>
            {activeTab === item.label && (
              <motion.div 
                className="absolute -right-1 w-1 h-6 bg-blue-400 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </motion.button>
        ))}
      </nav>
    </motion.div>
  );
};