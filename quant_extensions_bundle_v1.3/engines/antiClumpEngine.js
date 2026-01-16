/**
 * Anti-Clump Pattern Detector Engine
 *
 * Detects real-world shuffle bias patterns:
 * - Card clumping (10s/Aces clustering)
 * - Incomplete riffle shuffles (partial ordering)
 * - Transition anomalies (H→H, L→L frequency)
 * - Run detection (consecutive same-type cards)
 *
 * Phase: pre-deal
 * Inputs: shoeState, engineCache, roundState
 * Outputs: clumpScore, recommendation, strategy, signals
 */

// Card classification helpers
const HIGH_CARDS = ['10', 'J', 'Q', 'K', 'A'];
const LOW_CARDS = ['2', '3', '4', '5', '6'];
const NEUTRAL_CARDS = ['7', '8', '9'];

// Normalize card to rank
function normalizeRank(card) {
  if (!card) return null;
  const c = String(card).toUpperCase();
  if (['J', 'Q', 'K'].includes(c)) return '10';
  if (c === 'A' || c === '1') return 'A';
  if (['2','3','4','5','6','7','8','9','10'].includes(c)) return c;
  return null;
}

// Get card type: 'H' (high), 'L' (low), 'N' (neutral)
function getCardType(card) {
  const rank = normalizeRank(card);
  if (!rank) return null;
  if (HIGH_CARDS.includes(rank) || rank === '10') return 'H';
  if (LOW_CARDS.includes(rank)) return 'L';
  return 'N';
}

/**
 * Calculate clustering ratio
 * Measures how concentrated high/low cards are vs expected distribution
 *
 * @param {string[]} window - Recent cards dealt
 * @returns {object} - { highRatio, lowRatio, clumpRatio }
 */
function calculateClusteringRatio(window) {
  if (!window || window.length === 0) {
    return { highRatio: 1.0, lowRatio: 1.0, clumpRatio: 1.0 };
  }

  let highCount = 0;
  let lowCount = 0;

  for (const card of window) {
    const type = getCardType(card);
    if (type === 'H') highCount++;
    else if (type === 'L') lowCount++;
  }

  const n = window.length;

  // Expected proportions in 8-deck shoe:
  // High cards (10,J,Q,K,A): 160/416 = 0.3846 (128 tens + 32 aces)
  // Low cards (2-6): 160/416 = 0.3846 (32 each × 5)
  // Neutral (7-9): 96/416 = 0.2308 (32 each × 3)
  const expectedHigh = n * 0.3846;
  const expectedLow = n * 0.3846;

  const highRatio = expectedHigh > 0 ? highCount / expectedHigh : 1.0;
  const lowRatio = expectedLow > 0 ? lowCount / expectedLow : 1.0;

  // Clump ratio is the max deviation from expected
  const clumpRatio = Math.max(highRatio, lowRatio);

  return { highCount, lowCount, highRatio, lowRatio, clumpRatio };
}

/**
 * Build transition matrix from card sequence
 * Tracks H→H, H→L, L→H, L→L transitions
 *
 * @param {string[]} window - Recent cards dealt
 * @returns {object} - Transition counts and variance
 */
function buildTransitionMatrix(window) {
  const transitions = {
    HH: 0, HL: 0, LH: 0, LL: 0,
    HN: 0, NH: 0, LN: 0, NL: 0, NN: 0
  };

  let total = 0;

  for (let i = 1; i < window.length; i++) {
    const prev = getCardType(window[i - 1]);
    const curr = getCardType(window[i]);

    if (prev && curr) {
      const key = prev + curr;
      if (transitions[key] !== undefined) {
        transitions[key]++;
        total++;
      }
    }
  }

  // For H/L only transitions (ignore neutral for main analysis)
  const hlTotal = transitions.HH + transitions.HL + transitions.LH + transitions.LL;

  // Expected: 25% each for random shuffle (H and L equally likely)
  const expected = hlTotal / 4;

  // Calculate chi-squared like variance
  let variance = 0;
  if (expected > 0) {
    variance += Math.pow(transitions.HH - expected, 2) / expected;
    variance += Math.pow(transitions.HL - expected, 2) / expected;
    variance += Math.pow(transitions.LH - expected, 2) / expected;
    variance += Math.pow(transitions.LL - expected, 2) / expected;
  }

  // Normalize variance (divide by degrees of freedom = 3)
  const normalizedVariance = variance / 3;

  return {
    transitions,
    total,
    hlTotal,
    variance,
    normalizedVariance,
    // Same-type ratio (H→H + L→L vs alternating)
    sameTypeRatio: hlTotal > 0 ? (transitions.HH + transitions.LL) / hlTotal : 0.5
  };
}

