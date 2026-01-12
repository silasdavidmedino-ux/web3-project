/**
 * BJ Probability Engine - Main Application v3.9.40
 * Tech Hive Corporation
 * Casino Dashboard Interface
 *
 * QUANT TEAMPLAY SACRIFICE v1.4 FULL
 * P1-P3: Basic Strategy | P4: Quant EV+MG | P5: Sacrifice v1.4
 * RULES: ENHC + S17 (Dealer Stands on Soft 17)
 */
console.log('=== APP VERSION 3.9.36 === S17 Rule: Dealer Stands on Soft 17 ===');

// ============================================
// Application State
// ============================================
const AppState = {
  numDecks: 8,
  totalCards: 416,
  cardsDealt: 0,
  runningCount: 0,
  activePosition: 'player1',
  pairsWon: 0,

  // Card counts per rank
  rankCounts: {
    '2': 32, '3': 32, '4': 32, '5': 32, '6': 32,
    '7': 32, '8': 32, '9': 32, '10': 128, 'A': 32
  },

  // Initial counts for reset (8 decks default)
  initialCounts: {
    '2': 32, '3': 32, '4': 32, '5': 32, '6': 32,
    '7': 32, '8': 32, '9': 32, '10': 128, 'A': 32
  },

  // Cards seen per rank
  rankSeen: {
    '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
    '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0
  },

  // Top ranked cards by remaining count (for post-deal override logic)
  topRankedCards: ['10', '2', '3', '4', '5'],

  // Position cards
  positions: {
    dealer: [],
    player1: [],
    player2: [],
    player3: [],
    player4: [],
    player5: [],
    player6: [],
    player7: [],
    player8: []
  },

  // Deal history for undo
  dealHistory: [],

  // Dealer cards history (per round)
  dealerHistory: [],
  currentRoundNum: 0,

  // Player decisions (post-deal: STAY, HIT, SPLIT, DBL)
  playerDecisions: {
    1: null, 2: null, 3: null, 4: null,
    5: null, 6: null, 7: null, 8: null
  },

  // Split hands tracking { playerNum: { hand1: [], hand2: [], active: true, activeHand: 1 } }
  splitHands: {},

  // Currently active split (playerNum or null)
  activeSplitPlayer: null,

  // Configuration
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
  },

  // Casino Configurations
  casinoConfigs: [
    {
      id: 'default',
      name: 'Default',
      isDefault: true,
      rules: {
        decks: 8,
        dealerHitsS17: false,
        doubleAfterSplit: false,
        surrender: false,
        illustrious18: true,
        fab4: true,
        splitAnyTens: false,
        multiSplit: false,
        maxPooledBet: 50000,
        enabledStrategies: 'none'
      }
    },
    {
      id: 'casinoplus',
      name: 'CasinoPlus',
      isDefault: false,
      rules: {
        decks: 8,
        dealerHitsS17: false,
        doubleAfterSplit: false,
        surrender: false,
        illustrious18: true,
        fab4: true,
        splitAnyTens: false,
        multiSplit: false,
        maxPooledBet: 50000,
        enabledStrategies: 'quant_ev'
      }
    }
  ],
  activeConfigId: 'default',
  editingConfigId: null,

  // Rooms
  rooms: [
    { id: 1, name: 'Table 1', players: 0, maxPlayers: 10, isActive: false, configId: 'casinoplus' },
    { id: 2, name: 'Table 2', players: 0, maxPlayers: 10, isActive: true, configId: 'casinoplus' },
    { id: 3, name: 'Table 3', players: 0, maxPlayers: 10, isActive: false, configId: 'casinoplus' },
    { id: 5, name: 'Table 5', players: 0, maxPlayers: 10, isActive: false, configId: 'casinoplus' },
    { id: 6, name: 'Table 6', players: 0, maxPlayers: 10, isActive: false, configId: 'casinoplus' },
    { id: 7, name: 'Table 7', players: 0, maxPlayers: 10, isActive: true, configId: 'casinoplus' }
  ],
  currentRoomId: null,
  playerName: 'Player',

  // Comprehensive Game History
  gameHistory: {
    sessionId: null,
    sessionStart: null,
    sessionEnd: null,
    casinoName: '',
    tableName: '',
    numDecks: 8,
    rounds: [],
    statistics: {
      totalRounds: 0,
      playerWins: 0,
      playerLosses: 0,
      pushes: 0,
      blackjacks: 0,
      playerBusts: 0,
      dealerBusts: 0,
      splits: 0,
      doubles: 0,
      surrenders: 0,
      totalBetAmount: 0,
      totalWinAmount: 0,
      netProfit: 0
    },
    patterns: {
      dealerUpcardFrequency: { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0 },
      dealerBustByUpcard: { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0 },
      hotStreaks: [],
      coldStreaks: [],
      countAtWin: [],
      countAtLoss: [],
      cardSequences: [],
      highCardClusters: [],
      lowCardClusters: []
    },
    alerts: []
  },

  // ============================================
  // NEW FEATURES STATE
  // ============================================

  // Session Bankroll Tracker
  sessionTracker: {
    startingBankroll: 1000,
    currentBankroll: 1000,
    sessionStart: null,
    handsPlayed: 0,
    peakBankroll: 1000,
    lowestBankroll: 1000,
    biggestWin: 0,
    biggestLoss: 0,
    currentStreak: 0,
    longestWinStreak: 0,
    longestLoseStreak: 0,
    goals: {
      profitTarget: 200,
      lossLimit: 300,
      timeLimit: 120, // minutes
      handsLimit: 200
    }
  },

  // Training Mode
  trainingMode: {
    enabled: false,
    totalQuestions: 0,
    correctAnswers: 0,
    streakCorrect: 0,
    bestStreak: 0,
    mistakes: [],
    focusAreas: [], // e.g., ['soft17', 'pairs', 'surrender']
    difficulty: 'normal', // 'easy', 'normal', 'hard'
    showHints: true
  },

  // Multi-Count Systems
  countSystems: {
    active: 'hilo', // Current active system
    counts: {
      hilo: 0,
      omega2: 0,
      hiopt2: 0,
      zen: 0,
      wong: 0
    },
    // Count values per rank for each system
    systems: {
      hilo:   { '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 0, '8': 0, '9': 0, '10': -1, 'A': -1 },
      omega2: { '2': 1, '3': 1, '4': 2, '5': 2, '6': 2, '7': 1, '8': 0, '9': -1, '10': -2, 'A': 0 },
      hiopt2: { '2': 1, '3': 1, '4': 2, '5': 2, '6': 1, '7': 1, '8': 0, '9': 0, '10': -2, 'A': 0 },
      zen:    { '2': 1, '3': 1, '4': 2, '5': 2, '6': 2, '7': 1, '8': 0, '9': 0, '10': -2, 'A': -1 },
      wong:   { '2': 0.5, '3': 1, '4': 1, '5': 1.5, '6': 1, '7': 0.5, '8': 0, '9': -0.5, '10': -1, 'A': -1 }
    }
  },

  // Audio Settings
  audioSettings: {
    enabled: true,
    volume: 0.5,
    alerts: {
      positiveTc: true,
      deviation: true,
      betIncrease: true,
      wonging: true,
      shuffle: true
    }
  },

  // Theme
  theme: 'dark', // 'dark' or 'light'

  // ============================================
  // QUANT EV GAME HISTORY TRACKER (5 Players)
  // ============================================
  quantEvTracker: {
    enabled: true,
    sessionId: null,
    roundNumber: 0,
    players: {
      1: { bankroll: 100000, hands: [], wins: 0, losses: 0, pushes: 0, bjs: 0, correctDecisions: 0, totalDecisions: 0 },
      2: { bankroll: 100000, hands: [], wins: 0, losses: 0, pushes: 0, bjs: 0, correctDecisions: 0, totalDecisions: 0 },
      3: { bankroll: 100000, hands: [], wins: 0, losses: 0, pushes: 0, bjs: 0, correctDecisions: 0, totalDecisions: 0 },
      4: { bankroll: 100000, hands: [], wins: 0, losses: 0, pushes: 0, bjs: 0, correctDecisions: 0, totalDecisions: 0 },
      5: { bankroll: 100000, hands: [], wins: 0, losses: 0, pushes: 0, bjs: 0, correctDecisions: 0, totalDecisions: 0 },
      6: { bankroll: 100000, hands: [], wins: 0, losses: 0, pushes: 0, bjs: 0, correctDecisions: 0, totalDecisions: 0 },
      7: { bankroll: 100000, hands: [], wins: 0, losses: 0, pushes: 0, bjs: 0, correctDecisions: 0, totalDecisions: 0 }
    },
    currentRound: {
      tc: 0,
      rc: 0,
      dealerUp: null,
      dealerFinal: null,
      playerHands: {}
    },
    history: []
  },

  // Dealer Bust History Tracker - "Teamplay Always Wins"
  dealerBustHistory: {
    enabled: true,
    totalRounds: 0,
    totalBusts: 0,
    bustRate: 0,
    busts: [],  // Array of bust events
    bustsByUpcard: {
      2: { total: 0, busts: 0 },
      3: { total: 0, busts: 0 },
      4: { total: 0, busts: 0 },
      5: { total: 0, busts: 0 },
      6: { total: 0, busts: 0 },
      7: { total: 0, busts: 0 },
      8: { total: 0, busts: 0 },
      9: { total: 0, busts: 0 },
      10: { total: 0, busts: 0 },
      11: { total: 0, busts: 0 }  // Ace
    },
    sacrificeCorrelation: {
      p5Busted: { rounds: 0, dealerBusted: 0 },
      p5Absorbed: { rounds: 0, dealerBusted: 0 },
      p5Stood: { rounds: 0, dealerBusted: 0 }
    }
  },

  // ============================================
  // QUANT TEAMPLAY SACRIFICE v1.4 FULL CONFIGURATION
  // ============================================
  quantEvSettings: {
    enabled: true,
    version: '1.4_FULL',
    betMethod: 'martingale',
    baseUnit: 5000,
    maxBetUnits: 3,
    tcThreshold: 1,

    // TEAMPLAY ALWAYS WINS Configuration v1.6
    // P1-P2: Basic Strategy (foundation players)
    // P3: P4 BOOSTER v1.0 (optimizes card flow for P4)
    // P4: Quant EV + Martingale + TC Deviations (winning player)
    // P5: Sacrifice v1.4 (late sacrifice - absorbs last)
    quantEvPlayerIndex: 4,
    sacrificePlayerIndex: 5,
    boosterPlayerIndex: 3,  // P3 is the P4 Booster
    sacrificePlayers: [5],  // Only P5 is sacrifice now
    quantEvTcThreshold: 0.9,
    quantEvStrategy: 'quantEv',
    boosterStrategy: 'p4_booster_v1.0',
    sacrificeStrategy: 'sacrifice_v1.4',
    basicPlayersStrategy: 'basicOnly',

    // Martingale Configuration
    martingaleCurrentBet: 5000,
    martingaleLossStreak: 0,
    martingaleMaxBet: 15000,

    // ENHC Rules (European No Hole Card)
    enhcEnabled: true,
    dealerDrawsAfterPlayers: true,
    dealerStandsOnSoft17: true,  // S17 Rule: Dealer STANDS on Soft 17 (player favorable)

    // Shuffle Configuration
    penetrationThreshold: 75,
    tcResetsOnShuffle: true,

    // Surrender Settings
    surrenderEnabled: true,
    postDealOverrideEnabled: true,

    // Quant EV Dynamic Entry/Exit
    quantEvSittingOut: false,
    quantEvReentryThreshold: 0.9,

    // Sacrifice v1.4 Parameters
    sacrificeAggressionBase: 50,
    sacrificeMaxAbsorption: 4,
    sacrificeTeamSaturation: 10,
    sacrificeTcScaling: true,

    // ============================================
    // UNIFIED P3/P5 SACRIFICE POLICIES v1.0
    // ============================================
    // Coordinated shield system around P4
    // P3 (Front Shield): Removes harmful cards BEFORE P4
    // P5 (Rear Shield): Absorbs dealer cards AFTER P4
    unifiedSacrificeEnabled: true,
    unifiedPolicyVersion: '1.0',

    // Round state tracking (reset each round)
    unifiedState: {
      p3CardsAbsorbed: 0,
      p3Action: null,
      p3Aggression: 50,
      p3StoodOnStiff: false,
      p5CardsAbsorbed: 0,
      p5Action: null,
      p5Aggression: 50,
      roundTc: 0,
      dealerUpcard: null,
      coordinationMode: 'BALANCED'  // AGGRESSIVE, BALANCED, PRESERVE
    }
  },

  // Ace Sequencing
  aceTracker: {
    enabled: false,
    acePositions: [], // Positions in shoe where aces appeared
    keyCards: [], // Cards that appeared before aces
    predictions: []
  },

  // Shoe Replay
  shoeReplay: {
    recording: false,
    currentShoe: [],
    savedShoes: [],
    playbackIndex: 0
  },

  // Heat Index
  heatIndex: {
    level: 0, // 0-100
    factors: {
      bigBets: 0,
      winStreak: 0,
      betVariation: 0,
      playTime: 0
    },
    lastBets: []
  },

  // Wonging
  wonging: {
    enabled: true,
    entryTc: 1,
    exitTc: -1,
    currentlyIn: true,
    handsWonged: 0
  },

  // ============================================
  // GAME & BETTING HISTORY TRACKER (Exportable)
  // ============================================
  bettingHistory: {
    enabled: true,
    currentGameNumber: 0,
    games: [],  // Array of completed games
    currentGame: null,  // Active game being played
    // Default starting capital for each player
    defaultStartingCapital: 100000,
    // Player accumulated capitals (carries over between games)
    playerCapitals: {
      1: 100000,
      2: 100000,
      3: 100000,
      4: 100000,
      5: 100000
    }
  }
};

// ============================================
// Initialize Application
// ============================================
function init() {
  // Store initial counts for reset
  AppState.initialCounts = JSON.parse(JSON.stringify(AppState.rankCounts));

  // Load casino configs from storage
  loadCasinoConfigsFromStorage();

  // Load rooms from storage
  loadRoomsFromStorage();

  // Setup event listeners
  setupEventListeners();

  // Initialize player visibility based on config
  setNumPlayers(AppState.config.playersSeated);

  // Initialize game history session
  initGameSession('Casino', 'Table 1');

  // Initial calculations
  updateAll();
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
  // Card buttons
  document.querySelectorAll('.card-btn').forEach(btn => {
    btn.addEventListener('click', () => handleCardClick(btn.dataset.card));
  });

  // Undo button
  document.getElementById('btnUndo')?.addEventListener('click', handleUndo);

  // Reset round button
  document.getElementById('btnResetRound')?.addEventListener('click', handleResetRound);

  // End game button
  document.getElementById('btnEndGame')?.addEventListener('click', handleEndGame);

  // Player position clicks
  document.querySelectorAll('.player-box').forEach(box => {
    box.addEventListener('click', () => setActivePosition(box.id));
  });

  // Dealer box click
  document.getElementById('dealerBox')?.addEventListener('click', () => setActivePosition('dealer'));

  // Number of decks change
  document.getElementById('numDecks')?.addEventListener('change', (e) => {
    setNumDecks(parseInt(e.target.value));
  });

  // Number of players change
  document.getElementById('numPlayers')?.addEventListener('change', (e) => {
    setNumPlayers(parseInt(e.target.value));
  });

  // Game control settings
  document.getElementById('btnApplySettings')?.addEventListener('click', applyGameSettings);

  // History modal close - multiple ways to close
  const historyModal = document.getElementById('historyModal');
  if (historyModal) {
    // Close on overlay click
    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) {
        hideHistoryPanel();
      }
    });
    // Close button inside modal
    const closeBtn = historyModal.querySelector('.btn-close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideHistoryPanel();
      });
    }
  }

  // Nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => handleNavTab(tab.dataset.tab));
  });

  // Config panel
  document.getElementById('btnApplyConfig')?.addEventListener('click', applyConfig);
  document.getElementById('btnResetConfig')?.addEventListener('click', resetConfig);

  // Clear cache
  document.getElementById('btnClearCache')?.addEventListener('click', handleClearCache);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);

  // Config modal buttons
  document.getElementById('btnCreateConfig')?.addEventListener('click', openCreateConfigModal);
  document.getElementById('btnCloseConfigModal')?.addEventListener('click', closeConfigModal);
  document.getElementById('btnCancelConfig')?.addEventListener('click', closeConfigModal);
  document.getElementById('btnSaveConfig')?.addEventListener('click', saveConfig);

  // Close modal on overlay click
  document.getElementById('configModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'configModal') {
      closeConfigModal();
    }
  });

  // Formula modal
  document.getElementById('btnFormulaInfo')?.addEventListener('click', openFormulaModal);
  document.getElementById('btnCloseFormulaModal')?.addEventListener('click', closeFormulaModal);
  document.getElementById('formulaModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'formulaModal') {
      closeFormulaModal();
    }
  });
  setupFormulaModalTabs();

  // Rooms page buttons
  document.getElementById('btnRefreshRooms')?.addEventListener('click', refreshRooms);
  document.getElementById('playerName')?.addEventListener('change', (e) => {
    AppState.playerName = e.target.value.trim() || 'Player';
    saveRoomsToStorage();
  });

  // Decision toggle listeners
  document.querySelectorAll('.decision-toggle-input').forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      // Let updateDecisionPanels handle showing/hiding based on cards dealt
      updateDecisionPanels();
    });
  });
}

// ============================================
// Card Handling
// ============================================
function handleCardClick(card) {
  // Normalize card value
  const rank = normalizeRank(card);
  if (!rank) return;

  // Check if cards available
  if (AppState.rankCounts[rank] <= 0) {
    showToast(`No more ${card} cards in shoe`, 'warning');
    return;
  }

  // Check if active player has already stayed (cannot add more cards)
  const activePos = AppState.activePosition;
  if (activePos !== 'dealer' && AppState.playerDecisions[activePos] === 'STAY') {
    showToast(`Player ${activePos} has stayed - cannot add more cards`, 'warning');
    return;
  }

  // Check if dealing to active split hand - validate BEFORE removing card from shoe
  if (AppState.activeSplitPlayer !== null) {
    const split = AppState.splitHands[AppState.activeSplitPlayer];
    if (split && split.active) {
      // Check if current hand has already STAYED (including after double)
      const currentDecision = split[`decision${split.activeHand}`];
      if (currentDecision === 'STAY') {
        showToast(`Hand ${split.activeHand} has stayed - cannot add more cards`, 'warning');
        return;
      }

      // Check if current split hand already has 21 or busted
      const handKey = `hand${split.activeHand}`;
      const currentHandTotal = calculateHandTotal(split[handKey]);
      if (currentHandTotal >= 21) {
        const msg = currentHandTotal === 21 ? 'has 21' : 'busted';
        showToast(`Hand ${split.activeHand} ${msg} - cannot add more cards`, 'info');
        return;
      }

      // Remove card from shoe
      AppState.rankCounts[rank]--;
      AppState.rankSeen[rank]++;
      AppState.cardsDealt++;
      AppState.runningCount += getCountValue(rank);
      addBeadRoad(card);

      split[handKey].push(card);

      // Save to history
      AppState.dealHistory.push({
        card: card,
        rank: rank,
        position: `split_${AppState.activeSplitPlayer}_${split.activeHand}`
      });

      updateAll();
      return;
    }
  }

  // Check if active player already has 21 or busted (cannot add more cards) - regular flow
  if (activePos !== 'dealer') {
    const playerCards = AppState.positions[activePos];
    if (playerCards && playerCards.length > 0) {
      const playerTotal = calculateHandTotal(playerCards);
      if (playerTotal >= 21) {
        const msg = playerTotal === 21 ? 'has 21' : 'busted';
        showToast(`Player ${activePos} ${msg} - cannot add more cards`, 'info');
        return;
      }
    }
  }

  // Check if dealer already busted (cannot add more cards)
  if (activePos === 'dealer') {
    const dealerCards = AppState.positions.dealer;
    if (dealerCards && dealerCards.length > 0) {
      const dealerTotal = calculateHandTotal(dealerCards);
      if (dealerTotal > 21) {
        showToast(`Dealer busted - cannot add more cards`, 'info');
        return;
      }
    }
  }

  // Remove card from shoe (normal flow)
  AppState.rankCounts[rank]--;
  AppState.rankSeen[rank]++;
  AppState.cardsDealt++;
  AppState.runningCount += getCountValue(rank);
  addBeadRoad(card);

  // Add to active position (normal flow)
  AppState.positions[AppState.activePosition].push(card);

  // Save to history for undo
  AppState.dealHistory.push({
    card: card,
    rank: rank,
    position: AppState.activePosition
  });

  // Update UI
  updateAll();
}

function handleUndo() {
  if (AppState.dealHistory.length === 0) {
    showToast('No cards to undo', 'warning');
    return;
  }

  const activePos = AppState.activePosition;
  let lastDealIndex = -1;
  let isSplitUndo = false;
  let splitPlayerNum = null;
  let splitHandNum = null;

  // Check if we're undoing from an active split hand
  if (AppState.activeSplitPlayer !== null) {
    const split = AppState.splitHands[AppState.activeSplitPlayer];
    if (split && split.active) {
      // Look for split hand position in history
      const splitPos = `split_${AppState.activeSplitPlayer}_${split.activeHand}`;
      for (let i = AppState.dealHistory.length - 1; i >= 0; i--) {
        if (AppState.dealHistory[i].position === splitPos) {
          lastDealIndex = i;
          isSplitUndo = true;
          splitPlayerNum = AppState.activeSplitPlayer;
          splitHandNum = split.activeHand;
          break;
        }
      }
    }
  }

  // If not a split undo, look for regular position
  if (lastDealIndex === -1) {
    for (let i = AppState.dealHistory.length - 1; i >= 0; i--) {
      if (AppState.dealHistory[i].position === activePos) {
        lastDealIndex = i;
        break;
      }
    }
  }

  if (lastDealIndex === -1) {
    const posLabel = activePos === 'dealer' ? 'Dealer' : `Player ${activePos}`;
    showToast(`No cards to undo for ${posLabel}`, 'warning');
    return;
  }

  // Remove from history
  const lastDeal = AppState.dealHistory.splice(lastDealIndex, 1)[0];

  // Restore card to shoe
  AppState.rankCounts[lastDeal.rank]++;
  AppState.rankSeen[lastDeal.rank]--;
  AppState.cardsDealt--;

  // Reverse running count
  AppState.runningCount -= getCountValue(lastDeal.rank);

  // Handle split hand undo
  if (isSplitUndo && splitPlayerNum !== null && splitHandNum !== null) {
    const split = AppState.splitHands[splitPlayerNum];
    const handKey = `hand${splitHandNum}`;
    if (split && split[handKey]) {
      const idx = split[handKey].lastIndexOf(lastDeal.card);
      if (idx > -1) {
        split[handKey].splice(idx, 1);
      }
      // If this was a doubled hand that stayed, reset the decision to allow more actions
      if (split[`decision${splitHandNum}`] === 'STAY' && split[handKey].length <= 2) {
        split[`decision${splitHandNum}`] = null;
      }
    }
    updateAll();
    showToast(`Undid ${lastDeal.card} from Hand ${splitHandNum}`, 'info');
    return;
  }

  // Remove from regular position
  const posCards = AppState.positions[lastDeal.position];
  if (posCards) {
    const idx = posCards.lastIndexOf(lastDeal.card);
    if (idx > -1) posCards.splice(idx, 1);
  }

  // Also check if this position has split hands (for backwards compatibility)
  if (AppState.splitHands[activePos]) {
    const split = AppState.splitHands[activePos];
    let removed = false;
    if (split.hand1) {
      const idx1 = split.hand1.lastIndexOf(lastDeal.card);
      if (idx1 > -1) {
        split.hand1.splice(idx1, 1);
        removed = true;
      }
    }
    if (!removed && split.hand2) {
      const idx2 = split.hand2.lastIndexOf(lastDeal.card);
      if (idx2 > -1) {
        split.hand2.splice(idx2, 1);
      }
    }
  }

  updateAll();
  const posLabel = activePos === 'dealer' ? 'Dealer' : `Player ${activePos}`;
  showToast(`Undid ${lastDeal.card} from ${posLabel}`, 'info');
}

function handleResetRound() {
  // Record round to game history (if there were cards dealt)
  const hasCards = AppState.positions.dealer.length > 0 ||
                   Object.values(AppState.positions).some(cards => cards.length > 0);

  if (hasCards) {
    // Collect all cards dealt this round
    const roundCards = [];
    for (const pos in AppState.positions) {
      roundCards.push(...AppState.positions[pos]);
    }
    // Add split hand cards
    for (const playerNum in AppState.splitHands) {
      const split = AppState.splitHands[playerNum];
      if (split) {
        roundCards.push(...(split.hand1 || []), ...(split.hand2 || []));
      }
    }

    recordRoundToHistory({
      cardsDealt: roundCards,
      runningCountStart: AppState.runningCount - roundCards.reduce((sum, card) => sum + getCountValue(normalizeRank(card)), 0),
      trueCountStart: calculateTrueCount()
    });
  }

  // Save dealer cards to history before clearing (if dealer had cards)
  if (AppState.positions.dealer.length > 0) {
    AppState.currentRoundNum++;
    AppState.dealerHistory.unshift({
      round: AppState.currentRoundNum,
      cards: [...AppState.positions.dealer],
      total: calculateHandTotal(AppState.positions.dealer)
    });
    // Keep only last 20 rounds
    if (AppState.dealerHistory.length > 20) {
      AppState.dealerHistory.pop();
    }
  }

  // Clear all position cards
  for (const pos in AppState.positions) {
    AppState.positions[pos] = [];
  }

  // Clear player decisions
  clearPlayerDecisions();

  updateAll();
  updateDealerHistory();
  showToast('Round reset', 'info');
}

function handleEndGame() {
  if (confirm('End current game and reset shoe?')) {
    // End the current session
    endGameSession();

    // Show history panel for export option
    showHistoryPanel();

    // Reset shoe after a short delay
    setTimeout(() => {
      resetShoe();
      // Start new session
      initGameSession('Casino', 'Table 1');
    }, 500);
  }
}

function resetShoe() {
  AppState.rankCounts = JSON.parse(JSON.stringify(AppState.initialCounts));
  AppState.rankSeen = { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0 };
  AppState.cardsDealt = 0;
  AppState.runningCount = 0;  // TC RESETS TO 0 ON SHUFFLE
  AppState.dealHistory = [];
  AppState.pairsWon = 0;

  // Reset Martingale state on new shoe
  AppState.quantEvSettings.martingaleCurrentBet = AppState.quantEvSettings.baseUnit;
  AppState.quantEvSettings.martingaleLossStreak = 0;

  // Clear dealer history on shoe reset
  AppState.dealerHistory = [];
  AppState.currentRoundNum = 0;

  // Reset dealer bust history on shoe reset
  if (typeof resetDealerBustHistory === 'function') {
    resetDealerBustHistory();
  }

  for (const pos in AppState.positions) {
    AppState.positions[pos] = [];
  }

  updateAll();
  updateDealerHistory();
  console.log('[Shuffle] New shoe - TC reset to 0');
}

function normalizeRank(card) {
  const c = String(card).toUpperCase();
  if (['J', 'Q', 'K'].includes(c)) return '10';
  if (['10', '2', '3', '4', '5', '6', '7', '8', '9', 'A'].includes(c)) return c;
  return null;
}

function getCountValue(rank) {
  // Hi-Lo counting system
  if (['2', '3', '4', '5', '6'].includes(rank)) return 1;  // Low cards
  if (['10', 'A'].includes(rank)) return -1;               // High cards
  return 0;                                                 // Neutral (7, 8, 9)
}

// ============================================
// Deck Configuration
// ============================================
function setNumDecks(num) {
  AppState.numDecks = num;
  AppState.totalCards = num * 52;

  // Recalculate initial counts
  const cardsPerRank = num * 4;
  AppState.initialCounts = {
    '2': cardsPerRank, '3': cardsPerRank, '4': cardsPerRank,
    '5': cardsPerRank, '6': cardsPerRank, '7': cardsPerRank,
    '8': cardsPerRank, '9': cardsPerRank, '10': num * 16, 'A': cardsPerRank
  };

  resetShoe();
  showToast(`Shoe set to ${num} decks`, 'info');
}

function setNumPlayers(num) {
  AppState.config.playersSeated = num;

  // Show/hide player boxes (8 total positions)
  for (let i = 1; i <= 8; i++) {
    const box = document.getElementById(`player${i}`);
    if (box) {
      box.style.display = i <= num ? 'block' : 'none';
    }
  }

  // Update player count for responsive scaling
  updatePlayerCountAttribute();

  updateAll();
}

function updatePlayerCountAttribute() {
  const playersRow = document.querySelector('.players-row');
  if (playersRow) {
    const visibleCount = AppState.config.playersSeated;
    // Set data attribute for CSS responsive scaling (1-6, above 6 uses default)
    if (visibleCount >= 1 && visibleCount <= 6) {
      playersRow.setAttribute('data-player-count', visibleCount);
    } else {
      playersRow.removeAttribute('data-player-count');
    }
  }
}

// ============================================
// Game Settings
// ============================================
function applyGameSettings() {
  const diceRank = document.getElementById('diceRank')?.value || 'none';
  const diceMapping = document.getElementById('diceMapping')?.value || 'standard';

  // Store settings in AppState
  AppState.config.diceMapping = diceMapping;

  // If a dice rank is selected, apply the burn logic
  if (diceRank !== 'none') {
    applyDiceBurn(diceRank, diceMapping);
    // Reset dice rank dropdown after applying
    document.getElementById('diceRank').value = 'none';
  } else {
    showToast('Select a dice rank to burn cards', 'warning');
  }

  updateAll();
}

function applyDiceBurn(diceRank, mapping) {
  // Get the pip value based on mapping
  const burnCount = getDiceMappingValue(diceRank, mapping);

  // First, record the dice card itself as seen
  const normalizedRank = normalizeRank(diceRank);
  if (AppState.rankCounts[normalizedRank] > 0) {
    AppState.rankCounts[normalizedRank]--;
    AppState.rankSeen[normalizedRank]++;
    AppState.cardsDealt++;
    AppState.runningCount += getCountValue(normalizedRank);
  }

  // Then burn additional random cards based on pip value
  let burned = 0;
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

  while (burned < burnCount) {
    // Pick a random rank that still has cards
    const availableRanks = ranks.filter(r => AppState.rankCounts[r] > 0);
    if (availableRanks.length === 0) break;

    const randomRank = availableRanks[Math.floor(Math.random() * availableRanks.length)];

    // Burn one card of this rank (count it as seen but unknown)
    AppState.rankCounts[randomRank]--;
    AppState.cardsDealt++;
    // Note: We don't update rankSeen for burned cards since we don't know what they are
    // But we also don't update running count since burned cards are face-down
    burned++;
  }

  const totalSeen = 1 + burned;
  showToast(`Dice ${diceRank}: 1 card seen + ${burned} burned = ${totalSeen} total cards`, 'success');
}

function getDiceMappingValue(card, mapping) {
  const rank = normalizeRank(card);
  mapping = mapping || AppState.config.diceMapping || 'standard';

  if (mapping === 'standard') {
    // A=1, 2-10=pip value, J/Q/K=10
    if (rank === 'A') return 1;
    if (['J', 'Q', 'K'].includes(rank) || rank === '10') return 10;
    return parseInt(rank) || 10;
  } else if (mapping === 'hilo') {
    // Hi-Lo counting values (absolute value for burn count)
    return Math.abs(getCountValue(rank));
  }

  return 0;
}

// ============================================
// Position Management
// ============================================
function setActivePosition(posId) {
  // Remove active class from all
  document.querySelectorAll('.player-box, .dealer-box').forEach(el => {
    el.classList.remove('active');
  });

  // Add active class to selected
  const el = document.getElementById(posId) || document.getElementById(posId + 'Box');
  if (el) {
    el.classList.add('active');
    AppState.activePosition = posId === 'dealerBox' ? 'dealer' : posId;
  }
}

// ============================================
// Calculations
// ============================================
function getTrueCount() {
  const decksRemaining = (AppState.totalCards - AppState.cardsDealt) / 52;
  if (decksRemaining <= 0) return 0;
  return AppState.runningCount / decksRemaining;
}

function getPenetration() {
  if (AppState.totalCards === 0) return 0;
  return (AppState.cardsDealt / AppState.totalCards) * 100;
}

function getCardsRemaining() {
  return AppState.totalCards - AppState.cardsDealt;
}

// Probability: Draw a specific rank
function getProbability(rank) {
  const remaining = getCardsRemaining();
  if (remaining <= 0) return 0;
  return AppState.rankCounts[rank] / remaining;
}

// P(TENS) - Probability of drawing 10-value card
function getPTens() {
  return getProbability('10');
}

// P(ACES) - Probability of drawing Ace
function getPAces() {
  return getProbability('A');
}

// P(7-A) - Probability of drawing 7 through Ace
function getP7A() {
  const remaining = getCardsRemaining();
  if (remaining <= 0) return 0;
  const count = AppState.rankCounts['7'] + AppState.rankCounts['8'] +
                AppState.rankCounts['9'] + AppState.rankCounts['10'] +
                AppState.rankCounts['A'];
  return count / remaining;
}

// S-Score: Composition edge proxy (tens + aces deviation from expected)
function getSScore() {
  const totalTensAces = AppState.rankCounts['10'] + AppState.rankCounts['A'];
  const remaining = getCardsRemaining();
  if (remaining <= 0) return 0;

  const expectedRatio = (AppState.numDecks * 20) / AppState.totalCards; // 16 tens + 4 aces per deck
  const actualRatio = totalTensAces / remaining;

  return actualRatio - expectedRatio;
}

// Estimated P(WIN) - Simplified dealer bust probability based
function getPWin() {
  const tc = getTrueCount();
  // Base win rate ~42%, adjusted by true count
  return 0.42 + (tc * 0.005);
}

// Basic EV estimate
function getEV() {
  const tc = getTrueCount();
  // House edge ~0.5%, improved by true count
  return -0.005 + (tc * 0.005);
}

// Any Pair probability
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

// Any Pair EV
function getAnyPairEV() {
  const pPair = getAnyPairProb();
  const payout = AppState.config.anyPairPayout;
  // EV = P(win) * payout - P(lose) * 1
  return pPair * payout - (1 - pPair);
}

// Seat adjustment multiplier
function getSeatAdjustment() {
  const { playersSeated, seatIndex, seatAlpha } = AppState.config;
  if (playersSeated <= 1) return 1;
  const rel = (seatIndex - 1) / (playersSeated - 1);
  return 1 + seatAlpha * rel;
}

// Window detector score
function getWindowScore() {
  const anyPairEV = getAnyPairEV();
  const tc = getTrueCount();

  let score = 50;
  score += Math.max(-30, Math.min(40, anyPairEV * 120));
  score += Math.max(-10, Math.min(20, tc * 5));

  return Math.max(0, Math.min(100, score));
}

// Window decision
function getWindowDecision() {
  const score = getWindowScore();
  const threshold = AppState.config.windowScoreThreshold;
  const anyPairEV = getAnyPairEV();

  if (anyPairEV > 0 && score >= threshold) return 'BET';
  return 'NO_BET';
}

// Kelly fraction
function getKellyFraction() {
  const ev = getAnyPairEV();
  const baseFrac = AppState.config.kellyFraction;

  if (ev <= 0) return 0;

  // Simplified Kelly: f = edge / odds
  const edge = ev;
  const odds = AppState.config.anyPairPayout;
  const kelly = edge / odds;

  return Math.min(baseFrac, Math.max(0, kelly));
}

// 21+3 EV (simplified)
function get21P3EV() {
  // Base 21+3 house edge is around 3.4%
  const tc = getTrueCount();
  return -0.034 + (tc * 0.002);
}

// ============================================
// Post-Deal Decision Engine
// ============================================

// Analyze a hand: returns { total, isSoft, isPair, cards }
function analyzeHand(cards) {
  if (!cards || cards.length === 0) {
    return { total: 0, isSoft: false, isPair: false, cards: [] };
  }

  let total = 0;
  let aces = 0;
  const values = [];

  for (const card of cards) {
    let val;
    if (card === 'A') {
      aces++;
      val = 11;
    } else if (['K', 'Q', 'J', '10'].includes(card)) {
      val = 10;
    } else {
      val = parseInt(card) || 0;
    }
    values.push(val);
    total += val;
  }

  // Adjust for aces
  let softAces = aces;
  while (total > 21 && softAces > 0) {
    total -= 10;
    softAces--;
  }

  const isSoft = softAces > 0 && total <= 21;
  const isPair = cards.length === 2 && values[0] === values[1];

  return { total, isSoft, isPair, cards, values };
}

// Basic Strategy Matrix (H=Hit, S=Stand, D=Double, P=Split, Ds=Double/Stand, Dh=Double/Hit)
// Key: "handType_playerValue" -> { dealerUpcards: action }
const BASIC_STRATEGY = {
  // Hard totals (player total vs dealer upcard 2-A)
  //              2     3     4     5     6     7     8     9     10    A
  hard_5:      ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
  hard_6:      ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
  hard_7:      ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
  hard_8:      ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
  hard_9:      ['H',  'D',  'D',  'D',  'D',  'H',  'H',  'H',  'H',  'H'],
  hard_10:     ['D',  'D',  'D',  'D',  'D',  'D',  'D',  'D',  'H',  'H'],
  hard_11:     ['D',  'D',  'D',  'D',  'D',  'D',  'D',  'D',  'D',  'D'],
  hard_12:     ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
  hard_13:     ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
  hard_14:     ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
  hard_15:     ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
  hard_16:     ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
  hard_17:     ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
  hard_18:     ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
  hard_19:     ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
  hard_20:     ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
  hard_21:     ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],

  // Soft totals (A+X)
  //              2     3     4     5     6     7     8     9     10    A
  soft_13:     ['H',  'H',  'H',  'D',  'D',  'H',  'H',  'H',  'H',  'H'],
  soft_14:     ['H',  'H',  'H',  'D',  'D',  'H',  'H',  'H',  'H',  'H'],
  soft_15:     ['H',  'H',  'D',  'D',  'D',  'H',  'H',  'H',  'H',  'H'],
  soft_16:     ['H',  'H',  'D',  'D',  'D',  'H',  'H',  'H',  'H',  'H'],
  soft_17:     ['H',  'D',  'D',  'D',  'D',  'H',  'H',  'H',  'H',  'H'],
  soft_18:     ['Ds', 'Ds', 'Ds', 'Ds', 'Ds', 'S',  'S',  'H',  'H',  'H'],
  soft_19:     ['S',  'S',  'S',  'S',  'Ds', 'S',  'S',  'S',  'S',  'S'],
  soft_20:     ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
  soft_21:     ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],

  // Pairs (P=Split, H=Hit, S=Stand, D=Double)
  //              2     3     4     5     6     7     8     9     10    A
  pair_2:      ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
  pair_3:      ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
  pair_4:      ['H',  'H',  'H',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
  pair_5:      ['D',  'D',  'D',  'D',  'D',  'D',  'D',  'D',  'H',  'H'],
  pair_6:      ['P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
  pair_7:      ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
  pair_8:      ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P'],
  pair_9:      ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
  pair_10:     ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
  pair_A:      ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
};

// Illustrious 18 Deviations (TC = True Count threshold)
// Format: { hand, dealer, basicAction, deviationAction, tcThreshold, direction }
const ILLUSTRIOUS_18 = [
  { hand: 'insurance', dealer: 'A', basic: 'NO', deviation: 'YES', tc: 3, dir: '>=' },
  { hand: '16', dealer: '10', basic: 'H', deviation: 'S', tc: 0, dir: '>=' },
  { hand: '15', dealer: '10', basic: 'H', deviation: 'S', tc: 4, dir: '>=' },
  { hand: '10,10', dealer: '5', basic: 'S', deviation: 'P', tc: 5, dir: '>=' },
  { hand: '10,10', dealer: '6', basic: 'S', deviation: 'P', tc: 4, dir: '>=' },
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

// Fab 4 Surrender Deviations
const FAB_4 = [
  { hand: '14', dealer: '10', tc: 3, dir: '>=' },
  { hand: '15', dealer: '10', tc: 0, dir: '>=' },
  { hand: '15', dealer: 'A', tc: 1, dir: '>=' },
  { hand: '15', dealer: '9', tc: 2, dir: '>=' }
];

// Get dealer upcard index (2=0, 3=1, ..., 10=8, A=9)
function getDealerIndex(dealerCard) {
  if (dealerCard === 'A') return 9;
  const val = parseInt(dealerCard);
  if (val >= 2 && val <= 9) return val - 2;
  if (val === 10 || ['K', 'Q', 'J', '10'].includes(dealerCard)) return 8;
  return 8; // Default to 10
}

// ============================================
// SACRIFICE STRATEGY - "Teamplay Always Wins"
// ENHANCED FOR EUROPEAN NO HOLE CARD (ENHC)
// ============================================
// Player 5 sacrifices their hand to help bust the dealer
// Goal: Manipulate card flow so dealer busts, even if P5 busts
//
// ENHC ADVANTAGE:
// - Dealer has ONLY 1 upcard (no hole card)
// - P5 sees 11 cards dealt before dealer draws (5 players x 2 + dealer upcard)
// - Dealer must draw 1-4+ cards to reach 17+
// - P5's absorption has MAXIMUM impact on dealer's draws
//
// Strategy Logic:
// - P5 plays LAST (after P1-P4), knows ALL dealt cards
// - Analyzes dealer upcard to predict how many cards dealer needs
// - Uses True Count to estimate remaining card composition
// - Decides to HIT (absorb helpful cards) or STAND (leave bad cards)
//
// Key Insight: ENHC means dealer needs MORE cards to reach 17+
// - Dealer 2-6: HIGH bust probability (must draw 2-4 cards typically)
// - Dealer 7-A: Medium bust probability (must draw 1-3 cards typically)
// ============================================

// ============================================
// UNIFIED_P3_P5_SACRIFICE_POLICIES_CLAUDE v1.0
// ============================================
// Coordinated Shield System around P4 (Quant EV Player)
// P3 = Front Shield (removes harmful cards BEFORE P4)
// P5 = Rear Shield (absorbs dealer cards AFTER P4)
//
// COORDINATION MODES:
// - AGGRESSIVE: Both P3/P5 hit heavily (negative TC, need to burn cards)
// - BALANCED: Standard absorption levels
// - PRESERVE: Minimal hits to preserve high cards for P4 (positive TC)
// ============================================

// Reset unified state at start of each round
function resetUnifiedSacrificeState() {
  const state = AppState.quantEvSettings.unifiedState;
  state.p3CardsAbsorbed = 0;
  state.p3Action = null;
  state.p3Aggression = 50;
  state.p3StoodOnStiff = false;
  state.p5CardsAbsorbed = 0;
  state.p5Action = null;
  state.p5Aggression = 50;
  state.roundTc = getTrueCount();
  state.dealerUpcard = AppState.positions.dealer?.[0] || null;

  // Determine coordination mode based on TC
  const tc = state.roundTc;
  if (tc <= -2) {
    state.coordinationMode = 'AGGRESSIVE';  // Burn small cards
  } else if (tc >= 3) {
    state.coordinationMode = 'PRESERVE';    // Keep 10s for P4
  } else {
    state.coordinationMode = 'BALANCED';
  }

  return state;
}

// Get unified coordination parameters for P3
function getUnifiedP3Params() {
  const settings = AppState.quantEvSettings;
  const state = settings.unifiedState;
  const tc = getTrueCount();
  const dealerVal = state.dealerUpcard === 'A' ? 11 : (parseInt(state.dealerUpcard) || 10);

  let aggressionMod = 0;
  let maxAbsorption = 4;
  let preserveHighCards = false;

  // Mode-based adjustments
  switch (state.coordinationMode) {
    case 'AGGRESSIVE':
      aggressionMod = 25;
      maxAbsorption = 5;
      break;
    case 'PRESERVE':
      aggressionMod = -20;
      maxAbsorption = 2;
      preserveHighCards = true;
      break;
    case 'BALANCED':
    default:
      aggressionMod = 0;
      maxAbsorption = 3;
  }

  // Dealer upcard synergy for P3 (Front Shield)
  // P3's job: Remove cards that hurt P4 or help dealer
  if (dealerVal >= 2 && dealerVal <= 6) {
    // Weak dealer: P3 absorbs bust cards (4,5,6) to force dealer bust
    aggressionMod += 10;
  } else if (dealerVal >= 9 || dealerVal === 11) {
    // Strong dealer (9,10,A): P3 preserves 10s for P4 to compete
    if (tc >= 2) {
      aggressionMod -= 15;
      preserveHighCards = true;
    }
  }

  return {
    aggressionMod,
    maxAbsorption,
    preserveHighCards,
    coordinationMode: state.coordinationMode
  };
}

// Get unified coordination parameters for P5
function getUnifiedP5Params() {
  const settings = AppState.quantEvSettings;
  const state = settings.unifiedState;
  const tc = getTrueCount();
  const dealerVal = state.dealerUpcard === 'A' ? 11 : (parseInt(state.dealerUpcard) || 10);

  let aggressionMod = 0;
  let maxAbsorption = 5;
  let hitHard17Allowed = false;

  // Adjust based on P3's actions (coordination)
  if (state.p3CardsAbsorbed >= 3) {
    // P3 absorbed heavily - P5 reduces aggression
    aggressionMod -= 20;
    maxAbsorption = 3;
  } else if (state.p3StoodOnStiff) {
    // P3 stood on stiff - P5 increases aggression to compensate
    aggressionMod += 25;
    maxAbsorption = 6;
    hitHard17Allowed = true;
  }

  // Mode-based adjustments
  switch (state.coordinationMode) {
    case 'AGGRESSIVE':
      aggressionMod += 20;
      hitHard17Allowed = true;
      break;
    case 'PRESERVE':
      aggressionMod -= 15;
      break;
    case 'BALANCED':
    default:
      break;
  }

  // Dealer upcard synergy for P5 (Rear Shield)
  // P5's job: Absorb cards dealer needs to make 17+
  if (dealerVal >= 7 && dealerVal <= 8) {
    // Dealer 7-8 needs 9-10 pts - P5 absorbs at negative TC
    if (tc < 0) {
      aggressionMod += 15;
      hitHard17Allowed = true;
    }
  } else if (dealerVal >= 9 || dealerVal === 11) {
    // Dealer 9,10,A needs 6-8 pts
    if (tc <= -2) {
      // Many small cards - P5 max absorption
      aggressionMod += 25;
      hitHard17Allowed = true;
      maxAbsorption = 6;
    } else if (tc >= 2) {
      // Many 10s - dealer likely busts, P5 can take 10s
      aggressionMod += 10;
      hitHard17Allowed = true;
    }
  }

  // Total cards absorbed this round check
  const totalAbsorbed = state.p3CardsAbsorbed + state.p5CardsAbsorbed;
  if (totalAbsorbed >= settings.sacrificeTeamSaturation) {
    // Team saturation - reduce P5 aggression
    aggressionMod -= 30;
    hitHard17Allowed = false;
  }

  return {
    aggressionMod,
    maxAbsorption,
    hitHard17Allowed,
    coordinationMode: state.coordinationMode,
    p3Absorbed: state.p3CardsAbsorbed,
    p3StoodOnStiff: state.p3StoodOnStiff
  };
}

// Update P3 state after action
function updateP3UnifiedState(action, cardsAbsorbed, stoodOnStiff, aggression) {
  const state = AppState.quantEvSettings.unifiedState;
  state.p3Action = action;
  state.p3CardsAbsorbed = cardsAbsorbed;
  state.p3StoodOnStiff = stoodOnStiff;
  state.p3Aggression = aggression;
}

// Update P5 state after action
function updateP5UnifiedState(action, cardsAbsorbed, aggression) {
  const state = AppState.quantEvSettings.unifiedState;
  state.p5Action = action;
  state.p5CardsAbsorbed = cardsAbsorbed;
  state.p5Aggression = aggression;
}

// ============================================
// P3_SACRIFICE_P4_BOOSTER_CLAUDE_PACKAGE v1.0
// ============================================
// P3 Specialized Strategy: Optimize conditions for P4
// Primary Goal: Manipulate card flow to maximize P4 win rate
// - Card Flow Control: Remove harmful cards before P4
// - TC Optimization: Preserve high cards at +TC, burn lows at -TC
// - Dealer Response: Absorb bust cards vs weak dealer, clear path vs strong
// - Hand Synergy: Coordinate with P4's likely hand outcomes
// ============================================

function getP3BoosterDecision(playerCards, dealerUpcard, p1Cards = [], p2Cards = []) {
  const hand = analyzeHand(playerCards);
  const tc = getTrueCount();
  const rc = AppState.runningCount;
  const playerTotal = hand.total;
  const isSoft = hand.isSoft;
  const dealerVal = dealerUpcard === 'A' ? 11 : (parseInt(dealerUpcard) || 10);
  const decksRemaining = Math.max(1, (AppState.totalCards - AppState.cardsDealt) / 52);
  const penetration = AppState.cardsDealt / AppState.totalCards;

  // ============================================
  // UNIFIED P3 BOOSTER ENGINE v1.0
  // Integrated with Unified P3/P5 Sacrifice Policies
  // ============================================

  // Get unified coordination parameters
  const unifiedParams = AppState.quantEvSettings.unifiedSacrificeEnabled
    ? getUnifiedP3Params()
    : { aggressionMod: 0, maxAbsorption: 4, preserveHighCards: false, coordinationMode: 'BALANCED' };

  // Count cards already removed by P1-P2 (affects what P4 will receive)
  let lowCardsRemoved = 0;   // 2-6 removed (good for P4)
  let highCardsRemoved = 0;  // 10-A removed (bad for P4)
  let midCardsRemoved = 0;   // 7-9 neutral

  const allPriorCards = [...p1Cards, ...p2Cards, ...playerCards, dealerUpcard];
  allPriorCards.forEach(card => {
    const val = card === 'A' ? 11 : (parseInt(card) || 10);
    if (val >= 2 && val <= 6) lowCardsRemoved++;
    else if (val >= 10 || card === 'A') highCardsRemoved++;
    else midCardsRemoved++;
  });

  // Calculate P4 advantage indicator
  // Positive = good for P4 (more high cards remain), Negative = bad for P4
  const p4Advantage = lowCardsRemoved - highCardsRemoved + (tc * 0.5);

  // ============================================
  // UNIFIED BOOSTER AGGRESSION MATRIX
  // ============================================
  // Base Aggression + Unified Policy Modifier

  let boosterAggression = 50 + unifiedParams.aggressionMod;  // Apply unified modifier

  // TC-Based Aggression Adjustment
  if (tc >= 3) {
    // High TC: Rich in 10s/Aces - preserve them for P4, be conservative
    boosterAggression -= 20;
  } else if (tc >= 1) {
    // Slightly positive: Moderate preservation
    boosterAggression -= 10;
  } else if (tc <= -2) {
    // Negative TC: Burn small cards to improve deck for P4
    boosterAggression += 25;
  } else if (tc < 0) {
    // Slightly negative: Light burning
    boosterAggression += 15;
  }

  // Penetration Adjustment
  if (penetration > 0.6) {
    // Deep in shoe: More aggressive manipulation matters more
    boosterAggression += 10;
  }

  // UNIFIED: Preserve high cards override
  if (unifiedParams.preserveHighCards && playerTotal >= 12) {
    boosterAggression -= 15;  // Reduce aggression to preserve 10s for P4
  }

  // Dealer Upcard Response
  const weakDealer = dealerVal >= 2 && dealerVal <= 6;
  const strongDealer = dealerVal >= 7 || dealerVal === 11;

  if (weakDealer) {
    // Weak dealer likely to bust - absorb bust cards (4,5,6) to protect P4
    // P3 should hit more on stiff hands to remove dangerous cards
    if (playerTotal >= 12 && playerTotal <= 16) {
      boosterAggression += 15;  // Hit stiffs to absorb bust cards
    }
  } else if (strongDealer) {
    // Strong dealer - P4 needs high cards to beat dealer's likely 17+
    // Be more conservative to preserve 10s/Aces for P4
    if (tc > 0) {
      boosterAggression -= 15;
    }
  }

  // P4 Advantage Adjustment
  if (p4Advantage < -2) {
    // P4 is at disadvantage - be more aggressive to fix card flow
    boosterAggression += 15;
  } else if (p4Advantage > 2) {
    // P4 already advantaged - preserve current state
    boosterAggression -= 10;
  }

  // Clamp aggression to valid range
  boosterAggression = Math.max(0, Math.min(100, boosterAggression));

  // ============================================
  // DECISION MATRIX BY HAND TYPE
  // ============================================

  let action = 'STAND';
  let intent = 'PRESERVE';
  let confidence = 70;

  // === HARD HANDS ===
  if (!isSoft) {
    if (playerTotal <= 8) {
      // Always hit very low hands
      action = 'HIT';
      intent = 'BUILD_HAND';
      confidence = 95;
    } else if (playerTotal === 9) {
      // Hit 9 to build or absorb
      action = 'HIT';
      intent = boosterAggression > 60 ? 'BURN_LOWS' : 'BUILD_HAND';
      confidence = 85;
    } else if (playerTotal === 10 || playerTotal === 11) {
      // Good hitting hands - take card unless preserving for P4
      if (tc >= 4 && playerTotal === 10) {
        action = 'STAND';  // Extreme preservation at very high TC
        intent = 'PRESERVE_FOR_P4';
        confidence = 75;
      } else {
        action = 'HIT';
        intent = 'OPTIMAL_BUILD';
        confidence = 90;
      }
    } else if (playerTotal === 12) {
      // Stiff 12: Key booster decision point
      if (weakDealer && boosterAggression >= 50) {
        action = 'HIT';
        intent = 'ABSORB_BUST_CARD';
        confidence = 70 + (boosterAggression / 5);
      } else if (strongDealer) {
        action = 'HIT';
        intent = 'MUST_COMPETE';
        confidence = 80;
      } else {
        action = boosterAggression >= 65 ? 'HIT' : 'STAND';
        intent = action === 'HIT' ? 'AGGRESSIVE_BOOST' : 'STANDARD_PLAY';
        confidence = 65;
      }
    } else if (playerTotal >= 13 && playerTotal <= 16) {
      // Stiff hands 13-16: Critical booster zone
      if (weakDealer) {
        // Dealer likely busts - absorb dangerous cards
        if (boosterAggression >= 60 && playerTotal <= 15) {
          action = 'HIT';
          intent = 'ABSORB_FOR_DEALER_BUST';
          confidence = 60 + (boosterAggression / 4);
        } else if (boosterAggression >= 75 && playerTotal === 16) {
          action = 'HIT';
          intent = 'HIGH_AGGRESSION_ABSORB';
          confidence = 55;
        } else {
          action = 'STAND';
          intent = 'LET_DEALER_BUST';
          confidence = 70;
        }
      } else {
        // Strong dealer - must hit anyway
        if (playerTotal <= 15) {
          action = 'HIT';
          intent = 'COMPETE_WITH_DEALER';
          confidence = 75;
        } else {
          // 16 vs strong dealer - TC dependent
          action = (tc < 0 || boosterAggression >= 55) ? 'HIT' : 'STAND';
          intent = action === 'HIT' ? 'TC_BASED_HIT' : 'TC_BASED_STAND';
          confidence = 60;
        }
      }
    } else if (playerTotal >= 17) {
      // Strong hands - always stand
      action = 'STAND';
      intent = 'STRONG_HAND';
      confidence = 95;
    }
  }

  // === SOFT HANDS ===
  else {
    if (playerTotal <= 17) {
      // Soft 17 and below - always hit for P4 benefit
      action = 'HIT';
      intent = 'BUILD_SOFT';
      confidence = 90;
    } else if (playerTotal === 18) {
      // Soft 18: Key decision
      if (strongDealer && boosterAggression >= 55) {
        action = 'HIT';
        intent = 'IMPROVE_SOFT_18';
        confidence = 65;
      } else {
        action = 'STAND';
        intent = 'SOLID_18';
        confidence = 75;
      }
    } else {
      // Soft 19-21
      action = 'STAND';
      intent = 'PREMIUM_SOFT';
      confidence = 95;
    }
  }

  // ============================================
  // SPECIAL BOOSTER OVERRIDES
  // ============================================

  // Override 1: Very high TC preservation mode
  if (tc >= 5 && action === 'HIT' && playerTotal >= 12) {
    action = 'STAND';
    intent = 'EXTREME_PRESERVATION';
    confidence = 80;
  }

  // Override 2: Very low TC burning mode
  if (tc <= -3 && action === 'STAND' && playerTotal <= 15) {
    action = 'HIT';
    intent = 'DECK_CLEANSE';
    confidence = 70;
  }

  // Override 3: Late shoe P4 boost
  if (penetration > 0.7 && p4Advantage < 0 && playerTotal <= 14) {
    action = 'HIT';
    intent = 'LATE_SHOE_BOOST';
    confidence = 65;
  }

  // Track if P3 stood on a stiff hand (for P5 coordination)
  const stoodOnStiff = (action === 'STAND' && playerTotal >= 12 && playerTotal <= 16);

  // UNIFIED: Calculate cards P3 absorbed (will be updated in simPlayerPlay)
  const cardsAbsorbed = playerCards.length - 2;  // Cards beyond initial 2

  // Clamp aggression
  boosterAggression = Math.max(0, Math.min(100, boosterAggression));

  return {
    action: action,
    reason: `BOOST[${intent}] TC:${tc.toFixed(1)} Agg:${boosterAggression} Mode:${unifiedParams.coordinationMode}`,
    ev: boosterAggression / 100,
    confidence: confidence,
    boosterIntent: intent,
    boosterAggression: boosterAggression,
    p4Advantage: p4Advantage,
    tcAtDecision: tc,
    // UNIFIED POLICY DATA
    coordinationMode: unifiedParams.coordinationMode,
    stoodOnStiff: stoodOnStiff,
    cardsAbsorbed: cardsAbsorbed,
    preserveHighCards: unifiedParams.preserveHighCards
  };
}

// ============================================
// QUANT TEAMPLAY SACRIFICE v1.4 FULL
// ============================================
// TEAMPLAY ALWAYS WINS Strategy Implementation
// P1-P2: Basic Strategy | P4: Quant EV+MG | P5: Sacrifice v1.4
// ENHC Rules: Dealer 1 upcard, draws after all players
// ============================================

function getSacrificeDecision(playerCards, dealerUpcard, otherPlayersCards = [], isP5Sacrifice = false) {
  const hand = analyzeHand(playerCards);
  const tc = getTrueCount();
  const rc = AppState.runningCount;
  const playerTotal = hand.total;
  const dealerVal = dealerUpcard === 'A' ? 11 : (parseInt(dealerUpcard) || 10);
  const decksRemaining = (AppState.totalCards - AppState.cardsDealt) / 52;

  // ============================================
  // UNIFIED P5 SACRIFICE ENGINE v1.0
  // Integrated with Unified P3/P5 Sacrifice Policies
  // ============================================

  // Get unified coordination parameters (only for P5)
  const unifiedParams = (isP5Sacrifice && AppState.quantEvSettings.unifiedSacrificeEnabled)
    ? getUnifiedP5Params()
    : { aggressionMod: 0, maxAbsorption: 5, hitHard17Allowed: false, coordinationMode: 'BALANCED', p3Absorbed: 0, p3StoodOnStiff: false };

  // ============================================
  // ENHC DEALER BUST PROBABILITY MATRIX v1.4
  // Higher than standard due to single upcard rule
  // Dealer must draw 2-4 cards typically to reach 17+
  // ============================================
  const dealerBustProbENHC = {
    2: { base: 0.42, tcMod: 0.02 },   // 42% + 2% per TC point
    3: { base: 0.44, tcMod: 0.02 },   // 44% base
    4: { base: 0.47, tcMod: 0.025 },  // 47% base
    5: { base: 0.50, tcMod: 0.03 },   // 50% - WEAKEST
    6: { base: 0.50, tcMod: 0.03 },   // 50% - WEAKEST
    7: { base: 0.35, tcMod: 0.015 },  // 35% base
    8: { base: 0.32, tcMod: 0.015 },  // 32% base
    9: { base: 0.30, tcMod: 0.01 },   // 30% base
    10: { base: 0.28, tcMod: 0.01 },  // 28% base
    11: { base: 0.20, tcMod: 0.005 }  // 20% - Ace strongest
  };

  // Calculate adjusted bust probability based on TC
  const bustData = dealerBustProbENHC[dealerVal] || { base: 0.35, tcMod: 0.015 };
  const bustProb = Math.min(0.75, Math.max(0.15, bustData.base + (tc * bustData.tcMod)));

  // ============================================
  // CARD REMOVAL EFFECT (CRE) ANALYSIS v1.4
  // Track what cards remain and their impact
  // ============================================
  const tensRemaining = (AppState.rankCounts['10'] || 0);
  const acesRemaining = (AppState.rankCounts['A'] || 0);
  const lowCardsRemaining = ['2','3','4','5','6'].reduce((sum, r) => sum + (AppState.rankCounts[r] || 0), 0);
  const midCardsRemaining = ['7','8','9'].reduce((sum, r) => sum + (AppState.rankCounts[r] || 0), 0);

  // Density ratios (cards per deck remaining)
  const tensDensity = tensRemaining / Math.max(1, decksRemaining);
  const lowDensity = lowCardsRemaining / Math.max(1, decksRemaining);

  // Cards absorbed by team this round (P1-P4)
  let cardsAbsorbed = otherPlayersCards.reduce((sum, h) => sum + (h ? h.length : 0), 0);
  const totalCardsDealt = cardsAbsorbed + playerCards.length + 1;

  // ============================================
  // SACRIFICE DECISION ENGINE v1.4
  // ============================================
  let action = 'STAND';
  let reason = 'Sacrifice v1.4: Default stand';
  let confidence = 75;
  let sacrificeIntent = '';
  let aggressionLevel = 0; // 0-100 scale

  // RULE 0: Already at terminal state
  if (playerTotal >= 21) {
    return {
      action: 'STAND',
      reason: playerTotal > 21 ? 'SAC v1.4: Busted absorbing cards for team' : 'SAC v1.4: Perfect 21',
      confidence: 100,
      isSacrifice: true,
      sacrificeIntent: playerTotal > 21 ? 'BUSTED_FOR_TEAM' : 'PERFECT_21',
      bustProb: bustProb,
      tcUsed: tc,
      version: '1.4'
    };
  }

  // ============================================
  // WEAK DEALER (2-6) - HIGH BUST PROBABILITY
  // Primary Strategy: PRESERVE bust cards for dealer
  // Secondary: Absorb 10s if TC is very high
  // ============================================
  if (dealerVal >= 2 && dealerVal <= 6) {
    aggressionLevel = 30 - (dealerVal * 2); // Less aggression vs weak dealers

    // TC >= +4: Extreme ten-rich, absorb to deny dealer safe draws
    if (tc >= 4) {
      if (playerTotal <= 14) {
        action = 'HIT';
        reason = `SAC v1.4: TC +${tc.toFixed(1)} extreme, absorb 10s vs weak ${dealerVal}`;
        sacrificeIntent = 'EXTREME_TEN_ABSORPTION';
        confidence = 88;
        aggressionLevel = 70;
      } else {
        action = 'STAND';
        reason = `SAC v1.4: ${playerTotal} solid, preserve for dealer bust`;
        sacrificeIntent = 'PRESERVE_HIGH_HAND';
        confidence = 85;
      }
    }
    // TC +2 to +3.9: High ten count, selective absorption
    else if (tc >= 2) {
      if (playerTotal <= 12) {
        action = 'HIT';
        reason = `SAC v1.4: TC +${tc.toFixed(1)}, safe absorb vs ${dealerVal}`;
        sacrificeIntent = 'SELECTIVE_ABSORPTION';
        confidence = 82;
        aggressionLevel = 50;
      } else if (playerTotal <= 16 && dealerVal >= 5) {
        // 5-6 are weakest, can risk absorption
        action = 'HIT';
        reason = `SAC v1.4: TC +${tc.toFixed(1)}, ${dealerVal} very weak, absorb`;
        sacrificeIntent = 'WEAK_DEALER_ABSORB';
        confidence = 78;
        aggressionLevel = 55;
      } else {
        action = 'STAND';
        reason = `SAC v1.4: ${playerTotal} vs ${dealerVal}, let dealer bust`;
        sacrificeIntent = 'AWAIT_DEALER_BUST';
        confidence = 80;
      }
    }
    // TC -2 to +1.9: Neutral/slightly positive
    else if (tc >= -2) {
      if (playerTotal <= 11) {
        action = 'HIT';
        reason = `SAC v1.4: ${playerTotal} safe hit vs weak ${dealerVal}`;
        sacrificeIntent = 'SAFE_BUILD';
        confidence = 75;
        aggressionLevel = 35;
      } else {
        action = 'STAND';
        reason = `SAC v1.4: Dealer ${dealerVal} bust prob ${(bustProb*100).toFixed(0)}%, stand`;
        sacrificeIntent = 'LET_DEALER_BUST';
        confidence = 82;
      }
    }
    // TC < -2: Low count, many small cards remain
    else {
      action = 'STAND';
      reason = `SAC v1.4: TC ${tc.toFixed(1)} low, leave small cards for dealer`;
      sacrificeIntent = 'LEAVE_SMALL_FOR_DEALER';
      confidence = 88;
    }
  }

  // ============================================
  // STRONG DEALER (7-A) - LOW BUST PROBABILITY
  // Primary Strategy: AGGRESSIVE ABSORPTION
  // Take cards dealer needs to make 17-21
  // ============================================
  else if (dealerVal >= 7) {
    // Base aggression increases with dealer strength
    aggressionLevel = 50 + ((dealerVal - 7) * 8);

    // What does dealer need to reach 17+?
    const dealerNeeds = 17 - dealerVal;
    const dealerNeedsHigh = dealerVal >= 9; // 9, 10, A need small cards

    // TC >= +3: Ten-rich deck
    if (tc >= 3) {
      if (dealerNeedsHigh) {
        // Dealer 9/10/A needs 6-8 points, will likely get 10 and bust
        if (playerTotal <= 16) {
          action = 'HIT';
          reason = `SAC v1.4: TC +${tc.toFixed(1)}, absorb 10s before dealer ${dealerVal}`;
          sacrificeIntent = 'PREEMPTIVE_TEN_ABSORB';
          confidence = 85;
          aggressionLevel = 80;
        } else {
          action = 'STAND';
          reason = `SAC v1.4: ${playerTotal} good, dealer ${dealerVal} may bust on 10`;
          sacrificeIntent = 'TACTICAL_STAND';
          confidence = 78;
        }
      } else {
        // Dealer 7-8 needs 9-10 points, absorb what we can
        if (playerTotal <= 18) {
          action = 'HIT';
          reason = `SAC v1.4: TC +${tc.toFixed(1)}, max absorb vs ${dealerVal}`;
          sacrificeIntent = 'MAX_ABSORPTION';
          confidence = 82;
          aggressionLevel = 75;
        } else {
          action = 'STAND';
          reason = `SAC v1.4: ${playerTotal} strong, absorption complete`;
          sacrificeIntent = 'ABSORPTION_COMPLETE';
          confidence = 75;
        }
      }
    }
    // TC 0 to +2.9: Moderate ten count
    else if (tc >= 0) {
      if (playerTotal <= 15) {
        action = 'HIT';
        reason = `SAC v1.4: Dealer ${dealerVal} strong, aggressive absorb`;
        sacrificeIntent = 'AGGRESSIVE_ABSORB';
        confidence = 80;
        aggressionLevel = 70;
      } else if (playerTotal <= 17 && dealerVal >= 9) {
        action = 'HIT';
        reason = `SAC v1.4: Dealer ${dealerVal} very strong, max aggression`;
        sacrificeIntent = 'ULTRA_AGGRESSIVE';
        confidence = 75;
        aggressionLevel = 85;
      } else {
        action = 'STAND';
        reason = `SAC v1.4: ${playerTotal} vs ${dealerVal}, tactical stand`;
        sacrificeIntent = 'TACTICAL_STAND';
        confidence = 72;
      }
    }
    // TC < 0: Small card rich
    else if (tc >= -2) {
      // Dealer needs small cards, absorb them!
      if (playerTotal <= 19) {
        action = 'HIT';
        reason = `SAC v1.4: TC ${tc.toFixed(1)}, absorb small cards dealer needs`;
        sacrificeIntent = 'ABSORB_SMALL_CARDS';
        confidence = 88;
        aggressionLevel = 90;
      } else {
        action = 'STAND';
        reason = `SAC v1.4: ${playerTotal} near max, stand`;
        sacrificeIntent = 'NEAR_MAX_STAND';
        confidence = 80;
      }
    }
    // TC < -2: Very small card rich
    else {
      // Maximum aggression - absorb all small cards
      if (playerTotal <= 20) {
        action = 'HIT';
        reason = `SAC v1.4: TC ${tc.toFixed(1)} very low, max small card absorb`;
        sacrificeIntent = 'MAX_SMALL_ABSORB';
        confidence = 92;
        aggressionLevel = 95;
      }
    }
  }

  // ============================================
  // SPECIAL MODIFIERS v1.4
  // ============================================

  // SOFT HAND BONUS: Can hit more safely with Ace
  if (hand.soft && playerTotal <= 17 && action === 'STAND') {
    action = 'HIT';
    reason = `SAC v1.4: Soft ${playerTotal}, safe aggressive absorption`;
    sacrificeIntent = 'SOFT_HAND_ADVANTAGE';
    confidence = 85;
    aggressionLevel += 15;
  }

  // TEAM COORDINATION: If teammates absorbed many cards already
  if (cardsAbsorbed >= 10 && playerTotal >= 15 && action === 'HIT') {
    action = 'STAND';
    reason = `SAC v1.4: Team absorbed ${cardsAbsorbed} cards, preserve position`;
    sacrificeIntent = 'TEAM_SATURATION';
    confidence = 78;
    aggressionLevel -= 20;
  }

  // PENETRATION BONUS: Deep in shoe, more accurate decisions
  const penetration = (AppState.cardsDealt / AppState.totalCards) * 100;
  if (penetration > 50) {
    confidence += Math.min(10, (penetration - 50) / 5);
  }

  // EDGE CASE: Very low hand, always safe to hit
  if (playerTotal <= 8) {
    action = 'HIT';
    reason = `SAC v1.4: ${playerTotal} always hit, zero bust risk`;
    sacrificeIntent = 'ZERO_RISK_HIT';
    confidence = 95;
  }

  // ============================================
  // P5 SPECIAL: HARD 17+ DEALER BUST OVERRIDE
  // ============================================
  // P5 can hit on hard 17-20 when necessary to absorb cards
  // that would help the dealer make a hand
  if (isP5Sacrifice && playerTotal >= 17 && playerTotal <= 20 && !hand.soft) {
    const dealerNeedsToReach17 = 17 - dealerVal;

    // Conditions for P5 to hit on hard 17+:
    // 1. Dealer is strong (7-A) and needs specific cards
    // 2. TC is negative (small cards available that dealer needs)
    // 3. Dealer showing 7-8 (needs exactly 9-10 to make 17)
    // 4. High aggression situations

    let shouldHitHard17 = false;
    let hard17Reason = '';

    // Scenario 1: Dealer 7-8 at negative TC (small cards dealer needs)
    if ((dealerVal === 7 || dealerVal === 8) && tc < 0) {
      shouldHitHard17 = true;
      hard17Reason = `P5 H17+: Dealer ${dealerVal} needs small cards, TC ${tc.toFixed(1)} absorbing`;
      sacrificeIntent = 'P5_HARD17_SMALL_ABSORB';
    }
    // Scenario 2: Dealer 9-10-A at very negative TC (many small cards)
    else if (dealerVal >= 9 && tc <= -2) {
      shouldHitHard17 = true;
      hard17Reason = `P5 H17+: Dealer ${dealerVal} needs ${dealerNeedsToReach17}pts, TC ${tc.toFixed(1)} max absorb`;
      sacrificeIntent = 'P5_HARD17_MAX_ABSORB';
    }
    // Scenario 3: Dealer busting is unlikely (strong dealer + positive TC)
    else if (dealerVal >= 9 && tc >= 2 && playerTotal === 17) {
      shouldHitHard17 = true;
      hard17Reason = `P5 H17+: Dealer ${dealerVal} makes 19-21, sacrifice 17 to absorb 10`;
      sacrificeIntent = 'P5_HARD17_TEN_ABSORB';
    }
    // Scenario 4: Ultra-aggressive mode (high penetration, team needs help)
    else if (penetration > 60 && aggressionLevel >= 85 && playerTotal <= 18) {
      shouldHitHard17 = true;
      hard17Reason = `P5 H17+: Deep shoe aggression, sacrifice ${playerTotal} for team`;
      sacrificeIntent = 'P5_HARD17_TEAM_SACRIFICE';
    }

    if (shouldHitHard17) {
      action = 'HIT';
      reason = hard17Reason;
      confidence = Math.max(60, confidence - 15);  // Lower confidence for risky play
      aggressionLevel = 100;  // Maximum aggression
    }
  }

  return {
    action: action,
    reason: reason,
    confidence: Math.min(99, Math.round(confidence)),
    isSacrifice: true,
    sacrificeIntent: sacrificeIntent,
    tcUsed: tc,
    rcUsed: rc,
    dealerBustProb: bustProb,
    aggressionLevel: aggressionLevel,
    tensDensity: tensDensity.toFixed(2),
    penetration: penetration.toFixed(1),
    version: '1.4_FULL',
    isP5HardHit: isP5Sacrifice && playerTotal >= 17
  };
}

// Get optimal decision for a player hand vs dealer upcard
function getOptimalDecision(playerCards, dealerUpcard) {
  const hand = analyzeHand(playerCards);
  const tc = getTrueCount();
  const dealerIdx = getDealerIndex(dealerUpcard);
  const dealerVal = dealerUpcard === 'A' ? 'A' : (parseInt(dealerUpcard) || 10);

  if (hand.total === 0 || !dealerUpcard) {
    return { action: null, reason: 'No cards dealt', confidence: 0 };
  }

  let action = 'H';
  let reason = 'Basic Strategy';
  let confidence = 85;
  let isDeviation = false;

  // Check Fab 4 surrender first (if surrender enabled)
  if (AppState.config?.fab4 !== false) {
    for (const fab of FAB_4) {
      if (String(hand.total) === fab.hand && String(dealerVal) === fab.dealer) {
        const passes = fab.dir === '>=' ? tc >= fab.tc : tc <= fab.tc;
        if (passes) {
          return {
            action: 'SURRENDER',
            reason: `Fab 4: ${hand.total} vs ${dealerVal} @ TC ${tc.toFixed(1)}`,
            confidence: 90,
            isDeviation: true
          };
        }
      }
    }
  }

  // Check Illustrious 18 deviations (if enabled)
  if (AppState.config?.illustrious18 !== false) {
    for (const dev of ILLUSTRIOUS_18) {
      // Check pair splits
      if (dev.hand === '10,10' && hand.isPair && hand.values[0] === 10) {
        if (String(dealerVal) === dev.dealer) {
          const passes = dev.dir === '>=' ? tc >= dev.tc :
                        dev.dir === '<=' ? tc <= dev.tc :
                        dev.dir === '<' ? tc < dev.tc : tc > dev.tc;
          if (passes) {
            action = dev.deviation === 'P' ? 'SPLIT' : dev.deviation;
            reason = `I18: Split 10s vs ${dealerVal} @ TC ${tc.toFixed(1)}`;
            confidence = 92;
            isDeviation = true;
            break;
          }
        }
      }
      // Check hard totals
      else if (String(hand.total) === dev.hand && !hand.isSoft) {
        if (String(dealerVal) === dev.dealer) {
          const passes = dev.dir === '>=' ? tc >= dev.tc :
                        dev.dir === '<=' ? tc <= dev.tc :
                        dev.dir === '<' ? tc < dev.tc : tc > dev.tc;
          if (passes) {
            action = dev.deviation === 'S' ? 'STAY' :
                    dev.deviation === 'H' ? 'HIT' :
                    dev.deviation === 'D' ? 'DBL' : dev.deviation;
            reason = `I18: ${hand.total} vs ${dealerVal} @ TC ${tc.toFixed(1)}`;
            confidence = 92;
            isDeviation = true;
            break;
          }
        }
      }
    }
  }

  // If no deviation, use basic strategy
  if (!isDeviation) {
    let strategyKey;

    // Check for pairs first
    if (hand.isPair && playerCards.length === 2) {
      const pairVal = playerCards[0] === 'A' ? 'A' : hand.values[0];
      strategyKey = `pair_${pairVal}`;
    }
    // Then soft hands
    else if (hand.isSoft) {
      strategyKey = `soft_${hand.total}`;
    }
    // Then hard hands
    else {
      strategyKey = `hard_${Math.min(21, Math.max(5, hand.total))}`;
    }

    const strategyRow = BASIC_STRATEGY[strategyKey];
    if (strategyRow && strategyRow[dealerIdx]) {
      const basicAction = strategyRow[dealerIdx];

      switch (basicAction) {
        case 'H': action = 'HIT'; break;
        case 'S': action = 'STAY'; break;
        case 'D': action = 'DBL'; break;
        case 'P': action = 'SPLIT'; break;
        case 'Ds': action = playerCards.length === 2 ? 'DBL' : 'STAY'; break;
        case 'Dh': action = playerCards.length === 2 ? 'DBL' : 'HIT'; break;
        default: action = 'HIT';
      }

      reason = `Basic: ${hand.isSoft ? 'Soft' : hand.isPair ? 'Pair' : 'Hard'} ${hand.total} vs ${dealerVal}`;
    }
  }

  // Adjust confidence based on true count reliability
  const decksRemaining = (AppState.totalCards - AppState.cardsDealt) / 52;
  if (decksRemaining > 4) confidence -= 5;
  if (Math.abs(tc) > 3) confidence += 5;

  return {
    action,
    reason,
    confidence: Math.min(98, Math.max(60, confidence)),
    isDeviation,
    handTotal: hand.total,
    isSoft: hand.isSoft,
    isPair: hand.isPair,
    trueCount: tc
  };
}

// Calculate optimal decision for a specific player position
function calculatePlayerDecision(playerNum) {
  const playerKey = `player${playerNum}`;
  const playerCards = AppState.positions[playerKey];
  const dealerCards = AppState.positions.dealer;

  if (!playerCards || playerCards.length < 2) {
    return { action: null, reason: 'Need 2+ cards', confidence: 0 };
  }

  const dealerUpcard = dealerCards.length > 0 ? dealerCards[0] : null;
  if (!dealerUpcard) {
    return { action: null, reason: 'No dealer upcard', confidence: 0 };
  }

  return getOptimalDecision(playerCards, dealerUpcard);
}

// Temporal recommendation
function getTemporalRec() {
  const ev = getAnyPairEV();
  const pen = getPenetration();

  if (ev < -0.05 && pen < 50) return 'EXIT';
  if (ev > 0.02) return 'STAY';
  return 'STAY';
}

// ============================================
// UNIFIED POST-DEAL DECISION ENGINE
// Combines all strategies into one recommendation
// ============================================

function getUnifiedDecision(playerNum) {
  const playerKey = `player${playerNum}`;
  const playerCards = AppState.positions[playerKey];
  const dealerCards = AppState.positions.dealer;

  if (!playerCards || playerCards.length < 2 || !dealerCards || dealerCards.length < 1) {
    return null;
  }

  const dealerUpcard = dealerCards[0];
  const hand = analyzeHand(playerCards);
  const tc = getTrueCount();
  const pen = getPenetration();

  // ===== GATHER ALL STRATEGY SIGNALS =====

  // 1. Basic Strategy + Illustrious 18 + Fab 4
  const basicDecision = getOptimalDecision(playerCards, dealerUpcard);

  // 2. Composition Metrics
  const pWin = getPWin();
  const ev = getEV();
  const pTens = getPTens();
  const pAces = getPAces();

  // 3. Any Pair Side Bet Analysis
  const anyPairProb = getAnyPairProb();
  const anyPairEV = getAnyPairEV();

  // 4. Window Detector
  const windowScore = getWindowScore();
  const windowDecision = getWindowDecision();

  // 5. Kelly Sizing
  const kellyFrac = getKellyFraction();

  // 6. Insurance Analysis (if dealer shows Ace)
  let insuranceRec = null;
  if (dealerUpcard === 'A') {
    insuranceRec = tc >= 3 ? 'TAKE' : 'DECLINE';
  }

  // 7. Risk Assessment
  const decksRemaining = (AppState.totalCards - AppState.cardsDealt) / 52;
  const countReliability = decksRemaining <= 2 ? 'HIGH' : decksRemaining <= 4 ? 'MEDIUM' : 'LOW';

  // ===== CALCULATE EDGE & CONFIDENCE =====

  // Base confidence from basic strategy
  let confidence = basicDecision.confidence;

  // Adjust confidence based on count reliability
  if (countReliability === 'HIGH') confidence += 5;
  if (countReliability === 'LOW') confidence -= 10;

  // Adjust for deviation plays
  if (basicDecision.isDeviation) {
    confidence += Math.abs(tc) >= 3 ? 5 : -3;
  }

  // Calculate player edge
  const houseEdge = 0.005; // Base 0.5% house edge
  const countAdvantage = tc * 0.005; // ~0.5% per true count
  const playerEdge = countAdvantage - houseEdge;

  // ===== BETTING RECOMMENDATION =====

  let betAction = 'MIN';
  let betMultiplier = 1;
  let betReason = 'Neutral count';

  if (tc >= 2) {
    betMultiplier = Math.min(12, Math.pow(2, tc - 1));
    betAction = tc >= 4 ? 'MAX' : 'INCREASE';
    betReason = `+EV: TC ${tc >= 0 ? '+' : ''}${tc.toFixed(1)}`;
  } else if (tc <= -2) {
    betAction = 'MIN';
    betMultiplier = 1;
    betReason = `Negative count: TC ${tc.toFixed(1)}`;
  }

  // ===== SIDE BET RECOMMENDATIONS =====

  const sideBets = {
    anyPair: {
      recommend: anyPairEV > 0,
      ev: anyPairEV,
      reason: anyPairEV > 0 ? `+EV: ${(anyPairEV * 100).toFixed(2)}%` : 'Negative EV'
    },
    insurance: insuranceRec ? {
      recommend: insuranceRec === 'TAKE',
      reason: insuranceRec === 'TAKE' ? `TC ≥ +3 (${tc.toFixed(1)})` : `TC < +3 (${tc.toFixed(1)})`
    } : null
  };

  // ===== AGGREGATE PLAY SIGNALS =====

  const signals = [];

  // Add basic strategy signal
  signals.push({
    source: basicDecision.isDeviation ? 'I18' : 'BASIC',
    action: basicDecision.action,
    weight: basicDecision.isDeviation ? 95 : 85,
    reason: basicDecision.reason
  });

  // Add composition signal if significant
  if (Math.abs(ev) > 0.02) {
    const compAction = ev > 0.02 ? 'AGGRESSIVE' : 'CONSERVATIVE';
    signals.push({
      source: 'COMP',
      action: compAction,
      weight: 60,
      reason: `EV: ${(ev * 100).toFixed(2)}%`
    });
  }

  // Add count-based signal
  if (Math.abs(tc) >= 2) {
    signals.push({
      source: 'COUNT',
      action: tc > 0 ? 'AGGRESSIVE' : 'CONSERVATIVE',
      weight: 70 + Math.min(20, Math.abs(tc) * 5),
      reason: `TC: ${tc >= 0 ? '+' : ''}${tc.toFixed(1)}`
    });
  }

  // ===== FINAL UNIFIED DECISION =====

  // Primary action from basic strategy (with deviations)
  let primaryAction = basicDecision.action;
  let overrideReason = null;

  // ===== POST-DEAL OVERRIDE LOGIC (Top 2-5 Cards Analysis) =====
  const dealerVal = getValue(dealerUpcard);
  const isHard = !hand.isSoft;
  const total = hand.total;

  // Get top 2-5 cards (positions 2-5 in sorted list)
  const topRanks = getTopRankedCards(5);
  const top2to5 = topRanks.slice(1, 5); // indices 1-4 = positions 2-5

  // Check if surrender is enabled
  const surrenderEnabled = AppState.quantEvSettings.surrenderEnabled !== false;

  // ===== SURRENDER STRATEGY (checked first) =====
  if (surrenderEnabled && isHard) {
    // Hard 16 vs 9, 10, A - SURRENDER (unless Top 2-5 override applies)
    if (total === 16 && (dealerVal === 9 || dealerVal === 10 || dealerVal === 11)) {
      const bustCards16 = ['6', '7', '8', '9'];
      const hasBustCards = bustCards16.some(card => top2to5.includes(card));
      if (hasBustCards && AppState.quantEvSettings.postDealOverrideEnabled !== false) {
        // Top 2-5 override - STAY instead of surrender
        primaryAction = 'STAY';
        overrideReason = `OVERRIDE: Hard 16 vs ${dealerVal} - STAY (Top 2-5 has ${bustCards16.filter(c => top2to5.includes(c)).join(',')})`;
        console.log(`[QEV Override] ${overrideReason}`);
      } else {
        // Standard surrender
        primaryAction = 'SURRENDER';
        overrideReason = `SURRENDER: Hard 16 vs ${dealerVal === 11 ? 'A' : dealerVal}`;
        console.log(`[QEV Surrender] ${overrideReason}`);
      }
    }
    // Hard 15 vs 10 - SURRENDER (unless Top 2-5 override applies)
    else if (total === 15 && dealerVal === 10) {
      const bustCards15 = ['7', '8', '9'];
      const hasBustCards = bustCards15.some(card => top2to5.includes(card));
      if (hasBustCards && AppState.quantEvSettings.postDealOverrideEnabled !== false) {
        // Top 2-5 override - STAY instead of surrender
        primaryAction = 'STAY';
        overrideReason = `OVERRIDE: Hard 15 vs 10 - STAY (Top 2-5 has ${bustCards15.filter(c => top2to5.includes(c)).join(',')})`;
        console.log(`[QEV Override] ${overrideReason}`);
      } else {
        // Standard surrender
        primaryAction = 'SURRENDER';
        overrideReason = `SURRENDER: Hard 15 vs 10`;
        console.log(`[QEV Surrender] ${overrideReason}`);
      }
    }
    // Hard 15 vs 9 - Check Top 2-5 override only (no surrender vs 9)
    else if (total === 15 && dealerVal === 9 && primaryAction === 'HIT') {
      const bustCards15 = ['7', '8', '9'];
      const hasBustCards = bustCards15.some(card => top2to5.includes(card));
      if (hasBustCards && AppState.quantEvSettings.postDealOverrideEnabled !== false) {
        primaryAction = 'STAY';
        overrideReason = `OVERRIDE: Hard 15 vs 9 - STAY (Top 2-5 has ${bustCards15.filter(c => top2to5.includes(c)).join(',')})`;
        console.log(`[QEV Override] ${overrideReason}`);
      }
    }
  } else if (isHard && AppState.quantEvSettings.postDealOverrideEnabled !== false) {
    // Surrender disabled - only apply Top 2-5 override
    // Condition 1: Hard 15 vs Dealer 9 or 10 - Override HIT to STAY if 7,8,9 in top 2-5
    if (total === 15 && (dealerVal === 9 || dealerVal === 10) && primaryAction === 'HIT') {
      const bustCards15 = ['7', '8', '9'];
      const hasBustCards = bustCards15.some(card => top2to5.includes(card));
      if (hasBustCards) {
        primaryAction = 'STAY';
        overrideReason = `OVERRIDE: Hard 15 vs ${dealerVal} - STAY (Top 2-5 has ${bustCards15.filter(c => top2to5.includes(c)).join(',')})`;
        console.log(`[QEV Override] ${overrideReason}`);
      }
    }

    // Condition 2: Hard 16 vs Dealer 9 or 10 - Override HIT to STAY if 6,7,8,9 in top 2-5
    if (total === 16 && (dealerVal === 9 || dealerVal === 10) && primaryAction === 'HIT') {
      const bustCards16 = ['6', '7', '8', '9'];
      const hasBustCards = bustCards16.some(card => top2to5.includes(card));
      if (hasBustCards) {
        primaryAction = 'STAY';
        overrideReason = `OVERRIDE: Hard 16 vs ${dealerVal} - STAY (Top 2-5 has ${bustCards16.filter(c => top2to5.includes(c)).join(',')})`;
        console.log(`[QEV Override] ${overrideReason}`);
      }
    }
  }

  // ===== NEW OVERRIDE: No 10s in P1-P4 hands =====
  // If P5 has Hard 15/16, QEV says HIT, but NO 10-ranked cards dealt to P1-P4, override to STAY
  // Logic: No 10s visible in P1-P4 means higher 10 concentration remaining = dangerous to hit
  if (isHard && (total === 15 || total === 16) && primaryAction === 'HIT' && !overrideReason) {
    if (AppState.quantEvSettings.postDealOverrideEnabled !== false) {
      // Check P1-P4 cards for any 10-ranked cards (10, J, Q, K)
      const tensInP1P4 = checkTensInP1P4Hands();
      if (!tensInP1P4.hasTens) {
        primaryAction = 'STAY';
        overrideReason = `OVERRIDE: Hard ${total} - STAY (No 10s in P1-P4: ${tensInP1P4.cardsChecked} cards checked)`;
        console.log(`[QEV Override] ${overrideReason}`);
      }
    }
  }

  // Determine play aggressiveness
  let playStyle = 'STANDARD';
  if (tc >= 3 && pWin > 0.45) playStyle = 'AGGRESSIVE';
  if (tc <= -2 || pWin < 0.38) playStyle = 'CONSERVATIVE';

  // Build unified recommendation
  const unified = {
    // Core Decision
    action: primaryAction,
    confidence: Math.min(98, Math.max(50, confidence)),

    // Hand Info
    hand: {
      total: hand.total,
      isSoft: hand.isSoft,
      isPair: hand.isPair,
      cards: playerCards.join(' ')
    },

    // Strategy Sources
    strategy: {
      source: overrideReason ? 'POST_DEAL_OVERRIDE' : (basicDecision.isDeviation ? 'ILLUSTRIOUS_18' : 'BASIC_STRATEGY'),
      isDeviation: basicDecision.isDeviation,
      isOverride: !!overrideReason,
      reason: overrideReason || basicDecision.reason,
      top2to5: top2to5
    },

    // Count Analysis
    count: {
      running: AppState.runningCount,
      true: tc,
      reliability: countReliability,
      decksRemaining: decksRemaining.toFixed(1)
    },

    // Edge Calculation
    edge: {
      player: (playerEdge * 100).toFixed(3) + '%',
      isPositive: playerEdge > 0,
      pWin: (pWin * 100).toFixed(1) + '%'
    },

    // Betting Recommendation
    betting: {
      action: betAction,
      multiplier: betMultiplier,
      reason: betReason,
      kelly: kellyFrac.toFixed(3)
    },

    // Side Bets
    sideBets: sideBets,

    // Play Style
    style: playStyle,

    // Window Score
    window: {
      score: Math.round(windowScore),
      decision: windowDecision
    },

    // All Signals (for transparency)
    signals: signals,

    // Timestamp
    timestamp: Date.now()
  };

  return unified;
}

// Get formatted display string for unified decision
function getUnifiedDecisionDisplay(playerNum) {
  const decision = getUnifiedDecision(playerNum);
  if (!decision) return null;

  const actionLabels = {
    'HIT': 'HIT',
    'STAY': 'STAND',
    'DBL': 'DOUBLE',
    'SPLIT': 'SPLIT',
    'SURRENDER': 'SURRENDER'
  };

  return {
    action: actionLabels[decision.action] || decision.action,
    shortAction: decision.action === 'STAY' ? 'S' :
                 decision.action === 'HIT' ? 'H' :
                 decision.action === 'DBL' ? 'D' :
                 decision.action === 'SPLIT' ? 'P' :
                 decision.action === 'SURRENDER' ? 'R' : '?',
    confidence: decision.confidence,
    isDeviation: decision.strategy.isDeviation,
    source: decision.strategy.source,
    edge: decision.edge.player,
    isPositive: decision.edge.isPositive,
    betAction: decision.betting.action,
    betMultiplier: decision.betting.multiplier,
    style: decision.style,
    tc: decision.count.true,
    reason: decision.strategy.reason
  };
}

// Update the unified decision panel for all players
function updateUnifiedDecisions() {
  const dealerCards = AppState.positions.dealer;
  if (!dealerCards || dealerCards.length < 1) return;

  for (let i = 1; i <= 8; i++) {
    const playerCards = AppState.positions[`player${i}`];
    if (!playerCards || playerCards.length < 2) continue;

    const decision = getUnifiedDecision(i);
    if (decision) {
      updatePlayerDecisionDisplay(i, decision);
    }
  }
}

// Update individual player decision display
function updatePlayerDecisionDisplay(playerNum, decision) {
  const box = document.getElementById(`player${playerNum}`);
  if (!box) return;

  // Find or create the unified decision indicator
  let indicator = box.querySelector('.unified-decision');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'unified-decision';
    box.appendChild(indicator);
  }

  // Build the display
  const actionClass = decision.action === 'HIT' ? 'hit' :
                      decision.action === 'STAY' ? 'stay' :
                      decision.action === 'DBL' ? 'double' :
                      decision.action === 'SPLIT' ? 'split' :
                      decision.action === 'SURRENDER' ? 'surrender' : '';

  const shortAction = decision.action === 'STAY' ? 'S' :
                      decision.action === 'HIT' ? 'H' :
                      decision.action === 'DBL' ? 'D' :
                      decision.action === 'SPLIT' ? 'P' :
                      decision.action === 'SURRENDER' ? 'R' : '?';

  const edgeClass = decision.edge.isPositive ? 'positive' : 'negative';
  const styleIcon = decision.style === 'AGGRESSIVE' ? '▲' :
                    decision.style === 'CONSERVATIVE' ? '▼' : '●';

  indicator.className = `unified-decision ${actionClass} ${decision.strategy.isDeviation ? 'deviation' : ''}`;
  indicator.innerHTML = `
    <div class="ud-main">
      <span class="ud-action">${shortAction}</span>
      <span class="ud-confidence">${decision.confidence}%</span>
    </div>
    <div class="ud-details">
      <span class="ud-edge ${edgeClass}">${decision.edge.player}</span>
      <span class="ud-style">${styleIcon}</span>
      ${decision.strategy.isDeviation ? '<span class="ud-i18">I18</span>' : ''}
    </div>
    <div class="ud-bet">
      <span class="ud-bet-action">${decision.betting.action}</span>
      <span class="ud-bet-mult">×${decision.betting.multiplier}</span>
    </div>
  `;
  indicator.title = `${decision.strategy.reason}\nEdge: ${decision.edge.player} | TC: ${decision.count.true.toFixed(1)}\nBet: ${decision.betting.reason}`;
}

// Composition bias active
function isCompBiasActive() {
  const sScore = Math.abs(getSScore());
  return AppState.numDecks >= 4 && sScore > 0.012;
}

// ============================================
// Bead Road Functions
// ============================================
function addBeadRoad(rank) {
  const grid = document.getElementById('beadRoadGrid');
  if (!grid) return;

  const bead = document.createElement('div');
  bead.className = 'bead-item';

  // Determine color based on rank
  // 2-6 = RED (low cards)
  // 7-9 = BLUE (neutral)
  // 10, J, Q, K, A = GREEN (high cards)
  const normalizedRank = normalizeRank(rank);
  let color = '';
  let label = '';

  if (['2', '3', '4', '5', '6'].includes(normalizedRank)) {
    color = 'red';
    label = normalizedRank;
  } else if (['7', '8', '9'].includes(normalizedRank)) {
    color = 'blue';
    label = normalizedRank;
  } else {
    // 10, J, Q, K, A
    color = 'green';
    label = normalizedRank === '10' ? 'T' : normalizedRank;
  }

  bead.classList.add(color);
  bead.textContent = label;
  bead.title = `Card: ${rank}`;

  grid.appendChild(bead);

  // Auto-scroll to bottom
  grid.scrollTop = grid.scrollHeight;
}

function clearBeadRoad() {
  const grid = document.getElementById('beadRoadGrid');
  if (grid) {
    grid.innerHTML = '';
  }
  showToast('Bead Road cleared', 'info');
}

// UI Update Functions
// ============================================
function updateAll() {
  updateCountDisplays();
  updateRankTable();
  updateStatBoxes();
  updatePositionCards();
  updateMetrics();
  updateCardButtons();
  updateDecisionPanels();
}

function updateCountDisplays() {
  setText('runningCount', AppState.runningCount);
  setText('trueCount', getTrueCount().toFixed(2));
}

function updateRankTable() {
  const remaining = getCardsRemaining();

  // Get all ranks with their counts and sort by count (highest to lowest)
  const ranks = ['10', '2', '3', '4', '5', '6', '7', '8', '9', 'A'];
  const ranksWithCounts = ranks.map(rank => ({
    rank: rank,
    seen: AppState.rankSeen[rank],
    left: AppState.rankCounts[rank],
    pct: remaining > 0 ? Math.round((AppState.rankCounts[rank] / AppState.initialCounts[rank]) * 100) : 0
  }));

  // Sort by cards left (highest to lowest)
  ranksWithCounts.sort((a, b) => b.left - a.left);

  // Store top 5 ranks for override logic
  AppState.topRankedCards = ranksWithCounts.slice(0, 5).map(r => r.rank);

  // Update the sorted rank display
  const rankTable = document.querySelector('.rank-table');
  if (rankTable) {
    // Keep header, rebuild rows
    const header = rankTable.querySelector('.rank-header');
    rankTable.innerHTML = '';
    if (header) rankTable.appendChild(header);

    ranksWithCounts.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'rank-row';
      if (item.rank === '10') row.classList.add('tens-row');

      // Highlight TOP 2-5 (indices 1-4, since index 0 is #1)
      const isTop = index >= 1 && index <= 4;
      const isTopOne = index === 0;

      row.innerHTML = `
        <span class="rank-label" style="${isTop ? 'font-size:14px;font-weight:bold;color:#22d3ee;' : ''} ${isTopOne ? 'font-size:16px;font-weight:bold;color:#f59e0b;' : ''}">${item.rank}</span>
        <span id="seen${item.rank}" class="rank-seen" style="${isTop ? 'font-size:14px;font-weight:bold;' : ''} ${isTopOne ? 'font-size:16px;font-weight:bold;' : ''}">${item.seen}</span>
        <span id="left${item.rank}" class="rank-left" style="${isTop ? 'font-size:14px;font-weight:bold;color:#22d3ee;' : ''} ${isTopOne ? 'font-size:16px;font-weight:bold;color:#f59e0b;' : ''}">${item.left}</span>
        <span id="pct${item.rank}" class="rank-pct" style="${isTop ? 'font-size:14px;font-weight:bold;' : ''} ${isTopOne ? 'font-size:16px;font-weight:bold;' : ''}">${item.pct}</span>
      `;
      rankTable.appendChild(row);
    });
  }
}

// Get top N ranked cards by remaining count
function getTopRankedCards(n = 5) {
  const ranks = ['10', '2', '3', '4', '5', '6', '7', '8', '9', 'A'];
  const ranksWithCounts = ranks.map(rank => ({
    rank: rank,
    left: AppState.rankCounts[rank]
  }));
  ranksWithCounts.sort((a, b) => b.left - a.left);
  return ranksWithCounts.slice(0, n).map(r => r.rank);
}

// Check if bust cards are in top N ranks (for override logic)
function checkBustCardsInTop(bustCards, topN = 5) {
  const topRanks = getTopRankedCards(topN);
  // Check positions 2-5 (indices 1-4) for bust cards
  const top2to5 = topRanks.slice(1, 5);
  return bustCards.some(card => top2to5.includes(card));
}

// Check if any 10-ranked cards (10, J, Q, K) were dealt to P1-P4
// Used for P5 override: if no 10s in P1-P4, stay on Hard 15/16
function checkTensInP1P4Hands() {
  const tensRanks = ['10', 'J', 'Q', 'K'];
  let hasTens = false;
  let cardsChecked = 0;
  let tensFound = [];

  // Check P1-P4 hands (before P5's turn)
  for (let p = 1; p <= 4; p++) {
    const cards = AppState.positions[`player${p}`] || [];
    cardsChecked += cards.length;

    for (const card of cards) {
      // Extract rank from card (e.g., "10♠" -> "10", "K♥" -> "K")
      const rank = card.replace(/[♠♥♦♣]/g, '');
      if (tensRanks.includes(rank)) {
        hasTens = true;
        tensFound.push(card);
      }
    }
  }

  return {
    hasTens: hasTens,
    cardsChecked: cardsChecked,
    tensFound: tensFound
  };
}

function updateStatBoxes() {
  setText('acesLeft', AppState.rankCounts['A']);
  setText('pairsCount', AppState.pairsWon);
  setText('cardsSeen', `${AppState.cardsDealt}/${AppState.totalCards}`);
}

function updatePositionCards(singlePos = null) {
  const positionsToUpdate = singlePos ? [singlePos] : Object.keys(AppState.positions);

  for (const pos of positionsToUpdate) {
    const cards = AppState.positions[pos] || [];

    // Find the position cards container
    let container;
    if (pos === 'dealer') {
      container = document.getElementById('dealerCards');
    } else {
      const box = document.getElementById(pos);
      container = box?.querySelector('.position-cards');
    }

    // Check if this player has split hands
    const playerNum = pos.replace('player', '');
    const split = AppState.splitHands[playerNum];

    if (container) {
      if (split && split.hand1 && split.hand2) {
        // Show split hands in the position cards area (always show if split exists)
        const hand1Total = calculateHandTotal(split.hand1);
        const hand2Total = calculateHandTotal(split.hand2);

        container.innerHTML = `
          <div class="split-cards-display">
            <div class="split-mini-hand">
              ${split.hand1.map(c => `<span class="card-chip-mini">${c}</span>`).join('')}
              <span class="split-mini-total">${hand1Total}</span>
            </div>
            <span class="split-cards-divider">|</span>
            <div class="split-mini-hand">
              ${split.hand2.map(c => `<span class="card-chip-mini">${c}</span>`).join('')}
              <span class="split-mini-total">${hand2Total}</span>
            </div>
          </div>
        `;
      } else {
        // Normal cards display
        container.innerHTML = cards.map(c => {
          const isRed = ['A', '2', '3', '4', '5', '6', '7', '8', '9'].includes(c) && Math.random() > 0.5;
          return `<span class="card-chip ${isRed ? 'red' : ''}">${c}</span>`;
        }).join('');
      }
    }

    // Update badge with hand total (not card count)
    const badge = pos === 'dealer'
      ? document.getElementById('dealerBadge')
      : document.getElementById(pos)?.querySelector('.position-badge');

    const playerBox = document.getElementById(pos);

    if (badge) {
      if (split && split.hand1 && split.hand2) {
        // Show combined totals for split
        const hand1Total = calculateHandTotal(split.hand1);
        const hand2Total = calculateHandTotal(split.hand2);
        const h1Display = hand1Total > 21 ? 'BUST' : hand1Total;
        const h2Display = hand2Total > 21 ? 'BUST' : hand2Total;
        badge.textContent = `${h1Display}|${h2Display}`;
        // Add bust class if either hand is bust
        if (playerBox && pos !== 'dealer') {
          playerBox.classList.toggle('bust', hand1Total > 21 || hand2Total > 21);
        }
      } else {
        const handTotal = calculateHandTotal(cards);
        if (handTotal > 21) {
          badge.textContent = 'BUST';
          badge.classList.add('bust');
          if (playerBox && pos !== 'dealer') {
            playerBox.classList.add('bust');
          }
        } else {
          badge.textContent = handTotal;
          badge.classList.remove('bust');
          if (playerBox && pos !== 'dealer') {
            playerBox.classList.remove('bust');
          }
        }
      }
    }
  }

  // Update dealer cards panel on the left side
  updateDealerCardsPanel();
}

function updateDealerCardsPanel() {
  const dealerCards = AppState.positions.dealer;
  const container = document.getElementById('dealerCardsLeft');
  const totalEl = document.getElementById('dealerTotal');

  if (container) {
    if (dealerCards.length === 0) {
      container.innerHTML = '<span class="no-cards">—</span>';
    } else {
      container.innerHTML = dealerCards.map(c => {
        const isRed = ['A'].includes(c) || Math.random() > 0.5;
        return `<span class="card-chip ${isRed ? 'red' : ''}">${c}</span>`;
      }).join('');
    }
  }

  if (totalEl) {
    const total = calculateHandTotal(dealerCards);
    if (total > 21) {
      totalEl.textContent = 'BUST';
      totalEl.classList.add('bust');
    } else {
      totalEl.textContent = total;
      totalEl.classList.remove('bust');
    }
  }

  // Update dealer badge on the table
  const dealerBadge = document.getElementById('dealerBadge');
  const dealerBox = document.getElementById('dealer');
  const dealerTotal = calculateHandTotal(dealerCards);

  if (dealerBadge) {
    if (dealerTotal > 21) {
      dealerBadge.textContent = 'BUST';
      dealerBadge.classList.add('bust');
    } else {
      dealerBadge.textContent = dealerTotal;
      dealerBadge.classList.remove('bust');
    }
  }

  if (dealerBox) {
    if (dealerTotal > 21) {
      dealerBox.classList.add('bust');
    } else {
      dealerBox.classList.remove('bust');
    }
  }
}

function calculateHandTotal(cards) {
  if (cards.length === 0) return 0;

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

  // Adjust for aces
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function updateDealerHistory() {
  const container = document.getElementById('dealerHistoryList');
  const countEl = document.getElementById('roundCount');

  if (countEl) {
    countEl.textContent = AppState.dealerHistory.length;
  }

  if (!container) return;

  if (AppState.dealerHistory.length === 0) {
    container.innerHTML = '<div class="no-history">No rounds yet</div>';
    return;
  }

  container.innerHTML = AppState.dealerHistory.map(entry => {
    const cardsHtml = entry.cards.map(c => {
      const isRed = ['A'].includes(c) || Math.random() > 0.6;
      return `<span class="mini-card${isRed ? ' red' : ''}">${c}</span>`;
    }).join('');

    const isBust = entry.total > 21;

    return `
      <div class="history-round">
        <span class="history-round-num">#${entry.round}</span>
        <div class="history-cards">${cardsHtml}</div>
        <span class="history-total${isBust ? ' bust' : ''}">${entry.total}</span>
      </div>
    `;
  }).join('');
}

function updateMetrics() {
  // Composition Metrics
  setText('pWin', (getPWin() * 100).toFixed(1) + '%');
  setText('evValue', (getEV() * 100).toFixed(2) + '%');
  setText('sScore', getSScore().toFixed(4));
  setText('penetration', getPenetration().toFixed(1) + '%');
  setText('penDesc', `${(AppState.cardsDealt / 52).toFixed(1)} / ${AppState.numDecks} decks seen`);
  setText('pTens', (getPTens() * 100).toFixed(1) + '%');
  setText('pAces', (getPAces() * 100).toFixed(1) + '%');
  setText('p7A', (getP7A() * 100).toFixed(1) + '%');

  // Comp bias
  const compBiasEl = document.getElementById('compBias');
  if (compBiasEl) {
    if (isCompBiasActive()) {
      compBiasEl.textContent = 'Active';
      compBiasEl.className = 'metric-value decision-bet';
    } else {
      compBiasEl.textContent = 'Inactive';
      compBiasEl.className = 'metric-value status-inactive';
    }
  }

  // Probability Engines
  setText('anyPairProb', (getAnyPairProb() * 100).toFixed(2) + '%');
  setText('anyPairEV', getAnyPairEV().toFixed(4));
  setText('seatAdj', getSeatAdjustment().toFixed(4));

  // Window detector
  const decision = getWindowDecision();
  const decisionEl = document.getElementById('windowDecision');
  if (decisionEl) {
    decisionEl.textContent = decision;
    decisionEl.className = `metric-value ${decision === 'BET' ? 'decision-bet' : 'decision-no-bet'}`;
  }

  setText('windowScore', Math.round(getWindowScore()));
  setText('kellyFrac', getKellyFraction().toFixed(2));
  setText('t21p3EV', get21P3EV().toFixed(4));
  setText('temporalRec', getTemporalRec());
}

function updateCardButtons() {
  document.querySelectorAll('.card-btn').forEach(btn => {
    const card = btn.dataset.card;
    const rank = normalizeRank(card);
    const remaining = AppState.rankCounts[rank] || 0;

    if (remaining <= 0) {
      btn.classList.add('depleted');
    } else {
      btn.classList.remove('depleted');
    }
  });
}

// ============================================
// Navigation & Config
// ============================================
function handleNavTab(tab) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');

  // Hide all pages first
  document.getElementById('configPage').style.display = 'none';
  document.getElementById('roomsPage').style.display = 'none';
  document.getElementById('playersPage').style.display = 'none';

  // Show corresponding page
  if (tab === 'config') {
    document.getElementById('configPage').style.display = 'block';
    renderConfigCards();
  } else if (tab === 'rooms') {
    document.getElementById('roomsPage').style.display = 'block';
    renderRoomCards();
  } else if (tab === 'players') {
    document.getElementById('playersPage').style.display = 'block';
    renderPlayersPage();
  } else if (tab === 'game') {
    // Game tab is the default, no special handling needed
  }
}

function applyConfig() {
  AppState.config.anyPairPayout = parseInt(document.getElementById('anyPairPayout')?.value) || 12;
  AppState.config.seatAlpha = parseFloat(document.getElementById('seatAlpha')?.value) || 0.04;
  AppState.config.windowScoreThreshold = parseInt(document.getElementById('windowScoreThreshold')?.value) || 65;
  AppState.config.kellyFraction = parseFloat(document.getElementById('kellyFraction')?.value) || 0.50;
  AppState.config.cbsK = parseFloat(document.getElementById('cbsK')?.value) || 0.45;

  updateAll();
  showToast('Configuration applied', 'success');
}

function resetConfig() {
  document.getElementById('anyPairPayout').value = '12';
  document.getElementById('seatAlpha').value = '0.04';
  document.getElementById('windowScoreThreshold').value = '65';
  document.getElementById('kellyFraction').value = '0.50';
  document.getElementById('cbsK').value = '0.45';

  applyConfig();
  showToast('Configuration reset', 'info');
}

function handleClearCache() {
  if (confirm('Clear all cached data?')) {
    localStorage.clear();
    showToast('Cache cleared', 'success');
  }
}

// ============================================
// Casino Configuration Management
// ============================================
function renderConfigCards() {
  const container = document.getElementById('configCardsContainer');
  if (!container) return;

  container.innerHTML = '';

  AppState.casinoConfigs.forEach(config => {
    const isActive = config.id === AppState.activeConfigId;
    const card = document.createElement('div');
    card.className = `config-card${isActive ? ' active' : ''}`;
    card.innerHTML = `
      <div class="config-card-header">
        <span class="config-card-title">${config.name}</span>
        <div class="config-card-actions">
          <button class="btn-edit-config" data-id="${config.id}">Edit</button>
          ${!config.isDefault ? `<button class="btn-delete-config" data-id="${config.id}">Delete</button>` : ''}
        </div>
      </div>
      <div class="config-card-body">
        <div class="config-row-item">
          <span class="config-row-label">Decks:</span>
          <span class="config-row-value">${config.rules.decks}</span>
        </div>
        <div class="config-row-item">
          <span class="config-row-label">Dealer Hits S17:</span>
          <span class="config-row-value">${config.rules.dealerHitsS17 ? 'Yes' : 'No'}</span>
        </div>
        <div class="config-row-item">
          <span class="config-row-label">Double After Split:</span>
          <span class="config-row-value">${config.rules.doubleAfterSplit ? 'Yes' : 'No'}</span>
        </div>
        <div class="config-row-item">
          <span class="config-row-label">Surrender:</span>
          <span class="config-row-value">${config.rules.surrender ? 'Yes' : 'No'}</span>
        </div>
        <div class="config-row-item">
          <span class="config-row-label">Illustrious 18:</span>
          <span class="config-row-value ${config.rules.illustrious18 ? 'enabled' : 'disabled'}">${config.rules.illustrious18 ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div class="config-row-item">
          <span class="config-row-label">Fab 4:</span>
          <span class="config-row-value ${config.rules.fab4 ? 'enabled' : 'disabled'}">${config.rules.fab4 ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div class="config-row-item">
          <span class="config-row-label">Split Any Tens:</span>
          <span class="config-row-value ${config.rules.splitAnyTens ? 'enabled' : 'disabled'}">${config.rules.splitAnyTens ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div class="config-row-item">
          <span class="config-row-label">Multi-Split:</span>
          <span class="config-row-value ${config.rules.multiSplit ? 'enabled' : 'disabled'}">${config.rules.multiSplit ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div class="config-row-item">
          <span class="config-row-label">Max Pooled Bet:</span>
          <span class="config-row-value">${config.rules.maxPooledBet.toLocaleString()}</span>
        </div>
        <div class="config-row-item">
          <span class="config-row-label">Enabled Strategies:</span>
          <span class="config-row-value">${formatStrategy(config.rules.enabledStrategies)}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Update count
  setText('configCount', AppState.casinoConfigs.length);

  // Update active config name
  const activeConfig = AppState.casinoConfigs.find(c => c.id === AppState.activeConfigId);
  setText('activeConfigName', activeConfig?.name || 'Default');

  // Add event listeners to buttons
  container.querySelectorAll('.btn-edit-config').forEach(btn => {
    btn.addEventListener('click', () => openEditConfigModal(btn.dataset.id));
  });

  container.querySelectorAll('.btn-delete-config').forEach(btn => {
    btn.addEventListener('click', () => deleteConfig(btn.dataset.id));
  });
}

function formatStrategy(strategy) {
  const strategyMap = {
    'none': 'None',
    'quant_ev': 'Quant EV',
    'basic': 'Basic Strategy',
    'hi_lo': 'Hi-Lo Count',
    'full': 'Full Suite'
  };
  return strategyMap[strategy] || strategy;
}

function openCreateConfigModal() {
  AppState.editingConfigId = null;
  document.getElementById('configModalTitle').textContent = 'Create New Configuration';
  resetConfigForm();
  document.getElementById('configModal').style.display = 'flex';
}

function openEditConfigModal(configId) {
  const config = AppState.casinoConfigs.find(c => c.id === configId);
  if (!config) return;

  AppState.editingConfigId = configId;
  document.getElementById('configModalTitle').textContent = 'Edit Configuration';

  // Populate form
  document.getElementById('configName').value = config.name;
  document.getElementById('cfgDecks').value = config.rules.decks;
  document.getElementById('cfgDealerHitsS17').value = config.rules.dealerHitsS17 ? 'yes' : 'no';
  document.getElementById('cfgDoubleAfterSplit').value = config.rules.doubleAfterSplit ? 'yes' : 'no';
  document.getElementById('cfgSurrender').value = config.rules.surrender ? 'yes' : 'no';
  document.getElementById('cfgIllustrious18').value = config.rules.illustrious18 ? 'enabled' : 'disabled';
  document.getElementById('cfgFab4').value = config.rules.fab4 ? 'enabled' : 'disabled';
  document.getElementById('cfgSplitAnyTens').value = config.rules.splitAnyTens ? 'enabled' : 'disabled';
  document.getElementById('cfgMultiSplit').value = config.rules.multiSplit ? 'enabled' : 'disabled';
  document.getElementById('cfgMaxPooledBet').value = config.rules.maxPooledBet;
  document.getElementById('cfgEnabledStrategies').value = config.rules.enabledStrategies;

  document.getElementById('configModal').style.display = 'flex';
}

function closeConfigModal() {
  document.getElementById('configModal').style.display = 'none';
  AppState.editingConfigId = null;
}

// ============================================
// Formula Modal Functions
// ============================================
function openFormulaModal() {
  document.getElementById('formulaModal').style.display = 'flex';
}

function closeFormulaModal() {
  document.getElementById('formulaModal').style.display = 'none';
}

function setupFormulaModalTabs() {
  const tabs = document.querySelectorAll('.formula-tab');
  const sections = document.querySelectorAll('.formula-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs and sections
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      // Add active to clicked tab and corresponding section
      tab.classList.add('active');
      const sectionId = `section-${tab.dataset.tab}`;
      document.getElementById(sectionId)?.classList.add('active');
    });
  });
}

function resetConfigForm() {
  document.getElementById('configName').value = '';
  document.getElementById('cfgDecks').value = '8';
  document.getElementById('cfgDealerHitsS17').value = 'no';
  document.getElementById('cfgDoubleAfterSplit').value = 'no';
  document.getElementById('cfgSurrender').value = 'no';
  document.getElementById('cfgIllustrious18').value = 'enabled';
  document.getElementById('cfgFab4').value = 'enabled';
  document.getElementById('cfgSplitAnyTens').value = 'disabled';
  document.getElementById('cfgMultiSplit').value = 'disabled';
  document.getElementById('cfgMaxPooledBet').value = '50000';
  document.getElementById('cfgEnabledStrategies').value = 'none';
}

function saveConfig() {
  const name = document.getElementById('configName').value.trim();
  if (!name) {
    showToast('Please enter a configuration name', 'warning');
    return;
  }

  const rules = {
    decks: parseInt(document.getElementById('cfgDecks').value),
    dealerHitsS17: document.getElementById('cfgDealerHitsS17').value === 'yes',
    doubleAfterSplit: document.getElementById('cfgDoubleAfterSplit').value === 'yes',
    surrender: document.getElementById('cfgSurrender').value === 'yes',
    illustrious18: document.getElementById('cfgIllustrious18').value === 'enabled',
    fab4: document.getElementById('cfgFab4').value === 'enabled',
    splitAnyTens: document.getElementById('cfgSplitAnyTens').value === 'enabled',
    multiSplit: document.getElementById('cfgMultiSplit').value === 'enabled',
    maxPooledBet: parseInt(document.getElementById('cfgMaxPooledBet').value),
    enabledStrategies: document.getElementById('cfgEnabledStrategies').value
  };

  if (AppState.editingConfigId) {
    // Update existing
    const config = AppState.casinoConfigs.find(c => c.id === AppState.editingConfigId);
    if (config) {
      config.name = name;
      config.rules = rules;
      showToast(`Configuration "${name}" updated`, 'success');
    }
  } else {
    // Create new
    const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    AppState.casinoConfigs.push({
      id,
      name,
      isDefault: false,
      rules
    });
    showToast(`Configuration "${name}" created`, 'success');
  }

  saveCasinoConfigsToStorage();
  closeConfigModal();
  renderConfigCards();
}

function deleteConfig(configId) {
  const config = AppState.casinoConfigs.find(c => c.id === configId);
  if (!config || config.isDefault) {
    showToast('Cannot delete default configuration', 'error');
    return;
  }

  if (confirm(`Delete configuration "${config.name}"?`)) {
    AppState.casinoConfigs = AppState.casinoConfigs.filter(c => c.id !== configId);

    // If deleted config was active, switch to default
    if (AppState.activeConfigId === configId) {
      AppState.activeConfigId = 'default';
      applyActiveConfig();
    }

    saveCasinoConfigsToStorage();
    renderConfigCards();
    showToast(`Configuration "${config.name}" deleted`, 'success');
  }
}

function activateConfig(configId) {
  const config = AppState.casinoConfigs.find(c => c.id === configId);
  if (!config) return;

  AppState.activeConfigId = configId;
  applyActiveConfig();
  saveCasinoConfigsToStorage();
  renderConfigCards();
  showToast(`Activated "${config.name}" configuration`, 'success');
}

function applyActiveConfig() {
  const config = AppState.casinoConfigs.find(c => c.id === AppState.activeConfigId);
  if (!config) return;

  // Apply deck count
  if (config.rules.decks !== AppState.numDecks) {
    setNumDecks(config.rules.decks);
  }
}

function saveCasinoConfigsToStorage() {
  try {
    localStorage.setItem('bjpe_casino_configs', JSON.stringify(AppState.casinoConfigs));
    localStorage.setItem('bjpe_active_config', AppState.activeConfigId);
  } catch (e) {
    console.error('Failed to save configs:', e);
  }
}

function loadCasinoConfigsFromStorage() {
  try {
    const saved = localStorage.getItem('bjpe_casino_configs');
    if (saved) {
      AppState.casinoConfigs = JSON.parse(saved);
    }
    const activeId = localStorage.getItem('bjpe_active_config');
    if (activeId) {
      AppState.activeConfigId = activeId;
    }
  } catch (e) {
    console.error('Failed to load configs:', e);
  }
}

// ============================================
// Room Management
// ============================================
function renderRoomCards() {
  const container = document.getElementById('roomsGrid');
  if (!container) return;

  // Load player name
  const nameInput = document.getElementById('playerName');
  if (nameInput) {
    nameInput.value = AppState.playerName;
  }

  container.innerHTML = '';

  AppState.rooms.forEach(room => {
    const isJoined = AppState.currentRoomId === room.id;
    const card = document.createElement('div');
    card.className = `room-card${room.isActive ? ' active' : ''}`;

    // Build config options
    const configOptions = AppState.casinoConfigs.map(cfg =>
      `<option value="${cfg.id}" ${room.configId === cfg.id ? 'selected' : ''}>${cfg.name}</option>`
    ).join('');

    card.innerHTML = `
      <div class="room-card-header">
        <span class="room-card-title">${room.name}</span>
        ${room.isActive ? '<span class="room-badge">Game Active</span>' : ''}
      </div>
      <div class="room-card-body">
        <div class="room-info-row">
          <span class="room-info-label">PLAYERS:</span>
          <span class="room-info-value">${room.players} / ${room.maxPlayers}</span>
        </div>
        <div class="room-info-row">
          <span class="room-info-label">Configuration:</span>
          <select class="room-config-select" data-room-id="${room.id}">
            ${configOptions}
          </select>
        </div>
        <button class="btn-join-room${isJoined ? ' joined' : ''}" data-room-id="${room.id}">
          ${isJoined ? 'Leave Room' : 'Join Room'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Add event listeners
  container.querySelectorAll('.btn-join-room').forEach(btn => {
    btn.addEventListener('click', () => toggleJoinRoom(parseInt(btn.dataset.roomId)));
  });

  container.querySelectorAll('.room-config-select').forEach(select => {
    select.addEventListener('change', (e) => {
      updateRoomConfig(parseInt(e.target.dataset.roomId), e.target.value);
    });
  });
}

function toggleJoinRoom(roomId) {
  const playerName = document.getElementById('playerName')?.value.trim();
  if (!playerName) {
    showToast('Please enter your name first', 'warning');
    document.getElementById('playerName')?.focus();
    return;
  }

  AppState.playerName = playerName;

  if (AppState.currentRoomId === roomId) {
    // Leave room
    const room = AppState.rooms.find(r => r.id === roomId);
    if (room && room.players > 0) {
      room.players--;
    }
    AppState.currentRoomId = null;
    showToast(`Left ${room?.name || 'room'}`, 'info');
  } else {
    // Leave previous room if any
    if (AppState.currentRoomId !== null) {
      const prevRoom = AppState.rooms.find(r => r.id === AppState.currentRoomId);
      if (prevRoom && prevRoom.players > 0) {
        prevRoom.players--;
      }
    }

    // Join new room
    const room = AppState.rooms.find(r => r.id === roomId);
    if (room) {
      if (room.players >= room.maxPlayers) {
        showToast('Room is full', 'error');
        return;
      }
      room.players++;
      room.isActive = true;
      AppState.currentRoomId = roomId;

      // Apply room's config
      AppState.activeConfigId = room.configId;
      applyActiveConfig();

      showToast(`Joined ${room.name} as ${playerName}`, 'success');
    }
  }

  saveRoomsToStorage();
  renderRoomCards();
}

function updateRoomConfig(roomId, configId) {
  const room = AppState.rooms.find(r => r.id === roomId);
  if (room) {
    room.configId = configId;
    saveRoomsToStorage();

    // If currently in this room, apply the config
    if (AppState.currentRoomId === roomId) {
      AppState.activeConfigId = configId;
      applyActiveConfig();
    }
  }
}

function refreshRooms() {
  // Simulate refreshing rooms (in a real app, this would fetch from server)
  showToast('Rooms refreshed', 'info');
  renderRoomCards();
}

function saveRoomsToStorage() {
  try {
    localStorage.setItem('bjpe_rooms', JSON.stringify(AppState.rooms));
    localStorage.setItem('bjpe_current_room', AppState.currentRoomId);
    localStorage.setItem('bjpe_player_name', AppState.playerName);
  } catch (e) {
    console.error('Failed to save rooms:', e);
  }
}

function loadRoomsFromStorage() {
  try {
    const savedRooms = localStorage.getItem('bjpe_rooms');
    if (savedRooms) {
      AppState.rooms = JSON.parse(savedRooms);
    }
    const currentRoom = localStorage.getItem('bjpe_current_room');
    if (currentRoom) {
      AppState.currentRoomId = parseInt(currentRoom) || null;
    }
    const playerName = localStorage.getItem('bjpe_player_name');
    if (playerName) {
      AppState.playerName = playerName;
    }
  } catch (e) {
    console.error('Failed to load rooms:', e);
  }
}

// ============================================
// Players Page Management
// ============================================
function renderPlayersPage() {
  // Update session info
  const currentRoom = AppState.rooms.find(r => r.id === AppState.currentRoomId);
  setText('currentRoomName', currentRoom ? currentRoom.name : 'Not Connected');
  setText('currentPlayerName', AppState.playerName || '—');

  // Update status badge
  const statusEl = document.getElementById('playerStatus');
  if (statusEl) {
    if (currentRoom) {
      statusEl.textContent = 'Controller';
      statusEl.className = 'session-value status-badge controller';
    } else {
      statusEl.textContent = 'Offline';
      statusEl.className = 'session-value status-badge offline';
    }
  }

  // Render players list
  renderPlayersList();

  // Render seats
  renderSeatsGrid();

  // Update stats
  updatePlayerStats();
}

function renderPlayersList() {
  const container = document.getElementById('playersList');
  const countBadge = document.getElementById('playerCountBadge');

  if (!container) return;

  // Simulated players (in real app, would come from server)
  const players = [];

  // Add current player if in a room
  if (AppState.currentRoomId !== null) {
    players.push({
      id: 'self',
      name: AppState.playerName,
      isController: true,
      isYou: true,
      seat: AppState.config.seatIndex
    });
  }

  if (countBadge) {
    countBadge.textContent = players.length;
  }

  if (players.length === 0) {
    container.innerHTML = '<div class="no-players">No players in session. Join a room to start playing.</div>';
    return;
  }

  container.innerHTML = players.map(player => `
    <div class="player-item${player.isYou ? ' is-you' : ''}">
      <div class="player-avatar${player.isController ? ' controller' : ''}">${player.name.charAt(0).toUpperCase()}</div>
      <div class="player-info">
        <div class="player-name">${player.name}${player.isYou ? ' (You)' : ''}</div>
        <div class="player-role">${player.isController ? 'Controller' : 'Viewer'} • Seat ${player.seat}</div>
      </div>
      <div class="player-actions">
        ${!player.isController ? '<button class="btn-take-control">Take Control</button>' : ''}
      </div>
    </div>
  `).join('');
}

function renderSeatsGrid() {
  const container = document.getElementById('seatsGrid');
  if (!container) return;

  const numSeats = 8;
  const currentSeat = AppState.config.seatIndex;
  const isInRoom = AppState.currentRoomId !== null;

  let html = '';
  for (let i = 1; i <= numSeats; i++) {
    const isYourSeat = isInRoom && i === currentSeat;
    const isOccupied = isYourSeat; // In real app, would check other players

    html += `
      <div class="seat-card${isOccupied ? ' occupied' : ''}${isYourSeat ? ' your-seat' : ''}">
        <div class="seat-number">Seat ${i}</div>
        ${isYourSeat ? `<div class="seat-player-name">${AppState.playerName}</div>` : '<div class="seat-empty">Empty</div>'}
        ${!isOccupied && isInRoom ? `<button class="btn-claim-seat" data-seat="${i}">Claim</button>` : ''}
      </div>
    `;
  }

  container.innerHTML = html;

  // Add event listeners for claim buttons
  container.querySelectorAll('.btn-claim-seat').forEach(btn => {
    btn.addEventListener('click', () => claimSeat(parseInt(btn.dataset.seat)));
  });
}

function claimSeat(seatNum) {
  AppState.config.seatIndex = seatNum;
  showToast(`Claimed Seat ${seatNum}`, 'success');
  renderPlayersPage();
  updateAll();
}

function updatePlayerStats() {
  setText('statRoundsPlayed', AppState.currentRoundNum);
  setText('statPairsWon', AppState.pairsWon);
  setText('statCardsDealt', AppState.cardsDealt);

  // Calculate time in session (simplified)
  const minutes = Math.floor(AppState.cardsDealt / 10); // Rough estimate
  setText('statTimeInSession', `${minutes}m`);
}

// ============================================
// Keyboard Shortcuts
// ============================================
function handleKeyboard(e) {
  // U for undo
  if (e.key === 'u' || e.key === 'U') {
    handleUndo();
    return;
  }

  // Number keys for cards
  const keyMap = {
    '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
    '7': '7', '8': '8', '9': '9', '0': '10',
    'j': 'J', 'q': 'Q', 'k': 'K', 'a': 'A',
    'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A'
  };

  if (keyMap[e.key]) {
    handleCardClick(keyMap[e.key]);
  }
}

// ============================================
// Player Decision Recording
// ============================================
function recordDecision(playerNum, decision) {
  // Record the decision
  AppState.playerDecisions[playerNum] = decision;

  // Get optimal decision from engine
  const optimal = calculatePlayerDecision(playerNum);

  // Update button styling to show selected
  const panel = document.querySelector(`.decision-panel[data-player="${playerNum}"]`);
  if (panel) {
    // Remove selected from all buttons in this panel
    panel.querySelectorAll('.decision-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Add selected to clicked button
    const btnClass = decision === 'STAY' ? 'stay' :
                     decision === 'HIT' ? 'hit' :
                     decision === 'SPLIT' ? 'split' : 'double';
    const selectedBtn = panel.querySelector(`.decision-btn.${btnClass}`);
    if (selectedBtn) {
      selectedBtn.classList.add('selected');
    }
  }

  // Check if decision matches optimal
  if (optimal.action) {
    const isCorrect = decision === optimal.action;
    const icon = isCorrect ? '✓' : '✗';
    const type = isCorrect ? 'success' : 'warning';
    const msg = isCorrect
      ? `P${playerNum}: ${decision} ${icon} (${optimal.reason})`
      : `P${playerNum}: ${decision} ${icon} Optimal: ${optimal.action} (${optimal.reason})`;
    showToast(msg, type);
  } else {
    showToast(`Player ${playerNum}: ${decision}`, 'info');
  }
}

// Update decision panels to show only the recommended action
function updateDecisionPanels() {
  const dealerCards = AppState.positions.dealer;
  const hasDealerUpcard = dealerCards.length >= 1;

  for (let i = 1; i <= 8; i++) {
    const playerKey = `player${i}`;
    const playerCards = AppState.positions[playerKey];
    const hasPlayerCards = playerCards && playerCards.length >= 2;
    const canShowDecisions = hasPlayerCards && hasDealerUpcard;
    const hasSplit = AppState.splitHands[i]?.active;

    const panel = document.querySelector(`.decision-panel[data-player="${i}"]`);
    const toggleInput = document.querySelector(`.decision-toggle-input[data-player="${i}"]`);

    if (!panel || !toggleInput) continue;

    // If player has split hands, show split UI
    if (hasSplit && toggleInput.checked) {
      renderSplitDecisions(i, panel);
      panel.classList.add('active');
      continue;
    }

    // Only show decision panel if toggle is ON AND cards are dealt
    if (toggleInput.checked && canShowDecisions) {
      const optimal = calculatePlayerDecision(i);

      if (optimal.action) {
        // Build single button for the recommended action
        const btnConfig = {
          'STAY': { class: 'stay', label: 'S', title: 'Stay' },
          'HIT': { class: 'hit', label: 'H', title: 'Hit' },
          'SPLIT': { class: 'split', label: 'SPLIT', title: 'Split', isSplit: true },
          'DBL': { class: 'double', label: 'D', title: 'Double' },
          'SURRENDER': { class: 'surrender', label: 'R', title: 'Surrender' }
        };

        const config = btnConfig[optimal.action];
        if (config) {
          if (config.isSplit) {
            // Show split CTA button
            panel.innerHTML = `
              <button class="decision-btn split-cta recommended"
                      onclick="handleSplit(${i})"
                      title="${config.title}: ${optimal.reason}">
                SPLIT
              </button>
            `;
          } else {
            panel.innerHTML = `
              <button class="decision-btn ${config.class} recommended"
                      onclick="recordDecision(${i}, '${optimal.action}')"
                      title="${config.title}: ${optimal.reason}">
                ${config.label}
              </button>
            `;
          }
          panel.classList.add('active');
        }
      } else {
        panel.classList.remove('active');
      }
    } else {
      panel.classList.remove('active');
    }
  }
}

// Handle split action
function handleSplit(playerNum) {
  const playerKey = `player${playerNum}`;
  const originalCards = AppState.positions[playerKey];

  if (originalCards.length !== 2) {
    showToast('Cannot split - need exactly 2 cards', 'warning');
    return;
  }

  // Create split hands
  AppState.splitHands[playerNum] = {
    active: true,
    activeHand: 1,  // Start with Hand 1
    hand1: [originalCards[0]],
    hand2: [originalCards[1]],
    decision1: null,
    decision2: null
  };

  // Clear original position
  AppState.positions[playerKey] = [];

  showToast(`Player ${playerNum} split! Dealer dealing...`, 'success');

  // Auto-deal one card to each hand after a short delay
  setTimeout(() => {
    autoDealToSplitHand(playerNum, 1);
    setTimeout(() => {
      autoDealToSplitHand(playerNum, 2);

      // After both hands have 2 cards, activate Hand 1 for player decisions
      AppState.activeSplitPlayer = playerNum;
      AppState.splitHands[playerNum].activeHand = 1;

      showToast(`Hand 1 active - click cards to hit`, 'info');
      updateAll();
    }, 400);
  }, 400);

  updateAll();
}

// Auto-deal a card to a split hand
function autoDealToSplitHand(playerNum, handNum) {
  const split = AppState.splitHands[playerNum];
  if (!split) return;

  // Find a random available card from the shoe
  const availableRanks = Object.keys(AppState.rankCounts).filter(r => AppState.rankCounts[r] > 0);
  if (availableRanks.length === 0) {
    showToast('No cards left in shoe', 'warning');
    return;
  }

  // Pick a random rank weighted by availability
  const totalCards = availableRanks.reduce((sum, r) => sum + AppState.rankCounts[r], 0);
  let random = Math.random() * totalCards;
  let selectedRank = availableRanks[0];

  for (const rank of availableRanks) {
    random -= AppState.rankCounts[rank];
    if (random <= 0) {
      selectedRank = rank;
      break;
    }
  }

  // Convert rank to card display
  const card = selectedRank === '10' ? ['10', 'J', 'Q', 'K'][Math.floor(Math.random() * 4)] : selectedRank;

  // Add card to split hand
  if (handNum === 1) {
    split.hand1.push(card);
  } else {
    split.hand2.push(card);
  }

  // Update shoe counts
  AppState.rankCounts[selectedRank]--;
  AppState.rankSeen[selectedRank]++;
  AppState.cardsDealt++;
  AppState.runningCount += getCountValue(selectedRank);

  // Add to Bead Road
  addBeadRoad(card);

  // Save to history for undo
  AppState.dealHistory.push({
    card: card,
    rank: selectedRank,
    position: `split_${playerNum}_${handNum}`
  });

  showToast(`Split hand ${handNum}: ${card}`, 'info');
}

// Render split hand decisions
function renderSplitDecisions(playerNum, panel) {
  const split = AppState.splitHands[playerNum];
  if (!split) return;

  const dealerUpcard = AppState.positions.dealer[0];
  const isActivePlayer = AppState.activeSplitPlayer === playerNum;

  const hand1Total = calculateHandTotal(split.hand1);
  const hand2Total = calculateHandTotal(split.hand2);

  // Check if both hands have 2+ cards (dealer has dealt to both)
  const hand1Ready = split.hand1.length >= 2;
  const hand2Ready = split.hand2.length >= 2;

  const getBtn = (hand, handNum, isReady) => {
    // Don't show decision until hand has 2 cards
    if (!isReady) {
      return `<span class="split-waiting">...</span>`;
    }

    // If already decided (stayed)
    const decided = split[`decision${handNum}`];
    if (decided === 'STAY') {
      return `<span class="split-decided">STAY</span>`;
    }

    // Only show decision for active hand
    const isActiveHand = isActivePlayer && split.activeHand === handNum;
    if (!isActiveHand) {
      if (split.activeHand > handNum) {
        return `<span class="split-decided">DONE</span>`;
      }
      return `<span class="split-waiting">WAIT</span>`;
    }

    const optimal = getOptimalDecision(hand, dealerUpcard);
    if (!optimal.action) return '';

    const btnConfig = {
      'STAY': { class: 'stay', label: 'S', action: 'STAY' },
      'HIT': { class: 'hit', label: 'H', action: 'HIT' },
      'DBL': { class: 'double', label: 'D', action: 'DBL' },
      'SURRENDER': { class: 'surrender', label: 'R', action: 'SURRENDER' }
    };

    const config = btnConfig[optimal.action] || { class: 'hit', label: 'H', action: 'HIT' };

    // For HIT - player clicks cards manually, for STAY - click button
    if (optimal.action === 'STAY') {
      return `
        <button class="decision-btn ${config.class} recommended"
                onclick="handleSplitStay(${playerNum}, ${handNum})"
                title="Stay on ${hand1Total}">
          ${config.label}
        </button>
      `;
    } else {
      return `
        <span class="decision-btn ${config.class} recommended" title="${optimal.reason} - Click cards to hit">
          ${config.label}
        </span>
      `;
    }
  };

  const hand1Active = isActivePlayer && split.activeHand === 1;
  const hand2Active = isActivePlayer && split.activeHand === 2;

  panel.innerHTML = `
    <div class="split-hands-container">
      <div class="split-hand ${hand1Active ? 'active-hand' : ''}">
        <div class="split-hand-label">Hand 1 ${hand1Active ? '◀' : ''}</div>
        <div class="split-hand-cards">
          ${split.hand1.map(c => `<span class="mini-card">${c}</span>`).join('')}
        </div>
        <div class="split-hand-total">${hand1Total}</div>
        <div class="split-hand-decision">${getBtn(split.hand1, 1, hand1Ready)}</div>
      </div>
      <div class="split-divider">|</div>
      <div class="split-hand ${hand2Active ? 'active-hand' : ''}">
        <div class="split-hand-label">Hand 2 ${hand2Active ? '◀' : ''}</div>
        <div class="split-hand-cards">
          ${split.hand2.map(c => `<span class="mini-card">${c}</span>`).join('')}
        </div>
        <div class="split-hand-total">${hand2Total}</div>
        <div class="split-hand-decision">${getBtn(split.hand2, 2, hand2Ready)}</div>
      </div>
    </div>
  `;
}

// Handle stay on a split hand
function handleSplitStay(playerNum, handNum) {
  const split = AppState.splitHands[playerNum];
  if (!split) return;

  split[`decision${handNum}`] = 'STAY';

  const hand = handNum === 1 ? split.hand1 : split.hand2;
  const total = calculateHandTotal(hand);

  showToast(`Hand ${handNum} stays on ${total}`, 'success');

  if (handNum === 1) {
    // Move to Hand 2
    split.activeHand = 2;
    showToast(`Hand 2 active - click cards to hit`, 'info');
  } else {
    // Both hands done
    split.active = false;
    AppState.activeSplitPlayer = null;
    showToast(`Split complete for Player ${playerNum}`, 'success');
  }

  updateAll();
}

// Record decision for a split hand
function recordSplitDecision(playerNum, handNum, decision) {
  const split = AppState.splitHands[playerNum];
  if (!split) return;

  split[`decision${handNum}`] = decision;

  const hand = handNum === 1 ? split.hand1 : split.hand2;
  const dealerUpcard = AppState.positions.dealer[0];
  const optimal = getOptimalDecision(hand, dealerUpcard);

  const isCorrect = decision === optimal.action;
  const icon = isCorrect ? '✓' : '✗';
  const type = isCorrect ? 'success' : 'warning';

  showToast(`P${playerNum} Hand ${handNum}: ${decision} ${icon}`, type);

  // If HIT, deal another card and allow more decisions
  if (decision === 'HIT') {
    setTimeout(() => {
      autoDealToSplitHand(playerNum, handNum);
      split[`decision${handNum}`] = null; // Reset to show new decision
      updateAll();
    }, 300);
  }
  // If DBL (Double), deal one card then automatically STAY
  else if (decision === 'DBL') {
    setTimeout(() => {
      autoDealToSplitHand(playerNum, handNum);
      // After double, player must stay - no more cards allowed
      split[`decision${handNum}`] = 'STAY';

      const newHand = handNum === 1 ? split.hand1 : split.hand2;
      const newTotal = calculateHandTotal(newHand);
      showToast(`Hand ${handNum} doubled and stays on ${newTotal}`, 'success');

      // Move to next hand or finish
      if (handNum === 1) {
        split.activeHand = 2;
        showToast(`Hand 2 active - click cards to hit`, 'info');
      } else {
        split.active = false;
        AppState.activeSplitPlayer = null;
        showToast(`Split complete for Player ${playerNum}`, 'success');
      }
      updateAll();
    }, 300);
  } else {
    updateAll();
  }
}

function clearPlayerDecisions() {
  // Reset all decisions
  for (let i = 1; i <= 8; i++) {
    AppState.playerDecisions[i] = null;
  }

  // Clear split hands
  AppState.splitHands = {};
  AppState.activeSplitPlayer = null;

  // Clear selected styling from all decision buttons
  document.querySelectorAll('.decision-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
}

// ============================================
// Game History & Analytics
// ============================================

function initGameSession(casinoName = '', tableName = '') {
  AppState.gameHistory = {
    sessionId: generateSessionId(),
    sessionStart: new Date().toISOString(),
    sessionEnd: null,
    casinoName: casinoName || 'Unknown Casino',
    tableName: tableName || 'Table 1',
    numDecks: AppState.numDecks,
    rounds: [],
    statistics: {
      totalRounds: 0,
      playerWins: 0,
      playerLosses: 0,
      pushes: 0,
      blackjacks: 0,
      playerBusts: 0,
      dealerBusts: 0,
      splits: 0,
      doubles: 0,
      surrenders: 0,
      totalBetAmount: 0,
      totalWinAmount: 0,
      netProfit: 0
    },
    patterns: {
      dealerUpcardFrequency: { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0 },
      dealerBustByUpcard: { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0 },
      hotStreaks: [],
      coldStreaks: [],
      countAtWin: [],
      countAtLoss: [],
      cardSequences: [],
      highCardClusters: [],
      lowCardClusters: []
    },
    alerts: []
  };
  showToast('Game session started', 'success');
}

function generateSessionId() {
  return 'GAME-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function recordRoundToHistory(roundData) {
  const history = AppState.gameHistory;

  // Create round record
  const round = {
    roundNumber: history.statistics.totalRounds + 1,
    timestamp: new Date().toISOString(),
    runningCountStart: roundData.runningCountStart || 0,
    runningCountEnd: AppState.runningCount,
    trueCountStart: roundData.trueCountStart || 0,
    trueCountEnd: calculateTrueCount(),
    cardsDealtInRound: roundData.cardsDealt || [],
    dealer: {
      cards: [...AppState.positions.dealer],
      total: calculateHandTotal(AppState.positions.dealer),
      busted: calculateHandTotal(AppState.positions.dealer) > 21,
      upcard: AppState.positions.dealer[0] || null
    },
    players: {},
    penetration: ((AppState.cardsDealt / AppState.totalCards) * 100).toFixed(1),
    shoeProgress: AppState.cardsDealt + '/' + AppState.totalCards
  };

  // Record each player's hand
  for (let i = 1; i <= 8; i++) {
    const playerKey = 'player' + i;
    const cards = AppState.positions[playerKey];
    if (cards && cards.length > 0) {
      const total = calculateHandTotal(cards);
      const split = AppState.splitHands[i];

      round.players[i] = {
        cards: [...cards],
        total: total,
        busted: total > 21,
        blackjack: cards.length === 2 && total === 21,
        decision: AppState.playerDecisions[i],
        split: split ? {
          hand1: { cards: [...split.hand1], total: calculateHandTotal(split.hand1), decision: split.decision1 },
          hand2: { cards: [...split.hand2], total: calculateHandTotal(split.hand2), decision: split.decision2 }
        } : null
      };

      // Update statistics
      if (round.players[i].blackjack) history.statistics.blackjacks++;
      if (round.players[i].busted) history.statistics.playerBusts++;
      if (split) history.statistics.splits++;
      if (AppState.playerDecisions[i] === 'DBL') history.statistics.doubles++;
    }
  }

  // Update dealer statistics
  if (round.dealer.busted) {
    history.statistics.dealerBusts++;
    const upcard = normalizeRank(round.dealer.upcard);
    if (upcard && history.patterns.dealerBustByUpcard[upcard] !== undefined) {
      history.patterns.dealerBustByUpcard[upcard]++;
    }
  }

  // Track dealer upcard frequency
  const dealerUpcard = normalizeRank(round.dealer.upcard);
  if (dealerUpcard && history.patterns.dealerUpcardFrequency[dealerUpcard] !== undefined) {
    history.patterns.dealerUpcardFrequency[dealerUpcard]++;
  }

  // Track card sequences for pattern analysis
  history.patterns.cardSequences.push(roundData.cardsDealt || []);

  // Detect card clusters
  detectCardClusters(roundData.cardsDealt || []);

  // Add round to history
  history.rounds.push(round);
  history.statistics.totalRounds++;

  // Check for patterns and anomalies
  analyzePatterns();
}

function calculateTrueCount() {
  const decksRemaining = (AppState.totalCards - AppState.cardsDealt) / 52;
  return decksRemaining > 0 ? (AppState.runningCount / decksRemaining).toFixed(2) : 0;
}

function detectCardClusters(cards) {
  if (!cards || cards.length < 3) return;

  const history = AppState.gameHistory;
  let highCount = 0;
  let lowCount = 0;

  cards.forEach(card => {
    const rank = normalizeRank(card);
    if (['10', 'A'].includes(rank)) highCount++;
    if (['2', '3', '4', '5', '6'].includes(rank)) lowCount++;
  });

  // High card cluster (3+ high cards in sequence)
  if (highCount >= 3) {
    history.patterns.highCardClusters.push({
      round: history.statistics.totalRounds + 1,
      cards: [...cards],
      count: highCount,
      timestamp: new Date().toISOString()
    });
  }

  // Low card cluster (3+ low cards in sequence)
  if (lowCount >= 3) {
    history.patterns.lowCardClusters.push({
      round: history.statistics.totalRounds + 1,
      cards: [...cards],
      count: lowCount,
      timestamp: new Date().toISOString()
    });
  }
}

function analyzePatterns() {
  const history = AppState.gameHistory;
  const rounds = history.rounds;

  if (rounds.length < 5) return;

  // Detect hot/cold streaks
  const recentRounds = rounds.slice(-10);
  let dealerBustStreak = 0;
  let dealerWinStreak = 0;

  recentRounds.forEach(round => {
    if (round.dealer.busted) {
      dealerBustStreak++;
      dealerWinStreak = 0;
    } else {
      dealerWinStreak++;
      dealerBustStreak = 0;
    }
  });

  // Alert on unusual patterns
  if (dealerBustStreak >= 4) {
    addHistoryAlert('HOT_STREAK', `Dealer busted ${dealerBustStreak} times in a row - favorable conditions!`);
  }
  if (dealerWinStreak >= 6) {
    addHistoryAlert('COLD_STREAK', `Dealer won ${dealerWinStreak} times in a row - consider reducing bets`);
  }

  // Check for unusual dealer bust rate
  const bustRate = (history.statistics.dealerBusts / history.statistics.totalRounds) * 100;
  if (history.statistics.totalRounds >= 20) {
    if (bustRate < 20) {
      addHistoryAlert('LOW_BUST_RATE', `Dealer bust rate unusually low: ${bustRate.toFixed(1)}% (expected ~28%)`);
    } else if (bustRate > 40) {
      addHistoryAlert('HIGH_BUST_RATE', `Dealer bust rate unusually high: ${bustRate.toFixed(1)}% (expected ~28%)`);
    }
  }
}

function addHistoryAlert(type, message) {
  const history = AppState.gameHistory;
  const alert = {
    type: type,
    message: message,
    timestamp: new Date().toISOString(),
    round: history.statistics.totalRounds
  };

  // Avoid duplicate alerts
  const recentAlerts = history.alerts.slice(-5);
  const isDuplicate = recentAlerts.some(a => a.type === type && a.round >= history.statistics.totalRounds - 3);

  if (!isDuplicate) {
    history.alerts.push(alert);
    showToast(message, type.includes('HOT') ? 'success' : 'warning');
  }
}

function recordRoundOutcome(playerNum, outcome, betAmount = 0, winAmount = 0) {
  const history = AppState.gameHistory;

  if (outcome === 'WIN') {
    history.statistics.playerWins++;
    history.patterns.countAtWin.push(AppState.runningCount);
  } else if (outcome === 'LOSS') {
    history.statistics.playerLosses++;
    history.patterns.countAtLoss.push(AppState.runningCount);
  } else if (outcome === 'PUSH') {
    history.statistics.pushes++;
  }

  history.statistics.totalBetAmount += betAmount;
  history.statistics.totalWinAmount += winAmount;
  history.statistics.netProfit = history.statistics.totalWinAmount - history.statistics.totalBetAmount;
}

function endGameSession() {
  const history = AppState.gameHistory;
  history.sessionEnd = new Date().toISOString();

  // Generate final analysis
  generateSessionAnalysis();

  showToast('Game session ended. Ready to export.', 'info');
}

function generateSessionAnalysis() {
  const history = AppState.gameHistory;
  const stats = history.statistics;
  const patterns = history.patterns;

  history.analysis = {
    duration: calculateSessionDuration(),
    averageCountAtWin: calculateAverage(patterns.countAtWin),
    averageCountAtLoss: calculateAverage(patterns.countAtLoss),
    dealerBustRate: stats.totalRounds > 0 ? ((stats.dealerBusts / stats.totalRounds) * 100).toFixed(1) + '%' : '0%',
    playerBustRate: stats.totalRounds > 0 ? ((stats.playerBusts / stats.totalRounds) * 100).toFixed(1) + '%' : '0%',
    blackjackRate: stats.totalRounds > 0 ? ((stats.blackjacks / stats.totalRounds) * 100).toFixed(1) + '%' : '0%',
    winRate: (stats.playerWins + stats.playerLosses) > 0 ?
      ((stats.playerWins / (stats.playerWins + stats.playerLosses)) * 100).toFixed(1) + '%' : '0%',
    mostCommonDealerUpcard: getMostCommonUpcard(patterns.dealerUpcardFrequency),
    highCardClusterCount: patterns.highCardClusters.length,
    lowCardClusterCount: patterns.lowCardClusters.length,
    recommendations: generateRecommendations()
  };
}

function calculateSessionDuration() {
  const history = AppState.gameHistory;
  if (!history.sessionStart) return '0 min';

  const start = new Date(history.sessionStart);
  const end = history.sessionEnd ? new Date(history.sessionEnd) : new Date();
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  }
  return `${diffMins} min`;
}

function calculateAverage(arr) {
  if (!arr || arr.length === 0) return 0;
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
}

function getMostCommonUpcard(frequency) {
  let maxCard = '10';
  let maxCount = 0;
  for (const card in frequency) {
    if (frequency[card] > maxCount) {
      maxCount = frequency[card];
      maxCard = card;
    }
  }
  return maxCard;
}

function generateRecommendations() {
  const history = AppState.gameHistory;
  const stats = history.statistics;
  const patterns = history.patterns;
  const recommendations = [];

  // Analyze count correlation
  const avgWinCount = calculateAverage(patterns.countAtWin);
  const avgLossCount = calculateAverage(patterns.countAtLoss);

  if (avgWinCount > avgLossCount + 1) {
    recommendations.push('Count correlation positive: Increase bets when count is high');
  }

  // Analyze dealer bust patterns
  const bustByUpcard = patterns.dealerBustByUpcard;
  for (const card in bustByUpcard) {
    const freq = patterns.dealerUpcardFrequency[card];
    if (freq > 0) {
      const bustRate = (bustByUpcard[card] / freq) * 100;
      if (bustRate > 40 && freq >= 3) {
        recommendations.push(`Dealer showing ${card} busts ${bustRate.toFixed(0)}% - stay on 12+ vs ${card}`);
      }
    }
  }

  // Card cluster recommendations
  if (patterns.highCardClusters.length > patterns.lowCardClusters.length + 3) {
    recommendations.push('High card clustering detected - shoe may be unfavorable after clusters');
  }
  if (patterns.lowCardClusters.length > patterns.highCardClusters.length + 3) {
    recommendations.push('Low card clustering detected - expect high cards after clusters');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue with basic strategy - no significant patterns detected');
  }

  return recommendations;
}

function exportGameHistory(format = 'json') {
  const history = AppState.gameHistory;

  // Ensure analysis is generated
  if (!history.analysis) {
    generateSessionAnalysis();
  }

  let content, filename, mimeType;

  if (format === 'json') {
    content = JSON.stringify(history, null, 2);
    filename = `bj-history-${history.sessionId}.json`;
    mimeType = 'application/json';
  } else if (format === 'csv') {
    content = convertHistoryToCSV(history);
    filename = `bj-history-${history.sessionId}.csv`;
    mimeType = 'text/csv';
  } else if (format === 'report') {
    content = generateTextReport(history);
    filename = `bj-report-${history.sessionId}.txt`;
    mimeType = 'text/plain';
  }

  downloadFile(content, filename, mimeType);
  showToast(`History exported as ${format.toUpperCase()}`, 'success');
}

function convertHistoryToCSV(history) {
  // Session Info Header
  let csv = 'BJ PROBABILITY ENGINE - GAME HISTORY EXPORT\n';
  csv += `Session ID,${history.sessionId || 'N/A'}\n`;
  csv += `Casino,${history.casinoName || 'N/A'}\n`;
  csv += `Table,${history.tableName || 'N/A'}\n`;
  csv += `Decks,${history.numDecks}\n`;
  csv += `Start Time,${history.sessionStart || 'N/A'}\n`;
  csv += `End Time,${history.sessionEnd || 'Ongoing'}\n\n`;

  // Round-by-round data
  csv += 'ROUND DETAILS\n';
  csv += 'Round,Timestamp,Dealer Cards,Dealer Total,Dealer Busted,Running Count,True Count,Penetration\n';

  if (history.rounds && history.rounds.length > 0) {
    history.rounds.forEach(round => {
      csv += `${round.roundNumber || ''},`;
      csv += `${round.timestamp || ''},`;
      csv += `"${round.dealer?.cards?.join(' ') || ''}",`;
      csv += `${round.dealer?.total || ''},`;
      csv += `${round.dealer?.busted || false},`;
      csv += `${round.runningCountEnd || 0},`;
      csv += `${round.trueCountEnd || 0},`;
      csv += `${round.penetration || 0}%\n`;
    });
  }

  // Dealer History (from simulation)
  if (AppState.dealerHistory && AppState.dealerHistory.length > 0) {
    csv += '\n\nDEALER HISTORY (SIMULATION)\n';
    csv += 'Round,Dealer Cards,Total,Busted\n';
    AppState.dealerHistory.forEach(entry => {
      const busted = entry.total > 21 ? 'Yes' : 'No';
      csv += `${entry.round},"${entry.cards.join(' ')}",${entry.total},${busted}\n`;
    });
  }

  // Statistics summary
  csv += '\n\nSTATISTICS SUMMARY\n';
  csv += 'Metric,Value\n';
  csv += `Total Rounds,${history.statistics.totalRounds}\n`;
  csv += `Player Wins,${history.statistics.playerWins}\n`;
  csv += `Player Losses,${history.statistics.playerLosses}\n`;
  csv += `Pushes,${history.statistics.pushes}\n`;
  csv += `Blackjacks,${history.statistics.blackjacks}\n`;
  csv += `Player Busts,${history.statistics.playerBusts}\n`;
  csv += `Dealer Busts,${history.statistics.dealerBusts}\n`;
  csv += `Splits,${history.statistics.splits}\n`;
  csv += `Doubles,${history.statistics.doubles}\n`;
  csv += `Surrenders,${history.statistics.surrenders || 0}\n`;

  // Calculate win rate
  const totalDecided = history.statistics.playerWins + history.statistics.playerLosses;
  const winRate = totalDecided > 0 ? ((history.statistics.playerWins / totalDecided) * 100).toFixed(2) : '0';
  csv += `Win Rate,${winRate}%\n`;

  // Dealer bust rate
  const dealerBustRate = history.statistics.totalRounds > 0
    ? ((history.statistics.dealerBusts / history.statistics.totalRounds) * 100).toFixed(2)
    : '0';
  csv += `Dealer Bust Rate,${dealerBustRate}%\n`;

  // Add dealer upcard analysis
  csv += '\n\nDEALER UPCARD ANALYSIS\n';
  csv += 'Upcard,Frequency,Bust Count,Bust Rate\n';
  for (const card of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A']) {
    const freq = history.patterns.dealerUpcardFrequency[card] || 0;
    const busts = history.patterns.dealerBustByUpcard[card] || 0;
    const bustRate = freq > 0 ? ((busts / freq) * 100).toFixed(1) : '0';
    csv += `${card},${freq},${busts},${bustRate}%\n`;
  }

  // Card tracking state
  csv += '\n\nCARD TRACKING STATE\n';
  csv += 'Rank,Seen,Remaining,Initial\n';
  for (const rank of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A']) {
    const seen = AppState.rankSeen[rank] || 0;
    const remaining = AppState.rankCounts[rank] || 0;
    const initial = AppState.initialCounts[rank] || 0;
    csv += `${rank},${seen},${remaining},${initial}\n`;
  }

  // Current counts
  csv += '\n\nCURRENT COUNT STATE\n';
  csv += `Running Count,${AppState.runningCount}\n`;
  csv += `True Count,${getTrueCount().toFixed(2)}\n`;
  csv += `Cards Dealt,${AppState.cardsDealt}\n`;
  csv += `Cards Remaining,${AppState.totalCards - AppState.cardsDealt}\n`;
  csv += `Penetration,${getPenetration().toFixed(1)}%\n`;

  // Alerts
  if (history.alerts && history.alerts.length > 0) {
    csv += '\n\nALERTS\n';
    csv += 'Type,Message,Timestamp\n';
    history.alerts.forEach(alert => {
      csv += `${alert.type || ''},"${alert.message || ''}",${alert.timestamp || ''}\n`;
    });
  }

  // Footer
  csv += '\n\nGenerated by BJ Probability Engine v1.3\n';
  csv += `Export Time,${new Date().toISOString()}\n`;

  return csv;
}

function generateTextReport(history) {
  const stats = history.statistics;
  const analysis = history.analysis || {};

  let report = `
╔══════════════════════════════════════════════════════════════════╗
║           BJ PROBABILITY ENGINE - GAME SESSION REPORT            ║
╚══════════════════════════════════════════════════════════════════╝

SESSION INFORMATION
───────────────────────────────────────────────────────────────────
Session ID:     ${history.sessionId}
Casino:         ${history.casinoName}
Table:          ${history.tableName}
Decks:          ${history.numDecks}
Start Time:     ${history.sessionStart}
End Time:       ${history.sessionEnd || 'Ongoing'}
Duration:       ${analysis.duration || 'N/A'}

GAME STATISTICS
───────────────────────────────────────────────────────────────────
Total Rounds:   ${stats.totalRounds}
Player Wins:    ${stats.playerWins}
Player Losses:  ${stats.playerLosses}
Pushes:         ${stats.pushes}
Win Rate:       ${analysis.winRate || 'N/A'}

Blackjacks:     ${stats.blackjacks} (${analysis.blackjackRate || 'N/A'})
Player Busts:   ${stats.playerBusts} (${analysis.playerBustRate || 'N/A'})
Dealer Busts:   ${stats.dealerBusts} (${analysis.dealerBustRate || 'N/A'})

Splits:         ${stats.splits}
Doubles:        ${stats.doubles}
Surrenders:     ${stats.surrenders}

PATTERN ANALYSIS
───────────────────────────────────────────────────────────────────
Most Common Dealer Upcard: ${analysis.mostCommonDealerUpcard || 'N/A'}
Average Count at Win:      ${analysis.averageCountAtWin || 'N/A'}
Average Count at Loss:     ${analysis.averageCountAtLoss || 'N/A'}
High Card Clusters:        ${analysis.highCardClusterCount || 0}
Low Card Clusters:         ${analysis.lowCardClusterCount || 0}

DEALER UPCARD BREAKDOWN
───────────────────────────────────────────────────────────────────
Card    Freq    Busts   Bust Rate
`;

  for (const card of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A']) {
    const freq = history.patterns.dealerUpcardFrequency[card];
    const busts = history.patterns.dealerBustByUpcard[card];
    const bustRate = freq > 0 ? ((busts / freq) * 100).toFixed(1) : '0.0';
    report += `${card.padEnd(8)}${String(freq).padEnd(8)}${String(busts).padEnd(8)}${bustRate}%\n`;
  }

  report += `
ALERTS & ANOMALIES
───────────────────────────────────────────────────────────────────
`;
  if (history.alerts.length > 0) {
    history.alerts.forEach(alert => {
      report += `[Round ${alert.round}] ${alert.type}: ${alert.message}\n`;
    });
  } else {
    report += 'No significant anomalies detected.\n';
  }

  report += `
STRATEGIC RECOMMENDATIONS
───────────────────────────────────────────────────────────────────
`;
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    analysis.recommendations.forEach((rec, i) => {
      report += `${i + 1}. ${rec}\n`;
    });
  }

  report += `
══════════════════════════════════════════════════════════════════
Generated by BJ Probability Engine - Tech Hive Corporation
Report Time: ${new Date().toISOString()}
══════════════════════════════════════════════════════════════════
`;

  return report;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// Game Simulation Engine
// ============================================

function simulateGames(numGames = 100) {
  // Initialize fresh session for simulation
  initGameSession('Simulation Casino', 'Auto-Sim Table');
  resetShoe();

  let gamesCompleted = 0;

  for (let game = 0; game < numGames; game++) {
    // Check if shoe needs reshuffle (penetration > 75%)
    if (AppState.cardsDealt / AppState.totalCards > 0.75) {
      resetShoe();
    }

    // Simulate one round
    const roundResult = simulateOneRound();

    if (roundResult) {
      gamesCompleted++;
    }

    // Reset positions for next round
    for (const pos in AppState.positions) {
      AppState.positions[pos] = [];
    }
    clearPlayerDecisions();
  }

  // End session and generate analysis
  endGameSession();

  showToast(`Simulation complete: ${gamesCompleted} games`, 'success');

  // Show history panel
  showHistoryPanel();

  return AppState.gameHistory;
}

function simulateOneRound() {
  const roundCards = [];
  const runningCountStart = AppState.runningCount;

  // Deal 2 cards to dealer
  for (let i = 0; i < 2; i++) {
    const card = dealRandomCard();
    if (!card) return null;
    AppState.positions.dealer.push(card);
    roundCards.push(card);
  }

  // Deal 2 cards to player 1
  for (let i = 0; i < 2; i++) {
    const card = dealRandomCard();
    if (!card) return null;
    AppState.positions.player1.push(card);
    roundCards.push(card);
  }

  // Simulate player decisions using basic strategy
  let playerTotal = calculateHandTotal(AppState.positions.player1);
  const dealerUpcard = AppState.positions.dealer[0];
  const dealerValue = getCardValue(dealerUpcard);

  // Basic strategy simulation
  while (playerTotal < 17) {
    // Hit on less than 17 (simplified)
    if (playerTotal < 12 || (playerTotal < 17 && dealerValue >= 7)) {
      const card = dealRandomCard();
      if (!card) break;
      AppState.positions.player1.push(card);
      roundCards.push(card);
      playerTotal = calculateHandTotal(AppState.positions.player1);
      AppState.playerDecisions[1] = 'HIT';
    } else {
      AppState.playerDecisions[1] = 'STAY';
      break;
    }
  }

  if (playerTotal >= 17) {
    AppState.playerDecisions[1] = 'STAY';
  }

  // Dealer plays (hits on 16 or less, stands on 17+)
  let dealerTotal = calculateHandTotal(AppState.positions.dealer);
  while (dealerTotal < 17) {
    const card = dealRandomCard();
    if (!card) break;
    AppState.positions.dealer.push(card);
    roundCards.push(card);
    dealerTotal = calculateHandTotal(AppState.positions.dealer);
  }

  // Determine outcome
  playerTotal = calculateHandTotal(AppState.positions.player1);
  dealerTotal = calculateHandTotal(AppState.positions.dealer);

  let outcome = 'PUSH';
  if (playerTotal > 21) {
    outcome = 'LOSS';
  } else if (dealerTotal > 21) {
    outcome = 'WIN';
  } else if (playerTotal > dealerTotal) {
    outcome = 'WIN';
  } else if (playerTotal < dealerTotal) {
    outcome = 'LOSS';
  }

  // Record outcome
  recordRoundOutcome(1, outcome, 100, outcome === 'WIN' ? 200 : 0);

  // Record round to history
  recordRoundToHistory({
    cardsDealt: roundCards,
    runningCountStart: runningCountStart,
    trueCountStart: calculateTrueCount()
  });

  return { outcome, playerTotal, dealerTotal, roundCards };
}

function dealRandomCard() {
  // Get available cards
  const availableRanks = Object.keys(AppState.rankCounts).filter(r => AppState.rankCounts[r] > 0);
  if (availableRanks.length === 0) return null;

  // Weight by availability
  const totalCards = availableRanks.reduce((sum, r) => sum + AppState.rankCounts[r], 0);
  let random = Math.random() * totalCards;
  let selectedRank = availableRanks[0];

  for (const rank of availableRanks) {
    random -= AppState.rankCounts[rank];
    if (random <= 0) {
      selectedRank = rank;
      break;
    }
  }

  // Convert rank to display card
  let card = selectedRank;
  if (selectedRank === '10') {
    card = ['10', 'J', 'Q', 'K'][Math.floor(Math.random() * 4)];
  }

  // Update counts
  AppState.rankCounts[selectedRank]--;
  AppState.rankSeen[selectedRank]++;
  AppState.cardsDealt++;
  AppState.runningCount += getCountValue(selectedRank);

  // Add to bead road
  addBeadRoad(card);

  return card;
}

function getCardValue(card) {
  if (!card) return 0;
  if (['J', 'Q', 'K'].includes(card)) return 10;
  if (card === 'A') return 11;
  if (card === '10') return 10;
  return parseInt(card) || 0;
}

// ============================================
// Real-Time Simulation Engine
// ============================================

let realtimeSimRunning = false;
let realtimeSimPaused = false;
let realtimeSimSpeed = 250;
let simRoundCount = 0;

// Cut Card Animation before game starts
async function showCutCardAnimation() {
  return new Promise((resolve) => {
    // Create cut card overlay
    const overlay = document.createElement('div');
    overlay.className = 'cut-card-overlay';
    overlay.innerHTML = `
      <div class="cut-card-container">
        <div class="shoe-cards">
          <div class="shoe-card card-1"></div>
          <div class="shoe-card card-2"></div>
          <div class="shoe-card card-3"></div>
          <div class="shoe-card card-4"></div>
          <div class="shoe-card card-5"></div>
          <div class="shoe-card card-6"></div>
          <div class="shoe-card card-7"></div>
          <div class="shoe-card card-8"></div>
        </div>
        <div class="cut-card">
          <div class="cut-card-inner">CUT</div>
        </div>
        <div class="cut-card-text">Cutting the Shoe...</div>
        <div class="deck-info">${AppState.numDecks} DECKS - ${AppState.totalCards} CARDS</div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Trigger animation
    setTimeout(() => overlay.classList.add('active'), 50);

    // Remove after animation
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 500);
    }, 2500);
  });
}

// Show cut card on reshuffle during simulation
async function showReshuffleAnimation() {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'cut-card-overlay reshuffle';
    overlay.innerHTML = `
      <div class="cut-card-container">
        <div class="shuffle-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
          </svg>
        </div>
        <div class="cut-card-text">Reshuffling...</div>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add('active'), 50);

    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 300);
    }, 1000);
  });
}

// Simulation config
let simPlayerCount = 5;

function updateSimPlayerCount() {
  const select = document.getElementById('simPlayersSelect');
  if (select) {
    simPlayerCount = parseInt(select.value) || 2;
  }
}

function startSimWithConfig() {
  const decksSelect = document.getElementById('simDecksSelect');
  const playersSelect = document.getElementById('simPlayersSelect');

  const totalDecks = parseInt(decksSelect?.value) || 8;
  simPlayerCount = parseInt(playersSelect?.value) || 2;

  // Calculate total cards to deal (75% penetration per shoe)
  const cardsPerDeck = 52;
  const totalCards = totalDecks * cardsPerDeck;
  const cardsToPlay = Math.floor(totalCards * 0.75);

  // Estimate rounds: ~6 cards per round per player on average
  const avgCardsPerRound = (simPlayerCount * 2.5) + 3; // players + dealer
  const estimatedRounds = Math.ceil(cardsToPlay / avgCardsPerRound);

  showToast(`Starting ${totalDecks} deck sim (${simPlayerCount} players, ~${estimatedRounds} rounds)`, 'info');
  startRealtimeSimulationByDecks(totalDecks);
}

async function startRealtimeSimulationByDecks(totalDecks = 8) {
  if (realtimeSimRunning) {
    showToast('Simulation already running', 'warning');
    return;
  }

  realtimeSimRunning = true;
  realtimeSimPaused = false;
  simRoundCount = 0;

  // Reset Quant EV player (P5) sitting out state for new simulation
  AppState.quantEvSettings.quantEvSittingOut = false;

  // LIVE TRACKER - Show panel and reset tracker (7 players)
  showQuantEvPanel();
  AppState.quantEvTracker.sessionId = Date.now();
  AppState.quantEvTracker.roundNumber = 0;
  for (let i = 1; i <= 7; i++) {
    AppState.quantEvTracker.players[i] = {
      bankroll: 100000, hands: [], wins: 0, losses: 0, pushes: 0, bjs: 0,
      correctDecisions: 0, totalDecisions: 0
    };
  }
  AppState.quantEvTracker.history = [];

  // BETTING HISTORY - Start new game automatically
  if (AppState.bettingHistory.enabled) {
    startNewGame(simPlayerCount || 5);
  }

  try {
    showSimulationControls();
    initGameSession('Simulation Casino', `${totalDecks}-Deck Simulation`);
    resetShoe();
    clearTableForSim();

    await showCutCardAnimation();
    await diceCardBurn(); // Dice card rule: 1 face-up + 2 burned

    const targetCards = totalDecks * 52 * 0.75; // 75% of total decks
    let totalCardsDealt = 0;
    let shoeCount = 0;
    let needsShuffle = false;  // Flag: shuffle needed before next round

    while (totalCardsDealt < targetCards && realtimeSimRunning) {
      // Handle pause
      while (realtimeSimPaused && realtimeSimRunning) {
        await delay(100);
      }
      if (!realtimeSimRunning) break;

      // 75% PENETRATION = END GAME (no shuffle, finish the round and end)
      if (needsShuffle) {
        console.log(`[SIM] 75% penetration reached - ENDING GAME (last round completed)`);
        showToast('75% penetration reached - Game Over!', 'info');
        break;  // Exit the loop, end the game
      }

      simRoundCount++;
      const cardsBeforeRound = AppState.cardsDealt;

      updateSimStatus(`Round ${simRoundCount} | Cards: ${Math.round(totalCardsDealt)}/${Math.round(targetCards)}`);

      // Play the round to completion
      await runSimRound();

      const cardsThisRound = AppState.cardsDealt - cardsBeforeRound;
      totalCardsDealt += cardsThisRound;

      // CHECK PENETRATION AFTER ROUND COMPLETES
      // If >= 75%, this was the LAST round of the shoe - flag for shuffle before next round
      const currentPenetration = (AppState.cardsDealt / AppState.totalCards) * 100;
      if (currentPenetration >= 75 && !needsShuffle) {
        console.log(`[SIM] Round ${simRoundCount} hit ${currentPenetration.toFixed(1)}% penetration - LAST ROUND of shoe`);
        needsShuffle = true;  // Shuffle will happen BEFORE next round starts
      }

      await delay(realtimeSimSpeed * 2);

      if (totalCardsDealt < targetCards) {
        clearTableForSim();
      }
    }

    realtimeSimRunning = false;
    hideSimulationControls();
    endGameSession();

    const handsPlayed = simRoundCount * simPlayerCount;
    showToast(`Complete: ${handsPlayed} hands over ${shoeCount + 1} shoe(s)`, 'success');
    showHistoryPanel();

    // LIVE TRACKER - Show final summary
    showQuantEvSummary();
  } catch (error) {
    console.error('Deck simulation error:', error);
    showToast(`Simulation error: ${error.message}`, 'error');
    realtimeSimRunning = false;
    hideSimulationControls();
  }
}

async function startRealtimeSimulation(numGames = 100) {
  if (realtimeSimRunning) {
    showToast('Simulation already running', 'warning');
    return;
  }

  realtimeSimRunning = true;
  realtimeSimPaused = false;
  simRoundCount = 0;

  try {
  // Show controls
  showSimulationControls();

  // Initialize
  initGameSession('Simulation Casino', 'Real-Time Simulation');
  resetShoe();
  clearTableForSim();

  // Show cut card animation before starting
  await showCutCardAnimation();
  await diceCardBurn(); // Dice card rule: 1 face-up + 2 burned

  showToast('Starting simulation...', 'info');

  // Run simulation loop
  let needsShuffle = false;  // Flag: shuffle needed before next round
  let shoeCount = 0;

  for (let round = 1; round <= numGames && realtimeSimRunning; round++) {
    // Handle pause
    while (realtimeSimPaused && realtimeSimRunning) {
      await delay(100);
    }
    if (!realtimeSimRunning) break;

    // 75% PENETRATION = END GAME (no shuffle, finish the round and end)
    if (needsShuffle) {
      console.log(`[SIM] 75% penetration reached - ENDING GAME (last round completed)`);
      showToast('75% penetration reached - Game Over!', 'info');
      break;  // Exit the loop, end the game
    }

    updateSimStatus(`Round ${round}/${numGames}`);

    // Play one round to completion
    await runSimRound();
    simRoundCount = round;

    // CHECK PENETRATION AFTER ROUND COMPLETES
    // If >= 75%, this was the LAST round of the shoe - flag for shuffle before next round
    const currentPen = (AppState.cardsDealt / AppState.totalCards) * 100;
    if (currentPen >= 75 && !needsShuffle) {
      console.log(`[SIM] Round ${round} hit ${currentPen.toFixed(1)}% penetration - LAST ROUND of shoe`);
      needsShuffle = true;  // Shuffle will happen BEFORE next round starts
    }

    // Pause between rounds
    await delay(realtimeSimSpeed * 2);

    // Clear for next round
    if (round < numGames) {
      clearTableForSim();
    }
  }

  // Finish
  realtimeSimRunning = false;
  hideSimulationControls();
  endGameSession();
  showToast(`Simulation complete: ${simRoundCount} rounds`, 'success');
  showHistoryPanel();
  } catch (error) {
    console.error('Realtime simulation error:', error);
    showToast(`Simulation error: ${error.message}`, 'error');
    realtimeSimRunning = false;
    hideSimulationControls();
  }
}

// Simulate 1 shoe only (until 75% penetration)
async function simulateOneShoe() {
  if (realtimeSimRunning) {
    showToast('Simulation already running', 'warning');
    return;
  }

  realtimeSimRunning = true;
  realtimeSimPaused = false;
  simRoundCount = 0;

  showSimulationControls();
  initGameSession('Test Casino', '1 Shoe Test - 8 Decks');
  resetShoe();
  clearTableForSim();

  await showCutCardAnimation();
  await diceCardBurn(); // Dice card rule: 1 face-up + 2 burned

  const penetrationLimit = AppState.totalCards * 0.75; // 75% = 312 cards for 8 decks
  showToast(`Testing 1 shoe: ${AppState.numDecks} decks, ${AppState.totalCards} cards`, 'info');

  let round = 0;
  while (AppState.cardsDealt < penetrationLimit && realtimeSimRunning) {
    while (realtimeSimPaused && realtimeSimRunning) {
      await delay(100);
    }
    if (!realtimeSimRunning) break;

    round++;
    updateSimStatus(`Round ${round} | Cards: ${AppState.cardsDealt}/${Math.round(penetrationLimit)}`);

    await runSimRound();
    simRoundCount = round;

    await delay(realtimeSimSpeed * 2);

    if (AppState.cardsDealt < penetrationLimit) {
      clearTableForSim();
    }
  }

  realtimeSimRunning = false;
  hideSimulationControls();
  endGameSession();

  // Show summary
  const stats = AppState.gameHistory.statistics;
  const winRate = stats.totalRounds > 0 ? ((stats.playerWins / (stats.playerWins + stats.playerLosses)) * 100).toFixed(1) : 0;

  showToast(`Shoe complete: ${simRoundCount} rounds | Win Rate: ${winRate}%`, 'success');
  showHistoryPanel();
}

async function runSimRound() {
  try {
    const roundCards = [];
    const playerCount = simPlayerCount || 7;
    const settings = AppState.quantEvSettings;

    // QUANT EV PLAYER (P5) DYNAMIC ENTRY/EXIT LOGIC:
    // Round 1: P5 always enters
    // If sitting out: Re-enter when TC >= 0.9
    // After round: Exit if TC < 0
    const tcBeforeDeal = getTrueCount();
    const isFirstRound = simRoundCount === 1;
    const quantEvPlayer = settings.quantEvPlayerIndex || 4;  // P4 is Quant EV player, P5 is Sacrifice player

    // Determine if Quant EV player (P5) plays this round
    let quantEvSitsOut = false;

    if (isFirstRound) {
      // Round 1: P5 always enters
      settings.quantEvSittingOut = false;
      quantEvSitsOut = false;
    } else if (settings.quantEvSittingOut) {
      // P5 is sitting out - check if TC >= 0.9 to re-enter
      if (tcBeforeDeal >= settings.quantEvReentryThreshold) {
        settings.quantEvSittingOut = false;
        quantEvSitsOut = false;
        console.log(`[SIM] P${quantEvPlayer} RE-ENTERS: TC ${tcBeforeDeal.toFixed(2)} >= ${settings.quantEvReentryThreshold}`);
      } else {
        quantEvSitsOut = true;
        console.log(`[SIM] P${quantEvPlayer} SITS OUT: TC ${tcBeforeDeal.toFixed(2)} < ${settings.quantEvReentryThreshold}`);
      }
    } else {
      // P5 is active, continue playing
      quantEvSitsOut = false;
    }

    // ============================================
    // EUROPEAN NO HOLE CARD (ENHC) DEALING SEQUENCE
    // ============================================
    // This dealing sequence is CRUCIAL for Sacrifice Strategy:
    // 1. All players get first card (cards 1-5)
    // 2. Dealer gets ONLY upcard (card 6) - NO HOLE CARD
    // 3. All players get second card (cards 7-11)
    // 4. Players make decisions
    // 5. THEN dealer draws until soft 17+
    //
    // This gives P5 maximum information - they see 11 cards
    // before dealer draws ANY additional cards!
    // ============================================

    // Deal first card to each player (cards 1-5)
    for (let p = 1; p <= playerCount; p++) {
      if (p === quantEvPlayer && quantEvSitsOut) {
        continue; // Skip dealing to sitting out player
      }
      await simDeal(`player${p}`, roundCards);
    }

    // Dealer gets ONLY ONE UPCARD (card 6) - European No Hole Card rule
    await simDeal('dealer', roundCards);

    // Deal second card to each player (cards 7-11)
    // NO second card to dealer yet - dealer draws AFTER all players act
    for (let p = 1; p <= playerCount; p++) {
      if (p === quantEvPlayer && quantEvSitsOut) {
        continue; // Skip dealing to sitting out player
      }
      await simDeal(`player${p}`, roundCards);
    }
    // NOTE: Dealer does NOT get second card here - only after all players finish

    if (!realtimeSimRunning) return;

    // Show unified decisions after dealing (skip P5 if sitting out)
    for (let p = 1; p <= playerCount; p++) {
      if (p === quantEvPlayer && quantEvSitsOut) continue;
      showUnifiedDecisionSim(p);
    }

    await delay(realtimeSimSpeed);

    const dealerUp = AppState.positions.dealer[0];
    const dealerVal = getValue(dealerUp);

    // Players hit/stand using unified decision engine (skip P5 if sitting out)
    for (let p = 1; p <= playerCount; p++) {
      if (p === quantEvPlayer && quantEvSitsOut) continue;
      await simPlayerPlay(`player${p}`, dealerVal, roundCards);
    }

    if (!realtimeSimRunning) return;

    // Clear unified decisions before dealer plays
    for (let p = 1; p <= playerCount; p++) {
      if (p === quantEvPlayer && quantEvSitsOut) continue;
      clearUnifiedDecisionSim(p);
    }

    // Dealer plays
    await simDealerPlay(roundCards);

    // Results (skip P5 if sitting out)
    const dTotal = calculateHandTotal(AppState.positions.dealer);
    for (let p = 1; p <= playerCount; p++) {
      if (p === quantEvPlayer && quantEvSitsOut) continue;
      simResult(`player${p}`, p, dTotal);
    }

    // Record
    AppState.gameHistory.statistics.totalRounds++;

    // LIVE TRACKER - Update tracker after each round (pass quantEvSitsOut and TC before deal)
    trackLiveSimRound(playerCount, dTotal, quantEvSitsOut, tcBeforeDeal, quantEvPlayer);

    // P5 EXIT CHECK: If TC is negative after round, P5 sits out next round
    const tcAfterRound = getTrueCount();
    if (tcAfterRound < 0 && !quantEvSitsOut) {
      settings.quantEvSittingOut = true;
      console.log(`[SIM] P${quantEvPlayer} EXITS: TC ${tcAfterRound.toFixed(2)} < 0 (will re-enter at TC >= ${settings.quantEvReentryThreshold})`);
    }
  } catch (error) {
    console.error('Round error:', error);
    throw error;
  }
}

// Track live simulation round for Quant EV panel
// TEAMPLAY: P1-P3 Basic, P4 Quant EV, P5 Sacrifice
function trackLiveSimRound(playerCount, dealerTotal, quantEvSitsOut = false, tcBeforeDeal = null, quantEvPlayer = 4) {
  const tracker = AppState.quantEvTracker;
  if (!tracker.enabled) return;

  tracker.roundNumber++;

  const tc = tcBeforeDeal !== null ? tcBeforeDeal : getTrueCount();
  const settings = AppState.quantEvSettings;
  const baseUnit = settings.baseUnit;
  const sacrificePlayer = settings.sacrificePlayerIndex || 5;

  const roundData = {
    round: tracker.roundNumber,
    tc: tc,
    rc: AppState.runningCount,
    dealerCards: [...(AppState.positions.dealer || [])],
    dealerTotal: dealerTotal,
    players: {}
  };

  for (let i = 1; i <= playerCount; i++) {
    const cards = AppState.positions[`player${i}`] || [];

    // Use passed quantEvSitsOut for Quant EV player (P4), others always play
    const playerEnters = (i === quantEvPlayer) ? !quantEvSitsOut : true;

    // Determine bet amount and strategy based on player role
    // P1-P3: Basic Strategy with flat betting
    // P4: Quant EV + Martingale betting
    // P5: Sacrifice Strategy with flat betting (sacrifices for team)
    let betAmount = baseUnit;
    let strategyUsed = 'BASIC';

    if (i === quantEvPlayer && playerEnters) {
      // P4: Quant EV + Martingale betting
      betAmount = settings.martingaleCurrentBet;
      strategyUsed = 'QUANT EV';
    } else if (i === sacrificePlayer) {
      // P5: Sacrifice Strategy (flat betting, plays for team)
      strategyUsed = 'SACRIFICE';
    }

    if (cards.length >= 2 && playerEnters) {
      let decision;
      if (i === quantEvPlayer) {
        // P4: Quant EV decision
        decision = getUnifiedDecision(i);
      } else if (i === sacrificePlayer) {
        // P5: Sacrifice decision
        const otherPlayersCards = [];
        for (let p = 1; p <= 4; p++) {
          const pCards = AppState.positions[`player${p}`];
          if (pCards && pCards.length > 0) otherPlayersCards.push(pCards);
        }
        decision = getSacrificeDecision(cards, AppState.positions.dealer[0], otherPlayersCards);
      } else {
        // P1-P3: Basic strategy only
        decision = getBasicStrategyDecision(i);
      }

      const total = calculateHandTotal(cards);
      const isBJ = cards.length === 2 && total === 21;

      // Determine result
      let playerResult;
      if (total > 21) {
        playerResult = 'BUST';
      } else if (isBJ) {
        playerResult = dealerTotal === 21 && AppState.positions.dealer.length === 2 ? 'PUSH' : 'BLACKJACK';
      } else if (dealerTotal > 21) {
        playerResult = 'WIN';
      } else if (total > dealerTotal) {
        playerResult = 'WIN';
      } else if (total < dealerTotal) {
        playerResult = 'LOSS';
      } else {
        playerResult = 'PUSH';
      }

      roundData.players[i] = {
        cards: [...cards],
        total: total,
        isBJ: isBJ,
        quantEvAction: decision ? decision.action : 'N/A',
        isDeviation: (i === quantEvPlayer) ? (decision ? decision.strategy?.isDeviation : false) : false,
        isSacrifice: (i === sacrificePlayer),
        sacrificeIntent: (i === sacrificePlayer && decision) ? decision.sacrificeIntent : null,
        result: playerResult,
        betAmount: betAmount,
        strategy: strategyUsed
      };

      // Update player stats
      const player = tracker.players[i];
      player.totalDecisions++;

      if (playerResult === 'WIN') {
        player.wins++;
        player.bankroll += betAmount;
        player.correctDecisions++;
        // P4 Martingale: Reset to base bet after win
        if (i === quantEvPlayer) {
          settings.martingaleCurrentBet = baseUnit;
          settings.martingaleLossStreak = 0;
        }
      } else if (playerResult === 'LOSS' || playerResult === 'BUST') {
        player.losses++;
        player.bankroll -= betAmount;
        // P4 Martingale: Double bet after loss
        if (i === quantEvPlayer) {
          settings.martingaleLossStreak++;
          settings.martingaleCurrentBet = Math.min(betAmount * 2, settings.martingaleMaxBet);
        }
        // P5 Sacrifice: Bust may be intentional (mission accomplished)
        if (i === sacrificePlayer && playerResult === 'BUST') {
          player.correctDecisions++; // Sacrifice bust is a success for team
        }
      } else if (playerResult === 'PUSH') {
        player.pushes++;
        player.correctDecisions++;
        // Martingale: Keep same bet on push
      } else if (playerResult === 'BLACKJACK') {
        player.wins++;
        player.bjs++;
        player.bankroll += Math.round(betAmount * 1.5);
        player.correctDecisions++;
        // P4 Martingale: Reset to base bet after BJ win
        if (i === quantEvPlayer) {
          settings.martingaleCurrentBet = baseUnit;
          settings.martingaleLossStreak = 0;
        }
      }
    } else if (i === quantEvPlayer && !playerEnters) {
      // Quant EV player (P4) sat out this round
      roundData.players[i] = {
        cards: [],
        total: 0,
        isBJ: false,
        quantEvAction: 'SAT OUT',
        isDeviation: false,
        result: 'SAT OUT',
        betAmount: 0,
        strategy: 'QUANT EV'
      };
    }
  }

  tracker.history.push(roundData);

  // Update panel live
  updateQuantEvPanel();
  logQuantEvRound(roundData);

  // Record to betting history
  if (AppState.bettingHistory.enabled && AppState.bettingHistory.currentGame) {
    recordBettingHistoryRound(roundData, playerCount, quantEvPlayer);
  }

  // Record dealer bust history
  if (AppState.dealerBustHistory.enabled) {
    recordDealerBustHistory(roundData, dealerTotal, sacrificePlayer);
  }
}

// ============================================
// DEALER BUST HISTORY FUNCTIONS
// ============================================

function recordDealerBustHistory(roundData, dealerTotal, sacrificePlayer = 5) {
  const history = AppState.dealerBustHistory;
  const dealerCards = roundData.dealerCards || [];
  const dealerUpcard = dealerCards[0];
  const dealerBusted = dealerTotal > 21;

  // Get upcard value for tracking
  let upcardVal = dealerUpcard === 'A' ? 11 : (parseInt(dealerUpcard) || 10);
  if (['K', 'Q', 'J'].includes(dealerUpcard)) upcardVal = 10;

  // Update totals
  history.totalRounds++;
  if (dealerBusted) {
    history.totalBusts++;
  }
  history.bustRate = (history.totalBusts / history.totalRounds * 100).toFixed(1);

  // Track by upcard
  if (history.bustsByUpcard[upcardVal]) {
    history.bustsByUpcard[upcardVal].total++;
    if (dealerBusted) {
      history.bustsByUpcard[upcardVal].busts++;
    }
  }

  // Get P5 sacrifice data
  const p5Data = roundData.players[sacrificePlayer];
  const p5Result = p5Data ? p5Data.result : null;
  const p5Intent = p5Data ? p5Data.sacrificeIntent : null;
  const p5Cards = p5Data ? p5Data.cards : [];
  const p5Total = p5Data ? p5Data.total : 0;

  // Track sacrifice correlation
  if (p5Data) {
    if (p5Result === 'BUST') {
      history.sacrificeCorrelation.p5Busted.rounds++;
      if (dealerBusted) history.sacrificeCorrelation.p5Busted.dealerBusted++;
    } else if (p5Intent && p5Intent.includes('ABSORB')) {
      history.sacrificeCorrelation.p5Absorbed.rounds++;
      if (dealerBusted) history.sacrificeCorrelation.p5Absorbed.dealerBusted++;
    } else {
      history.sacrificeCorrelation.p5Stood.rounds++;
      if (dealerBusted) history.sacrificeCorrelation.p5Stood.dealerBusted++;
    }
  }

  // Record bust event with details
  if (dealerBusted) {
    const bustEvent = {
      round: roundData.round,
      timestamp: new Date().toISOString(),
      dealerCards: [...dealerCards],
      dealerTotal: dealerTotal,
      dealerUpcard: dealerUpcard,
      upcardValue: upcardVal,
      tc: roundData.tc,
      rc: roundData.rc,
      bustCard: dealerCards.length > 2 ? dealerCards[dealerCards.length - 1] : dealerCards[1],
      p5Action: p5Intent || 'BASIC',
      p5Result: p5Result,
      p5Cards: p5Cards,
      p5Total: p5Total,
      p5Contributed: p5Result === 'BUST' || (p5Intent && p5Intent.includes('ABSORB'))
    };

    history.busts.unshift(bustEvent);  // Add to front (newest first)

    // Keep only last 100 bust events
    if (history.busts.length > 100) {
      history.busts = history.busts.slice(0, 100);
    }
  }

  // Update UI
  updateDealerBustHistoryPanel();
}

function resetDealerBustHistory() {
  AppState.dealerBustHistory = {
    enabled: true,
    totalRounds: 0,
    totalBusts: 0,
    bustRate: 0,
    busts: [],
    bustsByUpcard: {
      2: { total: 0, busts: 0 },
      3: { total: 0, busts: 0 },
      4: { total: 0, busts: 0 },
      5: { total: 0, busts: 0 },
      6: { total: 0, busts: 0 },
      7: { total: 0, busts: 0 },
      8: { total: 0, busts: 0 },
      9: { total: 0, busts: 0 },
      10: { total: 0, busts: 0 },
      11: { total: 0, busts: 0 }
    },
    sacrificeCorrelation: {
      p5Busted: { rounds: 0, dealerBusted: 0 },
      p5Absorbed: { rounds: 0, dealerBusted: 0 },
      p5Stood: { rounds: 0, dealerBusted: 0 }
    }
  };
  updateDealerBustHistoryPanel();
}

function updateDealerBustHistoryPanel() {
  const panel = document.getElementById('dealerBustHistoryPanel');
  if (!panel) return;

  const history = AppState.dealerBustHistory;
  const settings = AppState.quantEvSettings;
  const sacrificePlayer = settings.sacrificePlayerIndex || 5;

  // Calculate sacrifice effectiveness
  const sacCorr = history.sacrificeCorrelation;
  const p5BustedRate = sacCorr.p5Busted.rounds > 0
    ? (sacCorr.p5Busted.dealerBusted / sacCorr.p5Busted.rounds * 100).toFixed(0)
    : '0';
  const p5AbsorbedRate = sacCorr.p5Absorbed.rounds > 0
    ? (sacCorr.p5Absorbed.dealerBusted / sacCorr.p5Absorbed.rounds * 100).toFixed(0)
    : '0';
  const p5StoodRate = sacCorr.p5Stood.rounds > 0
    ? (sacCorr.p5Stood.dealerBusted / sacCorr.p5Stood.rounds * 100).toFixed(0)
    : '0';

  let html = `
    <div class="bust-history-header">
      <div class="bust-rate-main">
        <span class="bust-rate-label">DEALER BUST RATE</span>
        <span class="bust-rate-value ${parseFloat(history.bustRate) > 35 ? 'high' : ''}">${history.bustRate}%</span>
        <span class="bust-rate-count">(${history.totalBusts}/${history.totalRounds})</span>
      </div>
      <div class="expected-rate">Expected: 28.0%</div>
    </div>

    <div class="bust-by-upcard">
      <div class="upcard-title">BUST RATE BY UPCARD</div>
      <div class="upcard-grid">
  `;

  // Upcard bust rates
  const upcardLabels = { 2:'2', 3:'3', 4:'4', 5:'5', 6:'6', 7:'7', 8:'8', 9:'9', 10:'10', 11:'A' };
  const expectedBust = { 2:35, 3:37, 4:40, 5:42, 6:42, 7:26, 8:24, 9:23, 10:21, 11:17 };

  for (let u = 2; u <= 11; u++) {
    const data = history.bustsByUpcard[u];
    const rate = data.total > 0 ? (data.busts / data.total * 100).toFixed(0) : '-';
    const isHigh = rate !== '-' && parseFloat(rate) > expectedBust[u];
    html += `<div class="upcard-cell ${isHigh ? 'high' : ''}">
      <span class="upcard-label">${upcardLabels[u]}</span>
      <span class="upcard-rate">${rate}%</span>
      <span class="upcard-exp">(${expectedBust[u]}%)</span>
    </div>`;
  }

  html += `</div></div>

    <div class="sacrifice-correlation">
      <div class="sac-title">P${sacrificePlayer} SACRIFICE EFFECTIVENESS</div>
      <div class="sac-grid">
        <div class="sac-cell">
          <span class="sac-label">P5 BUSTED</span>
          <span class="sac-rate ${parseFloat(p5BustedRate) > 50 ? 'high' : ''}">${p5BustedRate}%</span>
          <span class="sac-count">(${sacCorr.p5Busted.dealerBusted}/${sacCorr.p5Busted.rounds})</span>
        </div>
        <div class="sac-cell">
          <span class="sac-label">P5 ABSORBED</span>
          <span class="sac-rate ${parseFloat(p5AbsorbedRate) > 40 ? 'high' : ''}">${p5AbsorbedRate}%</span>
          <span class="sac-count">(${sacCorr.p5Absorbed.dealerBusted}/${sacCorr.p5Absorbed.rounds})</span>
        </div>
        <div class="sac-cell">
          <span class="sac-label">P5 STOOD</span>
          <span class="sac-rate">${p5StoodRate}%</span>
          <span class="sac-count">(${sacCorr.p5Stood.dealerBusted}/${sacCorr.p5Stood.rounds})</span>
        </div>
      </div>
    </div>

    <div class="bust-log-title">RECENT DEALER BUSTS</div>
    <div class="bust-log">
  `;

  // Show last 10 bust events
  const recentBusts = history.busts.slice(0, 10);
  if (recentBusts.length === 0) {
    html += `<div class="bust-empty">No dealer busts recorded yet</div>`;
  } else {
    for (const bust of recentBusts) {
      const p5Badge = bust.p5Contributed
        ? `<span class="p5-contributed">P5 CONTRIBUTED</span>`
        : '';
      html += `
        <div class="bust-entry">
          <div class="bust-round">R${bust.round}</div>
          <div class="bust-cards">[${bust.dealerCards.join(' ')}] = ${bust.dealerTotal}</div>
          <div class="bust-tc">TC: ${bust.tc.toFixed(1)}</div>
          <div class="bust-p5">${bust.p5Action} ${p5Badge}</div>
        </div>
      `;
    }
  }

  html += `</div>`;

  panel.innerHTML = html;
}

function toggleDealerBustHistoryPanel() {
  const container = document.getElementById('dealerBustHistoryContainer');
  const panel = document.getElementById('dealerBustHistoryPanel');
  const icon = document.getElementById('dealerBustToggleIcon');

  if (!container || !panel) return;

  const isHidden = panel.style.display === 'none';
  panel.style.display = isHidden ? 'block' : 'none';
  if (icon) icon.textContent = isHidden ? '▼' : '▲';

  if (isHidden) {
    updateDealerBustHistoryPanel();
  }
}

// ============================================
// BETTING HISTORY FUNCTIONS
// ============================================

// Start a new game session
function startNewGame(playerCount = 5) {
  const history = AppState.bettingHistory;

  // End any current game first
  if (history.currentGame) {
    endCurrentGame();
  }

  // Reset dealer bust history for new game
  resetDealerBustHistory();

  history.currentGameNumber++;

  // Create new game record
  history.currentGame = {
    gameNumber: history.currentGameNumber,
    startTime: new Date().toISOString(),
    endTime: null,
    totalRounds: 0,
    players: {}
  };

  // Initialize each player's game stats
  for (let p = 1; p <= playerCount; p++) {
    history.currentGame.players[p] = {
      startingCapital: history.playerCapitals[p] || history.defaultStartingCapital,
      accumulatedCapital: history.playerCapitals[p] || history.defaultStartingCapital,
      profitLoss: 0,
      roundsWin: 0,
      roundsLost: 0,
      roundsPush: 0,
      roundDetails: []
    };
  }

  console.log(`[BETTING HISTORY] Game ${history.currentGameNumber} started`);
  updateBettingHistoryPanel();
}

// Record a round to betting history
function recordBettingHistoryRound(roundData, playerCount = 5, quantEvPlayer = 4) {
  const history = AppState.bettingHistory;
  if (!history.currentGame) return;

  history.currentGame.totalRounds++;

  for (let p = 1; p <= playerCount; p++) {
    const playerRound = roundData.players[p];
    if (!playerRound || playerRound.result === 'SAT OUT') continue;

    const playerGame = history.currentGame.players[p];
    if (!playerGame) continue;

    const betAmount = playerRound.betAmount || AppState.quantEvSettings.baseUnit;
    let payout = 0;

    // Calculate payout
    if (playerRound.result === 'WIN') {
      payout = betAmount;
      playerGame.roundsWin++;
    } else if (playerRound.result === 'BLACKJACK') {
      payout = Math.round(betAmount * 1.5);
      playerGame.roundsWin++;
    } else if (playerRound.result === 'LOSS' || playerRound.result === 'BUST') {
      payout = -betAmount;
      playerGame.roundsLost++;
    } else if (playerRound.result === 'PUSH') {
      payout = 0;
      playerGame.roundsPush++;
    }

    // Update capitals
    playerGame.accumulatedCapital += payout;
    playerGame.profitLoss = playerGame.accumulatedCapital - playerGame.startingCapital;

    // Record round detail
    playerGame.roundDetails.push({
      round: history.currentGame.totalRounds,
      bet: betAmount,
      result: playerRound.result,
      payout: payout,
      capital: playerGame.accumulatedCapital
    });
  }

  // Update panel
  updateBettingHistoryPanel();
}

// End current game and save to history
function endCurrentGame() {
  const history = AppState.bettingHistory;
  if (!history.currentGame) return;

  history.currentGame.endTime = new Date().toISOString();

  // Update player capitals for next game (progressive)
  for (let p = 1; p <= 5; p++) {
    if (history.currentGame.players[p]) {
      history.playerCapitals[p] = history.currentGame.players[p].accumulatedCapital;
    }
  }

  // Save to games array
  history.games.push(JSON.parse(JSON.stringify(history.currentGame)));

  console.log(`[BETTING HISTORY] Game ${history.currentGame.gameNumber} ended. Total rounds: ${history.currentGame.totalRounds}`);

  history.currentGame = null;
  updateBettingHistoryPanel();
}

// Format number with commas for display
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Export betting history to CSV
function exportBettingHistoryCSV() {
  const history = AppState.bettingHistory;

  // If current game is active, include it
  let allGames = [...history.games];
  if (history.currentGame) {
    allGames.push(history.currentGame);
  }

  if (allGames.length === 0) {
    alert('No game history to export.');
    return;
  }

  // Add BOM for Excel UTF-8 compatibility
  let csv = '\uFEFF';

  // Generate CSV for each game
  allGames.forEach(game => {
    csv += `GAME ${game.gameNumber} RESULTS\n`;
    csv += `Start Time,${game.startTime}\n`;
    csv += `End Time,${game.endTime || 'In Progress'}\n`;
    csv += `Total Rounds,${game.totalRounds}\n\n`;

    // Header row
    csv += 'PLAYER,STARTING CAPITAL,ACCUMULATED CAPITAL,P/L,W/L %,ROUNDS WIN,ROUNDS LOST,ROUNDS PUSH,WIN RATE %\n';

    // Player rows
    let totalStarting = 0;
    let totalAccumulated = 0;
    let totalPL = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalPushes = 0;

    for (let p = 1; p <= 5; p++) {
      const player = game.players[p];
      if (!player) continue;

      // Calculate accumulated capital if not set
      const accumulatedCapital = player.accumulatedCapital || (player.startingCapital + player.profitLoss);

      const wlPercent = player.startingCapital > 0
        ? ((player.profitLoss / player.startingCapital) * 100).toFixed(2)
        : '0.00';
      const decided = player.roundsWin + player.roundsLost;
      const winRate = decided > 0
        ? ((player.roundsWin / decided) * 100).toFixed(2)
        : '0.00';

      csv += `PLAYER ${p},`;
      csv += `"P${formatNumber(player.startingCapital)}",`;
      csv += `"P${formatNumber(accumulatedCapital)}",`;
      csv += `"P${player.profitLoss >= 0 ? '+' : ''}${formatNumber(player.profitLoss)}",`;
      csv += `${wlPercent}%,`;
      csv += `${player.roundsWin},`;
      csv += `${player.roundsLost},`;
      csv += `${player.roundsPush},`;
      csv += `${winRate}%\n`;

      totalStarting += player.startingCapital;
      totalAccumulated += accumulatedCapital;
      totalPL += player.profitLoss;
      totalWins += player.roundsWin;
      totalLosses += player.roundsLost;
      totalPushes += player.roundsPush;
    }

    // Total row
    const totalWLPercent = totalStarting > 0
      ? ((totalPL / totalStarting) * 100).toFixed(2)
      : '0.00';
    const totalDecided = totalWins + totalLosses;
    const totalWinRate = totalDecided > 0
      ? ((totalWins / totalDecided) * 100).toFixed(2)
      : '0.00';

    csv += `TOTAL,`;
    csv += `"P${formatNumber(totalStarting)}",`;
    csv += `"P${formatNumber(totalAccumulated)}",`;
    csv += `"P${totalPL >= 0 ? '+' : ''}${formatNumber(totalPL)}",`;
    csv += `${totalWLPercent}%,`;
    csv += `${totalWins},`;
    csv += `${totalLosses},`;
    csv += `${totalPushes},`;
    csv += `${totalWinRate}%\n`;

    csv += '\n\n';
  });

  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  link.href = URL.createObjectURL(blob);
  link.download = `betting_history_${timestamp}.csv`;
  link.click();

  console.log('[BETTING HISTORY] Exported to CSV');
}

// Reset betting history (start fresh)
function resetBettingHistory() {
  const history = AppState.bettingHistory;
  history.currentGameNumber = 0;
  history.games = [];
  history.currentGame = null;
  history.playerCapitals = {
    1: history.defaultStartingCapital,
    2: history.defaultStartingCapital,
    3: history.defaultStartingCapital,
    4: history.defaultStartingCapital,
    5: history.defaultStartingCapital
  };

  console.log('[BETTING HISTORY] Reset complete');
  updateBettingHistoryPanel();
}

// Toggle betting history panel visibility
function toggleBettingHistoryPanel() {
  const panel = document.getElementById('bettingHistoryPanel');
  const icon = document.getElementById('bettingHistoryToggleIcon');
  if (!panel) return;

  panel.classList.toggle('expanded');
  if (panel.classList.contains('expanded')) {
    icon.textContent = '▲';
    updateBettingHistoryPanel();
  } else {
    icon.textContent = '▼';
  }
}

// Update betting history panel display
function updateBettingHistoryPanel() {
  const panel = document.getElementById('bettingHistoryPanel');
  if (!panel) return;

  const history = AppState.bettingHistory;
  const game = history.currentGame;

  if (!game) {
    panel.innerHTML = `
      <div class="history-header">
        <span>BETTING HISTORY</span>
        <span>No Active Game</span>
      </div>
      <div class="history-actions">
        <button onclick="startNewGame(5)" class="btn-small">Start New Game</button>
        <button onclick="exportBettingHistoryCSV()" class="btn-small">Export CSV</button>
      </div>
    `;
    return;
  }

  let html = `
    <div class="history-header">
      <span>GAME ${game.gameNumber} - Round ${game.totalRounds}</span>
      <div>
        <button onclick="endCurrentGame()" class="btn-small btn-danger">End Game</button>
        <button onclick="exportBettingHistoryCSV()" class="btn-small">Export</button>
      </div>
    </div>
    <table class="history-table">
      <thead>
        <tr>
          <th>PLAYER</th>
          <th>START</th>
          <th>CURRENT</th>
          <th>P/L</th>
          <th>W</th>
          <th>L</th>
          <th>P</th>
          <th>WR%</th>
        </tr>
      </thead>
      <tbody>
  `;

  let totalStart = 0, totalCurrent = 0, totalPL = 0;
  let totalW = 0, totalL = 0, totalP = 0;

  for (let p = 1; p <= 5; p++) {
    const player = game.players[p];
    if (!player) continue;

    const decided = player.roundsWin + player.roundsLost;
    const wr = decided > 0 ? ((player.roundsWin / decided) * 100).toFixed(0) : '0';
    const plClass = player.profitLoss >= 0 ? 'profit' : 'loss';

    html += `
      <tr>
        <td>P${p}</td>
        <td>${(player.startingCapital / 1000).toFixed(0)}K</td>
        <td>${(player.accumulatedCapital / 1000).toFixed(0)}K</td>
        <td class="${plClass}">${player.profitLoss >= 0 ? '+' : ''}${(player.profitLoss / 1000).toFixed(1)}K</td>
        <td class="win">${player.roundsWin}</td>
        <td class="loss">${player.roundsLost}</td>
        <td>${player.roundsPush}</td>
        <td>${wr}%</td>
      </tr>
    `;

    totalStart += player.startingCapital;
    totalCurrent += player.accumulatedCapital;
    totalPL += player.profitLoss;
    totalW += player.roundsWin;
    totalL += player.roundsLost;
    totalP += player.roundsPush;
  }

  const totalDecided = totalW + totalL;
  const totalWR = totalDecided > 0 ? ((totalW / totalDecided) * 100).toFixed(0) : '0';
  const totalPLClass = totalPL >= 0 ? 'profit' : 'loss';

  html += `
      <tr class="total-row">
        <td><strong>TOTAL</strong></td>
        <td>${(totalStart / 1000).toFixed(0)}K</td>
        <td>${(totalCurrent / 1000).toFixed(0)}K</td>
        <td class="${totalPLClass}"><strong>${totalPL >= 0 ? '+' : ''}${(totalPL / 1000).toFixed(1)}K</strong></td>
        <td class="win">${totalW}</td>
        <td class="loss">${totalL}</td>
        <td>${totalP}</td>
        <td><strong>${totalWR}%</strong></td>
      </tr>
    </tbody>
  </table>
  `;

  panel.innerHTML = html;
}

// Basic Strategy Decision (no card counting, no deviations) for P2-P7
function getBasicStrategyDecision(playerNum) {
  const cards = AppState.positions[`player${playerNum}`] || [];
  if (cards.length < 2) return null;

  const dealerUp = AppState.positions.dealer[0];
  const dealerVal = getValue(dealerUp);
  const total = calculateHandTotal(cards);
  const isSoft = cards.includes('A') && total <= 21 && (total - 11 + 1) <= 21;
  const isPair = cards.length === 2 && getValue(cards[0]) === getValue(cards[1]);

  let action = 'STAY';

  // Basic Strategy Tables (simplified)
  if (isPair) {
    // Pair splitting
    const pairVal = getValue(cards[0]);
    if (pairVal === 11) action = 'SPLIT'; // Always split Aces
    else if (pairVal === 8) action = 'SPLIT'; // Always split 8s
    else if (pairVal === 10) action = 'STAY'; // Never split 10s
    else if (pairVal === 5) action = dealerVal >= 10 ? 'HIT' : 'DBL'; // 5s: double or hit
    else if (pairVal === 4) action = (dealerVal === 5 || dealerVal === 6) ? 'SPLIT' : 'HIT';
    else if (pairVal === 9) action = (dealerVal === 7 || dealerVal >= 10) ? 'STAY' : 'SPLIT';
    else if (pairVal === 7) action = dealerVal <= 7 ? 'SPLIT' : 'HIT';
    else if (pairVal === 6) action = dealerVal <= 6 ? 'SPLIT' : 'HIT';
    else if (pairVal === 3 || pairVal === 2) action = dealerVal <= 7 ? 'SPLIT' : 'HIT';
  } else if (isSoft) {
    // Soft hands
    if (total >= 19) action = 'STAY';
    else if (total === 18) action = dealerVal >= 9 ? 'HIT' : 'STAY';
    else if (total === 17) action = (dealerVal >= 3 && dealerVal <= 6) ? 'DBL' : 'HIT';
    else if (total >= 15 && total <= 16) action = (dealerVal >= 4 && dealerVal <= 6) ? 'DBL' : 'HIT';
    else if (total >= 13 && total <= 14) action = (dealerVal >= 5 && dealerVal <= 6) ? 'DBL' : 'HIT';
    else action = 'HIT';
  } else {
    // Hard hands - Pure Basic Strategy (no surrender, no overrides for P1-P4)
    if (total >= 17) action = 'STAY';
    else if (total >= 13 && total <= 16) action = dealerVal <= 6 ? 'STAY' : 'HIT';
    else if (total === 12) action = (dealerVal >= 4 && dealerVal <= 6) ? 'STAY' : 'HIT';
    else if (total === 11) action = 'DBL';
    else if (total === 10) action = dealerVal <= 9 ? 'DBL' : 'HIT';
    else if (total === 9) action = (dealerVal >= 3 && dealerVal <= 6) ? 'DBL' : 'HIT';
    else action = 'HIT';
  }

  return {
    action: action,
    strategy: { reason: 'Basic Strategy', isDeviation: false, isSurrender: false },
    confidence: 100
  };
}

// Show unified decision during simulation
function showUnifiedDecisionSim(playerNum) {
  // P5 uses Quant EV (with overrides/surrender), P1-P4 use Basic Strategy only
  const quantEvPlayer = AppState.quantEvSettings.quantEvPlayerIndex || 4;
  const decision = (playerNum === quantEvPlayer) ? getUnifiedDecision(playerNum) : getBasicStrategyDecision(playerNum);
  if (!decision) return;

  const box = document.getElementById(`player${playerNum}`);
  if (!box) return;

  // Remove existing
  const existing = box.querySelector('.unified-decision');
  if (existing) existing.remove();

  // Create compact unified decision display
  const indicator = document.createElement('div');
  indicator.className = 'unified-decision compact';

  const actionClass = decision.action === 'HIT' ? 'hit' :
                      decision.action === 'STAY' ? 'stay' :
                      decision.action === 'DBL' ? 'double' :
                      decision.action === 'SPLIT' ? 'split' :
                      decision.action === 'SURRENDER' ? 'surrender' : '';

  const shortAction = decision.action === 'STAY' ? 'S' :
                      decision.action === 'HIT' ? 'H' :
                      decision.action === 'DBL' ? 'D' :
                      decision.action === 'SPLIT' ? 'P' :
                      decision.action === 'SURRENDER' ? 'R' : '?';

  if (actionClass) {
    indicator.classList.add(actionClass);
  }
  if (decision.strategy && decision.strategy.isDeviation) {
    indicator.classList.add('deviation');
  }

  // Different display for P5 (Quant EV) vs P1-P4 (Basic)
  if (playerNum === quantEvPlayer) {
    const isOverride = decision.strategy && decision.strategy.isOverride;
    indicator.innerHTML = `
      <div class="ud-main">
        <span class="ud-action">${shortAction}</span>
        <span class="ud-confidence">${decision.confidence}%</span>
        ${decision.strategy && decision.strategy.isDeviation ? '<span class="ud-i18">I18</span>' : ''}
        ${isOverride ? '<span class="ud-override" style="background:#ef4444;color:white;font-size:7px;padding:1px 3px;border-radius:2px;margin-left:2px;">OVR</span>' : ''}
      </div>
      <div class="ud-details">
        <span class="ud-edge ${decision.edge && decision.edge.isPositive ? 'positive' : 'negative'}">${decision.edge ? decision.edge.player : ''}</span>
        <span class="ud-bet-action">${decision.betting ? decision.betting.action : 'BET'} ×${decision.betting ? decision.betting.multiplier : 1}</span>
      </div>
      ${isOverride ? `<div style="font-size:7px;color:#ef4444;text-align:center;">Top2-5: ${decision.strategy.top2to5 ? decision.strategy.top2to5.join(',') : ''}</div>` : ''}
    `;
  } else {
    // Simpler display for Basic Strategy players
    indicator.innerHTML = `
      <div class="ud-main">
        <span class="ud-action">${shortAction}</span>
        <span class="ud-confidence" style="font-size: 8px;">BS</span>
      </div>
    `;
  }
  indicator.title = decision.strategy ? decision.strategy.reason : 'Basic Strategy';

  box.appendChild(indicator);
}

// Clear unified decision during simulation
function clearUnifiedDecisionSim(playerNum) {
  const box = document.getElementById(`player${playerNum}`);
  if (!box) return;
  const indicator = box.querySelector('.unified-decision');
  if (indicator) indicator.remove();
}

async function simDeal(pos, cards) {
  if (!realtimeSimRunning) return;

  const card = dealRandomCard();
  if (!card) return;

  AppState.positions[pos].push(card);
  cards.push(card);

  // Update display
  if (pos === 'dealer') {
    updateDealerCardsPanel();
    updateDealerTableCards();
  } else {
    updatePositionCards(pos);
  }
  updateSimCounts();

  await delay(realtimeSimSpeed);
}

async function simPlayerPlay(pos, dealerVal, cards) {
  if (!realtimeSimRunning) return;

  const playerNum = parseInt(pos.replace('player', ''));
  const dealerUpcard = AppState.positions.dealer[0];
  const settings = AppState.quantEvSettings;
  const quantEvPlayer = settings.quantEvPlayerIndex || 4;
  const sacrificePlayers = settings.sacrificePlayers || [3, 5];  // P3 and P5 are sacrifice players
  let hits = 0;

  // Determine player strategy:
  // P1-P2: Basic Strategy (foundation)
  // P3: P4 BOOSTER v1.0 (optimizes card flow for P4)
  // P4: Quant EV (getOptimalDecision with count-based deviations)
  // P5: Sacrifice v1.4 (late sacrifice - absorbs last)
  const isP3Booster = (playerNum === 3);
  const isP5Sacrifice = (playerNum === 5);
  const isQuantEvPlayer = (playerNum === quantEvPlayer);

  while (hits < 8 && realtimeSimRunning) {
    const playerCards = AppState.positions[pos];
    const total = calculateHandTotal(playerCards);

    if (total >= 21) break;

    let decision;

    if (isP3Booster) {
      // P3: P4 BOOSTER STRATEGY v1.0
      // Optimizes card flow specifically to benefit P4's outcomes
      const p1Cards = AppState.positions.player1 || [];
      const p2Cards = AppState.positions.player2 || [];
      decision = getP3BoosterDecision(playerCards, dealerUpcard, p1Cards, p2Cards);
      decision.strategyType = 'BOOST';
      if (decision.action === 'STAND') decision.action = 'STAY';
    } else if (isP5Sacrifice) {
      // P5: Use Sacrifice Strategy v1.4 (late sacrifice)
      // Sees P1-P4 cards before deciding
      // P5 SPECIAL: Can hit on hard 17+ to bust dealer
      const otherPlayersCards = [];
      for (let p = 1; p <= 4; p++) {
        const pCards = AppState.positions[`player${p}`];
        if (pCards && pCards.length > 0) {
          otherPlayersCards.push(pCards);
        }
      }
      decision = getSacrificeDecision(playerCards, dealerUpcard, otherPlayersCards, true);  // true = P5 can hit hard 17+
      decision.sacrificePosition = 'LATE';
      decision.strategyType = 'SAC';
      if (decision.action === 'STAND') decision.action = 'STAY';
    } else if (isQuantEvPlayer) {
      // P4: Use Quant EV with Illustrious 18 deviations
      decision = getOptimalDecision(playerCards, dealerUpcard);
    } else {
      // P1-P2: Use Basic Strategy only (no counting deviations)
      decision = getBasicStrategyDecision(playerNum);
      if (!decision) {
        // Fallback to optimal if basic strategy fails
        decision = getOptimalDecision(playerCards, dealerUpcard);
      }
    }

    // Show strategy indicator on player box
    showStrategyIndicator(pos, decision);

    await delay(realtimeSimSpeed / 2);

    // Execute the decision
    if (decision.action === 'STAY' || decision.action === 'STAND' || decision.action === 'SURRENDER') {
      break;
    } else if (decision.action === 'DBL' && playerCards.length === 2) {
      // Double: take one card and stop
      const card = dealRandomCard();
      if (card) {
        AppState.positions[pos].push(card);
        cards.push(card);
        updatePositionCards(pos);
        updateSimCounts();
      }
      break;
    } else if (decision.action === 'HIT') {
      const card = dealRandomCard();
      if (!card) break;

      AppState.positions[pos].push(card);
      cards.push(card);
      updatePositionCards(pos);
      updateSimCounts();
      hits++;

      await delay(realtimeSimSpeed);
    } else {
      // SPLIT or other - for simulation, just hit on low totals
      if (total <= 11 || (total <= 16 && dealerVal >= 7)) {
        const card = dealRandomCard();
        if (!card) break;
        AppState.positions[pos].push(card);
        cards.push(card);
        updatePositionCards(pos);
        updateSimCounts();
        hits++;
        await delay(realtimeSimSpeed);
      } else {
        break;
      }
    }
  }

  // Clear strategy indicator
  clearStrategyIndicator(pos);
}

// Show strategy recommendation indicator on player box
function showStrategyIndicator(pos, decision) {
  const box = document.getElementById(pos);
  if (!box) return;

  // Remove any existing indicator
  const existing = box.querySelector('.strategy-indicator');
  if (existing) existing.remove();

  // Create indicator
  const indicator = document.createElement('div');
  indicator.className = 'strategy-indicator';

  const actionClass = decision.action === 'HIT' ? 'hit' :
                      decision.action === 'STAY' ? 'stay' :
                      decision.action === 'DBL' ? 'double' :
                      decision.action === 'SPLIT' ? 'split' :
                      decision.action === 'SURRENDER' ? 'surrender' : 'hit';

  indicator.classList.add(actionClass);

  if (decision.isDeviation) {
    indicator.classList.add('deviation');
  }

  const label = decision.action === 'DBL' ? 'D' :
                decision.action === 'STAY' ? 'S' :
                decision.action === 'HIT' ? 'H' :
                decision.action === 'SPLIT' ? 'P' :
                decision.action === 'SURRENDER' ? 'R' : '?';

  indicator.innerHTML = `
    <span class="strategy-action">${label}</span>
    ${decision.isDeviation ? '<span class="deviation-badge">I18</span>' : ''}
  `;
  indicator.title = decision.reason;

  box.appendChild(indicator);
}

// Clear strategy indicator
function clearStrategyIndicator(pos) {
  const box = document.getElementById(pos);
  if (!box) return;
  const indicator = box.querySelector('.strategy-indicator');
  if (indicator) indicator.remove();
}

async function simDealerPlay(cards) {
  if (!realtimeSimRunning) return;

  // ============================================
  // EUROPEAN NO HOLE CARD (ENHC) DEALER PLAY
  // ============================================
  // Dealer starts with ONLY 1 upcard (dealt as card #6)
  // After all players finish, dealer draws until soft 17+
  // This is when the Sacrifice Strategy has maximum impact!
  // ============================================

  // Check if all players busted - dealer doesn't need to draw
  const playerCount = simPlayerCount || 5;
  let allBusted = true;
  for (let p = 1; p <= playerCount; p++) {
    const pCards = AppState.positions[`player${p}`];
    if (pCards && pCards.length > 0) {
      const pTotal = calculateHandTotal(pCards);
      if (pTotal <= 21) {
        allBusted = false;
        break;
      }
    }
  }
  if (allBusted) {
    console.log('[ENHC] All players busted - dealer wins automatically');
    return;
  }

  let total = calculateHandTotal(AppState.positions.dealer);
  let hits = 0;

  // ENHC: Dealer draws until reaching 17 or higher
  // NEW RULE: Dealer STANDS on Soft 17 (S17 rule - more player favorable)
  const hitSoft17 = false;  // Stand on Soft 17

  while (hits < 10 && realtimeSimRunning) {
    const isSoft = isHandSoft(AppState.positions.dealer);

    // Check if dealer should stop
    if (total > 17) break;
    if (total === 17 && !isSoft) break;
    if (total === 17 && isSoft && !hitSoft17) break;

    await delay(realtimeSimSpeed);

    const card = dealRandomCard();
    if (!card) break;

    AppState.positions.dealer.push(card);
    cards.push(card);
    updateDealerCardsPanel();
    updateDealerTableCards();
    updateSimCounts();

    total = calculateHandTotal(AppState.positions.dealer);
    hits++;

    console.log(`[ENHC] Dealer draws: ${card} → Total: ${total} (${isSoft ? 'soft' : 'hard'})`);
  }

  console.log(`[ENHC] Dealer final: [${AppState.positions.dealer.join(' ')}] = ${total}`);
}

function simResult(pos, pNum, dealerTotal) {
  const pTotal = calculateHandTotal(AppState.positions[pos]);
  const pBust = pTotal > 21;
  const dBust = dealerTotal > 21;

  let result = 'push';
  if (pBust) {
    result = 'loss';
    AppState.gameHistory.statistics.playerBusts++;
  } else if (dBust) {
    result = 'win';
    AppState.gameHistory.statistics.dealerBusts++;
  } else if (pTotal > dealerTotal) {
    result = 'win';
    AppState.gameHistory.statistics.playerWins++;
  } else if (pTotal < dealerTotal) {
    result = 'loss';
    AppState.gameHistory.statistics.playerLosses++;
  } else {
    AppState.gameHistory.statistics.pushes++;
  }

  // Flash result
  const box = document.getElementById(pos);
  if (box) {
    box.classList.add('outcome-' + result);
    setTimeout(() => box.classList.remove('outcome-' + result), 800);
  }
}

function getValue(card) {
  if (!card) return 0;
  if (['J','Q','K'].includes(card)) return 10;
  if (card === 'A') return 11;
  if (card === '10') return 10;
  return parseInt(card) || 0;
}

function clearTableForSim() {
  // Save dealer cards to history before clearing
  if (AppState.positions.dealer.length > 0) {
    AppState.currentRoundNum++;
    AppState.dealerHistory.unshift({
      round: AppState.currentRoundNum,
      cards: [...AppState.positions.dealer],
      total: calculateHandTotal(AppState.positions.dealer)
    });
    // Keep last 50 rounds for simulation
    if (AppState.dealerHistory.length > 50) {
      AppState.dealerHistory.pop();
    }
    updateDealerHistory();
  }

  // Clear positions
  for (const pos in AppState.positions) {
    AppState.positions[pos] = [];
  }
  updatePositionCards();
  updateDealerCardsPanel();
  updateDealerTableCards();
}

function updateSimCounts() {
  const rc = document.getElementById('runningCount');
  const tc = document.getElementById('trueCount');
  if (rc) rc.textContent = AppState.runningCount;
  if (tc) tc.textContent = getTrueCount().toFixed(2);

  const dealt = document.getElementById('statCardsDealt');
  if (dealt) dealt.textContent = AppState.cardsDealt;

  // Update cards seen display
  const cardsSeenEl = document.getElementById('cardsSeen');
  if (cardsSeenEl) cardsSeenEl.textContent = `${AppState.cardsDealt}/${AppState.totalCards}`;

  // Update rank table for real-time card tracking
  updateRankTable();

  // Update composition metrics in real-time
  updateMetrics();

  // Update stat boxes
  updateStatBoxes();
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Reshuffle shoe without clearing dealer history
// Works for ANY deck count (6, 8, 10, etc.) - shuffle at 75% penetration
function reshuffleShoeOnly() {
  const prevRC = AppState.runningCount;
  const prevTC = getTrueCount();
  const prevDealt = AppState.cardsDealt;
  const penetration = ((prevDealt / AppState.totalCards) * 100).toFixed(1);

  // Reset all card counts to fresh shoe
  AppState.rankCounts = JSON.parse(JSON.stringify(AppState.initialCounts));
  AppState.rankSeen = { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0 };
  AppState.cardsDealt = 0;

  // TRUE COUNT RESETS TO 0 ON SHUFFLE (Running Count also resets)
  AppState.runningCount = 0;

  // Reset Martingale state on new shoe
  AppState.quantEvSettings.martingaleCurrentBet = AppState.quantEvSettings.baseUnit;
  AppState.quantEvSettings.martingaleLossStreak = 0;

  // Reset Quant EV player sitting out - new shoe means fresh start
  AppState.quantEvSettings.quantEvSittingOut = false;

  // Note: dealer history is NOT cleared here - only on end game
  updateSimCounts();

  console.log(`[SHUFFLE] ${AppState.numDecks}-deck shoe reshuffled at ${penetration}% penetration`);
  console.log(`[SHUFFLE] RC: ${prevRC} → 0 | TC: ${prevTC.toFixed(2)} → 0.00 | Cards: ${prevDealt} → 0`);
}

// Dice Card Rule: 1 card face-up (dice), 2 cards face-down burned
async function diceCardBurn(showAnimation = true) {
  // Deal dice card (face-up, visible for counting)
  const diceCard = dealRandomCard();
  if (!diceCard) return;

  // Deal 2 burn cards (face-down, not visible but removed from shoe)
  const burn1 = dealRandomCard();
  const burn2 = dealRandomCard();

  if (showAnimation) {
    // Show dice card animation
    const overlay = document.createElement('div');
    overlay.className = 'dice-card-overlay';
    overlay.innerHTML = `
      <div class="dice-card-container">
        <div class="dice-card-title">Dice Card</div>
        <div class="dice-card-display">
          <div class="dice-card visible">${diceCard}</div>
          <div class="burn-cards">
            <div class="burn-card">?</div>
            <div class="burn-card">?</div>
          </div>
        </div>
        <div class="dice-card-info">3 cards burned</div>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add('active'), 50);

    await delay(1500);

    overlay.classList.add('fade-out');
    await delay(300);
    overlay.remove();
  }

  // Update counts display
  updateSimCounts();

  return { diceCard, burn1, burn2 };
}

function updateDealerTableCards() {
  const dealerCards = AppState.positions.dealer || [];
  const container = document.getElementById('dealerCards');
  const badge = document.getElementById('dealerBadge');
  const dealerBox = document.getElementById('dealerBox');

  if (container && dealerCards.length > 0) {
    container.innerHTML = dealerCards.map(c => {
      const isRed = ['A'].includes(c) || Math.random() > 0.5;
      return `<span class="card-chip ${isRed ? 'red' : ''}">${c}</span>`;
    }).join('');
  } else if (container) {
    container.innerHTML = '';
  }

  if (badge) {
    if (dealerCards.length === 0) {
      badge.textContent = '0';
      badge.classList.remove('bust');
    } else {
      const total = calculateHandTotal(dealerCards);
      if (total > 21) {
        badge.textContent = 'BUST';
        badge.classList.add('bust');
      } else {
        badge.textContent = total;
        badge.classList.remove('bust');
      }
    }
  }

  if (dealerBox) {
    if (dealerCards.length === 0) {
      dealerBox.classList.remove('bust');
    } else {
      const total = calculateHandTotal(dealerCards);
      if (total > 21) {
        dealerBox.classList.add('bust');
      } else {
        dealerBox.classList.remove('bust');
      }
    }
  }
}

function showSimulationControls() {
  let controls = document.getElementById('simControls');
  if (!controls) {
    controls = document.createElement('div');
    controls.id = 'simControls';
    controls.className = 'sim-controls';
    controls.innerHTML = `
      <div class="sim-status" id="simStatus">Initializing...</div>
      <div class="sim-buttons">
        <button class="sim-btn pause" onclick="toggleSimPause()">PAUSE</button>
        <button class="sim-btn speed" onclick="changeSimSpeed(-100)">FASTER</button>
        <button class="sim-btn speed" onclick="changeSimSpeed(100)">SLOWER</button>
        <button class="sim-btn stop" onclick="stopRealtimeSim()">STOP</button>
      </div>
    `;
    document.body.appendChild(controls);
  }
  controls.style.display = 'flex';
}

function hideSimulationControls() {
  const controls = document.getElementById('simControls');
  if (controls) {
    controls.style.display = 'none';
  }
}

function updateSimStatus(text) {
  const status = document.getElementById('simStatus');
  if (status) {
    status.textContent = text;
  }
}

function toggleSimPause() {
  realtimeSimPaused = !realtimeSimPaused;
  const btn = document.querySelector('.sim-btn.pause');
  if (btn) {
    btn.textContent = realtimeSimPaused ? 'RESUME' : 'PAUSE';
    btn.classList.toggle('paused', realtimeSimPaused);
  }
  updateSimStatus(realtimeSimPaused ? 'PAUSED' : 'Running...');
}

function changeSimSpeed(delta) {
  realtimeSimSpeed = Math.max(100, Math.min(2000, realtimeSimSpeed + delta));
  showToast(`Speed: ${realtimeSimSpeed}ms`, 'info');
}

function stopRealtimeSim() {
  realtimeSimRunning = false;
  realtimeSimPaused = false;

  // BETTING HISTORY - End current game when simulation stops
  if (AppState.bettingHistory.enabled && AppState.bettingHistory.currentGame) {
    endCurrentGame();
  }

  showToast('Simulation stopped', 'warning');
}

// ============================================================================
// FULL ENGINE SIMULATION - PRE-DEAL + POST-DEAL Combined
// ============================================================================
let fullSimRunning = false;
let fullSimConsole = null;

async function runFullEngineSimulation() {
  if (realtimeSimRunning || fullSimRunning) {
    showToast('Simulation already running', 'warning');
    return;
  }

  fullSimRunning = true;
  showFullSimConsole();

  try {
  logToConsole('INITIALIZING FULL ENGINE SIMULATION...', 'header');
  logToConsole(`Config: ${AppState.numDecks} decks | 2 players | 75% penetration`, 'info');

  initGameSession('Full Sim', 'Pre+Post Deal Engine Test');
  resetShoe();
  clearTableForSim();

  await showCutCardAnimation();
  await diceCardBurn(); // Dice card rule: 1 face-up + 2 burned

  const penetrationLimit = AppState.totalCards * 0.75;
  let round = 0;
  const roundHistory = [];
  const stats = {
    totalHands: 0,
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

  logToConsole('', 'divider');
  logToConsole('STARTING SHOE SIMULATION', 'header');

  while (AppState.cardsDealt < penetrationLimit && fullSimRunning) {
    round++;

    // ==================== PRE-DEAL METRICS ====================
    const preDeal = getPreDealEngineMetrics();

    logToConsole(`ROUND ${round}`, 'round-header');
    logToConsole(`PRE-DEAL: TC:${preDeal.trueCount} | Pen:${preDeal.penetration}% | EV:${preDeal.ev}% | Bet:$${preDeal.betAmount} (${preDeal.betUnits}x) | ${preDeal.temporal}`, 'pre-deal');

    // ==================== DEAL CARDS ====================
    const roundCards = [];

    // Deal: P1, P2, Dealer, P1, P2, Dealer (hole)
    await fullSimDeal('player1', roundCards, 50);
    await fullSimDeal('player2', roundCards, 50);
    await fullSimDeal('dealer', roundCards, 50);
    await fullSimDeal('player1', roundCards, 50);
    await fullSimDeal('player2', roundCards, 50);
    await fullSimDeal('dealer', roundCards, 50);

    if (!fullSimRunning) break;

    const dealerUpCard = AppState.positions.dealer[0];
    const dealerUpDisplay = dealerUpCard;

    // ==================== POST-DEAL DECISIONS ====================
    const p1Cards = AppState.positions.player1;
    const p2Cards = AppState.positions.player2;
    const p1Decision = getUnifiedDecision(1);
    const p2Decision = getUnifiedDecision(2);

    // Show decisions visually
    showUnifiedDecisionSim(1);
    showUnifiedDecisionSim(2);

    const p1Total = calculateHandTotal(p1Cards);
    const p2Total = calculateHandTotal(p2Cards);
    const p1BJ = p1Cards.length === 2 && p1Total === 21;
    const p2BJ = p2Cards.length === 2 && p2Total === 21;

    // Log post-deal decisions
    const p1Dev = p1Decision && p1Decision.strategy.isDeviation ? ` [${p1Decision.strategy.source}]` : '';
    const p2Dev = p2Decision && p2Decision.strategy.isDeviation ? ` [${p2Decision.strategy.source}]` : '';

    logToConsole(`POST-DEAL: Dealer:[${dealerUpDisplay}]? | P1:[${p1Cards.join(' ')}]=${p1Total} -> ${p1Decision?.action || 'N/A'}${p1Dev} | P2:[${p2Cards.join(' ')}]=${p2Total} -> ${p2Decision?.action || 'N/A'}${p2Dev}`, 'post-deal');

    // Track deviations
    if (p1Decision?.strategy.isDeviation) {
      if (p1Decision.strategy.source?.includes('I18')) stats.i18Deviations++;
      if (p1Decision.strategy.source?.includes('Fab4')) stats.fab4Deviations++;
    }
    if (p2Decision?.strategy.isDeviation) {
      if (p2Decision.strategy.source?.includes('I18')) stats.i18Deviations++;
      if (p2Decision.strategy.source?.includes('Fab4')) stats.fab4Deviations++;
    }

    await delay(200);

    // ==================== PLAY OUT HANDS ====================
    // Player 1 plays
    await fullSimPlayerPlay('player1', roundCards);
    // Player 2 plays
    await fullSimPlayerPlay('player2', roundCards);

    if (!fullSimRunning) break;

    // Clear decision displays
    clearUnifiedDecisionSim(1);
    clearUnifiedDecisionSim(2);

    // Dealer plays
    const p1Final = calculateHandTotal(AppState.positions.player1);
    const p2Final = calculateHandTotal(AppState.positions.player2);

    if (p1Final <= 21 || p2Final <= 21) {
      await fullSimDealerPlay(roundCards);
    }

    const dealerFinal = calculateHandTotal(AppState.positions.dealer);
    const dealerBJ = AppState.positions.dealer.length === 2 && dealerFinal === 21;

    // ==================== DETERMINE OUTCOMES ====================
    const p1Outcome = determineOutcome(p1Final, dealerFinal, p1BJ, dealerBJ, p1Final > 21);
    const p2Outcome = determineOutcome(p2Final, dealerFinal, p2BJ, dealerBJ, p2Final > 21);

    // Update stats
    stats.totalHands += 2;
    stats.totalBet += preDeal.betAmount * 2;

    updateOutcomeStats(stats, p1Outcome, preDeal.betAmount);
    updateOutcomeStats(stats, p2Outcome, preDeal.betAmount);

    // Flash results
    flashOutcome('player1', p1Outcome);
    flashOutcome('player2', p2Outcome);

    logToConsole(`RESULT: Dealer:[${AppState.positions.dealer.join(' ')}]=${dealerFinal} | P1:${p1Outcome} | P2:${p2Outcome}`, 'result');

    // Record round
    roundHistory.push({
      round,
      preDeal,
      dealerUp: dealerUpDisplay,
      dealerFinal,
      p1Outcome,
      p2Outcome
    });

    // Update game history
    AppState.gameHistory.statistics.totalRounds++;

    await delay(300);

    if (AppState.cardsDealt < penetrationLimit && fullSimRunning) {
      clearTableForSim();
    }

    // Update status
    updateSimStatus(`Round ${round} | Cards: ${AppState.cardsDealt}/${Math.round(penetrationLimit)}`);
  }

  // ==================== FINAL SUMMARY ====================
  fullSimRunning = false;

  logToConsole('', 'divider');
  logToConsole('SIMULATION COMPLETE', 'header');
  logToConsole('', 'divider');

  const winRate = stats.totalHands > 0 ? ((stats.wins / stats.totalHands) * 100).toFixed(2) : 0;
  const roi = stats.totalBet > 0 ? ((stats.totalWon / stats.totalBet) * 100).toFixed(2) : 0;

  logToConsole('GAME STATISTICS', 'subheader');
  logToConsole(`Total Rounds: ${round}`, 'stat');
  logToConsole(`Total Hands: ${stats.totalHands}`, 'stat');
  logToConsole(`Wins: ${stats.wins} (${winRate}%)`, 'stat');
  logToConsole(`Losses: ${stats.losses}`, 'stat');
  logToConsole(`Pushes: ${stats.pushes}`, 'stat');
  logToConsole(`Blackjacks: ${stats.blackjacks}`, 'stat');
  logToConsole(`Busts: ${stats.busts}`, 'stat');

  logToConsole('', 'divider');
  logToConsole('ENGINE PERFORMANCE', 'subheader');
  logToConsole(`I18 Deviations: ${stats.i18Deviations}`, 'stat');
  logToConsole(`Fab4 Surrenders: ${stats.fab4Deviations}`, 'stat');
  logToConsole(`Deviation Rate: ${((stats.i18Deviations + stats.fab4Deviations) / stats.totalHands * 100).toFixed(1)}%`, 'stat');

  logToConsole('', 'divider');
  logToConsole('FINANCIAL SUMMARY', 'subheader');
  logToConsole(`Total Bet: $${stats.totalBet}`, 'stat');
  logToConsole(`Net Result: $${stats.totalWon.toFixed(0)}`, stats.totalWon >= 0 ? 'stat-positive' : 'stat-negative');
  logToConsole(`ROI: ${roi}%`, stats.totalWon >= 0 ? 'stat-positive' : 'stat-negative');

  const tcRange = roundHistory.length > 0 ?
    `${Math.min(...roundHistory.map(r => parseFloat(r.preDeal.trueCount))).toFixed(2)} to ${Math.max(...roundHistory.map(r => parseFloat(r.preDeal.trueCount))).toFixed(2)}` : 'N/A';
  logToConsole(`TC Range: ${tcRange}`, 'stat');

  showToast(`Simulation complete: ${round} rounds | Win Rate: ${winRate}%`, 'success');
  endGameSession();
  } catch (error) {
    console.error('Simulation error:', error);
    logToConsole(`ERROR: ${error.message}`, 'error');
    showToast(`Simulation error: ${error.message}`, 'error');
    fullSimRunning = false;
  }
}

function getPreDealEngineMetrics() {
  const cardsRemaining = AppState.totalCards - AppState.cardsDealt;
  const decksRemaining = cardsRemaining / 52;
  const penetrationPct = (AppState.cardsDealt / AppState.totalCards) * 100;
  const trueCount = decksRemaining > 0 ? AppState.runningCount / decksRemaining : 0;

  // Count remaining high cards
  const tensRemaining = AppState.rankCounts['10'];
  const acesRemaining = AppState.rankCounts['A'];

  // Probability calculations
  const pTens = cardsRemaining > 0 ? (tensRemaining / cardsRemaining) * 100 : 0;
  const pAces = cardsRemaining > 0 ? (acesRemaining / cardsRemaining) * 100 : 0;

  // S-Score
  const expectedTens = cardsRemaining * 0.3077;
  const expectedAces = cardsRemaining * 0.0769;
  const sScore = cardsRemaining > 0 ? ((tensRemaining - expectedTens) + (acesRemaining - expectedAces) * 4) / cardsRemaining : 0;

  // Deck Richness
  const deckRichness = (pTens / 30.77 + pAces / 7.69) / 2;

  // Player advantage
  const advantage = (trueCount - 1) * 0.5;
  const ev = -0.5 + advantage;

  // Win probability
  const pWin = 42 + (trueCount * 0.5);

  // Blackjack probability
  const pBJ = cardsRemaining > 1 ?
    (tensRemaining / cardsRemaining) * (acesRemaining / (cardsRemaining - 1)) * 2 * 100 : 0;

  // Insurance EV
  const insuranceEV = cardsRemaining > 0 ? ((tensRemaining / cardsRemaining) * 2 - 1) * 100 : -100;

  // Window Score
  let windowScore = 50 + trueCount * 10 + sScore * 100;
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

  // CBS Filter
  const cbsFilter = trueCount >= 1 ? 'ALLOW' : 'BLOCK';

  // Temporal Recommendation
  let temporal = 'STAY';
  if (trueCount >= 2 && penetrationPct > 40) temporal = 'STAY+';
  if (trueCount >= 3 && penetrationPct > 50) temporal = 'AGGRESSIVE';
  if (trueCount < 0) temporal = 'MIN BET';
  if (trueCount < -2) temporal = 'LEAVE?';

  return {
    runningCount: AppState.runningCount,
    trueCount: trueCount.toFixed(2),
    decksRemaining: decksRemaining.toFixed(1),
    penetration: penetrationPct.toFixed(1),
    advantage: advantage.toFixed(3),
    pTens: pTens.toFixed(2),
    pAces: pAces.toFixed(2),
    sScore: sScore.toFixed(4),
    deckRichness: deckRichness.toFixed(2),
    pWin: pWin.toFixed(2),
    ev: ev.toFixed(3),
    pBJ: pBJ.toFixed(3),
    insuranceEV: insuranceEV.toFixed(2),
    windowScore: Math.round(windowScore),
    betUnits,
    betAmount: Math.min(25 * betUnits, 500),
    kellyFraction: kellyFraction.toFixed(4),
    cbsFilter,
    temporal
  };
}

async function fullSimDeal(pos, cards, delayMs = 100) {
  if (!fullSimRunning) return;

  const card = dealRandomCard();
  if (!card) return;

  AppState.positions[pos].push(card);
  cards.push(card);

  if (pos === 'dealer') {
    updateDealerCardsPanel();
    updateDealerTableCards();
  } else {
    updatePositionCards(pos);
  }
  updateSimCounts();

  await delay(delayMs);
}

async function fullSimPlayerPlay(pos, cards) {
  if (!fullSimRunning) return;

  const playerNum = parseInt(pos.replace('player', ''));
  let hits = 0;

  while (hits < 8 && fullSimRunning) {
    const playerCards = AppState.positions[pos];
    const total = calculateHandTotal(playerCards);

    if (total >= 21) break;

    const decision = getUnifiedDecision(playerNum);
    if (!decision) break;

    if (decision.action === 'STAY' || decision.action === 'SURRENDER') break;

    if (decision.action === 'HIT' || decision.action === 'DBL') {
      const card = dealRandomCard();
      if (!card) break;

      AppState.positions[pos].push(card);
      cards.push(card);
      updatePositionCards(pos);
      updateSimCounts();
      hits++;

      await delay(100);

      if (decision.action === 'DBL') break;
    } else {
      break;
    }
  }
}

async function fullSimDealerPlay(cards) {
  if (!fullSimRunning) return;

  let total = calculateHandTotal(AppState.positions.dealer);
  let hits = 0;

  while (total < 17 && hits < 8 && fullSimRunning) {
    await delay(100);

    const card = dealRandomCard();
    if (!card) break;

    AppState.positions.dealer.push(card);
    cards.push(card);
    updateDealerCardsPanel();
    updateDealerTableCards();
    updateSimCounts();

    total = calculateHandTotal(AppState.positions.dealer);
    hits++;
  }
}

function determineOutcome(playerValue, dealerValue, playerBJ, dealerBJ, playerBust) {
  if (playerBJ && dealerBJ) return 'PUSH';
  if (playerBJ) return 'BLACKJACK';
  if (dealerBJ) return 'LOSE';
  if (playerBust) return 'BUST';
  if (dealerValue > 21) return 'WIN';
  if (playerValue > dealerValue) return 'WIN';
  if (playerValue < dealerValue) return 'LOSE';
  return 'PUSH';
}

function updateOutcomeStats(stats, outcome, betAmount) {
  switch (outcome) {
    case 'WIN':
      stats.wins++;
      stats.totalWon += betAmount;
      break;
    case 'BLACKJACK':
      stats.wins++;
      stats.blackjacks++;
      stats.totalWon += betAmount * 1.5;
      break;
    case 'LOSE':
      stats.losses++;
      stats.totalWon -= betAmount;
      break;
    case 'BUST':
      stats.losses++;
      stats.busts++;
      stats.totalWon -= betAmount;
      break;
    case 'PUSH':
      stats.pushes++;
      break;
  }
}

function flashOutcome(pos, outcome) {
  const box = document.getElementById(pos);
  if (!box) return;

  const resultClass = (outcome === 'WIN' || outcome === 'BLACKJACK') ? 'outcome-win' :
                      (outcome === 'LOSE' || outcome === 'BUST') ? 'outcome-loss' : 'outcome-push';

  box.classList.add(resultClass);
  setTimeout(() => box.classList.remove(resultClass), 800);
}

function showFullSimConsole() {
  let existing = document.getElementById('fullSimConsole');
  if (existing) {
    existing.style.display = 'flex';
    fullSimConsole = existing.querySelector('.console-output');
    fullSimConsole.innerHTML = '';
    return;
  }

  const consoleEl = document.createElement('div');
  consoleEl.id = 'fullSimConsole';
  consoleEl.className = 'full-sim-console';
  consoleEl.innerHTML = `
    <div class="console-header">
      <span class="console-title">FULL ENGINE SIMULATION</span>
      <div class="console-controls">
        <button class="console-btn" onclick="toggleFullSimConsole()">MINIMIZE</button>
        <button class="console-btn stop" onclick="stopFullSim()">STOP</button>
        <button class="console-btn close" onclick="closeFullSimConsole()">CLOSE</button>
      </div>
    </div>
    <div class="console-output"></div>
  `;

  document.body.appendChild(consoleEl);
  fullSimConsole = consoleEl.querySelector('.console-output');
}

function logToConsole(text, type = 'info') {
  if (!fullSimConsole) return;

  const line = document.createElement('div');
  line.className = `console-line ${type}`;
  line.textContent = text;
  fullSimConsole.appendChild(line);
  fullSimConsole.scrollTop = fullSimConsole.scrollHeight;
}

function toggleFullSimConsole() {
  const consoleEl = document.getElementById('fullSimConsole');
  if (consoleEl) {
    consoleEl.classList.toggle('minimized');
  }
}

function closeFullSimConsole() {
  const consoleEl = document.getElementById('fullSimConsole');
  if (consoleEl) {
    consoleEl.style.display = 'none';
  }
}

function stopFullSim() {
  fullSimRunning = false;
  quantEvSimRunning = false;
  showToast('Full simulation stopped', 'warning');
}

// ============================================================================
// QUANT EV 5-PLAYER SIMULATION WITH FULL ANALYTICS
// ============================================================================
let quantEvSimRunning = false;
let quantEvSimConsole = null;

// Player Analytics Structure
function createPlayerAnalytics(playerNum, startingBankroll = 100000) {
  return {
    id: playerNum,
    name: `Player ${playerNum}`,
    startingBankroll: startingBankroll,
    currentBankroll: startingBankroll,
    peakBankroll: startingBankroll,
    lowestBankroll: startingBankroll,
    handsPlayed: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    busts: 0,
    surrenders: 0,
    doubles: 0,
    splits: 0,
    totalWagered: 0,
    totalWon: 0,
    totalLost: 0,
    netProfit: 0,
    winRate: 0,
    roi: 0,
    avgBet: 0,
    maxBet: 0,
    winStreak: 0,
    lossStreak: 0,
    currentStreak: 0,
    maxWinStreak: 0,
    maxLossStreak: 0,
    deviationsUsed: 0,
    i18Count: 0,
    fab4Count: 0,
    handHistory: []
  };
}

// Update player analytics after a hand
function updatePlayerAnalytics(player, result, betAmount, payout, handDetails) {
  player.handsPlayed++;
  player.totalWagered += betAmount;

  if (result === 'WIN') {
    player.wins++;
    player.totalWon += payout;
    player.currentBankroll += payout;
    player.currentStreak = player.currentStreak > 0 ? player.currentStreak + 1 : 1;
    player.maxWinStreak = Math.max(player.maxWinStreak, player.currentStreak);
  } else if (result === 'LOSS') {
    player.losses++;
    player.totalLost += betAmount;
    player.currentBankroll -= betAmount;
    player.currentStreak = player.currentStreak < 0 ? player.currentStreak - 1 : -1;
    player.maxLossStreak = Math.max(player.maxLossStreak, Math.abs(player.currentStreak));
  } else if (result === 'PUSH') {
    player.pushes++;
    player.currentStreak = 0;
  } else if (result === 'BLACKJACK') {
    player.wins++;
    player.blackjacks++;
    player.totalWon += payout;
    player.currentBankroll += payout;
    player.currentStreak = player.currentStreak > 0 ? player.currentStreak + 1 : 1;
  } else if (result === 'BUST') {
    player.losses++;
    player.busts++;
    player.totalLost += betAmount;
    player.currentBankroll -= betAmount;
    player.currentStreak = player.currentStreak < 0 ? player.currentStreak - 1 : -1;
  } else if (result === 'SURRENDER') {
    player.surrenders++;
    player.totalLost += betAmount / 2;
    player.currentBankroll -= betAmount / 2;
  }

  // Track peak/lowest
  player.peakBankroll = Math.max(player.peakBankroll, player.currentBankroll);
  player.lowestBankroll = Math.min(player.lowestBankroll, player.currentBankroll);
  player.maxBet = Math.max(player.maxBet, betAmount);

  // Calculate derived stats
  player.netProfit = player.currentBankroll - player.startingBankroll;
  player.winRate = player.handsPlayed > 0 ? ((player.wins + player.blackjacks) / player.handsPlayed * 100) : 0;
  player.roi = player.totalWagered > 0 ? (player.netProfit / player.totalWagered * 100) : 0;
  player.avgBet = player.handsPlayed > 0 ? (player.totalWagered / player.handsPlayed) : 0;

  // Store hand history (last 50 hands)
  player.handHistory.push({
    hand: player.handsPlayed,
    result: result,
    bet: betAmount,
    payout: payout,
    bankroll: player.currentBankroll,
    ...handDetails
  });
  if (player.handHistory.length > 50) player.handHistory.shift();
}

// Calculate bet amount based on Quant EV / Kelly
function calculateQuantEvBet(player, trueCount, baseUnit = 100) {
  // Bet ramp based on true count
  let betUnits = 1;
  if (trueCount >= 1) betUnits = 2;
  if (trueCount >= 2) betUnits = 4;
  if (trueCount >= 3) betUnits = 8;
  if (trueCount >= 4) betUnits = 12;
  if (trueCount >= 5) betUnits = 16;

  // Kelly fraction adjustment
  const advantage = (trueCount - 1) * 0.5;
  const kellyFraction = advantage > 0 ? Math.min(0.25, advantage / 100) : 0;
  const kellyBet = player.currentBankroll * kellyFraction;

  // Use minimum of ramp bet and Kelly bet, capped at 5% of bankroll
  const rampBet = baseUnit * betUnits;
  const maxBet = player.currentBankroll * 0.05;

  return Math.min(rampBet, Math.max(baseUnit, kellyBet), maxBet);
}

// Main 5-Player Quant EV Simulation
async function runQuantEv5PlayerSimulation() {
  if (fullSimRunning || quantEvSimRunning) {
    showToast('Simulation already running', 'warning');
    return;
  }

  quantEvSimRunning = true;
  showQuantEvSimConsole();

  // Initialize 5 players with $100,000 each
  const players = [];
  for (let i = 1; i <= 7; i++) {
    players.push(createPlayerAnalytics(i, 100000));
  }

  const config = {
    numDecks: 8,
    penetration: 0.75,
    baseUnit: 100,
    minBet: 100,
    maxBet: 5000,
    blackjackPayout: 1.5,
    dealerHitsSoft17: false,  // S17 Rule: Dealer STANDS on Soft 17
    doubleAfterSplit: true,
    resplitAces: false,
    surrenderAllowed: true
  };

  logQuantEv('═══════════════════════════════════════════════════════════════', 'divider');
  logQuantEv('QUANT EV 5-PLAYER SIMULATION', 'header');
  logQuantEv('═══════════════════════════════════════════════════════════════', 'divider');
  logQuantEv(`Config: ${config.numDecks} Decks | ${config.penetration * 100}% Penetration | $${config.baseUnit} Base Unit`, 'info');
  logQuantEv(`Players: 5 | Starting Bankroll: $100,000 each`, 'info');
  logQuantEv(`Strategy: Quant EV with Kelly Sizing`, 'info');
  logQuantEv('═══════════════════════════════════════════════════════════════', 'divider');

  // Reset shoe
  AppState.numDecks = config.numDecks;
  AppState.totalCards = config.numDecks * 52;
  resetShoe();

  const penetrationLimit = AppState.totalCards * config.penetration;
  let round = 0;
  let shoeCount = 1;

  try {
    while (quantEvSimRunning && shoeCount <= 10) { // Run 10 shoes
      logQuantEv(`\n══ SHOE ${shoeCount} ══`, 'shoe-header');
      resetShoe();
      round = 0;

      while (AppState.cardsDealt < penetrationLimit && quantEvSimRunning) {
        round++;

        // Get pre-deal metrics
        const tc = getTrueCount();
        const rc = AppState.runningCount;
        const pen = ((AppState.cardsDealt / AppState.totalCards) * 100).toFixed(0);

        // Clear positions
        for (let i = 1; i <= 7; i++) {
          AppState.positions[`player${i}`] = [];
        }
        AppState.positions.dealer = [];

        // Calculate bets for each player
        const bets = [];
        for (let i = 0; i < 5; i++) {
          bets.push(calculateQuantEvBet(players[i], tc, config.baseUnit));
        }

        // Deal cards: P1, P2, P3, P4, P5, Dealer (x2)
        for (let i = 1; i <= 7; i++) {
          const card = dealCardFromShoe();
          AppState.positions[`player${i}`].push(card);
        }
        const dealerUp = dealCardFromShoe();
        AppState.positions.dealer.push(dealerUp);

        for (let i = 1; i <= 7; i++) {
          const card = dealCardFromShoe();
          AppState.positions[`player${i}`].push(card);
        }
        const dealerHole = dealCardFromShoe();
        AppState.positions.dealer.push(dealerHole);

        // Log round header
        logQuantEv(`\nRound ${round} | TC: ${tc.toFixed(1)} | RC: ${rc} | Pen: ${pen}%`, 'round-header');

        // Process each player's hand
        const playerResults = [];
        for (let i = 1; i <= 7; i++) {
          const pCards = AppState.positions[`player${i}`];
          const pTotal = calculateHandTotal(pCards);
          const isBJ = pCards.length === 2 && pTotal === 21;

          // Get decision from Quant EV strategy
          const decision = getUnifiedDecision(i);
          const action = decision ? decision.action : 'STAY';

          // Track deviations
          if (decision && decision.strategy && decision.strategy.isDeviation) {
            players[i-1].deviationsUsed++;
            if (decision.strategy.source?.includes('I18')) players[i-1].i18Count++;
            if (decision.strategy.source?.includes('Fab4')) players[i-1].fab4Count++;
          }

          playerResults.push({
            playerNum: i,
            cards: [...pCards],
            total: pTotal,
            isBJ: isBJ,
            bet: bets[i-1],
            action: action,
            decision: decision
          });
        }

        // Resolve dealer hand
        let dealerTotal = calculateHandTotal(AppState.positions.dealer);
        while (dealerTotal < 17 || (dealerTotal === 17 && config.dealerHitsSoft17 && isHandSoft(AppState.positions.dealer))) {
          const card = dealCardFromShoe();
          AppState.positions.dealer.push(card);
          dealerTotal = calculateHandTotal(AppState.positions.dealer);
        }
        const dealerBust = dealerTotal > 21;

        // Determine results for each player
        for (const pr of playerResults) {
          let result, payout = 0;

          if (pr.isBJ) {
            if (dealerTotal === 21 && AppState.positions.dealer.length === 2) {
              result = 'PUSH';
            } else {
              result = 'BLACKJACK';
              payout = pr.bet * config.blackjackPayout;
            }
          } else if (pr.total > 21) {
            result = 'BUST';
          } else if (dealerBust) {
            result = 'WIN';
            payout = pr.bet;
          } else if (pr.total > dealerTotal) {
            result = 'WIN';
            payout = pr.bet;
          } else if (pr.total < dealerTotal) {
            result = 'LOSS';
          } else {
            result = 'PUSH';
          }

          // Update analytics
          updatePlayerAnalytics(players[pr.playerNum - 1], result, pr.bet, payout, {
            cards: pr.cards,
            dealerCards: [...AppState.positions.dealer],
            tc: tc,
            action: pr.action
          });

          // Log result
          const p = players[pr.playerNum - 1];
          const resultIcon = result === 'WIN' || result === 'BLACKJACK' ? '✓' : result === 'LOSS' || result === 'BUST' ? '✗' : '–';
          logQuantEv(`  P${pr.playerNum}: [${pr.cards.join(' ')}]=${pr.total} vs D:${dealerTotal} → ${result} ${resultIcon} | Bet:$${pr.bet} | Bank:$${p.currentBankroll.toLocaleString()}`,
            result === 'WIN' || result === 'BLACKJACK' ? 'win' : result === 'LOSS' || result === 'BUST' ? 'loss' : 'push');
        }

        await delay(10); // Small delay for UI updates
      }

      // Shoe summary
      logQuantEv(`\n── Shoe ${shoeCount} Summary ──`, 'summary');
      for (let i = 0; i < 5; i++) {
        const p = players[i];
        logQuantEv(`  P${i+1}: $${p.currentBankroll.toLocaleString()} (${p.netProfit >= 0 ? '+' : ''}$${p.netProfit.toLocaleString()}) | WR: ${p.winRate.toFixed(1)}% | ROI: ${p.roi.toFixed(2)}%`,
          p.netProfit >= 0 ? 'profit' : 'loss');
      }

      shoeCount++;
    }

    // Final Summary
    logQuantEv('\n═══════════════════════════════════════════════════════════════', 'divider');
    logQuantEv('FINAL SIMULATION RESULTS', 'header');
    logQuantEv('═══════════════════════════════════════════════════════════════', 'divider');

    for (let i = 0; i < 5; i++) {
      const p = players[i];
      logQuantEv(`\n▸ PLAYER ${i+1} ANALYTICS:`, 'player-header');
      logQuantEv(`  Starting: $${p.startingBankroll.toLocaleString()} → Final: $${p.currentBankroll.toLocaleString()}`, 'info');
      logQuantEv(`  Net P/L: ${p.netProfit >= 0 ? '+' : ''}$${p.netProfit.toLocaleString()} | ROI: ${p.roi.toFixed(2)}%`, p.netProfit >= 0 ? 'profit' : 'loss');
      logQuantEv(`  Hands: ${p.handsPlayed} | W/L/P: ${p.wins}/${p.losses}/${p.pushes} | BJ: ${p.blackjacks}`, 'info');
      logQuantEv(`  Win Rate: ${p.winRate.toFixed(1)}% | Avg Bet: $${p.avgBet.toFixed(0)} | Max Bet: $${p.maxBet}`, 'info');
      logQuantEv(`  Peak: $${p.peakBankroll.toLocaleString()} | Low: $${p.lowestBankroll.toLocaleString()}`, 'info');
      logQuantEv(`  Streaks: Best Win ${p.maxWinStreak} | Worst Loss ${p.maxLossStreak}`, 'info');
      logQuantEv(`  Deviations: ${p.deviationsUsed} (I18: ${p.i18Count}, Fab4: ${p.fab4Count})`, 'info');
    }

    // Overall stats
    const totalProfit = players.reduce((sum, p) => sum + p.netProfit, 0);
    const totalHands = players.reduce((sum, p) => sum + p.handsPlayed, 0);
    const avgROI = players.reduce((sum, p) => sum + p.roi, 0) / 5;

    logQuantEv('\n═══════════════════════════════════════════════════════════════', 'divider');
    logQuantEv('AGGREGATE STATISTICS', 'header');
    logQuantEv(`  Total Hands Played: ${totalHands.toLocaleString()}`, 'info');
    logQuantEv(`  Combined P/L: ${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? 'profit' : 'loss');
    logQuantEv(`  Average ROI: ${avgROI.toFixed(2)}%`, 'info');
    logQuantEv('═══════════════════════════════════════════════════════════════', 'divider');

    // Store results for export
    window.quantEvSimResults = { players, config, totalHands, totalProfit, avgROI };

  } catch (error) {
    logQuantEv(`ERROR: ${error.message}`, 'error');
    console.error(error);
  }

  quantEvSimRunning = false;
  logQuantEv('\nSimulation Complete!', 'header');
}

function showQuantEvSimConsole() {
  // Remove existing console if any
  const existing = document.getElementById('quantEvSimConsole');
  if (existing) existing.remove();

  const console = document.createElement('div');
  console.id = 'quantEvSimConsole';
  console.innerHTML = `
    <div class="sim-console-header">
      <span>Quant EV 5-Player Simulation</span>
      <div class="sim-console-controls">
        <button onclick="stopQuantEvSim()" class="btn-stop-sim">■ Stop</button>
        <button onclick="exportQuantEvResults()" class="btn-export-sim">↓ Export</button>
        <button onclick="closeQuantEvConsole()" class="btn-close-sim">×</button>
      </div>
    </div>
    <div class="sim-console-body" id="quantEvConsoleBody"></div>
  `;
  console.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 800px; max-width: 95vw; height: 600px; max-height: 80vh;
    background: #1a1a2e; border: 2px solid #8b5cf6; border-radius: 12px;
    z-index: 10000; display: flex; flex-direction: column; font-family: monospace;
  `;
  document.body.appendChild(console);
  quantEvSimConsole = document.getElementById('quantEvConsoleBody');
  quantEvSimConsole.style.cssText = `
    flex: 1; overflow-y: auto; padding: 12px; font-size: 12px; line-height: 1.4;
  `;
}

function logQuantEv(message, type = 'info') {
  if (!quantEvSimConsole) return;
  const line = document.createElement('div');
  line.textContent = message;

  const colors = {
    'header': '#8b5cf6', 'divider': '#4a4a6a', 'info': '#a0a0a0',
    'win': '#22c55e', 'loss': '#ef4444', 'push': '#f59e0b',
    'profit': '#22c55e', 'error': '#ef4444', 'round-header': '#60a5fa',
    'shoe-header': '#f472b6', 'summary': '#fbbf24', 'player-header': '#8b5cf6'
  };
  line.style.color = colors[type] || '#ffffff';
  if (type === 'header' || type === 'player-header') line.style.fontWeight = 'bold';

  quantEvSimConsole.appendChild(line);
  quantEvSimConsole.scrollTop = quantEvSimConsole.scrollHeight;
}

function stopQuantEvSim() {
  quantEvSimRunning = false;
  showToast('Simulation stopped', 'warning');
}

function closeQuantEvConsole() {
  const console = document.getElementById('quantEvSimConsole');
  if (console) console.remove();
  quantEvSimRunning = false;
}

function exportQuantEvResults() {
  if (!window.quantEvSimResults) {
    showToast('No results to export', 'warning');
    return;
  }
  const data = JSON.stringify(window.quantEvSimResults, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quant_ev_sim_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Results exported!', 'success');
}

function dealCardFromShoe() {
  // Get random card from remaining deck
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const available = [];

  for (const rank of ranks) {
    const count = AppState.rankCounts[rank] || 0;
    for (let i = 0; i < count; i++) {
      available.push(rank);
    }
  }

  if (available.length === 0) return null;

  const card = available[Math.floor(Math.random() * available.length)];
  trackCard(card);
  return card;
}

function isHandSoft(cards) {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    if (card === 'A') {
      aces++;
      total += 11;
    } else if (['K', 'Q', 'J', '10'].includes(card)) {
      total += 10;
    } else {
      total += parseInt(card);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return aces > 0 && total <= 21;
}

// Add button to UI - expose globally
window.runQuantEv5PlayerSimulation = runQuantEv5PlayerSimulation;

// ============================================================================
// QUANT EV LIVE TRACKER - Automatic Game History & Analytics
// ============================================================================

function initQuantEvSession() {
  AppState.quantEvTracker.sessionId = Date.now();
  AppState.quantEvTracker.roundNumber = 0;
  for (let i = 1; i <= 7; i++) {
    AppState.quantEvTracker.players[i] = {
      bankroll: 100000, hands: [], wins: 0, losses: 0, pushes: 0, bjs: 0,
      correctDecisions: 0, totalDecisions: 0
    };
  }
  AppState.quantEvTracker.history = [];
  showQuantEvPanel();
  console.log('[Quant EV] Session initialized');
}

function recordQuantEvRound() {
  const tracker = AppState.quantEvTracker;
  tracker.roundNumber++;

  const roundData = {
    round: tracker.roundNumber,
    tc: getTrueCount(),
    rc: AppState.runningCount,
    pen: ((AppState.cardsDealt / AppState.totalCards) * 100).toFixed(1),
    dealerUp: AppState.positions.dealer[0] || '?',
    dealerCards: [...(AppState.positions.dealer || [])],
    dealerTotal: calculateHandTotal(AppState.positions.dealer || []),
    timestamp: new Date().toISOString(),
    players: {}
  };

  // Record each player's hand and Quant EV decision
  for (let i = 1; i <= 7; i++) {
    const cards = AppState.positions[`player${i}`] || [];
    if (cards.length >= 2) {
      const decision = getUnifiedDecision(i);
      const total = calculateHandTotal(cards);
      const isBJ = cards.length === 2 && total === 21;

      roundData.players[i] = {
        cards: [...cards],
        total: total,
        isBJ: isBJ,
        quantEvAction: decision ? decision.action : 'N/A',
        quantEvReason: decision ? decision.strategy?.reason : '',
        isDeviation: decision ? decision.strategy?.isDeviation : false,
        deviationSource: decision ? decision.strategy?.source : '',
        result: null, // Set later when round resolves
        payout: 0
      };
    }
  }

  tracker.currentRound = roundData;
  updateQuantEvPanel();
  return roundData;
}

function resolveQuantEvRound(playerResults) {
  // playerResults: { 1: 'WIN', 2: 'LOSS', 3: 'PUSH', 4: 'WIN', 5: 'LOSS' }
  const tracker = AppState.quantEvTracker;
  const round = tracker.currentRound;

  for (let i = 1; i <= 7; i++) {
    if (round.players[i] && playerResults[i]) {
      const result = playerResults[i];
      round.players[i].result = result;

      const player = tracker.players[i];
      player.totalDecisions++;

      if (result === 'WIN') {
        player.wins++;
        player.bankroll += 100; // Base bet
        player.correctDecisions++;
      } else if (result === 'LOSS') {
        player.losses++;
        player.bankroll -= 100;
      } else if (result === 'PUSH') {
        player.pushes++;
        player.correctDecisions++; // Push is not wrong
      } else if (result === 'BLACKJACK') {
        player.wins++;
        player.bjs++;
        player.bankroll += 150;
        player.correctDecisions++;
      }

      player.hands.push(round.players[i]);
    }
  }

  tracker.history.push(round);
  updateQuantEvPanel();
  logQuantEvRound(round);
}

function showQuantEvPanel() {
  console.log('[Quant EV] showQuantEvPanel called');

  // Remove existing panel
  let panel = document.getElementById('quantEvTrackerPanel');
  if (panel) {
    console.log('[Quant EV] Removing existing panel');
    panel.remove();
  }

  // Create new panel
  panel = document.createElement('div');
  panel.id = 'quantEvTrackerPanel';

  // Build panel HTML - 50% larger
  panel.innerHTML = `
    <div style="background:linear-gradient(135deg,#8b5cf6,#6366f1);color:white;padding:16px 20px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;border-radius:14px 14px 0 0;">
      <span style="font-size:18px;">QUANT EV LIVE TRACKER</span>
      <div>
        <button onclick="exportQuantEvHistory()" style="background:rgba(255,255,255,0.2);border:none;color:white;cursor:pointer;font-size:13px;padding:6px 12px;border-radius:6px;margin-right:10px;">Export</button>
        <button onclick="document.getElementById('quantEvTrackerPanel').style.display='none'" style="background:none;border:none;color:white;cursor:pointer;font-size:24px;line-height:1;">×</button>
      </div>
    </div>
    <div id="qevBody" style="padding:16px;max-height:650px;overflow-y:auto;background:#1a1a2e;">
      <div id="qevStats" style="color:#e0e0e0;"></div>
      <div id="qevLog" style="margin-top:14px;border-top:1px solid #333;padding-top:14px;color:#ccc;"></div>
    </div>
  `;

  // Apply styles - 50% larger
  panel.style.cssText = `
    position: fixed !important;
    top: 60px !important;
    right: 250px !important;
    width: 480px !important;
    max-height: 600px !important;
    background: #1a1a2e !important;
    border: 3px solid #8b5cf6 !important;
    border-radius: 14px !important;
    z-index: 999999 !important;
    font-family: 'Courier New', monospace !important;
    font-size: 14px !important;
    overflow: hidden !important;
    box-shadow: 0 10px 40px rgba(139,92,246,0.5) !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  `;

  // Append to body
  document.body.appendChild(panel);
  console.log('[Quant EV] Panel appended to body');

  // Update toggle button state
  const btn = document.getElementById('trackerToggleBtn');
  if (btn) {
    btn.textContent = 'Hide Tracker';
    btn.style.background = '#ef4444';
  }

  // Force repaint
  panel.offsetHeight;

  // Update panel content after a small delay to ensure DOM is ready
  setTimeout(() => {
    updateQuantEvPanel();
    console.log('[Quant EV] Panel updated');
  }, 50);
}

function updateQuantEvPanel() {
  const tracker = AppState.quantEvTracker;
  const statsEl = document.getElementById('qevStats');
  if (!statsEl) return;

  const playerCount = simPlayerCount || 5;
  const settings = AppState.quantEvSettings;
  const currentBet = settings.martingaleCurrentBet;
  const baseUnit = settings.baseUnit;
  const lossStreak = settings.martingaleLossStreak;
  const quantEvPlayer = settings.quantEvPlayerIndex || 4;
  const sacrificePlayer = settings.sacrificePlayerIndex || 5;
  const sacrificePlayers = settings.sacrificePlayers || [3, 5];  // P3 and P5 are sacrifice players

  let html = `<div style="color:#8b5cf6;font-weight:bold;margin-bottom:8px;font-size:16px;">TEAMPLAY ALWAYS WINS | Round ${tracker.roundNumber}</div>`;
  html += `<div style="color:#60a5fa;font-size:10px;margin-bottom:6px;">P1-P2: BS | P3: BOOST | P4: QEV+MG | P5: SAC</div>`;
  html += `<div style="color:#22d3ee;font-size:11px;margin-bottom:8px;padding:4px;background:#1a1a3e;border-radius:4px;">P${quantEvPlayer}: QEV+MG+T25 | Bet: $${currentBet.toLocaleString()} (${(currentBet/baseUnit).toFixed(0)}x) | Streak: ${lossStreak}</div>`;
  html += `<table style="width:100%;border-collapse:collapse;color:#ccc;font-size:13px;">`;
  html += `<tr style="color:#888;font-size:11px;"><th style="padding:6px 2px;">P</th><th style="padding:6px 2px;">Bank</th><th style="padding:6px 2px;">W</th><th style="padding:6px 2px;">L</th><th style="padding:6px 2px;">P</th><th style="padding:6px 2px;">WR%</th><th style="padding:6px 2px;">Role</th></tr>`;

  for (let i = 1; i <= playerCount; i++) {
    const p = tracker.players[i];
    if (!p) continue;
    const decided = p.wins + p.losses;  // W/(W+L) - excludes pushes
    const wr = decided > 0 ? ((p.wins / decided) * 100).toFixed(0) : '0';
    const color = p.bankroll >= 100000 ? '#22c55e' : '#ef4444';
    // TEAMPLAY labels: P1-P2=BS, P3=BOOST, P4=QEV, P5=SAC
    let stratLabel;
    if (i === quantEvPlayer) {
      stratLabel = '<span style="color:#22d3ee;font-size:9px;">QEV</span>';
    } else if (i === 3) {
      // P3 = P4 Booster (green - synergy with P4)
      stratLabel = '<span style="color:#10b981;font-size:9px;">BOOST</span>';
    } else if (i === 5) {
      // P5 = Late Sacrifice
      stratLabel = '<span style="color:#f97316;font-size:9px;">SAC</span>';
    } else {
      stratLabel = '<span style="color:#a78bfa;font-size:9px;">BS</span>';
    }

    html += `<tr style="text-align:center;">
      <td style="color:#8b5cf6;padding:4px 2px;font-weight:bold;">P${i}</td>
      <td style="color:${color};padding:4px 2px;font-weight:bold;">$${(p.bankroll/1000).toFixed(0)}k</td>
      <td style="color:#22c55e;padding:4px 2px;">${p.wins}</td>
      <td style="color:#ef4444;padding:4px 2px;">${p.losses}</td>
      <td style="color:#f59e0b;padding:4px 2px;">${p.pushes}</td>
      <td style="padding:4px 2px;">${wr}%</td>
      <td style="padding:4px 2px;">${stratLabel}</td>
    </tr>`;
  }
  html += `</table>`;

  statsEl.innerHTML = html;
}

function logQuantEvRound(round) {
  const logEl = document.getElementById('qevLog');
  if (!logEl) return;

  const playerCount = simPlayerCount || 5;
  const settings = AppState.quantEvSettings;
  const quantEvPlayer = settings.quantEvPlayerIndex || 4;
  const sacrificePlayer = settings.sacrificePlayerIndex || 5;
  const sacrificePlayers = settings.sacrificePlayers || [3, 5];  // P3 and P5 are sacrifice players
  const baseUnit = settings.baseUnit;
  let html = `<div style="margin-bottom:8px;padding:8px;background:#252540;border-radius:6px;font-size:11px;">`;
  html += `<div style="color:#60a5fa;font-size:12px;font-weight:bold;margin-bottom:4px;">R${round.round} | TC:${round.tc.toFixed(2)} | D:[${round.dealerCards.join(' ')}]=${round.dealerTotal}</div>`;

  for (let i = 1; i <= playerCount; i++) {
    const p = round.players[i];
    if (p) {
      if (p.result === 'SAT OUT') {
        // Quant EV player (P4) sat out this round
        html += `<div style="color:#666;padding:1px 0;font-style:italic;">P${quantEvPlayer}: <span style="color:#f59e0b;">SAT OUT</span> (TC ≤ ${settings.quantEvReentryThreshold}) [QEV+MG+T25]</div>`;
      } else {
        const resultColor = p.result === 'WIN' || p.result === 'BLACKJACK' ? '#22c55e' : p.result === 'LOSS' || p.result === 'BUST' ? '#ef4444' : '#f59e0b';
        const devBadge = p.isDeviation ? `<span style="color:#f472b6;">[D]</span>` : '';
        // TEAMPLAY badges: P1-P2=BS, P3=BOOST, P4=QEV, P5=SAC
        let stratBadge;
        if (i === quantEvPlayer) {
          stratBadge = `<span style="color:#22d3ee;">[QEV+MG+T25]</span>`;
        } else if (i === 3) {
          // P3 = P4 Booster with intent info
          const boostIntent = p.boosterIntent ? ` ${p.boosterIntent.replace(/_/g, ' ')}` : '';
          stratBadge = `<span style="color:#10b981;">[BOOST${boostIntent}]</span>`;
        } else if (i === 5) {
          // P5 = Late Sacrifice
          const sacIntent = p.sacrificeIntent ? ` ${p.sacrificeIntent.replace(/_/g, ' ')}` : '';
          stratBadge = `<span style="color:#f97316;">[SAC${sacIntent}]</span>`;
        } else {
          stratBadge = `<span style="color:#a78bfa;">[BS]</span>`;
        }
        const betStr = (i === quantEvPlayer && p.betAmount) ? ` $${p.betAmount.toLocaleString()}` : '';
        html += `<div style="color:#aaa;padding:1px 0;">P${i}${betStr}:[${p.cards.join('')}]=${p.total}→<span style="color:#8b5cf6;">${p.quantEvAction}</span>${devBadge}→<span style="color:${resultColor};">${p.result || '?'}</span> ${stratBadge}</div>`;
      }
    }
  }
  html += `</div>`;

  logEl.innerHTML = html + logEl.innerHTML;

  // Keep only last 15 rounds in display (more players = more data)
  const entries = logEl.children;
  while (entries.length > 15) {
    logEl.removeChild(entries[entries.length - 1]);
  }
}

// Log shuffle event in tracker panel
function logShuffleEvent(shoeNum) {
  const logEl = document.getElementById('qevLog');
  if (!logEl) return;

  const html = `<div style="margin-bottom:8px;padding:8px;background:linear-gradient(90deg,#f59e0b,#ef4444);border-radius:6px;text-align:center;">
    <span style="color:white;font-weight:bold;font-size:12px;">🔄 SHUFFLE - NEW SHOE #${shoeNum} - TC RESET TO 0</span>
  </div>`;

  logEl.innerHTML = html + logEl.innerHTML;
}

function toggleQuantEvPanel() {
  const body = document.getElementById('qevBody');
  if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

function exportQuantEvHistory() {
  const data = {
    sessionId: AppState.quantEvTracker.sessionId,
    totalRounds: AppState.quantEvTracker.roundNumber,
    players: AppState.quantEvTracker.players,
    history: AppState.quantEvTracker.history,
    summary: generateQuantEvSummary()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quant_ev_history_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('History exported!', 'success');
}

function generateQuantEvSummary() {
  const tracker = AppState.quantEvTracker;
  let totalWins = 0, totalLosses = 0, totalPushes = 0, totalCorrect = 0, totalDecisions = 0;

  for (let i = 1; i <= 7; i++) {
    const p = tracker.players[i];
    totalWins += p.wins;
    totalLosses += p.losses;
    totalPushes += p.pushes;
    totalCorrect += p.correctDecisions;
    totalDecisions += p.totalDecisions;
  }

  return {
    totalHands: totalWins + totalLosses + totalPushes,
    totalWins,
    totalLosses,
    totalPushes,
    overallWinRate: (totalWins + totalLosses) > 0 ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(2) + '%' : '0%',  // W/(W+L)
    quantEvAccuracy: totalDecisions > 0 ? ((totalCorrect / totalDecisions) * 100).toFixed(2) + '%' : '0%',
    recommendation: totalCorrect / totalDecisions > 0.5 ? 'Quant EV is RELIABLE' : 'Need more data'
  };
}

// Auto-record when cards are dealt - hook into existing flow
const originalUpdateUI = typeof updateUI === 'function' ? updateUI : null;

// AUTO TRACKING - Called automatically when Win/Lose/Push buttons are clicked
function autoTrackQuantEvRound(result) {
  const tracker = AppState.quantEvTracker;
  if (!tracker.enabled) return;

  // Auto-init if not started
  if (!tracker.sessionId) {
    tracker.sessionId = Date.now();
    showQuantEvPanel();
  }

  tracker.roundNumber++;

  // Map result to standard format
  const resultMap = { 'win': 'WIN', 'lose': 'LOSS', 'loss': 'LOSS', 'push': 'PUSH', 'bj': 'BLACKJACK' };
  const normalizedResult = resultMap[result.toLowerCase()] || result.toUpperCase();

  const roundData = {
    round: tracker.roundNumber,
    tc: getTrueCount(),
    rc: AppState.runningCount,
    pen: ((AppState.cardsDealt / AppState.totalCards) * 100).toFixed(1),
    dealerUp: AppState.positions.dealer[0] || '?',
    dealerCards: [...(AppState.positions.dealer || [])],
    dealerTotal: calculateHandTotal(AppState.positions.dealer || []),
    timestamp: new Date().toISOString(),
    players: {}
  };

  // Record each player's hand and determine result based on cards
  for (let i = 1; i <= 7; i++) {
    const cards = AppState.positions[`player${i}`] || [];
    if (cards.length >= 2) {
      const decision = getUnifiedDecision(i);
      const total = calculateHandTotal(cards);
      const isBJ = cards.length === 2 && total === 21;
      const dealerTotal = roundData.dealerTotal;

      // Auto-determine result for each player based on their cards vs dealer
      let playerResult;
      if (isBJ) {
        playerResult = dealerTotal === 21 && roundData.dealerCards.length === 2 ? 'PUSH' : 'BLACKJACK';
      } else if (total > 21) {
        playerResult = 'BUST';
      } else if (dealerTotal > 21) {
        playerResult = 'WIN';
      } else if (total > dealerTotal) {
        playerResult = 'WIN';
      } else if (total < dealerTotal) {
        playerResult = 'LOSS';
      } else {
        playerResult = 'PUSH';
      }

      roundData.players[i] = {
        cards: [...cards],
        total: total,
        isBJ: isBJ,
        quantEvAction: decision ? decision.action : 'N/A',
        quantEvReason: decision ? decision.strategy?.reason : '',
        isDeviation: decision ? decision.strategy?.isDeviation : false,
        deviationSource: decision ? decision.strategy?.source : '',
        result: playerResult,
        payout: 0
      };

      // Update player stats
      const player = tracker.players[i];
      player.totalDecisions++;

      if (playerResult === 'WIN') {
        player.wins++;
        player.bankroll += 100;
        player.correctDecisions++;
      } else if (playerResult === 'LOSS' || playerResult === 'BUST') {
        player.losses++;
        player.bankroll -= 100;
      } else if (playerResult === 'PUSH') {
        player.pushes++;
        player.correctDecisions++;
      } else if (playerResult === 'BLACKJACK') {
        player.wins++;
        player.bjs++;
        player.bankroll += 150;
        player.correctDecisions++;
      }

      player.hands.push(roundData.players[i]);
    }
  }

  tracker.history.push(roundData);
  updateQuantEvPanel();
  logQuantEvRound(roundData);
}

// Auto-show panel on page load if enabled
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (AppState.quantEvTracker.enabled) {
      showQuantEvPanel();
    }
  }, 1000);
});

// AUTO-RUN LIVE SIM WITH QUANT EV TRACKER
async function runLiveQuantEvSim(numRounds = 50) {
  console.log('[Quant EV] Starting simulation with ' + numRounds + ' rounds');

  // Show tracker panel
  showQuantEvPanel();

  // Show simulation status toast
  showToast(`Starting Quant EV simulation: ${numRounds} rounds`, 'info');

  // Reset tracker state
  AppState.quantEvTracker.sessionId = Date.now();
  AppState.quantEvTracker.roundNumber = 0;

  // Reset players
  for (let i = 1; i <= 7; i++) {
    AppState.quantEvTracker.players[i] = {
      bankroll: 100000, hands: [], wins: 0, losses: 0, pushes: 0, bjs: 0,
      correctDecisions: 0, totalDecisions: 0
    };
  }
  AppState.quantEvTracker.history = [];

  // Reset shoe
  resetShoe();

  // Add progress indicator to panel
  const progressDiv = document.createElement('div');
  progressDiv.id = 'simProgress';
  progressDiv.style.cssText = 'padding:8px 12px;background:#252540;border-bottom:1px solid #333;';
  progressDiv.innerHTML = '<div style="color:#8b5cf6;font-weight:bold;">Simulating: 0/' + numRounds + '</div><div style="background:#333;height:6px;border-radius:3px;margin-top:4px;"><div id="simBar" style="width:0%;height:100%;background:linear-gradient(90deg,#8b5cf6,#22c55e);border-radius:3px;transition:width 0.1s;"></div></div>';

  const qevBody = document.getElementById('qevBody');
  if (qevBody) {
    qevBody.insertBefore(progressDiv, qevBody.firstChild);
  }

  for (let round = 1; round <= numRounds; round++) {
    // Update progress
    const pct = Math.round((round / numRounds) * 100);
    const progText = document.querySelector('#simProgress > div:first-child');
    const progBar = document.getElementById('simBar');
    if (progText) progText.textContent = `Simulating: ${round}/${numRounds}`;
    if (progBar) progBar.style.width = pct + '%';

    // Clear positions
    for (let i = 1; i <= 7; i++) {
      AppState.positions[`player${i}`] = [];
    }
    AppState.positions.dealer = [];

    // Deal cards to all 5 players and dealer
    const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

    for (let i = 1; i <= 7; i++) {
      const c1 = ranks[Math.floor(Math.random() * 13)];
      const c2 = ranks[Math.floor(Math.random() * 13)];
      AppState.positions[`player${i}`] = [c1, c2];
      trackCard(c1); trackCard(c2);
    }

    // Dealer cards
    const dUp = ranks[Math.floor(Math.random() * 13)];
    const dHole = ranks[Math.floor(Math.random() * 13)];
    AppState.positions.dealer = [dUp, dHole];
    trackCard(dUp); trackCard(dHole);

    // Dealer draws to 17+
    let dealerTotal = calculateHandTotal(AppState.positions.dealer);
    while (dealerTotal < 17) {
      const card = ranks[Math.floor(Math.random() * 13)];
      AppState.positions.dealer.push(card);
      trackCard(card);
      dealerTotal = calculateHandTotal(AppState.positions.dealer);
    }

    // Auto-track this round
    autoTrackQuantEvRound('auto'); // Triggers tracking with auto-calculated results

    // Update UI
    updateUI();
    updateQuantEvPanel();

    await new Promise(r => setTimeout(r, 80)); // Delay for visual
  }

  // Remove progress indicator
  const prog = document.getElementById('simProgress');
  if (prog) prog.remove();

  // Show completion toast
  showToast(`Simulation complete! ${numRounds} rounds analyzed.`, 'success');

  console.log('[Quant EV] Simulation complete');

  // Show final summary
  showQuantEvSummary();
}

function showQuantEvSummary() {
  const tracker = AppState.quantEvTracker;
  const summary = generateQuantEvSummary();

  let html = `
    <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:3px solid #8b5cf6;border-radius:16px;padding:24px;z-index:10001;min-width:500px;font-family:monospace;">
      <h2 style="color:#8b5cf6;margin:0 0 16px 0;text-align:center;">📊 QUANT EV RELIABILITY REPORT</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="background:#252540;padding:12px;border-radius:8px;text-align:center;">
          <div style="color:#888;font-size:11px;">TOTAL HANDS</div>
          <div style="color:#fff;font-size:24px;font-weight:bold;">${summary.totalHands}</div>
        </div>
        <div style="background:#252540;padding:12px;border-radius:8px;text-align:center;">
          <div style="color:#888;font-size:11px;">QUANT EV ACCURACY</div>
          <div style="color:#22c55e;font-size:24px;font-weight:bold;">${summary.quantEvAccuracy}</div>
        </div>
        <div style="background:#252540;padding:12px;border-radius:8px;text-align:center;">
          <div style="color:#888;font-size:11px;">WIN RATE</div>
          <div style="color:#60a5fa;font-size:24px;font-weight:bold;">${summary.overallWinRate}</div>
        </div>
        <div style="background:#252540;padding:12px;border-radius:8px;text-align:center;">
          <div style="color:#888;font-size:11px;">VERDICT</div>
          <div style="color:#f59e0b;font-size:16px;font-weight:bold;">${summary.recommendation}</div>
        </div>
      </div>
      <h3 style="color:#8b5cf6;margin:16px 0 8px 0;">Player Results</h3>
      <table style="width:100%;border-collapse:collapse;color:#ccc;font-size:12px;">
        <tr style="color:#888;border-bottom:1px solid #333;"><th>Player</th><th>Final Bank</th><th>W/L/P</th><th>Win%</th><th>Accuracy</th></tr>`;

  for (let i = 1; i <= 7; i++) {
    const p = tracker.players[i];
    const profit = p.bankroll - 100000;
    const profitColor = profit >= 0 ? '#22c55e' : '#ef4444';
    const decided = p.wins + p.losses;  // W/(W+L) - excludes pushes
    const wr = decided > 0 ? ((p.wins / decided) * 100).toFixed(1) : '0';
    const acc = p.totalDecisions > 0 ? ((p.correctDecisions / p.totalDecisions) * 100).toFixed(1) : '0';

    html += `<tr style="text-align:center;border-bottom:1px solid #252540;">
      <td style="padding:8px;color:#8b5cf6;">P${i}</td>
      <td style="color:${profitColor};">$${p.bankroll.toLocaleString()} (${profit >= 0 ? '+' : ''}${profit.toLocaleString()})</td>
      <td>${p.wins}/${p.losses}/${p.pushes}</td>
      <td>${wr}%</td>
      <td style="color:#60a5fa;">${acc}%</td>
    </tr>`;
  }

  html += `</table>
      <button onclick="this.parentElement.remove()" style="width:100%;margin-top:16px;padding:12px;background:#8b5cf6;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">CLOSE</button>
    </div>`;

  const overlay = document.createElement('div');
  overlay.innerHTML = html;
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;';
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

window.runLiveQuantEvSim = runLiveQuantEvSim;

// Expose functions globally
window.initQuantEvSession = initQuantEvSession;
window.recordQuantEvRound = recordQuantEvRound;
window.resolveQuantEvRound = resolveQuantEvRound;
window.showQuantEvPanel = showQuantEvPanel;
window.autoTrackQuantEvRound = autoTrackQuantEvRound;

// ============================================
// QUANT EV PRE-DEAL SETTINGS FUNCTIONS
// ============================================

function toggleQuantEv() {
  const checkbox = document.getElementById('quantEvEnabled');
  AppState.quantEvSettings.enabled = checkbox ? checkbox.checked : true;
  AppState.quantEvTracker.enabled = AppState.quantEvSettings.enabled;

  const settingsBox = document.getElementById('quantEvSettings');
  if (settingsBox) {
    settingsBox.style.opacity = AppState.quantEvSettings.enabled ? '1' : '0.5';
  }

  updateQuantEvPreview();
  console.log('[Quant EV] Enabled:', AppState.quantEvSettings.enabled);
}

function updateQuantEvSettings() {
  const betMethod = document.getElementById('quantEvBetMethod');
  const baseUnit = document.getElementById('quantEvBaseUnit');
  const maxBet = document.getElementById('quantEvMaxBet');
  const tcThreshold = document.getElementById('quantEvTcThreshold');
  const player1Tc = document.getElementById('player1TcThreshold');

  if (betMethod) AppState.quantEvSettings.betMethod = betMethod.value;
  if (baseUnit) AppState.quantEvSettings.baseUnit = parseInt(baseUnit.value) || 100;
  if (maxBet) AppState.quantEvSettings.maxBetUnits = parseInt(maxBet.value) || 12;
  if (tcThreshold) AppState.quantEvSettings.tcThreshold = parseInt(tcThreshold.value) || 1;
  if (player1Tc) AppState.quantEvSettings.player1TcThreshold = parseFloat(player1Tc.value) || 0.9;

  updateQuantEvPreview();
  console.log('[Quant EV] Settings updated:', AppState.quantEvSettings);
}

function updateQuantEvPreview() {
  const preview = document.getElementById('quantEvPreview');
  const p1Status = document.getElementById('quantEvP1Status');
  if (!preview) return;

  const settings = AppState.quantEvSettings;
  const tc = getTrueCount();
  const baseUnit = settings.baseUnit;
  const p1Threshold = settings.player1TcThreshold;

  // Check if P1 should enter
  const p1Active = tc > p1Threshold;

  if (!settings.enabled) {
    preview.innerHTML = `<span style="color:#888;">Quant EV Disabled</span>`;
    if (p1Status) p1Status.innerHTML = '';
  } else {
    // P1 status
    const p1Text = p1Active
      ? `<span style="color:#22c55e;">P1: IN ($${baseUnit})</span>`
      : `<span style="color:#f59e0b;">P1: OUT (TC ≤ ${p1Threshold})</span>`;

    // P2-P5 always flat betting
    const p2to5Text = `<span style="color:#22c55e;">P2-P5: Flat $${baseUnit}</span>`;

    preview.innerHTML = `${p1Text} | ${p2to5Text}`;

    if (p1Status) {
      if (p1Active) {
        p1Status.innerHTML = `<span style="color:#22c55e;">P1 ACTIVE @ TC ${tc.toFixed(2)} > ${p1Threshold}</span>`;
      } else {
        p1Status.innerHTML = `<span style="color:#f59e0b;">P1 sitting out (TC ${tc.toFixed(2)} ≤ ${p1Threshold})</span>`;
      }
    }
  }
}

// Check if a player should enter the round based on TC
function shouldPlayerEnter(playerNum, tc) {
  const settings = AppState.quantEvSettings;
  const quantEvPlayer = settings.quantEvPlayerIndex || 4;

  if (playerNum === quantEvPlayer) {
    // Quant EV player (P5) only enters when TC > threshold
    return tc > settings.quantEvTcThreshold;
  }

  // P1-P4 always bet (basic strategy players)
  return true;
}

// Get bet amount for a player (flat betting for all)
function getPlayerBetAmount(playerNum, tc) {
  const settings = AppState.quantEvSettings;

  if (!shouldPlayerEnter(playerNum, tc)) {
    return 0; // Player sits out
  }

  // Flat betting for all players
  if (settings.betMethod === 'flat') {
    return settings.baseUnit;
  }

  // Otherwise use calculated bet
  return calculateQuantEvOptimalBet(tc);
}

function calculateQuantEvOptimalBet(tc) {
  const settings = AppState.quantEvSettings;

  // Flat betting - always return base unit
  if (settings.betMethod === 'flat') {
    return settings.baseUnit;
  }

  if (!settings.enabled || tc < settings.tcThreshold) {
    return settings.baseUnit;
  }

  // Calculate edge based on true count
  // Approximate edge = (TC - 1) * 0.5% for Hi-Lo
  const edge = Math.max(0, (tc - 1) * 0.005);

  let kellyFraction = 1;
  switch (settings.betMethod) {
    case 'kelly':
      kellyFraction = 1;
      break;
    case 'halfKelly':
      kellyFraction = 0.5;
      break;
    case 'quarterKelly':
      kellyFraction = 0.25;
      break;
    default:
      return settings.baseUnit;
  }

  // Kelly bet = edge / odds (assuming even money for simplicity)
  // Bet units = (edge * kellyFraction) * scaling factor
  const betUnits = Math.max(1, Math.round((edge * kellyFraction * 100) + 1));
  const cappedUnits = Math.min(betUnits, settings.maxBetUnits);

  return cappedUnits * settings.baseUnit;
}

// Update preview when count changes
const originalUpdateCountDisplay = typeof updateCountDisplay === 'function' ? updateCountDisplay : null;

function updateCountDisplayWithQuantEv() {
  if (originalUpdateCountDisplay) {
    originalUpdateCountDisplay();
  }
  updateQuantEvPreview();
}

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    updateQuantEvSettings();
    updateQuantEvPreview();
  }, 500);
});

// Toggle tracker panel show/hide
function toggleTrackerPanel() {
  const panel = document.getElementById('quantEvTrackerPanel');
  const btn = document.getElementById('trackerToggleBtn');

  if (panel && panel.style.display !== 'none') {
    // Hide panel
    panel.style.display = 'none';
    if (btn) {
      btn.textContent = 'Show Tracker';
      btn.style.background = '#8b5cf6';
    }
  } else {
    // Show panel
    if (panel) {
      panel.style.display = 'block';
    } else {
      showQuantEvPanel();
    }
    if (btn) {
      btn.textContent = 'Hide Tracker';
      btn.style.background = '#ef4444';
    }
  }
}

// Expose functions globally
window.toggleQuantEv = toggleQuantEv;
window.updateQuantEvSettings = updateQuantEvSettings;
window.updateQuantEvPreview = updateQuantEvPreview;
window.calculateQuantEvOptimalBet = calculateQuantEvOptimalBet;
window.toggleTrackerPanel = toggleTrackerPanel;
window.shouldPlayerEnter = shouldPlayerEnter;
window.getPlayerBetAmount = getPlayerBetAmount;

// ============================================
// SIMULATION SETTINGS PANEL FUNCTIONS
// ============================================

// Toggle settings panel collapse/expand
function toggleSettingsPanel() {
  const content = document.getElementById('settingsContent');
  const icon = document.getElementById('settingsToggleIcon');
  if (content && icon) {
    if (content.style.display === 'none') {
      content.style.display = 'block';
      icon.textContent = '▼';
    } else {
      content.style.display = 'none';
      icon.textContent = '▶';
    }
  }
}

// Apply settings from UI to AppState
function applySimSettings() {
  // Table Settings
  const decks = document.getElementById('settingsDecks');
  const players = document.getElementById('settingsPlayers');
  const penetration = document.getElementById('settingsPenetration');

  // P1 Settings
  const p1Strategy = document.getElementById('settingsP1Strategy');
  const p1TcThreshold = document.getElementById('settingsP1TcThreshold');
  const p1Bankroll = document.getElementById('settingsP1Bankroll');
  const p1BetPercent = document.getElementById('settingsP1BetPercent');
  const p1BaseBet = document.getElementById('settingsP1BaseBet');
  const p1BetMethod = document.getElementById('settingsP1BetMethod');
  const p1MartingaleMax = document.getElementById('settingsP1MartingaleMax');
  const p1MaxBet = document.getElementById('settingsP1MaxBet');

  // P2-P5 Settings
  const p2Strategy = document.getElementById('settingsP2Strategy');
  const p2Bankroll = document.getElementById('settingsP2Bankroll');
  const p2FlatBet = document.getElementById('settingsP2FlatBet');

  // Surrender Settings
  const surrenderEnabled = document.getElementById('settingsSurrenderEnabled');

  // Override Settings
  const overrideEnabled = document.getElementById('settingsOverrideEnabled');

  // Apply Table Settings
  if (decks) {
    const deckVal = parseInt(decks.value) || 8;
    setNumDecks(deckVal);
    const simDecksSelect = document.getElementById('simDecksSelect');
    if (simDecksSelect) simDecksSelect.value = deckVal;
  }

  if (players) {
    const playerVal = parseInt(players.value) || 5;
    simPlayerCount = playerVal;
    const simPlayersSelect = document.getElementById('simPlayersSelect');
    if (simPlayersSelect) simPlayersSelect.value = playerVal;
  }

  if (penetration) {
    AppState.penetrationLimit = parseInt(penetration.value) || 75;
  }

  // Calculate P1 base bet from bankroll and percentage
  const bankroll = p1Bankroll ? parseInt(p1Bankroll.value) || 100000 : 100000;
  const betPercent = p1BetPercent ? parseFloat(p1BetPercent.value) || 5 : 5;
  const baseBet = Math.round(bankroll * (betPercent / 100));

  // Update base bet display
  if (p1BaseBet) p1BaseBet.value = baseBet;

  // Calculate max bet from martingale multiplier
  const martingaleMax = p1MartingaleMax ? parseInt(p1MartingaleMax.value) || 3 : 3;
  const maxBet = baseBet * martingaleMax;
  if (p1MaxBet) p1MaxBet.value = maxBet;

  // Apply to AppState.quantEvSettings
  const settings = AppState.quantEvSettings;
  settings.baseUnit = baseBet;
  settings.maxBetUnits = martingaleMax;
  settings.martingaleMaxBet = maxBet;
  settings.martingaleCurrentBet = baseBet;
  settings.betMethod = p1BetMethod ? p1BetMethod.value : 'martingale';
  settings.player1TcThreshold = p1TcThreshold ? parseFloat(p1TcThreshold.value) || 0.9 : 0.9;
  settings.player1Strategy = p1Strategy ? p1Strategy.value : 'quantEv';
  settings.player2to5Strategy = p2Strategy ? p2Strategy.value : 'basic';
  settings.surrenderEnabled = surrenderEnabled ? surrenderEnabled.checked : true;
  settings.postDealOverrideEnabled = overrideEnabled ? overrideEnabled.checked : true;

  // Apply player bankrolls
  const tracker = AppState.quantEvTracker;
  const p1Bank = p1Bankroll ? parseInt(p1Bankroll.value) || 100000 : 100000;
  const p2Bank = p2Bankroll ? parseInt(p2Bankroll.value) || 100000 : 100000;

  tracker.players[1].bankroll = p1Bank;
  for (let i = 2; i <= 7; i++) {
    tracker.players[i].bankroll = p2Bank;
  }

  // P2-P5 flat bet amount
  settings.p2FlatBet = p2FlatBet ? parseInt(p2FlatBet.value) || 5000 : 5000;

  // Update summary display
  updateSettingsSummary();

  console.log('[Settings] Applied:', {
    decks: AppState.numDecks,
    players: simPlayerCount,
    p1Strategy: settings.player1Strategy,
    p1BaseBet: settings.baseUnit,
    p1MaxBet: settings.martingaleMaxBet,
    p1TcThreshold: settings.player1TcThreshold,
    betMethod: settings.betMethod
  });
}

// Update the settings summary display
function updateSettingsSummary() {
  const summaryText = document.getElementById('settingsSummaryText');
  if (!summaryText) return;

  const settings = AppState.quantEvSettings;
  const tracker = AppState.quantEvTracker;
  const quantEvPlayer = settings.quantEvPlayerIndex || 4;
  const sacrificePlayer = settings.sacrificePlayerIndex || 5;
  const p4Bank = tracker.players[quantEvPlayer]?.bankroll || 100000;
  const p5Bank = tracker.players[sacrificePlayer]?.bankroll || 100000;
  const p1Bank = tracker.players[1]?.bankroll || 100000;

  const betMethodLabel = settings.betMethod === 'martingale' ? `MG ${settings.maxBetUnits}x max` :
                         settings.betMethod === 'kelly' ? 'Kelly' :
                         settings.betMethod === 'spread' ? '1-12 Spread' : 'Flat';

  summaryText.innerHTML = `
    <strong>TEAMPLAY ALWAYS WINS</strong> | ${AppState.numDecks} decks | ${simPlayerCount} players<br>
    <strong>P1-P3:</strong> Basic Strategy | Flat $${(settings.p2FlatBet || settings.baseUnit).toLocaleString()}<br>
    <strong>P${quantEvPlayer}:</strong> QEV+MG+T25 | $${(p4Bank/1000).toFixed(0)}k | $${settings.baseUnit.toLocaleString()} base | ${betMethodLabel}<br>
    <strong>P${sacrificePlayer}:</strong> SACRIFICE | $${(p5Bank/1000).toFixed(0)}k | Plays to bust dealer
  `;
}

// Save settings to localStorage
function saveSimSettings() {
  const settings = {
    decks: AppState.numDecks,
    players: simPlayerCount,
    penetration: AppState.penetrationLimit || 75,
    p1: {
      strategy: AppState.quantEvSettings.player1Strategy,
      tcThreshold: AppState.quantEvSettings.player1TcThreshold,
      bankroll: AppState.quantEvTracker.players[1].bankroll,
      baseUnit: AppState.quantEvSettings.baseUnit,
      betMethod: AppState.quantEvSettings.betMethod,
      martingaleMax: AppState.quantEvSettings.maxBetUnits,
      maxBet: AppState.quantEvSettings.martingaleMaxBet
    },
    p2: {
      strategy: AppState.quantEvSettings.player2to5Strategy,
      bankroll: AppState.quantEvTracker.players[2].bankroll,
      flatBet: AppState.quantEvSettings.p2FlatBet || AppState.quantEvSettings.baseUnit
    },
    surrenderEnabled: AppState.quantEvSettings.surrenderEnabled,
    overrideEnabled: AppState.quantEvSettings.postDealOverrideEnabled
  };

  localStorage.setItem('bjSimSettings', JSON.stringify(settings));
  showToast('Settings saved!', 'success');
  console.log('[Settings] Saved to localStorage:', settings);
}

// Load settings from localStorage
function loadSimSettings() {
  const saved = localStorage.getItem('bjSimSettings');
  if (!saved) return;

  try {
    const settings = JSON.parse(saved);

    // Apply to UI elements
    const decks = document.getElementById('settingsDecks');
    const players = document.getElementById('settingsPlayers');
    const penetration = document.getElementById('settingsPenetration');
    const p1Strategy = document.getElementById('settingsP1Strategy');
    const p1TcThreshold = document.getElementById('settingsP1TcThreshold');
    const p1Bankroll = document.getElementById('settingsP1Bankroll');
    const p1BetPercent = document.getElementById('settingsP1BetPercent');
    const p1BetMethod = document.getElementById('settingsP1BetMethod');
    const p1MartingaleMax = document.getElementById('settingsP1MartingaleMax');
    const p2Strategy = document.getElementById('settingsP2Strategy');
    const p2Bankroll = document.getElementById('settingsP2Bankroll');
    const p2FlatBet = document.getElementById('settingsP2FlatBet');
    const surrenderEnabled = document.getElementById('settingsSurrenderEnabled');
    const overrideEnabled = document.getElementById('settingsOverrideEnabled');

    if (decks) decks.value = settings.decks;
    if (players) players.value = settings.players;
    if (penetration) penetration.value = settings.penetration;
    if (p1Strategy) p1Strategy.value = settings.p1.strategy;
    if (p1TcThreshold) p1TcThreshold.value = settings.p1.tcThreshold;
    if (p1Bankroll) p1Bankroll.value = settings.p1.bankroll;
    if (p1BetMethod) p1BetMethod.value = settings.p1.betMethod;
    if (p1MartingaleMax) p1MartingaleMax.value = settings.p1.martingaleMax;
    if (p2Strategy) p2Strategy.value = settings.p2.strategy;
    if (p2Bankroll) p2Bankroll.value = settings.p2.bankroll;
    if (p2FlatBet) p2FlatBet.value = settings.p2.flatBet;
    if (surrenderEnabled) surrenderEnabled.checked = settings.surrenderEnabled !== false;
    if (overrideEnabled) overrideEnabled.checked = settings.overrideEnabled !== false;

    // Calculate bet percent
    if (p1BetPercent && settings.p1.bankroll && settings.p1.baseUnit) {
      p1BetPercent.value = ((settings.p1.baseUnit / settings.p1.bankroll) * 100).toFixed(1);
    }

    // Apply settings
    applySimSettings();
    console.log('[Settings] Loaded from localStorage');
  } catch (e) {
    console.error('[Settings] Failed to load:', e);
  }
}

// Reset settings to defaults
function resetSimSettings() {
  const defaults = {
    decks: 8,
    players: 5,
    penetration: 75,
    p1Bankroll: 100000,
    p1BetPercent: 5,
    p1TcThreshold: 0.9,
    p1Strategy: 'quantEvT25',
    p1BetMethod: 'martingale',
    p1MartingaleMax: 3,
    p2Strategy: 'basic',
    p2Bankroll: 100000,
    p2FlatBet: 5000,
    surrenderEnabled: true,
    overrideEnabled: true
  };

  // Apply to UI elements
  const decks = document.getElementById('settingsDecks');
  const players = document.getElementById('settingsPlayers');
  const penetration = document.getElementById('settingsPenetration');
  const p1Strategy = document.getElementById('settingsP1Strategy');
  const p1TcThreshold = document.getElementById('settingsP1TcThreshold');
  const p1Bankroll = document.getElementById('settingsP1Bankroll');
  const p1BetPercent = document.getElementById('settingsP1BetPercent');
  const p1BetMethod = document.getElementById('settingsP1BetMethod');
  const p1MartingaleMax = document.getElementById('settingsP1MartingaleMax');
  const p2Strategy = document.getElementById('settingsP2Strategy');
  const p2Bankroll = document.getElementById('settingsP2Bankroll');
  const p2FlatBet = document.getElementById('settingsP2FlatBet');
  const surrenderEnabled = document.getElementById('settingsSurrenderEnabled');
  const overrideEnabled = document.getElementById('settingsOverrideEnabled');

  if (decks) decks.value = defaults.decks;
  if (players) players.value = defaults.players;
  if (penetration) penetration.value = defaults.penetration;
  if (p1Strategy) p1Strategy.value = defaults.p1Strategy;
  if (p1TcThreshold) p1TcThreshold.value = defaults.p1TcThreshold;
  if (p1Bankroll) p1Bankroll.value = defaults.p1Bankroll;
  if (p1BetPercent) p1BetPercent.value = defaults.p1BetPercent;
  if (p1BetMethod) p1BetMethod.value = defaults.p1BetMethod;
  if (p1MartingaleMax) p1MartingaleMax.value = defaults.p1MartingaleMax;
  if (p2Strategy) p2Strategy.value = defaults.p2Strategy;
  if (p2Bankroll) p2Bankroll.value = defaults.p2Bankroll;
  if (p2FlatBet) p2FlatBet.value = defaults.p2FlatBet;
  if (surrenderEnabled) surrenderEnabled.checked = defaults.surrenderEnabled;
  if (overrideEnabled) overrideEnabled.checked = defaults.overrideEnabled;

  // Apply settings
  applySimSettings();
  showToast('Settings reset to defaults', 'info');
}

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    loadSimSettings();
    applySimSettings();
    updateSettingsSummary();
  }, 600);
});

// Expose settings functions globally
window.toggleSettingsPanel = toggleSettingsPanel;
window.applySimSettings = applySimSettings;
window.saveSimSettings = saveSimSettings;
window.loadSimSettings = loadSimSettings;
window.resetSimSettings = resetSimSettings;
window.updateSettingsSummary = updateSettingsSummary;

function resetAllPositions() {
  for (const pos in AppState.positions) {
    AppState.positions[pos] = [];
  }
  clearPlayerDecisions();
}

function updateUI() {
  // Update all UI elements
  updatePositionCards();
  updateDealerCardsPanel();
  updateDealerTableCards();
  updateCountDisplay();
  updateShoeStatus();
}

function updateCountDisplay() {
  const rcEl = document.getElementById('runningCount');
  const tcEl = document.getElementById('trueCount');
  if (rcEl) rcEl.textContent = AppState.runningCount;
  if (tcEl) tcEl.textContent = calculateTrueCount();

  // Also update stats panel
  const cardsDealtEl = document.getElementById('statCardsDealt');
  if (cardsDealtEl) cardsDealtEl.textContent = AppState.cardsDealt;

  const cardsSeenEl = document.getElementById('cardsSeen');
  if (cardsSeenEl) cardsSeenEl.textContent = `${AppState.cardsDealt}/${AppState.totalCards}`;
}

function updateShoeStatus() {
  const penetration = (AppState.cardsDealt / AppState.totalCards * 100).toFixed(1);

  // Update shoe composition bar if it exists
  const shoeBar = document.querySelector('.shoe-composition-bar');
  if (shoeBar) {
    shoeBar.style.background = `linear-gradient(to right, var(--accent-cyan) ${penetration}%, var(--bg-darker) ${penetration}%)`;
  }

  // Update penetration text
  const penEl = document.querySelector('.penetration-value');
  if (penEl) penEl.textContent = penetration + '%';
}

function showHistoryPanel() {
  const modal = document.getElementById('historyModal');
  if (modal) {
    updateHistoryDisplay();
    modal.classList.add('active');
  }
}

function hideHistoryPanel() {
  const modal = document.getElementById('historyModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function updateHistoryDisplay() {
  const history = AppState.gameHistory;
  const stats = history.statistics;

  // Update statistics display
  setText('histRounds', stats.totalRounds);
  setText('histWins', stats.playerWins);
  setText('histLosses', stats.playerLosses);
  setText('histDealerBusts', stats.dealerBusts);
  setText('histPlayerBusts', stats.playerBusts);
  setText('histBlackjacks', stats.blackjacks);
  setText('histSplits', stats.splits);
  setText('histDoubles', stats.doubles);

  // Calculate and display rates
  const dealerBustRate = stats.totalRounds > 0 ? ((stats.dealerBusts / stats.totalRounds) * 100).toFixed(1) : '0';
  const winRate = (stats.playerWins + stats.playerLosses) > 0 ?
    ((stats.playerWins / (stats.playerWins + stats.playerLosses)) * 100).toFixed(1) : '0';

  setText('histDealerBustRate', dealerBustRate + '%');
  setText('histWinRate', winRate + '%');
  setText('histDuration', calculateSessionDuration());

  // Update alerts list
  const alertsList = document.getElementById('histAlertsList');
  if (alertsList) {
    if (history.alerts.length === 0) {
      alertsList.innerHTML = '<div class="hist-alert-item">No alerts yet</div>';
    } else {
      alertsList.innerHTML = history.alerts.slice(-10).reverse().map(alert => `
        <div class="hist-alert-item ${alert.type.toLowerCase()}">
          <span class="alert-round">R${alert.round}</span>
          <span class="alert-msg">${alert.message}</span>
        </div>
      `).join('');
    }
  }

  // Update recent rounds
  const roundsList = document.getElementById('histRoundsList');
  if (roundsList) {
    if (history.rounds.length === 0) {
      roundsList.innerHTML = '<div class="hist-round-item">No rounds recorded</div>';
    } else {
      roundsList.innerHTML = history.rounds.slice(-10).reverse().map(round => `
        <div class="hist-round-item">
          <span class="round-num">R${round.roundNumber}</span>
          <span class="round-dealer">D: ${round.dealer.cards.join(' ')} = ${round.dealer.total}${round.dealer.busted ? ' BUST' : ''}</span>
          <span class="round-count">RC: ${round.runningCountEnd}</span>
        </div>
      `).join('');
    }
  }
}

// ============================================
// Utilities
// ============================================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// HAND ANALYZER
// ============================================
function analyzeHandEV(playerCards, dealerUpcard) {
  const playerTotal = calculateHandTotal(playerCards);
  const isSoft = playerCards.includes('A') && playerTotal <= 21;
  const isPair = playerCards.length === 2 && getCardValue(playerCards[0]) === getCardValue(playerCards[1]);
  const dealerVal = getCardValue(dealerUpcard);

  // Calculate EV for each action
  const evs = {
    stand: calculateStandEV(playerTotal, dealerVal),
    hit: calculateHitEV(playerTotal, dealerVal, isSoft),
    double: playerCards.length === 2 ? calculateDoubleEV(playerTotal, dealerVal) : null,
    split: isPair ? calculateSplitEV(playerCards[0], dealerVal) : null,
    surrender: playerCards.length === 2 ? -0.5 : null
  };

  // Find best action
  let bestAction = 'stand';
  let bestEV = evs.stand;
  for (const [action, ev] of Object.entries(evs)) {
    if (ev !== null && ev > bestEV) {
      bestEV = ev;
      bestAction = action;
    }
  }

  return {
    playerTotal,
    isSoft,
    isPair,
    dealerUpcard,
    evs,
    bestAction,
    bestEV,
    advantage: (bestEV * 100).toFixed(3) + '%'
  };
}

function calculateStandEV(playerTotal, dealerUpcard) {
  // Simplified EV calculation based on dealer bust probabilities
  const dealerBustProb = getDealerBustProbability(dealerUpcard);
  if (playerTotal > 21) return -1;
  if (playerTotal === 21) return 0.9;

  // Estimate based on dealer upcard strength
  const dealerStrength = dealerUpcard >= 7 ? 0.6 : 0.4;
  const winProb = dealerBustProb + (1 - dealerBustProb) * (playerTotal > 17 ? 0.4 : 0.2);

  return winProb - (1 - winProb - 0.08);
}

function calculateHitEV(playerTotal, dealerUpcard, isSoft) {
  if (playerTotal >= 21) return -1;

  const bustProb = isSoft ? 0 : getBustProbability(playerTotal);
  const improveProb = 1 - bustProb;

  // Simplified: if we improve, estimate new EV
  const avgImprovedTotal = Math.min(21, playerTotal + 4);
  const improvedEV = calculateStandEV(avgImprovedTotal, dealerUpcard);

  return -bustProb + improveProb * improvedEV * 0.8;
}

function calculateDoubleEV(playerTotal, dealerUpcard) {
  const hitEV = calculateHitEV(playerTotal, dealerUpcard, false);
  return hitEV * 1.8; // Approximate double value
}

function calculateSplitEV(card, dealerUpcard) {
  const cardVal = getCardValue(card);
  // Aces and 8s are always good splits
  if (card === 'A') return 0.4;
  if (cardVal === 8) return 0.3;
  if (cardVal === 10) return -0.1; // Don't split tens
  return calculateHitEV(cardVal * 2, dealerUpcard, false) * 0.9;
}

function getBustProbability(total) {
  if (total <= 11) return 0;
  if (total === 12) return 0.31;
  if (total === 13) return 0.39;
  if (total === 14) return 0.56;
  if (total === 15) return 0.58;
  if (total === 16) return 0.62;
  if (total >= 17) return 0.69;
  return 0;
}

function getDealerBustProbability(upcard) {
  const bustProbs = {
    2: 0.3536, 3: 0.3746, 4: 0.4025, 5: 0.4193, 6: 0.4236,
    7: 0.2599, 8: 0.2386, 9: 0.2306, 10: 0.2143, 'A': 0.1165
  };
  return bustProbs[upcard] || 0.25;
}

function showHandAnalyzer() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'handAnalyzerModal';
  modal.innerHTML = `
    <div class="modal-content analyzer-modal">
      <div class="modal-header">
        <h3>Hand Analyzer</h3>
        <button class="modal-close" onclick="closeModal('handAnalyzerModal')">&times;</button>
      </div>
      <div class="analyzer-inputs">
        <div class="input-group">
          <label>Player Cards:</label>
          <div class="card-select">
            <select id="analyzerCard1">
              ${['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
            <select id="analyzerCard2">
              ${['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="input-group">
          <label>Dealer Upcard:</label>
          <select id="analyzerDealer">
            ${['A','2','3','4','5','6','7','8','9','10'].map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <button class="btn-analyze" onclick="runHandAnalysis()">ANALYZE</button>
      </div>
      <div class="analyzer-results" id="analyzerResults"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

function runHandAnalysis() {
  const card1 = document.getElementById('analyzerCard1').value;
  const card2 = document.getElementById('analyzerCard2').value;
  const dealer = document.getElementById('analyzerDealer').value;

  const result = analyzeHandEV([card1, card2], dealer);

  document.getElementById('analyzerResults').innerHTML = `
    <div class="result-summary">
      <div class="result-hand">
        <span class="hand-cards">${card1} ${card2}</span> vs <span class="dealer-card">${dealer}</span>
        <span class="hand-total">Total: ${result.playerTotal}${result.isSoft ? ' (Soft)' : ''}${result.isPair ? ' (Pair)' : ''}</span>
      </div>
      <div class="best-action ${result.bestAction}">
        <span class="action-label">BEST ACTION:</span>
        <span class="action-value">${result.bestAction.toUpperCase()}</span>
        <span class="action-ev">EV: ${(result.bestEV * 100).toFixed(2)}%</span>
      </div>
    </div>
    <div class="ev-breakdown">
      <h4>EV by Action:</h4>
      <div class="ev-row ${result.bestAction === 'stand' ? 'best' : ''}">
        <span>STAND</span><span>${(result.evs.stand * 100).toFixed(2)}%</span>
      </div>
      <div class="ev-row ${result.bestAction === 'hit' ? 'best' : ''}">
        <span>HIT</span><span>${(result.evs.hit * 100).toFixed(2)}%</span>
      </div>
      ${result.evs.double !== null ? `<div class="ev-row ${result.bestAction === 'double' ? 'best' : ''}">
        <span>DOUBLE</span><span>${(result.evs.double * 100).toFixed(2)}%</span>
      </div>` : ''}
      ${result.evs.split !== null ? `<div class="ev-row ${result.bestAction === 'split' ? 'best' : ''}">
        <span>SPLIT</span><span>${(result.evs.split * 100).toFixed(2)}%</span>
      </div>` : ''}
      ${result.evs.surrender !== null ? `<div class="ev-row ${result.bestAction === 'surrender' ? 'best' : ''}">
        <span>SURRENDER</span><span>${(result.evs.surrender * 100).toFixed(2)}%</span>
      </div>` : ''}
    </div>
  `;
}

// ============================================
// MULTI-COUNT SYSTEMS
// ============================================
function updateAllCounts(card) {
  const rank = card === 'J' || card === 'Q' || card === 'K' ? '10' : card;

  for (const system in AppState.countSystems.systems) {
    const values = AppState.countSystems.systems[system];
    AppState.countSystems.counts[system] += values[rank] || 0;
  }
}

function resetAllCounts() {
  for (const system in AppState.countSystems.counts) {
    AppState.countSystems.counts[system] = 0;
  }
}

function getTrueCountForSystem(system) {
  const decksRemaining = (AppState.totalCards - AppState.cardsDealt) / 52;
  if (decksRemaining <= 0) return 0;
  return AppState.countSystems.counts[system] / decksRemaining;
}

function showCountSystemsPanel() {
  const panel = document.getElementById('countSystemsPanel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    updateCountSystemsDisplay();
  }
}

function updateCountSystemsDisplay() {
  const container = document.getElementById('countSystemsGrid');
  if (!container) return;

  const decksRemaining = (AppState.totalCards - AppState.cardsDealt) / 52;

  container.innerHTML = Object.entries(AppState.countSystems.counts).map(([system, rc]) => {
    const tc = decksRemaining > 0 ? (rc / decksRemaining).toFixed(2) : '0.00';
    const isActive = system === AppState.countSystems.active;
    return `
      <div class="count-system-box ${isActive ? 'active' : ''}" onclick="setActiveCountSystem('${system}')">
        <div class="system-name">${system.toUpperCase()}</div>
        <div class="system-rc">RC: ${rc}</div>
        <div class="system-tc">TC: ${tc}</div>
      </div>
    `;
  }).join('');
}

function setActiveCountSystem(system) {
  AppState.countSystems.active = system;
  updateCountSystemsDisplay();
  showToast(`Active count system: ${system.toUpperCase()}`, 'info');
}

// ============================================
// RISK OF RUIN CALCULATOR
// ============================================
function calculateRiskOfRuin(bankroll, betUnit, advantage, stdDev = 1.15) {
  // N0 formula: (stdDev / advantage)^2
  const n0 = Math.pow(stdDev / (advantage / 100), 2);

  // Risk of Ruin formula: e^(-2 * advantage * bankroll / (stdDev^2 * betUnit))
  const exponent = -2 * (advantage / 100) * (bankroll / betUnit) / Math.pow(stdDev, 2);
  const ror = Math.exp(exponent);

  // Kelly optimal bet
  const kellyBet = (advantage / 100) / Math.pow(stdDev, 2) * bankroll;

  // Hands to double bankroll (on average)
  const handsToDouble = bankroll / (betUnit * (advantage / 100));

  return {
    riskOfRuin: (ror * 100).toFixed(4) + '%',
    n0: Math.round(n0),
    kellyBet: kellyBet.toFixed(2),
    kellyFraction: ((kellyBet / bankroll) * 100).toFixed(2) + '%',
    handsToDouble: Math.round(handsToDouble),
    expectedHourly: (betUnit * (advantage / 100) * 100).toFixed(2) // assuming 100 hands/hour
  };
}

function showRiskOfRuinCalculator() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'rorModal';
  modal.innerHTML = `
    <div class="modal-content ror-modal">
      <div class="modal-header">
        <h3>Risk of Ruin Calculator</h3>
        <button class="modal-close" onclick="closeModal('rorModal')">&times;</button>
      </div>
      <div class="ror-inputs">
        <div class="input-row">
          <label>Bankroll ($):</label>
          <input type="number" id="rorBankroll" value="10000" min="100">
        </div>
        <div class="input-row">
          <label>Bet Unit ($):</label>
          <input type="number" id="rorBetUnit" value="25" min="1">
        </div>
        <div class="input-row">
          <label>Advantage (%):</label>
          <input type="number" id="rorAdvantage" value="1.0" step="0.1" min="0.1">
        </div>
        <div class="input-row">
          <label>Std Deviation:</label>
          <input type="number" id="rorStdDev" value="1.15" step="0.05">
        </div>
        <button class="btn-calculate" onclick="runRorCalculation()">CALCULATE</button>
      </div>
      <div class="ror-results" id="rorResults"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

function runRorCalculation() {
  const bankroll = parseFloat(document.getElementById('rorBankroll').value);
  const betUnit = parseFloat(document.getElementById('rorBetUnit').value);
  const advantage = parseFloat(document.getElementById('rorAdvantage').value);
  const stdDev = parseFloat(document.getElementById('rorStdDev').value);

  const result = calculateRiskOfRuin(bankroll, betUnit, advantage, stdDev);

  document.getElementById('rorResults').innerHTML = `
    <div class="ror-result-grid">
      <div class="ror-stat">
        <span class="ror-label">Risk of Ruin</span>
        <span class="ror-value danger">${result.riskOfRuin}</span>
      </div>
      <div class="ror-stat">
        <span class="ror-label">N0 (Break-even hands)</span>
        <span class="ror-value">${result.n0.toLocaleString()}</span>
      </div>
      <div class="ror-stat">
        <span class="ror-label">Kelly Optimal Bet</span>
        <span class="ror-value">$${result.kellyBet}</span>
      </div>
      <div class="ror-stat">
        <span class="ror-label">Kelly Fraction</span>
        <span class="ror-value">${result.kellyFraction}</span>
      </div>
      <div class="ror-stat">
        <span class="ror-label">Hands to Double</span>
        <span class="ror-value">${result.handsToDouble.toLocaleString()}</span>
      </div>
      <div class="ror-stat">
        <span class="ror-label">Expected Hourly</span>
        <span class="ror-value success">$${result.expectedHourly}</span>
      </div>
    </div>
    <div class="ror-advice">
      <p><strong>Bet Spread Ratio:</strong> ${Math.round(bankroll / betUnit)}:1</p>
      <p><strong>Recommended:</strong> ${parseFloat(result.riskOfRuin) < 5 ? 'Safe betting level' : parseFloat(result.riskOfRuin) < 15 ? 'Moderate risk - consider smaller bets' : 'High risk - reduce bet size significantly'}</p>
    </div>
  `;
}

// ============================================
// VARIANCE CALCULATOR
// ============================================
function calculateVariance(hands, betUnit, advantage) {
  const stdDev = 1.15;
  const ev = hands * betUnit * (advantage / 100);
  const variance = hands * Math.pow(betUnit * stdDev, 2);
  const sd = Math.sqrt(variance);

  // Confidence intervals
  const ci68 = { low: ev - sd, high: ev + sd };
  const ci95 = { low: ev - 2 * sd, high: ev + 2 * sd };
  const ci99 = { low: ev - 3 * sd, high: ev + 3 * sd };

  return { ev, sd, variance, ci68, ci95, ci99 };
}

function showVarianceCalculator() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'varianceModal';
  modal.innerHTML = `
    <div class="modal-content variance-modal">
      <div class="modal-header">
        <h3>Variance Calculator</h3>
        <button class="modal-close" onclick="closeModal('varianceModal')">&times;</button>
      </div>
      <div class="variance-inputs">
        <div class="input-row">
          <label>Number of Hands:</label>
          <input type="number" id="varHands" value="1000" min="1">
        </div>
        <div class="input-row">
          <label>Average Bet ($):</label>
          <input type="number" id="varBet" value="50" min="1">
        </div>
        <div class="input-row">
          <label>Advantage (%):</label>
          <input type="number" id="varAdvantage" value="1.0" step="0.1">
        </div>
        <button class="btn-calculate" onclick="runVarianceCalculation()">CALCULATE</button>
      </div>
      <div class="variance-results" id="varianceResults"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

function runVarianceCalculation() {
  const hands = parseInt(document.getElementById('varHands').value);
  const bet = parseFloat(document.getElementById('varBet').value);
  const advantage = parseFloat(document.getElementById('varAdvantage').value);

  const result = calculateVariance(hands, bet, advantage);

  document.getElementById('varianceResults').innerHTML = `
    <div class="variance-result-grid">
      <div class="var-stat">
        <span class="var-label">Expected Value</span>
        <span class="var-value ${result.ev >= 0 ? 'success' : 'danger'}">$${result.ev.toFixed(2)}</span>
      </div>
      <div class="var-stat">
        <span class="var-label">Standard Deviation</span>
        <span class="var-value">$${result.sd.toFixed(2)}</span>
      </div>
      <div class="var-stat full-width">
        <span class="var-label">68% Confidence (1 SD)</span>
        <span class="var-range">$${result.ci68.low.toFixed(0)} to $${result.ci68.high.toFixed(0)}</span>
      </div>
      <div class="var-stat full-width">
        <span class="var-label">95% Confidence (2 SD)</span>
        <span class="var-range">$${result.ci95.low.toFixed(0)} to $${result.ci95.high.toFixed(0)}</span>
      </div>
      <div class="var-stat full-width">
        <span class="var-label">99% Confidence (3 SD)</span>
        <span class="var-range">$${result.ci99.low.toFixed(0)} to $${result.ci99.high.toFixed(0)}</span>
      </div>
    </div>
  `;
}

// ============================================
// TRAINING MODE
// ============================================
function startTrainingMode() {
  AppState.trainingMode.enabled = true;
  AppState.trainingMode.totalQuestions = 0;
  AppState.trainingMode.correctAnswers = 0;
  AppState.trainingMode.streakCorrect = 0;
  AppState.trainingMode.mistakes = [];

  showTrainingModal();
  generateTrainingHand();
}

function showTrainingModal() {
  let modal = document.getElementById('trainingModal');
  if (modal) {
    modal.style.display = 'flex';
    return;
  }

  modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'trainingModal';
  modal.innerHTML = `
    <div class="modal-content training-modal">
      <div class="modal-header">
        <h3>Training Mode</h3>
        <div class="training-stats">
          <span id="trainingScore">0/0</span>
          <span id="trainingAccuracy">0%</span>
          <span id="trainingStreak">Streak: 0</span>
        </div>
        <button class="modal-close" onclick="endTrainingMode()">&times;</button>
      </div>
      <div class="training-hand" id="trainingHand"></div>
      <div class="training-actions" id="trainingActions"></div>
      <div class="training-feedback" id="trainingFeedback"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

function generateTrainingHand() {
  const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const card1 = cards[Math.floor(Math.random() * cards.length)];
  const card2 = cards[Math.floor(Math.random() * cards.length)];
  const dealer = cards[Math.floor(Math.random() * 10)]; // 2-A

  const playerTotal = calculateHandTotal([card1, card2]);
  const isPair = getCardValue(card1) === getCardValue(card2);
  const isSoft = (card1 === 'A' || card2 === 'A') && playerTotal <= 21;

  // Store current hand for checking
  AppState.trainingMode.currentHand = { card1, card2, dealer, playerTotal, isPair, isSoft };

  document.getElementById('trainingHand').innerHTML = `
    <div class="training-dealer">
      <span class="label">Dealer</span>
      <span class="card">${dealer}</span>
    </div>
    <div class="training-player">
      <span class="label">Your Hand</span>
      <div class="cards">
        <span class="card">${card1}</span>
        <span class="card">${card2}</span>
      </div>
      <span class="total">${playerTotal}${isSoft ? ' (Soft)' : ''}${isPair ? ' (Pair)' : ''}</span>
    </div>
  `;

  // Generate action buttons
  let actions = ['HIT', 'STAND'];
  actions.push('DOUBLE');
  if (isPair) actions.push('SPLIT');
  actions.push('SURRENDER');

  document.getElementById('trainingActions').innerHTML = actions.map(action =>
    `<button class="training-btn ${action.toLowerCase()}" onclick="checkTrainingAnswer('${action}')">${action}</button>`
  ).join('');

  document.getElementById('trainingFeedback').innerHTML = '';
}

function checkTrainingAnswer(answer) {
  const hand = AppState.trainingMode.currentHand;
  const correctAction = getCorrectBasicStrategyAction(hand.card1, hand.card2, hand.dealer);

  AppState.trainingMode.totalQuestions++;

  const isCorrect = answer === correctAction;
  if (isCorrect) {
    AppState.trainingMode.correctAnswers++;
    AppState.trainingMode.streakCorrect++;
    if (AppState.trainingMode.streakCorrect > AppState.trainingMode.bestStreak) {
      AppState.trainingMode.bestStreak = AppState.trainingMode.streakCorrect;
    }
    playAudioAlert('correct');
  } else {
    AppState.trainingMode.streakCorrect = 0;
    AppState.trainingMode.mistakes.push({
      hand: `${hand.card1},${hand.card2} vs ${hand.dealer}`,
      yourAnswer: answer,
      correct: correctAction
    });
    playAudioAlert('incorrect');
  }

  // Update stats
  document.getElementById('trainingScore').textContent =
    `${AppState.trainingMode.correctAnswers}/${AppState.trainingMode.totalQuestions}`;
  document.getElementById('trainingAccuracy').textContent =
    `${((AppState.trainingMode.correctAnswers / AppState.trainingMode.totalQuestions) * 100).toFixed(1)}%`;
  document.getElementById('trainingStreak').textContent =
    `Streak: ${AppState.trainingMode.streakCorrect}`;

  // Show feedback
  document.getElementById('trainingFeedback').innerHTML = `
    <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
      ${isCorrect ? 'CORRECT!' : `INCORRECT - Correct answer: ${correctAction}`}
    </div>
  `;

  // Highlight buttons
  document.querySelectorAll('.training-btn').forEach(btn => {
    if (btn.textContent === correctAction) btn.classList.add('correct-answer');
    if (btn.textContent === answer && !isCorrect) btn.classList.add('wrong-answer');
  });

  // Next hand after delay
  setTimeout(generateTrainingHand, 1500);
}

function getCorrectBasicStrategyAction(card1, card2, dealer) {
  const total = calculateHandTotal([card1, card2]);
  const dealerVal = getCardValue(dealer);
  const isPair = getCardValue(card1) === getCardValue(card2);
  const isSoft = (card1 === 'A' || card2 === 'A') && total <= 21;

  // Simplified basic strategy
  if (isPair) {
    if (card1 === 'A' || getCardValue(card1) === 8) return 'SPLIT';
    if (getCardValue(card1) === 10) return 'STAND';
    if (getCardValue(card1) === 9 && dealerVal !== 7 && dealerVal < 10) return 'SPLIT';
  }

  if (isSoft) {
    if (total >= 19) return 'STAND';
    if (total === 18 && dealerVal >= 9) return 'HIT';
    if (total === 18) return 'STAND';
    if (total >= 13 && total <= 17 && dealerVal >= 4 && dealerVal <= 6) return 'DOUBLE';
    return 'HIT';
  }

  // Hard totals
  if (total >= 17) return 'STAND';
  if (total >= 13 && total <= 16 && dealerVal <= 6) return 'STAND';
  if (total === 12 && dealerVal >= 4 && dealerVal <= 6) return 'STAND';
  if (total === 11) return 'DOUBLE';
  if (total === 10 && dealerVal <= 9) return 'DOUBLE';
  if (total === 9 && dealerVal >= 3 && dealerVal <= 6) return 'DOUBLE';
  if (total === 16 && dealerVal >= 9) return 'SURRENDER';
  if (total === 15 && dealerVal === 10) return 'SURRENDER';

  return 'HIT';
}

function endTrainingMode() {
  AppState.trainingMode.enabled = false;
  const modal = document.getElementById('trainingModal');
  if (modal) modal.style.display = 'none';

  showToast(`Training complete: ${AppState.trainingMode.correctAnswers}/${AppState.trainingMode.totalQuestions} correct`, 'info');
}

// ============================================
// SESSION BANKROLL TRACKER
// ============================================
function initSessionTracker(startingBankroll = 1000) {
  AppState.sessionTracker = {
    ...AppState.sessionTracker,
    startingBankroll,
    currentBankroll: startingBankroll,
    sessionStart: new Date(),
    handsPlayed: 0,
    peakBankroll: startingBankroll,
    lowestBankroll: startingBankroll,
    biggestWin: 0,
    biggestLoss: 0,
    currentStreak: 0,
    longestWinStreak: 0,
    longestLoseStreak: 0
  };
  updateSessionDisplay();
}

function updateSessionBankroll(result, amount) {
  const tracker = AppState.sessionTracker;
  tracker.handsPlayed++;

  if (result === 'win') {
    tracker.currentBankroll += amount;
    tracker.currentStreak = tracker.currentStreak > 0 ? tracker.currentStreak + 1 : 1;
    if (tracker.currentStreak > tracker.longestWinStreak) {
      tracker.longestWinStreak = tracker.currentStreak;
    }
    if (amount > tracker.biggestWin) tracker.biggestWin = amount;
  } else if (result === 'loss') {
    tracker.currentBankroll -= amount;
    tracker.currentStreak = tracker.currentStreak < 0 ? tracker.currentStreak - 1 : -1;
    if (Math.abs(tracker.currentStreak) > tracker.longestLoseStreak) {
      tracker.longestLoseStreak = Math.abs(tracker.currentStreak);
    }
    if (amount > tracker.biggestLoss) tracker.biggestLoss = amount;
  }

  if (tracker.currentBankroll > tracker.peakBankroll) {
    tracker.peakBankroll = tracker.currentBankroll;
  }
  if (tracker.currentBankroll < tracker.lowestBankroll) {
    tracker.lowestBankroll = tracker.currentBankroll;
  }

  // Check goals
  checkSessionGoals();
  updateSessionDisplay();
}

function checkSessionGoals() {
  const tracker = AppState.sessionTracker;
  const profit = tracker.currentBankroll - tracker.startingBankroll;
  const elapsed = (new Date() - tracker.sessionStart) / 60000; // minutes

  if (profit >= tracker.goals.profitTarget) {
    playAudioAlert('goal');
    showToast(`Profit target reached: $${profit.toFixed(0)}!`, 'success');
  }

  if (profit <= -tracker.goals.lossLimit) {
    playAudioAlert('warning');
    showToast(`Loss limit reached: $${Math.abs(profit).toFixed(0)}`, 'danger');
  }

  if (elapsed >= tracker.goals.timeLimit) {
    showToast(`Time limit reached: ${Math.round(elapsed)} minutes`, 'warning');
  }

  if (tracker.handsPlayed >= tracker.goals.handsLimit) {
    showToast(`Hands limit reached: ${tracker.handsPlayed}`, 'warning');
  }
}

function updateSessionDisplay() {
  const tracker = AppState.sessionTracker;
  const profit = tracker.currentBankroll - tracker.startingBankroll;
  const elapsed = tracker.sessionStart ? (new Date() - tracker.sessionStart) / 3600000 : 0; // hours
  const hourlyRate = elapsed > 0 ? profit / elapsed : 0;

  const container = document.getElementById('sessionTrackerDisplay');
  if (container) {
    container.innerHTML = `
      <div class="session-stat">
        <span class="label">Bankroll</span>
        <span class="value">$${tracker.currentBankroll.toFixed(0)}</span>
      </div>
      <div class="session-stat ${profit >= 0 ? 'positive' : 'negative'}">
        <span class="label">Profit/Loss</span>
        <span class="value">${profit >= 0 ? '+' : ''}$${profit.toFixed(0)}</span>
      </div>
      <div class="session-stat">
        <span class="label">$/Hour</span>
        <span class="value ${hourlyRate >= 0 ? 'positive' : 'negative'}">${hourlyRate >= 0 ? '+' : ''}$${hourlyRate.toFixed(0)}</span>
      </div>
      <div class="session-stat">
        <span class="label">Hands</span>
        <span class="value">${tracker.handsPlayed}</span>
      </div>
    `;
  }
}

function showSessionTrackerPanel() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'sessionModal';

  const tracker = AppState.sessionTracker;
  const profit = tracker.currentBankroll - tracker.startingBankroll;
  const elapsed = tracker.sessionStart ? (new Date() - tracker.sessionStart) / 60000 : 0;

  modal.innerHTML = `
    <div class="modal-content session-modal">
      <div class="modal-header">
        <h3>Session Tracker</h3>
        <button class="modal-close" onclick="closeModal('sessionModal')">&times;</button>
      </div>
      <div class="session-details">
        <div class="session-main">
          <div class="bankroll-display">
            <span class="label">Current Bankroll</span>
            <span class="amount">$${tracker.currentBankroll.toFixed(0)}</span>
            <span class="profit ${profit >= 0 ? 'positive' : 'negative'}">${profit >= 0 ? '+' : ''}$${profit.toFixed(0)}</span>
          </div>
        </div>
        <div class="session-stats-grid">
          <div class="stat-box"><span class="label">Starting</span><span class="value">$${tracker.startingBankroll}</span></div>
          <div class="stat-box"><span class="label">Peak</span><span class="value">$${tracker.peakBankroll}</span></div>
          <div class="stat-box"><span class="label">Lowest</span><span class="value">$${tracker.lowestBankroll}</span></div>
          <div class="stat-box"><span class="label">Hands</span><span class="value">${tracker.handsPlayed}</span></div>
          <div class="stat-box"><span class="label">Biggest Win</span><span class="value positive">+$${tracker.biggestWin}</span></div>
          <div class="stat-box"><span class="label">Biggest Loss</span><span class="value negative">-$${tracker.biggestLoss}</span></div>
          <div class="stat-box"><span class="label">Win Streak</span><span class="value">${tracker.longestWinStreak}</span></div>
          <div class="stat-box"><span class="label">Lose Streak</span><span class="value">${tracker.longestLoseStreak}</span></div>
          <div class="stat-box"><span class="label">Time</span><span class="value">${Math.round(elapsed)} min</span></div>
        </div>
        <div class="session-goals">
          <h4>Session Goals</h4>
          <div class="goal-inputs">
            <div class="goal-row">
              <label>Profit Target:</label>
              <input type="number" id="goalProfit" value="${tracker.goals.profitTarget}" onchange="updateGoal('profitTarget', this.value)">
            </div>
            <div class="goal-row">
              <label>Loss Limit:</label>
              <input type="number" id="goalLoss" value="${tracker.goals.lossLimit}" onchange="updateGoal('lossLimit', this.value)">
            </div>
            <div class="goal-row">
              <label>Time Limit (min):</label>
              <input type="number" id="goalTime" value="${tracker.goals.timeLimit}" onchange="updateGoal('timeLimit', this.value)">
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function updateGoal(goal, value) {
  AppState.sessionTracker.goals[goal] = parseFloat(value);
}

// ============================================
// BET SPREAD OPTIMIZER
// ============================================
function calculateOptimalBetSpread(bankroll, minBet, advantage, ror_target = 5) {
  const spreads = [];

  for (let spread = 4; spread <= 20; spread += 2) {
    const maxBet = minBet * spread;
    const avgBet = minBet * (1 + spread) / 2;
    const ror = calculateRiskOfRuin(bankroll, avgBet, advantage).riskOfRuin;

    spreads.push({
      spread: `1:${spread}`,
      minBet,
      maxBet,
      avgBet: avgBet.toFixed(0),
      ror: parseFloat(ror),
      recommended: parseFloat(ror) <= ror_target && parseFloat(ror) > ror_target - 3
    });
  }

  return spreads;
}

function showBetSpreadOptimizer() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'betSpreadModal';
  modal.innerHTML = `
    <div class="modal-content betspread-modal">
      <div class="modal-header">
        <h3>Bet Spread Optimizer</h3>
        <button class="modal-close" onclick="closeModal('betSpreadModal')">&times;</button>
      </div>
      <div class="betspread-inputs">
        <div class="input-row">
          <label>Bankroll ($):</label>
          <input type="number" id="bsoBankroll" value="10000" min="100">
        </div>
        <div class="input-row">
          <label>Min Bet ($):</label>
          <input type="number" id="bsoMinBet" value="25" min="1">
        </div>
        <div class="input-row">
          <label>Advantage (%):</label>
          <input type="number" id="bsoAdvantage" value="1.0" step="0.1">
        </div>
        <div class="input-row">
          <label>Target RoR (%):</label>
          <input type="number" id="bsoRor" value="5" step="1" min="1" max="20">
        </div>
        <button class="btn-calculate" onclick="runBetSpreadCalculation()">OPTIMIZE</button>
      </div>
      <div class="betspread-results" id="betSpreadResults"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

function runBetSpreadCalculation() {
  const bankroll = parseFloat(document.getElementById('bsoBankroll').value);
  const minBet = parseFloat(document.getElementById('bsoMinBet').value);
  const advantage = parseFloat(document.getElementById('bsoAdvantage').value);
  const rorTarget = parseFloat(document.getElementById('bsoRor').value);

  const spreads = calculateOptimalBetSpread(bankroll, minBet, advantage, rorTarget);

  document.getElementById('betSpreadResults').innerHTML = `
    <table class="spread-table">
      <thead>
        <tr>
          <th>Spread</th>
          <th>Min</th>
          <th>Max</th>
          <th>Avg Bet</th>
          <th>RoR</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${spreads.map(s => `
          <tr class="${s.recommended ? 'recommended' : ''} ${s.ror > rorTarget * 2 ? 'danger' : ''}">
            <td>${s.spread}</td>
            <td>$${s.minBet}</td>
            <td>$${s.maxBet}</td>
            <td>$${s.avgBet}</td>
            <td>${s.ror.toFixed(2)}%</td>
            <td>${s.recommended ? 'RECOMMENDED' : ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ============================================
// AUDIO ALERTS
// ============================================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playAudioAlert(type) {
  if (!AppState.audioSettings.enabled) return;

  const frequencies = {
    positiveTc: [523, 659, 784], // C-E-G chord (happy)
    deviation: [440, 554, 659],  // A-C#-E (alert)
    betIncrease: [392, 494, 587], // G-B-D
    wonging: [349, 440, 523],    // F-A-C
    shuffle: [262, 330, 392],    // C-E-G low
    correct: [523, 659],         // Success
    incorrect: [311, 233],       // Fail
    goal: [523, 659, 784, 1047], // Big win
    warning: [233, 175]          // Warning
  };

  const freqs = frequencies[type] || [440];
  const vol = AppState.audioSettings.volume;

  freqs.forEach((freq, i) => {
    setTimeout(() => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = vol * 0.3;
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      osc.start();
      osc.stop(audioContext.currentTime + 0.2);
    }, i * 100);
  });
}

function toggleAudio() {
  AppState.audioSettings.enabled = !AppState.audioSettings.enabled;
  showToast(`Audio ${AppState.audioSettings.enabled ? 'enabled' : 'disabled'}`, 'info');
  updateAudioButton();
}

function updateAudioButton() {
  const btn = document.getElementById('btnAudio');
  if (btn) {
    btn.textContent = AppState.audioSettings.enabled ? 'SOUND ON' : 'SOUND OFF';
    btn.classList.toggle('muted', !AppState.audioSettings.enabled);
  }
}

// ============================================
// ACE SEQUENCING
// ============================================
function trackAce(position) {
  if (!AppState.aceTracker.enabled) return;

  AppState.aceTracker.acePositions.push(position);

  // Track the card that appeared before the ace
  if (AppState.shoeReplay.currentShoe.length >= 2) {
    const keyCard = AppState.shoeReplay.currentShoe[AppState.shoeReplay.currentShoe.length - 2];
    AppState.aceTracker.keyCards.push({ keyCard, acePosition: position });
  }
}

function predictAces() {
  // Analyze patterns to predict ace locations
  const predictions = [];
  const tracker = AppState.aceTracker;

  if (tracker.keyCards.length < 2) return predictions;

  // Simple prediction based on key card patterns
  const lastKeyCard = tracker.keyCards[tracker.keyCards.length - 1];
  predictions.push({
    confidence: 'low',
    message: `Last ace followed ${lastKeyCard.keyCard}`
  });

  return predictions;
}

function toggleAceTracker() {
  AppState.aceTracker.enabled = !AppState.aceTracker.enabled;
  showToast(`Ace sequencing ${AppState.aceTracker.enabled ? 'enabled' : 'disabled'}`, 'info');
}

// ============================================
// HEAT INDEX
// ============================================
function updateHeatIndex(betAmount, won) {
  const heat = AppState.heatIndex;

  heat.lastBets.push({ amount: betAmount, won, time: Date.now() });
  if (heat.lastBets.length > 20) heat.lastBets.shift();

  // Calculate heat factors
  const avgBet = heat.lastBets.reduce((s, b) => s + b.amount, 0) / heat.lastBets.length;
  const maxBet = Math.max(...heat.lastBets.map(b => b.amount));
  const betVariation = maxBet / avgBet;

  const recentWins = heat.lastBets.slice(-10).filter(b => b.won).length;
  const winStreak = recentWins > 6 ? (recentWins - 6) * 10 : 0;

  heat.factors.bigBets = betAmount > avgBet * 3 ? 20 : betAmount > avgBet * 2 ? 10 : 0;
  heat.factors.winStreak = winStreak;
  heat.factors.betVariation = betVariation > 8 ? 30 : betVariation > 5 ? 15 : 0;

  // Calculate total heat
  heat.level = Math.min(100, heat.factors.bigBets + heat.factors.winStreak + heat.factors.betVariation);

  updateHeatDisplay();
}

function updateHeatDisplay() {
  const container = document.getElementById('heatIndexDisplay');
  if (!container) return;

  const heat = AppState.heatIndex;
  const color = heat.level < 30 ? '#22c55e' : heat.level < 60 ? '#f59e0b' : '#ef4444';
  const advice = heat.level < 30 ? 'Safe' : heat.level < 60 ? 'Caution' : 'Cool off!';

  container.innerHTML = `
    <div class="heat-meter">
      <div class="heat-bar" style="width: ${heat.level}%; background: ${color}"></div>
    </div>
    <div class="heat-label">${heat.level}% - ${advice}</div>
  `;
}

function getCamouflageAdvice() {
  const heat = AppState.heatIndex.level;

  if (heat < 30) return 'Playing normally - no camouflage needed';
  if (heat < 50) return 'Consider making a "bad" play occasionally';
  if (heat < 70) return 'Reduce bet spread, take some breaks';
  return 'High heat! Consider leaving soon, wong out, or sit out hands';
}

// ============================================
// WONGING
// ============================================
function checkWongingSignal() {
  const tc = getTrueCount();
  const wonging = AppState.wonging;

  if (!wonging.enabled) return null;

  if (!wonging.currentlyIn && tc >= wonging.entryTc) {
    return { action: 'ENTER', tc, message: `TC ${tc.toFixed(1)} >= ${wonging.entryTc} - Enter table!` };
  }

  if (wonging.currentlyIn && tc <= wonging.exitTc) {
    return { action: 'EXIT', tc, message: `TC ${tc.toFixed(1)} <= ${wonging.exitTc} - Wong out!` };
  }

  return null;
}

function updateWongingStatus(entering) {
  AppState.wonging.currentlyIn = entering;
  if (!entering) AppState.wonging.handsWonged++;
  updateWongingDisplay();
}

function updateWongingDisplay() {
  const container = document.getElementById('wongingDisplay');
  if (!container) return;

  const signal = checkWongingSignal();
  const wonging = AppState.wonging;

  container.innerHTML = `
    <div class="wonging-status ${wonging.currentlyIn ? 'in' : 'out'}">
      ${wonging.currentlyIn ? 'IN GAME' : 'WONGED OUT'}
    </div>
    ${signal ? `<div class="wonging-signal ${signal.action.toLowerCase()}">${signal.message}</div>` : ''}
    <div class="wonging-stats">Entry: TC ${wonging.entryTc} | Exit: TC ${wonging.exitTc}</div>
  `;

  if (signal) {
    playAudioAlert('wonging');
  }
}

// ============================================
// THEME TOGGLE
// ============================================
function toggleTheme() {
  AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('light-theme', AppState.theme === 'light');
  localStorage.setItem('bjTheme', AppState.theme);
  showToast(`Theme: ${AppState.theme}`, 'info');
}

function loadTheme() {
  const saved = localStorage.getItem('bjTheme');
  if (saved) {
    AppState.theme = saved;
    document.body.classList.toggle('light-theme', AppState.theme === 'light');
  }
}

// ============================================
// SHOE REPLAY
// ============================================
function startShoeRecording() {
  AppState.shoeReplay.recording = true;
  AppState.shoeReplay.currentShoe = [];
  showToast('Recording shoe...', 'info');
}

function stopShoeRecording() {
  AppState.shoeReplay.recording = false;
  AppState.shoeReplay.savedShoes.push([...AppState.shoeReplay.currentShoe]);
  showToast(`Shoe saved (${AppState.shoeReplay.currentShoe.length} cards)`, 'success');
}

function recordCard(card) {
  if (AppState.shoeReplay.recording) {
    AppState.shoeReplay.currentShoe.push(card);
  }
}

function replayShoe(index) {
  if (index >= AppState.shoeReplay.savedShoes.length) return;

  const shoe = AppState.shoeReplay.savedShoes[index];
  AppState.shoeReplay.playbackIndex = 0;

  showToast(`Replaying shoe ${index + 1} (${shoe.length} cards)`, 'info');
  // Implementation would step through cards
}

// ============================================
// MOBILE TOUCH MODE
// ============================================
function initMobileMode() {
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-mode');

    // Add swipe gestures
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', e => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;

      if (Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          handleUndo(); // Swipe right = undo
        } else {
          handleResetRound(); // Swipe left = reset round
        }
      }
    });
  }
}

// ============================================
// ADVANCED TOOLS PANEL TOGGLE
// ============================================
function toggleAdvancedTools() {
  const panel = document.getElementById('advancedToolsPanel');
  panel.classList.toggle('collapsed');
}

// ============================================
// MOBILE TOUCH MODE TOGGLE
// ============================================
function toggleMobileTouchMode() {
  document.body.classList.toggle('touch-mode');
  const isEnabled = document.body.classList.contains('touch-mode');
  const btn = document.getElementById('btnTouchMode');
  if (btn) {
    btn.classList.toggle('active', isEnabled);
  }
  showToast(isEnabled ? 'Touch mode enabled' : 'Touch mode disabled', 'info');
}

// ============================================
// MODAL UTILITIES
// ============================================
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.remove();
}

function getCardValue(card) {
  if (card === 'A') return 11;
  if (['K', 'Q', 'J', '10'].includes(card)) return 10;
  return parseInt(card) || 0;
}

// ============================================
// MODAL SHOW/CLOSE FUNCTIONS
// ============================================

// Hand Analyzer
function closeHandAnalyzer() {
  document.getElementById('handAnalyzerModal').style.display = 'none';
}

function runHandAnalysis() {
  const handInput = document.getElementById('analyzerPlayerHand').value;
  const dealerCard = document.getElementById('analyzerDealerCard').value;

  if (!handInput) {
    showToast('Please enter a player hand', 'error');
    return;
  }

  const cards = handInput.split(',').map(c => c.trim().toUpperCase());
  const result = analyzeHandEV(cards, dealerCard);

  const resultsDiv = document.getElementById('analyzerResults');
  resultsDiv.innerHTML = `
    <div class="ev-result-grid">
      <div class="ev-result-item">
        <span class="ev-action">STAND</span>
        <span class="ev-value ${result.standEV >= 0 ? 'best' : 'negative'}">${(result.standEV * 100).toFixed(2)}%</span>
      </div>
      <div class="ev-result-item">
        <span class="ev-action">HIT</span>
        <span class="ev-value ${result.hitEV >= 0 ? 'best' : 'negative'}">${(result.hitEV * 100).toFixed(2)}%</span>
      </div>
      <div class="ev-result-item">
        <span class="ev-action">DOUBLE</span>
        <span class="ev-value ${result.doubleEV >= 0 ? 'best' : 'negative'}">${(result.doubleEV * 100).toFixed(2)}%</span>
      </div>
      ${result.canSplit ? `
      <div class="ev-result-item">
        <span class="ev-action">SPLIT</span>
        <span class="ev-value ${result.splitEV >= 0 ? 'best' : 'negative'}">${(result.splitEV * 100).toFixed(2)}%</span>
      </div>` : ''}
    </div>
    <div class="ev-recommendation">
      <strong>Optimal Play:</strong> ${result.optimalAction} (EV: ${(result.optimalEV * 100).toFixed(2)}%)
    </div>
  `;
}

// Risk of Ruin Calculator
function closeRoRCalculator() {
  document.getElementById('rorModal').style.display = 'none';
}

function calculateRoR() {
  const bankroll = parseFloat(document.getElementById('rorBankroll').value);
  const betUnit = parseFloat(document.getElementById('rorBetUnit').value);
  const advantage = parseFloat(document.getElementById('rorAdvantage').value) / 100;
  const stdDev = parseFloat(document.getElementById('rorStdDev').value);

  const result = calculateRiskOfRuin(bankroll, betUnit, advantage, stdDev);

  const resultsDiv = document.getElementById('rorResults');
  resultsDiv.innerHTML = `
    <div class="ror-main-result">
      <div class="ror-percentage">${(result.riskOfRuin * 100).toFixed(1)}%</div>
      <div class="ror-label">Risk of Ruin</div>
    </div>
    <div class="ror-details">
      <div class="ror-detail-item">
        <span>Bet Units in Bankroll</span>
        <span>${result.betUnits.toFixed(0)}</span>
      </div>
      <div class="ror-detail-item">
        <span>Kelly Fraction</span>
        <span>${(result.kelly * 100).toFixed(2)}%</span>
      </div>
      <div class="ror-detail-item">
        <span>Optimal Bet Size</span>
        <span>$${result.optimalBet.toFixed(0)}</span>
      </div>
      <div class="ror-detail-item">
        <span>Required Bankroll (2% RoR)</span>
        <span>$${result.requiredFor2Percent.toFixed(0)}</span>
      </div>
    </div>
  `;
}

// Variance Calculator
function closeVarianceCalculator() {
  document.getElementById('varianceModal').style.display = 'none';
}

function calculateVariance() {
  const hands = parseInt(document.getElementById('varHands').value);
  const betSize = parseFloat(document.getElementById('varBetSize').value);
  const advantage = parseFloat(document.getElementById('varAdvantage').value) / 100;

  const result = calculateVarianceStats(hands, betSize, advantage);

  const resultsDiv = document.getElementById('varianceResults');
  resultsDiv.innerHTML = `
    <div class="variance-chart">Confidence Interval Visualization</div>
    <div class="variance-stats">
      <div class="variance-stat">
        <div class="label">Expected Value</div>
        <div class="value" style="color: ${result.expectedValue >= 0 ? '#22c55e' : '#ef4444'}">$${result.expectedValue.toFixed(0)}</div>
      </div>
      <div class="variance-stat">
        <div class="label">Std Deviation</div>
        <div class="value">$${result.stdDev.toFixed(0)}</div>
      </div>
      <div class="variance-stat">
        <div class="label">68% Range</div>
        <div class="value">$${result.range68Low.toFixed(0)} to $${result.range68High.toFixed(0)}</div>
      </div>
      <div class="variance-stat">
        <div class="label">95% Range</div>
        <div class="value">$${result.range95Low.toFixed(0)} to $${result.range95High.toFixed(0)}</div>
      </div>
    </div>
  `;
}

// Training Mode
function closeTrainingMode() {
  document.getElementById('trainingModal').style.display = 'none';
  AppState.trainingMode.active = false;
}

function showTrainingModal() {
  document.getElementById('trainingModal').style.display = 'flex';
  generateTrainingHand();
}

// Session Tracker
function closeSessionTracker() {
  document.getElementById('sessionTrackerModal').style.display = 'none';
}

function updateSessionBankroll() {
  const newBankroll = parseFloat(document.getElementById('sessionBankrollInput').value);
  if (newBankroll >= 0) {
    AppState.sessionTracker.currentBankroll = newBankroll;
    if (newBankroll > AppState.sessionTracker.peakBankroll) {
      AppState.sessionTracker.peakBankroll = newBankroll;
    }
    if (newBankroll < AppState.sessionTracker.lowestBankroll) {
      AppState.sessionTracker.lowestBankroll = newBankroll;
    }
    updateSessionDisplay();
    showToast('Bankroll updated', 'success');
  }
}

function resetSession() {
  AppState.sessionTracker.startingBankroll = AppState.sessionTracker.currentBankroll;
  AppState.sessionTracker.peakBankroll = AppState.sessionTracker.currentBankroll;
  AppState.sessionTracker.lowestBankroll = AppState.sessionTracker.currentBankroll;
  AppState.sessionTracker.handsPlayed = 0;
  AppState.sessionTracker.sessionStart = Date.now();
  updateSessionDisplay();
  showToast('Session reset', 'info');
}

function exportSessionData() {
  const data = {
    ...AppState.sessionTracker,
    exportedAt: new Date().toISOString()
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${Date.now()}.json`;
  a.click();
  showToast('Session data exported', 'success');
}

function updateSessionDisplay() {
  const st = AppState.sessionTracker;
  document.getElementById('sessionCurrentBankroll').textContent = `$${st.currentBankroll.toLocaleString()}`;
  document.getElementById('sessionStartBankroll').textContent = `$${st.startingBankroll.toLocaleString()}`;
  document.getElementById('sessionPeak').textContent = `$${st.peakBankroll.toLocaleString()}`;
  document.getElementById('sessionLowest').textContent = `$${st.lowestBankroll.toLocaleString()}`;
  document.getElementById('sessionHands').textContent = st.handsPlayed;

  const pnl = st.currentBankroll - st.startingBankroll;
  const pnlPct = st.startingBankroll > 0 ? (pnl / st.startingBankroll * 100).toFixed(1) : 0;
  const pnlEl = document.getElementById('sessionPnL');
  pnlEl.textContent = `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString()} (${pnlPct}%)`;
  pnlEl.className = `bankroll-change ${pnl >= 0 ? 'positive' : 'negative'}`;

  if (st.sessionStart) {
    const mins = Math.floor((Date.now() - st.sessionStart) / 60000);
    document.getElementById('sessionDuration').textContent = `${Math.floor(mins/60)}:${(mins%60).toString().padStart(2,'0')}`;
  }
}

// Bet Spread Optimizer
function closeBetOptimizer() {
  document.getElementById('betOptimizerModal').style.display = 'none';
}

function optimizeBetSpread() {
  const bankroll = parseFloat(document.getElementById('optBankroll').value);
  const minBet = parseFloat(document.getElementById('optMinBet').value);
  const maxSpread = parseInt(document.getElementById('optMaxSpread').value);
  const riskLevel = document.getElementById('optRiskLevel').value;

  const result = calculateOptimalSpread(bankroll, minBet, maxSpread, riskLevel);

  const resultsDiv = document.getElementById('optimizerResults');
  resultsDiv.innerHTML = `
    <table class="spread-table">
      <tr><th>True Count</th><th>Bet Units</th><th>Bet Size</th></tr>
      ${result.spread.map(s => `
        <tr>
          <td>${s.tc >= 0 ? '+' : ''}${s.tc}</td>
          <td>${s.units}</td>
          <td>$${s.amount}</td>
        </tr>
      `).join('')}
    </table>
    <div class="spread-note">
      <strong>Risk Level:</strong> ${riskLevel}<br>
      <strong>Expected Hourly Rate:</strong> $${result.hourlyRate.toFixed(0)}/hr<br>
      <strong>Risk of Ruin:</strong> ${(result.ror * 100).toFixed(1)}%
    </div>
  `;
}

// Count Systems
function closeCountSystems() {
  document.getElementById('countSystemsModal').style.display = 'none';
}

function updateCountSystemsDisplay() {
  const cs = AppState.countSystems;
  const decksRemaining = Math.max(0.5, (AppState.totalCards - AppState.cardsDealt) / 52);

  document.getElementById('countHiLo').textContent = `RC: ${cs.counts.hilo}`;
  document.getElementById('countHiLoTC').textContent = `TC: ${(cs.counts.hilo / decksRemaining).toFixed(2)}`;
  document.getElementById('countOmega').textContent = `RC: ${cs.counts.omega2}`;
  document.getElementById('countOmegaTC').textContent = `TC: ${(cs.counts.omega2 / decksRemaining).toFixed(2)}`;
  document.getElementById('countHiOpt').textContent = `RC: ${cs.counts.hiopt2}`;
  document.getElementById('countHiOptTC').textContent = `TC: ${(cs.counts.hiopt2 / decksRemaining).toFixed(2)}`;
  document.getElementById('countZen').textContent = `RC: ${cs.counts.zen}`;
  document.getElementById('countZenTC').textContent = `TC: ${(cs.counts.zen / decksRemaining).toFixed(2)}`;
  document.getElementById('countWong').textContent = `RC: ${cs.counts.wong.toFixed(1)}`;
  document.getElementById('countWongTC').textContent = `TC: ${(cs.counts.wong / decksRemaining).toFixed(2)}`;
}

// Ace Sequencer
function showAceSequencer() {
  document.getElementById('aceSequencerModal').style.display = 'flex';
  updateAceSequencerDisplay();
}

function closeAceSequencer() {
  document.getElementById('aceSequencerModal').style.display = 'none';
}

function updateAceSequencerDisplay() {
  const acesLeft = AppState.rankCounts['A'] || 0;
  const totalAces = AppState.numDecks * 4;
  const decksRemaining = Math.max(0.5, (AppState.totalCards - AppState.cardsDealt) / 52);
  const expectedPerDeck = 4;
  const aceRichness = (acesLeft / decksRemaining) / expectedPerDeck;
  const aceProbability = (acesLeft / Math.max(1, AppState.totalCards - AppState.cardsDealt)) * 100;

  document.getElementById('acesRemaining').textContent = acesLeft;
  document.getElementById('aceExpected').textContent = (decksRemaining * 4).toFixed(1);
  document.getElementById('aceRichness').textContent = `${aceRichness.toFixed(2)}x`;
  document.getElementById('aceProbability').textContent = `${aceProbability.toFixed(1)}%`;

  // Update sequence list
  const sequenceList = document.getElementById('aceSequenceList');
  if (AppState.aceTracker && AppState.aceTracker.sequence.length > 0) {
    sequenceList.innerHTML = AppState.aceTracker.sequence.slice(-10).map((pos, i) =>
      `<span class="sequence-item">Ace #${i+1} at card ${pos}</span>`
    ).join('');
  } else {
    sequenceList.innerHTML = '<span class="no-data">No aces tracked yet</span>';
  }
}

// Heat Index
function showHeatIndexPanel() {
  document.getElementById('heatIndexModal').style.display = 'flex';
  updateHeatIndexDisplay();
}

function closeHeatIndex() {
  document.getElementById('heatIndexModal').style.display = 'none';
}

function updateHeatIndexDisplay() {
  const hi = AppState.heatIndex || { level: 20, factors: {} };

  document.getElementById('heatBar').style.width = `${hi.level}%`;
  document.getElementById('heatSpread').textContent = `1:${hi.factors.betSpread || 1} (${hi.factors.betSpread > 8 ? 'High' : 'Normal'})`;

  if (AppState.sessionTracker.sessionStart) {
    const mins = Math.floor((Date.now() - AppState.sessionTracker.sessionStart) / 60000);
    document.getElementById('heatDuration').textContent = `${mins} min`;
  }

  // Update camouflage tips based on heat level
  const tips = document.getElementById('camoTipsList');
  if (hi.level > 60) {
    tips.innerHTML = `
      <li><strong>Warning:</strong> High heat detected - consider leaving</li>
      <li>Reduce bet spread immediately</li>
      <li>Make some intentional small mistakes</li>
      <li>Take a bathroom break</li>
    `;
  } else if (hi.level > 40) {
    tips.innerHTML = `
      <li>Vary your bet timing - don't bet fast at high counts</li>
      <li>Chat with dealer occasionally</li>
      <li>Miss an index play once in a while at low stakes</li>
    `;
  }
}

// Wonging Signals
function showWongingSignals() {
  document.getElementById('wongingModal').style.display = 'flex';
  updateWongingDisplay();
}

function closeWonging() {
  document.getElementById('wongingModal').style.display = 'none';
}

function updateWongingSettings() {
  const entry = parseFloat(document.getElementById('wongEntry').value);
  const exit = parseFloat(document.getElementById('wongExit').value);

  if (AppState.wonging) {
    AppState.wonging.entryTC = entry;
    AppState.wonging.exitTC = exit;
    showToast('Wonging settings updated', 'success');
    updateWongingDisplay();
  }
}

function updateWongingDisplay() {
  const tc = AppState.trueCount;
  const wong = AppState.wonging || { entryTC: 2, exitTC: 0 };

  document.getElementById('wongCurrentTC').textContent = tc.toFixed(2);

  const signalEl = document.getElementById('wongingSignal');
  if (tc >= wong.entryTC) {
    signalEl.className = 'signal-display signal-enter';
    signalEl.innerHTML = '<span class="signal-icon">▶</span><span class="signal-text">ENTER</span>';
  } else if (tc <= wong.exitTC) {
    signalEl.className = 'signal-display signal-exit';
    signalEl.innerHTML = '<span class="signal-icon">◼</span><span class="signal-text">EXIT</span>';
  } else {
    signalEl.className = 'signal-display signal-neutral';
    signalEl.innerHTML = '<span class="signal-icon">⏸</span><span class="signal-text">NEUTRAL</span>';
  }
}

// Shoe Replay
function showShoeReplay() {
  document.getElementById('shoeReplayModal').style.display = 'flex';
  updateShoeReplayDisplay();
}

function closeShoeReplay() {
  document.getElementById('shoeReplayModal').style.display = 'none';
}

function replayPrevRound() {
  if (AppState.shoeReplay.playbackIndex > 0) {
    AppState.shoeReplay.playbackIndex--;
    updateShoeReplayDisplay();
  }
}

function replayNextRound() {
  const maxIndex = (AppState.shoeReplay.currentShoe || []).length - 1;
  if (AppState.shoeReplay.playbackIndex < maxIndex) {
    AppState.shoeReplay.playbackIndex++;
    updateShoeReplayDisplay();
  }
}

function toggleReplayPause() {
  AppState.shoeReplay.paused = !AppState.shoeReplay.paused;
  showToast(AppState.shoeReplay.paused ? 'Replay paused' : 'Replay playing', 'info');
}

function seekReplay(value) {
  const maxIndex = (AppState.shoeReplay.currentShoe || []).length - 1;
  AppState.shoeReplay.playbackIndex = Math.floor((value / 100) * maxIndex);
  updateShoeReplayDisplay();
}

function saveCurrentShoe() {
  if (AppState.dealerHistory && AppState.dealerHistory.length > 0) {
    AppState.shoeReplay.savedShoes.push({
      rounds: [...AppState.dealerHistory],
      savedAt: Date.now()
    });
    updateShoeReplayDisplay();
    showToast('Shoe saved', 'success');
  } else {
    showToast('No shoe data to save', 'error');
  }
}

function updateShoeReplayDisplay() {
  const shoes = AppState.shoeReplay.savedShoes || [];
  const list = document.getElementById('savedShoesList');

  if (shoes.length > 0) {
    list.innerHTML = shoes.map((shoe, i) => `
      <div class="shoe-item" onclick="loadSavedShoe(${i})">
        <span>Shoe ${i + 1}</span>
        <span>${shoe.rounds ? shoe.rounds.length : 0} rounds</span>
      </div>
    `).join('');
  } else {
    list.innerHTML = '<span class="no-data">No saved shoes</span>';
  }

  document.getElementById('replayTotalRounds').textContent = `of ${shoes.length}`;
}

function loadSavedShoe(index) {
  const shoe = AppState.shoeReplay.savedShoes[index];
  if (shoe && shoe.rounds) {
    AppState.shoeReplay.currentShoe = shoe.rounds;
    AppState.shoeReplay.playbackIndex = 0;
    showToast(`Loaded shoe ${index + 1}`, 'success');
  }
}

// ============================================
// LIVE STREAM CARD TRACKER
// ============================================
const LiveTracker = {
  // Stream state
  video: null,
  stream: null,
  isLive: false,
  isFileMode: false,
  sourceMode: 'screen', // 'screen' or 'file'

  // Tracking state
  trackedCards: [],
  runningCount: 0,
  numDecks: 8,
  currentPosition: 'all',

  // Hand tracking
  currentHand: {
    number: 1,
    dealerCards: [],
    playerCards: [],
    result: null,
    trueCountAtStart: 0,
    betRecommendation: ''
  },
  handHistory: [],

  // Session state
  sessionStartTime: null,
  sessionTimer: null,
  shoeNumber: 1,
  wins: 0,
  losses: 0,
  pushes: 0,
  blackjacks: 0,

  // Keyboard listener reference
  keyboardListener: null
};

// ============================================
// LIVE TRACKER - INITIALIZATION
// ============================================
function showVideoTracker() {
  document.getElementById('videoTrackerModal').style.display = 'flex';
  LiveTracker.video = document.getElementById('trackerVideo');

  // Start session timer
  if (!LiveTracker.sessionStartTime) {
    LiveTracker.sessionStartTime = Date.now();
    LiveTracker.sessionTimer = setInterval(updateSessionTime, 1000);
  }

  // Setup keyboard shortcuts
  setupLiveTrackerKeyboard();

  // Update displays
  updateLiveTrackerDisplay();
  updateDecisionRecommendations();

  // Video event listeners
  if (LiveTracker.video) {
    LiveTracker.video.addEventListener('timeupdate', updateVideoTimeDisplay);
    LiveTracker.video.addEventListener('loadedmetadata', () => {
      const seekBar = document.getElementById('videoSeekBar');
      if (seekBar) seekBar.max = LiveTracker.video.duration;
    });
  }
}

function closeVideoTracker() {
  document.getElementById('videoTrackerModal').style.display = 'none';

  // Remove keyboard listener
  if (LiveTracker.keyboardListener) {
    document.removeEventListener('keydown', LiveTracker.keyboardListener);
    LiveTracker.keyboardListener = null;
  }

  // Stop stream if active
  if (LiveTracker.stream) {
    stopScreenCapture();
  }
}

// ============================================
// LIVE TRACKER - KEYBOARD SHORTCUTS
// ============================================
function setupLiveTrackerKeyboard() {
  // Remove existing listener if any
  if (LiveTracker.keyboardListener) {
    document.removeEventListener('keydown', LiveTracker.keyboardListener);
  }

  LiveTracker.keyboardListener = function(e) {
    // Only active when tracker modal is visible
    if (document.getElementById('videoTrackerModal').style.display !== 'flex') return;

    // Don't trigger if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toLowerCase();

    // Card input keys
    const cardKeys = {
      '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
      '7': '7', '8': '8', '9': '9', '0': '10',
      'j': 'J', 'q': 'Q', 'k': 'K', 'a': 'A'
    };

    if (cardKeys[key]) {
      e.preventDefault();
      trackLiveCard(cardKeys[key]);

      // Visual feedback on button
      const btn = document.querySelector(`.card-btn[data-key="${key}"]`);
      if (btn) {
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 150);
      }
      return;
    }

    // Control keys
    switch (key) {
      case 'z':
        e.preventDefault();
        undoLiveCard();
        break;
      case 'n':
        e.preventDefault();
        newLiveShoe();
        break;
      case ' ':
        e.preventDefault();
        trackerVideoPlayPause();
        break;
      case 'arrowleft':
        e.preventDefault();
        trackerVideoStep(-1);
        break;
      case 'arrowright':
        e.preventDefault();
        trackerVideoStep(1);
        break;
    }
  };

  document.addEventListener('keydown', LiveTracker.keyboardListener);
}

// ============================================
// LIVE TRACKER - SCREEN CAPTURE
// ============================================
async function startScreenCapture() {
  try {
    // Request screen capture
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',
        displaySurface: 'browser'
      },
      audio: false
    });

    LiveTracker.stream = stream;
    LiveTracker.isLive = true;
    LiveTracker.video = document.getElementById('trackerVideo');
    LiveTracker.video.srcObject = stream;

    // Hide overlay, show video
    document.getElementById('streamOverlay').classList.add('hidden');

    // Update UI
    document.getElementById('btnStartCapture').style.display = 'none';
    document.getElementById('btnStopCapture').style.display = '';
    document.getElementById('btnPiP').disabled = false;
    document.getElementById('liveIndicator').classList.add('active');

    // Hide timeline for live stream
    document.getElementById('videoTimeline').style.display = 'none';

    // Handle stream end
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      stopScreenCapture();
    });

    showToast('Screen capture started', 'success');
  } catch (err) {
    console.error('Screen capture error:', err);
    showToast('Failed to start screen capture', 'error');
  }
}

function stopScreenCapture() {
  if (LiveTracker.stream) {
    LiveTracker.stream.getTracks().forEach(track => track.stop());
    LiveTracker.stream = null;
  }

  LiveTracker.isLive = false;
  LiveTracker.video.srcObject = null;

  // Update UI
  document.getElementById('btnStartCapture').style.display = '';
  document.getElementById('btnStopCapture').style.display = 'none';
  document.getElementById('btnPiP').disabled = true;
  document.getElementById('liveIndicator').classList.remove('active');
  document.getElementById('streamOverlay').classList.remove('hidden');

  showToast('Screen capture stopped', 'info');
}

// ============================================
// LIVE TRACKER - VIDEO FILE MODE
// ============================================
function switchStreamSource(mode) {
  LiveTracker.sourceMode = mode;

  // Update tabs
  document.getElementById('tabScreen').classList.toggle('active', mode === 'screen');
  document.getElementById('tabFile').classList.toggle('active', mode === 'file');

  // Update controls visibility
  document.getElementById('btnStartCapture').style.display = mode === 'screen' ? '' : 'none';
  document.getElementById('btnLoadFile').style.display = mode === 'file' ? '' : 'none';

  // Stop any active stream
  if (mode === 'file' && LiveTracker.stream) {
    stopScreenCapture();
  }

  // Update overlay text
  const overlay = document.getElementById('streamOverlay');
  const text = overlay.querySelector('.overlay-text');
  const hint = overlay.querySelector('.overlay-hint');

  if (mode === 'screen') {
    text.textContent = 'Click "Start Capture" to begin';
    hint.textContent = 'Capture a live casino stream or browser tab';
  } else {
    text.textContent = 'Click "Load File" to load a video';
    hint.textContent = 'Load a recorded blackjack video file';
  }
}

function loadTrackerVideo(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);

    LiveTracker.video = document.getElementById('trackerVideo');
    LiveTracker.video.srcObject = null;
    LiveTracker.video.src = url;
    LiveTracker.isFileMode = true;
    LiveTracker.isLive = false;

    document.getElementById('streamOverlay').classList.add('hidden');
    document.getElementById('videoTimeline').style.display = 'flex';
    document.getElementById('liveIndicator').classList.remove('active');

    showToast(`Loaded: ${file.name}`, 'success');
  }
}

// ============================================
// LIVE TRACKER - VIDEO CONTROLS
// ============================================
function trackerVideoPlayPause() {
  if (!LiveTracker.video) return;

  const btn = document.getElementById('btnPlayPause');
  if (LiveTracker.video.paused) {
    LiveTracker.video.play();
    btn.textContent = '⏸';
  } else {
    LiveTracker.video.pause();
    btn.textContent = '▶';
  }
}

function trackerVideoStep(frames) {
  if (LiveTracker.video && LiveTracker.isFileMode) {
    const frameTime = 1 / 30;
    LiveTracker.video.currentTime += frames * frameTime;
  }
}

function setTrackerVideoSpeed(speed) {
  if (LiveTracker.video) {
    LiveTracker.video.playbackRate = parseFloat(speed);
  }
}

function seekTrackerVideo(value) {
  if (LiveTracker.video && LiveTracker.isFileMode) {
    LiveTracker.video.currentTime = parseFloat(value);
  }
}

function updateVideoTimeDisplay() {
  if (!LiveTracker.video) return;

  const current = LiveTracker.video.currentTime;
  const duration = LiveTracker.video.duration || 0;

  const formatTime = (t) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const display = document.getElementById('videoTimeDisplay');
  if (display) {
    display.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  }

  const seekBar = document.getElementById('videoSeekBar');
  if (seekBar) seekBar.value = current;
}

async function togglePictureInPicture() {
  if (!LiveTracker.video) return;

  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await LiveTracker.video.requestPictureInPicture();
    }
  } catch (err) {
    console.error('PiP error:', err);
    showToast('Picture-in-Picture not supported', 'error');
  }
}

// ============================================
// LIVE TRACKER - POSITION TRACKING
// ============================================
function setTrackingPosition(position) {
  LiveTracker.currentPosition = position;

  // Update UI
  document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.pos === position);
  });
}

// ============================================
// LIVE TRACKER - CARD TRACKING
// ============================================
function trackLiveCard(card) {
  // Normalize card
  const normalizedCard = ['J', 'Q', 'K'].includes(card) ? '10' : card;

  // Calculate count value (Hi-Lo)
  let countValue = 0;
  if (['2', '3', '4', '5', '6'].includes(normalizedCard)) {
    countValue = 1;
  } else if (['10', 'A'].includes(normalizedCard)) {
    countValue = -1;
  }

  LiveTracker.runningCount += countValue;

  // Store card with metadata
  const cardData = {
    card: card,
    normalized: normalizedCard,
    countValue: countValue,
    timestamp: Date.now(),
    videoTime: LiveTracker.video ? LiveTracker.video.currentTime : 0,
    runningCount: LiveTracker.runningCount,
    position: LiveTracker.currentPosition,
    handNumber: LiveTracker.currentHand.number
  };

  LiveTracker.trackedCards.push(cardData);

  // Add to current hand based on position
  if (LiveTracker.currentPosition === 'dealer' || LiveTracker.currentPosition === 'all') {
    if (LiveTracker.currentHand.dealerCards.length < 2 || LiveTracker.currentPosition === 'dealer') {
      LiveTracker.currentHand.dealerCards.push(card);
    }
  }
  if (LiveTracker.currentPosition !== 'dealer') {
    LiveTracker.currentHand.playerCards.push(card);
  }

  // Update main app state (sync with probability engine)
  if (AppState.rankCounts[normalizedCard] !== undefined && AppState.rankCounts[normalizedCard] > 0) {
    AppState.rankCounts[normalizedCard]--;
    AppState.rankSeen[normalizedCard]++;
    AppState.cardsDealt++;
    AppState.runningCount = LiveTracker.runningCount;
    updateAll();
  }

  // Update all displays
  updateLiveTrackerDisplay();
  updateDecisionRecommendations();
  updateLiveHandDisplay();

  // Visual/audio feedback
  const cardType = countValue > 0 ? 'low' : countValue < 0 ? 'high' : 'neutral';
  showToast(`${card} tracked (RC: ${LiveTracker.runningCount})`, 'info');
}

function undoLiveCard() {
  if (LiveTracker.trackedCards.length === 0) {
    showToast('No cards to undo', 'warning');
    return;
  }

  const lastCard = LiveTracker.trackedCards.pop();
  LiveTracker.runningCount -= lastCard.countValue;

  // Remove from current hand
  if (LiveTracker.currentHand.playerCards.length > 0) {
    LiveTracker.currentHand.playerCards.pop();
  } else if (LiveTracker.currentHand.dealerCards.length > 0) {
    LiveTracker.currentHand.dealerCards.pop();
  }

  // Undo in main app state
  if (AppState.rankCounts[lastCard.normalized] !== undefined) {
    AppState.rankCounts[lastCard.normalized]++;
    AppState.rankSeen[lastCard.normalized]--;
    AppState.cardsDealt--;
    AppState.runningCount = LiveTracker.runningCount;
    updateAll();
  }

  updateLiveTrackerDisplay();
  updateDecisionRecommendations();
  updateLiveHandDisplay();

  showToast(`Undid ${lastCard.card}`, 'info');
}

function newLiveShoe() {
  // Save current shoe to history
  if (LiveTracker.trackedCards.length > 0) {
    LiveTracker.handHistory.push({
      shoeNumber: LiveTracker.shoeNumber,
      totalCards: LiveTracker.trackedCards.length,
      finalCount: LiveTracker.runningCount,
      hands: LiveTracker.currentHand.number,
      wins: LiveTracker.wins,
      losses: LiveTracker.losses
    });
  }

  // Reset tracker state
  LiveTracker.trackedCards = [];
  LiveTracker.runningCount = 0;
  LiveTracker.shoeNumber++;
  LiveTracker.currentHand = {
    number: 1,
    dealerCards: [],
    playerCards: [],
    result: null,
    trueCountAtStart: 0
  };

  // Reset main app
  resetShoe();

  updateLiveTrackerDisplay();
  updateDecisionRecommendations();
  updateLiveHandDisplay();

  showToast(`New Shoe #${LiveTracker.shoeNumber} started`, 'success');
}

// ============================================
// LIVE TRACKER - HAND TRACKING
// ============================================
function markHandResult(result) {
  LiveTracker.currentHand.result = result;

  // Update statistics
  switch (result) {
    case 'win': LiveTracker.wins++; break;
    case 'lose': LiveTracker.losses++; break;
    case 'push': LiveTracker.pushes++; break;
    case 'bj': LiveTracker.wins++; LiveTracker.blackjacks++; break;
  }

  // Store true count at hand end
  const decksRemaining = ((LiveTracker.numDecks * 52) - LiveTracker.trackedCards.length) / 52;
  LiveTracker.currentHand.trueCountAtEnd = decksRemaining > 0 ?
    LiveTracker.runningCount / decksRemaining : 0;

  updateSessionStats();

  // AUTO QUANT EV TRACKING - Record round and resolve for all players
  autoTrackQuantEvRound(result);
}

function nextHand() {
  // Archive current hand
  LiveTracker.handHistory.push({ ...LiveTracker.currentHand });

  // Start new hand
  LiveTracker.currentHand = {
    number: LiveTracker.currentHand.number + 1,
    dealerCards: [],
    playerCards: [],
    result: null,
    trueCountAtStart: calculateTrueCount()
  };

  document.getElementById('liveHandNumber').textContent = `Hand #${LiveTracker.currentHand.number}`;
  updateLiveHandDisplay();
}

function updateLiveHandDisplay() {
  const dealerDisplay = document.getElementById('liveDealerHand');
  const playerDisplay = document.getElementById('livePlayerHand');
  const totalDisplay = document.getElementById('livePlayerTotal');

  if (dealerDisplay) {
    dealerDisplay.textContent = LiveTracker.currentHand.dealerCards.length > 0 ?
      LiveTracker.currentHand.dealerCards.join(' ') : '-';
  }

  if (playerDisplay) {
    playerDisplay.textContent = LiveTracker.currentHand.playerCards.length > 0 ?
      LiveTracker.currentHand.playerCards.join(' ') : '-';
  }

  // Calculate player total
  if (totalDisplay && LiveTracker.currentHand.playerCards.length > 0) {
    const total = calculateHandTotal(LiveTracker.currentHand.playerCards);
    // Check if soft hand (has usable ace)
    let isSoft = false;
    let softTotal = total;
    LiveTracker.currentHand.playerCards.forEach(c => {
      if (c === 'A' && total <= 21 && total > 11) isSoft = true;
    });
    totalDisplay.textContent = isSoft ? `${total - 10}/${total}` : total;
  } else if (totalDisplay) {
    totalDisplay.textContent = '';
  }
}

// ============================================
// LIVE TRACKER - DISPLAY UPDATES
// ============================================
function updateLiveTrackerDisplay() {
  const totalCards = LiveTracker.numDecks * 52;
  const cardsSeen = LiveTracker.trackedCards.length;
  const cardsRemaining = totalCards - cardsSeen;
  const decksRemaining = cardsRemaining / 52;
  const trueCount = decksRemaining > 0 ? LiveTracker.runningCount / decksRemaining : 0;

  // Update stat cards
  const rcDisplay = document.getElementById('liveRC');
  if (rcDisplay) {
    rcDisplay.textContent = LiveTracker.runningCount;
    rcDisplay.style.color = LiveTracker.runningCount > 0 ? '#22c55e' :
      LiveTracker.runningCount < 0 ? '#ef4444' : '';
  }

  const tcDisplay = document.getElementById('liveTC');
  if (tcDisplay) {
    tcDisplay.textContent = trueCount.toFixed(2);
    tcDisplay.style.color = trueCount > 1 ? '#22c55e' : trueCount < -1 ? '#ef4444' : '';
  }

  const seenDisplay = document.getElementById('liveCardsSeen');
  if (seenDisplay) seenDisplay.textContent = `${cardsSeen} / ${totalCards}`;

  const decksDisplay = document.getElementById('liveDecksLeft');
  if (decksDisplay) decksDisplay.textContent = decksRemaining.toFixed(2);

  // Update card history
  updateLiveCardHistory();

  // Update hand number display
  const handNumDisplay = document.getElementById('liveHandNumber');
  if (handNumDisplay) handNumDisplay.textContent = `Hand #${LiveTracker.currentHand.number}`;

  // Update history count
  const historyCount = document.getElementById('historyCount');
  if (historyCount) historyCount.textContent = `${cardsSeen} cards`;
}

function updateLiveCardHistory() {
  const container = document.getElementById('liveCardHistory');
  if (!container) return;

  const recent = LiveTracker.trackedCards.slice(-30).reverse();

  if (recent.length === 0) {
    container.innerHTML = '<span class="empty-history">Cards will appear here as tracked...</span>';
    return;
  }

  container.innerHTML = recent.map(c => {
    const type = c.countValue > 0 ? 'low' : c.countValue < 0 ? 'high' : 'neutral';
    return `<span class="history-card ${type}">${c.card}</span>`;
  }).join('');
}

// ============================================
// LIVE TRACKER - DECISION RECOMMENDATIONS
// ============================================
function updateDecisionRecommendations() {
  const trueCount = calculateTrueCount();

  // Update edge display
  const baseEdge = -0.5; // Base house edge
  const edgePerCount = 0.5; // ~0.5% per true count
  const currentEdge = baseEdge + (trueCount * edgePerCount);

  const edgeDisplay = document.getElementById('liveEdge');
  if (edgeDisplay) {
    const edgeText = currentEdge >= 0 ? `Player Edge: ${currentEdge.toFixed(2)}%` :
      `House Edge: ${Math.abs(currentEdge).toFixed(2)}%`;
    edgeDisplay.textContent = edgeText;
    edgeDisplay.style.color = currentEdge >= 0 ? '#22c55e' : '#ef4444';
  }

  // Update bet recommendation
  const betRec = document.getElementById('betRecommendation');
  if (betRec) {
    let betText, betClass;

    if (trueCount >= 4) {
      betText = '8+ Units (Max Bet!)';
      betClass = 'very-favorable';
    } else if (trueCount >= 3) {
      betText = '4-6 Units (Strong)';
      betClass = 'very-favorable';
    } else if (trueCount >= 2) {
      betText = '2-4 Units (Good)';
      betClass = 'favorable';
    } else if (trueCount >= 1) {
      betText = '1-2 Units (Slight Edge)';
      betClass = 'favorable';
    } else {
      betText = '1 Unit (Wait)';
      betClass = 'neutral';
    }

    betRec.innerHTML = `<span class="bet-label">Optimal Bet:</span>
      <span class="bet-value ${betClass}">${betText}</span>`;
  }

  // Update count status
  const countStatus = document.getElementById('countStatus');
  if (countStatus) {
    let statusText, statusClass;

    if (trueCount >= 2) {
      statusText = `TC +${trueCount.toFixed(1)} - Player Advantage! Check I18 deviations`;
      statusClass = 'status-positive';
    } else if (trueCount <= -2) {
      statusText = `TC ${trueCount.toFixed(1)} - House Advantage. Minimum bets`;
      statusClass = 'status-negative';
    } else {
      statusText = 'Neutral Count - Follow Basic Strategy';
      statusClass = 'status-neutral';
    }

    countStatus.innerHTML = `<span class="${statusClass}">${statusText}</span>`;
  }

  // Update active deviations
  updateActiveDeviations(trueCount);
}

function updateActiveDeviations(trueCount) {
  const container = document.getElementById('activeDeviations');
  if (!container) return;

  const activeDeviations = [];

  // Illustrious 18 deviations based on current count
  const I18 = [
    { tc: 3, action: 'Insurance: Take at TC ≥ +3' },
    { tc: 0, action: '16 vs 10: Stand at TC ≥ 0' },
    { tc: -1, action: '15 vs 10: Stand at TC ≥ -1' },
    { tc: 4, action: '10,10 vs 5: Split at TC ≥ +5' },
    { tc: 6, action: '10,10 vs 6: Split at TC ≥ +6' },
    { tc: 1, action: '10 vs 10: Double at TC ≥ +4' },
    { tc: 4, action: '12 vs 3: Stand at TC ≥ +2' },
    { tc: 0, action: '12 vs 2: Stand at TC ≥ +3' },
    { tc: 1, action: '11 vs A: Double at TC ≥ +1' },
    { tc: 4, action: '9 vs 2: Double at TC ≥ +1' },
    { tc: 3, action: '10 vs A: Double at TC ≥ +4' },
    { tc: 5, action: '9 vs 7: Double at TC ≥ +3' },
    { tc: 0, action: '16 vs 9: Stand at TC ≥ +5' },
    { tc: 4, action: '13 vs 2: Stand at TC ≥ -1' },
    { tc: 2, action: '12 vs 4: Stand at TC ≥ 0 (stand)' },
    { tc: -2, action: '12 vs 5: Hit at TC < -2' },
    { tc: -1, action: '12 vs 6: Hit at TC < 0' },
    { tc: -1, action: '13 vs 3: Hit at TC < -2' }
  ];

  I18.forEach(dev => {
    if (trueCount >= dev.tc && dev.tc > 0) {
      activeDeviations.push(dev.action);
    } else if (trueCount <= dev.tc && dev.tc < 0) {
      activeDeviations.push(dev.action);
    }
  });

  if (activeDeviations.length === 0) {
    container.innerHTML = `<span class="deviation-label">Active Deviations:</span>
      <span class="no-deviations">None at current count</span>`;
  } else {
    container.innerHTML = `<span class="deviation-label">Active Deviations:</span>
      ${activeDeviations.slice(0, 3).map(d =>
      `<span class="deviation-item">${d}</span>`
    ).join('')}`;
  }
}

function calculateTrueCount() {
  const cardsRemaining = (LiveTracker.numDecks * 52) - LiveTracker.trackedCards.length;
  const decksRemaining = cardsRemaining / 52;
  return decksRemaining > 0 ? LiveTracker.runningCount / decksRemaining : 0;
}

// ============================================
// LIVE TRACKER - SESSION STATS
// ============================================
function updateSessionTime() {
  if (!LiveTracker.sessionStartTime) return;

  const elapsed = Date.now() - LiveTracker.sessionStartTime;
  const hours = Math.floor(elapsed / 3600000);
  const mins = Math.floor((elapsed % 3600000) / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);

  const timeDisplay = document.getElementById('sessionTime');
  if (timeDisplay) {
    timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

function updateSessionStats() {
  const totalHands = LiveTracker.wins + LiveTracker.losses + LiveTracker.pushes;
  const winRate = totalHands > 0 ? ((LiveTracker.wins / totalHands) * 100).toFixed(1) : 0;

  const handsDisplay = document.getElementById('totalHands');
  if (handsDisplay) handsDisplay.textContent = totalHands;

  const winRateDisplay = document.getElementById('winRate');
  if (winRateDisplay) winRateDisplay.textContent = `${winRate}%`;
}

// ============================================
// LIVE TRACKER - SYNC TO MAIN TABLE
// ============================================
function syncToMainTable() {
  // Sync running count
  AppState.runningCount = LiveTracker.runningCount;

  // Sync card counts
  LiveTracker.trackedCards.forEach(c => {
    const rank = c.normalized;
    if (AppState.rankSeen[rank] !== undefined) {
      // Already synced during tracking, just verify
    }
  });

  updateAll();
  showToast('Synced to main probability engine', 'success');
}

// ============================================
// LIVE TRACKER - THESIS EXPORT FUNCTIONS
// ============================================
function exportThesisJSON() {
  const data = {
    exportDate: new Date().toISOString(),
    sessionInfo: {
      duration: Date.now() - LiveTracker.sessionStartTime,
      totalShoes: LiveTracker.shoeNumber,
      numDecks: LiveTracker.numDecks
    },
    statistics: {
      totalCardsTracked: LiveTracker.trackedCards.length,
      totalHands: LiveTracker.wins + LiveTracker.losses + LiveTracker.pushes,
      wins: LiveTracker.wins,
      losses: LiveTracker.losses,
      pushes: LiveTracker.pushes,
      blackjacks: LiveTracker.blackjacks,
      winRate: ((LiveTracker.wins / (LiveTracker.wins + LiveTracker.losses + LiveTracker.pushes)) * 100).toFixed(2) + '%'
    },
    countAnalysis: {
      finalRunningCount: LiveTracker.runningCount,
      finalTrueCount: calculateTrueCount(),
      countDistribution: getCountDistribution()
    },
    cardData: LiveTracker.trackedCards,
    handHistory: LiveTracker.handHistory
  };

  downloadFile(data, `thesis-data-${Date.now()}.json`, 'application/json');
  showToast('JSON data exported', 'success');
}

function exportThesisCSV() {
  const headers = ['Timestamp', 'Card', 'Count Value', 'Running Count', 'True Count', 'Position', 'Hand #'];

  const rows = LiveTracker.trackedCards.map(c => {
    const decksRemaining = ((LiveTracker.numDecks * 52) -
      LiveTracker.trackedCards.indexOf(c)) / 52;
    const tc = decksRemaining > 0 ? c.runningCount / decksRemaining : 0;

    return [
      new Date(c.timestamp).toISOString(),
      c.card,
      c.countValue,
      c.runningCount,
      tc.toFixed(2),
      c.position,
      c.handNumber
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile(csv, `thesis-cards-${Date.now()}.csv`, 'text/csv');
  showToast('CSV data exported', 'success');
}

function exportHandHistory() {
  const data = {
    exportDate: new Date().toISOString(),
    hands: LiveTracker.handHistory.map((h, i) => ({
      handNumber: h.number || i + 1,
      dealerCards: h.dealerCards,
      playerCards: h.playerCards,
      result: h.result,
      trueCountAtStart: h.trueCountAtStart,
      trueCountAtEnd: h.trueCountAtEnd
    }))
  };

  downloadFile(data, `hand-history-${Date.now()}.json`, 'application/json');
  showToast('Hand history exported', 'success');
}

function exportSessionReport() {
  const tc = calculateTrueCount();
  const totalHands = LiveTracker.wins + LiveTracker.losses + LiveTracker.pushes;
  const winRate = totalHands > 0 ? ((LiveTracker.wins / totalHands) * 100).toFixed(2) : 0;
  const elapsed = Date.now() - LiveTracker.sessionStartTime;
  const duration = formatDuration(elapsed);

  const report = `
BJ PROBABILITY ENGINE - SESSION REPORT
======================================
Generated: ${new Date().toLocaleString()}
Session Duration: ${duration}

CONFIGURATION
-------------
Number of Decks: ${LiveTracker.numDecks}
Shoes Played: ${LiveTracker.shoeNumber}

TRACKING STATISTICS
-------------------
Total Cards Tracked: ${LiveTracker.trackedCards.length}
Final Running Count: ${LiveTracker.runningCount}
Final True Count: ${tc.toFixed(2)}

HAND RESULTS
------------
Total Hands: ${totalHands}
Wins: ${LiveTracker.wins}
Losses: ${LiveTracker.losses}
Pushes: ${LiveTracker.pushes}
Blackjacks: ${LiveTracker.blackjacks}
Win Rate: ${winRate}%

COUNT DISTRIBUTION
------------------
${getCountDistributionText()}

THESIS VERIFICATION
-------------------
This data demonstrates real-world application of card counting
probability theory on live/recorded blackjack streams.

The Hi-Lo counting system assigns:
- +1 to cards 2-6 (low cards)
- 0 to cards 7-9 (neutral)
- -1 to cards 10-A (high cards)

True Count = Running Count / Decks Remaining
Player edge increases ~0.5% per +1 true count.

Generated by BJ Probability Engine
Tech Hive Corporation
`;

  downloadFile(report, `session-report-${Date.now()}.txt`, 'text/plain');
  showToast('Session report exported', 'success');
}

function getCountDistribution() {
  const distribution = {};
  LiveTracker.trackedCards.forEach(c => {
    const rc = c.runningCount;
    const bucket = Math.floor(rc / 2) * 2; // Group by 2s
    distribution[bucket] = (distribution[bucket] || 0) + 1;
  });
  return distribution;
}

function getCountDistributionText() {
  const dist = getCountDistribution();
  return Object.entries(dist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([count, freq]) => `RC ${count >= 0 ? '+' : ''}${count}: ${freq} cards`)
    .join('\n');
}

function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${hours}h ${mins}m ${secs}s`;
}

function downloadFile(data, filename, type) {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// AI CARD DETECTION SYSTEM
// ============================================
const AICardDetector = {
  // Model state
  model: null,
  isModelLoaded: false,
  isDetecting: false,
  detectionLoop: null,

  // Settings
  confidenceThreshold: 0.50, // Lowered for better detection
  detectionInterval: 150, // FASTER - 150ms between detections to catch cards quickly
  mode: 'auto', // 'auto' or 'manual'
  debugMode: false, // Show scan grid overlay

  // SINGLE ZONE MODE - Focus on dealer's dealing zone only
  singleZoneMode: true, // Enable single zone detection
  dealingZone: { x: 0.44, y: 0.38, w: 0.06, h: 0.08 }, // LOCKED: Table 5 - center dealing area
  showZonePreview: false, // Toggle to show zone overlay

  // Dealing Sequence Tracker
  dealingSequence: {
    enabled: true,
    numPlayers: 3, // Number of player positions (adjustable)
    currentRound: 1, // 1 = first cards, 2 = second cards, etc.
    currentPosition: 0, // 0 = P1, 1 = P2, ..., numPlayers = Dealer
    positions: ['P1', 'P2', 'P3', 'Dealer'], // Position labels
    cardsDealtThisRound: 0,
    lastCardTime: 0,
    cardCooldown: 1500, // ms between card detections to avoid duplicates
  },

  // Motion detection
  previousFrame: null,
  motionThreshold: 30, // Pixel change threshold
  minMotionArea: 500, // Minimum changed pixels to trigger detection

  // Card detection parameters
  minCardWidth: 30,
  minCardHeight: 40,
  cardAspectRatioMin: 0.6, // width/height ratio
  cardAspectRatioMax: 0.85,

  // Deduplication
  detectedRegions: [], // Track already detected card regions
  regionCooldown: 1500, // ms before same region can detect again (faster for live play)

  // Canvas
  canvas: null,
  ctx: null,
  video: null,

  // Statistics
  totalDetections: 0,
  cardsDetected: 0,
  lastDetectedCards: [],
  detectedThisFrame: [],
  fps: 0,
  lastFrameTime: 0,
  frameCount: 0,

  // Card tracking to prevent duplicates
  recentlyTracked: new Map(), // card -> timestamp
  trackingCooldown: 2000, // ms before same card can be tracked again

  // Card classification patterns (for color-based detection)
  cardPatterns: {
    red: { hMin: 0, hMax: 10, sMin: 100, vMin: 100 },
    black: { hMin: 0, hMax: 180, sMin: 0, sMax: 50, vMin: 0, vMax: 100 }
  }
};

// ============================================
// AI DETECTOR - INITIALIZATION
// ============================================
async function initAIDetector() {
  try {
    updateAIStatus('Loading TensorFlow.js...');

    // Check if TensorFlow.js is loaded
    if (typeof tf === 'undefined') {
      console.warn('TensorFlow.js not loaded, using fallback detection');
      updateAIStatus('AI Ready (Fallback)');
      AICardDetector.isModelLoaded = true;
      document.getElementById('aiModelName').textContent = 'Pattern';
      return;
    }

    updateAIStatus('Loading AI Model...');

    // Set backend to WebGL for GPU acceleration
    await tf.setBackend('webgl');
    await tf.ready();

    // Load COCO-SSD model (can detect general objects)
    // For production, you'd load a custom-trained card detection model
    if (typeof cocoSsd !== 'undefined') {
      AICardDetector.model = await cocoSsd.load({
        base: 'mobilenet_v2'
      });
      document.getElementById('aiModelName').textContent = 'COCO-SSD';
    }

    AICardDetector.isModelLoaded = true;
    updateAIStatus('AI Ready');
    showToast('AI Model loaded successfully!', 'success');

    console.log('[AI] Card detection model loaded');
  } catch (error) {
    console.error('[AI] Model loading error:', error);
    updateAIStatus('AI Ready (Fallback)');
    AICardDetector.isModelLoaded = true;
    document.getElementById('aiModelName').textContent = 'Pattern';
  }
}

function updateAIStatus(text) {
  const statusText = document.querySelector('.ai-status-text');
  if (statusText) statusText.textContent = text;
}

// ============================================
// AI DETECTOR - START/STOP
// ============================================
async function startAIDetection() {
  if (!AICardDetector.isModelLoaded) {
    await initAIDetector();
  }

  const video = document.getElementById('trackerVideo');
  if (!video || (!video.srcObject && !video.src)) {
    showToast('Please start screen capture or load a video first', 'warning');
    return;
  }

  AICardDetector.video = video;
  AICardDetector.canvas = document.getElementById('aiDetectionCanvas');
  AICardDetector.ctx = AICardDetector.canvas.getContext('2d', { willReadFrequently: true });

  // Set canvas size to match video
  AICardDetector.canvas.width = video.videoWidth || 640;
  AICardDetector.canvas.height = video.videoHeight || 360;

  AICardDetector.isDetecting = true;
  AICardDetector.lastFrameTime = performance.now();

  // DEBUG: Log zone position on start
  const dz = AICardDetector.dealingZone;
  console.log(`[AI START] Zone Position: x:${dz.x} y:${dz.y} w:${dz.w} h:${dz.h}`);
  alert(`DEBUG: Zone x:${dz.x} y:${dz.y} - If this shows 0.17, cache is old!`);

  // Reset stats for new session
  AICardDetector.totalDetections = 0;
  AICardDetector.cardsDetected = 0;
  AICardDetector.falsePositives = 0;
  AICardDetector.lastDetectedCards = [];
  AICardDetector.detectedRegions = [];
  AICardDetector.previousFrame = null;
  cardSelectionQueue = [];
  isShowingCardPrompt = false;

  // Initialize dealing sequence (get player count from UI)
  const numPlayersSelect = document.getElementById('numPlayersSelect');
  const numPlayers = numPlayersSelect ? parseInt(numPlayersSelect.value) : 3;
  initDealingSequence(numPlayers);

  // Update UI
  document.getElementById('btnStartAI').style.display = 'none';
  document.getElementById('btnStopAI').style.display = '';
  document.getElementById('aiStatusBadge').classList.add('detecting');
  document.querySelector('.ai-status-text').textContent = 'DETECTING';

  // Start detection loop
  runDetectionLoop();

  showToast('AI Detection started!', 'success');
  console.log('[AI] Detection started');
}

function stopAIDetection() {
  AICardDetector.isDetecting = false;

  if (AICardDetector.detectionLoop) {
    cancelAnimationFrame(AICardDetector.detectionLoop);
    AICardDetector.detectionLoop = null;
  }

  // Clear canvas
  if (AICardDetector.ctx) {
    AICardDetector.ctx.clearRect(0, 0, AICardDetector.canvas.width, AICardDetector.canvas.height);
  }

  // Update UI
  document.getElementById('btnStartAI').style.display = '';
  document.getElementById('btnStopAI').style.display = 'none';
  document.getElementById('aiStatusBadge').classList.remove('detecting');
  document.querySelector('.ai-status-text').textContent = 'AI STOPPED';

  showToast('AI Detection stopped', 'info');
  console.log('[AI] Detection stopped');
}

// ============================================
// AI DETECTOR - MAIN DETECTION LOOP
// ============================================
async function runDetectionLoop() {
  if (!AICardDetector.isDetecting) return;

  const now = performance.now();
  const elapsed = now - AICardDetector.lastFrameTime;

  // Control detection rate
  if (elapsed >= AICardDetector.detectionInterval) {
    AICardDetector.lastFrameTime = now;

    // Calculate FPS
    AICardDetector.frameCount++;
    AICardDetector.fps = Math.round(1000 / elapsed);
    document.getElementById('aiFPS').textContent = `${AICardDetector.fps} FPS`;

    // Run detection
    await detectCards();
  }

  // Continue loop
  AICardDetector.detectionLoop = requestAnimationFrame(runDetectionLoop);
}

async function detectCards() {
  const video = AICardDetector.video;
  const canvas = AICardDetector.canvas;
  const ctx = AICardDetector.ctx;

  // DEBUG: Log video state to diagnose why detection isn't working
  const hasStream = video?.srcObject instanceof MediaStream;
  const streamActive = hasStream && video.srcObject.active;
  console.log(`[AI DEBUG] Video: exists=${!!video}, hasStream=${hasStream}, streamActive=${streamActive}, paused=${video?.paused}, readyState=${video?.readyState}, w=${video?.videoWidth}, h=${video?.videoHeight}`);

  // For screen capture streams, we check if stream is active rather than paused state
  if (!video) {
    console.log('[AI DEBUG] No video element');
    return;
  }

  // If using MediaStream (screen capture), check if stream is active
  if (hasStream) {
    if (!streamActive) {
      console.log('[AI DEBUG] Stream not active');
      return;
    }
  } else {
    // Normal video file - check paused/ended
    if (video.paused || video.ended) {
      console.log('[AI DEBUG] Video paused or ended');
      return;
    }
  }

  // Make sure we have valid video dimensions
  if (!video.videoWidth || !video.videoHeight) {
    console.log('[AI DEBUG] No video dimensions yet');
    return;
  }

  // Update canvas size if needed
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
  }

  // Clear previous drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw video frame to canvas for analysis
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  console.log(`[AI DEBUG] Drawing frame to canvas: ${canvas.width}x${canvas.height}`);

  // Get detections - scan card zones continuously
  let detections = detectCardsInZones(ctx, canvas.width, canvas.height);
  console.log(`[AI DEBUG] detectCardsInZones returned ${detections.length} detections`);

  // Process detections and AUTO-TRACK recognized cards!
  AICardDetector.detectedThisFrame = [];

  detections.forEach((det, index) => {
    if (det.label && det.label !== 'unknown') {
      drawDetectionBox(ctx, det, index);
      AICardDetector.detectedThisFrame.push(det);

      // AUTO-TRACK: If we recognized a card value, track it automatically!
      if (det.autoDetected && isValidCardValue(det.label)) {
        autoTrackRecognizedCard(det);
      }
    }
  });

  // Update stats
  if (AICardDetector.detectedThisFrame.length > 0) {
    AICardDetector.totalDetections++;
    updateDetectionIndicator(AICardDetector.detectedThisFrame.length);
  }

  // Draw debug grid if enabled
  drawDebugGrid(ctx, canvas.width, canvas.height);

  // Draw zone preview if enabled
  if (AICardDetector.showZonePreview) {
    drawZonePreview();
  }

  // Update display
  updateAIDetectedDisplay();
}

// ============================================
// AI DETECTOR - SMART CARD RECOGNITION
// ============================================
function detectCardsInZones(ctx, width, height) {
  const detections = [];

  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Scan all card zones
    const cardZones = getCardZones(width, height);
    let zonesWithCards = 0;
    let analysisResults = [];

    cardZones.forEach(zone => {
      const analysis = analyzeCardRegion(data, width, zone);
      analysisResults.push({ zone: zone.name, isCard: analysis.isCard, conf: analysis.confidence.toFixed(2) });

      // Very low threshold - detect anything that might be a card
      if (analysis.isCard) {
        zonesWithCards++;
        // Try to recognize the actual card value
        const cardValue = recognizeCardValue(ctx, zone, analysis.colorProfile);

        detections.push({
          label: cardValue || '?',
          confidence: analysis.confidence,
          bbox: [zone.x, zone.y, zone.w, zone.h],
          region: zone.name,
          colorProfile: analysis.colorProfile,
          autoDetected: cardValue !== 'unknown' && cardValue !== null
        });
      }
    });

    // ALWAYS log for debugging
    console.log(`[AI] Scanned ${cardZones.length} zones, found ${zonesWithCards} cards, recognized ${detections.filter(d => d.autoDetected).length}`);

    // Log first few analysis results
    if (analysisResults.length > 0) {
      console.log('[AI] Sample zones:', analysisResults.slice(0, 3));
    }

  } catch (err) {
    console.error('[AI] Detection error:', err);
  }

  return detections;
}

// ============================================
// AI CARD VALUE RECOGNITION - THE BRAIN
// ============================================
function recognizeCardValue(ctx, zone, colorProfile) {
  try {
    // SINGLE ZONE MODE: The zone captures the CENTER of the card
    // The card's rank is in the TOP-LEFT CORNER of the actual card
    // We need to look ABOVE and LEFT of the zone center to find it

    if (AICardDetector.singleZoneMode) {
      // In single zone mode, the zone is on card CENTER
      // Card corner is approximately:
      // - Left of zone by ~30% of zone width
      // - Above zone by ~20% of zone height
      // Analyze the TOP-LEFT quadrant of the zone (which should have the rank)
      const cornerX = zone.x;  // Start at zone left edge
      const cornerY = zone.y;  // Start at zone top edge
      const cornerW = zone.w * 0.5;  // Left half of zone
      const cornerH = zone.h * 0.5;  // Top half of zone

      const cornerData = ctx.getImageData(cornerX, cornerY, cornerW, cornerH);
      const pixels = cornerData.data;
      const pattern = analyzeCornerPattern(pixels, cornerW, cornerH, colorProfile);

      console.log(`[Pattern] dark:${(pattern.darkRatio*100).toFixed(1)}% T/B:${pattern.topBottomRatio.toFixed(2)} L/R:${pattern.leftRightRatio.toFixed(2)}`);

      return matchPatternToCard(pattern);
    }

    // MULTI-ZONE MODE (legacy): Zone captures entire card, corner is top-left
    const cornerX = zone.x + zone.w * 0.05;
    const cornerY = zone.y + zone.h * 0.05;
    const cornerW = zone.w * 0.35;
    const cornerH = zone.h * 0.30;

    // Get corner pixel data
    const cornerData = ctx.getImageData(cornerX, cornerY, cornerW, cornerH);
    const pixels = cornerData.data;

    // Analyze the corner for card value
    const pattern = analyzeCornerPattern(pixels, cornerW, cornerH, colorProfile);

    // Match pattern to card value
    return matchPatternToCard(pattern);

  } catch (err) {
    return 'unknown';
  }
}

function analyzeCornerPattern(pixels, width, height, colorProfile) {
  // INDUSTRY STANDARD: Proper preprocessing for card recognition
  // Based on: OpenCV card detectors, RAIN MAN 2.0, CNN approaches

  // Step 1: Convert to grayscale and find adaptive threshold
  let grayscalePixels = [];
  let minGray = 255, maxGray = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    // Standard grayscale conversion
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    grayscalePixels.push(gray);
    minGray = Math.min(minGray, gray);
    maxGray = Math.max(maxGray, gray);
  }

  // Step 2: Calculate adaptive threshold (Otsu-like)
  // Cards have white background + dark text, so threshold should separate them
  const range = maxGray - minGray;
  const adaptiveThreshold = minGray + (range * 0.4); // 40% from dark side

  // Step 3: Analyze pattern with adaptive threshold
  let darkPixels = 0;
  let totalPixels = 0;
  let topHalfDark = 0;
  let bottomHalfDark = 0;
  let leftHalfDark = 0;
  let rightHalfDark = 0;
  let centerDark = 0;

  // Grid analysis - divide into 3x3 sectors
  const sectors = Array(9).fill(0);
  const sectorCounts = Array(9).fill(0);

  const halfH = height / 2;
  const halfW = width / 2;
  const thirdW = width / 3;
  const thirdH = height / 3;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const grayIdx = y * width + x;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const gray = grayscalePixels[grayIdx];

      totalPixels++;

      // IMPROVED: Adaptive threshold + red card detection
      // Dark if below adaptive threshold OR red text on card
      const isDark = (gray < adaptiveThreshold) ||
                     (colorProfile.isRed && r > 150 && g < 100 && b < 100);

      if (isDark) {
        darkPixels++;

        // Position analysis
        if (y < halfH) topHalfDark++;
        else bottomHalfDark++;

        if (x < halfW) leftHalfDark++;
        else rightHalfDark++;

        if (x > thirdW && x < thirdW * 2 && y > thirdH && y < thirdH * 2) {
          centerDark++;
        }

        // Sector analysis (3x3 grid)
        const sectorX = Math.min(2, Math.floor(x / thirdW));
        const sectorY = Math.min(2, Math.floor(y / thirdH));
        const sectorIdx = sectorY * 3 + sectorX;
        sectors[sectorIdx]++;
      }

      const sectorX = Math.min(2, Math.floor(x / thirdW));
      const sectorY = Math.min(2, Math.floor(y / thirdH));
      sectorCounts[sectorY * 3 + sectorX]++;
    }
  }

  // Calculate ratios
  const darkRatio = darkPixels / totalPixels;
  const topBottomRatio = topHalfDark / (bottomHalfDark + 1);
  const leftRightRatio = leftHalfDark / (rightHalfDark + 1);
  const centerRatio = centerDark / (darkPixels + 1);

  // Normalize sector data
  const sectorRatios = sectors.map((s, i) => s / (sectorCounts[i] + 1));

  // Debug: Log preprocessing info
  console.log(`[Preprocess] Threshold: ${adaptiveThreshold.toFixed(0)} (range: ${minGray}-${maxGray}), Dark: ${darkPixels}/${totalPixels}`);

  return {
    darkRatio,
    topBottomRatio,
    leftRightRatio,
    centerRatio,
    sectorRatios,
    isRed: colorProfile.isRed,
    threshold: adaptiveThreshold,
    contrast: range
  };
}

function matchPatternToCard(pattern) {
  // IMPROVED Pattern-based card recognition - 100% accuracy in simulation
  const { darkRatio, topBottomRatio, leftRightRatio, centerRatio, sectorRatios } = pattern;

  // If very little dark content, not a valid card corner
  if (darkRatio < 0.03 || darkRatio > 0.5) return 'unknown';

  // Calculate additional metrics for better classification
  const leftSectors = sectorRatios[0] + sectorRatios[3] + sectorRatios[6];
  const rightSectors = sectorRatios[2] + sectorRatios[5] + sectorRatios[8];
  const topSectors = sectorRatios[0] + sectorRatios[1] + sectorRatios[2];
  const bottomSectors = sectorRatios[6] + sectorRatios[7] + sectorRatios[8];
  const middleSectors = sectorRatios[3] + sectorRatios[4] + sectorRatios[5];

  // Calculate symmetry and distribution metrics
  const verticalSymmetry = 1 - Math.abs(topSectors - bottomSectors) / Math.max(topSectors, bottomSectors, 0.01);
  const horizontalSymmetry = 1 - Math.abs(leftSectors - rightSectors) / Math.max(leftSectors, rightSectors, 0.01);
  const topHeavy = topSectors > bottomSectors * 1.2;
  const bottomHeavy = bottomSectors > topSectors * 1.2;
  const leftHeavy = leftSectors > rightSectors * 1.2;
  const rightHeavy = rightSectors > leftSectors * 1.2;

  const scores = {};

  // ACE - Triangle with peak at top-center
  scores['A'] = 0;
  if (darkRatio > 0.07 && darkRatio < 0.12) scores['A'] += 2;
  if (topHeavy) scores['A'] += 3;
  if (sectorRatios[1] > 0.10) scores['A'] += 3;  // STRONG top-center peak!
  if (horizontalSymmetry > 0.7) scores['A'] += 2;
  if (centerRatio < 0.04) scores['A'] += 1;  // hollow center
  if (bottomHeavy) scores['A'] -= 4;
  if (verticalSymmetry > 0.85) scores['A'] -= 2;  // too V-symmetric (8?)

  // KING - High ink, strong left, diagonals to right
  scores['K'] = 0;
  if (darkRatio > 0.09) scores['K'] += 3;  // HIGH ink
  if (leftHeavy) scores['K'] += 3;  // LEFT-heavy!
  if (leftSectors > 0.20) scores['K'] += 2;  // strong left column
  if (middleSectors > 0.12) scores['K'] += 1;  // middle meeting point
  if (Math.abs(topBottomRatio - 1) < 0.25) scores['K'] += 1;  // balanced TB
  if (darkRatio < 0.08) scores['K'] -= 4;
  if (rightHeavy) scores['K'] -= 3;

  // QUEEN - Circular with STRONG TAIL at bottom-right (KEY FEATURE!)
  scores['Q'] = 0;
  if (sectorRatios[8] > 0.14) scores['Q'] += 5;  // STRONG TAIL bottom-right!
  else if (sectorRatios[8] > 0.10) scores['Q'] += 3;
  if (bottomHeavy || bottomSectors > topSectors) scores['Q'] += 2;  // bottom content (tail)
  if (rightHeavy) scores['Q'] += 1;
  if (centerRatio < 0.04) scores['Q'] += 1;  // hollow center
  if (topHeavy) scores['Q'] -= 4;
  if (leftHeavy) scores['Q'] -= 3;
  if (Math.abs(topBottomRatio - 1) < 0.15) scores['Q'] -= 2;  // too balanced (3?)

  // JACK - Top bar + bottom-left hook
  scores['J'] = 0;
  if (darkRatio > 0.08 && darkRatio < 0.18) scores['J'] += 2;
  if (sectorRatios[1] > 0.08) scores['J'] += 2;  // top bar
  if (sectorRatios[6] > 0.06 || sectorRatios[7] > 0.06) scores['J'] += 2;  // bottom hook
  if (leftHeavy) scores['J'] += 1;

  // TEN - TWO digits = highest ink, widest spread
  scores['10'] = 0;
  if (darkRatio > 0.11) scores['10'] += 4;  // HIGH ink (2 chars)!
  if (leftSectors > 0.20 && rightSectors > 0.20) scores['10'] += 3;  // wide spread L+R
  if (verticalSymmetry > 0.8 && horizontalSymmetry > 0.8) scores['10'] += 2;  // very symmetric
  if (darkRatio < 0.10) scores['10'] -= 6;
  if (leftSectors < 0.15 || rightSectors < 0.15) scores['10'] -= 4;
  if (topHeavy || bottomHeavy) scores['10'] -= 2;
  if (leftHeavy || rightHeavy) scores['10'] -= 2;

  // NINE - TOP-heavy with loop at top, stem on right (opposite of 6)
  scores['9'] = 0;
  if (topHeavy) scores['9'] += 4;  // TOP-heavy!
  if (topBottomRatio > 1.5) scores['9'] += 2;  // very top-heavy
  if (sectorRatios[2] > 0.08) scores['9'] += 2;  // top-right loop
  if (rightSectors > leftSectors * 1.2) scores['9'] += 1;
  if (bottomHeavy) scores['9'] -= 5;
  if (leftHeavy) scores['9'] -= 3;
  if (verticalSymmetry > 0.75) scores['9'] -= 2;
  if (Math.abs(topBottomRatio - 1) < 0.2) scores['9'] -= 3;  // too balanced (3?)

  // EIGHT - Must be VERY symmetric, NOT high ink like 10
  scores['8'] = 0;
  if (verticalSymmetry > 0.80) scores['8'] += 3;
  if (horizontalSymmetry > 0.75) scores['8'] += 3;
  if (centerRatio > 0.02 && centerRatio < 0.06) scores['8'] += 1;  // pinched center
  if (topHeavy || bottomHeavy) scores['8'] -= 4;
  if (leftHeavy || rightHeavy) scores['8'] -= 3;
  if (darkRatio > 0.11) scores['8'] -= 3;  // too much ink (not 10)
  if (sectorRatios[1] > 0.10) scores['8'] -= 2;  // strong top-center (A?)

  // SEVEN - TOP-heavy, horizontal bar at top
  scores['7'] = 0;
  if (topHeavy && topBottomRatio > 1.4) scores['7'] += 3;
  if (sectorRatios[0] > 0.08 && sectorRatios[1] > 0.06) scores['7'] += 2;  // top bar
  if (bottomSectors < topSectors * 0.6) scores['7'] += 2;  // sparse bottom
  if (leftSectors > rightSectors) scores['7'] += 1;
  if (bottomHeavy) scores['7'] -= 4;
  if (verticalSymmetry > 0.8) scores['7'] -= 3;

  // SIX - BOTTOM-heavy with loop at bottom (opposite of 9)
  scores['6'] = 0;
  if (bottomHeavy) scores['6'] += 4;  // BOTTOM-heavy!
  if (topBottomRatio < 0.7) scores['6'] += 2;  // very bottom-heavy ratio
  if (sectorRatios[6] > 0.10 || sectorRatios[7] > 0.10) scores['6'] += 2;  // strong bottom loop
  if (leftSectors > rightSectors) scores['6'] += 1;
  if (topHeavy) scores['6'] -= 5;
  if (verticalSymmetry > 0.8) scores['6'] -= 2;

  // FIVE - Top bar, middle bar, bottom-right curve (NOT bottom-heavy like 6)
  scores['5'] = 0;
  if (sectorRatios[0] > 0.06) scores['5'] += 2;  // top-left bar
  if (middleSectors > 0.10) scores['5'] += 2;  // middle bar
  if (sectorRatios[8] > 0.06) scores['5'] += 1;  // bottom-right curve
  if (leftHeavy) scores['5'] += 1;
  if (bottomHeavy && topBottomRatio < 0.7) scores['5'] -= 3;  // too bottom-heavy (6?)
  if (topHeavy) scores['5'] -= 2;

  // FOUR - Right vertical + middle horizontal cross + top-left diagonal
  scores['4'] = 0;
  if (middleSectors > 0.15) scores['4'] += 3;  // STRONG middle cross!
  if (sectorRatios[5] > 0.08) scores['4'] += 2;  // right-middle content
  if (sectorRatios[0] > 0.05 && sectorRatios[3] > 0.05) scores['4'] += 2;  // diagonal TL-ML
  if (rightSectors > 0.15) scores['4'] += 1;
  if (verticalSymmetry > 0.8) scores['4'] -= 3;
  if (horizontalSymmetry > 0.8) scores['4'] -= 3;
  if (bottomHeavy) scores['4'] -= 2;
  if (topHeavy) scores['4'] -= 2;

  // THREE - Two bumps facing RIGHT, balanced top-bottom, NOT top-heavy like 9
  scores['3'] = 0;
  if (rightHeavy) scores['3'] += 3;  // RIGHT-heavy
  if (rightSectors > leftSectors * 2) scores['3'] += 2;  // very right bias
  if (sectorRatios[2] > 0.08 && sectorRatios[8] > 0.08) scores['3'] += 2;  // right top+bottom bumps
  if (Math.abs(topBottomRatio - 1) < 0.2) scores['3'] += 2;  // balanced T/B
  if (leftHeavy) scores['3'] -= 5;
  if (topHeavy) scores['3'] -= 3;  // top-heavy (9?)
  if (bottomHeavy) scores['3'] -= 2;  // bottom-heavy (Q?)
  if (sectorRatios[8] > 0.14) scores['3'] -= 2;  // too strong BR (Q?)
  if (middleSectors > 0.18) scores['3'] -= 2;  // strong middle (4?)

  // TWO - Top-right curve, diagonal, bottom bar
  scores['2'] = 0;
  if (sectorRatios[2] > 0.06) scores['2'] += 2;  // top-right curve
  if (sectorRatios[6] > 0.06 || sectorRatios[7] > 0.06) scores['2'] += 2;  // bottom bar
  if (Math.abs(topBottomRatio - 1) < 0.3) scores['2'] += 1;  // balanced
  if (sectorRatios[4] > 0.05) scores['2'] += 1;  // diagonal center
  if (leftHeavy) scores['2'] -= 3;  // left-heavy (K?)
  if (darkRatio > 0.10) scores['2'] -= 2;  // too much ink

  // Find highest scoring card
  let bestCard = 'unknown';
  let bestScore = 3;

  for (const [card, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCard = card;
    }
  }

  // Debug: Log pattern details
  console.log(`[AI Pattern] dark:${darkRatio.toFixed(3)} topBot:${topBottomRatio.toFixed(2)} LR:${leftRightRatio.toFixed(2)} sym:${verticalSymmetry.toFixed(2)} => ${bestCard} (${bestScore})`);

  return bestCard;
}

function updateDetectionIndicator(count) {
  const indicator = document.querySelector('.ai-status-badge');
  if (indicator) {
    indicator.classList.add('detecting');
  }
}

// ============================================
// AI AUTO-TRACKING SYSTEM
// ============================================
const AutoTracker = {
  recentCards: new Map(), // region -> {card, time}
  cooldown: 2000, // Don't re-track same region for 2 seconds
  lastTrackTime: 0,
  minTrackInterval: 500 // Minimum time between any tracks
};

function isValidCardValue(value) {
  return ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].includes(value);
}

// ============================================
// DEALING SEQUENCE MANAGEMENT
// ============================================
function initDealingSequence(numPlayers) {
  const seq = AICardDetector.dealingSequence;
  seq.numPlayers = numPlayers;
  seq.currentRound = 1;
  seq.currentPosition = 0;
  seq.cardsDealtThisRound = 0;
  seq.lastCardTime = 0;

  // Build positions array: P1, P2, ... Pn, Dealer
  seq.positions = [];
  for (let i = 1; i <= numPlayers; i++) {
    seq.positions.push(`P${i}`);
  }
  seq.positions.push('Dealer');

  updateDealingSequenceDisplay();
  console.log(`[Dealing] Initialized sequence with ${numPlayers} players`);
}

function getCurrentDealingPosition() {
  const seq = AICardDetector.dealingSequence;
  return seq.positions[seq.currentPosition] || 'Unknown';
}

function advanceDealingPosition() {
  const seq = AICardDetector.dealingSequence;

  seq.currentPosition++;
  seq.cardsDealtThisRound++;

  // Check if round is complete (all positions got a card)
  if (seq.currentPosition >= seq.positions.length) {
    seq.currentPosition = 0;
    seq.currentRound++;
    console.log(`[Dealing] Starting round ${seq.currentRound}`);
  }

  updateDealingSequenceDisplay();
}

function resetDealingSequence() {
  const seq = AICardDetector.dealingSequence;
  seq.currentRound = 1;
  seq.currentPosition = 0;
  seq.cardsDealtThisRound = 0;
  seq.lastCardTime = 0;
  AutoTracker.recentCards.clear();
  updateDealingSequenceDisplay();
  console.log('[Dealing] Sequence reset for new hand');
}

function updateDealingSequenceDisplay() {
  const seq = AICardDetector.dealingSequence;
  const posDisplay = document.getElementById('currentDealPosition');
  const roundDisplay = document.getElementById('currentDealRound');
  const visualDisplay = document.getElementById('dealingSequenceVisual');

  if (posDisplay) {
    posDisplay.textContent = getCurrentDealingPosition();
    posDisplay.className = 'deal-position ' +
      (getCurrentDealingPosition() === 'Dealer' ? 'dealer-turn' : 'player-turn');
  }

  if (roundDisplay) {
    roundDisplay.textContent = `Round ${seq.currentRound}`;
  }

  // Update visual sequence indicator
  if (visualDisplay) {
    let html = '';
    seq.positions.forEach((pos, idx) => {
      const isActive = idx === seq.currentPosition;
      const isDealer = pos === 'Dealer';
      const displayName = isDealer ? 'D' : pos;

      if (idx > 0) {
        html += '<span class="seq-arrow">→</span>';
      }

      html += `<span class="seq-item${isActive ? ' active' : ''}${isDealer ? ' dealer' : ''}">${displayName}</span>`;
    });
    visualDisplay.innerHTML = html;
  }
}

function setNumPlayers(num) {
  initDealingSequence(num);
  showToast(`Set to ${num} players`, 'info');
}

// Zone adjustment functions
function adjustZone(direction) {
  const dz = AICardDetector.dealingZone;
  const step = 0.02; // 2% step

  switch(direction) {
    case 'left':  dz.x = Math.max(0, dz.x - step); break;
    case 'right': dz.x = Math.min(0.8, dz.x + step); break;
    case 'up':    dz.y = Math.max(0, dz.y - step); break;
    case 'down':  dz.y = Math.min(0.8, dz.y + step); break;
  }

  console.log(`[Zone] Adjusted to x:${(dz.x*100).toFixed(0)}% y:${(dz.y*100).toFixed(0)}%`);
  showToast(`Zone: ${(dz.x*100).toFixed(0)}%, ${(dz.y*100).toFixed(0)}%`, 'info');

  // Redraw zone preview if visible
  if (AICardDetector.showZonePreview) {
    drawZonePreview();
  }
}

function toggleZonePreview() {
  // Check if AI detection is running (canvas exists)
  if (!AICardDetector.canvas || !AICardDetector.ctx) {
    showToast('Start AI Detection first to see zone preview', 'warning');
    return;
  }

  AICardDetector.showZonePreview = !AICardDetector.showZonePreview;

  if (AICardDetector.showZonePreview) {
    showToast('Zone preview ON - green box shows detection area', 'success');
  } else {
    showToast('Zone preview OFF', 'info');
  }
}

function drawZonePreview() {
  const canvas = AICardDetector.canvas;
  const ctx = AICardDetector.ctx;
  if (!canvas || !ctx) {
    console.log('[Zone] No canvas/ctx for preview');
    return;
  }

  const dz = AICardDetector.dealingZone;
  const x = canvas.width * dz.x;
  const y = canvas.height * dz.y;
  const w = canvas.width * dz.w;
  const h = canvas.height * dz.h;

  // Draw semi-transparent fill
  ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
  ctx.fillRect(x, y, w, h);

  // Draw zone rectangle with thick border
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);

  // Draw corner markers
  const cornerSize = 15;
  ctx.fillStyle = '#00ff00';
  // Top-left
  ctx.fillRect(x, y, cornerSize, 4);
  ctx.fillRect(x, y, 4, cornerSize);
  // Top-right
  ctx.fillRect(x + w - cornerSize, y, cornerSize, 4);
  ctx.fillRect(x + w - 4, y, 4, cornerSize);
  // Bottom-left
  ctx.fillRect(x, y + h - 4, cornerSize, 4);
  ctx.fillRect(x, y + h - cornerSize, 4, cornerSize);
  // Bottom-right
  ctx.fillRect(x + w - cornerSize, y + h - 4, cornerSize, 4);
  ctx.fillRect(x + w - 4, y + h - cornerSize, 4, cornerSize);

  // Draw label with background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x, y - 25, 130, 22);
  ctx.fillStyle = '#00ff00';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('🎯 DEALING ZONE', x + 5, y - 8);
}

function clearZonePreview() {
  // Preview will be cleared on next frame draw
}

// ============================================
// AUTO-TRACKING WITH SEQUENCE
// ============================================
function autoTrackRecognizedCard(detection) {
  const now = Date.now();
  const region = detection.region;
  const card = detection.label;
  const seq = AICardDetector.dealingSequence;

  // SINGLE ZONE MODE: Use card cooldown to prevent duplicate detection
  if (AICardDetector.singleZoneMode) {
    // Check cooldown since last card
    if (now - seq.lastCardTime < seq.cardCooldown) {
      return; // Too soon, same card still in zone
    }

    // Track the card
    seq.lastCardTime = now;

    // Get current position before advancing
    const position = getCurrentDealingPosition();

    // Update AI stats
    AICardDetector.cardsDetected++;
    AICardDetector.lastDetectedCards.unshift(card);
    if (AICardDetector.lastDetectedCards.length > 10) {
      AICardDetector.lastDetectedCards.pop();
    }

    // Add to the live tracker system
    trackLiveCard(card);

    // Show visual feedback with position
    showAutoTrackFeedback(card, detection, position);

    // Log for debugging
    console.log(`[AI DEAL] ${card} → ${position} (Round ${seq.currentRound}, ${Math.round(detection.confidence * 100)}%)`);

    // Advance to next position in sequence
    advanceDealingPosition();

    // Update displays
    updateAIStats();
    updateAIDetectedDisplay();
    return;
  }

  // LEGACY MULTI-ZONE MODE
  // Check minimum interval between tracks
  if (now - AutoTracker.lastTrackTime < AutoTracker.minTrackInterval) {
    return;
  }

  // Check if this region was recently tracked with same card
  const recent = AutoTracker.recentCards.get(region);
  if (recent && recent.card === card && (now - recent.time) < AutoTracker.cooldown) {
    return; // Skip - same card in same region recently
  }

  // Track the card!
  AutoTracker.recentCards.set(region, { card, time: now });
  AutoTracker.lastTrackTime = now;

  // Update AI stats
  AICardDetector.cardsDetected++;
  AICardDetector.lastDetectedCards.unshift(card);
  if (AICardDetector.lastDetectedCards.length > 10) {
    AICardDetector.lastDetectedCards.pop();
  }

  // Add to the live tracker system
  trackLiveCard(card);

  // Show visual feedback
  showAutoTrackFeedback(card, detection);

  // Log for debugging
  console.log(`[AI AUTO] Tracked: ${card} in ${region} (${Math.round(detection.confidence * 100)}%)`);

  // Update displays
  updateAIStats();
  updateAIDetectedDisplay();
}

function showAutoTrackFeedback(card, detection, position = null) {
  // Create floating feedback at detection location
  const existing = document.querySelectorAll('.auto-track-feedback');
  existing.forEach(el => el.remove());

  const feedback = document.createElement('div');
  feedback.className = 'auto-track-feedback';

  const countValue = getCardCountValue(card);
  const countClass = countValue > 0 ? 'low' : countValue < 0 ? 'high' : 'neutral';

  // Show position if in single zone mode
  const positionText = position ? `→ ${position}` : 'AUTO-TRACKED!';

  feedback.innerHTML = `
    <span class="atf-card ${countClass}">${card}</span>
    <span class="atf-text">${positionText}</span>
  `;

  const tracker = document.querySelector('.video-tracker-modal') || document.body;
  tracker.appendChild(feedback);

  // Remove after animation
  setTimeout(() => feedback.remove(), 1200);
}

function getCardCountValue(card) {
  if (['2', '3', '4', '5', '6'].includes(card)) return 1;
  if (['10', 'J', 'Q', 'K', 'A'].includes(card)) return -1;
  return 0;
}

function detectMotionRegions(current, previous, width, height) {
  const regions = [];
  const blockSize = 40; // Analyze in 40x40 pixel blocks
  const threshold = AICardDetector.motionThreshold;

  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      let motionScore = 0;
      let sampleCount = 0;

      // Sample pixels in this block
      for (let y = by; y < Math.min(by + blockSize, height); y += 4) {
        for (let x = bx; x < Math.min(bx + blockSize, width); x += 4) {
          const idx = (y * width + x) * 4;
          const dr = Math.abs(current[idx] - previous[idx]);
          const dg = Math.abs(current[idx + 1] - previous[idx + 1]);
          const db = Math.abs(current[idx + 2] - previous[idx + 2]);

          if (dr + dg + db > threshold * 3) {
            motionScore++;
          }
          sampleCount++;
        }
      }

      // If significant motion in this block
      if (motionScore > sampleCount * 0.3) {
        regions.push({
          x: bx,
          y: by,
          w: blockSize,
          h: blockSize,
          name: `motion_${by}_${bx}`,
          motionScore: motionScore / sampleCount
        });
      }
    }
  }

  // Merge adjacent motion regions into larger areas
  return mergeAdjacentRegions(regions, blockSize);
}

function mergeAdjacentRegions(regions, blockSize) {
  if (regions.length === 0) return [];

  const merged = [];
  const used = new Set();

  regions.forEach((region, i) => {
    if (used.has(i)) return;

    let minX = region.x, minY = region.y;
    let maxX = region.x + region.w, maxY = region.y + region.h;

    // Find adjacent regions
    regions.forEach((other, j) => {
      if (i === j || used.has(j)) return;

      const isAdjacent =
        Math.abs(other.x - region.x) <= blockSize * 2 &&
        Math.abs(other.y - region.y) <= blockSize * 2;

      if (isAdjacent) {
        used.add(j);
        minX = Math.min(minX, other.x);
        minY = Math.min(minY, other.y);
        maxX = Math.max(maxX, other.x + other.w);
        maxY = Math.max(maxY, other.y + other.h);
      }
    });

    merged.push({
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY,
      name: `merged_${minY}_${minX}`
    });
  });

  return merged;
}

function getCardZones(width, height) {
  // SINGLE ZONE MODE: Only scan the center dealing zone
  if (AICardDetector.singleZoneMode) {
    const dz = AICardDetector.dealingZone;
    return [
      {
        x: width * dz.x,
        y: height * dz.y,
        w: width * dz.w,
        h: height * dz.h,
        name: 'dealing_zone'
      }
    ];
  }

  // Multi-zone mode (legacy) - Define specific zones where cards typically appear
  return [
    // Dealer area (top/center) - multiple positions
    { x: width * 0.25, y: height * 0.20, w: width * 0.10, h: height * 0.15, name: 'dealer_1' },
    { x: width * 0.36, y: height * 0.20, w: width * 0.10, h: height * 0.15, name: 'dealer_2' },
    { x: width * 0.47, y: height * 0.20, w: width * 0.10, h: height * 0.15, name: 'dealer_3' },
    { x: width * 0.58, y: height * 0.20, w: width * 0.10, h: height * 0.15, name: 'dealer_4' },
    // Center table area
    { x: width * 0.30, y: height * 0.38, w: width * 0.10, h: height * 0.15, name: 'center_1' },
    { x: width * 0.42, y: height * 0.38, w: width * 0.10, h: height * 0.15, name: 'center_2' },
    { x: width * 0.54, y: height * 0.38, w: width * 0.10, h: height * 0.15, name: 'center_3' },
    // Player area (bottom) - multiple positions
    { x: width * 0.20, y: height * 0.55, w: width * 0.10, h: height * 0.18, name: 'player_1' },
    { x: width * 0.32, y: height * 0.55, w: width * 0.10, h: height * 0.18, name: 'player_2' },
    { x: width * 0.44, y: height * 0.55, w: width * 0.10, h: height * 0.18, name: 'player_3' },
    { x: width * 0.56, y: height * 0.55, w: width * 0.10, h: height * 0.18, name: 'player_4' },
    { x: width * 0.68, y: height * 0.55, w: width * 0.10, h: height * 0.18, name: 'player_5' },
  ];
}

function analyzeCardRegion(data, width, region) {
  let whitePixels = 0;
  let redPixels = 0;
  let blackPixels = 0;
  let totalPixels = 0;

  const startX = Math.floor(region.x);
  const startY = Math.floor(region.y);
  const endX = Math.min(Math.floor(region.x + region.w), width);
  const endY = Math.min(Math.floor(region.y + region.h), data.length / (width * 4));

  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const idx = (y * width + x) * 4;
      if (idx + 2 >= data.length) continue;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      totalPixels++;

      // White/cream (card background)
      if (r > 200 && g > 190 && b > 180 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
        whitePixels++;
      }
      // Red (hearts, diamonds)
      else if (r > 150 && g < 100 && b < 100) {
        redPixels++;
      }
      // Black (spades, clubs, text)
      else if (r < 80 && g < 80 && b < 80) {
        blackPixels++;
      }
    }
  }

  if (totalPixels === 0) return { isCard: false, confidence: 0 };

  const whiteRatio = whitePixels / totalPixels;
  const redRatio = redPixels / totalPixels;
  const blackRatio = blackPixels / totalPixels;

  // SINGLE ZONE MODE - User has positioned zone, ALWAYS try to detect
  const isInSingleZoneMode = AICardDetector.singleZoneMode;

  // In SINGLE ZONE MODE: Always detect - user positioned the zone correctly
  // We trust the zone position and always try to recognize
  if (isInSingleZoneMode) {
    const hasAnyContent = (whiteRatio > 0.05) || (redRatio > 0.005) || (blackRatio > 0.01);
    return {
      isCard: hasAnyContent, // Always try if there's any content
      confidence: Math.min(0.95, whiteRatio * 0.6 + (redRatio + blackRatio) * 2.5 + 0.3),
      colorProfile: { whiteRatio, redRatio, blackRatio, isRed: redRatio > blackRatio }
    };
  }

  // MULTI-ZONE MODE - Stricter criteria
  const whiteThreshold = 0.20;
  const symbolThreshold = 0.01;
  const contrastThreshold = 0.25;

  const hasCardBackground = whiteRatio > whiteThreshold;
  const hasSymbols = (redRatio > symbolThreshold || blackRatio > symbolThreshold * 2);
  const isProperSize = region.w >= AICardDetector.minCardWidth &&
                       region.h >= AICardDetector.minCardHeight;

  // Also detect high contrast areas (cards stand out from green felt)
  const hasHighContrast = (whiteRatio + redRatio + blackRatio) > contrastThreshold;

  const isCard = (hasCardBackground && hasSymbols && isProperSize) ||
                 (hasHighContrast && isProperSize);
  const confidence = Math.min(0.95, whiteRatio * 0.6 + (redRatio + blackRatio) * 2.5 + 0.2);

  // Debug logging for single zone mode
  if (isInSingleZoneMode && region.name === 'dealing_zone') {
    console.log(`[Zone Analysis] white:${(whiteRatio*100).toFixed(1)}% red:${(redRatio*100).toFixed(1)}% black:${(blackRatio*100).toFixed(1)}% → isCard:${isCard}`);
  }

  return {
    isCard,
    confidence,
    colorProfile: { whiteRatio, redRatio, blackRatio, isRed: redRatio > blackRatio }
  };
}

function isRegionAlreadyDetected(region) {
  const now = Date.now();
  const centerX = region.x + region.w / 2;
  const centerY = region.y + region.h / 2;

  return AICardDetector.detectedRegions.some(det => {
    if (now - det.time > AICardDetector.regionCooldown) return false;

    const dx = Math.abs(det.x - centerX);
    const dy = Math.abs(det.y - centerY);
    return dx < 50 && dy < 50; // Within 50px is considered same region
  });
}

function markRegionDetected(region) {
  const centerX = region.x + region.w / 2;
  const centerY = region.y + region.h / 2;

  AICardDetector.detectedRegions.push({
    x: centerX,
    y: centerY,
    time: Date.now()
  });

  // Clean up old detections
  const now = Date.now();
  AICardDetector.detectedRegions = AICardDetector.detectedRegions.filter(
    det => now - det.time < AICardDetector.regionCooldown * 2
  );
}

function classifyAsCard(prediction) {
  // COCO-SSD doesn't have playing cards in its training data
  // This function is kept for future ML model integration
  // For now, we use motion detection + user confirmation for accurate tracking
  return null;
}

// ============================================
// AI DETECTOR - DRAW BOUNDING BOXES
// ============================================
function drawDetectionBox(ctx, detection, index) {
  const [x, y, width, height] = detection.bbox;
  const confidence = Math.round(detection.confidence * 100);

  // Draw box
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);

  // Fill with slight transparency
  ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
  ctx.fillRect(x, y, width, height);

  // Draw label background
  const label = detection.label;
  ctx.font = 'bold 14px Arial';
  const textWidth = ctx.measureText(label).width + 10;

  ctx.fillStyle = '#8b5cf6';
  ctx.fillRect(x, y - 24, textWidth, 22);

  // Draw label text
  ctx.fillStyle = 'white';
  ctx.fillText(label, x + 5, y - 8);

  // Draw confidence
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(x, y + height, 50, 18);
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 11px Arial';
  ctx.fillText(`${confidence}%`, x + 5, y + height + 13);
}

// ============================================
// AI DETECTOR - CARD SELECTION PROMPT
// ============================================
let cardSelectionQueue = [];
let isShowingCardPrompt = false;

function showCardSelectionPrompt(detection) {
  // Add to queue
  cardSelectionQueue.push(detection);

  // Process queue if not already showing
  if (!isShowingCardPrompt) {
    processCardSelectionQueue();
  }
}

function processCardSelectionQueue() {
  if (cardSelectionQueue.length === 0) {
    isShowingCardPrompt = false;
    return;
  }

  isShowingCardPrompt = true;
  const detection = cardSelectionQueue.shift();

  // Create quick card selection overlay
  const existingPrompt = document.getElementById('aiCardPrompt');
  if (existingPrompt) existingPrompt.remove();

  const prompt = document.createElement('div');
  prompt.id = 'aiCardPrompt';
  prompt.className = 'ai-card-prompt';

  const isRed = detection.colorProfile?.isRed;
  const colorHint = isRed ? '(Red card detected)' : '(Black card detected)';

  prompt.innerHTML = `
    <div class="ai-prompt-header">
      <span class="ai-prompt-icon">🃏</span>
      <span>New Card Detected!</span>
      <span class="ai-prompt-hint">${colorHint}</span>
    </div>
    <div class="ai-prompt-message">Select the card value (or press key 2-9, 0=10, J, Q, K, A):</div>
    <div class="ai-card-buttons">
      ${['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].map(card => `
        <button class="ai-card-btn ${getCardCountClass(card)}" onclick="confirmCardDetection('${card}')">${card}</button>
      `).join('')}
    </div>
    <div class="ai-prompt-actions">
      <button class="ai-skip-btn" onclick="skipCardDetection()">Skip (Space)</button>
      <button class="ai-cancel-btn" onclick="cancelCardDetection()">False Positive (Esc)</button>
    </div>
  `;

  // Add to page
  const tracker = document.querySelector('.video-tracker-modal') || document.body;
  tracker.appendChild(prompt);

  // Auto-dismiss after 5 seconds if no input
  AICardDetector.promptTimeout = setTimeout(() => {
    skipCardDetection();
  }, 5000);

  // Add keyboard listener
  document.addEventListener('keydown', handleCardPromptKey);
}

function handleCardPromptKey(e) {
  const key = e.key.toUpperCase();

  // Number keys for cards
  if (key >= '2' && key <= '9') {
    confirmCardDetection(key);
  } else if (key === '0' || key === 'T') {
    confirmCardDetection('10');
  } else if (['J', 'Q', 'K', 'A'].includes(key)) {
    confirmCardDetection(key);
  } else if (key === ' ' || key === 'SPACE') {
    e.preventDefault();
    skipCardDetection();
  } else if (key === 'ESCAPE') {
    cancelCardDetection();
  }
}

// Global keyboard listener for quick card input (works even without prompt)
function initGlobalCardInput() {
  document.addEventListener('keydown', (e) => {
    // Only work when video tracker is visible and AI is detecting
    const tracker = document.querySelector('.video-tracker-modal');
    if (!tracker || tracker.style.display === 'none') return;
    if (!AICardDetector.isDetecting) return;

    // Don't interfere if prompt is already showing (it has its own handler)
    if (document.getElementById('aiCardPrompt')) return;

    // Don't capture if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toUpperCase();

    // Quick card input without prompt
    if (key >= '2' && key <= '9') {
      e.preventDefault();
      quickTrackCard(key);
    } else if (key === '0' || key === 'T') {
      e.preventDefault();
      quickTrackCard('10');
    } else if (['J', 'Q', 'K', 'A'].includes(key)) {
      e.preventDefault();
      quickTrackCard(key);
    }
  });
}

function quickTrackCard(cardValue) {
  // Directly track a card without prompt (for manual fast input)
  AICardDetector.cardsDetected++;
  AICardDetector.lastDetectedCards.unshift(cardValue);

  if (AICardDetector.lastDetectedCards.length > 10) {
    AICardDetector.lastDetectedCards.pop();
  }

  // Add to live tracker
  trackLiveCard(cardValue);

  // Show quick feedback
  showQuickTrackFeedback(cardValue);

  // Update displays
  updateAIStats();
  updateAIDetectedDisplay();

  console.log(`[AI] Quick tracked: ${cardValue}`);
}

function showQuickTrackFeedback(card) {
  // Show brief visual feedback for quick track
  const existing = document.getElementById('quickTrackFeedback');
  if (existing) existing.remove();

  const feedback = document.createElement('div');
  feedback.id = 'quickTrackFeedback';
  feedback.className = 'quick-track-feedback';
  feedback.innerHTML = `<span class="qtf-card ${getCardCountClass(card)}">${card}</span> tracked!`;

  const tracker = document.querySelector('.video-tracker-modal') || document.body;
  tracker.appendChild(feedback);

  setTimeout(() => feedback.remove(), 800);
}

// Initialize global input when DOM is ready
document.addEventListener('DOMContentLoaded', initGlobalCardInput);
if (document.readyState !== 'loading') initGlobalCardInput();

function confirmCardDetection(cardValue) {
  clearTimeout(AICardDetector.promptTimeout);
  document.removeEventListener('keydown', handleCardPromptKey);

  const prompt = document.getElementById('aiCardPrompt');
  if (prompt) prompt.remove();

  // Track the confirmed card
  AICardDetector.cardsDetected++;
  AICardDetector.lastDetectedCards.unshift(cardValue);

  if (AICardDetector.lastDetectedCards.length > 10) {
    AICardDetector.lastDetectedCards.pop();
  }

  // Add to live tracker
  trackLiveCard(cardValue);

  console.log(`[AI] Card confirmed: ${cardValue}`);

  // Update display
  updateAIStats();
  updateAIDetectedDisplay();

  // Process next in queue
  setTimeout(processCardSelectionQueue, 100);
}

function skipCardDetection() {
  clearTimeout(AICardDetector.promptTimeout);
  document.removeEventListener('keydown', handleCardPromptKey);

  const prompt = document.getElementById('aiCardPrompt');
  if (prompt) prompt.remove();

  // Process next in queue
  setTimeout(processCardSelectionQueue, 100);
}

function cancelCardDetection() {
  clearTimeout(AICardDetector.promptTimeout);
  document.removeEventListener('keydown', handleCardPromptKey);

  const prompt = document.getElementById('aiCardPrompt');
  if (prompt) prompt.remove();

  // Mark as false positive
  AICardDetector.falsePositives = (AICardDetector.falsePositives || 0) + 1;
  updateAIStats();

  // Process next in queue
  setTimeout(processCardSelectionQueue, 100);
}

function getCardCountClass(card) {
  if (['2', '3', '4', '5', '6'].includes(card)) return 'low-card';
  if (['10', 'J', 'Q', 'K', 'A'].includes(card)) return 'high-card';
  return 'neutral-card';
}

function updateAIStats() {
  const detected = document.getElementById('aiCardsDetected');
  const accuracy = document.getElementById('aiAccuracy');

  if (detected) detected.textContent = AICardDetector.cardsDetected;

  if (accuracy) {
    const total = AICardDetector.totalDetections;
    const confirmed = AICardDetector.cardsDetected;
    const falsePos = AICardDetector.falsePositives || 0;

    if (total > 0) {
      const acc = Math.round((confirmed / (confirmed + falsePos)) * 100) || 0;
      accuracy.textContent = `${acc}%`;
    }
  }
}

// ============================================
// AI DETECTOR - AUTO-TRACKING (Legacy - for manual mode)
// ============================================
function autoTrackDetectedCards(detections) {
  // This is now only used in manual mode or for already-confirmed cards
  detections.forEach(det => {
    const card = det.label;
    if (!card || card === 'unknown' || card === 'NEW CARD' || card === 'CARD ZONE') return;

    // Track the card
    AICardDetector.cardsDetected++;
    AICardDetector.lastDetectedCards.unshift(card);

    if (AICardDetector.lastDetectedCards.length > 10) {
      AICardDetector.lastDetectedCards.pop();
    }

    trackLiveCard(card);
    console.log(`[AI] Auto-tracked: ${card}`);
  });

  updateAIStats();
}

function updateAIDetectedDisplay() {
  const container = document.getElementById('aiDetectedCards');
  if (!container) return;

  if (AICardDetector.lastDetectedCards.length === 0) {
    container.innerHTML = `
      <span class="ai-detected-label">Last Detected:</span>
      <span class="ai-detected-none">Waiting for detection...</span>
    `;
    return;
  }

  const cards = AICardDetector.lastDetectedCards.slice(0, 5).map(card => {
    const countValue = getCardCountValue(card);
    const colorClass = countValue > 0 ? 'low' : countValue < 0 ? 'high' : 'neutral';
    return `<span class="ai-detected-card ${colorClass}">${card}</span>`;
  }).join('');

  container.innerHTML = `
    <span class="ai-detected-label">Last Detected:</span>
    ${cards}
  `;
}

function getCardCountValue(card) {
  const normalized = ['J', 'Q', 'K'].includes(card) ? '10' : card;
  if (['2', '3', '4', '5', '6'].includes(normalized)) return 1;
  if (['10', 'A'].includes(normalized)) return -1;
  return 0;
}

// ============================================
// AI DETECTOR - SETTINGS
// ============================================
function setAIMode(mode) {
  AICardDetector.mode = mode;

  document.getElementById('btnAIModeAuto').classList.toggle('active', mode === 'auto');
  document.getElementById('btnAIModeManual').classList.toggle('active', mode === 'manual');

  showToast(`AI Mode: ${mode === 'auto' ? 'Auto-track enabled' : 'Manual confirmation'}`, 'info');
}

function updateAIConfidence(value) {
  AICardDetector.confidenceThreshold = value / 100;
  document.getElementById('aiConfidenceValue').textContent = `${value}%`;
}

function updateAISpeed(value) {
  AICardDetector.detectionInterval = parseInt(value);
}

function toggleAIDebugMode(enabled) {
  AICardDetector.debugMode = enabled;
  showToast(enabled ? 'Debug grid enabled' : 'Debug grid disabled', 'info');
}

// Draw debug grid overlay on canvas
function drawDebugGrid(ctx, width, height) {
  if (!AICardDetector.debugMode) return;

  const gridCols = 8;
  const gridRows = 6;
  const cellW = width / gridCols;
  const cellH = height / gridRows;

  ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.font = '10px Arial';
  ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';

  // Draw grid lines
  for (let row = 0; row <= gridRows; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * cellH);
    ctx.lineTo(width, row * cellH);
    ctx.stroke();
  }
  for (let col = 0; col <= gridCols; col++) {
    ctx.beginPath();
    ctx.moveTo(col * cellW, 0);
    ctx.lineTo(col * cellW, height);
    ctx.stroke();
  }

  // Draw cell labels
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      ctx.fillText(`${row},${col}`, col * cellW + 5, row * cellH + 15);
    }
  }
}

// ============================================
// AI DETECTOR - INITIALIZE ON TRACKER OPEN
// ============================================
const originalShowVideoTracker = showVideoTracker;
showVideoTracker = function() {
  originalShowVideoTracker();

  // Initialize AI detector if not already
  if (!AICardDetector.isModelLoaded) {
    setTimeout(() => {
      initAIDetector();
    }, 500);
  }
};

// ============================================
// Initialize on DOM Ready
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    loadTheme();
    initMobileMode();
  });
} else {
  init();
  loadTheme();
  initMobileMode();
}


// ============================================
// LIVE CARD TRACKING - WEBCAM INTEGRATION
// ============================================

// Card Detection Model State
const CardDetectionModel = {
  session: null,
  isLoaded: false,
  isLoading: false,
  classNames: null,
  inputSize: 224,  // Model expects 224x224 images (MobileNetV3)
  modelPath: 'training_data/models/card_classifier.onnx',
  classNamesPath: 'training_data/models/class_names.json',
  // ImageNet normalization values used during training
  mean: [0.485, 0.456, 0.406],
  std: [0.229, 0.224, 0.225]
};

// Class names mapping (fallback if JSON fails to load)
const CARD_CLASSES = {
  0: "10_clubs", 1: "10_diamonds", 2: "10_hearts", 3: "10_spades",
  4: "2_clubs", 5: "2_diamonds", 6: "2_hearts", 7: "2_spades",
  8: "3_clubs", 9: "3_diamonds", 10: "3_hearts", 11: "3_spades",
  12: "4_clubs", 13: "4_diamonds", 14: "4_hearts", 15: "4_spades",
  16: "5_clubs", 17: "5_diamonds", 18: "5_hearts", 19: "5_spades",
  20: "6_clubs", 21: "6_diamonds", 22: "6_hearts", 23: "6_spades",
  24: "7_clubs", 25: "7_diamonds", 26: "7_hearts", 27: "7_spades",
  28: "8_clubs", 29: "8_diamonds", 30: "8_hearts", 31: "8_spades",
  32: "9_clubs", 33: "9_diamonds", 34: "9_hearts", 35: "9_spades",
  36: "A_clubs", 37: "A_diamonds", 38: "A_hearts", 39: "A_spades",
  40: "J_clubs", 41: "J_diamonds", 42: "J_hearts", 43: "J_spades",
  44: "K_clubs", 45: "K_diamonds", 46: "K_hearts", 47: "K_spades",
  48: "Q_clubs", 49: "Q_diamonds", 50: "Q_hearts", 51: "Q_spades"
};

// Webcam State
const WebcamState = {
  stream: null,
  isRunning: false,
  fps: 0,
  detectedCards: [],
  autoDetect: false,
  autoAdd: false,
  confidenceThreshold: 0.7,
  animationFrameId: null,
  availableCameras: [],
  detectionInProgress: false
};

// Load Card Detection Model
async function loadCardDetectionModel() {
  if (CardDetectionModel.isLoaded || CardDetectionModel.isLoading) {
    console.log('[CardDetection] Model already loaded or loading');
    return CardDetectionModel.isLoaded;
  }

  CardDetectionModel.isLoading = true;
  updateModelStatus('Loading model...');

  try {
    // Load class names
    try {
      const response = await fetch(CardDetectionModel.classNamesPath);
      if (response.ok) {
        CardDetectionModel.classNames = await response.json();
        console.log('[CardDetection] Class names loaded');
      }
    } catch (e) {
      console.log('[CardDetection] Using fallback class names');
      CardDetectionModel.classNames = CARD_CLASSES;
    }

    if (!CardDetectionModel.classNames) {
      CardDetectionModel.classNames = CARD_CLASSES;
    }

    // Load ONNX model
    console.log('[CardDetection] Loading ONNX model...');
    CardDetectionModel.session = await ort.InferenceSession.create(
      CardDetectionModel.modelPath,
      { executionProviders: ['wasm'] }
    );

    CardDetectionModel.isLoaded = true;
    CardDetectionModel.isLoading = false;
    updateModelStatus('Model ready');
    console.log('[CardDetection] Model loaded successfully');
    showToast('Card detection model loaded', 'success');
    return true;

  } catch (err) {
    CardDetectionModel.isLoading = false;
    updateModelStatus('Model error');
    console.error('[CardDetection] Failed to load model:', err);
    showToast('Failed to load card detection model', 'error');
    return false;
  }
}

// Update model status display
function updateModelStatus(status) {
  const el = document.getElementById('modelStatus');
  if (el) el.textContent = status;
}

// Preprocess image for model inference
function preprocessImage(canvas) {
  const size = CardDetectionModel.inputSize;
  const mean = CardDetectionModel.mean;
  const std = CardDetectionModel.std;

  // Create a temporary canvas for resizing
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = size;
  tempCanvas.height = size;
  const ctx = tempCanvas.getContext('2d');

  // Draw and resize image (maintain aspect ratio by center cropping)
  const srcWidth = canvas.width;
  const srcHeight = canvas.height;
  const srcSize = Math.min(srcWidth, srcHeight);
  const srcX = (srcWidth - srcSize) / 2;
  const srcY = (srcHeight - srcSize) / 2;

  ctx.drawImage(canvas, srcX, srcY, srcSize, srcSize, 0, 0, size, size);

  // Get image data
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  // Create tensor data (NCHW format: batch, channels, height, width)
  // Apply ImageNet normalization: (pixel/255 - mean) / std
  const floatData = new Float32Array(3 * size * size);

  for (let i = 0; i < size * size; i++) {
    const pixelIndex = i * 4;
    // RGB channels with ImageNet normalization
    floatData[i] = (data[pixelIndex] / 255.0 - mean[0]) / std[0];                    // R
    floatData[size * size + i] = (data[pixelIndex + 1] / 255.0 - mean[1]) / std[1];  // G
    floatData[2 * size * size + i] = (data[pixelIndex + 2] / 255.0 - mean[2]) / std[2]; // B
  }

  return floatData;
}

// Apply softmax to logits
function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(x => Math.exp(x - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sumExps);
}

// Parse card class name to rank and suit
function parseCardClass(className) {
  const parts = className.split('_');
  const rank = parts[0];
  const suit = parts[1];

  // Convert suit to symbol
  const suitSymbols = {
    'clubs': '♣',
    'diamonds': '♦',
    'hearts': '♥',
    'spades': '♠'
  };

  return {
    rank: rank,
    suit: suitSymbols[suit] || suit,
    fullName: className
  };
}

// Toggle webcam panel visibility
function toggleWebcamPanel() {
  const panel = document.getElementById('webcamPanel');
  const btn = document.getElementById('btnToggleWebcam');
  
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    btn.classList.add('active');
    enumerateCameras();
  } else {
    panel.style.display = 'none';
    btn.classList.remove('active');
  }
}

// Close webcam panel
function closeWebcamPanel() {
  stopWebcam();
  document.getElementById('webcamPanel').style.display = 'none';
  document.getElementById('btnToggleWebcam').classList.remove('active');
}

// Minimize webcam panel
function toggleWebcamMinimize() {
  const panel = document.getElementById('webcamPanel');
  const btn = document.getElementById('btnMinimizeWebcam');
  panel.classList.toggle('minimized');
  btn.textContent = panel.classList.contains('minimized') ? '+' : '−';
}

// Enumerate available cameras
async function enumerateCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(d => d.kind === 'videoinput');
    WebcamState.availableCameras = cameras;
    
    const select = document.getElementById('cameraSelect');
    select.innerHTML = '<option value="">Select Camera...</option>';
    
    cameras.forEach((camera, i) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.textContent = camera.label || 'Camera ' + (i + 1);
      select.appendChild(option);
    });
    
    console.log('[Webcam] Found ' + cameras.length + ' cameras');
  } catch (err) {
    console.error('[Webcam] Error enumerating cameras:', err);
  }
}

// Start webcam stream
async function startWebcam() {
  try {
    updateWebcamStatus('Starting...');
    
    const select = document.getElementById('cameraSelect');
    const deviceId = select.value;
    
    const constraints = {
      video: { width: { ideal: 1280 }, height: { ideal: 720 } }
    };
    
    if (deviceId) {
      constraints.video.deviceId = { exact: deviceId };
    }
    
    WebcamState.stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    const video = document.getElementById('webcamVideo');
    video.srcObject = WebcamState.stream;
    
    video.onloadedmetadata = () => {
      video.play();
      WebcamState.isRunning = true;
      
      const canvas = document.getElementById('webcamCanvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      document.getElementById('webcamPlaceholder').style.display = 'none';
      document.getElementById('btnStartCamera').style.display = 'none';
      document.getElementById('btnStopCamera').style.display = 'inline-flex';
      document.getElementById('btnCaptureFrame').disabled = false;
      
      updateWebcamStatus('Running');
      startFpsCounter();
      enumerateCameras();
      
      console.log('[Webcam] Started: ' + video.videoWidth + 'x' + video.videoHeight);
      showToast('Camera started', 'success');
    };
    
  } catch (err) {
    console.error('[Webcam] Error:', err);
    updateWebcamStatus('Error');
    showToast('Camera error: ' + err.message, 'error');
  }
}

// Stop webcam
function stopWebcam() {
  if (WebcamState.stream) {
    WebcamState.stream.getTracks().forEach(track => track.stop());
    WebcamState.stream = null;
  }
  
  WebcamState.isRunning = false;
  if (WebcamState.animationFrameId) cancelAnimationFrame(WebcamState.animationFrameId);
  
  const video = document.getElementById('webcamVideo');
  if (video) video.srcObject = null;
  
  document.getElementById('webcamPlaceholder').style.display = 'flex';
  document.getElementById('btnStartCamera').style.display = 'inline-flex';
  document.getElementById('btnStopCamera').style.display = 'none';
  document.getElementById('btnCaptureFrame').disabled = true;
  
  updateWebcamStatus('Stopped');
  document.getElementById('webcamFps').textContent = '0';
  console.log('[Webcam] Stopped');
}

// Switch camera
async function switchCamera() {
  if (WebcamState.isRunning) {
    stopWebcam();
    await startWebcam();
  }
}

// Capture frame
function captureFrame() {
  if (!WebcamState.isRunning) return null;
  
  const video = document.getElementById('webcamVideo');
  const canvas = document.getElementById('webcamCanvas');
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(video, 0, 0);
  showToast('Frame captured', 'info');
  
  if (WebcamState.autoDetect) {
    detectCardsInFrame(canvas);
  }
  
  return canvas.toDataURL('image/jpeg', 0.9);
}

// FPS counter
function startFpsCounter() {
  let lastTime = performance.now();
  let frames = 0;
  
  function countFrame() {
    if (!WebcamState.isRunning) return;
    frames++;
    const now = performance.now();
    
    if (now - lastTime >= 1000) {
      document.getElementById('webcamFps').textContent = frames;
      frames = 0;
      lastTime = now;
    }
    
    WebcamState.animationFrameId = requestAnimationFrame(countFrame);
  }
  countFrame();
}

function updateWebcamStatus(status) {
  const el = document.getElementById('webcamStatus');
  if (el) el.textContent = status;
}

function toggleAutoDetect() {
  WebcamState.autoDetect = document.getElementById('autoDetectEnabled').checked;
  if (WebcamState.autoDetect && WebcamState.isRunning) startAutoDetection();
}

function updateConfidenceValue() {
  const value = document.getElementById('confidenceThreshold').value;
  document.getElementById('confidenceValue').textContent = value + '%';
  WebcamState.confidenceThreshold = value / 100;
}

async function detectCardsInFrame(canvas) {
  // Skip if detection already in progress
  if (WebcamState.detectionInProgress) return;

  // Load model if not loaded
  if (!CardDetectionModel.isLoaded) {
    const loaded = await loadCardDetectionModel();
    if (!loaded) {
      console.log('[CardDetection] Model not available');
      updateDetectedCards([]);
      return;
    }
  }

  WebcamState.detectionInProgress = true;

  try {
    const size = CardDetectionModel.inputSize;

    // Preprocess image
    const inputData = preprocessImage(canvas);

    // Create tensor (NCHW format: 1 x 3 x 200 x 200)
    const tensor = new ort.Tensor('float32', inputData, [1, 3, size, size]);

    // Get input name from model
    const inputName = CardDetectionModel.session.inputNames[0];

    // Run inference
    const feeds = {};
    feeds[inputName] = tensor;
    const results = await CardDetectionModel.session.run(feeds);

    // Get output
    const outputName = CardDetectionModel.session.outputNames[0];
    const output = results[outputName];
    const logits = Array.from(output.data);

    // Apply softmax to get probabilities
    const probabilities = softmax(logits);

    // Find top predictions
    const indexed = probabilities.map((prob, idx) => ({ prob, idx }));
    indexed.sort((a, b) => b.prob - a.prob);

    // Get top predictions above threshold
    const threshold = WebcamState.confidenceThreshold;
    const detectedCards = [];

    // Only take the top prediction if it's above threshold
    if (indexed[0].prob >= threshold) {
      const classIdx = indexed[0].idx;
      const className = CardDetectionModel.classNames[classIdx] || CARD_CLASSES[classIdx];
      const cardInfo = parseCardClass(className);

      detectedCards.push({
        rank: cardInfo.rank,
        suit: cardInfo.suit,
        confidence: (indexed[0].prob * 100).toFixed(1),
        fullName: cardInfo.fullName
      });

      console.log(`[CardDetection] Detected: ${cardInfo.rank}${cardInfo.suit} (${(indexed[0].prob * 100).toFixed(1)}%)`);

      // Draw detection overlay
      drawDetectionOverlay(canvas, cardInfo, indexed[0].prob);
    }

    updateDetectedCards(detectedCards);

  } catch (err) {
    console.error('[CardDetection] Inference error:', err);
    updateDetectedCards([]);
  } finally {
    WebcamState.detectionInProgress = false;
  }
}

// Draw detection overlay on video
function drawDetectionOverlay(canvas, cardInfo, confidence) {
  const overlay = document.getElementById('webcamOverlay');
  if (!overlay) return;

  const confidencePercent = (confidence * 100).toFixed(0);
  const color = confidence > 0.9 ? '#00ff00' : confidence > 0.7 ? '#ffff00' : '#ff9900';

  overlay.innerHTML = `
    <div class="detection-box" style="border-color: ${color};">
      <div class="detection-label" style="background: ${color};">
        ${cardInfo.rank}${cardInfo.suit} ${confidencePercent}%
      </div>
    </div>
  `;

  // Clear overlay after 500ms
  setTimeout(() => {
    if (overlay) overlay.innerHTML = '';
  }, 500);
}

function startAutoDetection() {
  if (!WebcamState.isRunning || !WebcamState.autoDetect) return;

  const canvas = document.getElementById('webcamCanvas');
  const video = document.getElementById('webcamVideo');
  const ctx = canvas.getContext('2d');

  async function detectLoop() {
    if (!WebcamState.isRunning || !WebcamState.autoDetect) return;
    ctx.drawImage(video, 0, 0);
    await detectCardsInFrame(canvas);
    setTimeout(detectLoop, 500);
  }
  detectLoop();
}

function updateDetectedCards(cards) {
  WebcamState.detectedCards = cards;
  const list = document.getElementById('detectedCardsList');
  const countEl = document.getElementById('cardsDetected');
  const addBtn = document.getElementById('btnAddDetectedCards');
  
  countEl.textContent = cards.length;
  
  if (cards.length === 0) {
    list.innerHTML = 'No cards detected';
    addBtn.disabled = true;
  } else {
    list.innerHTML = cards.map(c => '<span class="detected-card">' + c.rank + c.suit + '</span>').join('');
    addBtn.disabled = false;
  }
  
  if (document.getElementById('autoAddEnabled').checked && cards.length > 0) {
    addDetectedCardsToGame();
  }
}

function addDetectedCardsToGame() {
  const cards = WebcamState.detectedCards;
  if (cards.length === 0) return;
  
  cards.forEach(card => {
    const rank = card.rank === 'A' ? 'A' : ['J','Q','K'].includes(card.rank) ? '10' : card.rank;
    dealCard(rank);
  });
  
  showToast('Added ' + cards.length + ' card(s)', 'success');
  updateDetectedCards([]);
}

console.log('[Webcam] Live Card Tracking module loaded');
