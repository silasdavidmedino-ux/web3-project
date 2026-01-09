/**
 * BJ Probability Engine - PRE-DEAL ENGINE TEST
 * Tests all probability metrics throughout a shoe
 */

// ============================================
// Game State
// ============================================
const AppState = {
  numDecks: 8,
  totalCards: 416,
  cardsDealt: 0,
  runningCount: 0,

  rankCounts: {
    '2': 32, '3': 32, '4': 32, '5': 32, '6': 32,
    '7': 32, '8': 32, '9': 32, '10': 128, 'A': 32
  },

  initialCounts: {
    '2': 32, '3': 32, '4': 32, '5': 32, '6': 32,
    '7': 32, '8': 32, '9': 32, '10': 128, 'A': 32
  },

  rankSeen: {
    '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
    '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0
  },

  config: {
    anyPairPayout: 12,
    seatAlpha: 0.04,
    windowScoreThreshold: 65,
    kellyFraction: 0.50,
    cbsK: 0.45,
    playersSeated: 7,
    seatIndex: 1,
    handsPerHour: 120,
    minProfitPerHour: 0.5
  }
};

// ============================================
// Card Functions
// ============================================
function dealRandomCard() {
  const remaining = AppState.totalCards - AppState.cardsDealt;
  if (remaining <= 0) return null;

  const available = [];
  for (const rank in AppState.rankCounts) {
    for (let i = 0; i < AppState.rankCounts[rank]; i++) {
      available.push(rank);
    }
  }

  if (available.length === 0) return null;

  const idx = Math.floor(Math.random() * available.length);
  const card = available[idx];

  AppState.rankCounts[card]--;
  AppState.rankSeen[card]++;
  AppState.cardsDealt++;

  // Hi-Lo count
  if (['2','3','4','5','6'].includes(card)) AppState.runningCount++;
  else if (['10','A'].includes(card)) AppState.runningCount--;

  return card;
}

function getCardsRemaining() {
  return AppState.totalCards - AppState.cardsDealt;
}

// ============================================
// PRE-DEAL PROBABILITY ENGINES
// ============================================

// 1. True Count
function getTrueCount() {
  const decksRemaining = (AppState.totalCards - AppState.cardsDealt) / 52;
  if (decksRemaining < 0.5) return AppState.runningCount / 0.5;
  return AppState.runningCount / decksRemaining;
}

// 2. Penetration
function getPenetration() {
  return (AppState.cardsDealt / AppState.totalCards) * 100;
}

// 3. P(Win) - Estimated win probability
function getPWin() {
  const tc = getTrueCount();
  // Base win rate ~42%, adjusted by true count
  return 0.42 + (tc * 0.005);
}

// 4. Expected Value
function getEV() {
  const tc = getTrueCount();
  // House edge ~0.5%, improved by true count
  return -0.005 + (tc * 0.005);
}

// 5. P(Tens) - Probability of drawing a ten-value card
function getPTens() {
  const remaining = getCardsRemaining();
  if (remaining <= 0) return 0;
  return AppState.rankCounts['10'] / remaining;
}

// 6. P(Aces) - Probability of drawing an ace
function getPAces() {
  const remaining = getCardsRemaining();
  if (remaining <= 0) return 0;
  return AppState.rankCounts['A'] / remaining;
}

// 7. P(7-A) - Probability of drawing 7 through Ace
function getP7A() {
  const remaining = getCardsRemaining();
  if (remaining <= 0) return 0;
  const count7A = AppState.rankCounts['7'] + AppState.rankCounts['8'] +
                  AppState.rankCounts['9'] + AppState.rankCounts['10'] + AppState.rankCounts['A'];
  return count7A / remaining;
}

// 8. S-Score (Composition bias indicator)
function getSScore() {
  const remaining = getCardsRemaining();
  if (remaining <= 0) return 0;

  // Calculate imbalance between high and low cards
  const lowCards = AppState.rankCounts['2'] + AppState.rankCounts['3'] +
                   AppState.rankCounts['4'] + AppState.rankCounts['5'] + AppState.rankCounts['6'];
  const highCards = AppState.rankCounts['10'] + AppState.rankCounts['A'];

  const totalTensAces = highCards;
  const expectedRatio = (AppState.numDecks * 20) / AppState.totalCards;
  const actualRatio = totalTensAces / remaining;

  return actualRatio - expectedRatio;
}

