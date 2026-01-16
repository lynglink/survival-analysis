import { DataPoint, TimeUnit, SurvivalStep, AnalysisResult } from '../types';

/**
 * Simulates R's survival::survfit logic
 */
export const calculateKaplanMeier = (
  data: DataPoint[],
  timeCol: string,
  eventCol: string,
  groupCol: string,
  timeUnit: TimeUnit
): AnalysisResult => {
  
  // 1. Group Data
  const groupedData: Record<string, DataPoint[]> = {};
  
  if (!groupCol || groupCol === 'None') {
    groupedData['All Data'] = data;
  } else {
    data.forEach(d => {
      const group = String(d[groupCol] || 'Unknown');
      if (!groupedData[group]) groupedData[group] = [];
      groupedData[group].push(d);
    });
  }

  const allSteps: SurvivalStep[] = [];
  const groups = Object.keys(groupedData);

  // 2. Process each group
  groups.forEach(group => {
    const groupRows = groupedData[group];
    
    // Convert time and sort
    const cleanRows = groupRows.map(r => {
      let t = Number(r[timeCol]);
      
      // Simple unit conversion approximation for demo purposes
      // Assuming input is always treated as "raw units" or "days" for this logic
      if (timeUnit === TimeUnit.WEEKS) t = t / 7;
      if (timeUnit === TimeUnit.MONTHS) t = t / 30.44;

      return {
        t: t,
        event: Number(r[eventCol]) === 1 // Assuming 1 is event, 0 is censored
      };
    }).sort((a, b) => a.t - b.t);

    // KM Calculation
    let currentSurvival = 1.0;
    let nRisk = cleanRows.length;
    let accumulatedVariance = 0; // For Greenwood's formula

    // Get unique time points
    const timePoints = Array.from(new Set(cleanRows.map(r => r.t))).sort((a, b) => a - b);

    // Initial step at t=0
    allSteps.push({
      time: 0,
      nRisk: nRisk,
      nEvent: 0,
      nCensor: 0,
      survivalProb: 1.0,
      stdErr: 0,
      lowerCI: 1.0,
      upperCI: 1.0,
      group
    });

    timePoints.forEach(t => {
      const atTime = cleanRows.filter(r => r.t === t);
      const nEvent = atTime.filter(r => r.event).length;
      const nCensor = atTime.filter(r => !r.event).length;

      // Update Probability
      // S(t) = S(t-1) * (1 - d/n)
      if (nRisk > 0) {
        currentSurvival = currentSurvival * (1 - (nEvent / nRisk));
        
        // Greenwood's Formula for Standard Error
        // Var(S(t)) = S(t)^2 * sum(d / (n * (n-d)))
        if (nEvent > 0 && (nRisk - nEvent) > 0) {
            accumulatedVariance += nEvent / (nRisk * (nRisk - nEvent));
        }
      }

      const stdErr = currentSurvival * Math.sqrt(accumulatedVariance);
      // 95% CI (Normal approximation)
      const lower = Math.max(0, currentSurvival - 1.96 * stdErr);
      const upper = Math.min(1, currentSurvival + 1.96 * stdErr);

      allSteps.push({
        time: t,
        nRisk,
        nEvent,
        nCensor,
        survivalProb: currentSurvival,
        stdErr,
        lowerCI: lower,
        upperCI: upper,
        group
      });

      // Decrement risk set for next step
      nRisk -= (nEvent + nCensor);
    });
  });

  return {
    steps: allSteps,
    groups
  };
};

// Generate dummy data for the demo
export const generateMockData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  const groups = ['Juvenile', 'Adult'];
  
  for (let i = 0; i < 50; i++) {
    const isJuvenile = Math.random() > 0.5;
    const group = isJuvenile ? 'Juvenile' : 'Adult';
    
    // Juveniles have higher mortality (shorter times)
    const lambda = isJuvenile ? 0.05 : 0.02; 
    const time = Math.floor(-Math.log(Math.random()) / lambda) + 1;
    
    // Random censoring (0 = censored, 1 = dead)
    const event = Math.random() > 0.3 ? 1 : 0; 

    data.push({
      id: `animal_${i}`,
      deploy_duration: time,
      status: event,
      age_class: group,
      sex: Math.random() > 0.5 ? 'M' : 'F'
    });
  }
  return data;
};
