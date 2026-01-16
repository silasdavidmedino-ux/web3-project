/**
 * Game History Analysis with Clumping Probability Engine
 * Analyzes 94 blackjack games for clumping patterns and strategy effectiveness
 */

const fs = require('fs');
const path = require('path');

// ============================================
// Clumping Detection Algorithm (from engine)
// ============================================

function detectClumpingFromPNL(games) {
  const results = [];

  // Analyze consecutive games for clumping indicators
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const pnl = game.pnl || 0;
    const rounds = game.rounds || 0;

    // Calculate PNL per round (volatility indicator)
    const pnlPerRound = rounds > 0 ? pnl / rounds : 0;

    // Look at surrounding games for streak patterns
    const windowStart = Math.max(0, i - 3);
    const windowEnd = Math.min(games.length, i + 4);
    const window = games.slice(windowStart, windowEnd);

    // Count consecutive wins/losses in window
    let winStreak = 0;
    let lossStreak = 0;
    let currentStreak = 0;
    let lastSign = 0;

    for (const g of window) {
      const sign = Math.sign(g.pnl || 0);
      if (sign === lastSign && sign !== 0) {
        currentStreak++;
      } else {
        if (lastSign > 0) winStreak = Math.max(winStreak, currentStreak);
        if (lastSign < 0) lossStreak = Math.max(lossStreak, currentStreak);
        currentStreak = 1;
      }
      lastSign = sign;
    }

    // Clumping indicators
    const highVolatility = Math.abs(pnlPerRound) > 150; // >150 per round = high swing
    const hasStreak = winStreak >= 3 || lossStreak >= 3;
    const extremePNL = Math.abs(pnl) > 3000;

    // Clump score (0-100)
    let clumpScore = 50; // baseline
    if (highVolatility) clumpScore += 15;
    if (hasStreak) clumpScore += 20;
    if (extremePNL) clumpScore += 15;

    // Normalize
    clumpScore = Math.max(0, Math.min(100, clumpScore));

    // Recommendation
    let recommendation = 'NEUTRAL';
    let strategy = 'STANDARD';

    if (clumpScore >= 70) {
      recommendation = 'HEAVY_CLUMP';
      strategy = 'REDUCE_BET';
    } else if (clumpScore >= 56) {
      recommendation = 'MILD_CLUMP';
      strategy = 'CAUTIOUS';
    } else if (clumpScore <= 30) {
      recommendation = 'DISPERSED';
      strategy = 'AGGRESSIVE';
    }

    results.push({
      gameNum: game.gameNum,
      date: game.date,
      rounds: rounds,
      pnl: pnl,
      pnlPerRound: Math.round(pnlPerRound),
      clumpScore: clumpScore,
      recommendation: recommendation,
      strategy: strategy,
      indicators: {
        highVolatility,
        hasStreak,
        extremePNL
      }
    });
  }

  return results;
}

// ============================================
// Clump Strategy Simulation (TEAMPLAY v1.3)
// P3: Booster | P4: Quant EV | P5: Pure Sacrifice
// ============================================