// 9. Composition Bias Active
function isCompBiasActive() {
  const sScore = Math.abs(getSScore());
  return AppState.numDecks >= 4 && sScore > 0.012;
}

// 10. Any Pair Probability
function getAnyPairProb() {
  const remaining = getCardsRemaining();
  if (remaining < 2) return 0;

  let pPair = 0;
  for (const rank in AppState.rankCounts) {
    const count = AppState.rankCounts[rank];
    if (count >= 2) {
      pPair += (count / remaining) * ((count - 1) / (remaining - 1));
    }
  }
  return pPair;
}

// 11. Any Pair EV
function getAnyPairEV() {
  const pPair = getAnyPairProb();
  const payout = AppState.config.anyPairPayout;
  return pPair * payout - (1 - pPair);
}

// 12. Seat Adjustment
function getSeatAdjustment() {
  const { playersSeated, seatIndex, seatAlpha } = AppState.config;
  if (playersSeated <= 1) return 1;
  const rel = (seatIndex - 1) / (playersSeated - 1);
  return 1 + seatAlpha * rel;
}

// 13. Window Score
function getWindowScore() {
  const anyPairEV = getAnyPairEV();
  const tc = getTrueCount();

  let score = 50;
  score += Math.max(-30, Math.min(40, anyPairEV * 120));
  score += Math.max(-10, Math.min(20, tc * 5));

  return Math.max(0, Math.min(100, score));
}

// 14. Window Decision (BET / NO_BET)
function getWindowDecision() {
  const score = getWindowScore();
  const threshold = AppState.config.windowScoreThreshold;
  const anyPairEV = getAnyPairEV();

  if (anyPairEV > 0 && score >= threshold) return 'BET';
  return 'NO_BET';
}

// 15. Kelly Fraction
function getKellyFraction() {
  const ev = getAnyPairEV();
  const baseFrac = AppState.config.kellyFraction;

  if (ev <= 0) return 0;

  const edge = ev;
  const odds = AppState.config.anyPairPayout;
  const kelly = edge / odds;

  return Math.min(baseFrac, Math.max(0, kelly));
}

// 16. 21+3 EV
function get21P3EV() {
  const tc = getTrueCount();
  return -0.034 + (tc * 0.002);
}

// 17. Temporal Recommendation
function getTemporalRec() {
  const ev = getAnyPairEV();
  const pen = getPenetration();

  if (ev < -0.05 && pen < 50) return 'EXIT';
  if (ev > 0.02) return 'STAY+';
  return 'STAY';
}

// 18. CBS (Conditional Bet Suppression) Filter
function getCBSFilter() {
  const tc = getTrueCount();
  const k = AppState.config.cbsK;
  const volatility = Math.abs(tc) * 0.1;

  if (volatility > k) return 'SUPPRESS';
  return 'ALLOW';
}

// 19. Insurance EV (when dealer shows Ace)
function getInsuranceEV() {
  const remaining = getCardsRemaining();
  if (remaining <= 0) return -1;

  const pTen = AppState.rankCounts['10'] / remaining;
  // Insurance pays 2:1, costs 0.5 units
  return (pTen * 2) - (1 - pTen);
}

// 20. Blackjack Probability
function getBlackjackProb() {
  const remaining = getCardsRemaining();
  if (remaining < 2) return 0;

  const pTen = AppState.rankCounts['10'] / remaining;
  const pAce = AppState.rankCounts['A'] / remaining;

  // P(BJ) = P(Ace first)*P(Ten second) + P(Ten first)*P(Ace second)
  const pAceFirst = pAce * (AppState.rankCounts['10'] / (remaining - 1));
  const pTenFirst = pTen * (AppState.rankCounts['A'] / (remaining - 1));

  return pAceFirst + pTenFirst;
}

