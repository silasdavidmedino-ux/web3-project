/**
 * Clumping Probability Engine v1.0
 *
 * A specialized probability engine for clumped card shoes.
 * Unlike standard counting which assumes random distribution,
 * this engine accounts for card clustering patterns.
 *
 * KEY INSIGHT: In clumped shoes, seeing a high card predicts MORE highs
 * (clump continuation), not fewer (as standard counting assumes).
 *
 * Toggle ON when you suspect shoe has clumped cards.
 */

// Card classification
const HIGH_CARDS = ['10', 'J', 'Q', 'K', 'A'];
const LOW_CARDS = ['2', '3', '4', '5', '6'];
const NEUTRAL_CARDS = ['7', '8', '9'];

/**
 * Normalize card to rank
 */
function normalizeRank(card) {
  if (!card) return null;
  const c = String(card).toUpperCase();
  if (['J', 'Q', 'K'].includes(c)) return '10';
  if (c === 'A' || c === '1') return 'A';
  return c;
}

/**
 * Get card type: 'H' (high), 'L' (low), 'N' (neutral)
 */
function getCardType(card) {
  const rank = normalizeRank(card);
  if (!rank) return null;
  if (HIGH_CARDS.includes(rank) || rank === '10') return 'H';
  if (LOW_CARDS.includes(rank)) return 'L';
  return 'N';
}

/**
 * Calculate clump momentum - predicts what's likely to come next
 * based on recent card patterns
 *
 * @param {string[]} recentCards - Last N cards dealt
 * @returns {object} Momentum indicators
 */
function calculateClumpMomentum(recentCards) {
  if (!recentCards || recentCards.length < 3) {
    return { highMomentum: 0, lowMomentum: 0, trend: 'NEUTRAL' };
  }

  // Look at last 5-10 cards for momentum
  const window = recentCards.slice(-10);

  let highStreak = 0;
  let lowStreak = 0;
  let currentStreak = 0;
  let currentType = null;

  // Calculate current streak
  for (let i = window.length - 1; i >= 0; i--) {
    const type = getCardType(window[i]);
    if (type === 'N') continue;

    if (currentType === null) {
      currentType = type;
      currentStreak = 1;
    } else if (type === currentType) {
      currentStreak++;
    } else {
      break;
    }
  }

  if (currentType === 'H') highStreak = currentStreak;
  if (currentType === 'L') lowStreak = currentStreak;

  // Calculate momentum scores (-1 to +1)
  // Positive = expecting more of that type (clump continuation)
  const highMomentum = Math.min(1, highStreak / 5);
  const lowMomentum = Math.min(1, lowStreak / 5);

  // Determine trend
  let trend = 'NEUTRAL';
  if (highMomentum > 0.4) trend = 'HIGH_STREAK';
  else if (lowMomentum > 0.4) trend = 'LOW_STREAK';

  return {
    highMomentum,
    lowMomentum,
    highStreak,
    lowStreak,
    trend,
    lastType: currentType
  };
}

/**
 * Adjust probability based on clump patterns
 *
 * In clumped shoes:
 * - If we're in a high card streak, probability of next high INCREASES
 * - If we're in a low card streak, probability of next low INCREASES
 * - This is opposite to standard counting!
 *
 * @param {number} standardProb - Standard probability
 * @param {object} momentum - Clump momentum data
 * @param {string} cardType - 'H' or 'L'
 * @returns {number} Adjusted probability
 */
function adjustProbabilityForClump(standardProb, momentum, cardType) {
  const clumpFactor = 0.15; // Max adjustment factor

  if (cardType === 'H' && momentum.highMomentum > 0) {
    // In high streak, increase probability of more highs
    return standardProb * (1 + clumpFactor * momentum.highMomentum);
  } else if (cardType === 'L' && momentum.lowMomentum > 0) {
    // In low streak, increase probability of more lows
    return standardProb * (1 + clumpFactor * momentum.lowMomentum);
  } else if (cardType === 'H' && momentum.lowMomentum > 0) {
    // In low streak, decrease probability of highs
    return standardProb * (1 - clumpFactor * momentum.lowMomentum * 0.5);
  } else if (cardType === 'L' && momentum.highMomentum > 0) {
    // In high streak, decrease probability of lows
    return standardProb * (1 - clumpFactor * momentum.highMomentum * 0.5);
  }

  return standardProb;
}

