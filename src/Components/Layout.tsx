// src/components/Layout.tsx
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatBot } from './ChatBot';
import { ChatAnalysis } from './ChatAnalysis';
import { ConflictSummaries } from './ConflictSummariser';

export const Layout = () => {
  const [activeTab, setActiveTab] = useState('ChatBot');

  const renderComponent = () => {
    switch(activeTab) {
      case 'ChatBot': return <ChatBot />;
      case 'ConflictSummaries': return <ConflictSummaries />;
      case 'ChatAnalysis': return <ChatAnalysis />;
      default: return <ChatBot />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-hidden">
        {renderComponent()}
      </main>
    </div>
  );
};