import type { ScorecardResult } from "./types";

/**
 * Kalıcılık katmanı — MVP’de no-op. DB eklendiğinde bu arayüzü implemente eden
 * bir sınıf yazıp `getScorecardPersistence()` içinde döndürün (ör. Postgres).
 */
export interface ScorecardPersistence {
  recordSuccessfulRun(input: {
    query: string;
    amazonUrl: string;
    scorecard: ScorecardResult;
  }): Promise<void>;
}

const noop: ScorecardPersistence = {
  async recordSuccessfulRun() {
    /* DB / analytics sonrası */
  },
};

export function getScorecardPersistence(): ScorecardPersistence {
  return noop;
}