/**
 * Calculate clump-adjusted EV for player hand
 *
 * @param {number} playerTotal - Player's current total
 * @param {string} dealerUpcard - Dealer's visible card
 * @param {object} momentum - Clump momentum
 * @param {object} shoeState - Current shoe composition
 * @returns {object} EV calculations for each action
 */
function calculateClumpAdjustedEV(playerTotal, dealerUpcard, momentum, shoeState) {
  const remaining = shoeState.totalCards - shoeState.cardsDealt;
  if (remaining <= 0) return null;

  // Base probabilities from shoe composition
  const highCards = (shoeState.rankCounts['10'] || 0) + (shoeState.rankCounts['A'] || 0);
  const lowCards = Object.keys(shoeState.rankCounts)
    .filter(k => ['2','3','4','5','6'].includes(k))
    .reduce((sum, k) => sum + (shoeState.rankCounts[k] || 0), 0);

  const baseHighProb = highCards / remaining;
  const baseLowProb = lowCards / remaining;

  // Adjust for clumping
  const adjHighProb = adjustProbabilityForClump(baseHighProb, momentum, 'H');
  const adjLowProb = adjustProbabilityForClump(baseLowProb, momentum, 'L');

  // Calculate bust probability if hitting
  let bustProb = 0;
  if (playerTotal >= 12) {
    // Cards that would bust us
    const bustThreshold = 21 - playerTotal;
    // Simplified: if we need 10 or less to not bust
    if (bustThreshold < 10) {
      bustProb = adjHighProb * (10 - bustThreshold) / 10;
    }
  }

  // Calculate dealer bust probability
  const dealerUpcardValue = dealerUpcard === 'A' ? 11 :
    ['J','Q','K'].includes(dealerUpcard) ? 10 : parseInt(dealerUpcard) || 0;

  let dealerBustProb = 0;
  // Dealer busts more often showing 2-6, especially in low-card-rich situations
  if (dealerUpcardValue >= 2 && dealerUpcardValue <= 6) {
    dealerBustProb = 0.35 + (momentum.highMomentum * 0.1); // High cards help dealer bust
  } else {
    dealerBustProb = 0.20 - (momentum.lowMomentum * 0.05);
  }

  // EV calculations
  const standEV = (dealerBustProb * 1) + ((1 - dealerBustProb) * (playerTotal > 17 ? 0.3 : -0.3));
  const hitEV = bustProb * -1 + (1 - bustProb) * 0.2;
  const doubleEV = hitEV * 1.8; // Simplified double EV

  return {
    stand: Math.round(standEV * 1000) / 1000,
    hit: Math.round(hitEV * 1000) / 1000,
    double: Math.round(doubleEV * 1000) / 1000,
    bustProb: Math.round(bustProb * 100) / 100,
    dealerBustProb: Math.round(dealerBustProb * 100) / 100,
    adjHighProb: Math.round(adjHighProb * 100) / 100,
    adjLowProb: Math.round(adjLowProb * 100) / 100
  };
}

/**
 * Get clump-adjusted strategy recommendation
 *
 * @param {number} playerTotal - Player's hand total
 * @param {string} dealerUpcard - Dealer's up card
 * @param {boolean} isSoft - Is it a soft hand
 * @param {boolean} canDouble - Can player double
 * @param {boolean} canSplit - Can player split
 * @param {object} momentum - Clump momentum data
 * @returns {object} Strategy recommendation
 */