/**
 * Detect runs (consecutive same-type cards)
 *
 * @param {string[]} window - Recent cards dealt
 * @returns {object} - Run statistics
 */
function detectRuns(window) {
  if (!window || window.length < 2) {
    return { maxRun: 0, avgRun: 0, expectedMax: 0, anomaly: false };
  }

  const runs = [];
  let currentRun = 1;
  let currentType = getCardType(window[0]);

  for (let i = 1; i < window.length; i++) {
    const type = getCardType(window[i]);

    if (type === currentType && type !== 'N') {
      currentRun++;
    } else {
      if (currentRun > 1 && currentType !== 'N') {
        runs.push(currentRun);
      }
      currentRun = 1;
      currentType = type;
    }
  }

  // Don't forget the last run
  if (currentRun > 1 && currentType !== 'N') {
    runs.push(currentRun);
  }

  const maxRun = runs.length > 0 ? Math.max(...runs) : 0;
  const avgRun = runs.length > 0 ? runs.reduce((a, b) => a + b, 0) / runs.length : 0;

  // Expected max run ≈ log₂(n) for random sequence
  const expectedMax = Math.max(2, Math.log2(window.length));

  // Anomaly if max run > 1.5× expected
  const anomaly = maxRun > expectedMax * 1.5;

  return {
    maxRun,
    avgRun,
    runCount: runs.length,
    runs,
    expectedMax,
    anomaly
  };
}

/**
 * Calculate penetration bin statistics
 * Analyzes shuffle bias by shoe depth
 *
 * @param {object} clumpModel - Persistent model state
 * @param {number} penetration - Current penetration (0-1)
 * @param {number} clumpScore - Current clump score
 */
function updatePenetrationBins(clumpModel, penetration, clumpScore) {
  if (!clumpModel.penetrationBins) {
    clumpModel.penetrationBins = {
      '0-25': { scores: [], avg: 50 },
      '25-50': { scores: [], avg: 50 },
      '50-75': { scores: [], avg: 50 },
      '75-100': { scores: [], avg: 50 }
    };
  }

  const pct = penetration * 100;
  let bin;
  if (pct < 25) bin = '0-25';
  else if (pct < 50) bin = '25-50';
  else if (pct < 75) bin = '50-75';
  else bin = '75-100';

  const binData = clumpModel.penetrationBins[bin];
  binData.scores.push(clumpScore);

  // Keep only last 50 samples per bin
  if (binData.scores.length > 50) {
    binData.scores.shift();
  }

  // Update rolling average
  binData.avg = binData.scores.reduce((a, b) => a + b, 0) / binData.scores.length;
}

/**
 * Adaptive learning system
 * Tracks outcomes by clump score bracket to optimize bet adjustments
 */
function initAdaptiveModel(clumpModel) {
  if (!clumpModel.outcomes) {
    clumpModel.outcomes = {
      '0-30': { wins: 0, losses: 0, profit: 0, betMultiplier: 1.1, samples: 0 },
      '31-55': { wins: 0, losses: 0, profit: 0, betMultiplier: 1.0, samples: 0 },
      '56-70': { wins: 0, losses: 0, profit: 0, betMultiplier: 0.9, samples: 0 },
      '71-100': { wins: 0, losses: 0, profit: 0, betMultiplier: 0.8, samples: 0 }
    };
  }
  if (!clumpModel.totalSamples) {
    clumpModel.totalSamples = 0;
  }
  if (!clumpModel.learningPhase) {
    clumpModel.learningPhase = 'exploration'; // exploration, calibration, optimized
  }
}

