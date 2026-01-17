// V1 Strategy Backtest - Node.js Version
// P1-P2 Basic | P3 Booster | P4 Quant EV | P5 SMART Sacrifice v2.0

const NUM_SHOES = 1000;
const ROUNDS_PER_SHOE = 30;

// Shoe state
let shoe = [];
let runningCount = 0;
let cardsDealt = 0;

// Results tracking
let totalRounds = 0;
let p4Wins = 0, p4Losses = 0, p4Pushes = 0;
let p5Stands = 0, p5Hits = 0, p5Busts = 0;
let dealerBusts = 0;

// Card values
const cardValues = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

const hiLoCount = {
  '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
  '7': 0, '8': 0, '9': 0,
  '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
};

function createShoe(numDecks = 8) {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  shoe = [];
  for (let d = 0; d < numDecks; d++) {
    for (let s = 0; s < 4; s++) {
      for (const r of ranks) {
        shoe.push(r);
      }
    }
  }
  // Shuffle
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  runningCount = 0;
  cardsDealt = 0;
}

function dealCard() {
  if (shoe.length < 20) createShoe();
  const card = shoe.pop();
  runningCount += hiLoCount[card];
  cardsDealt++;
  return card;
}

function getTrueCount() {
  const decksRemaining = Math.max(1, (416 - cardsDealt) / 52);
  return runningCount / decksRemaining;
}

