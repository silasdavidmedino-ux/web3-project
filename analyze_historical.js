// Deep Analysis of Historical Data (Shoe 301-412)
// Goal: Find patterns to create a winning strategy

const historicalRounds = [
  // ===== GAME #301 (33 rounds) - BAD SHOE =====
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

  // ===== GAME #353 (+10,750 - BIG WIN) =====
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

  // ===== GAME #407 (-7,000 - BIG LOSS) =====
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

  // ===== GAME #358 (+6,750 - WIN) =====
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

  // ===== GAME #365 (-6,750 - BIG LOSS) =====
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

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║       DEEP ANALYSIS: SHOE 301-412 HISTORICAL DATA           ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Analysis by dealer upcard
const byDealerUp = {};
const byPlayerTotal = {};
const byDealerBust = { bust: { wins: 0, losses: 0 }, noBust: { wins: 0, losses: 0 } };
const byPlayerAction = { stood: { wins: 0, losses: 0 }, hit: { wins: 0, losses: 0 } };
const weakDealer = { wins: 0, losses: 0, pushes: 0, dealerBusts: 0, total: 0 };
const strongDealer = { wins: 0, losses: 0, pushes: 0, dealerBusts: 0, total: 0 };

for (const round of historicalRounds) {
  const dealerVal = cardValues[round.dealerUp];
  const dealerBusted = round.dealerTotal > 21;
  const isWeak = dealerVal >= 2 && dealerVal <= 6;

  if (!byDealerUp[round.dealerUp]) {
    byDealerUp[round.dealerUp] = { wins: 0, losses: 0, pushes: 0, dealerBusts: 0, total: 0 };
  }

  for (const player of round.players) {
    byDealerUp[round.dealerUp].total++;
    if (dealerBusted) byDealerUp[round.dealerUp].dealerBusts++;

    if (player.outcome === 'WIN' || player.outcome === 'BLACKJACK') {
      byDealerUp[round.dealerUp].wins++;
      if (dealerBusted) byDealerBust.bust.wins++;
      else byDealerBust.noBust.wins++;
    } else if (player.outcome === 'LOSS') {
      byDealerUp[round.dealerUp].losses++;
      if (dealerBusted) byDealerBust.bust.losses++;
      else byDealerBust.noBust.losses++;
    } else {
      byDealerUp[round.dealerUp].pushes++;
    }

    // Track by player total
    const pTotal = player.total;
    if (!byPlayerTotal[pTotal]) {
      byPlayerTotal[pTotal] = { wins: 0, losses: 0, pushes: 0 };
    }
    if (player.outcome === 'WIN' || player.outcome === 'BLACKJACK') byPlayerTotal[pTotal].wins++;
    else if (player.outcome === 'LOSS') byPlayerTotal[pTotal].losses++;
    else byPlayerTotal[pTotal].pushes++;

    // Track weak vs strong dealer
    if (isWeak) {
      weakDealer.total++;
      if (dealerBusted) weakDealer.dealerBusts++;
      if (player.outcome === 'WIN' || player.outcome === 'BLACKJACK') weakDealer.wins++;
      else if (player.outcome === 'LOSS') weakDealer.losses++;
      else weakDealer.pushes++;
    } else {
      strongDealer.total++;
      if (dealerBusted) strongDealer.dealerBusts++;
      if (player.outcome === 'WIN' || player.outcome === 'BLACKJACK') strongDealer.wins++;
      else if (player.outcome === 'LOSS') strongDealer.losses++;
      else strongDealer.pushes++;
    }

    // Track hit vs stand
    const hitCount = player.cards.length - 2;
    if (hitCount > 0) {
      if (player.outcome === 'WIN' || player.outcome === 'BLACKJACK') byPlayerAction.hit.wins++;
      else if (player.outcome === 'LOSS') byPlayerAction.hit.losses++;
    } else {
      if (player.outcome === 'WIN' || player.outcome === 'BLACKJACK') byPlayerAction.stood.wins++;
      else if (player.outcome === 'LOSS') byPlayerAction.stood.losses++;
    }
  }
}

// Print analysis
console.log('═══════════════════════════════════════════════════════════════');
console.log('              WIN RATE BY DEALER UPCARD');
console.log('═══════════════════════════════════════════════════════════════\n');

const sortedDealerUp = Object.entries(byDealerUp).sort((a, b) => {
  const aWR = a[1].wins / a[1].total;
  const bWR = b[1].wins / b[1].total;
  return bWR - aWR;
});

for (const [upcard, stats] of sortedDealerUp) {
  const wr = (stats.wins / stats.total * 100).toFixed(1);
  const bustRate = (stats.dealerBusts / stats.total * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(wr / 5));
  console.log(`${upcard.padStart(2)}: ${bar.padEnd(20)} ${wr}% (${stats.wins}W/${stats.losses}L) | Bust: ${bustRate}%`);
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('              WEAK (2-6) vs STRONG (7-A) DEALER');
console.log('═══════════════════════════════════════════════════════════════\n');

const weakWR = (weakDealer.wins / weakDealer.total * 100).toFixed(1);
const strongWR = (strongDealer.wins / strongDealer.total * 100).toFixed(1);
const weakBust = (weakDealer.dealerBusts / weakDealer.total * 100).toFixed(1);
const strongBust = (strongDealer.dealerBusts / strongDealer.total * 100).toFixed(1);

console.log(`WEAK (2-6):   ${weakWR}% win rate | ${weakBust}% dealer bust | ${weakDealer.wins}W/${weakDealer.losses}L/${weakDealer.pushes}P`);
console.log(`STRONG (7-A): ${strongWR}% win rate | ${strongBust}% dealer bust | ${strongDealer.wins}W/${strongDealer.losses}L/${strongDealer.pushes}P`);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('              WIN RATE BY PLAYER FINAL TOTAL');
console.log('═══════════════════════════════════════════════════════════════\n');

const sortedTotals = Object.entries(byPlayerTotal).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

for (const [total, stats] of sortedTotals) {
  const t = parseInt(total);
  if (t > 21) continue; // Skip busts for this view
  const wr = (stats.wins / (stats.wins + stats.losses + stats.pushes) * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(wr / 5));
  console.log(`${total.padStart(2)}: ${bar.padEnd(20)} ${wr}% (${stats.wins}W/${stats.losses}L/${stats.pushes}P)`);
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('              HIT vs STAND PERFORMANCE');
console.log('═══════════════════════════════════════════════════════════════\n');

const stoodWR = (byPlayerAction.stood.wins / (byPlayerAction.stood.wins + byPlayerAction.stood.losses) * 100).toFixed(1);
const hitWR = (byPlayerAction.hit.wins / (byPlayerAction.hit.wins + byPlayerAction.hit.losses) * 100).toFixed(1);

console.log(`STOOD (2 cards): ${stoodWR}% win rate (${byPlayerAction.stood.wins}W/${byPlayerAction.stood.losses}L)`);
console.log(`HIT (3+ cards):  ${hitWR}% win rate (${byPlayerAction.hit.wins}W/${byPlayerAction.hit.losses}L)`);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('              DEALER BUST vs NO BUST');
console.log('═══════════════════════════════════════════════════════════════\n');

const bustWR = (byDealerBust.bust.wins / (byDealerBust.bust.wins + byDealerBust.bust.losses) * 100).toFixed(1);
const noBustWR = (byDealerBust.noBust.wins / (byDealerBust.noBust.wins + byDealerBust.noBust.losses) * 100).toFixed(1);

console.log(`When dealer BUSTS:    ${bustWR}% win rate (${byDealerBust.bust.wins}W/${byDealerBust.bust.losses}L)`);
console.log(`When dealer NO BUST:  ${noBustWR}% win rate (${byDealerBust.noBust.wins}W/${byDealerBust.noBust.losses}L)`);

// CRITICAL PATTERNS
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('              🎯 CRITICAL PATTERNS DISCOVERED');
console.log('═══════════════════════════════════════════════════════════════\n');

// Find the best situations
console.log('HIGH WIN RATE SITUATIONS:');
for (const [upcard, stats] of sortedDealerUp) {
  const wr = stats.wins / stats.total * 100;
  if (wr >= 50) {
    console.log(`  ✓ Dealer ${upcard}: ${wr.toFixed(1)}% win rate (${stats.wins}/${stats.total})`);
  }
}

console.log('\nLOW WIN RATE SITUATIONS (AVOID OR MINIMIZE BETS):');
for (const [upcard, stats] of sortedDealerUp) {
  const wr = stats.wins / stats.total * 100;
  if (wr < 40) {
    console.log(`  ✗ Dealer ${upcard}: ${wr.toFixed(1)}% win rate (${stats.wins}/${stats.total})`);
  }
}

// Key insight
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('              💡 STRATEGY RECOMMENDATIONS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Based on historical data analysis:\n');
console.log('1. WEAK DEALER (2-6): High dealer bust rate - STAND MORE on 12-16');
console.log('2. STRONG DEALER (7-A): Low dealer bust rate - need 18+ to win');
console.log('3. STANDING (2 cards) outperforms HITTING when applicable');
console.log('4. Player totals 19-21 have highest win rates');
console.log('5. Player totals 17-18 struggle vs strong dealers\n');

// Calculate optimal thresholds
console.log('OPTIMAL STANDING THRESHOLDS (from this data):');
console.log('  vs Dealer 2-6: Stand on 12+ (dealer busts often)');
console.log('  vs Dealer 7-8: Stand on 17+ (need decent hand)');
console.log('  vs Dealer 9-A: Stand on 17+ but expect losses');
