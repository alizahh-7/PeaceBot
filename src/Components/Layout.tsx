// Layout.tsx
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ConflictSummaries } from './ConflictSummariser';

export const Layout = () => {
  const [activeTab, setActiveTab] = useState('Conflicts');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'Conflicts' ? (
            <ConflictSummaries />
          ) : (
            <div className="p-8 text-center text-gray-500">
              Feature coming soon
            </div>
          )}
        </div>
      </main>
    </div>
  );
};