/**
 * Clumping Probability Engine v1.1 (CALIBRATED)
 *
 * A specialized probability engine for clumped card shoes.
 * Unlike standard counting which assumes random distribution,
 * this engine accounts for card clustering patterns.
 *
 * KEY INSIGHT (v1.1 - Based on 95-game analysis):
 * Heavy clumping correlates with HIGH VARIANCE outcomes.
 * In this shoe type (301-412), clumping = MORE volatility = bigger swings.
 * The biggest wins AND losses occurred during heavy clump detection.
 *
 * CALIBRATION FIX: Instead of reducing bets during clumping,
 * we INCREASE bets during high clump when count is favorable,
 * and REDUCE only when count is negative.
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

// ============================================
// TEAMPLAY CLUMP INTEGRATION v1.1
// P3: Front Shield | P4: Quant EV | P5: Rear Shield
// ============================================

/**
 * P3 BOOSTER with Clump Awareness
 * Front Shield - removes harmful cards BEFORE P4
 *
 * HIGH CLUMP: More aggressive - absorb 10s to protect P4 from busting
 * LOW CLUMP: Less aggressive - let low cards pass (safe for P4 hitting)
 */
export function getP3ClumpBoosterStrategy(playerTotal, dealerUpcard, momentum, tc = 0) {
  const dealerVal = dealerUpcard === 'A' ? 11 :
    ['J','Q','K','10'].includes(dealerUpcard) ? 10 : parseInt(dealerUpcard) || 0;
  const weakDealer = dealerVal >= 2 && dealerVal <= 6;

  let action = 'STAND';
  let intent = 'PRESERVE';
  let aggressionMod = 0;
  let reason = '';

  // Clump-based aggression modifier
  if (momentum.trend === 'HIGH_STREAK') {
    // High cards coming - absorb them to protect P4
    aggressionMod = 25;

    if (playerTotal >= 12 && playerTotal <= 16) {
      if (weakDealer) {
        // Dealer will bust with high cards too, but absorb to control
        action = 'HIT';
        intent = 'CLUMP_ABSORB_HIGH';
        reason = `P3 Clump: Absorb 10s (streak ${momentum.highStreak}), protect P4`;
      } else {
        // Strong dealer - P4 needs high cards, but we might bust
        action = playerTotal <= 14 ? 'HIT' : 'STAND';
        intent = action === 'HIT' ? 'CONTROLLED_ABSORB' : 'PRESERVE_FOR_P4';
        reason = action === 'HIT'
          ? `P3 Clump: Controlled absorb ${playerTotal} vs ${dealerVal}`
          : `P3 Clump: Preserve high cards for P4 vs ${dealerVal}`;
      }
    } else if (playerTotal === 10 || playerTotal === 11) {
      // Good double spot, but P4 might need it more
      action = tc >= 2 ? 'STAND' : 'HIT';
      intent = tc >= 2 ? 'PRESERVE_DOUBLE_FOR_P4' : 'BUILD_HAND';
      reason = tc >= 2
        ? `P3 Clump: TC+${tc}, let P4 have double opportunity`
        : `P3 Clump: Build hand, deck favors hitting`;
    }
  }
  else if (momentum.trend === 'LOW_STREAK') {
    // Low cards coming - let them pass to P4 (safe for hitting)
    aggressionMod = -15;

    if (playerTotal >= 12 && playerTotal <= 16) {
      // Stand more - let low cards flow to P4
      action = 'STAND';
      intent = 'LET_LOWS_PASS';
      reason = `P3 Clump: Low streak (${momentum.lowStreak}), let safe cards reach P4`;
    } else if (playerTotal <= 11) {
      action = 'HIT';
      intent = 'SAFE_BUILD';
      reason = `P3 Clump: Safe hit in low streak`;
    }
  }
  else {
    // Neutral - standard booster logic
    if (playerTotal <= 11) {
      action = 'HIT';
      intent = 'BUILD_HAND';
      reason = 'P3: Standard build';
    } else if (playerTotal >= 17) {
      action = 'STAND';
      intent = 'SOLID_HAND';
      reason = 'P3: Solid hand, stand';
    } else {
      action = weakDealer ? 'HIT' : 'STAND';
      intent = weakDealer ? 'ABSORB_BUST_CARD' : 'STANDARD';
      reason = weakDealer
        ? `P3: Absorb bust cards vs weak ${dealerVal}`
        : `P3: Stand vs strong ${dealerVal}`;
    }
  }

  return {
    action,
    intent,
    aggressionMod,
    reason,
    momentum: momentum.trend,
    playerType: 'P3_BOOSTER'
  };
}

