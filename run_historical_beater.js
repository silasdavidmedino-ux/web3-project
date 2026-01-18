// HISTORICAL BEATER STRATEGY
// Optimized to beat Shoe 301-412 patterns
//
// KEY DISCOVERIES:
// 1. Dealer 4-6: 100% bust rate → STAND EARLY, MAX BET
// 2. Dealer 2-3: Only 11-25% win rate → STAND on 13+, MIN BET (anomaly!)
// 3. Standing (62.9%) outperforms Hitting (38.6%)
// 4. Player 13-14 had 75-80% win rate when standing vs weak dealers
// 5. Need 18+ to beat strong dealers

const historicalRounds = [
  // ===== GAME #301 =====
  { game: 301, round: 1, dealerUp: '10', dealerTotal: 20, players: [{ cards: ['3', '3', '5', '4'], total: 15, outcome: 'LOSS' }] },
  { game: 301, round: 2, dealerUp: 'J', dealerTotal: 20, players: [
    { cards: ['K', '4', '4'], total: 18, outcome: 'LOSS' },
    { cards: ['6', '4', '7'], total: 17, outcome: 'LOSS' },
    { cards: ['A', '4', '5'], total: 20, outcome: 'PUSH' },
    { cards: ['Q', '7'], total: 17, outcome: 'LOSS' },
    { cards: ['6', '9'], total: 15, outcome: 'LOSS' }
  ] },
  { game: 301, round: 3, dealerUp: '8', dealerTotal: 21, players: [{ cards: ['Q', '8'], total: 18, outcome: 'LOSS' }] },
  { game: 301, round: 5, dealerUp: '3', dealerTotal: 21, players: [
    { cards: ['10', 'Q'], total: 20, outcome: 'LOSS' },
    { cards: ['9', 'Q'], total: 19, outcome: 'LOSS' },
    { cards: ['6', 'K'], total: 16, outcome: 'LOSS' }
  ] },
  { game: 301, round: 6, dealerUp: '9', dealerTotal: 19, players: [
    { cards: ['7', '4', '8'], total: 19, outcome: 'PUSH' },
    { cards: ['K', 'Q'], total: 20, outcome: 'WIN' }
  ] },
  { game: 301, round: 8, dealerUp: 'K', dealerTotal: 20, players: [
    { cards: ['5', '6', '7'], total: 18, outcome: 'LOSS' },
    { cards: ['9', '9'], total: 18, outcome: 'LOSS' }
  ] },
  { game: 301, round: 10, dealerUp: '2', dealerTotal: 21, players: [
    { cards: ['7', '3', 'J'], total: 20, outcome: 'LOSS' },
    { cards: ['8', '4'], total: 12, outcome: 'LOSS' },
    { cards: ['5', 'Q'], total: 15, outcome: 'LOSS' },
    { cards: ['J', 'K'], total: 20, outcome: 'LOSS' }
  ] },
  { game: 301, round: 12, dealerUp: '7', dealerTotal: 17, players: [
    { cards: ['J', '8'], total: 18, outcome: 'WIN' },
    { cards: ['6', '5', '6'], total: 17, outcome: 'PUSH' }
  ] },
  { game: 301, round: 15, dealerUp: 'Q', dealerTotal: 20, players: [
    { cards: ['5', '7', '5'], total: 17, outcome: 'LOSS' },
    { cards: ['2', 'Q', '2'], total: 14, outcome: 'LOSS' },
    { cards: ['8', '5', 'A', '7'], total: 21, outcome: 'WIN' }
  ] },
  { game: 301, round: 18, dealerUp: '4', dealerTotal: 22, players: [
    { cards: ['K', '5'], total: 15, outcome: 'WIN' },
    { cards: ['7', '7'], total: 14, outcome: 'WIN' }
  ] },
  { game: 301, round: 20, dealerUp: '10', dealerTotal: 20, players: [
    { cards: ['9', '3', '10'], total: 22, outcome: 'LOSS' },
    { cards: ['3', 'K'], total: 13, outcome: 'LOSS' }
  ] },
  { game: 301, round: 22, dealerUp: '5', dealerTotal: 25, players: [
    { cards: ['8', '6'], total: 14, outcome: 'WIN' },
    { cards: ['Q', '3'], total: 13, outcome: 'WIN' },
    { cards: ['9', '4'], total: 13, outcome: 'WIN' }
  ] },
  { game: 301, round: 25, dealerUp: 'Q', dealerTotal: 17, players: [{ cards: ['3', '4', 'Q'], total: 17, outcome: 'PUSH' }] },
  { game: 301, round: 28, dealerUp: 'A', dealerTotal: 20, players: [
    { cards: ['J', '7'], total: 17, outcome: 'LOSS' },
    { cards: ['K', '8'], total: 18, outcome: 'LOSS' }
  ] },
  { game: 301, round: 30, dealerUp: '6', dealerTotal: 26, players: [
    { cards: ['5', '5', '7'], total: 17, outcome: 'WIN' },
    { cards: ['4', '9'], total: 13, outcome: 'WIN' }
  ] },
  { game: 301, round: 33, dealerUp: '10', dealerTotal: 18, players: [
    { cards: ['J', '9'], total: 19, outcome: 'WIN' },
    { cards: ['Q', '7'], total: 17, outcome: 'LOSS' }
  ] },

  // ===== GAME #353 (+10,750) =====
  { game: 353, round: 1, dealerUp: 'J', dealerTotal: 24, players: [
    { cards: ['K', '3', 'J'], total: 23, outcome: 'LOSS' },
    { cards: ['8', '7', '8'], total: 23, outcome: 'LOSS' },
    { cards: ['6', 'A', '3'], total: 20, outcome: 'WIN' }
  ] },
  { game: 353, round: 2, dealerUp: '8', dealerTotal: 19, players: [
    { cards: ['8', 'J'], total: 18, outcome: 'LOSS' },
    { cards: ['9', '6', '4'], total: 19, outcome: 'PUSH' },
    { cards: ['10', '6', 'A'], total: 17, outcome: 'LOSS' }
  ] },
  { game: 353, round: 3, dealerUp: '10', dealerTotal: 19, players: [
    { cards: ['10', 'K'], total: 20, outcome: 'WIN' },
    { cards: ['4', '8', '6'], total: 18, outcome: 'LOSS' },
    { cards: ['3', '9', 'Q'], total: 22, outcome: 'LOSS' },
    { cards: ['3', '6', 'Q'], total: 19, outcome: 'PUSH' },
    { cards: ['3', '4', '3', '10'], total: 20, outcome: 'WIN' }
  ] },
  { game: 353, round: 5, dealerUp: '5', dealerTotal: 24, players: [
    { cards: ['3', 'Q'], total: 13, outcome: 'WIN' },
    { cards: ['6', '7'], total: 13, outcome: 'WIN' },
    { cards: ['Q', '8'], total: 18, outcome: 'WIN' },
    { cards: ['7', '5'], total: 12, outcome: 'WIN' },
    { cards: ['9', 'A'], total: 20, outcome: 'WIN' },
    { cards: ['9', '3', '6'], total: 18, outcome: 'WIN' }
  ] },
  { game: 353, round: 7, dealerUp: '10', dealerTotal: 20, players: [
    { cards: ['7', '3', '10'], total: 20, outcome: 'PUSH' },
    { cards: ['Q', '6', '3'], total: 19, outcome: 'LOSS' },
    { cards: ['3', 'Q', '3'], total: 16, outcome: 'LOSS' },
    { cards: ['A', 'K'], total: 21, outcome: 'BLACKJACK' },
    { cards: ['4', 'A', '4'], total: 19, outcome: 'LOSS' }
  ] },
  { game: 353, round: 10, dealerUp: 'Q', dealerTotal: 20, players: [
    { cards: ['5', 'J'], total: 15, outcome: 'LOSS' },
    { cards: ['6', 'Q'], total: 16, outcome: 'LOSS' },
    { cards: ['Q', 'J'], total: 20, outcome: 'PUSH' },
    { cards: ['2', '10', 'A', '7'], total: 20, outcome: 'PUSH' },
    { cards: ['9', '4', '9'], total: 22, outcome: 'LOSS' }
  ] },
  { game: 353, round: 12, dealerUp: '10', dealerTotal: 24, players: [
    { cards: ['5', 'Q', '2'], total: 17, outcome: 'WIN' },
    { cards: ['Q', 'K'], total: 20, outcome: 'WIN' },
    { cards: ['K', '2', 'A', '3', '2'], total: 18, outcome: 'WIN' }
  ] },
  { game: 353, round: 15, dealerUp: '7', dealerTotal: 17, players: [
    { cards: ['5', '10', '6'], total: 21, outcome: 'WIN' },
    { cards: ['9', '8'], total: 17, outcome: 'PUSH' },
    { cards: ['2', '9', '8'], total: 19, outcome: 'WIN' },
    { cards: ['2', '6', 'Q'], total: 18, outcome: 'WIN' },
    { cards: ['5', 'K', 'A'], total: 16, outcome: 'LOSS' }
  ] },

  // ===== GAME #407 (-7,000) =====
  { game: 407, round: 1, dealerUp: 'Q', dealerTotal: 17, players: [
    { cards: ['Q', 'A'], total: 21, outcome: 'BLACKJACK' },
    { cards: ['K', 'K'], total: 20, outcome: 'WIN' },
    { cards: ['A', '10'], total: 21, outcome: 'BLACKJACK' },
    { cards: ['7', '3', '8'], total: 18, outcome: 'WIN' },
    { cards: ['Q', 'J'], total: 20, outcome: 'WIN' }
  ] },
  { game: 407, round: 5, dealerUp: '9', dealerTotal: 20, players: [
    { cards: ['9', '5', 'J'], total: 24, outcome: 'LOSS' },
    { cards: ['Q', 'K'], total: 20, outcome: 'PUSH' },
    { cards: ['Q', '9'], total: 19, outcome: 'LOSS' }
  ] },
  { game: 407, round: 10, dealerUp: '2', dealerTotal: 20, players: [
    { cards: ['2', '9', 'Q'], total: 21, outcome: 'WIN' },
    { cards: ['2', '9', '7'], total: 18, outcome: 'LOSS' },
    { cards: ['8', '2', '3'], total: 13, outcome: 'LOSS' },
    { cards: ['J', '7'], total: 17, outcome: 'LOSS' },
    { cards: ['4', '6', '5'], total: 15, outcome: 'LOSS' }
  ] },
  { game: 407, round: 15, dealerUp: '7', dealerTotal: 17, players: [
    { cards: ['4', 'K', '7'], total: 21, outcome: 'WIN' },
    { cards: ['6', '3', '7'], total: 16, outcome: 'LOSS' }
  ] },
  { game: 407, round: 20, dealerUp: '3', dealerTotal: 23, players: [
    { cards: ['Q', '2', '9'], total: 21, outcome: 'WIN' }
  ] },

  // ===== GAME #358 (+6,750) =====
  { game: 358, round: 1, dealerUp: '10', dealerTotal: 24, players: [
    { cards: ['8', '10'], total: 18, outcome: 'WIN' },
    { cards: ['6', '8', '6'], total: 20, outcome: 'WIN' },
    { cards: ['J', '9'], total: 19, outcome: 'WIN' },
    { cards: ['J', 'A'], total: 21, outcome: 'BLACKJACK' }
  ] },
  { game: 358, round: 15, dealerUp: 'J', dealerTotal: 22, players: [
    { cards: ['J', '9'], total: 19, outcome: 'WIN' },
    { cards: ['Q', '5', 'J'], total: 25, outcome: 'LOSS' },
    { cards: ['6', '7', '8'], total: 21, outcome: 'WIN' }
  ] },

  // ===== GAME #352 (+6,250) =====
  { game: 352, round: 1, dealerUp: '6', dealerTotal: 26, players: [
    { cards: ['9', '8'], total: 17, outcome: 'WIN' },
    { cards: ['K', 'Q'], total: 20, outcome: 'WIN' },
    { cards: ['7', '7', '6'], total: 20, outcome: 'WIN' }
  ] },

  // ===== GAME #365 (-6,750) =====
  { game: 365, round: 1, dealerUp: '10', dealerTotal: 20, players: [
    { cards: ['9', '8'], total: 17, outcome: 'LOSS' },
    { cards: ['J', '6', '3'], total: 19, outcome: 'LOSS' }
  ] },
  { game: 365, round: 5, dealerUp: 'A', dealerTotal: 21, players: [
    { cards: ['K', '7'], total: 17, outcome: 'LOSS' },
    { cards: ['Q', '9'], total: 19, outcome: 'LOSS' }
  ] },

  // ===== GAME #310 (-2,000) =====
  { game: 310, round: 1, dealerUp: '10', dealerTotal: 20, players: [{ cards: ['8', '9'], total: 17, outcome: 'LOSS' }] },
  { game: 310, round: 5, dealerUp: '9', dealerTotal: 19, players: [{ cards: ['6', '5', '7'], total: 18, outcome: 'LOSS' }] },

  // ===== GAME #314 (+750) =====
  { game: 314, round: 1, dealerUp: '5', dealerTotal: 25, players: [{ cards: ['10', '8'], total: 18, outcome: 'WIN' }] },
  { game: 314, round: 10, dealerUp: '6', dealerTotal: 22, players: [{ cards: ['K', 'Q'], total: 20, outcome: 'WIN' }] },

  // ===== GAME #359 (+6,250) =====
  { game: 359, round: 1, dealerUp: '6', dealerTotal: 26, players: [
    { cards: ['K', '7'], total: 17, outcome: 'WIN' },
    { cards: ['9', '9'], total: 18, outcome: 'WIN' }
  ] },
  { game: 359, round: 5, dealerUp: '5', dealerTotal: 25, players: [
    { cards: ['J', '3'], total: 13, outcome: 'WIN' },
    { cards: ['8', '8'], total: 16, outcome: 'WIN' }
  ] },
  { game: 359, round: 10, dealerUp: '10', dealerTotal: 20, players: [
    { cards: ['K', 'K'], total: 20, outcome: 'PUSH' },
    { cards: ['7', '6', '5'], total: 18, outcome: 'LOSS' }
  ] },

  // ===== GAME #372 (+6,750) =====
  { game: 372, round: 1, dealerUp: '4', dealerTotal: 24, players: [
    { cards: ['Q', 'J'], total: 20, outcome: 'WIN' },
    { cards: ['8', '7'], total: 15, outcome: 'WIN' }
  ] },
  { game: 372, round: 10, dealerUp: '5', dealerTotal: 22, players: [
    { cards: ['K', '6'], total: 16, outcome: 'WIN' },
    { cards: ['9', '5'], total: 14, outcome: 'WIN' }
  ] },
  { game: 372, round: 20, dealerUp: '6', dealerTotal: 26, players: [
    { cards: ['7', '7'], total: 14, outcome: 'WIN' },
    { cards: ['A', '5'], total: 16, outcome: 'WIN' }
  ] },
];

const cardValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11 };

function calculateTotal(cards) {
  let total = 0, aces = 0;
  for (const c of cards) {
    total += cardValues[c];
    if (c === 'A') aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isSoft(cards) {
  let total = 0, aces = 0;
  for (const c of cards) {
    total += cardValues[c];
    if (c === 'A') aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  let hardTotal = 0;
  for (const c of cards) hardTotal += c === 'A' ? 1 : cardValues[c];
  return total !== hardTotal && total <= 21;
}

// ═══════════════════════════════════════════════════════════════
// HISTORICAL BEATER STRATEGY
// Optimized for Shoe 301-412 patterns
// ═══════════════════════════════════════════════════════════════
function getHistoricalBeaterDecision(cards, dealerUp) {
  const total = calculateTotal(cards);
  const dealerVal = cardValues[dealerUp];
  const soft = isSoft(cards);

  // Always stand on 17+
  if (total >= 17) return { action: 'STAND', bet: 'NORMAL' };

  // Always hit on 11 or less
  if (total <= 11) return { action: 'HIT', bet: 'NORMAL' };

  // === DEALER 4-6: 100% BUST RATE IN DATA ===
  // Stand on ANYTHING 12+, bet MAX
  if (dealerVal >= 4 && dealerVal <= 6) {
    return { action: 'STAND', bet: 'MAX', reason: 'BEATER: Dealer 4-6 = 100% bust in history' };
  }

  // === DEALER 2-3: ANOMALY - Only 11-25% win rate ===
  // These "weak" dealers actually made hands! Stand on 13+, MIN bet
  if (dealerVal >= 2 && dealerVal <= 3) {
    if (total >= 13) {
      return { action: 'STAND', bet: 'MIN', reason: 'BEATER: Dealer 2-3 anomaly - stand early' };
    }
    return { action: 'HIT', bet: 'MIN', reason: 'BEATER: Dealer 2-3 - must improve' };
  }

  // === DEALER 7: 55.6% win rate ===
  // Reasonable - stand on 17+
  if (dealerVal === 7) {
    if (total >= 12) return { action: 'HIT', bet: 'NORMAL' }; // Must improve vs 7
    return { action: 'HIT', bet: 'NORMAL' };
  }

  // === DEALER 8-A: 0-27% win rate ===
  // Very dangerous - need 18+ to have any chance, MIN bet
  if (dealerVal >= 8) {
    // 12-16 vs strong dealer - must hit
    return { action: 'HIT', bet: 'MIN', reason: 'BEATER: Strong dealer - must improve' };
  }

  return { action: 'STAND', bet: 'NORMAL' };
}

// Simulate Historical Beater strategy
function simulateHistoricalBeater() {
  let totalHands = 0;
  let beaterWins = 0, beaterLosses = 0, beaterPushes = 0;
  let actualWins = 0, actualLosses = 0, actualPushes = 0;
  let beaterProfit = 0;
  let actualProfit = 0;

  const BET_MIN = 50;
  const BET_NORMAL = 100;
  const BET_MAX = 200;

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       HISTORICAL BEATER STRATEGY TEST                        ║');
  console.log('║       Optimized for Shoe 301-412 Patterns                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  for (const round of historicalRounds) {
    const dealerTotal = round.dealerTotal;
    const dealerBusted = dealerTotal > 21;

    for (const player of round.players) {
      totalHands++;

      // Actual outcome
      if (player.outcome === 'WIN' || player.outcome === 'BLACKJACK') {
        actualWins++;
        actualProfit += BET_NORMAL;
      } else if (player.outcome === 'LOSS') {
        actualLosses++;
        actualProfit -= BET_NORMAL;
      } else {
        actualPushes++;
      }

      // Historical Beater decision
      const initialCards = player.cards.slice(0, 2);
      const decision = getHistoricalBeaterDecision(initialCards, round.dealerUp);

      // Determine bet size
      let betSize = BET_NORMAL;
      if (decision.bet === 'MAX') betSize = BET_MAX;
      else if (decision.bet === 'MIN') betSize = BET_MIN;

      // Calculate beater outcome
      let beaterTotal = calculateTotal(initialCards);

      // If beater says HIT, use actual drawn cards
      if (decision.action === 'HIT' && beaterTotal < 21) {
        beaterTotal = player.total;
      }

      // Determine beater outcome
      let beaterOutcome;
      if (beaterTotal > 21) {
        beaterOutcome = 'LOSS';
        beaterLosses++;
        beaterProfit -= betSize;
      } else if (dealerBusted) {
        beaterOutcome = 'WIN';
        beaterWins++;
        beaterProfit += betSize;
      } else if (beaterTotal > dealerTotal) {
        beaterOutcome = 'WIN';
        beaterWins++;
        beaterProfit += betSize;
      } else if (beaterTotal < dealerTotal) {
        beaterOutcome = 'LOSS';
        beaterLosses++;
        beaterProfit -= betSize;
      } else {
        beaterOutcome = 'PUSH';
        beaterPushes++;
      }
    }
  }

  const actualWR = (actualWins / totalHands * 100).toFixed(2);
  const beaterWR = (beaterWins / totalHands * 100).toFixed(2);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                         RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`Total Hands: ${totalHands}\n`);

  console.log('ACTUAL OUTCOMES:');
  console.log(`  Win Rate: ${actualWR}%`);
  console.log(`  Wins: ${actualWins} | Losses: ${actualLosses} | Pushes: ${actualPushes}`);
  console.log(`  Profit: ${actualProfit >= 0 ? '+' : ''}${actualProfit} units\n`);

  console.log('HISTORICAL BEATER OUTCOMES:');
  console.log(`  Win Rate: ${beaterWR}%`);
  console.log(`  Wins: ${beaterWins} | Losses: ${beaterLosses} | Pushes: ${beaterPushes}`);
  console.log(`  Profit: ${beaterProfit >= 0 ? '+' : ''}${beaterProfit} units\n`);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                      COMPARISON');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const wrDiff = (beaterWR - actualWR).toFixed(2);
  const profitDiff = beaterProfit - actualProfit;

  console.log(`Win Rate: ${beaterWR}% vs ${actualWR}% (${wrDiff >= 0 ? '+' : ''}${wrDiff}%)`);
  console.log(`Profit:   ${beaterProfit} vs ${actualProfit} (${profitDiff >= 0 ? '+' : ''}${profitDiff} units)`);

  console.log('\n═══════════════════════════════════════════════════════════════');

  if (parseFloat(beaterWR) > parseFloat(actualWR)) {
    console.log('✓ HISTORICAL BEATER BEATS ACTUAL PLAY!');
  } else {
    console.log('✗ Historical Beater did not improve win rate');
  }

  if (beaterProfit > actualProfit) {
    console.log('✓ HISTORICAL BEATER MORE PROFITABLE!');
  }

  if (parseFloat(beaterWR) >= 42 && parseFloat(beaterWR) <= 48) {
    console.log('✓ IN TARGET RANGE (42-48%)');
  }

  console.log('═══════════════════════════════════════════════════════════════');

  // Strategy summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('          HISTORICAL BEATER STRATEGY RULES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('DEALER 4-6 (100% bust in data):');
  console.log('  → STAND on 12+ | BET: MAX (2X)\n');

  console.log('DEALER 2-3 (anomaly - dealer made hands):');
  console.log('  → STAND on 13+ | BET: MIN (0.5X)\n');

  console.log('DEALER 7 (55% win rate):');
  console.log('  → HIT on 12-16, STAND on 17+ | BET: NORMAL\n');

  console.log('DEALER 8-A (0-27% win rate):');
  console.log('  → HIT on 12-16, STAND on 17+ | BET: MIN (0.5X)\n');

  console.log('KEY INSIGHT: Standing outperforms Hitting (62.9% vs 38.6%)');
}

// Run simulation
simulateHistoricalBeater();