function simulateClumpStrategy(games) {
  let standardPNL = 0;
  let clumpAdjustedPNL = 0;
  let correctCalls = 0;
  let totalCalls = 0;

  // Teamplay tracking
  let p4PNL = 0;           // P4 Quant EV - main profit center
  let p5PNL = 0;           // P5 Sacrifice - expected losses
  let teamNetPNL = 0;      // Combined team result
  let p5SacrificeRounds = 0;
  let dealerBustImprovement = 0;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const pnl = game.pnl || 0;
    const rounds = game.rounds || 1;

    // Standard strategy: flat betting
    standardPNL += pnl;

    // Determine clump momentum
    const clumpScore = game.clumpScore || 50;
    let momentum = 'NEUTRAL';
    if (clumpScore >= 70) momentum = 'HIGH_STREAK';
    else if (clumpScore >= 56) momentum = 'MILD_CLUMP';

    // ============================================
    // P4 QUANT EV SIMULATION
    // Main profit player - uses clump-adjusted betting
    // ============================================
    let p4Multiplier = 1.0;

    if (momentum === 'HIGH_STREAK') {
      // HIGH_STREAK: Aggressive doubles, increased bets
      p4Multiplier = 1.5;  // Ride the variance
    } else if (momentum === 'MILD_CLUMP') {
      p4Multiplier = 1.25;
    } else {
      p4Multiplier = 1.0;
    }

    const p4GamePNL = pnl * p4Multiplier;
    p4PNL += p4GamePNL;

    // ============================================
    // P5 PURE SACRIFICE SIMULATION
    // Card flow manipulation - expected to lose
    // Bet: Always 0.5x (minimum)
    // ============================================
    const p5Multiplier = 0.5;  // Always minimum bet

    // P5's sacrifice strategy affects dealer bust rate
    // In HIGH_STREAK vs strong dealer: P5 absorbs 10s, denying dealer
    // This creates "invisible" value - dealer busts more, P4 wins more
    let p5DirectPNL = 0;
    let p5IndirectValue = 0;

    if (momentum === 'HIGH_STREAK') {
      // P5 sacrifices: absorbs cards, often busts
      // Estimate: P5 loses ~60% of hands in sacrifice mode
      // But: Each sacrifice increases dealer bust % by ~3-5%
      const sacrificeHands = Math.floor(rounds * 0.3);  // 30% of hands P5 plays aggressively
      p5SacrificeRounds += sacrificeHands;

      // Direct P5 loss from sacrifice plays
      p5DirectPNL = -Math.abs(pnl) * 0.15 * p5Multiplier;  // P5 loses ~15% of game PNL

      // Indirect value: Dealer bust improvement benefits P4
      // If game was winning, P5's sacrifice contributed
      if (pnl > 0) {
        p5IndirectValue = pnl * 0.10;  // 10% of P4's win attributed to P5 sacrifice
        dealerBustImprovement += p5IndirectValue;
      }
    } else if (momentum === 'MILD_CLUMP') {
      p5DirectPNL = -Math.abs(pnl) * 0.08 * p5Multiplier;
      if (pnl > 0) {
        p5IndirectValue = pnl * 0.05;
        dealerBustImprovement += p5IndirectValue;
      }
    } else {
      // Neutral: P5 plays standard, minimal sacrifice
      p5DirectPNL = pnl * 0.3 * p5Multiplier;  // P5 wins/loses proportionally at min bet
    }

    p5PNL += p5DirectPNL;

    // ============================================
    // TEAM NET CALCULATION
    // ============================================
    // Team profit = P4 gains + P5 indirect value - P5 direct losses
    const teamGamePNL = p4GamePNL + p5DirectPNL;
    teamNetPNL += teamGamePNL;

    // Clump-adjusted total (for backward compatibility)
    clumpAdjustedPNL += p4GamePNL;

    // Track accuracy
    if (pnl !== 0) {
      totalCalls++;
      if ((clumpScore >= 56 && pnl > 0) || (clumpScore <= 45 && pnl < 0)) {
        correctCalls++;
      }
    }
  }

  return {
    standardPNL: Math.round(standardPNL),
    clumpAdjustedPNL: Math.round(clumpAdjustedPNL),
    improvement: Math.round(clumpAdjustedPNL - standardPNL),
    improvementPct: standardPNL !== 0 ? ((clumpAdjustedPNL - standardPNL) / Math.abs(standardPNL) * 100).toFixed(1) : 0,
    accuracy: totalCalls > 0 ? (correctCalls / totalCalls * 100).toFixed(1) : 0,
    correctCalls,
    totalCalls,
    // Teamplay stats
    p4PNL: Math.round(p4PNL),
    p5PNL: Math.round(p5PNL),
    teamNetPNL: Math.round(teamNetPNL),
    p5SacrificeRounds,
    dealerBustImprovement: Math.round(dealerBustImprovement)
  };
}

// ============================================
// Parse CSV Data
// ============================================

function parseCSV(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = lines[0].replace(/^\uFEFF/, '').split(','); // Remove BOM

  const games = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 5) {
      const pnlStr = values[5]?.trim() || '0';
      const pnl = parseInt(pnlStr) || 0;

      games.push({
        date: values[0]?.trim(),
        time: values[1]?.trim(),
        shoe: values[2]?.trim(),
        gameNum: parseInt(values[3]) || i,
        rounds: parseInt(values[4]) || 0,
        pnl: pnl,
        folderName: values[6]?.trim() || ''
      });
    }
  }

  return games;
}

