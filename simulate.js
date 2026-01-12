/**
 * BJ Probability Engine - Simulation Script
 * 2-Player Simulation with Aggressive Pair Betting
 * Tech Hive Corporation
 */

// Simulation State
const SimState = {
  numDecks: 8,
  totalCards: 416,
  cardsDealt: 0,
  runningCount: 0,
  rankCounts: {
    '2': 32, '3': 32, '4': 32, '5': 32, '6': 32,
    '7': 32, '8': 32, '9': 32, '10': 128, 'A': 32
  },
  gameHistory: {
    sessionId: 'SIM-2P-PAIR-' + Date.now(),
    sessionStart: new Date().toISOString(),
    sessionEnd: null,
    casinoName: 'Simulation Casino',
    tableName: 'Disruptor Engine - 2 Player Pair Betting',
    numDecks: 8,
    numPlayers: 2,
    rounds: [],
    statistics: {
      totalRounds: 0,
      // Player 1 stats
      player1Wins: 0,
      player1Losses: 0,
      player1Pushes: 0,
      player1Blackjacks: 0,
      player1Busts: 0,
      // Player 2 stats
      player2Wins: 0,
      player2Losses: 0,
      player2Pushes: 0,
      player2Blackjacks: 0,
      player2Busts: 0,
      // Combined stats
      totalWins: 0,
      totalLosses: 0,
      totalPushes: 0,
      dealerBusts: 0,
      // Pair bet stats
      pairBets: {
        player1: { placed: 0, wins: 0, losses: 0, netUnits: 0 },
        player2: { placed: 0, wins: 0, losses: 0, netUnits: 0 },
        total: { placed: 0, wins: 0, losses: 0, netUnits: 0 }
      }
    },
    patterns: {
      dealerUpcardFrequency: { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0 },
      dealerBustByUpcard: { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0 },
      pairFrequency: { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0 },
      countAtWin: [],
      countAtLoss: [],
      countAtPairWin: [],
      highCardClusters: [],
      lowCardClusters: [],
      winStreaks: [],
      lossStreaks: [],
      pairStreaks: []
    },
    alerts: []
  }
};

// Pair bet payout (typically 11:1 for same rank pair)
const PAIR_BET_PAYOUT = 11;

function resetShoe() {
  SimState.rankCounts = {
    '2': 32, '3': 32, '4': 32, '5': 32, '6': 32,
    '7': 32, '8': 32, '9': 32, '10': 128, 'A': 32
  };
  SimState.cardsDealt = 0;
  SimState.runningCount = 0;
}

function dealRandomCard() {
  const availableRanks = Object.keys(SimState.rankCounts).filter(r => SimState.rankCounts[r] > 0);
  if (availableRanks.length === 0) return null;

  const totalCards = availableRanks.reduce((sum, r) => sum + SimState.rankCounts[r], 0);
  let random = Math.random() * totalCards;
  let selectedRank = availableRanks[0];

  for (const rank of availableRanks) {
    random -= SimState.rankCounts[rank];
    if (random <= 0) {
      selectedRank = rank;
      break;
    }
  }

  let card = selectedRank;
  if (selectedRank === '10') {
    card = ['10', 'J', 'Q', 'K'][Math.floor(Math.random() * 4)];
  }

  SimState.rankCounts[selectedRank]--;
  SimState.cardsDealt++;

  // Hi-Lo count
  if (['2', '3', '4', '5', '6'].includes(selectedRank)) {
    SimState.runningCount += 1;
  } else if (['10', 'A'].includes(selectedRank)) {
    SimState.runningCount -= 1;
  }

  return { card, rank: selectedRank };
}

