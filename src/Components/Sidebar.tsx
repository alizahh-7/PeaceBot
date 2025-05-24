import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, AlertCircle, User, FileText, Mail } from 'lucide-react';

export const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Home');

  const menuItems = [
    { icon: <Home size={20} />, label: 'Home' },
    { icon: <AlertCircle size={20} />, label: 'Conflicts' },
    { icon: <User size={20} />, label: 'Profile' },
    { icon: <FileText size={20} />, label: 'Documents' },
    { icon: <Mail size={20} />, label: 'Messages' },
  ];

  return (
    <motion.div
      className="w-56 bg-white shadow-lg h-full flex flex-col"
      initial={{ x: -224 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveItem(item.label)}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-gray-700 transition-all duration-200 
                     hover:bg-gray-50 ${activeItem === item.label ? 'bg-blue-50 text-blue-600' : ''}`}
          >
            <span className={`${activeItem === item.label ? 'text-blue-600' : 'text-gray-500'} transition-colors duration-200`}>
              {item.icon}
            </span>
            <span className="font-medium ml-3 text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">User Session</p>
            <p className="text-xs text-gray-500">Workspace</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}