export function computeSeatAdjustedPair(context) {
  const { shoeState, config } = context;

  const playersSeated = Math.max(1, Math.floor(Number(config?.playersSeated ?? 2)));
  const seatIndex = Math.max(
    1,
    Math.min(playersSeated, Math.floor(Number(config?.seatIndex ?? playersSeated)))
  );
  const N = Number(shoeState?.N ?? 0);
  if (N < 2) {
    return { engineId: "seatAdjustedPair", name: "Seat-Adjusted Any Pair (12:1)", p_base: null, p_adj: null, ev_adj: null, note: "Not enough cards" };
  }

  // Base probability of Any Pair in first two cards: sum_r (c_r/N)*((c_r-1)/(N-1))
  let pBase = 0;
  const rankLeft = shoeState?.rankLeft || {};
  for (const c of Object.values(rankLeft)) {
    const cc = Number(c || 0);
    if (cc >= 2) pBase += (cc / N) * ((cc - 1) / (N - 1));
  }

  // Seat effect (prototype approximation): later seats get a small multiplicative boost.
  const alpha = Number(config?.seatAlpha ?? 0.04);
  const denom = Math.max(1, (playersSeated - 1));
  const rel = (seatIndex - 1) / denom;
  const mult = 1 + alpha * rel;

  const pAdj = Math.max(0, Math.min(1, pBase * mult));
  // Any Pair at 12:1 => net profit +12 units on win, -1 on loss => EV = 12*p - (1-p) = 13p - 1
  const evAdj = 13 * pAdj - 1;

  return {
    engineId: "seatAdjustedPair",
    name: "Seat-Adjusted Any Pair (12:1)",
    phase: "pre-deal",
    playersSeated,
    seatIndex,
    alpha,
    p_base: pBase,
    p_adj: pAdj,
    mult,
    ev_adj: evAdj
  };
}
