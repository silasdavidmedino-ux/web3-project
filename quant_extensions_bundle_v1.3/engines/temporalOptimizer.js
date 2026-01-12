export function computeTemporalOptimizer(context) {
  const outs = context.engineCache?._lastEngineOutputs || {};
  const hph = Number(context.config?.handsPerHour ?? 120);

  const win = outs.windowDetector;
  const score = Number(win?.score ?? 50);
  const decision = win?.decision ?? "NO_BET";

  // Profit proxy: map score around 50 to small units/round
  const ppr = (score - 50) / 500;
  const pph = ppr * hph;

  const minPph = Number(context.config?.minProfitPerHour ?? 0.5);
  const exit = (decision !== "BET") && (pph < minPph);

  return {
    engineId: "temporalOptimizer",
    name: "Temporal Compression Optimizer",
    phase: "ops",
    handsPerHour: hph,
    score,
    decision,
    profitPerRoundProxy: ppr,
    profitPerHourProxy: pph,
    minProfitPerHour: minPph,
    recommendation: exit ? "EXIT_TABLE" : "STAY"
  };
}
