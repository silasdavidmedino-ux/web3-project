export function computeCBSFilter(context) {
  const cbsK = Number(context.config?.cbsK ?? 0.45);
  const minDominantEV = Number(context.config?.minDominantEV ?? 0.03);

  const pairs = context.roundState?.session?.pairBetLog || [];
  const n = pairs.length;

  let mean = 0, m2 = 0;
  for (let i=0;i<n;i++){
    const x = Number(pairs[i].profit || 0);
    const d = x - mean;
    mean += d/(i+1);
    m2 += d*(x-mean);
  }
  const varp = (n>1) ? (m2/(n-1)) : 0;
  const sigma = Math.sqrt(Math.max(0,varp));

  const dominance = (sigma * cbsK) + minDominantEV;

  return {
    engineId: "cbsFilter",
    name: "Conditional Bet Suppression",
    phase: "pre-deal",
    nSamples: n,
    sigma,
    cbsK,
    minDominantEV,
    dominanceThreshold: dominance
  };
}
