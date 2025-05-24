// Sidebar.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, AlertCircle, User, FileText, Mail, ChevronLeft } from 'lucide-react';

export const Sidebar = ({ activeTab, onTabChange }: { 
  activeTab: string, 
  onTabChange: (tab: string) => void 
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: <Home size={18} />, label: 'Home' },
    { icon: <AlertCircle size={18} />, label: 'Conflicts' },
    { icon: <User size={18} />, label: 'Profile' },
    { icon: <FileText size={18} />, label: 'Docs' },
    { icon: <Mail size={18} />, label: 'Messages' },
  ];

  return (
    <motion.div
      className={`bg-white border-r border-gray-100 flex flex-col ${collapsed ? 'w-16' : 'w-48'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && <h1 className="text-sm font-semibold text-gray-900">PeaceWorkspace</h1>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className={`transform ${collapsed ? 'rotate-180' : ''}`} size={18} />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onTabChange(item.label)}
            className={`w-full flex items-center p-2 rounded-lg text-sm transition-colors
              ${activeTab === item.label 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span className={`shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'}`}>
              {item.icon}
            </span>
            {!collapsed && (
              <span className="truncate font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>
    </motion.div>
  );
};