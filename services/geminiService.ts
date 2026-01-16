import { AnalysisResult } from "../types";

/**
 * MOCK SERVICE
 * 
 * This service previously connected to the Google Gemini API.
 * To ensure the app is safe for public sharing and runs without an API key,
 * it now returns a static, pre-written analysis example.
 */
export const generateBiologicalReport = async (result: AnalysisResult, configDescription: string): Promise<string> => {
  
  // Simulate a short "thinking" delay for the UI experience
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Return a static Markdown string that mimics a real AI response based on the mock data
  return `
# Biological Survival Analysis

**Comparison of Survival Rates**
The Kaplan-Meier analysis reveals a distinct divergence between the **Juvenile** and **Adult** groups. The **Adult** group demonstrates a significantly higher survival probability throughout the study duration, maintaining a survival rate above 0.8. In contrast, the **Juvenile** cohort exhibits a steeper decline, with survival probability dropping below 0.5 by the mid-study point.

**Significant Observations**
*   **Early Mortality:** The Juvenile group shows a rapid decrease in survival probability within the first 10 time units, suggesting high vulnerability during the early post-deployment phase (possibly due to predation or dispersal stress).
*   **Stability in Adults:** The Adult survival curve remains relatively flat, indicating low predation or environmental mortality risk for established individuals.
*   **Censoring Patterns:** Both groups show stepped censoring events, consistent with battery exhaustion or scheduled collar drop-offs rather than acute mortality clusters.

**Ecological Implications**
These findings suggest a **Type III survivorship curve** for this population, where mortality is concentrated in early life stages. Conservation efforts should prioritize habitat protection for juveniles to improve recruitment rates into the adult breeding population. The high adult survival rate implies that once individuals reach maturity, they are relatively secure in this environment.
  `;
};
