
export interface Market {
  name: string;
  value: string;
  probability?: number;
}

export interface MatchPrediction {
  matchName: string;
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
    over25: number;
    under25: number;
    bttsYes: number;
    bttsNo: number;
    doubleChance: {
      "1X": number;
      "12": number;
      "X2": number;
    };
  };
  correctScores: Array<{ score: string; probability: number }>;
  additionalMarkets: Market[];
  variables: {
    form: string;
    h2h: string;
    injuries: string;
    tactics: string;
  };
  analysis: string;
  keyFactors: string[];
  suggestedBet: string;
  confidence: number;
  sources: Array<{ title: string; uri: string }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  prediction?: MatchPrediction;
  isLoading?: boolean;
}