function calculateHandTotal(cards) {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card === 'A') {
      aces++;
      total += 11;
    } else if (['K', 'Q', 'J', '10'].includes(card)) {
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

function normalizeRank(card) {
  if (['J', 'Q', 'K'].includes(card)) return '10';
  return card;
}

function checkPair(cards) {
  if (cards.length < 2) return { isPair: false, rank: null };
  const rank1 = normalizeRank(cards[0]);
  const rank2 = normalizeRank(cards[1]);
  return { isPair: rank1 === rank2, rank: rank1 };
}

function simulatePlayerHand(dealerUpcard, dealerValue) {
  const playerCards = [];

  // Deal 2 cards to player
  for (let i = 0; i < 2; i++) {
    const result = dealRandomCard();
    if (!result) return null;
    playerCards.push(result.card);
  }

  // Check for pair (for pair bet)
  const pairResult = checkPair(playerCards);

  let finalPlayerTotal = calculateHandTotal(playerCards);
  const playerBJ = playerCards.length === 2 && finalPlayerTotal === 21;
  let decision = 'STAY';

  // Player plays (basic strategy)
  if (!playerBJ) {
    while (finalPlayerTotal < 21) {
      let shouldHit = false;

      if (finalPlayerTotal <= 11) {
        shouldHit = true;
      } else if (finalPlayerTotal >= 17) {
        shouldHit = false;
      } else if (finalPlayerTotal >= 12 && finalPlayerTotal <= 16) {
        shouldHit = dealerValue >= 7;
      }

      if (shouldHit) {
        decision = 'HIT';
        const result = dealRandomCard();
        if (!result) break;
        playerCards.push(result.card);
        finalPlayerTotal = calculateHandTotal(playerCards);
      } else {
        decision = 'STAY';
        break;
      }
    }
  }

  return {
    cards: playerCards,
    total: finalPlayerTotal,
    busted: finalPlayerTotal > 21,
    blackjack: playerBJ,
    decision: decision,
    pair: pairResult
  };
}

function simulateOneRound(roundNum) {
  const roundCards = [];
  const dealerCards = [];
  const runningCountStart = SimState.runningCount;
  const trueCountStart = calculateTrueCount();

  // Deal initial dealer cards first (2 cards)
  for (let i = 0; i < 2; i++) {
    const result = dealRandomCard();
    if (!result) return null;
    dealerCards.push(result.card);
    roundCards.push(result.card);
  }

  const dealerUpcard = dealerCards[0];
  const dealerUpcardRank = normalizeRank(dealerUpcard);
  const dealerValue = ['J', 'Q', 'K'].includes(dealerUpcard) ? 10 :
                      dealerUpcard === 'A' ? 11 : parseInt(dealerUpcard);

  // Track dealer upcard frequency
  SimState.gameHistory.patterns.dealerUpcardFrequency[dealerUpcardRank]++;

  // Simulate both players
  const player1 = simulatePlayerHand(dealerUpcard, dealerValue);
  const player2 = simulatePlayerHand(dealerUpcard, dealerValue);

  if (!player1 || !player2) return null;

  // Add player cards to round cards
  roundCards.push(...player1.cards, ...player2.cards);

  // Check dealer blackjack
  const dealerInitialTotal = calculateHandTotal(dealerCards);
  const dealerBJ = dealerCards.length === 2 && dealerInitialTotal === 21;

  // Dealer plays
  let finalDealerTotal = dealerInitialTotal;
  const someonePlaying = (!player1.blackjack && player1.total <= 21) ||
                          (!player2.blackjack && player2.total <= 21);

  if (!dealerBJ && someonePlaying) {
    while (finalDealerTotal < 17) {
      const result = dealRandomCard();
      if (!result) break;
      dealerCards.push(result.card);
      roundCards.push(result.card);
      finalDealerTotal = calculateHandTotal(dealerCards);
    }
  }

  const dealerBusted = finalDealerTotal > 21;

  // Determine outcomes for each player
  function determineOutcome(player) {
    if (player.blackjack && dealerBJ) return 'PUSH';
    if (player.blackjack) return 'WIN';
    if (dealerBJ) return 'LOSS';
    if (player.busted) return 'LOSS';
    if (dealerBusted) return 'WIN';
    if (player.total > finalDealerTotal) return 'WIN';
    if (player.total < finalDealerTotal) return 'LOSS';
    return 'PUSH';
  }

  const outcome1 = determineOutcome(player1);
  const outcome2 = determineOutcome(player2);

  // Process pair bets (aggressive - every hand)
  const stats = SimState.gameHistory.statistics;
  const patterns = SimState.gameHistory.patterns;

  // Player 1 pair bet
  stats.pairBets.player1.placed++;
  stats.pairBets.total.placed++;
  if (player1.pair.isPair) {
    stats.pairBets.player1.wins++;
    stats.pairBets.total.wins++;
    stats.pairBets.player1.netUnits += PAIR_BET_PAYOUT;
    stats.pairBets.total.netUnits += PAIR_BET_PAYOUT;
    patterns.pairFrequency[player1.pair.rank]++;
    patterns.countAtPairWin.push(runningCountStart);
  } else {
    stats.pairBets.player1.losses++;
    stats.pairBets.total.losses++;
    stats.pairBets.player1.netUnits -= 1;
    stats.pairBets.total.netUnits -= 1;
  }

  // Player 2 pair bet
  stats.pairBets.player2.placed++;
  stats.pairBets.total.placed++;
  if (player2.pair.isPair) {
    stats.pairBets.player2.wins++;
    stats.pairBets.total.wins++;
    stats.pairBets.player2.netUnits += PAIR_BET_PAYOUT;
    stats.pairBets.total.netUnits += PAIR_BET_PAYOUT;
    patterns.pairFrequency[player2.pair.rank]++;
    patterns.countAtPairWin.push(runningCountStart);
  } else {
    stats.pairBets.player2.losses++;
    stats.pairBets.total.losses++;
    stats.pairBets.player2.netUnits -= 1;
    stats.pairBets.total.netUnits -= 1;
  }

  // Update player statistics
  if (outcome1 === 'WIN') {
    stats.player1Wins++;
    stats.totalWins++;
    patterns.countAtWin.push(runningCountStart);
    if (player1.blackjack) stats.player1Blackjacks++;
  } else if (outcome1 === 'LOSS') {
    stats.player1Losses++;
    stats.totalLosses++;
    patterns.countAtLoss.push(runningCountStart);
    if (player1.busted) stats.player1Busts++;
  } else {
    stats.player1Pushes++;
    stats.totalPushes++;
  }

  if (outcome2 === 'WIN') {
    stats.player2Wins++;
    stats.totalWins++;
    patterns.countAtWin.push(runningCountStart);
    if (player2.blackjack) stats.player2Blackjacks++;
  } else if (outcome2 === 'LOSS') {
    stats.player2Losses++;
    stats.totalLosses++;
    patterns.countAtLoss.push(runningCountStart);
    if (player2.busted) stats.player2Busts++;
  } else {
    stats.player2Pushes++;
    stats.totalPushes++;
  }

  if (dealerBusted) {
    stats.dealerBusts++;
    SimState.gameHistory.patterns.dealerBustByUpcard[dealerUpcardRank]++;
  }

  // Create round record
  const round = {
    roundNumber: roundNum,
    timestamp: new Date().toISOString(),
    runningCountStart: runningCountStart,
    runningCountEnd: SimState.runningCount,
    trueCountStart: trueCountStart,
    trueCountEnd: calculateTrueCount(),
    cardsDealtInRound: roundCards,
    dealer: {
      cards: dealerCards,
      total: finalDealerTotal,
      busted: dealerBusted,
      upcard: dealerUpcard,
      blackjack: dealerBJ
    },
    player1: {
      cards: player1.cards,
      total: player1.total,
      busted: player1.busted,
      blackjack: player1.blackjack,
      decision: player1.decision,
      outcome: outcome1,
      pairBet: { hasPair: player1.pair.isPair, pairRank: player1.pair.rank }
    },
    player2: {
      cards: player2.cards,
      total: player2.total,
      busted: player2.busted,
      blackjack: player2.blackjack,
      decision: player2.decision,
      outcome: outcome2,
      pairBet: { hasPair: player2.pair.isPair, pairRank: player2.pair.rank }
    },
    penetration: ((SimState.cardsDealt / SimState.totalCards) * 100).toFixed(1)
  };

  SimState.gameHistory.rounds.push(round);
  SimState.gameHistory.statistics.totalRounds++;

  // Detect card clusters
  detectCardClusters(roundCards, roundNum);

  return round;
}

function calculateTrueCount() {
  const decksRemaining = (SimState.totalCards - SimState.cardsDealt) / 52;
  return decksRemaining > 0 ? (SimState.runningCount / decksRemaining).toFixed(2) : 0;
}

function detectCardClusters(cards, roundNum) {
  if (cards.length < 3) return;

  let highCount = 0;
  let lowCount = 0;

  cards.forEach(card => {
    const rank = normalizeRank(card);
    if (['10', 'A'].includes(rank)) highCount++;
    if (['2', '3', '4', '5', '6'].includes(rank)) lowCount++;
  });

  if (highCount >= 3) {
    SimState.gameHistory.patterns.highCardClusters.push({
      round: roundNum,
      cards: cards,
      count: highCount
    });
  }

  if (lowCount >= 3) {
    SimState.gameHistory.patterns.lowCardClusters.push({
      round: roundNum,
      cards: cards,
      count: lowCount
    });
  }
}

function analyzePatterns() {
  const history = SimState.gameHistory;
  const rounds = history.rounds;
  const stats = history.statistics;

  // Calculate rates
  const totalHands = stats.player1Wins + stats.player1Losses + stats.player1Pushes +
                     stats.player2Wins + stats.player2Losses + stats.player2Pushes;
  const totalDecisions = stats.totalWins + stats.totalLosses;

  // Count correlation analysis
  const avgWinCount = history.patterns.countAtWin.length > 0
    ? history.patterns.countAtWin.reduce((a, b) => a + b, 0) / history.patterns.countAtWin.length
    : 0;
  const avgLossCount = history.patterns.countAtLoss.length > 0
    ? history.patterns.countAtLoss.reduce((a, b) => a + b, 0) / history.patterns.countAtLoss.length
    : 0;
  const avgPairWinCount = history.patterns.countAtPairWin.length > 0
    ? history.patterns.countAtPairWin.reduce((a, b) => a + b, 0) / history.patterns.countAtPairWin.length
    : 0;

  // Detect win/loss streaks
  let currentStreak = { type: null, count: 0, start: 0 };
  rounds.forEach((round, idx) => {
    const combinedOutcome = (round.player1.outcome === 'WIN' || round.player2.outcome === 'WIN') ? 'WIN' :
                            (round.player1.outcome === 'LOSS' && round.player2.outcome === 'LOSS') ? 'LOSS' : 'MIXED';

    if (combinedOutcome === currentStreak.type) {
      currentStreak.count++;
    } else {
      if (currentStreak.count >= 3) {
        if (currentStreak.type === 'WIN') {
          history.patterns.winStreaks.push({ start: currentStreak.start, count: currentStreak.count });
        } else if (currentStreak.type === 'LOSS') {
          history.patterns.lossStreaks.push({ start: currentStreak.start, count: currentStreak.count });
        }
      }
      currentStreak = { type: combinedOutcome, count: 1, start: idx + 1 };
    }
  });

  // Pair bet analysis
  const pairBetWinRate = (stats.pairBets.total.wins / stats.pairBets.total.placed * 100).toFixed(2);
  const pairBetExpectedWinRate = 7.47; // Expected pair rate in 8-deck
  const pairBetROI = (stats.pairBets.total.netUnits / stats.pairBets.total.placed * 100).toFixed(2);

  history.analysis = {
    // Main game stats
    dealerBustRate: ((stats.dealerBusts / stats.totalRounds) * 100).toFixed(1) + '%',
    totalWinRate: ((stats.totalWins / totalDecisions) * 100).toFixed(1) + '%',

    // Player 1
    player1WinRate: ((stats.player1Wins / (stats.player1Wins + stats.player1Losses)) * 100).toFixed(1) + '%',
    player1BlackjackRate: ((stats.player1Blackjacks / stats.totalRounds) * 100).toFixed(1) + '%',
    player1BustRate: ((stats.player1Busts / stats.totalRounds) * 100).toFixed(1) + '%',

    // Player 2
    player2WinRate: ((stats.player2Wins / (stats.player2Wins + stats.player2Losses)) * 100).toFixed(1) + '%',
    player2BlackjackRate: ((stats.player2Blackjacks / stats.totalRounds) * 100).toFixed(1) + '%',
    player2BustRate: ((stats.player2Busts / stats.totalRounds) * 100).toFixed(1) + '%',

    // Pair betting analysis
    pairBetWinRate: pairBetWinRate + '%',
    pairBetExpectedRate: pairBetExpectedWinRate + '%',
    pairBetROI: pairBetROI + '%',
    pairBetNetUnits: stats.pairBets.total.netUnits,
    player1PairNetUnits: stats.pairBets.player1.netUnits,
    player2PairNetUnits: stats.pairBets.player2.netUnits,

    // Count analysis
    avgCountAtWin: avgWinCount.toFixed(2),
    avgCountAtLoss: avgLossCount.toFixed(2),
    avgCountAtPairWin: avgPairWinCount.toFixed(2),
    countCorrelation: avgWinCount > avgLossCount ? 'POSITIVE' : 'NEGATIVE',

    // Clusters
    highCardClusters: history.patterns.highCardClusters.length,
    lowCardClusters: history.patterns.lowCardClusters.length,
    longestWinStreak: Math.max(...history.patterns.winStreaks.map(s => s.count), 0),
    longestLossStreak: Math.max(...history.patterns.lossStreaks.map(s => s.count), 0)
  };

  // Check for anomalies
  const dealerBustRate = (stats.dealerBusts / stats.totalRounds) * 100;
  if (dealerBustRate < 20) {
    history.alerts.push({
      type: 'ANOMALY',
      message: `Low dealer bust rate: ${dealerBustRate.toFixed(1)}% (expected ~28%)`,
      severity: 'warning'
    });
  }

  // Pair bet anomaly check
  const pairWinRateNum = parseFloat(pairBetWinRate);
  if (pairWinRateNum > 12) {
    history.alerts.push({
      type: 'HOT_PAIRS',
      message: `Unusually high pair rate: ${pairBetWinRate}% (expected ~7.5%)`,
      severity: 'info'
    });
  } else if (pairWinRateNum < 4) {
    history.alerts.push({
      type: 'COLD_PAIRS',
      message: `Unusually low pair rate: ${pairBetWinRate}% (expected ~7.5%)`,
      severity: 'warning'
    });
  }

  // Generate recommendations
  history.recommendations = [];

  if (avgWinCount > avgLossCount + 0.5) {
    history.recommendations.push('Count correlation is positive - increase bets at high counts');
  }

  // Pair bet recommendation
  if (stats.pairBets.total.netUnits > 0) {
    history.recommendations.push(`Pair betting profitable this session (+${stats.pairBets.total.netUnits} units) - continue aggressive pair betting`);
  } else {
    history.recommendations.push(`Pair betting lost ${Math.abs(stats.pairBets.total.netUnits)} units - consider reducing pair bet frequency`);
  }

  // Find hot pair ranks
  const hotPairs = Object.entries(history.patterns.pairFrequency)
    .filter(([rank, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (hotPairs.length > 0) {
    history.recommendations.push(`Most frequent pair ranks: ${hotPairs.slice(0, 3).map(([r, c]) => `${r}(${c})`).join(', ')}`);
  }

  // Dealer bust analysis
  for (const card in history.patterns.dealerBustByUpcard) {
    const freq = history.patterns.dealerUpcardFrequency[card];
    if (freq >= 5) {
      const bustRate = (history.patterns.dealerBustByUpcard[card] / freq) * 100;
      if (bustRate > 40) {
        history.recommendations.push(`Dealer with ${card} upcard busts ${bustRate.toFixed(0)}% - stand more aggressively`);
      } else if (bustRate < 15) {
        history.recommendations.push(`Dealer with ${card} upcard rarely busts (${bustRate.toFixed(0)}%) - be cautious`);
      }
    }
  }

  if (history.recommendations.length === 0) {
    history.recommendations.push('No significant patterns - continue with basic strategy');
  }
}

function generateReport() {
  const history = SimState.gameHistory;
  const stats = history.statistics;
  const analysis = history.analysis;

  let report = `
╔══════════════════════════════════════════════════════════════════════════════╗
║         BJ PROBABILITY ENGINE - SIMULATION ANALYSIS REPORT                   ║
║               2-PLAYER AGGRESSIVE PAIR BETTING SIMULATION                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

SESSION INFORMATION
────────────────────────────────────────────────────────────────────────────────
Session ID:        ${history.sessionId}
Casino:            ${history.casinoName}
Table:             ${history.tableName}
Decks:             ${history.numDecks}
Players:           ${history.numPlayers}
Games Simulated:   ${stats.totalRounds}
Total Hands:       ${stats.totalRounds * 2} (2 players x ${stats.totalRounds} rounds)
Start Time:        ${history.sessionStart}
End Time:          ${history.sessionEnd}

PLAYER 1 STATISTICS
────────────────────────────────────────────────────────────────────────────────
Main Game Results:
  Wins:            ${stats.player1Wins} (${analysis.player1WinRate})
  Losses:          ${stats.player1Losses}
  Pushes:          ${stats.player1Pushes}
  Blackjacks:      ${stats.player1Blackjacks} (${analysis.player1BlackjackRate})
  Busts:           ${stats.player1Busts} (${analysis.player1BustRate})

Pair Bets:
  Placed:          ${stats.pairBets.player1.placed}
  Wins:            ${stats.pairBets.player1.wins}
  Losses:          ${stats.pairBets.player1.losses}
  Net Units:       ${stats.pairBets.player1.netUnits > 0 ? '+' : ''}${stats.pairBets.player1.netUnits}

PLAYER 2 STATISTICS
────────────────────────────────────────────────────────────────────────────────
Main Game Results:
  Wins:            ${stats.player2Wins} (${analysis.player2WinRate})
  Losses:          ${stats.player2Losses}
  Pushes:          ${stats.player2Pushes}
  Blackjacks:      ${stats.player2Blackjacks} (${analysis.player2BlackjackRate})
  Busts:           ${stats.player2Busts} (${analysis.player2BustRate})

Pair Bets:
  Placed:          ${stats.pairBets.player2.placed}
  Wins:            ${stats.pairBets.player2.wins}
  Losses:          ${stats.pairBets.player2.losses}
  Net Units:       ${stats.pairBets.player2.netUnits > 0 ? '+' : ''}${stats.pairBets.player2.netUnits}

COMBINED STATISTICS
────────────────────────────────────────────────────────────────────────────────
Total Wins:        ${stats.totalWins} (${analysis.totalWinRate})
Total Losses:      ${stats.totalLosses}
Total Pushes:      ${stats.totalPushes}
Dealer Busts:      ${stats.dealerBusts} (${analysis.dealerBustRate})

PAIR BETTING ANALYSIS (AGGRESSIVE STRATEGY)
────────────────────────────────────────────────────────────────────────────────
Total Pair Bets:   ${stats.pairBets.total.placed}
Pair Wins:         ${stats.pairBets.total.wins}
Pair Losses:       ${stats.pairBets.total.losses}
Win Rate:          ${analysis.pairBetWinRate} (expected: ${analysis.pairBetExpectedRate})
Payout:            ${PAIR_BET_PAYOUT}:1
Net Units:         ${stats.pairBets.total.netUnits > 0 ? '+' : ''}${stats.pairBets.total.netUnits}
ROI:               ${analysis.pairBetROI}%

Pair Distribution by Rank:
`;

  for (const rank of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A']) {
    const count = history.patterns.pairFrequency[rank];
    const bar = '█'.repeat(count);
    report += `  ${rank.padEnd(3)}: ${String(count).padEnd(3)} ${bar}\n`;
  }

  report += `
PATTERN ANALYSIS
────────────────────────────────────────────────────────────────────────────────
Average Count at Win:       ${analysis.avgCountAtWin}
Average Count at Loss:      ${analysis.avgCountAtLoss}
Average Count at Pair Win:  ${analysis.avgCountAtPairWin}
Count Correlation:          ${analysis.countCorrelation}

High Card Clusters:         ${analysis.highCardClusters}
Low Card Clusters:          ${analysis.lowCardClusters}

Longest Win Streak:         ${analysis.longestWinStreak} rounds
Longest Loss Streak:        ${analysis.longestLossStreak} rounds

DEALER UPCARD ANALYSIS
────────────────────────────────────────────────────────────────────────────────
Upcard    Frequency    Busts    Bust Rate
`;

  for (const card of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A']) {
    const freq = history.patterns.dealerUpcardFrequency[card];
    const busts = history.patterns.dealerBustByUpcard[card];
    const bustRate = freq > 0 ? ((busts / freq) * 100).toFixed(1) : '0.0';
    report += `${card.padEnd(10)}${String(freq).padEnd(13)}${String(busts).padEnd(9)}${bustRate}%\n`;
  }

  report += `
ALERTS & ANOMALIES
────────────────────────────────────────────────────────────────────────────────
`;
  if (history.alerts.length > 0) {
    history.alerts.forEach(alert => {
      report += `[${alert.type}] ${alert.message}\n`;
    });
  } else {
    report += 'No significant anomalies detected.\n';
  }

  report += `
STRATEGIC RECOMMENDATIONS
────────────────────────────────────────────────────────────────────────────────
`;
  history.recommendations.forEach((rec, i) => {
    report += `${i + 1}. ${rec}\n`;
  });

  report += `
ROUND-BY-ROUND SUMMARY (Last 20 Rounds)
────────────────────────────────────────────────────────────────────────────────
Round  P1 Cards      P1 Out  P1 Pair   P2 Cards      P2 Out  P2 Pair   Dealer
`;

  history.rounds.slice(-20).forEach(round => {
    const p1Cards = round.player1.cards.join(',').slice(0, 10).padEnd(10);
    const p2Cards = round.player2.cards.join(',').slice(0, 10).padEnd(10);
    const dCards = round.dealer.cards.join(',').slice(0, 8);
    const p1Pair = round.player1.pairBet.hasPair ? 'YES' : '-';
    const p2Pair = round.player2.pairBet.hasPair ? 'YES' : '-';
    report += `${String(round.roundNumber).padEnd(7)}${p1Cards}  ${round.player1.outcome.padEnd(6)}  ${p1Pair.padEnd(8)}  ${p2Cards}  ${round.player2.outcome.padEnd(6)}  ${p2Pair.padEnd(8)}  ${dCards}\n`;
  });

  report += `
════════════════════════════════════════════════════════════════════════════════
Generated by BJ Probability Engine - Disruptor Simulation
2-Player Aggressive Pair Betting Analysis
Tech Hive Corporation
Report Time: ${new Date().toISOString()}
════════════════════════════════════════════════════════════════════════════════
`;

  return report;
}

// Run simulation
console.log('Starting 100-game simulation with 2 Players and Aggressive Pair Betting...\n');

for (let i = 1; i <= 100; i++) {
  // Reshuffle at 75% penetration
  if (SimState.cardsDealt / SimState.totalCards > 0.75) {
    resetShoe();
  }

  simulateOneRound(i);
}

SimState.gameHistory.sessionEnd = new Date().toISOString();
analyzePatterns();

const report = generateReport();
console.log(report);

// Save to files
const fs = require('fs');
const path = require('path');

const outputDir = __dirname;
const reportFile = path.join(outputDir, 'simulation-report-2player-pairs.txt');
const jsonFile = path.join(outputDir, 'simulation-history-2player-pairs.json');

fs.writeFileSync(reportFile, report);
fs.writeFileSync(jsonFile, JSON.stringify(SimState.gameHistory, null, 2));

console.log(`\nFiles saved:`);
console.log(`- Report: ${reportFile}`);
console.log(`- JSON Data: ${jsonFile}`);
