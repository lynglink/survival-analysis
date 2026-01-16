# MoveApps Survival Estimator (R-SDK)

## Overview
This application is a specialized frontend designed for wildlife tracking analysis. It automates Kaplan–Meier survival analysis, providing a standardized, GUI-driven interface to visualize survival curves and life tables from tracking data.

While designed to simulate a node within the MoveApps R-SDK workflow, this web version runs entirely in the browser using React, simulating the statistical logic typically performed by R packages (`survival`, `move2`). 

**Note:** This version is a static demo. The "Biological Interpretation" feature serves a pre-written example report instead of connecting to a live AI API, ensuring the app is safe to run without configuration.

## Features
*   **Data Ingestion**: Upload CSV files simulating `move2` tracking data.
*   **Survival Analysis**: Client-side calculation of Kaplan-Meier estimates (Survival Probability, Standard Error, 95% CI).
*   **Interactive Visualization**: Dynamic survival curves with censoring marks and confidence intervals.
*   **Risk Table**: "Number at risk" tabulation aligned with time steps.
*   **Interpretation Example**: Displays a mock publication-quality ecological insight report (simulating Google Gemini output).
*   **Configuration**: Flexible controls for time units, event columns (mortality), and grouping variables (e.g., Sex, Age).

## Technical Stack
*   **Frontend**: React 18, Tailwind CSS, Lucide React (Icons).
*   **Visualization**: Recharts.
*   **Markdown Rendering**: `react-markdown`.
*   **Build-less Execution**: Uses ES Modules via `importmap` for immediate browser execution.

## Setup & Usage
1.  **Running**: Serve the directory using a simple HTTP server (e.g., `python3 -m http.server`, `npx serve`, or VS Code Live Server).
2.  **Data**: The app loads with mock data. Upload a CSV with columns for duration/time, status (binary), and grouping factors to test with your own data.

---

## Development History & Prompts

### Initial Request: Build Design Specification
**User Prompt:**
> Build Design: MoveApps Survival Estimator (R-SDK)
> ... (See full prompt in history) ...

**Implementation:**
The system was implemented as a React Web App simulating the R logic.
- `survivalLogic.ts`: Recreated `survfit` logic (KM estimator, Greenwood's formula).
- `SurvivalChart.tsx`: Used Recharts to mimic `ggsurvfit` aesthetics.

### Refinement 1: Fix Arithmetic Error
**Issue:** Sort comparison in `RiskTable.tsx` caused a TypeScript arithmetic error due to implicit types.
**Fix:** Explicitly typed parameters in the sort function `(a: number, b: number) => a - b`.

### Refinement 2: UI/UX Polish for AI Report
**User Prompt:**
> can we format pretty this Biological Interpretation (Gemini)?

**Implementation:**
- Added `react-markdown` to the `importmap` in `index.html`.
- Updated `App.tsx` to render the Gemini response as Markdown with custom styling.

### Refinement 3: Remove API Dependency
**User Prompt:**
> the ai-features are connected to my account? If so just create a png example and remove code that would utilize my API.

**Implementation:**
- Removed `GoogleGenAI` import and API key logic from `services/geminiService.ts`.
- Replaced dynamic generation with a static Markdown string to mock the feature safely.
- Removed `@google/genai` from `index.html`.