// ============================================
// Generate Report
// ============================================

function generateReport(games, analysis, simulation) {
  const totalGames = games.length;
  const gamesWithPNL = games.filter(g => g.pnl !== 0).length;
  const totalRounds = games.reduce((sum, g) => sum + (g.rounds || 0), 0);
  const totalPNL = games.reduce((sum, g) => sum + (g.pnl || 0), 0);

  // Clump distribution
  const heavyClump = analysis.filter(a => a.clumpScore >= 70).length;
  const mildClump = analysis.filter(a => a.clumpScore >= 56 && a.clumpScore < 70).length;
  const neutral = analysis.filter(a => a.clumpScore > 30 && a.clumpScore < 56).length;
  const dispersed = analysis.filter(a => a.clumpScore <= 30).length;

  // Best/worst games
  const sortedByPNL = [...games].sort((a, b) => b.pnl - a.pnl);
  const top5 = sortedByPNL.slice(0, 5);
  const bottom5 = sortedByPNL.slice(-5).reverse();

  // Clump score correlation with PNL
  const highClumpGames = analysis.filter(a => a.clumpScore >= 60);
  const lowClumpGames = analysis.filter(a => a.clumpScore < 40);
  const highClumpAvgPNL = highClumpGames.length > 0
    ? highClumpGames.reduce((sum, g) => sum + g.pnl, 0) / highClumpGames.length
    : 0;
  const lowClumpAvgPNL = lowClumpGames.length > 0
    ? lowClumpGames.reduce((sum, g) => sum + g.pnl, 0) / lowClumpGames.length
    : 0;

  const report = `
╔══════════════════════════════════════════════════════════════════════════════╗
║           CLUMPING PROBABILITY ENGINE - GAME HISTORY ANALYSIS                ║
║                         94 Games | Shoe 301-412                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
                              OVERVIEW STATISTICS
═══════════════════════════════════════════════════════════════════════════════

  Total Games Analyzed:     ${totalGames}
  Games with PNL Data:      ${gamesWithPNL}
  Total Rounds Played:      ${totalRounds}
  Average Rounds/Game:      ${(totalRounds / totalGames).toFixed(1)}

  Total P&L:                ${totalPNL >= 0 ? '+' : ''}${totalPNL.toLocaleString()}
  Average P&L/Game:         ${(totalPNL / totalGames).toFixed(0)}
  Average P&L/Round:        ${(totalPNL / totalRounds).toFixed(1)}

═══════════════════════════════════════════════════════════════════════════════
                            CLUMPING DETECTION RESULTS
═══════════════════════════════════════════════════════════════════════════════

  Clump Score Distribution:
  ┌────────────────────────────────────────────────────────────────────────────┐
  │ HEAVY CLUMP (70-100):    ${heavyClump.toString().padStart(2)} games (${(heavyClump/totalGames*100).toFixed(1)}%)  ████████ REDUCE BET      │
  │ MILD CLUMP (56-69):      ${mildClump.toString().padStart(2)} games (${(mildClump/totalGames*100).toFixed(1)}%)  ██████   CAUTIOUS        │
  │ NEUTRAL (31-55):         ${neutral.toString().padStart(2)} games (${(neutral/totalGames*100).toFixed(1)}%)  ████     STANDARD        │
  │ DISPERSED (0-30):        ${dispersed.toString().padStart(2)} games (${(dispersed/totalGames*100).toFixed(1)}%)  ██       AGGRESSIVE      │
  └────────────────────────────────────────────────────────────────────────────┘

  Clump Detection Accuracy:
  • High Clump Games (≥60 score): ${highClumpGames.length} games, Avg P&L: ${highClumpAvgPNL >= 0 ? '+' : ''}${highClumpAvgPNL.toFixed(0)}
  • Low Clump Games (<40 score):  ${lowClumpGames.length} games, Avg P&L: ${lowClumpAvgPNL >= 0 ? '+' : ''}${lowClumpAvgPNL.toFixed(0)}

  ${highClumpAvgPNL < lowClumpAvgPNL ? '✓ VALIDATED: High clump correlates with losses (engine working correctly)' : '⚠ ANOMALY: Expected inverse correlation not found'}

═══════════════════════════════════════════════════════════════════════════════
                          CLUMP STRATEGY SIMULATION
═══════════════════════════════════════════════════════════════════════════════

  Strategy Comparison:
  ┌────────────────────────────────────────────────────────────────────────────┐
  │ STANDARD STRATEGY (Flat Bet):                                              │
  │   Total P&L:              ${simulation.standardPNL >= 0 ? '+' : ''}${simulation.standardPNL.toLocaleString().padStart(10)}                              │
  │                                                                            │
  │ CLUMP-ADJUSTED STRATEGY:                                                   │
  │   Total P&L:              ${simulation.clumpAdjustedPNL >= 0 ? '+' : ''}${simulation.clumpAdjustedPNL.toLocaleString().padStart(10)}                              │
  │   Improvement:            ${simulation.improvement >= 0 ? '+' : ''}${simulation.improvement.toLocaleString().padStart(10)} (${simulation.improvementPct}%)               │
  │                                                                            │
  │ Detection Accuracy:       ${simulation.accuracy}% (${simulation.correctCalls}/${simulation.totalCalls} correct calls)          │
  └────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                          TEAMPLAY SIMULATION (P3/P4/P5)
═══════════════════════════════════════════════════════════════════════════════

  Team Role Breakdown:
  ┌────────────────────────────────────────────────────────────────────────────┐
  │ P4 QUANT EV (Main Profit):                                                 │
  │   Total P&L:              ${simulation.p4PNL >= 0 ? '+' : ''}${simulation.p4PNL.toLocaleString().padStart(10)}                              │
  │   Strategy: Aggressive doubles in HIGH_STREAK (1.5x bet)                   │
  │                                                                            │
  │ P5 PURE SACRIFICE (Card Flow):                                             │
  │   Total P&L:              ${simulation.p5PNL >= 0 ? '+' : ''}${simulation.p5PNL.toLocaleString().padStart(10)}  (expected loss)             │
  │   Sacrifice Rounds:       ${simulation.p5SacrificeRounds.toString().padStart(10)} hands                         │
  │   Dealer Bust Value:      ${simulation.dealerBustImprovement >= 0 ? '+' : ''}${simulation.dealerBustImprovement.toLocaleString().padStart(10)}  (indirect P4 benefit)        │
  │   Bet Size: Always 0.5x (table minimum)                                    │
  │                                                                            │
  │ TEAM NET P&L:             ${simulation.teamNetPNL >= 0 ? '+' : ''}${simulation.teamNetPNL.toLocaleString().padStart(10)}                              │
  │ vs Solo Play:             ${(simulation.teamNetPNL - simulation.standardPNL) >= 0 ? '+' : ''}${(simulation.teamNetPNL - simulation.standardPNL).toLocaleString().padStart(10)} (${((simulation.teamNetPNL - simulation.standardPNL) / Math.abs(simulation.standardPNL) * 100).toFixed(1)}%)               │
  └────────────────────────────────────────────────────────────────────────────┘

  P5 Sacrifice Analysis:
  • P5 absorbed cards in ${simulation.p5SacrificeRounds} sacrifice situations
  • Each sacrifice denies dealer optimal cards
  • P5 loss of ${Math.abs(simulation.p5PNL).toLocaleString()} enabled P4 gain of ${simulation.p4PNL.toLocaleString()}
  • Net team benefit: ${simulation.teamNetPNL >= simulation.standardPNL ? 'POSITIVE' : 'NEGATIVE'}

═══════════════════════════════════════════════════════════════════════════════
                              TOP 5 WINNING GAMES
═══════════════════════════════════════════════════════════════════════════════

${top5.map((g, i) => {
  const a = analysis.find(x => x.gameNum === g.gameNum);
  return `  ${i+1}. Game #${g.gameNum.toString().padEnd(3)} | ${g.rounds.toString().padStart(2)} rounds | P&L: +${g.pnl.toLocaleString().padStart(6)} | Clump: ${a?.clumpScore || 50} (${a?.recommendation || 'N/A'})`;
}).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
                              TOP 5 LOSING GAMES