/**
 * P4 QUANT EV with Clump Awareness
 * The winning player - maximizes EV with count + clump deviations
 *
 * HIGH CLUMP: DOUBLE aggressively on 10-11, stand more on 12-16
 * LOW CLUMP: HIT more on 12-16 (safe), skip doubles
 */
export function getP4ClumpQuantEVStrategy(playerTotal, dealerUpcard, momentum, tc = 0, canDouble = true) {
  const dealerVal = dealerUpcard === 'A' ? 11 :
    ['J','Q','K','10'].includes(dealerUpcard) ? 10 : parseInt(dealerUpcard) || 0;
  const weakDealer = dealerVal >= 2 && dealerVal <= 6;

  let action = 'STAND';
  let reason = '';
  let confidence = 0.8;
  let betMultiplier = 1.0;

  if (momentum.trend === 'HIGH_STREAK') {
    // High cards coming - prime conditions for P4
    confidence = 0.92;

    // DOUBLE AGGRESSIVELY
    if (playerTotal === 11) {
      action = canDouble ? 'DOUBLE' : 'HIT';
      reason = `P4 Clump: DOUBLE 11 (high streak ${momentum.highStreak}) - 10s coming!`;
      betMultiplier = 1.5;
      confidence = 0.95;
    }
    else if (playerTotal === 10 && dealerVal <= 9) {
      action = canDouble ? 'DOUBLE' : 'HIT';
      reason = `P4 Clump: DOUBLE 10 vs ${dealerVal} - high cards favor us`;
      betMultiplier = 1.4;
      confidence = 0.92;
    }
    else if (playerTotal === 9 && dealerVal >= 3 && dealerVal <= 6 && tc >= 1) {
      action = canDouble ? 'DOUBLE' : 'HIT';
      reason = `P4 Clump: DOUBLE 9 vs weak ${dealerVal} (TC+${tc}, high streak)`;
      betMultiplier = 1.3;
      confidence = 0.85;
    }
    // STAND MORE ON STIFFS
    else if (playerTotal >= 12 && playerTotal <= 16) {
      if (dealerVal >= 7) {
        // Normally hit, but high cards will bust us AND dealer
        action = playerTotal >= 15 ? 'STAND' : 'HIT';
        reason = playerTotal >= 15
          ? `P4 Clump: STAND ${playerTotal} vs ${dealerVal} - both bust with 10s`
          : `P4 Clump: Must hit ${playerTotal} vs ${dealerVal}`;
        confidence = 0.85;
      } else {
        action = 'STAND';
        reason = `P4 Clump: STAND ${playerTotal} - dealer ${dealerVal} busts with high cards`;
        confidence = 0.88;
      }
    }
    else if (playerTotal >= 17) {
      action = 'STAND';
      reason = `P4 Clump: Solid ${playerTotal}, stand`;
    }
    else if (playerTotal <= 8) {
      action = 'HIT';
      reason = `P4 Clump: Hit ${playerTotal} for big hand`;
    }
  }
  else if (momentum.trend === 'LOW_STREAK') {
    // Low cards coming - be cautious with doubles, hit more
    confidence = 0.82;
    betMultiplier = 0.85;

    // SKIP DOUBLES
    if (playerTotal === 11 || playerTotal === 10) {
      action = 'HIT';
      reason = `P4 Clump: HIT ${playerTotal} (low streak ${momentum.lowStreak}) - skip double`;
      confidence = 0.8;
    }
    // HIT MORE ON STIFFS
    else if (playerTotal >= 12 && playerTotal <= 16) {
      action = 'HIT';
      reason = `P4 Clump: HIT ${playerTotal} - low cards safe, won't bust`;
      confidence = 0.85;
    }
    else if (playerTotal >= 17) {
      action = 'STAND';
      reason = `P4 Clump: Stand ${playerTotal}`;
    }
    else {
      action = 'HIT';
      reason = `P4 Clump: Hit ${playerTotal}`;
    }
  }
  else {
    // Neutral - standard Quant EV with TC deviations
    if (playerTotal === 11) {
      action = canDouble ? 'DOUBLE' : 'HIT';
      reason = 'P4 QEV: Double 11';
      confidence = 0.9;
    } else if (playerTotal === 10 && dealerVal <= 9) {
      action = canDouble ? 'DOUBLE' : 'HIT';
      reason = `P4 QEV: Double 10 vs ${dealerVal}`;
      confidence = 0.88;
    } else if (playerTotal >= 17) {
      action = 'STAND';
      reason = 'P4 QEV: Stand 17+';
    } else if (playerTotal >= 13 && playerTotal <= 16 && weakDealer) {
      action = 'STAND';
      reason = `P4 QEV: Stand ${playerTotal} vs weak ${dealerVal}`;
    } else if (playerTotal >= 12 && dealerVal >= 7) {
      action = 'HIT';
      reason = `P4 QEV: Hit ${playerTotal} vs strong ${dealerVal}`;
    } else if (playerTotal <= 11) {
      action = 'HIT';
      reason = `P4 QEV: Hit ${playerTotal}`;
    }
  }

  return {
    action,
    reason,
    confidence,
    betMultiplier,
    momentum: momentum.trend,
    playerType: 'P4_QUANT_EV'
  };
}

