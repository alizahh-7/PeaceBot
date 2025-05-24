// ConflictSummaries.tsx
import { AlertCircle, CheckCircle } from 'lucide-react';

export const ConflictSummaries = () => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Conflict Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Real-time monitoring and resolution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-xs">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-medium text-gray-900">Active Incidents</h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">All systems operational</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-xs">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-base font-medium text-gray-900">Resolutions</h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-green-50 rounded-md">
              <p className="text-sm text-green-700">No recent resolutions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-5 rounded-lg border border-gray-100 shadow-xs">
        <h3 className="text-base font-medium text-gray-900 mb-4">Incident Timeline</h3>
        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      </div>
    </div>
  );
};