function getClumpStrategy(playerTotal, dealerUpcard, isSoft, canDouble, canSplit, momentum) {
  const dealerValue = dealerUpcard === 'A' ? 11 :
    ['J','Q','K','10'].includes(dealerUpcard) ? 10 : parseInt(dealerUpcard) || 0;

  let action = 'STAND';
  let reason = '';
  let confidence = 0.7;

  // CLUMP-ADJUSTED STRATEGY DEVIATIONS

  // In HIGH STREAK (expecting more 10s/faces)
  if (momentum.trend === 'HIGH_STREAK') {
    confidence = 0.85;

    // More conservative hitting - high cards will bust us
    if (playerTotal >= 12 && playerTotal <= 16) {
      if (dealerValue >= 7) {
        // Normally hit, but in high streak, consider standing on 15-16
        if (playerTotal >= 15) {
          action = 'STAND';
          reason = 'High streak - avoid bust, dealer likely to bust too';
        } else {
          action = 'HIT';
          reason = 'Must hit low totals even in high streak';
        }
      } else {
        action = 'STAND';
        reason = 'High streak - dealer bust likely with stiff + high cards coming';
      }
    } else if (playerTotal === 11) {
      action = canDouble ? 'DOUBLE' : 'HIT';
      reason = 'High streak - excellent double opportunity';
      confidence = 0.95;
    } else if (playerTotal === 10 && dealerValue <= 9) {
      action = canDouble ? 'DOUBLE' : 'HIT';
      reason = 'High streak - strong double spot';
      confidence = 0.9;
    } else if (playerTotal >= 17) {
      action = 'STAND';
      reason = 'Stand on hard 17+';
    } else if (playerTotal <= 11) {
      action = 'HIT';
      reason = 'Cannot bust, hit for improvement';
    }
  }
  // In LOW STREAK (expecting more small cards)
  else if (momentum.trend === 'LOW_STREAK') {
    confidence = 0.85;

    // More aggressive hitting - small cards won't bust us
    if (playerTotal >= 12 && playerTotal <= 16) {
      action = 'HIT';
      reason = 'Low streak - safe to hit, small cards coming';

      if (playerTotal >= 15 && dealerValue <= 6) {
        // Even against weak dealer, hit in low streak
        action = 'HIT';
        reason = 'Low streak - hit even vs weak dealer, small cards safe';
      }
    } else if (playerTotal === 11 || playerTotal === 10) {
      // Don't double in low streak - won't get the 10
      action = 'HIT';
      reason = 'Low streak - skip double, unlikely to get 10';
      confidence = 0.8;
    } else if (playerTotal >= 17) {
      action = 'STAND';
      reason = 'Stand on 17+';
    } else if (playerTotal <= 11) {
      action = 'HIT';
      reason = 'Cannot bust, hit for improvement';
    }
  }
  // NEUTRAL - use modified basic strategy
  else {
    if (playerTotal >= 17) {
      action = 'STAND';
      reason = 'Basic strategy - stand 17+';
    } else if (playerTotal >= 13 && playerTotal <= 16 && dealerValue <= 6) {
      action = 'STAND';
      reason = 'Basic strategy - stand vs weak dealer';
    } else if (playerTotal >= 12 && playerTotal <= 16 && dealerValue >= 7) {
      action = 'HIT';
      reason = 'Basic strategy - hit vs strong dealer';
    } else if (playerTotal === 11) {
      action = canDouble ? 'DOUBLE' : 'HIT';
      reason = 'Basic strategy - double 11';
    } else if (playerTotal === 10 && dealerValue <= 9) {
      action = canDouble ? 'DOUBLE' : 'HIT';
      reason = 'Basic strategy - double 10 vs weak';
    } else if (playerTotal <= 11) {
      action = 'HIT';
      reason = 'Cannot bust';
    }
  }

  // Soft hand adjustments
  if (isSoft) {
    if (playerTotal >= 19) {
      action = 'STAND';
      reason = 'Soft 19+ always stand';
    } else if (playerTotal === 18) {
      if (dealerValue >= 9) {
        action = 'HIT';
        reason = 'Soft 18 vs strong dealer - hit';
      } else {
        action = 'STAND';
        reason = 'Soft 18 vs weak dealer - stand';
      }
    } else if (playerTotal <= 17) {
      action = 'HIT';
      reason = 'Soft 17 or less - always hit';
    }
  }

  return {
    action,
    reason,
    confidence,
    momentum: momentum.trend,
    isDeviation: momentum.trend !== 'NEUTRAL'
  };
}

/**
 * Calculate clump-adjusted betting recommendation
 *
 * @param {object} momentum - Clump momentum
 * @param {number} trueCount - Current true count
 * @param {number} clumpScore - Clump detection score (0-100)
 * @returns {object} Betting recommendation
 */
