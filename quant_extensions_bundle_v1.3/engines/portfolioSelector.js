function pickBest(candidates){
  const ok = candidates.filter(x => x && typeof x.ev === "number" && Number.isFinite(x.ev));
  ok.sort((a,b)=> (b.score - a.score));
  return ok[0] || null;
}

export function computePortfolioSelector(context) {
  const outs = context.engineCache?._lastEngineOutputs || {};

  const seat = outs.seatAdjustedPair;
  const anyPair = outs.anyPair12;
  const t213 = outs.t21p3;

  const candidates = [];

  if (seat?.ev_adj !== undefined && seat?.ev_adj !== null) {
    const ev = Number(seat.ev_adj);
    candidates.push({ bet:"ANY_PAIR_12", ev, score: ev });
  } else if (anyPair?.ev_pair !== undefined && anyPair?.ev_pair !== null) {
    const ev = Number(anyPair.ev_pair);
    candidates.push({ bet:"ANY_PAIR_12", ev, score: ev });
  }

  if (t213?.ev !== undefined && t213?.ev !== null) {
    const ev = Number(t213.ev);
    candidates.push({ bet:"21P3", ev, score: ev });
  }

  const best = pickBest(candidates);

  return {
    engineId: "portfolioSelector",
    name: "Portfolio Selector",
    phase: "pre-deal",
    best,
    candidates
  };
}
