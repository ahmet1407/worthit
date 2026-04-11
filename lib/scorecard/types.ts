export type Verdict = "BUY" | "WAIT" | "SKIP";

export type SignalLevel = "HIGH" | "MEDIUM" | "LOW";

export type Confidence = "HIGH" | "MEDIUM" | "INSUFFICIENT_DATA";

export type Sentiment = "positive" | "negative" | "mixed";

export interface ScorecardResult {
  product_name: string;
  brand: string;
  category: string;
  overall_score: number;
  verdict: Verdict;
  verdict_reason: string;
  scores: {
    satisfaction: number;
    flaw_risk: number;
    expert: number;
    value: number;
  };
  trust_signals: {
    platform_rating: number;
    scorecard_true_score: number;
    fake_review_signal: SignalLevel;
    hype_reality_gap: SignalLevel;
    hype_note: string;
    influencer_vs_real: {
      influencer_score: number;
      real_user_score: number;
      gap: SignalLevel;
    };
    price_adjusted_score: {
      raw_score: number;
      adjusted: number;
      note: string;
    };
    review_count_signal: {
      count: number;
      threshold_met: boolean;
      note: string;
    };
  };
  recency: {
    last_90_days_sentiment: Sentiment;
    quality_change_detected: boolean;
    recency_note: string;
  };
  chronic_issues: Array<{
    issue: string;
    first_appears: string;
    source_count: number;
    sources: string[];
    severity: SignalLevel;
  }>;
  top_pros: Array<{ point: string; source: string }>;
  top_cons: Array<{ point: string; source: string }>;
  paywall_hooks: {
    main_risk_teaser: string;
    hidden_insight_teaser: string;
  };
  premium_data: {
    main_risk_revealed: string;
    hidden_insight_revealed: string;
  };
  use_case_fit: {
    best_for: string[];
    not_ideal_for: string[];
  };
  why_people_buy: {
    main_motivation: string;
    owner_satisfaction_note: string;
    love_rate: string;
  };
  alternatives: Array<{
    name: string;
    why: string;
    price_diff: string;
  }>;
  market_context: {
    TR: string;
    US: string;
  };
  data_integrity: {
    sources_analyzed: string[];
    total_sources_count: number;
    confidence: Confidence;
    confidence_reason: string;
  };
}

export interface ScrapedAmazonPayload {
  title: string;
  breadcrumb: string;
  starRating: string;
  reviewCount: string;
  lowestReviewsText: string;
  markdownExcerpt: string;
  sourceUrl: string;
}
