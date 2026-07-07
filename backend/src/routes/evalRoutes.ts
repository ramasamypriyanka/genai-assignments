import { Router, Request, Response, NextFunction } from "express";
import { callLLM } from "../services/llmClient.js";
import { evalWithMetric, evalWithFields, evalFaithfulness } from "../services/evalClient.js";
import { retrieveContext } from "../services/ragService.js";
import { ENV } from "../config/env.js";

const router = Router();

/**
 * Error handler middleware for async routes
 */
const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

/**
 * POST /api/llm/eval
 * LLM-only evaluation endpoint
 *
 * Request body:
 * {
 *   prompt: string (required),
 *   model?: string (optional, defaults to llama-3.3-70b-versatile),
 *   temperature?: number (optional, defaults to 0.7),
 *   metric?: string (optional, defaults to 'answer_relevancy')
 * }
 *
 * Response:
 * {
 *   prompt: string,
 *   model: string,
 *   provider: string,
 *   llmResponse: string,
 *   evaluation: { metric, score, explanation }
 * }
 */
router.post(
  "/llm/eval",
  asyncHandler(async (req: Request, res: Response) => {
    const { prompt, model, temperature, metric } = req.body;

    // Validation
    if (!prompt) {
      return res.status(400).json({
        error: "Missing required field: prompt"
      });
    }

    // Validate temperature if provided
    if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 2)) {
      return res.status(400).json({
        error: "Temperature must be a number between 0 and 2"
      });
    }

    // Determine effective parameters
    const effectiveModel = model || "llama-3.3-70b-versatile";
    const effectiveTemperature = temperature !== undefined ? temperature : 0.7;
    const effectiveMetric = metric || "answer_relevancy"; // Changed default from faithfulness

    // Call LLM
    const llmResponse = await callLLM(prompt, effectiveModel, effectiveTemperature);
    console.log("LLM Response:", llmResponse);

    // Determine provider based on model
    const provider = effectiveModel.startsWith("llama-") || effectiveModel.startsWith("mixtral-") || 
                     effectiveModel.startsWith("gemma") || effectiveModel.startsWith("qwen") ? "groq" : "openai";

    // Evaluate with DeepEval using specified metric
    // For LLM-only (no RAG), answer_relevancy makes most sense
    // query = prompt, output = llmResponse
    const evalResult = await evalWithFields({
      query: prompt,
      output: llmResponse,
      metric: effectiveMetric,
      provider
    });
    console.log("Evaluation Result:", evalResult);

    // Use legacy fields for backward compatibility (populated from first successful result)
    res.json({
      prompt,
      model: effectiveModel,
      temperature: effectiveTemperature,
      provider,
      llmResponse,
      evaluation: {
        metric: evalResult.metric_name,
        score: evalResult.score,
        explanation: evalResult.explanation,
        // Include results array if available for multi-metric support
        ...(evalResult.results && { results: evalResult.results })
      }
    });
  })
);