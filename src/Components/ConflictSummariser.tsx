// CompactConflictSummaries.tsx
import { AlertCircle, CheckCircle } from 'lucide-react';

export const ConflictSummaries = () => {
  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h2 className="text-sm font-semibold text-gray-900">Conflict Monitor</h2>
      </div>

      <div className="space-y-3">
        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium">Active Issues</span>
          </div>
          <div className="mt-2 text-xs text-gray-600">No current conflicts detected</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium">Resolved</span>
          </div>
          <div className="mt-2 text-xs text-gray-600">3 issues closed last week</div>
        </div>
      </div>

      <div className="mt-4 bg-white p-3 rounded-lg border border-gray-100">
        <div className="text-xs font-medium text-gray-900 mb-2">Activity</div>
        <div className="text-xs text-gray-500">No recent updates</div>
      </div>
    </div>
  );
};