import React from 'react';
import { AnalysisResult } from '../types';

interface RiskTableProps {
  data: AnalysisResult;
}

const RiskTable: React.FC<RiskTableProps> = ({ data }) => {
  // Aggregate unique time points for table headers (limit to reasonable number for UI)
  // Explicitly type sort parameters to fix arithmetic operation error
  const allTimes = Array.from(new Set(data.steps.map(s => s.time))).sort((a: number, b: number) => a - b);
  
  // Sample times if too many to display
  const displayTimes = allTimes.length > 10 
    ? allTimes.filter((_, i) => i === 0 || i % Math.ceil(allTimes.length / 10) === 0 || i === allTimes.length - 1) 
    : allTimes;

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-slate-200 mt-4 overflow-x-auto">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Number at Risk</h3>
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 font-bold">Group</th>
            {displayTimes.map(t => (
              <th key={t} className="px-4 py-3">T={t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.groups.map(group => (
            <tr key={group} className="bg-white border-b hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">{group}</td>
              {displayTimes.map(t => {
                // Find step at or immediately before T
                const step = data.steps
                  .filter(s => s.group === group && s.time <= t)
                  .pop();
                return (
                  <td key={t} className="px-4 py-3">
                    {step ? step.nRisk : 0}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiskTable;