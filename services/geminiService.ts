import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

export const generateBiologicalReport = async (result: AnalysisResult, configDescription: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return "API Key not found in environment variables. Please configure the environment.";
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  // Downsample steps to avoid token limits if data is huge, just take the last step of each group and a few middle ones
  const summary = result.groups.map(g => {
    const groupSteps = result.steps.filter(s => s.group === g);
    const lastStep = groupSteps[groupSteps.length - 1];
    const midStep = groupSteps[Math.floor(groupSteps.length / 2)];
    return {
      group: g,
      medianTime: midStep?.time,
      finalSurvivalProbability: lastStep?.survivalProb.toFixed(3),
      totalEvents: groupSteps.reduce((acc, curr) => acc + curr.nEvent, 0)
    };
  });

  const prompt = `
    You are a wildlife biologist and statistician using the MoveApps platform.
    
    Analyze the following summarized Kaplan-Meier survival analysis results:
    ${JSON.stringify(summary, null, 2)}
    
    Configuration context: ${configDescription}
    
    Please provide a "Publication Interpretation" that includes:
    1. A comparison of survival rates between groups (if applicable).
    2. Significant observations regarding the drop in survival probability.
    3. A concluding sentence on the ecological implications.
    
    Keep it concise (under 200 words) and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate AI report due to an API error.";
  }
};
