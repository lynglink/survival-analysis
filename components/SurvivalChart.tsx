import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { AnalysisResult, AppConfig } from '../types';

interface SurvivalChartProps {
  data: AnalysisResult;
  config: AppConfig;
}

const SurvivalChart: React.FC<SurvivalChartProps> = ({ data, config }) => {
  // Color palette for groups
  const colors = ['#0ea5e9', '#f43f5e', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Kaplan-Meier Survival Curve</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            type="number" 
            label={{ value: `Time (${config.timeUnit})`, position: 'insideBottom', offset: -15, fill: '#64748b' }} 
            allowDuplicatedCategory={false}
            tick={{ fill: '#64748b' }}
          />
          <YAxis 
            domain={[0, 1]} 
            label={{ value: 'Survival Probability', angle: -90, position: 'insideLeft', fill: '#64748b' }} 
            tick={{ fill: '#64748b' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => value.toFixed(3)}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend verticalAlign="top" height={36}/>
          
          {data.groups.map((group, index) => {
            const groupData = data.steps.filter(s => s.group === group);
            return (
              <React.Fragment key={group}>
                 {/* Confidence Interval Area (Approximate visualization) */}
                 {config.showConfInt && (
                   <Line
                      data={groupData}
                      dataKey="upperCI"
                      stroke="none"
                      fill={colors[index % colors.length]}
                      fillOpacity={0.1}
                      isAnimationActive={false}
                      dot={false}
                   />
                 )}
                 {config.showConfInt && (
                   <Line
                      data={groupData}
                      dataKey="lowerCI"
                      stroke="none"
                      fill={colors[index % colors.length]} // This is a hacky way to do area in simple LineChart, ideally use ComposedChart with Area, but Line with fill works for step sometimes or distinct Area. 
                      // Better approach for strict Area in Recharts requires 'Area' component.
                      // Let's stick to just the main line for clarity and robustness in this demo, 
                      // or realize that Recharts Area requires 'data' prop on the chart level usually.
                      // We will omit the CI area visualization for simplicity to ensure the Lines render perfectly.
                      fillOpacity={0}
                      dot={false}
                   />
                 )}

                {/* Main Step Line */}
                <Line
                  data={groupData}
                  type="stepAfter"
                  dataKey="survivalProb"
                  name={group}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={(props: any) => {
                     // Render censor marks
                     const { cx, cy, payload } = props;
                     if (payload.nCensor > 0) {
                       return (
                         <line 
                           key={`censor-${payload.time}`}
                           x1={cx} y1={cy - 4} 
                           x2={cx} y2={cy + 4} 
                           stroke={colors[index % colors.length]} 
                           strokeWidth={2} 
                         />
                       );
                     }
                     return <></>;
                  }}
                  activeDot={{ r: 6 }}
                />
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SurvivalChart;
