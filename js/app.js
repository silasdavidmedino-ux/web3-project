/**
 * BJ Probability Engine - Main Application v1.3
 * Tech Hive Corporation
 * Casino Dashboard Interface
 */

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
  }
};

// ============================================
// Initialize Application
// ============================================
function init() {
  console.log('BJ Probability Engine v1.3 - Initializing...');

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

  console.log('Application initialized');
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
  AppState.runningCount = 0;
  AppState.dealHistory = [];
  AppState.pairsWon = 0;

  // Clear dealer history on shoe reset
  AppState.dealerHistory = [];
  AppState.currentRoundNum = 0;

  for (const pos in AppState.positions) {
    AppState.positions[pos] = [];
  }

  updateAll();
  updateDealerHistory();
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
  const primaryAction = basicDecision.action;

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
      source: basicDecision.isDeviation ? 'ILLUSTRIOUS_18' : 'BASIC_STRATEGY',
      isDeviation: basicDecision.isDeviation,
      reason: basicDecision.reason
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

  // Update each rank row
  const ranks = ['10', '2', '3', '4', '5', '6', '7', '8', '9', 'A'];

  for (const rank of ranks) {
    const displayRank = rank === '10' ? '10' : rank;
    const seen = AppState.rankSeen[rank];
    const left = AppState.rankCounts[rank];
    const pct = remaining > 0 ? Math.round((left / AppState.initialCounts[rank]) * 100) : 0;

    setText(`seen${displayRank}`, seen);
    setText(`left${displayRank}`, left);
    setText(`pct${displayRank}`, pct);
  }
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
  console.log(`Starting simulation of ${numGames} games...`);

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

  console.log(`Simulation complete: ${gamesCompleted} games played`);
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

async function startRealtimeSimulation(numGames = 100) {
  if (realtimeSimRunning) {
    showToast('Simulation already running', 'warning');
    return;
  }

  realtimeSimRunning = true;
  realtimeSimPaused = false;
  simRoundCount = 0;

  // Show controls
  showSimulationControls();

  // Initialize
  initGameSession('Simulation Casino', 'Real-Time Simulation');
  resetShoe();
  clearTableForSim();

  // Show cut card animation before starting
  await showCutCardAnimation();

  showToast('Starting simulation...', 'info');

  // Run simulation loop
  for (let round = 1; round <= numGames && realtimeSimRunning; round++) {
    // Handle pause
    while (realtimeSimPaused && realtimeSimRunning) {
      await delay(100);
    }
    if (!realtimeSimRunning) break;

    // Reshuffle if needed (preserve dealer history)
    if (AppState.cardsDealt > AppState.totalCards * 0.75) {
      await showReshuffleAnimation();
      reshuffleShoeOnly();
    }

    updateSimStatus(`Round ${round}/${numGames}`);

    // Play one round
    await runSimRound();
    simRoundCount = round;

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

  // Log detailed results
  console.log('=== 1 SHOE TEST RESULTS ===');
  console.log(`Rounds: ${simRoundCount}`);
  console.log(`Cards Dealt: ${AppState.cardsDealt}`);
  console.log(`Player Wins: ${stats.playerWins}`);
  console.log(`Player Losses: ${stats.playerLosses}`);
  console.log(`Pushes: ${stats.pushes}`);
  console.log(`Dealer Busts: ${stats.dealerBusts}`);
  console.log(`Win Rate: ${winRate}%`);
  console.log(`Final Running Count: ${AppState.runningCount}`);
  console.log(`Final True Count: ${getTrueCount().toFixed(2)}`);
}

async function runSimRound() {
  const roundCards = [];

  // Deal: P1, P2, Dealer, P1, P2, Dealer
  await simDeal('player1', roundCards);
  await simDeal('player2', roundCards);
  await simDeal('dealer', roundCards);
  await simDeal('player1', roundCards);
  await simDeal('player2', roundCards);
  await simDeal('dealer', roundCards);

  if (!realtimeSimRunning) return;

  // Show unified decisions after dealing
  showUnifiedDecisionSim(1);
  showUnifiedDecisionSim(2);

  await delay(realtimeSimSpeed);

  const dealerUp = AppState.positions.dealer[0];
  const dealerVal = getValue(dealerUp);

  // Players hit/stand using unified decision engine
  await simPlayerPlay('player1', dealerVal, roundCards);
  await simPlayerPlay('player2', dealerVal, roundCards);

  if (!realtimeSimRunning) return;

  // Clear unified decisions before dealer plays
  clearUnifiedDecisionSim(1);
  clearUnifiedDecisionSim(2);

  // Dealer plays
  await simDealerPlay(roundCards);

  // Results
  const dTotal = calculateHandTotal(AppState.positions.dealer);
  simResult('player1', 1, dTotal);
  simResult('player2', 2, dTotal);

  // Record
  AppState.gameHistory.statistics.totalRounds++;
}

// Show unified decision during simulation
function showUnifiedDecisionSim(playerNum) {
  const decision = getUnifiedDecision(playerNum);
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

  indicator.classList.add(actionClass);
  if (decision.strategy.isDeviation) {
    indicator.classList.add('deviation');
  }

  indicator.innerHTML = `
    <div class="ud-main">
      <span class="ud-action">${shortAction}</span>
      <span class="ud-confidence">${decision.confidence}%</span>
      ${decision.strategy.isDeviation ? '<span class="ud-i18">I18</span>' : ''}
    </div>
    <div class="ud-details">
      <span class="ud-edge ${decision.edge.isPositive ? 'positive' : 'negative'}">${decision.edge.player}</span>
      <span class="ud-bet-action">${decision.betting.action} ×${decision.betting.multiplier}</span>
    </div>
  `;
  indicator.title = decision.strategy.reason;

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
  let hits = 0;

  while (hits < 8 && realtimeSimRunning) {
    const playerCards = AppState.positions[pos];
    const total = calculateHandTotal(playerCards);

    if (total >= 21) break;

    // Get optimal decision from Basic Strategy Engine + Illustrious 18
    const decision = getOptimalDecision(playerCards, dealerUpcard);

    // Show strategy indicator on player box
    showStrategyIndicator(pos, decision);

    await delay(realtimeSimSpeed / 2);

    // Execute the decision
    if (decision.action === 'STAY' || decision.action === 'SURRENDER') {
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

  const p1 = calculateHandTotal(AppState.positions.player1);
  const p2 = calculateHandTotal(AppState.positions.player2);
  if (p1 > 21 && p2 > 21) return;

  let total = calculateHandTotal(AppState.positions.dealer);
  let hits = 0;

  while (total < 17 && hits < 8 && realtimeSimRunning) {
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
  }
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
  if (tc) tc.textContent = calculateTrueCount();

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
function reshuffleShoeOnly() {
  AppState.rankCounts = JSON.parse(JSON.stringify(AppState.initialCounts));
  AppState.rankSeen = { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'A': 0 };
  AppState.cardsDealt = 0;
  AppState.runningCount = 0;
  // Note: dealer history is NOT cleared here - only on end game
  updateSimCounts();
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
  logToConsole('INITIALIZING FULL ENGINE SIMULATION...', 'header');
  logToConsole(`Config: ${AppState.numDecks} decks | 2 players | 75% penetration`, 'info');

  initGameSession('Full Sim', 'Pre+Post Deal Engine Test');
  resetShoe();
  clearTableForSim();

  await showCutCardAnimation();

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
    existing.querySelector('.console-output').innerHTML = '';
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
  showToast('Full simulation stopped', 'warning');
}

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
function analyzeHand(playerCards, dealerUpcard) {
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

  const result = analyzeHand([card1, card2], dealer);

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
  const result = analyzeHand(cards, dealerCard);

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
  const decksRemaining = Math.max(0.5, (AppState.totalCards - AppState.cardsSeen) / 52);

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
  const acesLeft = AppState.remainingCards['A'] || 0;
  const totalAces = AppState.decks * 4;
  const decksRemaining = Math.max(0.5, (AppState.totalCards - AppState.cardsSeen) / 52);
  const expectedPerDeck = 4;
  const aceRichness = (acesLeft / decksRemaining) / expectedPerDeck;
  const aceProbability = (acesLeft / (AppState.totalCards - AppState.cardsSeen)) * 100;

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