/**
 * Get bracket key for a clump score
 */
function getClumpBracket(score) {
  if (score <= 30) return '0-30';
  if (score <= 55) return '31-55';
  if (score <= 70) return '56-70';
  return '71-100';
}

/**
 * Update adaptive model with round outcome
 * Call this after each round with the result
 *
 * @param {object} clumpModel - Persistent model state
 * @param {number} clumpScoreAtBet - Clump score when bet was placed
 * @param {string} outcome - 'win' or 'loss'
 * @param {number} profit - Net profit from round (negative for loss)
 */
export function updateAdaptiveModel(clumpModel, clumpScoreAtBet, outcome, profit) {
  initAdaptiveModel(clumpModel);

  const bracket = getClumpBracket(clumpScoreAtBet);
  const data = clumpModel.outcomes[bracket];

  if (outcome === 'win') {
    data.wins++;
  } else {
    data.losses++;
  }
  data.profit += profit;
  data.samples++;
  clumpModel.totalSamples++;

  // Update learning phase
  if (clumpModel.totalSamples < 100) {
    clumpModel.learningPhase = 'exploration';
  } else if (clumpModel.totalSamples < 500) {
    clumpModel.learningPhase = 'calibration';
  } else {
    clumpModel.learningPhase = 'optimized';
  }

  // Recalculate optimal multiplier for calibration/optimized phases
  if (clumpModel.learningPhase !== 'exploration' && data.samples >= 20) {
    const winRate = data.wins / (data.wins + data.losses);
    const expectedWinRate = 0.42; // Baseline blackjack win rate

    // Adjust multiplier based on actual performance
    if (winRate < expectedWinRate - 0.05) {
      data.betMultiplier = Math.max(0.5, data.betMultiplier - 0.02);
    } else if (winRate > expectedWinRate + 0.05) {
      data.betMultiplier = Math.min(1.3, data.betMultiplier + 0.02);
    }
  }
}

/**
 * Main Anti-Clump Engine computation
 *
 * @param {object} context - Engine context
 * @returns {object} - Engine output
 */
