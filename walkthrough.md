# Walkthrough - Learning Playground Phase 2 Enhancements

I have successfully implemented all of the Phase 2 educational, diagnostic, and troubleshooting modules for the DeepEval & RAGAS Learning Playground. Here is a summary of the additions:

---

## 1. 🐞 RAG Debugging Lab & Troubleshooting Matrix

- Created the **RAG Debugging Lab** under a dedicated tab.
- Users can browse the 6 core failure modes: **Hallucination, Missing Context, Wrong Retrieval, Partial Answers, Context Drift, and Over-Retrieval**.
- Each failure mode details its exact **Symptoms**, **Affected Metrics**, **Root Cause**, **Recommended Fix**, and a **Real Text Example** of Query/Context/Output.
- An interactive **Troubleshooting Matrix** table maps warning metrics directly to their root causes and fix actions. Clicking rows highlights them dynamically.

---

## 2. 🔗 Metric Dependency Visualizer

- Rendered an interactive **SVG Flow Diagram** that visually maps how pipeline dependencies cascade:
  - `Retrieval Quality` ➔ `Context Recall` & `Context Precision`
  - `Context Recall` & `Context Precision` ➔ `Faithfulness` & `Hallucination`
  - `Faithfulness` & `Hallucination` ➔ `Answer Relevancy`
- Hovering or clicking a node displays detailed operational advice about that specific pipeline stage.

---

## 3. 🎯 Evaluation Strategy Guide & Case Studies

- **Strategy Guide**: Allows users to select an assistant profile (**Customer Support, Healthcare, Banking, Legal, and Knowledge Base**).
  - Recommends appropriate target metrics, sets numeric threshold limits (e.g. >0.99 Faithfulness for Healthcare), and details the strategic reasoning.
- **Industry Case Studies**: Includes complete case logs for E-Commerce, Healthcare, Banking, HR, and Support.
  - Displays Query, Context, LLM Answer, a complete Metric Analysis scorecard, and Lessons Learned.

---

## 4. 🎮 Evaluation Challenge Mode (Quiz)

- A multi-phase interactive quiz mode.
- Users read realistic RAG logs and predict:
  - Which metric fails
  - Why it fails
  - How to fix it
- Submitting provides immediate **Correct/Incorrect feedback** on all 3 parameters and reveals the detailed evaluator explanation.

---

## 5. 🎚️ Cost vs. Quality Simulator

- Interactive sliders let users adjust:
  - **Top-K Retrieval**
  - **Chunk Token Size**
  - **Retrieval Depth**
- An engine dynamically computes and renders real-time simulated gauges for: **Recall Coverage, Retrieval Precision, Request Latency, and Estimated Cost ($ per 1K runs)**.
- Teaches developers how chunk configurations create trade-offs between system accuracy, speed, and API costs.

---

## 📈 6. Production Monitoring Dashboard

- Simulates analytics trends over a 30-day post-deployment window.
- Renders 4 high-quality **SVG Line Charts** mapping daily fluctuations of: **Faithfulness, Hallucination Defect Rate, Answer Relevancy, and Context Recall**.
- Includes post-deployment interpretation guidance.

---

## ⚙️ 7. Environment Variable Consolidation

- Consolidated all env configuration parameters into the single, root `.env` file.
- Removed duplicate/redundant `.env` files from:
  - `frontend/.env`
  - `llm-eval-providers/.env`
- Configured Vite (`frontend/vite.config.ts`) to read `.env` variables from the root folder (`envDir: '../'`).
- Updated the Python judge FastAPI server (`llm-eval-providers/deepeval_server.py`) to search for the root `.env` relative to its script location first before falling back.

---

## 🔌 8. Dynamic Port Configuration & Hardcode Elimination

- Added explicit `DEEPEVAL_PORT=8002` and `FRONTEND_PORT=5174` environment parameters to the root `.env` file alongside the existing backend `PORT=3002`.
- Eliminated all hardcoded port configurations across the codebase:
  - **Python FastAPI Judge Server**: Made the execution port dynamic in `deepeval_server.py`, reading from `DEEPEVAL_PORT` or extracting it from `DEEPEVAL_URL`.
  - **Python Startup Script**: Refactored `run-python-server.js` to parse root `.env` dynamically, print accurate port logs, and pass environment variables cleanly to the spawned subprocess.
  - **Backend API Server**: Corrected index and config env defaults in the Node/TS backend, resolving defaults from port `5174` to `3002`.
  - **Frontend Dev Port & Proxy**: Configured Vite dynamically to read `FRONTEND_PORT` and `VITE_API_URL` / `PORT` from the root `.env`.
  - **Frontend API Client**: Made the `BACKEND_URL` fallback completely dynamic using `(import.meta as any).env.VITE_API_URL`.

---

## 🛡️ 9. UI Safety & Robust Score Handling

- Safeguarded history log table mapping in `LLMEvalForm.tsx` to handle `null`, `undefined`, or non-number scores dynamically.
- Implemented robust fallback logic in the `getDiagnosticInfo` interpreter scorecard and AI coach commentary, displaying clear instructions if a run fails or returns empty/null score.
- Guaranteed that failed evaluations do not result in blank page UI crashes.

---

## 🛠️ 10. Fixes for Answer Relevancy & RAGAS Metrics

- **Answer Relevancy Param Correction**: Corrected DeepEval's `AnswerRelevancyMetric` test case construction to strictly use `input` and `actual_output`, ensuring that `context`/`retrieval_context` is completely omitted, adhering to DeepEval's required parameter specifications.
- **RAGAS Answer Relevancy Removal**:
  - Removed `answer_relevancy` from the RAGAS metrics list in the React frontend (`validation.ts`) and Express backend (`index.ts`).