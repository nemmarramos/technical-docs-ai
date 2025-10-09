import { useEffect } from 'react';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { useCostAnalytics } from '../hooks/useApi';

export function CostTracker() {
  const { analytics, loadAnalytics } = useCostAnalytics();

  useEffect(() => {
    const interval = setInterval(() => {
      loadAnalytics();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadAnalytics]);

  if (!analytics) {
    return null;
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Cost Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Total Queries</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.totalQueries}</div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            ${analytics.totalCost.toFixed(4)}
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Avg per Query</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            ${analytics.averageCostPerQuery.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Search Cost:</span>
          <span className="text-white">${analytics.breakdown.searchCost.toFixed(4)}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-400">LLM Cost:</span>
          <span className="text-white">${analytics.breakdown.llmCost.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}
