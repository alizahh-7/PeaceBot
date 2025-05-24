// Sidebar.tsx
import { motion } from 'framer-motion';
import { Home, AlertCircle, User, FileText, Mail } from 'lucide-react';

export const Sidebar = ({ activeTab, onTabChange }: { 
  activeTab: string, 
  onTabChange: (tab: string) => void 
}) => {
  const menuItems = [
    { icon: <Home size={16} />, label: 'Home' },
    { icon: <AlertCircle size={16} />, label: 'Conflicts' },
    { icon: <User size={16} />, label: 'Profile' },
    { icon: <FileText size={16} />, label: 'Docs' },
    { icon: <Mail size={16} />, label: 'Messages' },
  ];

  return (
    <div className="w-12 bg-white border-r border-gray-100 flex flex-col items-center py-3">
      <div className="mb-4">
        <div className="w-6 h-6 bg-blue-500 rounded-full" />
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onTabChange(item.label)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
              ${activeTab === item.label 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {item.icon}
            </motion.span>
          </button>
        ))}
      </nav>
    </div>
  );
};