// 21. Deck Richness (High cards vs Low cards ratio)
function getDeckRichness() {
  const highCards = AppState.rankCounts['10'] + AppState.rankCounts['A'];
  const lowCards = AppState.rankCounts['2'] + AppState.rankCounts['3'] +
                   AppState.rankCounts['4'] + AppState.rankCounts['5'] + AppState.rankCounts['6'];

  if (lowCards === 0) return 999;
  return highCards / lowCards;
}

// 22. Advantage Estimate
function getAdvantageEstimate() {
  const tc = getTrueCount();
  const baseEdge = -0.005; // 0.5% house edge
  return baseEdge + (tc * 0.005);
}

// 23. Bet Ramp Recommendation
function getBetRamp() {
  const tc = getTrueCount();

  if (tc <= 0) return { units: 1, action: 'MIN' };
  if (tc >= 1 && tc < 2) return { units: 2, action: 'INCREASE' };
  if (tc >= 2 && tc < 3) return { units: 4, action: 'INCREASE' };
  if (tc >= 3 && tc < 4) return { units: 8, action: 'INCREASE' };
  if (tc >= 4) return { units: 12, action: 'MAX' };

  return { units: 1, action: 'MIN' };
}

// ============================================
// Get All Pre-Deal Metrics
// ============================================
function getAllPreDealMetrics() {
  const betRamp = getBetRamp();

  return {
    // Count System
    runningCount: AppState.runningCount,
    trueCount: getTrueCount(),

    // Penetration
    cardsDealt: AppState.cardsDealt,
    cardsRemaining: getCardsRemaining(),
    penetration: getPenetration(),
    decksRemaining: (getCardsRemaining() / 52),

    // Composition
    pTens: getPTens(),
    pAces: getPAces(),
    p7A: getP7A(),
    sScore: getSScore(),
    compBiasActive: isCompBiasActive(),
    deckRichness: getDeckRichness(),

    // Win Probability
    pWin: getPWin(),
    ev: getEV(),
    advantageEstimate: getAdvantageEstimate(),
    blackjackProb: getBlackjackProb(),

    // Side Bets
    anyPairProb: getAnyPairProb(),
    anyPairEV: getAnyPairEV(),
    insuranceEV: getInsuranceEV(),
    ev21p3: get21P3EV(),

    // Decision Engines
    windowScore: getWindowScore(),
    windowDecision: getWindowDecision(),
    kellyFraction: getKellyFraction(),
    cbsFilter: getCBSFilter(),
    temporalRec: getTemporalRec(),

    // Betting
    seatAdjustment: getSeatAdjustment(),
    betRampUnits: betRamp.units,
    betRampAction: betRamp.action
  };
}

