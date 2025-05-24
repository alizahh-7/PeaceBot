// Layout.tsx
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ConflictSummaries } from './ConflictSummariser';

export const Layout = () => {
  const [activeTab, setActiveTab] = useState('Conflicts');

  return (
    <div className="flex h-[500px] w-[350px] bg-gray-50"> {/* Standard extension size */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 p-4 overflow-auto">
        {activeTab === 'Conflicts' ? (
          <ConflictSummaries />
        ) : (
          <div className="text-sm text-gray-500 p-4 text-center">
            Select a feature
          </div>
        )}
      </main>
    </div>
  );
};