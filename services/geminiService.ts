
import { GoogleGenAI } from "@google/genai";
import { MatchPrediction } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export const analyzeMatch = async (query: string): Promise<MatchPrediction> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    You are an advanced Predictive Sports Analytics Engine. 
    Task: Analyze the match/game request: "${query}".
    
    Variables to synthesize:
    - Recent Form (last 5-10 games).
    - Historical Head-to-Head (H2H) encounters.
    - Injury reports and squad rotations.
    - Tactical match-ups and coaching styles.
    - External factors: Home advantage, weather, motivation (cup vs league).

    Return your response with a structured JSON block at the end enclosed in triple backticks with 'json' tag.
    The JSON structure MUST follow this interface:
    {
      "matchName": "Team A vs Team B",
      "probabilities": {
        "homeWin": number (0-100),
        "draw": number (0-100),
        "awayWin": number (0-100),
        "over25": number (0-100),
        "under25": number (0-100),
        "bttsYes": number (0-100),
        "bttsNo": number (0-100),
        "doubleChance": { "1X": number, "12": number, "X2": number }
      },
      "correctScores": [ { "score": "2-1", "probability": number } ],
      "additionalMarkets": [
        { "name": "Corners Over 9.5", "value": "Likely", "probability": number },
        { "name": "Cards Under 4.5", "value": "Very Likely", "probability": number },
        { "name": "Anytime Goalscorer", "value": "Player Name", "probability": number }
      ],
      "variables": {
        "form": "summary of form",
        "h2h": "summary of H2H",
        "injuries": "summary of injuries",
        "tactics": "tactical insight"
      },
      "keyFactors": ["factor 1", "factor 2"],
      "suggestedBet": "Specific betting tip with reasoning",
      "confidence": number (0-100)
    }

    Use Google Search to find real-time data for today's date if necessary. Be objective and statistical.
  `;

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

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let parsedData: any = {};
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse prediction JSON", e);
      }
    }

    return {
      matchName: parsedData.matchName || "Match Analysis",
      probabilities: parsedData.probabilities || {
        homeWin: 33, draw: 34, awayWin: 33,
        over25: 50, under25: 50,
        bttsYes: 50, bttsNo: 50,
        doubleChance: { "1X": 60, "12": 80, "X2": 40 }
      },
      correctScores: parsedData.correctScores || [],
      additionalMarkets: parsedData.additionalMarkets || [],
      variables: parsedData.variables || { form: '', h2h: '', injuries: '', tactics: '' },
      analysis: text.replace(/```json[\s\S]*?```/, "").trim(),
      keyFactors: parsedData.keyFactors || [],
      suggestedBet: parsedData.suggestedBet || "No clear suggestion",
      confidence: parsedData.confidence || 50,
      sources: sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