function calculateTotal(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardValues[c];
    if (c === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isSoft(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardValues[c];
    if (c === 'A') aces++;
  }
  // Soft if we have an ace counted as 11
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  // Check if any ace is still 11
  let hardTotal = 0;
  for (const c of cards) {
    hardTotal += c === 'A' ? 1 : cardValues[c];
  }
  return total !== hardTotal && total <= 21;
}

// Basic Strategy for P1-P2
function getBasicDecision(cards, dealerUp) {
  const total = calculateTotal(cards);
  const dealerVal = cardValues[dealerUp];
  const soft = isSoft(cards);

  if (total >= 17) return 'STAND';
  if (total <= 11) return 'HIT';

  if (soft) {
    if (total >= 19) return 'STAND';
    return 'HIT';
  }

  // Hard 12-16
  if (dealerVal >= 7) return 'HIT';
  if (total === 12 && dealerVal <= 3) return 'HIT';
  return 'STAND';
}

// P3 Booster - slightly more aggressive
function getBoosterDecision(cards, dealerUp) {
  const total = calculateTotal(cards);
  const dealerVal = cardValues[dealerUp];

  if (total >= 17) return 'STAND';
  if (total <= 11) return 'HIT';

  // More aggressive - hit 12-14 vs weak dealer too
  if (total <= 14) return 'HIT';
  if (dealerVal >= 7) return 'HIT';
  return 'STAND';
}

// P4 Quant EV - TC-based decisions
function getQuantEvDecision(cards, dealerUp) {
  const total = calculateTotal(cards);
  const dealerVal = cardValues[dealerUp];
  const tc = getTrueCount();
  const soft = isSoft(cards);

  if (total >= 17) return 'STAND';
  if (total <= 11) return 'HIT';

  if (soft) {
    if (total >= 19) return 'STAND';
    if (total === 18 && dealerVal >= 9) return 'HIT';
    return total <= 17 ? 'HIT' : 'STAND';
  }

  // Hard 12-16 with TC adjustments
  if (total === 16) {
    if (dealerVal === 10 && tc >= 0) return 'STAND';
    if (dealerVal >= 7) return 'HIT';
    return 'STAND';
  }
  if (total === 15) {
    if (dealerVal === 10 && tc >= 4) return 'STAND';
    if (dealerVal >= 7) return 'HIT';
    return 'STAND';
  }
  if (total === 13 || total === 14) {
    if (dealerVal >= 7) return 'HIT';
    return 'STAND';
  }
  if (total === 12) {
    if (dealerVal <= 3 || dealerVal >= 7) return 'HIT';
    return 'STAND';
  }

  return 'STAND';
}

// P5 SMART Sacrifice v2.0
function getSmartSacrificeDecision(cards, dealerUp) {
  const total = calculateTotal(cards);
  const dealerVal = cardValues[dealerUp];
  const tc = getTrueCount();
  const soft = isSoft(cards);

  const strongDealer = dealerVal >= 7;
  const weakDealer = dealerVal >= 2 && dealerVal <= 6;

  // RULE 0: Already busted or 21
  if (total >= 21) return { action: 'STAND', reason: 'SMART SAC: 21 or bust' };

  // RULE 1: ALWAYS stand on 17+ (pressure dealer to beat us)
  if (total >= 17) {
    return { action: 'STAND', reason: `SMART SAC: Stand ${total} - force dealer to draw!` };
  }

  // RULE 2: Hit soft hands up to soft 17 (safe improvement)
  if (soft && total <= 17) {
    return { action: 'HIT', reason: `SMART SAC: Hit soft ${total}` };
  }

  // RULE 3: Always hit 11 or less (can't bust)
  if (total <= 11) {
    return { action: 'HIT', reason: `SMART SAC: Hit ${total} - can't bust` };
  }

  // RULE 4: vs WEAK dealer (2-6) - STAND on 12-16 to let dealer bust
  if (weakDealer && total >= 12 && total <= 16) {
    // Exception: At very negative TC, hit to absorb small cards
    if (tc <= -3) {
      return { action: 'HIT', reason: `SMART SAC: Hit ${total} vs ${dealerVal} - TC ${tc.toFixed(1)}, absorb` };
    }
    return { action: 'STAND', reason: `SMART SAC: Stand ${total} vs ${dealerVal} - let dealer bust` };
  }

  // RULE 5: vs STRONG dealer (7+) - Hit 12-16 to improve
  if (strongDealer && total >= 12 && total <= 16) {
    return { action: 'HIT', reason: `SMART SAC: Hit ${total} vs ${dealerVal} - must improve` };
  }

  return { action: 'STAND', reason: `SMART SAC: Stand ${total}` };
}

function playHand(cards, dealerUp, getDecision) {
  let maxHits = 10;
  while (calculateTotal(cards) < 21 && maxHits-- > 0) {
    const decision = typeof getDecision === 'function'
      ? getDecision(cards, dealerUp)
      : getDecision;

    const action = typeof decision === 'object' ? decision.action : decision;

    if (action === 'STAND' || action === 'STAY') break;
    if (action === 'HIT') {
      cards.push(dealCard());
    } else {
      break;
    }
  }
  return calculateTotal(cards);
}

function simulateRound() {
  // Deal initial cards
  const dealerUp = dealCard();
  const hands = {
    p1: [dealCard(), dealCard()],
    p2: [dealCard(), dealCard()],
    p3: [dealCard(), dealCard()],
    p4: [dealCard(), dealCard()],
    p5: [dealCard(), dealCard()],
    dealer: [dealerUp]
  };

  // Play P1-P2 (Basic)
  playHand(hands.p1, dealerUp, getBasicDecision);
  playHand(hands.p2, dealerUp, getBasicDecision);

  // Play P3 (Booster)
  playHand(hands.p3, dealerUp, getBoosterDecision);

  // Play P4 (Quant EV)
  const p4Total = playHand(hands.p4, dealerUp, getQuantEvDecision);

  // Play P5 (SMART Sacrifice)
  const p5StartTotal = calculateTotal(hands.p5);
  let p5DidStand = false;
  let p5DidHit = false;

  let maxHits = 10;
  while (calculateTotal(hands.p5) < 21 && maxHits-- > 0) {
    const decision = getSmartSacrificeDecision(hands.p5, dealerUp);
    if (decision.action === 'STAND') {
      p5DidStand = true;
      break;
    }
    if (decision.action === 'HIT') {
      p5DidHit = true;
      hands.p5.push(dealCard());
    } else {
      break;
    }
  }

  const p5Total = calculateTotal(hands.p5);
  if (p5DidStand) p5Stands++;
  if (p5DidHit) p5Hits++;
  if (p5Total > 21) p5Busts++;

  // Dealer plays
  let dealerTotal = calculateTotal(hands.dealer);
  while (dealerTotal < 17) {
    hands.dealer.push(dealCard());
    dealerTotal = calculateTotal(hands.dealer);
  }

  const dealerBusted = dealerTotal > 21;
  if (dealerBusted) dealerBusts++;

  // P4 results
  const p4Busted = p4Total > 21;

  if (p4Busted) {
    p4Losses++;
  } else if (dealerBusted) {
    p4Wins++;
  } else if (p4Total > dealerTotal) {
    p4Wins++;
  } else if (p4Total < dealerTotal) {
    p4Losses++;
  } else {
    p4Pushes++;
  }

  totalRounds++;
}

// Run simulation
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║     V1 STRATEGY BACKTEST - SMART SACRIFICE v2.0              ║');
console.log('║     P1-P2 Basic | P3 Booster | P4 Quant EV | P5 SMART Sac    ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

for (let s = 1; s <= NUM_SHOES; s++) {
  createShoe();
  for (let r = 1; r <= ROUNDS_PER_SHOE; r++) {
    simulateRound();
  }
  if (s % 100 === 0) {
    const pct = ((s / NUM_SHOES) * 100).toFixed(0);
    console.log(`Shoe ${s}/${NUM_SHOES} (${pct}%) - P4 Win Rate: ${((p4Wins / totalRounds) * 100).toFixed(2)}%`);
  }
}

console.log('\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('                        FINAL RESULTS');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log(`Total Rounds:     ${totalRounds}`);
console.log('');
console.log('P4 (Quant EV) Performance:');
console.log(`  Wins:           ${p4Wins} (${((p4Wins / totalRounds) * 100).toFixed(2)}%)`);
console.log(`  Losses:         ${p4Losses} (${((p4Losses / totalRounds) * 100).toFixed(2)}%)`);
console.log(`  Pushes:         ${p4Pushes} (${((p4Pushes / totalRounds) * 100).toFixed(2)}%)`);
console.log('');
console.log('P5 (SMART Sacrifice) Performance:');
console.log(`  Stands:         ${p5Stands} (${((p5Stands / totalRounds) * 100).toFixed(1)}%)`);
console.log(`  Hits:           ${p5Hits} (${((p5Hits / totalRounds) * 100).toFixed(1)}%)`);
console.log(`  Busts:          ${p5Busts} (${((p5Busts / totalRounds) * 100).toFixed(1)}%)`);
console.log('');
console.log(`Dealer Bust Rate: ${((dealerBusts / totalRounds) * 100).toFixed(2)}%`);
console.log('');
console.log('═══════════════════════════════════════════════════════════════');

const winRate = (p4Wins / totalRounds) * 100;
if (winRate >= 42 && winRate <= 48) {
  console.log(`✓ WIN RATE ${winRate.toFixed(2)}% - IN TARGET RANGE (42-48%)`);
} else if (winRate < 42) {
  console.log(`✗ WIN RATE ${winRate.toFixed(2)}% - BELOW TARGET (need 42%+)`);
} else {
  console.log(`✓ WIN RATE ${winRate.toFixed(2)}% - ABOVE TARGET!`);
}
console.log('═══════════════════════════════════════════════════════════════');
