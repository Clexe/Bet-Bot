
import { GoogleGenAI } from "@google/genai";
import { MatchPrediction } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeMatch = async (query: string, retries = 3): Promise<MatchPrediction> => {
  // Strict initialization as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are an advanced Predictive Sports Analytics Engine. 
    Task: Analyze the match/game request: "${query}".
    
    You must provide a comprehensive breakdown including:
    - Main markets (1X2, O/U 2.5, BTTS).
    - Advanced markets (Asian Handicap, Corners O/U, Cards O/U).
    - Player Performance (Anytime goalscorer, Player cards, Shots on target).
    - Tactical analysis and Variable synthesis (Form, H2H, Injuries).

    Return your response with a structured JSON block at the end enclosed in triple backticks with 'json' tag.
    Ensure all probability values are numbers between 0 and 100.

    The JSON structure MUST follow this interface:
    {
      "matchName": "Team A vs Team B",
      "probabilities": {
        "homeWin": number, "draw": number, "awayWin": number,
        "over25": number, "under25": number,
        "bttsYes": number, "bttsNo": number,
        "doubleChance": { "1X": number, "12": number, "X2": number },
        "asianHandicap": { "line": "-0.5/+0.5", "homeProb": number, "awayProb": number }
      },
      "correctScores": [ { "score": "string", "probability": number } ],
      "additionalMarkets": [ { "name": "Corners Over 9.5", "value": "string", "probability": number } ],
      "playerProps": [ { "playerName": "string", "market": "Anytime Goalscorer", "prediction": "Yes", "probability": number } ],
      "variables": { "form": "string", "h2h": "string", "injuries": "string", "tactics": "string" },
      "keyFactors": ["string"],
      "suggestedBet": "string",
      "confidence": number,
      "suggestedFollowUps": ["What about corners?", "Any anytime goalscorers?", "Show H2H history"]
    }

    Be statistical. Use Google Search for the latest lineups, form, and odds.
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

      // Escaping backticks in the regex to avoid "Invalid or unexpected token" errors
      const jsonBlocks = [...text.matchAll(/\`\`\`json\n([\s\S]*?)\n\`\`\`/g)];
      const lastJsonBlock = jsonBlocks.length > 0 ? jsonBlocks[jsonBlocks.length - 1][1] : null;
      
      let parsedData: any = {};
      if (lastJsonBlock) {
        try {
          parsedData = JSON.parse(lastJsonBlock);
        } catch (e) {
          console.error("Failed to parse prediction JSON", e);
        }
      } else {
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          try {
            parsedData = JSON.parse(objectMatch[0]);
          } catch (e) {}
        }
      }

      return {
        matchName: parsedData.matchName || "Match Analysis",
        probabilities: parsedData.probabilities || {
          homeWin: 33, draw: 34, awayWin: 33,
          over25: 50, under25: 50,
          bttsYes: 50, bttsNo: 50,
          doubleChance: { "1X": 60, "12": 80, "X2": 40 },
          asianHandicap: { line: "0.0", homeProb: 50, awayProb: 50 }
        },
        correctScores: parsedData.correctScores || [],
        additionalMarkets: parsedData.additionalMarkets || [],
        playerProps: parsedData.playerProps || [],
        variables: parsedData.variables || { form: '', h2h: '', injuries: '', tactics: '' },
        analysis: text.replace(/\`\`\`json[\s\S]*?\`\`\`/g, "").trim(),
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