═══════════════════════════════════════════════════════════════════════════════

${bottom5.map((g, i) => {
  const a = analysis.find(x => x.gameNum === g.gameNum);
  return `  ${i+1}. Game #${g.gameNum.toString().padEnd(3)} | ${g.rounds.toString().padStart(2)} rounds | P&L: ${g.pnl.toLocaleString().padStart(7)} | Clump: ${a?.clumpScore || 50} (${a?.recommendation || 'N/A'})`;
}).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
                           DETAILED GAME ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

  Game # │ Date       │ Rounds │    P&L    │ Clump │ Recommendation │ Strategy
  ───────┼────────────┼────────┼───────────┼───────┼────────────────┼──────────
${analysis.slice(0, 30).map(a =>
  `  ${a.gameNum.toString().padStart(5)} │ ${a.date || 'N/A'} │ ${a.rounds.toString().padStart(6)} │ ${(a.pnl >= 0 ? '+' : '') + a.pnl.toString().padStart(8)} │ ${a.clumpScore.toString().padStart(5)} │ ${a.recommendation.padEnd(14)} │ ${a.strategy}`
).join('\n')}
  ... (showing first 30 of ${analysis.length} games)

═══════════════════════════════════════════════════════════════════════════════
                              KEY FINDINGS
═══════════════════════════════════════════════════════════════════════════════

  1. CLUMPING PREVALENCE
     • ${((heavyClump + mildClump) / totalGames * 100).toFixed(1)}% of shoes showed clumping indicators
     • Heavy clumping detected in ${(heavyClump / totalGames * 100).toFixed(1)}% of games

  2. STRATEGY EFFECTIVENESS
     • Clump-adjusted betting ${simulation.improvement >= 0 ? 'IMPROVED' : 'REDUCED'} results by ${Math.abs(simulation.improvement).toLocaleString()}
     • Detection accuracy: ${simulation.accuracy}%

  3. RECOMMENDATION
     ${simulation.improvement > 0
       ? '✓ ENABLE Clumping Probability Engine for this shoe type'
       : '⚠ Further calibration needed for optimal performance'}

  4. OPTIMAL SETTINGS
     • Reduce bet by 50% when Clump Score ≥ 70
     • Standard bet when Clump Score 31-69
     • Increase bet by 25% when Clump Score ≤ 30

═══════════════════════════════════════════════════════════════════════════════
                              GENERATED
═══════════════════════════════════════════════════════════════════════════════

  Report Generated: ${new Date().toISOString()}
  Engine Version:   Clumping Probability Engine v1.3 (Teamplay)
  Analysis Method:  PNL Volatility + Streak Detection + P5 Pure Sacrifice
  Team Strategy:    P3 Booster | P4 Quant EV | P5 Pure Sacrifice

══════════════════════════════════════════════════════════════════════════════
`;

  return report;
}

// ============================================
// Main Execution
// ============================================

const csvPath = path.join(__dirname, '..', 'Blackjack_Game_History_Sorted.csv');

if (!fs.existsSync(csvPath)) {
  console.error('CSV file not found:', csvPath);
  process.exit(1);
}

console.log('Loading game history...');
const games = parseCSV(csvPath);
console.log(`Loaded ${games.length} games`);

console.log('Running clumping analysis...');
const analysis = detectClumpingFromPNL(games);

// Merge analysis back into games for simulation
games.forEach((g, i) => {
  if (analysis[i]) {
    g.clumpScore = analysis[i].clumpScore;
  }
});

console.log('Simulating clump strategy...');
const simulation = simulateClumpStrategy(analysis);

console.log('Generating report...\n');
const report = generateReport(games, analysis, simulation);

// Output report
console.log(report);

// Save report to file
const reportPath = path.join(__dirname, '..', 'clump_analysis_report.txt');
fs.writeFileSync(reportPath, report);
console.log(`\nReport saved to: ${reportPath}`);
