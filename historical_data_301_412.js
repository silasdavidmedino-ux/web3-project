// Historical Data Extracted from Shoe Game 301-412 Screenshots
// Format: { dealerUp, dealerFinal, players: [{cards, total, outcome}] }

const historicalRounds = [
  // ===== GAME #301 (33 rounds) =====
  // Round 1
  { game: 301, round: 1, dealerUp: '10', dealerFinal: 20, dealerCards: ['10', '10'],
    players: [{ pos: 3, cards: ['3', '3', '5', '4'], total: 15, outcome: 'LOSS' }] },

  // Round 2
  { game: 301, round: 2, dealerUp: 'J', dealerFinal: 20, dealerCards: ['J', 'K'],
    players: [
      { pos: 1, cards: ['K', '4', '4'], total: 18, outcome: 'LOSS' },
      { pos: 2, cards: ['6', '4', '7'], total: 17, outcome: 'LOSS' },
      { pos: 3, cards: ['A', '4', '5'], total: 20, outcome: 'PUSH' },
      { pos: 5, cards: ['Q', '7'], total: 17, outcome: 'LOSS' },
      { pos: 6, cards: ['6', '9'], total: 15, outcome: 'LOSS' }
    ] },

  // Round 3
  { game: 301, round: 3, dealerUp: '8', dealerFinal: 21, dealerCards: ['8', '3', '10'],
    players: [{ pos: 1, cards: ['Q', '8'], total: 18, outcome: 'LOSS' }] },

  // Round 5
  { game: 301, round: 5, dealerUp: '3', dealerFinal: 21, dealerCards: ['3', '8', 'K'],
    players: [
      { pos: 1, cards: ['10', 'Q'], total: 20, outcome: 'LOSS' },
      { pos: 3, cards: ['9', 'Q'], total: 19, outcome: 'LOSS' },
      { pos: 6, cards: ['6', 'K'], total: 16, outcome: 'LOSS' }
    ] },

  // Round 10
  { game: 301, round: 10, dealerUp: '2', dealerFinal: 21, dealerCards: ['2', '9', 'K'],
    players: [
      { pos: 2, cards: ['7', '3', 'J'], total: 20, outcome: 'LOSS' },
      { pos: 3, cards: ['8', '4'], total: 12, outcome: 'LOSS' },
      { pos: 5, cards: ['5', 'Q'], total: 15, outcome: 'LOSS' },
      { pos: 6, cards: ['J', 'K'], total: 20, outcome: 'LOSS' }
    ] },

  // Round 15
  { game: 301, round: 15, dealerUp: 'Q', dealerFinal: 20, dealerCards: ['Q', 'K'],
    players: [
      { pos: 3, cards: ['5', '7', '5'], total: 17, outcome: 'LOSS' },
      { pos: 5, cards: ['2', 'Q', '2'], total: 14, outcome: 'LOSS' },
      { pos: 6, cards: ['8', '5', 'A', '7'], total: 21, outcome: 'WIN' }
    ] },

  // Round 20
  { game: 301, round: 20, dealerUp: '10', dealerFinal: 20, dealerCards: ['10', 'Q'],
    players: [
      { pos: 1, cards: ['9', '3', '10'], total: 22, outcome: 'LOSS' },
      { pos: 3, cards: ['3', 'K'], total: 13, outcome: 'LOSS' }
    ] },

  // Round 25
  { game: 301, round: 25, dealerUp: 'Q', dealerFinal: 17, dealerCards: ['Q', '7'],
    players: [{ pos: 6, cards: ['3', '4', 'Q'], total: 17, outcome: 'PUSH' }] },

  // ===== GAME #353 (19 rounds, +10,750 - HIGH CLUMP) =====
  // Round 1 (from clump analysis)
  { game: 353, round: 1, dealerUp: 'K', dealerFinal: 18, dealerCards: ['K', '8'],
    players: [
      { pos: 1, cards: ['3', 'J'], total: 13, outcome: 'LOSS' },
      { pos: 3, cards: ['8', '7'], total: 15, outcome: 'LOSS' },
      { pos: 5, cards: ['6', 'A', '3'], total: 20, outcome: 'WIN' },
      { pos: 6, cards: ['J', '4', 'K'], total: 24, outcome: 'LOSS' }
    ] },

  // ===== GAME #407 (25 rounds, -7,000 - HEAVY CLUMP) =====
  // Round 1 (extreme high clump: Q-A-K-K-A-10...Q-J-Q)
  { game: 407, round: 1, dealerUp: 'Q', dealerFinal: 19, dealerCards: ['Q', '7', '2'],
    players: [
      { pos: 1, cards: ['A', 'K'], total: 21, outcome: 'WIN' },
      { pos: 2, cards: ['K', 'A'], total: 21, outcome: 'WIN' },
      { pos: 3, cards: ['10', '7'], total: 17, outcome: 'LOSS' },
      { pos: 5, cards: ['3', '8'], total: 11, outcome: 'LOSS' },
      { pos: 6, cards: ['Q', 'J', 'Q'], total: 30, outcome: 'LOSS' }
    ] },

  // ===== GAME #358 (29 rounds, +6,750 - HEAVY CLUMP) =====
  { game: 358, round: 1, dealerUp: '6', dealerFinal: 26, dealerCards: ['6', 'J', 'K'],
    players: [
      { pos: 1, cards: ['9', '8'], total: 17, outcome: 'WIN' },
      { pos: 3, cards: ['7', 'Q'], total: 17, outcome: 'WIN' },
      { pos: 5, cards: ['4', '5', '10'], total: 19, outcome: 'WIN' }
    ] },

  // ===== ADDITIONAL ROUNDS FROM VARIOUS GAMES =====
  // Simulated rounds based on folder P&L data
  // Game #310 (-2000) - losing streak
  { game: 310, round: 1, dealerUp: '10', dealerFinal: 20, dealerCards: ['10', 'K'],
    players: [{ pos: 4, cards: ['8', '9'], total: 17, outcome: 'LOSS' }] },
  { game: 310, round: 2, dealerUp: 'A', dealerFinal: 21, dealerCards: ['A', 'Q'],
    players: [{ pos: 4, cards: ['J', '7'], total: 17, outcome: 'LOSS' }] },
  { game: 310, round: 3, dealerUp: '9', dealerFinal: 19, dealerCards: ['9', 'K'],
    players: [{ pos: 4, cards: ['6', '5', '7'], total: 18, outcome: 'LOSS' }] },

  // Game #314 (+750) - slight win
  { game: 314, round: 1, dealerUp: '5', dealerFinal: 25, dealerCards: ['5', '10', 'K'],
    players: [{ pos: 4, cards: ['10', '8'], total: 18, outcome: 'WIN' }] },
  { game: 314, round: 2, dealerUp: '6', dealerFinal: 22, dealerCards: ['6', '7', '9'],
    players: [{ pos: 4, cards: ['K', 'Q'], total: 20, outcome: 'WIN' }] },

  // Game #352 (+6250) - big win
  { game: 352, round: 1, dealerUp: '4', dealerFinal: 24, dealerCards: ['4', 'J', 'K'],
    players: [{ pos: 4, cards: ['9', 'A'], total: 20, outcome: 'WIN' }] },
  { game: 352, round: 2, dealerUp: '5', dealerFinal: 25, dealerCards: ['5', '8', 'Q'],
    players: [{ pos: 4, cards: ['K', 'J'], total: 20, outcome: 'WIN' }] },
  { game: 352, round: 3, dealerUp: '6', dealerFinal: 26, dealerCards: ['6', '10', 'K'],
    players: [{ pos: 4, cards: ['7', '7', '6'], total: 20, outcome: 'WIN' }] },

  // Game #365 (-6750) - big loss
  { game: 365, round: 1, dealerUp: '10', dealerFinal: 20, dealerCards: ['10', 'Q'],
    players: [{ pos: 4, cards: ['9', '8'], total: 17, outcome: 'LOSS' }] },
  { game: 365, round: 2, dealerUp: 'A', dealerFinal: 20, dealerCards: ['A', '9'],
    players: [{ pos: 4, cards: ['J', '6', '3'], total: 19, outcome: 'LOSS' }] },
  { game: 365, round: 3, dealerUp: 'K', dealerFinal: 20, dealerCards: ['K', 'Q'],
    players: [{ pos: 4, cards: ['10', '9'], total: 19, outcome: 'LOSS' }] },
];

module.exports = { historicalRounds };
