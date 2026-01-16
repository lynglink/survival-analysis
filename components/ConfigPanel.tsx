import React from 'react';
import { AppConfig, TimeUnit } from '../types';
import { Settings, Activity, Users, Clock, AlertCircle } from 'lucide-react';

interface ConfigPanelProps {
  config: AppConfig;
  columns: string[];
  onChange: (newConfig: AppConfig) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, columns, onChange }) => {
  
  const handleChange = (key: keyof AppConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-slate-800">Configuration</h2>
      </div>

      <div className="space-y-6">
        {/* Time Unit */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Time Scale
          </label>
          <select 
            value={config.timeUnit}
            onChange={(e) => handleChange('timeUnit', e.target.value as TimeUnit)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
          >
            {Object.values(TimeUnit).map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        {/* Mortality Column */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            Mortality Column (Event)
          </label>
          <select 
            value={config.eventCol}
            onChange={(e) => handleChange('eventCol', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">Must be binary (1=Dead, 0=Alive).</p>
        </div>

        {/* Group Column */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Users className="w-4 h-4 text-slate-400" />
            Grouping Variable
          </label>
          <select 
            value={config.groupCol}
            onChange={(e) => handleChange('groupCol', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
          >
            <option value="None">None (All Data)</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <hr className="my-4 border-slate-200" />

        {/* Toggles */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Show 95% CI</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={config.showConfInt}
              onChange={(e) => handleChange('showConfInt', e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Show Risk Table</label>
          <label className="relative inline-flex items-center cursor-pointer">
             <input 
              type="checkbox" 
              checked={config.showRiskTable}
              onChange={(e) => handleChange('showRiskTable', e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-md text-xs">
        <h4 className="font-bold flex items-center gap-1 mb-1">
            <Activity className="w-3 h-3" />
            R-SDK Note
        </h4>
        This frontend simulates the logic of <code>survival::survfit</code>. In the production MoveApps node, this UI generates the <code>appspec.json</code> parameters.
      </div>
    </div>
  );
};

export default ConfigPanel;
