
export interface Market {
  name: string;
  value: string;
  probability?: number;
}

export interface PlayerProp {
  playerName: string;
  market: string;
  prediction: string;
  probability: number;
}

export interface LiveScore {
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished' | 'scheduled' | 'HT' | 'FT';
  time?: string; // e.g., "75'"
}

export interface MatchPrediction {
  matchName: string;
  liveScore?: LiveScore;
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
    asianHandicap: {
      line: string;
      homeProb: number;
      awayProb: number;
    };
  };
  correctScores: Array<{ score: string; probability: number }>;
  additionalMarkets: Market[];
  playerProps: PlayerProp[];
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
  suggestedFollowUps: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  prediction?: MatchPrediction;
  isLoading?: boolean;
}
