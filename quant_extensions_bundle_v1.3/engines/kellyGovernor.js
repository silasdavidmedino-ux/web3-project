export function computeKellyGovernor(context) {
  const bankroll = Number(context.roundState?.session?.bankroll ?? 0);
  const start = Number(context.config?.startBankroll ?? bankroll);
  const ddMax = Number(context.config?.drawdownMax ?? 0.2);
  const baseK = Number(context.config?.kellyFraction ?? 0.5);

  const peak = Math.max(start, Number(context.engineCache?.peakBankroll ?? bankroll));
  context.engineCache.peakBankroll = peak;

  const dd = peak > 0 ? (peak - bankroll) / peak : 0;

  let k = baseK;
  if (dd >= ddMax) k = baseK * 0.5;
  else if (dd >= ddMax*0.5) k = baseK * 0.75;

  return {
    engineId: "kellyGovernor",
    name: "Kelly Governor",
    phase: "bankroll",
    bankroll,
    peak,
    drawdown: dd,
    drawdownMax: ddMax,
    kellyFraction: k
  };
}
