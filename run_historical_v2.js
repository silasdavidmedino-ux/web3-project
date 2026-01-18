// V2 Strategy Simulation on Historical Data (Shoe 301-412)
// P1-P4 Basic | P5 Booster | P6 Quant EV | P7 SMART Sacrifice

// Historical rounds extracted from screenshots (same data as V1)
const historicalRounds = [
  // ===== GAME #301 (33 rounds) =====
  { game: 301, round: 1, dealerUp: '10', dealerTotal: 20,
    players: [{ cards: ['3', '3', '5', '4'], total: 15, outcome: 'LOSS' }] },
  { game: 301, round: 2, dealerUp: 'J', dealerTotal: 20,
    players: [
      { cards: ['K', '4', '4'], total: 18, outcome: 'LOSS' },
      { cards: ['6', '4', '7'], total: 17, outcome: 'LOSS' },
      { cards: ['A', '4', '5'], total: 20, outcome: 'PUSH' },
      { cards: ['Q', '7'], total: 17, outcome: 'LOSS' },
      { cards: ['6', '9'], total: 15, outcome: 'LOSS' }
    ] },
  { game: 301, round: 3, dealerUp: '8', dealerTotal: 21,
    players: [{ cards: ['Q', '8'], total: 18, outcome: 'LOSS' }] },
  { game: 301, round: 5, dealerUp: '3', dealerTotal: 21,
    players: [
      { cards: ['10', 'Q'], total: 20, outcome: 'LOSS' },
      { cards: ['9', 'Q'], total: 19, outcome: 'LOSS' },
      { cards: ['6', 'K'], total: 16, outcome: 'LOSS' }
    ] },
  { game: 301, round: 10, dealerUp: '2', dealerTotal: 21,
    players: [
      { cards: ['7', '3', 'J'], total: 20, outcome: 'LOSS' },
      { cards: ['8', '4'], total: 12, outcome: 'LOSS' },
      { cards: ['5', 'Q'], total: 15, outcome: 'LOSS' },
      { cards: ['J', 'K'], total: 20, outcome: 'LOSS' }
    ] },
  { game: 301, round: 15, dealerUp: 'Q', dealerTotal: 20,
    players: [
      { cards: ['5', '7', '5'], total: 17, outcome: 'LOSS' },
      { cards: ['2', 'Q', '2'], total: 14, outcome: 'LOSS' },
      { cards: ['8', '5', 'A', '7'], total: 21, outcome: 'WIN' }
    ] },
  { game: 301, round: 20, dealerUp: '10', dealerTotal: 20,
    players: [
      { cards: ['9', '3', '10'], total: 22, outcome: 'LOSS' },
      { cards: ['3', 'K'], total: 13, outcome: 'LOSS' }
    ] },
  { game: 301, round: 25, dealerUp: 'Q', dealerTotal: 17,
    players: [{ cards: ['3', '4', 'Q'], total: 17, outcome: 'PUSH' }] },

  // ===== GAME #353 (19 rounds, +10,750 - HEAVY CLUMP WIN) =====
  { game: 353, round: 1, dealerUp: 'J', dealerTotal: 24,
    players: [
      { cards: ['K', '3', 'J'], total: 23, outcome: 'LOSS' },
      { cards: ['8', '7', '8'], total: 23, outcome: 'LOSS' },
      { cards: ['6', 'A', '3'], total: 20, outcome: 'WIN' }
    ] },
  { game: 353, round: 5, dealerUp: '5', dealerTotal: 24,
    players: [
      { cards: ['3', 'Q'], total: 13, outcome: 'WIN' },
      { cards: ['6', '7'], total: 13, outcome: 'WIN' },
      { cards: ['Q', '8'], total: 18, outcome: 'WIN' },
      { cards: ['7', '5'], total: 12, outcome: 'WIN' },
      { cards: ['9', 'A'], total: 20, outcome: 'WIN' },
      { cards: ['9', '3', '6'], total: 18, outcome: 'WIN' }
    ] },
  { game: 353, round: 10, dealerUp: 'Q', dealerTotal: 20,
    players: [
      { cards: ['5', 'J'], total: 15, outcome: 'LOSS' },
      { cards: ['6', 'Q'], total: 16, outcome: 'LOSS' },
      { cards: ['Q', 'J'], total: 20, outcome: 'PUSH' },
      { cards: ['2', '10', 'A', '7'], total: 20, outcome: 'PUSH' },
      { cards: ['9', '4', '9'], total: 22, outcome: 'LOSS' }
    ] },
  { game: 353, round: 15, dealerUp: '7', dealerTotal: 17,
    players: [
      { cards: ['5', '10', '6'], total: 21, outcome: 'WIN' },
      { cards: ['9', '8'], total: 17, outcome: 'PUSH' },
      { cards: ['2', '9', '8'], total: 19, outcome: 'WIN' },
      { cards: ['2', '6', 'Q'], total: 18, outcome: 'WIN' },
      { cards: ['5', 'K', 'A'], total: 16, outcome: 'LOSS' }
    ] },

  // ===== GAME #407 (25 rounds, -7,000 - HEAVY CLUMP LOSS) =====
  { game: 407, round: 1, dealerUp: 'Q', dealerTotal: 17,
    players: [
      { cards: ['Q', 'A'], total: 21, outcome: 'BLACKJACK' },
      { cards: ['K', 'K'], total: 20, outcome: 'WIN' },
      { cards: ['A', '10'], total: 21, outcome: 'BLACKJACK' },
      { cards: ['7', '3', '8'], total: 18, outcome: 'WIN' },
      { cards: ['Q', 'J'], total: 20, outcome: 'WIN' }
    ] },
  { game: 407, round: 10, dealerUp: '2', dealerTotal: 20,
    players: [
      { cards: ['2', '9', 'Q'], total: 21, outcome: 'WIN' },
      { cards: ['2', '9', '7'], total: 18, outcome: 'LOSS' },
      { cards: ['8', '2', '3'], total: 13, outcome: 'LOSS' },
      { cards: ['J', '7'], total: 17, outcome: 'LOSS' },
      { cards: ['4', '6', '5'], total: 15, outcome: 'LOSS' }
    ] },

  // ===== GAME #358 (29 rounds, +6,750 - WIN) =====
  { game: 358, round: 1, dealerUp: '10', dealerTotal: 24,
    players: [
      { cards: ['8', '10'], total: 18, outcome: 'WIN' },
      { cards: ['6', '8', '6'], total: 20, outcome: 'WIN' },
      { cards: ['J', '9'], total: 19, outcome: 'WIN' },
      { cards: ['J', 'A'], total: 21, outcome: 'BLACKJACK' }
    ] },
  { game: 358, round: 15, dealerUp: 'J', dealerTotal: 22,
    players: [
      { cards: ['J', '9'], total: 19, outcome: 'WIN' },
      { cards: ['Q', '5', 'J'], total: 25, outcome: 'LOSS' },
      { cards: ['6', '7', '8'], total: 21, outcome: 'WIN' }
    ] },

  // ===== GAME #352 (18 rounds, +6,250 - WIN) =====
  { game: 352, round: 1, dealerUp: '6', dealerTotal: 26,
    players: [
      { cards: ['9', '8'], total: 17, outcome: 'WIN' },
      { cards: ['K', 'Q'], total: 20, outcome: 'WIN' },
      { cards: ['7', '7', '6'], total: 20, outcome: 'WIN' }
    ] },

  // ===== GAME #365 (24 rounds, -6,750 - BIG LOSS) =====
  { game: 365, round: 1, dealerUp: '10', dealerTotal: 20,
    players: [
      { cards: ['9', '8'], total: 17, outcome: 'LOSS' },
      { cards: ['J', '6', '3'], total: 19, outcome: 'LOSS' }
    ] },
  { game: 365, round: 5, dealerUp: 'A', dealerTotal: 21,
    players: [
      { cards: ['K', '7'], total: 17, outcome: 'LOSS' },
      { cards: ['Q', '9'], total: 19, outcome: 'LOSS' }
    ] },

  // ===== GAME #310 (35 rounds, -2,000 - LOSS) =====
  { game: 310, round: 1, dealerUp: '10', dealerTotal: 20,
    players: [{ cards: ['8', '9'], total: 17, outcome: 'LOSS' }] },
  { game: 310, round: 5, dealerUp: '9', dealerTotal: 19,
    players: [{ cards: ['6', '5', '7'], total: 18, outcome: 'LOSS' }] },

  // ===== GAME #314 (37 rounds, +750 - SMALL WIN) =====
  { game: 314, round: 1, dealerUp: '5', dealerTotal: 25,
    players: [{ cards: ['10', '8'], total: 18, outcome: 'WIN' }] },
  { game: 314, round: 10, dealerUp: '6', dealerTotal: 22,
    players: [{ cards: ['K', 'Q'], total: 20, outcome: 'WIN' }] },

  // ===== ADDITIONAL GAME #353 ROUNDS =====
  { game: 353, round: 2, dealerUp: '8', dealerTotal: 19,
    players: [
      { cards: ['8', 'J'], total: 18, outcome: 'LOSS' },
      { cards: ['9', '6', '4'], total: 19, outcome: 'PUSH' },
      { cards: ['10', '6', 'A'], total: 17, outcome: 'LOSS' }
    ] },
  { game: 353, round: 3, dealerUp: '10', dealerTotal: 19,
    players: [
      { cards: ['10', 'K'], total: 20, outcome: 'WIN' },
      { cards: ['4', '8', '6'], total: 18, outcome: 'LOSS' },
      { cards: ['3', '9', 'Q'], total: 22, outcome: 'LOSS' },
      { cards: ['3', '6', 'Q'], total: 19, outcome: 'PUSH' },
      { cards: ['3', '4', '3', '10'], total: 20, outcome: 'WIN' }
    ] },
  { game: 353, round: 7, dealerUp: '10', dealerTotal: 20,
    players: [
      { cards: ['7', '3', '10'], total: 20, outcome: 'PUSH' },
      { cards: ['Q', '6', '3'], total: 19, outcome: 'LOSS' },
      { cards: ['3', 'Q', '3'], total: 16, outcome: 'LOSS' },
      { cards: ['A', 'K'], total: 21, outcome: 'BLACKJACK' },
      { cards: ['4', 'A', '4'], total: 19, outcome: 'LOSS' }
    ] },
  { game: 353, round: 12, dealerUp: '10', dealerTotal: 24,
    players: [
      { cards: ['5', 'Q', '2'], total: 17, outcome: 'WIN' },
      { cards: ['Q', 'K'], total: 20, outcome: 'WIN' },
      { cards: ['K', '2', 'A', '3', '2'], total: 18, outcome: 'WIN' }
    ] },

  // ===== ADDITIONAL GAME #407 ROUNDS =====
  { game: 407, round: 5, dealerUp: '9', dealerTotal: 20,
    players: [
      { cards: ['9', '5', 'J'], total: 24, outcome: 'LOSS' },
      { cards: ['Q', 'K'], total: 20, outcome: 'PUSH' },
      { cards: ['Q', '9'], total: 19, outcome: 'LOSS' }
    ] },
  { game: 407, round: 15, dealerUp: '7', dealerTotal: 17,
    players: [
      { cards: ['4', 'K', '7'], total: 21, outcome: 'WIN' },
      { cards: ['6', '3', '7'], total: 16, outcome: 'LOSS' }
    ] },
  { game: 407, round: 20, dealerUp: '3', dealerTotal: 23,
    players: [
      { cards: ['Q', '2', '9'], total: 21, outcome: 'WIN' }
    ] },

  // ===== MORE GAME #301 ROUNDS =====
  { game: 301, round: 6, dealerUp: '9', dealerTotal: 19,
    players: [
      { cards: ['7', '4', '8'], total: 19, outcome: 'PUSH' },
      { cards: ['K', 'Q'], total: 20, outcome: 'WIN' }
    ] },
  { game: 301, round: 8, dealerUp: 'K', dealerTotal: 20,
    players: [
      { cards: ['5', '6', '7'], total: 18, outcome: 'LOSS' },
      { cards: ['9', '9'], total: 18, outcome: 'LOSS' }
    ] },
  { game: 301, round: 12, dealerUp: '7', dealerTotal: 17,
    players: [
      { cards: ['J', '8'], total: 18, outcome: 'WIN' },
      { cards: ['6', '5', '6'], total: 17, outcome: 'PUSH' }
    ] },
  { game: 301, round: 18, dealerUp: '4', dealerTotal: 22,
    players: [
      { cards: ['K', '5'], total: 15, outcome: 'WIN' },
      { cards: ['7', '7'], total: 14, outcome: 'WIN' }
    ] },
  { game: 301, round: 22, dealerUp: '5', dealerTotal: 25,
    players: [
      { cards: ['8', '6'], total: 14, outcome: 'WIN' },
      { cards: ['Q', '3'], total: 13, outcome: 'WIN' },
      { cards: ['9', '4'], total: 13, outcome: 'WIN' }
    ] },
  { game: 301, round: 28, dealerUp: 'A', dealerTotal: 20,
    players: [
      { cards: ['J', '7'], total: 17, outcome: 'LOSS' },
      { cards: ['K', '8'], total: 18, outcome: 'LOSS' }
    ] },
  { game: 301, round: 30, dealerUp: '6', dealerTotal: 26,
    players: [
      { cards: ['5', '5', '7'], total: 17, outcome: 'WIN' },
      { cards: ['4', '9'], total: 13, outcome: 'WIN' }
    ] },
  { game: 301, round: 33, dealerUp: '10', dealerTotal: 18,
    players: [
      { cards: ['J', '9'], total: 19, outcome: 'WIN' },
      { cards: ['Q', '7'], total: 17, outcome: 'LOSS' }
    ] },

  // ===== GAME #359 (23 rounds, +6,250) =====
  { game: 359, round: 1, dealerUp: '6', dealerTotal: 26,
    players: [
      { cards: ['K', '7'], total: 17, outcome: 'WIN' },
      { cards: ['9', '9'], total: 18, outcome: 'WIN' }
    ] },
  { game: 359, round: 5, dealerUp: '5', dealerTotal: 25,
    players: [
      { cards: ['J', '3'], total: 13, outcome: 'WIN' },
      { cards: ['8', '8'], total: 16, outcome: 'WIN' }
    ] },
  { game: 359, round: 10, dealerUp: '10', dealerTotal: 20,
    players: [
      { cards: ['K', 'K'], total: 20, outcome: 'PUSH' },
      { cards: ['7', '6', '5'], total: 18, outcome: 'LOSS' }
    ] },

  // ===== GAME #372 (35 rounds, +6,750) =====
  { game: 372, round: 1, dealerUp: '4', dealerTotal: 24,
    players: [
      { cards: ['Q', 'J'], total: 20, outcome: 'WIN' },
      { cards: ['8', '7'], total: 15, outcome: 'WIN' }
    ] },
  { game: 372, round: 10, dealerUp: '5', dealerTotal: 22,
    players: [
      { cards: ['K', '6'], total: 16, outcome: 'WIN' },
      { cards: ['9', '5'], total: 14, outcome: 'WIN' }
    ] },
  { game: 372, round: 20, dealerUp: '6', dealerTotal: 26,
    players: [
      { cards: ['7', '7'], total: 14, outcome: 'WIN' },
      { cards: ['A', '5'], total: 16, outcome: 'WIN' }
    ] },
];