/**
 * P5 PURE SACRIFICE - Clump Aware v1.3
 *
 * ULTIMATE ROLE: P5 exists ONLY to manipulate card flow for P4 (Quant EV).
 * P5 is NOT intended to win. P5's job is to:
 *   1. INCREASE dealer bust probability
 *   2. DENY dealer good cards
 *   3. PROTECT P4 from unfavorable situations
 *
 * STRATEGY PHILOSOPHY:
 * - HIGH_STREAK: Aggressively absorb 10s (even bust yourself) to deny dealer
 * - LOW_STREAK: Stand and let dealer take low cards (helps dealer NOT bust = bad for P4)
 * - Always use MINIMUM bet (P5 expected to lose for team benefit)
 *
 * P5 sacrifices personal EV so P4 can maximize team profit.
 */
export function getP5ClumpSacrificeStrategy(playerTotal, dealerUpcard, momentum, tc = 0, isSoft = false) {
  const dealerVal = dealerUpcard === 'A' ? 11 :
    ['J','Q','K','10'].includes(dealerUpcard) ? 10 : parseInt(dealerUpcard) || 0;
  const weakDealer = dealerVal >= 2 && dealerVal <= 6;
  const strongDealer = dealerVal >= 7 || dealerVal === 11;

  let action = 'STAND';
  let intent = 'NEUTRAL';
  let reason = '';
  let hitHard17 = false;
  let hitHard18 = false;
  let hitHard19 = false;

  // P5 ALWAYS uses minimum bet - sacrifice player
  const betMultiplier = 0.5; // Table minimum

  // ============================================
  // HIGH_STREAK: ABSORB 10s TO MAKE DEALER BUST
  // ============================================
  if (momentum.trend === 'HIGH_STREAK') {
    const streakStrength = momentum.highStreak || 3;

    if (weakDealer) {
      // Dealer showing 2-6: Will bust with 10s
      // P5's job: Absorb some 10s, but leave enough for dealer to bust

      if (playerTotal <= 11) {
        // Safe to hit - can't bust, absorb a card
        action = 'HIT';
        intent = 'SAFE_ABSORB';
        reason = `P5 SAC: Absorb card (${playerTotal}), dealer ${dealerVal} still gets bust cards`;
      }
      else if (playerTotal >= 12 && playerTotal <= 16) {
        // Key decision: absorb 10 (bust) or let it go to dealer (dealer busts)
        // With weak dealer, let 10s flow to dealer to bust them
        action = 'STAND';
        intent = 'FEED_DEALER_BUST_CARD';
        reason = `P5 SAC: STAND ${playerTotal} - let 10 reach dealer ${dealerVal} to BUST`;
      }
      else if (playerTotal === 17 || playerTotal === 18) {
        // Dealer will bust anyway, but absorbing denies dealer the bust card
        // ONLY hit if TC is very high (lots of 10s remaining for dealer)
        if (tc >= 4) {
          action = 'STAND';
          intent = 'ENOUGH_TENS_FOR_DEALER';
          reason = `P5 SAC: TC+${tc} = plenty 10s for dealer bust, stand ${playerTotal}`;
        } else {
          action = 'STAND';
          intent = 'LET_DEALER_BUST';
          reason = `P5 SAC: Stand ${playerTotal}, dealer ${dealerVal} will bust`;
        }
      }
      else {
        action = 'STAND';
        intent = 'SOLID_HAND';
        reason = `P5 SAC: ${playerTotal} solid, await dealer bust`;
      }
    }
    else {
      // Dealer showing 7-A: Strong dealer needs 10 to make good hand
      // P5's job: ABSORB 10s to DENY dealer from making 17-21

      if (playerTotal <= 11) {
        action = 'HIT';
        intent = 'ABSORB_DENY_DEALER';
        reason = `P5 SAC: Absorb card, deny dealer ${dealerVal} from improving`;
      }
      else if (playerTotal >= 12 && playerTotal <= 14) {
        // Absorb 10 - we bust, but dealer doesn't get it
        action = 'HIT';
        intent = 'SACRIFICE_ABSORB';
        reason = `P5 SAC: HIT ${playerTotal} - ABSORB 10, deny dealer ${dealerVal}!`;
      }
      else if (playerTotal === 15 || playerTotal === 16) {
        // High value sacrifice - absorb if TC supports it
        if (tc >= 2 || streakStrength >= 4) {
          action = 'HIT';
          intent = 'HIGH_VALUE_SACRIFICE';
          reason = `P5 SAC: HIT ${playerTotal}! Streak ${streakStrength}, absorb 10 from dealer ${dealerVal}`;
        } else {
          action = 'STAND';
          intent = 'MARGINAL_STAND';
          reason = `P5 SAC: Stand ${playerTotal}, marginal sacrifice value`;
        }
      }
      else if (playerTotal === 17) {
        // EXTREME SACRIFICE: Hit hard 17 to absorb 10
        if (tc >= 3 || streakStrength >= 5) {
          action = 'HIT';
          intent = 'EXTREME_SACRIFICE_17';
          hitHard17 = true;
          reason = `P5 SAC: HIT HARD 17! TC+${tc}, deny dealer ${dealerVal} the 10!`;
        } else {
          action = 'STAND';
          intent = 'STAND_17';
          reason = `P5 SAC: Stand 17 vs ${dealerVal}`;
        }
      }
      else if (playerTotal === 18) {
        // ULTRA SACRIFICE: Hit hard 18 only in extreme situations
        if (tc >= 5 && streakStrength >= 5 && dealerVal === 10) {
          action = 'HIT';
          intent = 'ULTRA_SACRIFICE_18';
          hitHard18 = true;
          reason = `P5 SAC: HIT HARD 18! Extreme clump, deny dealer 10 their second 10!`;
        } else {
          action = 'STAND';
          intent = 'STAND_18';
          reason = `P5 SAC: Stand 18 vs ${dealerVal}`;
        }
      }
      else {
        action = 'STAND';
        intent = 'SOLID_VS_STRONG';
        reason = `P5 SAC: ${playerTotal} vs ${dealerVal}, solid`;
      }
    }
  }

  // ============================================
  // LOW_STREAK: LET DEALER TAKE LOW CARDS
  // ============================================
  else if (momentum.trend === 'LOW_STREAK') {
    // Low cards coming - they HELP dealer make hands (not bust)
    // P5's job: STAND and let dealer absorb the low cards
    // This way dealer makes 17-20 instead of P4 facing a bust situation
    // Wait... that's BAD for P4. Let me reconsider.
    //
    // Actually: If low cards are coming and dealer has weak card:
    // - Dealer draws low, gets 12-16, draws again, might survive
    // - P5 should ABSORB lows so dealer draws into bust range later
    //
    // If dealer has strong card (7-A):
    // - Dealer + low = 12-17 range, needs another card
    // - Low cards help dealer slowly build without busting
    // - P5 should ABSORB lows to deny dealer safe builds

    if (weakDealer) {
      // Dealer showing 2-6 + low streak = dealer might survive
      // P5 should absorb lows so dealer eventually hits a 10 and busts

      if (playerTotal <= 11) {
        action = 'HIT';
        intent = 'ABSORB_LOWS_SAFE';
        reason = `P5 SAC: Absorb low cards, force dealer ${dealerVal} to draw into 10s later`;
      }
      else if (playerTotal >= 12 && playerTotal <= 16) {
        // Absorb low cards - won't bust us, denies dealer survival cards
        action = 'HIT';
        intent = 'ABSORB_DEALER_SURVIVAL_CARDS';
        reason = `P5 SAC: HIT ${playerTotal} - absorb lows, deny dealer ${dealerVal} survival`;
      }
      else {
        action = 'STAND';
        intent = 'LET_DEALER_DRAW';
        reason = `P5 SAC: Stand ${playerTotal}, let dealer draw`;
      }
    }
    else {
      // Dealer showing 7-A + low streak = dealer builds safely
      // P5 should absorb lows to deny dealer safe building cards

      if (playerTotal <= 11) {
        action = 'HIT';
        intent = 'DENY_DEALER_BUILD';
        reason = `P5 SAC: Hit ${playerTotal}, absorb lows from dealer ${dealerVal}`;
      }
      else if (playerTotal >= 12 && playerTotal <= 15) {
        // Safe to hit in low streak - absorb dealer's building cards
        action = 'HIT';
        intent = 'SAFE_HIT_LOW_STREAK';
        reason = `P5 SAC: HIT ${playerTotal} - low streak safe, deny dealer ${dealerVal}`;
      }
      else if (playerTotal === 16) {
        // Marginal - low card might help us too
        action = 'HIT';
        intent = 'ABSORB_BUILD_CARD';
        reason = `P5 SAC: HIT 16 - absorb low, deny dealer ${dealerVal} build card`;
      }
      else {
        action = 'STAND';
        intent = 'HAND_COMPLETE';
        reason = `P5 SAC: Stand ${playerTotal} vs ${dealerVal}`;
      }
    }
  }

  // ============================================
  // NEUTRAL: Standard sacrifice play
  // ============================================
  else {
    if (weakDealer) {
      if (playerTotal <= 11) {
        action = 'HIT';
        intent = 'BUILD';
        reason = `P5 SAC: Build hand vs weak ${dealerVal}`;
      }
      else if (playerTotal >= 12) {
        action = 'STAND';
        intent = 'AWAIT_BUST';
        reason = `P5 SAC: Stand ${playerTotal}, dealer ${dealerVal} busts`;
      }
    }
    else {
      if (playerTotal <= 16) {
        action = 'HIT';
        intent = 'MUST_HIT';
        reason = `P5 SAC: Hit ${playerTotal} vs strong ${dealerVal}`;
      }
      else {
        action = 'STAND';
        intent = 'COMPETE';
        reason = `P5 SAC: Stand ${playerTotal} vs ${dealerVal}`;
      }
    }
  }

  // ============================================
  // SOFT HAND HANDLING
  // ============================================
  if (isSoft && playerTotal <= 17) {
    // Soft hands can absorb cards without busting - perfect for sacrifice
    if (momentum.trend === 'HIGH_STREAK' && strongDealer) {
      action = 'HIT';
      intent = 'SOFT_ABSORB_HIGH';
      reason = `P5 SAC: Hit soft ${playerTotal} - absorb 10, deny dealer ${dealerVal}`;
    }
    else if (momentum.trend === 'LOW_STREAK') {
      action = 'HIT';
      intent = 'SOFT_ABSORB_LOW';
      reason = `P5 SAC: Hit soft ${playerTotal} - absorb low, deny dealer build`;
    }
  }

  return {
    action,
    intent,
    reason,
    hitHard17,
    hitHard18,
    hitHard19,
    betMultiplier,  // Always 0.5 (minimum)
    momentum: momentum.trend,
    playerType: 'P5_PURE_SACRIFICE'
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
 * CALIBRATED v1.1: Based on 95-game analysis showing:
 * - Heavy clumping = high volatility (big wins AND big losses)
 * - Best strategy: INCREASE bets during clumping when count is favorable
 * - Reduce only when count is clearly negative
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

  // CALIBRATED v1.1: Heavy clumping = volatility amplifier
  // Use count to determine direction, clumping to determine magnitude
  if (clumpScore >= 70) {
    if (trueCount >= 1) {
      // Heavy clump + positive count = MAXIMIZE (ride the variance)
      multiplier = 1.5;
      advice = 'AGGRESSIVE';
      reason = 'Heavy clumping + positive count - high variance favorable';
    } else if (trueCount <= -2) {
      // Heavy clump + negative count = MINIMIZE (avoid negative variance)
      multiplier = 0.5;
      advice = 'MINIMUM';
      reason = 'Heavy clumping + negative count - avoid downswing';
    } else {
      // Heavy clump + neutral count = slight increase (variance tends positive)
      multiplier = 1.25;
      advice = 'INCREASE';
      reason = 'Heavy clumping detected - volatility opportunity';
    }
  }
  // High streak with positive count - excellent spot
  else if (momentum.trend === 'HIGH_STREAK' && trueCount >= 2) {
    multiplier = 1.75;
    advice = 'MAXIMUM';
    reason = 'High streak + strong count - prime blackjack conditions';
  }
  // High streak with positive/neutral count
  else if (momentum.trend === 'HIGH_STREAK' && trueCount >= 0) {
    multiplier = 1.35;
    advice = 'INCREASE';
    reason = 'High streak - favorable for 10s and blackjacks';
  }
  // High streak with negative count
  else if (momentum.trend === 'HIGH_STREAK' && trueCount < 0) {
    multiplier = 1.0;
    advice = 'STANDARD';
    reason = 'High streak but negative count - mixed signals, stay flat';
  }
  // Low streak - depends on count
  else if (momentum.trend === 'LOW_STREAK') {
    if (trueCount >= 2) {
      multiplier = 1.1;
      advice = 'SLIGHT_INCREASE';
      reason = 'Low streak ending soon with positive count';
    } else {
      multiplier = 0.85;
      advice = 'SLIGHT_REDUCE';
      reason = 'Low streak - reduced double/blackjack potential';
    }
  }
  // Mild clumping (55-69) - slight advantage
  else if (clumpScore >= 55) {
    if (trueCount >= 1) {
      multiplier = 1.2;
      advice = 'INCREASE';
      reason = 'Mild clumping + positive count';
    } else {
      multiplier = 1.0;
      advice = 'STANDARD';
      reason = 'Mild clumping - stay alert';
    }
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
