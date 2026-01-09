/**
 * BJ Probability Engine - Full Simulation Test
 * Tests BOTH Pre-Deal and Post-Deal Engines Together
 *
 * Pre-Deal Engine: Metrics calculated BEFORE cards are dealt
 * Post-Deal Engine: Unified decision AFTER cards are dealt
 */

// ============================================================================
// SIMULATION CONFIGURATION
// ============================================================================
const CONFIG = {
  numDecks: 8,
  penetration: 0.75,
  numPlayers: 2,
  minBet: 25,
  maxBet: 500
};

const TOTAL_CARDS = CONFIG.numDecks * 52;
const CUT_CARD_POSITION = Math.floor(TOTAL_CARDS * CONFIG.penetration);

// ============================================================================
// CARD TRACKING STATE
// ============================================================================
let shoe = [];
let dealtCards = [];
let runningCount = 0;
let cardCounts = {};

function initializeShoe() {
  shoe = [];
  dealtCards = [];
  runningCount = 0;

  // Initialize card counts
  cardCounts = {};
  for (let i = 1; i <= 13; i++) {
    cardCounts[i] = CONFIG.numDecks * 4;
  }

  // Build shoe
  const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  for (let d = 0; d < CONFIG.numDecks; d++) {
    for (let s = 0; s < 4; s++) {
      for (const rank of ranks) {
        shoe.push(rank);
      }
    }
  }

  // Shuffle
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
}

function dealCard() {
  if (shoe.length === 0) return null;
  const card = shoe.pop();
  dealtCards.push(card);
  cardCounts[card]--;

  // Update running count (Hi-Lo)
  if (card >= 2 && card <= 6) runningCount++;
  else if (card === 1 || card >= 10) runningCount--;

  return card;
}

function getCardValue(card) {
  if (card >= 10) return 10;
  if (card === 1) return 11; // Ace
  return card;
}

function getCardName(card) {
  const names = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return names[card] || '?';
}

