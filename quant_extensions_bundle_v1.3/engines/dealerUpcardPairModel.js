const UP = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function normRank(tok){
  return String(tok||"").trim().toUpperCase().replace(/[SHDC]$/,"");
}

export function computeDealerUpcardPairModel(context) {
  const { engineCache, roundState } = context;

  if (!engineCache.pairUpcardModel) {
    engineCache.pairUpcardModel = {
      counts: Object.fromEntries(UP.map(u => [u, { n:0, wins:0 } ])),
      base: { n:0, wins:0 },
      priorN: 40,
      priorWinRate: 1/13
    };
  }

  const up = normRank(roundState?.dealer?.up);
  if (!UP.includes(up)) {
    return { engineId:"dealerUpcardPairModel", name:"Dealer Upcard Pair Multiplier (Learned)", upcard:null, multiplier:1, note:"No dealer upcard" };
  }

  const m = engineCache.pairUpcardModel;
  const baseWr = (m.base.n > 0) ? (m.base.wins / m.base.n) : m.priorWinRate;

  const cell = m.counts[up];
  const wr = (cell.n > 0) ? (cell.wins / cell.n) : m.priorWinRate;

  // Smoothed multiplier
  const postWr = (cell.wins + m.priorWinRate * m.priorN) / (cell.n + m.priorN);
  const postBase = (m.base.wins + m.priorWinRate * m.priorN) / (m.base.n + m.priorN);
  const mult = postBase > 0 ? (postWr / postBase) : 1;

  return {
    engineId: "dealerUpcardPairModel",
    name: "Dealer Upcard Pair Multiplier (Learned)",
    phase: "post-deal",
    upcard: up,
    baseWinRate: baseWr,
    upcardWinRate: wr,
    multiplier: mult,
    samplesUpcard: cell.n,
    samplesTotal: m.base.n
  };
}

// Call on pair settlement
export function updateDealerUpcardPairModel(engineCache, dealerUpRank, didWin) {
  if (!engineCache?.pairUpcardModel) return;
  const u = String(dealerUpRank||"").toUpperCase();
  if (!UP.includes(u)) return;

  const m = engineCache.pairUpcardModel;
  m.base.n += 1;
  if (didWin) m.base.wins += 1;

  m.counts[u].n += 1;
  if (didWin) m.counts[u].wins += 1;
}
