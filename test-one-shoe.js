/**
 * BJ Probability Engine - 1 Shoe Test (8 Decks)
 * Command line simulation with Unified Decision Engine
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

  positions: {
    dealer: [],
    player1: [],
    player2: []
  },

  config: {
    illustrious18: true,
    fab4: true
  },

  statistics: {
    totalRounds: 0,
    playerWins: 0,
    playerLosses: 0,
    pushes: 0,
    dealerBusts: 0,
    playerBusts: 0,
    blackjacks: 0,
    deviationsUsed: 0,
    doublesWon: 0,
    doublesLost: 0
  },

  dealerHistory: [],
  roundLog: []
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

function getValue(card) {
  if (!card) return 0;
  if (card === 'A') return 11;
  if (card === '10') return 10;
  return parseInt(card) || 0;
}

function calculateHandTotal(cards) {
  if (!cards || cards.length === 0) return 0;

  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card === 'A') {
      aces++;
      total += 11;
    } else if (card === '10') {
      total += 10;
    } else {
      total += parseInt(card) || 0;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function getTrueCount() {
  const decksRemaining = (AppState.totalCards - AppState.cardsDealt) / 52;
  if (decksRemaining < 0.5) return AppState.runningCount / 0.5;
  return AppState.runningCount / decksRemaining;
}

function getPenetration() {
  return (AppState.cardsDealt / AppState.totalCards) * 100;
}

// ============================================
// Basic Strategy
// ============================================
const BASIC_STRATEGY = {
  hard_5:  ['H','H','H','H','H','H','H','H','H','H'],
  hard_6:  ['H','H','H','H','H','H','H','H','H','H'],
  hard_7:  ['H','H','H','H','H','H','H','H','H','H'],
  hard_8:  ['H','H','H','H','H','H','H','H','H','H'],
  hard_9:  ['H','D','D','D','D','H','H','H','H','H'],
  hard_10: ['D','D','D','D','D','D','D','D','H','H'],
  hard_11: ['D','D','D','D','D','D','D','D','D','D'],
  hard_12: ['H','H','S','S','S','H','H','H','H','H'],
  hard_13: ['S','S','S','S','S','H','H','H','H','H'],
  hard_14: ['S','S','S','S','S','H','H','H','H','H'],
  hard_15: ['S','S','S','S','S','H','H','H','H','H'],
  hard_16: ['S','S','S','S','S','H','H','H','H','H'],
  hard_17: ['S','S','S','S','S','S','S','S','S','S'],
  hard_18: ['S','S','S','S','S','S','S','S','S','S'],
  hard_19: ['S','S','S','S','S','S','S','S','S','S'],
  hard_20: ['S','S','S','S','S','S','S','S','S','S'],
  hard_21: ['S','S','S','S','S','S','S','S','S','S'],

  soft_13: ['H','H','H','D','D','H','H','H','H','H'],
  soft_14: ['H','H','H','D','D','H','H','H','H','H'],
  soft_15: ['H','H','D','D','D','H','H','H','H','H'],
  soft_16: ['H','H','D','D','D','H','H','H','H','H'],
  soft_17: ['H','D','D','D','D','H','H','H','H','H'],
  soft_18: ['S','S','S','S','S','S','S','H','H','H'],
  soft_19: ['S','S','S','S','S','S','S','S','S','S'],
  soft_20: ['S','S','S','S','S','S','S','S','S','S'],
  soft_21: ['S','S','S','S','S','S','S','S','S','S'],

  pair_2:  ['P','P','P','P','P','P','H','H','H','H'],
  pair_3:  ['P','P','P','P','P','P','H','H','H','H'],
  pair_4:  ['H','H','H','P','P','H','H','H','H','H'],
  pair_5:  ['D','D','D','D','D','D','D','D','H','H'],
  pair_6:  ['P','P','P','P','P','H','H','H','H','H'],
  pair_7:  ['P','P','P','P','P','P','H','H','H','H'],
  pair_8:  ['P','P','P','P','P','P','P','P','P','P'],
  pair_9:  ['P','P','P','P','P','S','P','P','S','S'],
  pair_10: ['S','S','S','S','S','S','S','S','S','S'],
  pair_A:  ['P','P','P','P','P','P','P','P','P','P']
};

// Illustrious 18
const ILLUSTRIOUS_18 = [
  { hand: '16', dealer: '10', basic: 'H', deviation: 'S', tc: 0, dir: '>=' },
  { hand: '15', dealer: '10', basic: 'H', deviation: 'S', tc: 4, dir: '>=' },
  { hand: '10', dealer: '10', basic: 'H', deviation: 'D', tc: 4, dir: '>=' },
  { hand: '12', dealer: '3', basic: 'H', deviation: 'S', tc: 2, dir: '>=' },
  { hand: '12', dealer: '2', basic: 'H', deviation: 'S', tc: 3, dir: '>=' },
  { hand: '11', dealer: 'A', basic: 'H', deviation: 'D', tc: 1, dir: '>=' },
  { hand: '9', dealer: '2', basic: 'H', deviation: 'D', tc: 1, dir: '>=' },
  { hand: '10', dealer: 'A', basic: 'H', deviation: 'D', tc: 4, dir: '>=' },
  { hand: '9', dealer: '7', basic: 'H', deviation: 'D', tc: 3, dir: '>=' },
  { hand: '16', dealer: '9', basic: 'H', deviation: 'S', tc: 5, dir: '>=' },
  { hand: '13', dealer: '2', basic: 'S', deviation: 'H', tc: -1, dir: '<=' },
  { hand: '12', dealer: '4', basic: 'S', deviation: 'H', tc: 0, dir: '<' },
  { hand: '12', dealer: '5', basic: 'S', deviation: 'H', tc: -2, dir: '<=' },
  { hand: '12', dealer: '6', basic: 'S', deviation: 'H', tc: -1, dir: '<=' },
  { hand: '13', dealer: '3', basic: 'S', deviation: 'H', tc: -2, dir: '<=' }
];

function getDealerIndex(dealerCard) {
  if (dealerCard === 'A') return 9;
  const val = parseInt(dealerCard);
  if (val >= 2 && val <= 9) return val - 2;
  return 8;
}

function analyzeHand(cards) {
  if (!cards || cards.length === 0) return { total: 0, isSoft: false, isPair: false };

  let total = 0;
  let aces = 0;
  const values = [];

  for (const card of cards) {
    let val = card === 'A' ? 11 : (card === '10' ? 10 : parseInt(card) || 0);
    if (card === 'A') aces++;
    values.push(val);
    total += val;
  }

  let softAces = aces;
  while (total > 21 && softAces > 0) {
    total -= 10;
    softAces--;
  }

  return {
    total,
    isSoft: softAces > 0 && total <= 21,
    isPair: cards.length === 2 && values[0] === values[1],
    values
  };
}

function getUnifiedDecision(playerCards, dealerUpcard) {
  const hand = analyzeHand(playerCards);
  const tc = getTrueCount();
  const dealerIdx = getDealerIndex(dealerUpcard);
  const dealerVal = dealerUpcard === 'A' ? 'A' : (parseInt(dealerUpcard) || 10);

  let action = 'H';
  let isDeviation = false;
  let reason = 'Basic Strategy';

  // Check Illustrious 18
  for (const dev of ILLUSTRIOUS_18) {
    if (String(hand.total) === dev.hand && !hand.isSoft) {
      if (String(dealerVal) === dev.dealer) {
        const passes = dev.dir === '>=' ? tc >= dev.tc :
                      dev.dir === '<=' ? tc <= dev.tc :
                      dev.dir === '<' ? tc < dev.tc : tc > dev.tc;
        if (passes) {
          action = dev.deviation === 'S' ? 'STAY' : dev.deviation === 'D' ? 'DBL' : 'HIT';
          isDeviation = true;
          reason = `I18: ${hand.total} vs ${dealerVal} @ TC ${tc.toFixed(1)}`;
          break;
        }
      }
    }
  }

  // Basic strategy if no deviation
  if (!isDeviation) {
    let strategyKey;

    if (hand.isPair && playerCards.length === 2) {
      const pairVal = playerCards[0] === 'A' ? 'A' : hand.values[0];
      strategyKey = `pair_${pairVal}`;
    } else if (hand.isSoft) {
      strategyKey = `soft_${hand.total}`;
    } else {
      strategyKey = `hard_${Math.min(21, Math.max(5, hand.total))}`;
    }

    const row = BASIC_STRATEGY[strategyKey];
    if (row && row[dealerIdx]) {
      const basic = row[dealerIdx];
      action = basic === 'S' ? 'STAY' : basic === 'D' ? 'DBL' : basic === 'P' ? 'SPLIT' : 'HIT';
    }
    reason = `Basic: ${hand.isSoft ? 'Soft' : 'Hard'} ${hand.total} vs ${dealerVal}`;
  }

  // Calculate edge
  const houseEdge = 0.005;
  const countAdvantage = tc * 0.005;
  const playerEdge = countAdvantage - houseEdge;

  // Bet recommendation
  let betAction = 'MIN';
  let betMult = 1;
  if (tc >= 2) {
    betMult = Math.min(12, Math.pow(2, tc - 1));
    betAction = tc >= 4 ? 'MAX' : 'INCREASE';
  }

  return {
    action,
    isDeviation,
    reason,
    handTotal: hand.total,
    isSoft: hand.isSoft,
    edge: (playerEdge * 100).toFixed(3) + '%',
    edgePositive: playerEdge > 0,
    betAction,
    betMult,
    tc: tc.toFixed(2)
  };
}

// ============================================
// Simulation
// ============================================
function clearPositions() {
  AppState.positions.dealer = [];
  AppState.positions.player1 = [];
  AppState.positions.player2 = [];
}

function playRound(roundNum) {
  clearPositions();

  // Deal cards: P1, P2, D, P1, P2, D
  AppState.positions.player1.push(dealRandomCard());
  AppState.positions.player2.push(dealRandomCard());
  AppState.positions.dealer.push(dealRandomCard());
  AppState.positions.player1.push(dealRandomCard());
  AppState.positions.player2.push(dealRandomCard());
  AppState.positions.dealer.push(dealRandomCard());

  const dealerUpcard = AppState.positions.dealer[0];

  // Get unified decisions
  const decision1 = getUnifiedDecision(AppState.positions.player1, dealerUpcard);
  const decision2 = getUnifiedDecision(AppState.positions.player2, dealerUpcard);

  if (decision1.isDeviation) AppState.statistics.deviationsUsed++;
  if (decision2.isDeviation) AppState.statistics.deviationsUsed++;

  // Play P1
  let p1Doubled = false;
  while (calculateHandTotal(AppState.positions.player1) < 21) {
    const dec = getUnifiedDecision(AppState.positions.player1, dealerUpcard);
    if (dec.action === 'STAY') break;
    if (dec.action === 'DBL' && AppState.positions.player1.length === 2) {
      AppState.positions.player1.push(dealRandomCard());
      p1Doubled = true;
      break;
    }
    if (dec.action === 'HIT') {
      AppState.positions.player1.push(dealRandomCard());
    } else {
      break;
    }
  }

  // Play P2
  let p2Doubled = false;
  while (calculateHandTotal(AppState.positions.player2) < 21) {
    const dec = getUnifiedDecision(AppState.positions.player2, dealerUpcard);
    if (dec.action === 'STAY') break;
    if (dec.action === 'DBL' && AppState.positions.player2.length === 2) {
      AppState.positions.player2.push(dealRandomCard());
      p2Doubled = true;
      break;
    }
    if (dec.action === 'HIT') {
      AppState.positions.player2.push(dealRandomCard());
    } else {
      break;
    }
  }

  const p1Total = calculateHandTotal(AppState.positions.player1);
  const p2Total = calculateHandTotal(AppState.positions.player2);

  // Dealer plays if anyone is still in
  if (p1Total <= 21 || p2Total <= 21) {
    while (calculateHandTotal(AppState.positions.dealer) < 17) {
      AppState.positions.dealer.push(dealRandomCard());
    }
  }

  const dealerTotal = calculateHandTotal(AppState.positions.dealer);
  const dealerBust = dealerTotal > 21;

  if (dealerBust) AppState.statistics.dealerBusts++;

  // Results
  const results = [];

  // P1 result
  let p1Result;
  if (p1Total > 21) {
    p1Result = 'BUST';
    AppState.statistics.playerBusts++;
    AppState.statistics.playerLosses++;
    if (p1Doubled) AppState.statistics.doublesLost++;
  } else if (dealerBust) {
    p1Result = 'WIN';
    AppState.statistics.playerWins++;
    if (p1Doubled) AppState.statistics.doublesWon++;
  } else if (p1Total > dealerTotal) {
    p1Result = 'WIN';
    AppState.statistics.playerWins++;
    if (p1Doubled) AppState.statistics.doublesWon++;
  } else if (p1Total < dealerTotal) {
    p1Result = 'LOSS';
    AppState.statistics.playerLosses++;
    if (p1Doubled) AppState.statistics.doublesLost++;
  } else {
    p1Result = 'PUSH';
    AppState.statistics.pushes++;
  }

  // P2 result
  let p2Result;
  if (p2Total > 21) {
    p2Result = 'BUST';
    AppState.statistics.playerBusts++;
    AppState.statistics.playerLosses++;
    if (p2Doubled) AppState.statistics.doublesLost++;
  } else if (dealerBust) {
    p2Result = 'WIN';
    AppState.statistics.playerWins++;
    if (p2Doubled) AppState.statistics.doublesWon++;
  } else if (p2Total > dealerTotal) {
    p2Result = 'WIN';
    AppState.statistics.playerWins++;
    if (p2Doubled) AppState.statistics.doublesWon++;
  } else if (p2Total < dealerTotal) {
    p2Result = 'LOSS';
    AppState.statistics.playerLosses++;
    if (p2Doubled) AppState.statistics.doublesLost++;
  } else {
    p2Result = 'PUSH';
    AppState.statistics.pushes++;
  }

  AppState.statistics.totalRounds++;

  // Store dealer history
  AppState.dealerHistory.push({
    round: roundNum,
    cards: [...AppState.positions.dealer],
    total: dealerTotal,
    bust: dealerBust
  });

  return {
    round: roundNum,
    p1: { cards: AppState.positions.player1.join(' '), total: p1Total, result: p1Result, decision: decision1, doubled: p1Doubled },
    p2: { cards: AppState.positions.player2.join(' '), total: p2Total, result: p2Result, decision: decision2, doubled: p2Doubled },
    dealer: { cards: AppState.positions.dealer.join(' '), total: dealerTotal, bust: dealerBust },
    rc: AppState.runningCount,
    tc: getTrueCount().toFixed(2),
    cardsDealt: AppState.cardsDealt
  };
}

// ============================================
// Run Simulation
// ============================================
console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║     BJ PROBABILITY ENGINE - 1 SHOE TEST (8 DECKS)                ║');
console.log('║     Unified Decision Engine with Illustrious 18                  ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

console.log(`Shoe: ${AppState.numDecks} decks (${AppState.totalCards} cards)`);
console.log(`Penetration: 75% (${Math.round(AppState.totalCards * 0.75)} cards)`);
console.log(`Players: 2\n`);
console.log('─'.repeat(70));
console.log('Round  P1 Cards      P1 Tot  P1 Dec    P2 Cards      P2 Tot  P2 Dec    Dealer    RC    TC');
console.log('─'.repeat(70));

const penetrationLimit = AppState.totalCards * 0.75;
let roundNum = 0;

while (AppState.cardsDealt < penetrationLimit) {
  roundNum++;
  const result = playRound(roundNum);

  const p1Cards = result.p1.cards.padEnd(12);
  const p2Cards = result.p2.cards.padEnd(12);
  const dealerCards = result.dealer.cards.padEnd(10);
  const p1Dec = (result.p1.decision.isDeviation ? '*' : '') + result.p1.decision.action.substring(0,3);
  const p2Dec = (result.p2.decision.isDeviation ? '*' : '') + result.p2.decision.action.substring(0,3);

  const p1Res = result.p1.result.padEnd(4);
  const p2Res = result.p2.result.padEnd(4);

  console.log(
    `${String(roundNum).padStart(3)}    ${p1Cards}  ${String(result.p1.total).padStart(2)} ${p1Res} ${p1Dec.padEnd(4)}   ${p2Cards}  ${String(result.p2.total).padStart(2)} ${p2Res} ${p2Dec.padEnd(4)}   ${dealerCards} ${String(result.rc).padStart(3)}  ${result.tc.padStart(5)}`
  );
}

// Summary
const stats = AppState.statistics;
const totalDecided = stats.playerWins + stats.playerLosses;
const winRate = totalDecided > 0 ? ((stats.playerWins / totalDecided) * 100).toFixed(2) : 0;
const dealerBustRate = stats.totalRounds > 0 ? ((stats.dealerBusts / stats.totalRounds) * 100).toFixed(2) : 0;

console.log('\n' + '═'.repeat(70));
console.log('\n                         SHOE COMPLETE\n');
console.log('═'.repeat(70));

console.log('\nSTATISTICS SUMMARY');
console.log('─'.repeat(40));
console.log(`Total Rounds:        ${stats.totalRounds}`);
console.log(`Cards Dealt:         ${AppState.cardsDealt} / ${AppState.totalCards}`);
console.log(`Penetration:         ${getPenetration().toFixed(1)}%`);
console.log('');
console.log(`Player Wins:         ${stats.playerWins}`);
console.log(`Player Losses:       ${stats.playerLosses}`);
console.log(`Pushes:              ${stats.pushes}`);
console.log(`Win Rate:            ${winRate}%`);
console.log('');
console.log(`Dealer Busts:        ${stats.dealerBusts}`);
console.log(`Dealer Bust Rate:    ${dealerBustRate}%`);
console.log(`Player Busts:        ${stats.playerBusts}`);
console.log('');
console.log(`I18 Deviations Used: ${stats.deviationsUsed}`);
console.log(`Doubles Won:         ${stats.doublesWon}`);
console.log(`Doubles Lost:        ${stats.doublesLost}`);
console.log('');
console.log(`Final Running Count: ${AppState.runningCount}`);
console.log(`Final True Count:    ${getTrueCount().toFixed(2)}`);

console.log('\n' + '─'.repeat(40));
console.log('DEALER HISTORY (Last 10 Rounds)');
console.log('─'.repeat(40));
const lastDealer = AppState.dealerHistory.slice(-10);
lastDealer.forEach(d => {
  console.log(`Round ${String(d.round).padStart(2)}: ${d.cards.join(' ').padEnd(15)} = ${d.total}${d.bust ? ' BUST' : ''}`);
});

console.log('\n═'.repeat(70));
console.log('* = Illustrious 18 Deviation Used');
console.log('═'.repeat(70));