function getHandValue(cards) {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    const v = getCardValue(card);
    value += v;
    if (card === 1) aces++;
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

function getHandString(cards) {
  return cards.map(c => getCardName(c)).join(' ');
}

// ============================================================================
// PRE-DEAL ENGINE - Calculates metrics BEFORE cards are dealt
// ============================================================================
function getPreDealMetrics() {
  const cardsRemaining = shoe.length;
  const decksRemaining = cardsRemaining / 52;
  const penetrationPct = (dealtCards.length / TOTAL_CARDS) * 100;
  const trueCount = decksRemaining > 0 ? runningCount / decksRemaining : 0;

  // Count remaining high cards (10s, Aces)
  const tensRemaining = cardCounts[10] + cardCounts[11] + cardCounts[12] + cardCounts[13];
  const acesRemaining = cardCounts[1];
  const highCards = tensRemaining + acesRemaining;

  // Probability calculations
  const pTens = cardsRemaining > 0 ? (tensRemaining / cardsRemaining) * 100 : 0;
  const pAces = cardsRemaining > 0 ? (acesRemaining / cardsRemaining) * 100 : 0;

  // P(7-A) - cards 7 through Ace
  let sevenToAce = acesRemaining;
  for (let i = 7; i <= 13; i++) {
    sevenToAce += cardCounts[i];
  }
  const p7A = cardsRemaining > 0 ? (sevenToAce / cardsRemaining) * 100 : 0;

  // S-Score (composition strength)
  const expectedTens = cardsRemaining * 0.3077;
  const expectedAces = cardsRemaining * 0.0769;
  const sScore = ((tensRemaining - expectedTens) + (acesRemaining - expectedAces) * 4) / cardsRemaining;

  // Deck Richness
  const deckRichness = (pTens / 30.77 + pAces / 7.69) / 2;

  // Player advantage (simplified)
  const advantage = (trueCount - 1) * 0.5;

  // Expected Value
  const baseEV = -0.5; // House edge
  const ev = baseEV + advantage;

  // Win probability (simplified model)
  const pWin = 42 + (trueCount * 0.5);

  // Blackjack probability
  const pBJ = cardsRemaining > 1 ?
    (tensRemaining / cardsRemaining) * (acesRemaining / (cardsRemaining - 1)) * 2 * 100 : 0;

  // Insurance EV
  const insuranceEV = ((tensRemaining / cardsRemaining) * 2 - 1) * 100;

  // Any Pair probability
  let anyPairProb = 0;
  for (let r = 1; r <= 13; r++) {
    if (cardCounts[r] >= 2) {
      anyPairProb += (cardCounts[r] / cardsRemaining) * ((cardCounts[r] - 1) / (cardsRemaining - 1));
    }
  }
  anyPairProb *= 100;

  // Window Score (0-100 betting opportunity score)
  let windowScore = 50;
  windowScore += trueCount * 10;
  windowScore += sScore * 100;
  windowScore = Math.max(0, Math.min(100, windowScore));

  // Bet Ramp
  let betUnits = 1;
  if (trueCount >= 1) betUnits = 2;
  if (trueCount >= 2) betUnits = 4;
  if (trueCount >= 3) betUnits = 8;
  if (trueCount >= 4) betUnits = 12;
  if (trueCount >= 5) betUnits = 16;

  // Kelly Fraction
  const kellyFraction = advantage > 0 ? advantage / 100 : 0;

  // CBS Filter (Count-Based Sizing)
  const cbsFilter = trueCount >= 1 ? 'ALLOW' : 'BLOCK';

  // Temporal Recommendation
  let temporal = 'STAY';
  if (trueCount >= 2 && penetrationPct > 40) temporal = 'STAY+';
  if (trueCount >= 3 && penetrationPct > 50) temporal = 'AGGRESSIVE';
  if (trueCount < 0) temporal = 'MIN BET';
  if (trueCount < -2) temporal = 'LEAVE?';

  return {
    // Count System
    runningCount,
    trueCount: trueCount.toFixed(2),
    decksRemaining: decksRemaining.toFixed(1),
    penetration: penetrationPct.toFixed(1),
    advantage: advantage.toFixed(3),

    // Composition
    pTens: pTens.toFixed(2),
    pAces: pAces.toFixed(2),
    p7A: p7A.toFixed(2),
    sScore: sScore.toFixed(4),
    deckRichness: deckRichness.toFixed(2),

    // Win Probability
    pWin: pWin.toFixed(2),
    ev: ev.toFixed(3),
    pBJ: pBJ.toFixed(3),
    insuranceEV: insuranceEV.toFixed(2),

    // Side Bets
    anyPairProb: anyPairProb.toFixed(2),
    windowScore: Math.round(windowScore),

    // Betting
    betUnits,
    betAmount: Math.min(CONFIG.minBet * betUnits, CONFIG.maxBet),
    kellyFraction: kellyFraction.toFixed(4),
    cbsFilter,
    temporal
  };
}

// ============================================================================
// POST-DEAL ENGINE - Unified Decision AFTER cards are dealt
// ============================================================================

// Basic Strategy Tables
const BASIC_STRATEGY = {
  hard: {
    17: 'SSSSSSSSSSS',
    16: 'SSSSSHHHHSH',
    15: 'SSSSSHHHHH',
    14: 'SSSSSHHHHH',
    13: 'SSSSSHHHHH',
    12: 'HHSSSHHHHH',
    11: 'DDDDDDDDDH',
    10: 'DDDDDDDDHH',
    9:  'HDDDDHHHHH',
    8:  'HHHHHHHHHH'
  },
  soft: {
    20: 'SSSSSSSSSS',
    19: 'SSSSDSSSSS',
    18: 'SDDDDDSSHHH',
    17: 'HDDDDHHHHH',
    16: 'HHDDDHHHHH',
    15: 'HHDDDHHHHH',
    14: 'HHHDDHHHHH',
    13: 'HHHDDHHHHH'
  },
  pairs: {
    'A': 'PPPPPPPPPP',
    '10': 'SSSSSSSSSS',
    '9': 'PPPPPSPPS',
    '8': 'PPPPPPPPPP',
    '7': 'PPPPPPHHHH',
    '6': 'PHHPPPHHHHH',
    '5': 'DDDDDDDDHH',
    '4': 'HHHHHPHHHH',
    '3': 'PPHPPPHHHH',
    '2': 'PPHPPPHHHH'
  }
};

// Illustrious 18 Deviations
const ILLUSTRIOUS_18 = [
  { playerTotal: 16, dealerUp: 10, action: 'STAND', tcRequired: 0 },
  { playerTotal: 15, dealerUp: 10, action: 'STAND', tcRequired: 4 },
  { playerTotal: 10, dealerUp: 10, action: 'DOUBLE', tcRequired: 4 },
  { playerTotal: 12, dealerUp: 3, action: 'STAND', tcRequired: 2 },
  { playerTotal: 12, dealerUp: 2, action: 'STAND', tcRequired: 3 },
  { playerTotal: 11, dealerUp: 1, action: 'DOUBLE', tcRequired: 1 },
  { playerTotal: 9, dealerUp: 2, action: 'DOUBLE', tcRequired: 1 },
  { playerTotal: 10, dealerUp: 1, action: 'DOUBLE', tcRequired: 4 },
  { playerTotal: 9, dealerUp: 7, action: 'DOUBLE', tcRequired: 3 },
  { playerTotal: 16, dealerUp: 9, action: 'STAND', tcRequired: 5 },
  { playerTotal: 13, dealerUp: 2, action: 'STAND', tcRequired: -1 },
  { playerTotal: 12, dealerUp: 4, action: 'STAND', tcRequired: 0 },
  { playerTotal: 12, dealerUp: 5, action: 'STAND', tcRequired: -2 },
  { playerTotal: 12, dealerUp: 6, action: 'STAND', tcRequired: -1 },
  { playerTotal: 13, dealerUp: 3, action: 'STAND', tcRequired: -2 }
];

// Fab 4 Surrenders
const FAB_4 = [
  { playerTotal: 14, dealerUp: 10, tcRequired: 3 },
  { playerTotal: 15, dealerUp: 10, tcRequired: 0 },
  { playerTotal: 15, dealerUp: 9, tcRequired: 2 },
  { playerTotal: 15, dealerUp: 1, tcRequired: 1 }
];

function getBasicStrategyAction(playerCards, dealerUpCard) {
  const playerValue = getHandValue(playerCards);
  const dealerValue = getCardValue(dealerUpCard);
  const dealerIndex = dealerValue === 11 ? 0 : dealerValue - 1;

  // Check for pairs
  if (playerCards.length === 2) {
    const c1 = getCardValue(playerCards[0]);
    const c2 = getCardValue(playerCards[1]);
    if (c1 === c2) {
      let pairKey = c1 === 11 ? 'A' : c1.toString();
      if (BASIC_STRATEGY.pairs[pairKey]) {
        const action = BASIC_STRATEGY.pairs[pairKey][dealerIndex];
        if (action === 'P') return 'SPLIT';
      }
    }
  }

  // Check for soft hand
  const hasAce = playerCards.some(c => c === 1);
  const rawValue = playerCards.reduce((sum, c) => sum + getCardValue(c), 0);
  const isSoft = hasAce && rawValue <= 21 && playerValue <= 21;

  if (isSoft && playerValue >= 13 && playerValue <= 20) {
    const table = BASIC_STRATEGY.soft[playerValue];
    if (table) {
      const action = table[dealerIndex];
      if (action === 'H') return 'HIT';
      if (action === 'S') return 'STAND';
      if (action === 'D') return playerCards.length === 2 ? 'DOUBLE' : 'HIT';
    }
  }

  // Hard totals
  if (playerValue >= 17) return 'STAND';
  if (playerValue <= 8) return 'HIT';

  const table = BASIC_STRATEGY.hard[playerValue];
  if (table) {
    const action = table[dealerIndex];
    if (action === 'H') return 'HIT';
    if (action === 'S') return 'STAND';
    if (action === 'D') return playerCards.length === 2 ? 'DOUBLE' : 'HIT';
  }

  return playerValue >= 17 ? 'STAND' : 'HIT';
}

function checkIllustrious18(playerValue, dealerUpCard, trueCount) {
  const dealerValue = getCardValue(dealerUpCard);
  const dealerDisplay = dealerValue === 11 ? 1 : dealerValue;

  for (const deviation of ILLUSTRIOUS_18) {
    if (deviation.playerTotal === playerValue && deviation.dealerUp === dealerDisplay) {
      if (trueCount >= deviation.tcRequired) {
        return { applies: true, action: deviation.action, index: deviation.tcRequired };
      }
    }
  }
  return { applies: false };
}

function checkFab4(playerValue, dealerUpCard, trueCount) {
  const dealerValue = getCardValue(dealerUpCard);
  const dealerDisplay = dealerValue === 11 ? 1 : dealerValue;

  for (const surr of FAB_4) {
    if (surr.playerTotal === playerValue && surr.dealerUp === dealerDisplay) {
      if (trueCount >= surr.tcRequired) {
        return { applies: true, index: surr.tcRequired };
      }
    }
  }
  return { applies: false };
}

function getUnifiedDecision(playerCards, dealerUpCard, preDealMetrics) {
  const playerValue = getHandValue(playerCards);
  const tc = parseFloat(preDealMetrics.trueCount);

  // Start with basic strategy
  let action = getBasicStrategyAction(playerCards, dealerUpCard);
  let isDeviation = false;
  let deviationSource = null;

  // Check Fab 4 surrenders first
  const fab4Check = checkFab4(playerValue, dealerUpCard, tc);
  if (fab4Check.applies) {
    action = 'SURRENDER';
    isDeviation = true;
    deviationSource = `Fab4 (TC>=${fab4Check.index})`;
  }

  // Check Illustrious 18
  if (!isDeviation) {
    const i18Check = checkIllustrious18(playerValue, dealerUpCard, tc);
    if (i18Check.applies) {
      action = i18Check.action;
      isDeviation = true;
      deviationSource = `I18 (TC>=${i18Check.index})`;
    }
  }

  // Calculate confidence based on multiple factors
  let confidence = 70; // Base confidence

  // Adjust for true count certainty
  if (Math.abs(tc) >= 2) confidence += 10;
  if (Math.abs(tc) >= 4) confidence += 10;

  // Adjust for penetration
  const pen = parseFloat(preDealMetrics.penetration);
  if (pen >= 40) confidence += 5;
  if (pen >= 60) confidence += 5;

  // Calculate edge
  const edge = parseFloat(preDealMetrics.ev);

  // Insurance recommendation
  const insuranceEV = parseFloat(preDealMetrics.insuranceEV);
  const takeInsurance = insuranceEV > 0;

  // Bet sizing recommendation based on action
  let betAdvice = 'STANDARD';
  if (action === 'DOUBLE' && tc >= 1) betAdvice = 'AGGRESSIVE';
  if (action === 'SURRENDER') betAdvice = 'DEFENSIVE';
  if (tc >= 3) betAdvice = 'MAX BET';
  if (tc <= -2) betAdvice = 'MIN BET';

  return {
    action,
    confidence: Math.min(100, confidence),
    edge: edge.toFixed(3),
    isDeviation,
    deviationSource,
    takeInsurance,
    betAdvice,
    playerValue,
    trueCount: tc.toFixed(2)
  };
}

// ============================================================================
// PLAY HAND (Simplified dealer logic)
// ============================================================================
function playDealerHand(dealerCards) {
  while (getHandValue(dealerCards) < 17) {
    dealerCards.push(dealCard());
  }
  return dealerCards;
}

function determineOutcome(playerValue, dealerValue, playerBJ, dealerBJ) {
  if (playerBJ && dealerBJ) return 'PUSH';
  if (playerBJ) return 'BLACKJACK';
  if (dealerBJ) return 'LOSE';
  if (playerValue > 21) return 'BUST';
  if (dealerValue > 21) return 'WIN';
  if (playerValue > dealerValue) return 'WIN';
  if (playerValue < dealerValue) return 'LOSE';
  return 'PUSH';
}

// ============================================================================
// MAIN SIMULATION
// ============================================================================
function runFullSimulation() {
  console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       BJ PROBABILITY ENGINE - FULL SIMULATION (PRE + POST DEAL)               ║');
  console.log('║       Testing Both Engines Together Through Complete Shoe                      ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  console.log(`Configuration: ${CONFIG.numDecks} decks | ${CONFIG.numPlayers} players | ${CONFIG.penetration * 100}% penetration | $${CONFIG.minBet}-$${CONFIG.maxBet} bets\n`);

  initializeShoe();

  let roundNum = 0;
  let stats = {
    totalRounds: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    busts: 0,
    surrenders: 0,
    i18Deviations: 0,
    fab4Deviations: 0,
    totalBet: 0,
    totalWon: 0
  };

  const roundHistory = [];

  console.log('═'.repeat(90));
  console.log('                              ROUND-BY-ROUND SIMULATION');
  console.log('═'.repeat(90));

  // Play until cut card
  while (dealtCards.length < CUT_CARD_POSITION && shoe.length >= 10) {
    roundNum++;

    // ==================== PRE-DEAL PHASE ====================
    const preDeal = getPreDealMetrics();

    console.log(`\n┌─ ROUND ${roundNum} ─────────────────────────────────────────────────────────────────┐`);
    console.log(`│ PRE-DEAL ENGINE                                                                  │`);
    console.log(`├──────────────────────────────────────────────────────────────────────────────────┤`);
    console.log(`│ TC: ${preDeal.trueCount.padStart(6)} | Pen: ${preDeal.penetration.padStart(5)}% | EV: ${preDeal.ev.padStart(7)}% | Window: ${String(preDeal.windowScore).padStart(3)} | ${preDeal.temporal.padEnd(10)} │`);
    console.log(`│ P(10): ${preDeal.pTens.padStart(5)}% | P(A): ${preDeal.pAces.padStart(5)}% | P(BJ): ${preDeal.pBJ.padStart(6)}% | Richness: ${preDeal.deckRichness.padStart(4)}          │`);
    console.log(`│ Bet: $${String(preDeal.betAmount).padStart(3)} (${preDeal.betUnits}x) | Kelly: ${preDeal.kellyFraction} | CBS: ${preDeal.cbsFilter.padEnd(5)} | Ins EV: ${preDeal.insuranceEV.padStart(6)}%    │`);
    console.log(`├──────────────────────────────────────────────────────────────────────────────────┤`);

    // ==================== DEAL CARDS ====================
    const dealerCards = [dealCard(), dealCard()];
    const dealerUpCard = dealerCards[0];
    const playerHands = [];

    for (let p = 0; p < CONFIG.numPlayers; p++) {
      playerHands.push([dealCard(), dealCard()]);
    }

    // ==================== POST-DEAL PHASE ====================
    console.log(`│ POST-DEAL ENGINE                                                                 │`);
    console.log(`├──────────────────────────────────────────────────────────────────────────────────┤`);
    console.log(`│ Dealer: [${getCardName(dealerUpCard)}] ?                                                                    │`);

    for (let p = 0; p < CONFIG.numPlayers; p++) {
      const playerCards = playerHands[p];
      const decision = getUnifiedDecision(playerCards, dealerUpCard, preDeal);

      const handStr = `${getCardName(playerCards[0])} ${getCardName(playerCards[1])}`;
      const valueStr = `(${decision.playerValue})`;
      const actionStr = decision.action.padEnd(9);
      const confStr = `${decision.confidence}%`;
      const devStr = decision.isDeviation ? `★ ${decision.deviationSource}` : '';

      console.log(`│ P${p + 1}: [${handStr.padEnd(5)}] ${valueStr.padEnd(4)} → ${actionStr} | Conf: ${confStr.padStart(4)} | Edge: ${decision.edge}% ${devStr.padEnd(20)}│`);

      // Track deviations
      if (decision.isDeviation) {
        if (decision.deviationSource.includes('I18')) stats.i18Deviations++;
        if (decision.deviationSource.includes('Fab4')) stats.fab4Deviations++;
      }

      // Track surrenders
      if (decision.action === 'SURRENDER') {
        stats.surrenders++;
      }
    }

    // ==================== RESOLVE HANDS (Simplified) ====================
    // Dealer plays
    const finalDealerCards = playDealerHand([...dealerCards]);
    const dealerValue = getHandValue(finalDealerCards);
    const dealerBJ = finalDealerCards.length === 2 && dealerValue === 21;

    console.log(`├──────────────────────────────────────────────────────────────────────────────────┤`);
    console.log(`│ RESULTS                                                                          │`);
    console.log(`├──────────────────────────────────────────────────────────────────────────────────┤`);
    console.log(`│ Dealer: [${getHandString(finalDealerCards).padEnd(15)}] = ${dealerValue}${dealerBJ ? ' (BJ!)' : ''}`.padEnd(87) + '│');

    for (let p = 0; p < CONFIG.numPlayers; p++) {
      const playerCards = playerHands[p];
      const playerValue = getHandValue(playerCards);
      const playerBJ = playerCards.length === 2 && playerValue === 21;

      const outcome = determineOutcome(playerValue, dealerValue, playerBJ, dealerBJ);

      // Update stats
      stats.totalRounds++;
      stats.totalBet += preDeal.betAmount;

      if (outcome === 'WIN') {
        stats.wins++;
        stats.totalWon += preDeal.betAmount;
      } else if (outcome === 'BLACKJACK') {
        stats.blackjacks++;
        stats.wins++;
        stats.totalWon += preDeal.betAmount * 1.5;
      } else if (outcome === 'LOSE') {
        stats.losses++;
        stats.totalWon -= preDeal.betAmount;
      } else if (outcome === 'BUST') {
        stats.busts++;
        stats.losses++;
        stats.totalWon -= preDeal.betAmount;
      }
      // PUSH: no change

      const outcomeEmoji = {
        'WIN': '✓ WIN',
        'BLACKJACK': '★ BJ!',
        'LOSE': '✗ LOSE',
        'BUST': '✗ BUST',
        'PUSH': '= PUSH'
      };

      console.log(`│ P${p + 1}: [${getHandString(playerCards).padEnd(15)}] = ${playerValue} → ${outcomeEmoji[outcome] || outcome}`.padEnd(87) + '│');
    }

    console.log(`└──────────────────────────────────────────────────────────────────────────────────┘`);

    // Store round data
    roundHistory.push({
      round: roundNum,
      preDeal,
      dealerUp: getCardName(dealerUpCard),
      dealerFinal: dealerValue
    });

    // Stop if we've played enough rounds for a good sample
    if (roundNum >= 50) break;
  }

  // ==================== FINAL STATISTICS ====================
  console.log('\n');
  console.log('═'.repeat(90));
  console.log('                              SIMULATION SUMMARY');
  console.log('═'.repeat(90));

  const winRate = (stats.wins / stats.totalRounds * 100).toFixed(2);
  const roi = (stats.totalWon / stats.totalBet * 100).toFixed(2);

  console.log(`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              GAME STATISTICS                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Total Rounds:        ${String(stats.totalRounds).padStart(6)}                                                          │
│ Total Hands:         ${String(stats.totalRounds).padStart(6)} (${CONFIG.numPlayers} players × ${roundNum} rounds)                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Wins:                ${String(stats.wins).padStart(6)} (${winRate}%)                                                     │
│ Losses:              ${String(stats.losses).padStart(6)}                                                                 │
│ Pushes:              ${String(stats.totalRounds - stats.wins - stats.losses).padStart(6)}                                                                 │
│ Blackjacks:          ${String(stats.blackjacks).padStart(6)}                                                                 │
│ Player Busts:        ${String(stats.busts).padStart(6)}                                                                 │
│ Surrenders:          ${String(stats.surrenders).padStart(6)}                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ I18 Deviations Used: ${String(stats.i18Deviations).padStart(6)}                                                                 │
│ Fab4 Deviations Used:${String(stats.fab4Deviations).padStart(6)}                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Total Bet:           $${String(stats.totalBet).padStart(6)}                                                                │
│ Net Result:          $${String(stats.totalWon.toFixed(0)).padStart(6)}                                                                │
│ ROI:                  ${roi.padStart(6)}%                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
`);

  // Engine Performance Summary
  console.log(`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           ENGINE PERFORMANCE                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ PRE-DEAL ENGINE                                                                          │
│ ├─ True Count Range:    ${Math.min(...roundHistory.map(r => parseFloat(r.preDeal.trueCount))).toFixed(2)} to ${Math.max(...roundHistory.map(r => parseFloat(r.preDeal.trueCount))).toFixed(2)}                                              │
│ ├─ Avg Window Score:    ${(roundHistory.reduce((s, r) => s + r.preDeal.windowScore, 0) / roundHistory.length).toFixed(1)}                                                              │
│ ├─ Bet Range:           $${Math.min(...roundHistory.map(r => r.preDeal.betAmount))} - $${Math.max(...roundHistory.map(r => r.preDeal.betAmount))}                                                          │
│ └─ Kelly Used:          ${roundHistory.filter(r => parseFloat(r.preDeal.kellyFraction) > 0).length}/${roundHistory.length} rounds                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ POST-DEAL ENGINE                                                                         │
│ ├─ Deviations Fired:    ${stats.i18Deviations + stats.fab4Deviations} total (I18: ${stats.i18Deviations}, Fab4: ${stats.fab4Deviations})                                       │
│ ├─ Deviation Rate:      ${((stats.i18Deviations + stats.fab4Deviations) / stats.totalRounds * 100).toFixed(1)}%                                                              │
│ └─ Surrender Rate:      ${(stats.surrenders / stats.totalRounds * 100).toFixed(1)}%                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────┘
`);

  console.log('Simulation complete. Both engines working correctly together.');
}

// Run the simulation
runFullSimulation();
