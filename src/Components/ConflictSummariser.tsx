
import { AlertCircle, CheckCircle } from 'lucide-react';

export const ConflictSummaries = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conflict Management</h2>
          <p className="mt-1 text-sm text-gray-500">Monitor and resolve conflicts in your workspace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Active Conflicts</h3>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">No active conflicts to display.</p>
            <div className="h-32 flex items-center justify-center bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600">All clear! No conflicts detected.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Resolved Conflicts</h3>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">Historical record of resolved conflicts.</p>
            <div className="h-32 flex items-center justify-center bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">No resolved conflicts in history.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}