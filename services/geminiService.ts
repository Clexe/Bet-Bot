
import { GoogleGenAI } from "@google/genai";
import { MatchPrediction } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeMatch = async (query: string, retries = 3): Promise<MatchPrediction> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are an advanced Predictive Sports Analytics Engine. 
    Task: Analyze the match/game request: "${query}".
    
    CRITICAL: If the match is CURRENTLY IN PROGRESS, you must provide the live score and match minute using your search tool.

    You must provide a comprehensive breakdown including:
    - Live Status (If applicable).
    - Match Result (1X2) and Double Chance.
    - Over/Under Goal Totals (0.5, 1.5, 2.5, 3.5).
    - Correct Score Predictions (Top 3 most likely outcomes with probabilities).
    - Asian Handicap lines (Standard main line for this specific match).
    - Specialty Markets: Total Corners (Over/Under) and Total Cards (Over/Under).
    - Player Performance (Anytime goalscorer, shots on target).
    - Variable synthesis (Form, H2H, Injuries, Tactical setup).

    Return your response with a structured JSON block at the end enclosed in triple backticks with 'json' tag.
    Ensure all probability values are numbers between 0 and 100.

    The JSON structure MUST follow this interface:
    {
      "matchName": "Team A vs Team B",
      "liveScore": { "homeScore": number, "awayScore": number, "status": "live"|"HT"|"FT"|"scheduled", "time": "string" },
      "probabilities": {
        "homeWin": number, "draw": number, "awayWin": number,
        "over25": number, "under25": number,
        "bttsYes": number, "bttsNo": number,
        "doubleChance": { "1X": number, "12": number, "X2": number },
        "asianHandicap": { "line": "-0.5", "homeProb": number, "awayProb": number }
      },
      "correctScores": [ { "score": "1-0", "probability": number }, { "score": "1-1", "probability": number }, { "score": "2-1", "probability": number } ],
      "additionalMarkets": [ 
        { "name": "Corners", "value": "Over 9.5", "probability": number },
        { "name": "Cards", "value": "Under 4.5", "probability": number },
        { "name": "Goals", "value": "Over 1.5", "probability": number }
      ],
      "playerProps": [ { "playerName": "string", "market": "Anytime Goalscorer", "prediction": "Yes", "probability": number } ],
      "variables": { "form": "string", "h2h": "string", "injuries": "string", "tactics": "string" },
      "keyFactors": ["string"],
      "suggestedBet": "string",
      "confidence": number,
      "suggestedFollowUps": ["What about corners?", "Any anytime goalscorers?", "Show H2H history"]
    }

    Be statistical. Use Google Search for real-time scores, team news, and market trends.
  `;

  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        },
      });

      const text = response.text || "";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const sources = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web?.title || 'Source',
          uri: chunk.web?.uri || '#'
        }));

      let parsedData: any = {};
      const jsonMatch = text.match(/```json\s+([\s\S]*?)\s+```/) || text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          const jsonString = jsonMatch[1] ? jsonMatch[1].trim() : jsonMatch[0].trim();
          parsedData = JSON.parse(jsonString);
        } catch (e) {
          console.error("Failed to parse prediction JSON", e);
        }
      }

      return {
        matchName: parsedData.matchName || "Match Analysis",
        liveScore: parsedData.liveScore,
        probabilities: parsedData.probabilities || {
          homeWin: 33, draw: 34, awayWin: 33,
          over25: 50, under25: 50,
          bttsYes: 50, bttsNo: 50,
          doubleChance: { "1X": 60, "12": 80, "X2": 40 },
          asianHandicap: { line: "0.0", homeProb: 50, awayProb: 50 }
        },
        correctScores: (parsedData.correctScores || []).slice(0, 3),
        additionalMarkets: parsedData.additionalMarkets || [],
        playerProps: parsedData.playerProps || [],
        variables: parsedData.variables || { form: '', h2h: '', injuries: '', tactics: '' },
        analysis: text.split('```json')[0].trim(),
        keyFactors: parsedData.keyFactors || [],
        suggestedBet: parsedData.suggestedBet || "No clear suggestion",
        confidence: parsedData.confidence || 50,
        sources: sources,
        suggestedFollowUps: parsedData.suggestedFollowUps || []
      };
    } catch (error: any) {
      lastError = error;
      const delay = Math.pow(2, i) * 1000;
      await sleep(delay);
    }
  }

  throw lastError || new Error("Failed to analyze match after multiple attempts");
};