export function computeAntiClumpEngine(context) {
  const shoeState = context.shoeState || {};
  const roundState = context.roundState || {};
  const cache = context.engineCache || {};

  // Initialize or get clump model from cache
  if (!cache.clumpModel) {
    cache.clumpModel = {
      history: [],
      penetrationBins: null,
      outcomes: null,
      totalSamples: 0,
      learningPhase: 'exploration'
    };
  }
  const clumpModel = cache.clumpModel;
  initAdaptiveModel(clumpModel);

  // Get recent cards window (from shoeState or fallback)
  const recentCards = shoeState.recentCards || [];
  const windowSize = recentCards.length;

  // Minimum sample size for reliable scoring
  const MIN_SAMPLE_SIZE = 15;
  const hasEnoughData = windowSize >= MIN_SAMPLE_SIZE;

  // Calculate all metrics
  const clustering = calculateClusteringRatio(recentCards);
  const transitions = buildTransitionMatrix(recentCards);
  const runs = detectRuns(recentCards);

  // Composite clump score calculation
  // Base: 50 (neutral)
  // Range: 0-100 (0 = dispersed, 100 = heavily clumped)
  let clumpScore = 50;

  if (hasEnoughData) {
    // Clump ratio contribution: (ratio - 1) × 25
    // ratio 1.0 = neutral, ratio 1.5 = +12.5 points
    const clumpRatioScore = (clustering.clumpRatio - 1) * 25;

    // Transition variance contribution
    // High variance = non-random = higher score
    const transitionScore = Math.min(15, transitions.normalizedVariance * 5);

    // Same-type ratio contribution
    // 0.5 = expected (random), higher = more clumping
    const sameTypeScore = (transitions.sameTypeRatio - 0.5) * 30;

    // Run anomaly contribution
    const runScore = runs.anomaly ? 20 : (runs.maxRun / runs.expectedMax - 1) * 10;

    clumpScore = 50 + clumpRatioScore + transitionScore + sameTypeScore + runScore;
  }

  // Clamp score to [0, 100]
  clumpScore = Math.max(0, Math.min(100, clumpScore));

  // Apply Bayesian smoothing toward neutral prior when sample size is low
  if (windowSize < 25) {
    const smoothingFactor = windowSize / 25;
    clumpScore = 50 + (clumpScore - 50) * smoothingFactor;
  }

  // Update penetration bins for long-term analysis
  const penetration = roundState.penetration ||
    (shoeState.totalCards > 0 ? shoeState.cardsDealt / shoeState.totalCards : 0);
  updatePenetrationBins(clumpModel, penetration, clumpScore);

  // Determine recommendation and strategy
  let recommendation, strategy;
  const bracket = getClumpBracket(clumpScore);
  const bracketData = clumpModel.outcomes[bracket];

  if (clumpScore <= 30) {
    recommendation = 'DISPERSED';
    strategy = 'AGGRESSIVE';
  } else if (clumpScore <= 55) {
    recommendation = 'NEUTRAL';
    strategy = 'STANDARD';
  } else if (clumpScore <= 70) {
    recommendation = 'MILD_CLUMP';
    strategy = 'REDUCE_BET';
  } else {
    recommendation = 'HEAVY_CLUMP';
    strategy = 'REDUCE_BET';
  }

  // Confidence based on sample size and learning phase
  let confidence = Math.min(1.0, windowSize / 30);
  if (clumpModel.learningPhase === 'optimized') {
    confidence *= 1.1;
  } else if (clumpModel.learningPhase === 'exploration') {
    confidence *= 0.8;
  }
  confidence = Math.max(0, Math.min(1.0, confidence));

  // Build signals object
  const signals = {
    highClusteringDetected: clustering.highRatio > 1.3,
    lowClusteringDetected: clustering.lowRatio > 1.3,
    unusualRunLength: runs.anomaly,
    abnormalTransitions: transitions.normalizedVariance > 2.0,
    sameTypeRatio: transitions.sameTypeRatio
  };

  // Store in history for trend analysis (with limit)
  clumpModel.history.push({
    score: clumpScore,
    penetration,
    timestamp: Date.now()
  });
  if (clumpModel.history.length > 100) {
    clumpModel.history.shift();
  }

  return {
    engineId: 'antiClump',
    name: 'Anti-Clump Pattern Detector',
    phase: 'pre-deal',

    // Primary outputs
    clumpScore: Math.round(clumpScore * 10) / 10,
    clumpRatio: Math.round(clustering.clumpRatio * 1000) / 1000,
    maxRunLength: runs.maxRun,
    expectedRunLength: Math.round(runs.expectedMax * 10) / 10,

    // Recommendations
    recommendation,
    strategy,
    betMultiplier: bracketData?.betMultiplier || 1.0,

    // Confidence and learning
    confidence: Math.round(confidence * 100) / 100,
    learningPhase: clumpModel.learningPhase,
    totalSamples: clumpModel.totalSamples,

    // Detailed signals
    signals,

    // Raw metrics for debugging/display
    metrics: {
      windowSize,
      highCount: clustering.highCount,
      lowCount: clustering.lowCount,
      highRatio: Math.round(clustering.highRatio * 100) / 100,
      lowRatio: Math.round(clustering.lowRatio * 100) / 100,
      transitionVariance: Math.round(transitions.normalizedVariance * 100) / 100,
      sameTypeRatio: Math.round(transitions.sameTypeRatio * 100) / 100,
      runCount: runs.runCount,
      avgRunLength: Math.round(runs.avgRun * 10) / 10
    }
  };
}
