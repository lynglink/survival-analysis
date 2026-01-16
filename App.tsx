import React, { useState, useEffect, useMemo } from 'react';
import { UploadCloud, FileText, Play, BrainCircuit, Sparkles, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ConfigPanel from './components/ConfigPanel';
import SurvivalChart from './components/SurvivalChart';
import RiskTable from './components/RiskTable';
import { DataPoint, AppConfig, TimeUnit, AnalysisResult } from './types';
import { calculateKaplanMeier, generateMockData } from './services/survivalLogic';
import { generateBiologicalReport } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [rawData, setRawData] = useState<DataPoint[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [aiReport, setAiReport] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const [config, setConfig] = useState<AppConfig>({
    timeUnit: TimeUnit.DAYS,
    eventCol: 'status',
    groupCol: 'age_class',
    showConfInt: true,
    showRiskTable: true,
  });

  // Init with Mock Data
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const data = generateMockData();
    setRawData(data);
    setColumns(Object.keys(data[0]));
    setFileName('sample_wildlife_tracking.csv');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Very basic CSV parser for demo
      const lines = text.split('\n').filter(l => l.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const parsedData: DataPoint[] = lines.slice(1).map((line, idx) => {
        const values = line.split(',');
        const obj: DataPoint = { id: `row_${idx}` };
        headers.forEach((h, i) => {
          const val = values[i]?.trim();
          obj[h] = isNaN(Number(val)) ? val : Number(val);
        });
        return obj;
      });

      setRawData(parsedData);
      setColumns(headers);
      
      // Intelligent Defaults
      const potentialEvent = headers.find(h => h.toLowerCase().includes('status') || h.toLowerCase().includes('dead') || h.toLowerCase().includes('event')) || headers[0];
      const potentialGroup = headers.find(h => h.toLowerCase().includes('sex') || h.toLowerCase().includes('age') || h.toLowerCase().includes('group')) || 'None';
      
      setConfig(prev => ({
        ...prev,
        eventCol: potentialEvent,
        groupCol: potentialGroup
      }));
    };
    reader.readAsText(file);
  };

  // Run Analysis when Config or Data changes
  useEffect(() => {
    if (rawData.length === 0) return;

    // Detect if we have a valid time column. For move2, usually 'deploy_duration' or derived from timestamps.
    // For this simulator, we assume a 'deploy_duration' or similar numeric column exists or use the first numeric col.
    const timeCol = columns.find(c => c.includes('duration') || c.includes('time')) || columns.find(c => typeof rawData[0][c] === 'number' && c !== config.eventCol);
    
    if (timeCol) {
      const res = calculateKaplanMeier(
        rawData,
        timeCol,
        config.eventCol,
        config.groupCol,
        config.timeUnit
      );
      setResult(res);
      setAiReport(''); // Clear old report
    }
  }, [rawData, config, columns]);

  const handleAiAnalysis = async () => {
    if (!result) return;
    setIsAiLoading(true);
    const context = `Groups: ${config.groupCol}, Time Unit: ${config.timeUnit}, Event Column: ${config.eventCol}`;
    const report = await generateBiologicalReport(result, context);
    setAiReport(report);
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <ActivityIcon className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">MoveApps Survival Estimator</h1>
              <p className="text-xs text-indigo-300 opacity-80">R-SDK v2 Compliant Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <label className="cursor-pointer bg-indigo-700 hover:bg-indigo-600 transition px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium">
               <UploadCloud className="w-4 h-4" />
               Upload CSV
               <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
             </label>
             {fileName && <span className="text-xs bg-indigo-800 px-2 py-1 rounded text-indigo-200 flex gap-1"><FileText size={14}/> {fileName}</span>}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
          
          {/* Left Sidebar: Configuration */}
          <div className="lg:col-span-1">
            <ConfigPanel config={config} columns={columns} onChange={setConfig} />
            
            {/* AI Action Button */}
            <div className="mt-6">
                <button
                    onClick={handleAiAnalysis}
                    disabled={!result || isAiLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-4 rounded-lg shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {isAiLoading ? (
                        <span className="animate-pulse">Loading Example...</span>
                    ) : (
                        <>
                            <BookOpen className="w-5 h-5" />
                            Load Example Report
                        </>
                    )}
                </button>
            </div>
          </div>

          {/* Right Content: Visualization */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Survival Plot */}
            {result ? (
              <SurvivalChart data={result} config={config} />
            ) : (
               <div className="w-full h-[400px] bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                  Data not loaded
               </div>
            )}

            {/* AI Report Section */}
            {aiReport && (
                <div className="bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-100 p-6 rounded-xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <BrainCircuit className="w-5 h-5 text-emerald-600"/>
                        </div>
                        Biological Interpretation (Example)
                        <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                           <Sparkles size={10} />
                           Static Demo
                        </span>
                    </h3>
                    
                    <div className="text-slate-700 relative z-10">
                         <ReactMarkdown 
                            components={{
                                h1: ({node, ...props}) => <h4 className="text-lg font-bold text-slate-900 mt-5 mb-2 border-b border-emerald-100 pb-1" {...props} />,
                                h2: ({node, ...props}) => <h5 className="text-md font-bold text-slate-900 mt-4 mb-2" {...props} />,
                                h3: ({node, ...props}) => <h6 className="text-sm font-bold text-slate-800 mt-3 mb-1 uppercase tracking-wide" {...props} />,
                                strong: ({node, ...props}) => <span className="font-semibold text-slate-900 bg-emerald-50/80 px-1 rounded" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-none space-y-2 my-3" {...props} />,
                                li: ({node, ...props}) => (
                                    <li className="flex items-start gap-2 text-sm leading-relaxed" {...props}>
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                                        <span className="flex-1">{props.children}</span>
                                    </li>
                                ),
                                p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-sm last:mb-0" {...props} />
                            }}
                         >
                            {aiReport}
                         </ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Risk Table */}
            {config.showRiskTable && result && (
              <RiskTable data={result} />
            )}
            
            {/* Footer Metadata */}
            <div className="text-center text-xs text-slate-400 mt-12 pb-8">
                Powered by MoveApps R-SDK Architecture &bull; React 18 &bull; Static Demo
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Icon Component
const ActivityIcon = ({ className }: { className?: string }) => (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

export default App;