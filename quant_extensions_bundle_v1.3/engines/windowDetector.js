export function computeWindowDetector(context){
  const outs = context.engineCache?._lastEngineOutputs || {};

  const seat = outs.seatAdjustedPair;
  const anyPair = outs.anyPair12;
  const upModel = outs.dealerUpcardPairModel;
  const cbs = outs.cbsFilter;
  const port = outs.portfolioSelector;
  const t213 = outs.t21p3;
  const kgov = outs.kellyGovernor;

  // Prefer seat-adjusted EV
  let evPair = (seat?.ev_adj ?? anyPair?.ev_pair ?? null);
  let pPair  = (seat?.p_adj ?? anyPair?.p_pair ?? null);

  // Apply dealer upcard multiplier if available
  const mult = upModel?.multiplier ?? 1;
  if (evPair !== null && evPair !== undefined) evPair = evPair * mult;

  // 21+3
  const ev213 = (t213?.ev ?? null);

  // Base score components
  let scoreDelta = 0;
  if (evPair !== null && evPair !== undefined) scoreDelta += Math.max(-30, Math.min(40, evPair * 120));
  if (ev213 !== null && ev213 !== undefined) scoreDelta += Math.max(-30, Math.min(45, ev213 * 50));

  // CBS dominance threshold
  const dom = (cbs?.dominanceThreshold ?? null);
  const passesCBS = (dom === null || evPair === null || evPair === undefined) ? true : (evPair > dom);

  // Portfolio pick
  const best = port?.best?.bet ?? null;
  const bestEV = port?.best?.ev ?? null;

  // Kelly governor scaling (confidence)
  const k = kgov?.kellyFraction ?? 0.5;
  const conf = Math.max(0.4, Math.min(1.0, 0.4 + 0.6 * k));

  let score = (50 + scoreDelta) * conf;
  score = Math.max(0, Math.min(100, score));

  const threshold = Number(context.config?.windowScoreThreshold ?? 65);
  const hasPos = (bestEV !== null && bestEV !== undefined && bestEV > 0);

  let decision = "NO_BET";
  if (hasPos && score >= threshold) decision = "BET";

  // Focus policy
  const focus = String(context.config?.betFocus ?? "ANY_PAIR_12");
  if (decision === "BET") {
    if (focus === "ANY_PAIR_12" && best !== "ANY_PAIR_12") decision = "NO_BET";
    if (focus === "BEST_PORTFOLIO") {
      // allow any best bet
    }
  }

  if (!passesCBS) decision = "NO_BET";

  return {
    engineId:"windowDetector",
    name:"Profit Window Detector",
    score,
    threshold,
    decision,
    confidence: conf,
    signals: {
      best,
      bestEV,
      evPair,
      pPair,
      dealerUpMult: mult,
      cbsThreshold: dom,
      passesCBS,
      kellyFraction: k,
      betFocus: focus
    }
  };
}