function getClumpBettingAdvice(momentum, trueCount, clumpScore) {
  let multiplier = 1.0;
  let advice = 'STANDARD';
  let reason = '';

  // Heavy clumping detected
  if (clumpScore >= 70) {
    multiplier = 0.5;
    advice = 'MINIMUM';
    reason = 'Heavy clumping - unpredictable, reduce exposure';
  }
  // High streak with positive count
  else if (momentum.trend === 'HIGH_STREAK' && trueCount >= 2) {
    multiplier = 1.5;
    advice = 'INCREASE';
    reason = 'High streak + positive count - favorable for blackjacks';
  }
  // High streak with negative count (contradiction)
  else if (momentum.trend === 'HIGH_STREAK' && trueCount < 0) {
    multiplier = 0.75;
    advice = 'REDUCE';
    reason = 'High streak but negative count - conflicting signals';
  }
  // Low streak (generally unfavorable)
  else if (momentum.trend === 'LOW_STREAK') {
    multiplier = 0.75;
    advice = 'REDUCE';
    reason = 'Low streak - reduced blackjack/double potential';
  }
  // Mild clumping
  else if (clumpScore >= 55) {
    multiplier = 0.85;
    advice = 'SLIGHT_REDUCE';
    reason = 'Mild clumping detected';
  }

  return {
    multiplier: Math.round(multiplier * 100) / 100,
    advice,
    reason,
    baseOnCount: trueCount >= 1 ? 'POSITIVE' : trueCount <= -1 ? 'NEGATIVE' : 'NEUTRAL'
  };
}

/**
 * Main Clumping Probability Engine computation
 *
 * @param {object} context - Engine context with shoeState, recentCards, etc.
 * @returns {object} Complete clumping analysis and recommendations
 */
export function computeClumpingProbabilityEngine(context) {
  const shoeState = context.shoeState || {};
  const recentCards = context.recentCards || [];
  const playerTotal = context.playerTotal || 0;
  const dealerUpcard = context.dealerUpcard || null;
  const isSoft = context.isSoft || false;
  const canDouble = context.canDouble ?? true;
  const canSplit = context.canSplit || false;
  const trueCount = context.trueCount || 0;
  const clumpScore = context.clumpScore || 50;

  // Calculate momentum
  const momentum = calculateClumpMomentum(recentCards);

  // Calculate adjusted EVs if we have hand info
  let evAnalysis = null;
  if (playerTotal > 0 && dealerUpcard) {
    evAnalysis = calculateClumpAdjustedEV(playerTotal, dealerUpcard, momentum, shoeState);
  }

  // Get strategy recommendation
  let strategy = null;
  if (playerTotal > 0 && dealerUpcard) {
    strategy = getClumpStrategy(playerTotal, dealerUpcard, isSoft, canDouble, canSplit, momentum);
  }

  // Get betting advice
  const betting = getClumpBettingAdvice(momentum, trueCount, clumpScore);

  return {
    engineId: 'clumpingProbability',
    name: 'Clumping Probability Engine',
    version: '1.0',

    // Momentum analysis
    momentum: {
      trend: momentum.trend,
      highStreak: momentum.highStreak,
      lowStreak: momentum.lowStreak,
      highMomentum: Math.round(momentum.highMomentum * 100),
      lowMomentum: Math.round(momentum.lowMomentum * 100)
    },

    // EV analysis (if hand provided)
    ev: evAnalysis,

    // Strategy recommendation (if hand provided)
    strategy,

    // Betting recommendation
    betting,

    // Signals
    signals: {
      inHighStreak: momentum.trend === 'HIGH_STREAK',
      inLowStreak: momentum.trend === 'LOW_STREAK',
      clumpScore,
      isClumped: clumpScore >= 55,
      isHeavilyClumped: clumpScore >= 70
    }
  };
}

/**
 * Quick strategy lookup for clumped shoes
 * Returns simple action without full computation
 */
export function getQuickClumpAction(playerTotal, dealerUpcard, recentCards) {
  const momentum = calculateClumpMomentum(recentCards);
  return getClumpStrategy(playerTotal, dealerUpcard, false, true, false, momentum);
}
