import type { WorthitReport } from "./types";

/**
 * Kalıcılık katmanı — MVP’de no-op. DB eklendiğinde bu arayüzü implemente eden
 * bir sınıf yazıp `getWorthitPersistence()` içinde döndürün (ör. Postgres).
 */
export interface WorthitPersistence {
  recordSuccessfulRun(input: {
    query: string;
    amazonUrl: string;
    report: WorthitReport;
  }): Promise<void>;
}

const noop: WorthitPersistence = {
  async recordSuccessfulRun() {
    /* DB / analytics sonrası */
  },
};

export function getWorthitPersistence(): WorthitPersistence {
  return noop;
}