// ============================================
// Run Simulation
// ============================================
console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║          BJ PROBABILITY ENGINE - PRE-DEAL ENGINE TEST                          ║');
console.log('║          Testing All Probability Metrics Throughout 1 Shoe                     ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

console.log(`Configuration: ${AppState.numDecks} decks | ${AppState.totalCards} cards | 75% penetration\n`);

// Store metrics at key points
const metricsLog = [];
const checkpoints = [0, 52, 104, 156, 208, 260, 312]; // Every deck + final

console.log('═'.repeat(85));
console.log('SIMULATING SHOE - COLLECTING METRICS AT EACH DECK...');
console.log('═'.repeat(85));

let cardsDealtInRound = 0;
const penetrationLimit = AppState.totalCards * 0.75;

// Initial metrics (fresh shoe)
metricsLog.push({ checkpoint: 'FRESH SHOE (0 cards)', ...getAllPreDealMetrics() });

// Deal cards and capture metrics at checkpoints
while (AppState.cardsDealt < penetrationLimit) {
  // Deal 6-8 cards per "round" (simulating 2 players + dealer)
  const cardsThisRound = 6 + Math.floor(Math.random() * 6);

  for (let i = 0; i < cardsThisRound && AppState.cardsDealt < penetrationLimit; i++) {
    dealRandomCard();
  }

  // Check if we crossed a checkpoint
  for (const cp of checkpoints) {
    if (AppState.cardsDealt >= cp && !metricsLog.find(m => m.checkpoint.includes(`${cp} cards`))) {
      const deckNum = Math.floor(cp / 52);
      metricsLog.push({
        checkpoint: `DECK ${deckNum + 1} (${AppState.cardsDealt} cards)`,
        ...getAllPreDealMetrics()
      });
    }
  }
}

// Final metrics
metricsLog.push({ checkpoint: `CUT CARD (${AppState.cardsDealt} cards)`, ...getAllPreDealMetrics() });

// ============================================
// Display Results
// ============================================

console.log('\n' + '═'.repeat(85));
console.log('                              METRICS SUMMARY');
console.log('═'.repeat(85));

// Count System
console.log('\n┌─────────────────────────────────────────────────────────────────────────────────┐');
console.log('│                            COUNT SYSTEM                                         │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
console.log('│ Checkpoint          │ RC    │ TC      │ Decks Rem │ Penetration │ Advantage    │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');

for (const m of metricsLog) {
  const cp = m.checkpoint.padEnd(20);
  const rc = String(m.runningCount).padStart(4);
  const tc = m.trueCount.toFixed(2).padStart(6);
  const dr = m.decksRemaining.toFixed(1).padStart(8);
  const pen = m.penetration.toFixed(1).padStart(10) + '%';
  const adv = (m.advantageEstimate >= 0 ? '+' : '') + (m.advantageEstimate * 100).toFixed(3) + '%';

  console.log(`│ ${cp} │ ${rc} │ ${tc} │ ${dr} │ ${pen} │ ${adv.padStart(11)} │`);
}
console.log('└─────────────────────────────────────────────────────────────────────────────────┘');

// Composition Metrics
console.log('\n┌─────────────────────────────────────────────────────────────────────────────────┐');
console.log('│                         COMPOSITION METRICS                                     │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
console.log('│ Checkpoint          │ P(10s)  │ P(Aces) │ P(7-A)  │ S-Score  │ Richness │ Bias │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');

for (const m of metricsLog) {
  const cp = m.checkpoint.padEnd(20);
  const pTens = (m.pTens * 100).toFixed(2).padStart(6) + '%';
  const pAces = (m.pAces * 100).toFixed(2).padStart(6) + '%';
  const p7A = (m.p7A * 100).toFixed(2).padStart(6) + '%';
  const sScore = m.sScore.toFixed(4).padStart(7);
  const rich = m.deckRichness.toFixed(2).padStart(7);
  const bias = m.compBiasActive ? 'YES' : 'NO ';

  console.log(`│ ${cp} │ ${pTens} │ ${pAces} │ ${p7A} │ ${sScore} │ ${rich} │ ${bias}  │`);
}
console.log('└─────────────────────────────────────────────────────────────────────────────────┘');

// Win Probability
console.log('\n┌─────────────────────────────────────────────────────────────────────────────────┐');
console.log('│                         WIN PROBABILITY                                         │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
console.log('│ Checkpoint          │ P(Win)  │ EV       │ P(BJ)    │ Insurance EV │ 21+3 EV   │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');

for (const m of metricsLog) {
  const cp = m.checkpoint.padEnd(20);
  const pWin = (m.pWin * 100).toFixed(2).padStart(6) + '%';
  const ev = (m.ev >= 0 ? '+' : '') + (m.ev * 100).toFixed(3).padStart(6) + '%';
  const pBJ = (m.blackjackProb * 100).toFixed(3).padStart(6) + '%';
  const insEV = (m.insuranceEV >= 0 ? '+' : '') + (m.insuranceEV * 100).toFixed(2).padStart(6) + '%';
  const ev21 = (m.ev21p3 >= 0 ? '+' : '') + (m.ev21p3 * 100).toFixed(3).padStart(6) + '%';

  console.log(`│ ${cp} │ ${pWin} │ ${ev} │ ${pBJ} │ ${insEV.padStart(11)} │ ${ev21.padStart(9)} │`);
}
console.log('└─────────────────────────────────────────────────────────────────────────────────┘');

// Side Bets
console.log('\n┌─────────────────────────────────────────────────────────────────────────────────┐');
console.log('│                         SIDE BET ANALYSIS                                       │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
console.log('│ Checkpoint          │ Any Pair % │ Any Pair EV │ Window Score │ Decision      │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');

for (const m of metricsLog) {
  const cp = m.checkpoint.padEnd(20);
  const apProb = (m.anyPairProb * 100).toFixed(3).padStart(9) + '%';
  const apEV = (m.anyPairEV >= 0 ? '+' : '') + (m.anyPairEV * 100).toFixed(3).padStart(6) + '%';
  const wScore = String(Math.round(m.windowScore)).padStart(11);
  const wDec = m.windowDecision.padEnd(12);

  console.log(`│ ${cp} │ ${apProb} │ ${apEV.padStart(10)} │ ${wScore} │ ${wDec} │`);
}
console.log('└─────────────────────────────────────────────────────────────────────────────────┘');

// Betting Recommendations
console.log('\n┌─────────────────────────────────────────────────────────────────────────────────┐');
console.log('│                       BETTING RECOMMENDATIONS                                   │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
console.log('│ Checkpoint          │ Bet Units │ Action   │ Kelly    │ CBS      │ Temporal    │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');

for (const m of metricsLog) {
  const cp = m.checkpoint.padEnd(20);
  const units = ('×' + m.betRampUnits).padStart(8);
  const action = m.betRampAction.padEnd(8);
  const kelly = m.kellyFraction.toFixed(4).padStart(7);
  const cbs = m.cbsFilter.padEnd(8);
  const temp = m.temporalRec.padEnd(10);

  console.log(`│ ${cp} │ ${units} │ ${action} │ ${kelly} │ ${cbs} │ ${temp} │`);
}
console.log('└─────────────────────────────────────────────────────────────────────────────────┘');

// Card Distribution
console.log('\n┌─────────────────────────────────────────────────────────────────────────────────┐');
console.log('│                       FINAL CARD DISTRIBUTION                                   │');
console.log('├─────────────────────────────────────────────────────────────────────────────────┤');

console.log('│ Rank │ Initial │ Remaining │ Seen │ % Remaining │');
console.log('├──────┼─────────┼───────────┼──────┼─────────────┤');

for (const rank of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A']) {
  const initial = AppState.initialCounts[rank];
  const remaining = AppState.rankCounts[rank];
  const seen = AppState.rankSeen[rank];
  const pctRem = ((remaining / initial) * 100).toFixed(1);

  console.log(`│  ${rank.padEnd(3)} │   ${String(initial).padStart(3)}   │     ${String(remaining).padStart(3)}   │  ${String(seen).padStart(3)} │    ${pctRem.padStart(5)}%    │`);
}
console.log('└──────┴─────────┴───────────┴──────┴─────────────┘');

// Summary
console.log('\n' + '═'.repeat(85));
console.log('                              ENGINE SUMMARY');
console.log('═'.repeat(85));

const finalMetrics = metricsLog[metricsLog.length - 1];
console.log(`
FINAL STATE:
  Running Count:     ${finalMetrics.runningCount}
  True Count:        ${finalMetrics.trueCount.toFixed(2)}
  Penetration:       ${finalMetrics.penetration.toFixed(1)}%

PLAYER ADVANTAGE:
  EV:                ${(finalMetrics.ev * 100).toFixed(3)}%
  P(Win):            ${(finalMetrics.pWin * 100).toFixed(2)}%
  Advantage:         ${(finalMetrics.advantageEstimate * 100).toFixed(3)}%

SIDE BETS:
  Any Pair EV:       ${(finalMetrics.anyPairEV * 100).toFixed(3)}%
  Window Decision:   ${finalMetrics.windowDecision}
  Window Score:      ${Math.round(finalMetrics.windowScore)}

BETTING:
  Bet Ramp:          ${finalMetrics.betRampAction} ×${finalMetrics.betRampUnits}
  Kelly Fraction:    ${finalMetrics.kellyFraction.toFixed(4)}
  CBS Filter:        ${finalMetrics.cbsFilter}
  Temporal:          ${finalMetrics.temporalRec}
`);

console.log('═'.repeat(85));
console.log('PRE-DEAL ENGINE TEST COMPLETE');
console.log('═'.repeat(85));