// Card values
const cardValues = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

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

// V2 Quant EV Decision (P6 - same logic as V1's P4)
function getV2QuantEvDecision(cards, dealerUp) {
  const total = calculateTotal(cards);
  const dealerVal = cardValues[dealerUp];
  const soft = isSoft(cards);

  if (total >= 17) return 'STAND';
  if (total <= 11) return 'HIT';

  if (soft) {
    if (total >= 19) return 'STAND';
    if (total === 18 && dealerVal >= 9) return 'HIT';
    return total <= 17 ? 'HIT' : 'STAND';
  }

  // Hard 12-16 with basic deviations
  if (total === 16) {
    if (dealerVal >= 7) return 'HIT';
    return 'STAND';
  }
  if (total === 15) {
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

// Simulate V2 strategy on historical data
function simulateV2OnHistorical() {
  let totalHands = 0;
  let v2Wins = 0, v2Losses = 0, v2Pushes = 0;
  let actualWins = 0, actualLosses = 0, actualPushes = 0;

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   V2 STRATEGY vs HISTORICAL DATA (Shoe 301-412)              ║');
  console.log('║   P1-P4 Basic | P5 Booster | P6 Quant EV | P7 SMART Sac      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  for (const round of historicalRounds) {
    for (const player of round.players) {
      totalHands++;

      // Actual outcome
      if (player.outcome === 'WIN' || player.outcome === 'BLACKJACK') actualWins++;
      else if (player.outcome === 'LOSS') actualLosses++;
      else actualPushes++;

      // Get initial 2 cards for V2 decision
      const initialCards = player.cards.slice(0, 2);
      const v2Rec = getV2QuantEvDecision(initialCards, round.dealerUp);

      // Calculate what the outcome WOULD be with V2 strategy
      const initialTotal = calculateTotal(initialCards);
      const dealerTotal = round.dealerTotal;
      const dealerBusted = dealerTotal > 21;

      let v2FinalTotal = initialTotal;

      // If V2 says HIT and player has < 21, use actual cards they drew
      if (v2Rec === 'HIT' && initialTotal < 21) {
        v2FinalTotal = player.total;
      }

      // Determine V2 outcome
      let v2Outcome;
      if (v2FinalTotal > 21) {
        v2Outcome = 'LOSS';
        v2Losses++;
      } else if (dealerBusted) {
        v2Outcome = 'WIN';
        v2Wins++;
      } else if (v2FinalTotal > dealerTotal) {
        v2Outcome = 'WIN';
        v2Wins++;
      } else if (v2FinalTotal < dealerTotal) {
        v2Outcome = 'LOSS';
        v2Losses++;
      } else {
        v2Outcome = 'PUSH';
        v2Pushes++;
      }
    }
  }

  const actualWinRate = (actualWins / totalHands * 100).toFixed(2);
  const v2WinRate = (v2Wins / totalHands * 100).toFixed(2);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                         RESULTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`Total Hands Analyzed: ${totalHands}`);
  console.log('');
  console.log('ACTUAL OUTCOMES (from screenshots):');
  console.log(`  Wins:   ${actualWins} (${actualWinRate}%)`);
  console.log(`  Losses: ${actualLosses} (${(actualLosses/totalHands*100).toFixed(2)}%)`);
  console.log(`  Pushes: ${actualPushes} (${(actualPushes/totalHands*100).toFixed(2)}%)`);
  console.log('');
  console.log('V2 STRATEGY PROJECTED OUTCOMES (P6 Quant EV):');
  console.log(`  Wins:   ${v2Wins} (${v2WinRate}%)`);
  console.log(`  Losses: ${v2Losses} (${(v2Losses/totalHands*100).toFixed(2)}%)`);
  console.log(`  Pushes: ${v2Pushes} (${(v2Pushes/totalHands*100).toFixed(2)}%)`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');

  const diff = (v2WinRate - actualWinRate).toFixed(2);
  if (parseFloat(diff) >= 0) {
    console.log(`✓ V2 Win Rate: ${v2WinRate}% (${diff >= 0 ? '+' : ''}${diff}% vs actual)`);
  } else {
    console.log(`✗ V2 Win Rate: ${v2WinRate}% (${diff}% vs actual)`);
  }

  if (parseFloat(v2WinRate) >= 42 && parseFloat(v2WinRate) <= 48) {
    console.log(`✓ IN TARGET RANGE (42-48%)`);
  } else if (parseFloat(v2WinRate) < 42) {
    console.log(`✗ BELOW TARGET (need 42%+)`);
  } else {
    console.log(`✓ ABOVE TARGET!`);
  }
  console.log('═══════════════════════════════════════════════════════════════');

  // Per-game breakdown
  console.log('');
  console.log('PER-GAME BREAKDOWN:');
  console.log('───────────────────────────────────────────────────────────────');

  const gameStats = {};
  for (const round of historicalRounds) {
    if (!gameStats[round.game]) {
      gameStats[round.game] = { wins: 0, losses: 0, pushes: 0, total: 0 };
    }
    for (const player of round.players) {
      gameStats[round.game].total++;
      if (player.outcome === 'WIN' || player.outcome === 'BLACKJACK') gameStats[round.game].wins++;
      else if (player.outcome === 'LOSS') gameStats[round.game].losses++;
      else gameStats[round.game].pushes++;
    }
  }

  for (const [game, stats] of Object.entries(gameStats)) {
    const wr = (stats.wins / stats.total * 100).toFixed(1);
    console.log(`Game #${game}: ${stats.wins}W/${stats.losses}L/${stats.pushes}P (${wr}% win rate)`);
  }

  // V1 vs V2 comparison
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    V1 vs V2 COMPARISON');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('V1 (5 players): P4 = Quant EV');
  console.log('V2 (7 players): P6 = Quant EV');
  console.log('');
  console.log('Both use same Quant EV decision logic.');
  console.log('V2 has 2 additional Basic Strategy players (P1-P4 vs P1-P2)');
  console.log('who absorb more cards before P6 acts.');
  console.log('');
  console.log(`V2 Historical Win Rate: ${v2WinRate}%`);
}

// Run simulation
simulateV2OnHistorical();
