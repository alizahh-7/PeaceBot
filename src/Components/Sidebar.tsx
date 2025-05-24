
import { motion } from 'framer-motion';
import { Home, Settings, User, FileText, Mail } from 'lucide-react';

export const Sidebar = () => {
  const menuItems = [
    { icon: <Home size={20} />, label: 'Home' },
    { icon: <Settings size={20} />, label: 'Settings' },
    { icon: <User size={20} />, label: 'Profile' },
    { icon: <FileText size={20} />, label: 'Documents' },
    { icon: <Mail size={20} />, label: 'Messages' },
  ];

  return (
    <motion.div
      className="w-64 bg-white shadow-md h-full"
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
      </div>
      <nav className="p-4">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 cursor-not-allowed opacity-50 mb-2"
          >
            <span className="text-gray-500">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </nav>
    </motion.div>
  );
};