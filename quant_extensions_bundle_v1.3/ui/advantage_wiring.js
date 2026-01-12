// Player Advantage UI wiring (v1.3)
// This file is designed to be imported and called from your existing app.js.
//
// Required host functions/objects:
// - engineCache._lastEngineOutputs : map of engineId -> output object
// - renderAll() : triggers full recompute/render
// - $() helper: const $=(id)=>document.getElementById(id);
//
// Optional:
// - In replay mode, call renderAdvantage(outsMap)

export function fmtN(x, d=4) {
  if (x === null || x === undefined || !Number.isFinite(Number(x))) return "—";
  return Number(x).toFixed(d);
}
export function fmtPct(x, d=2) {
  if (x === null || x === undefined || !Number.isFinite(Number(x))) return "—";
  return (100 * Number(x)).toFixed(d) + "%";
}
export function setTxt(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

export function wireAdvantageUI({ renderAll }) {
  const btn = document.getElementById("btnAdvDefaults");
  if (btn) {
    btn.addEventListener("click", () => {
      document.getElementById("playersSeated").value = "2";
      document.getElementById("seatIndex").value = "2";
      document.getElementById("seatAlpha").value = "0.04";

      document.getElementById("windowScoreThreshold").value = "65";
      document.getElementById("cbsK").value = "0.45";
      document.getElementById("minDominantEV").value = "0.03";

      document.getElementById("startBankroll").value = "50000";
      document.getElementById("drawdownMax").value = "0.20";
      document.getElementById("kellyFraction").value = "0.50";

      document.getElementById("handsPerHourCfg").value = "120";
      document.getElementById("minProfitPerHour").value = "0.5";

      document.getElementById("betFocus").value = "ANY_PAIR_12";
      renderAll();
    });
  }

  [
    "playersSeated","seatIndex","seatAlpha",
    "windowScoreThreshold","cbsK","minDominantEV",
    "startBankroll","drawdownMax","kellyFraction",
    "handsPerHourCfg","minProfitPerHour","betFocus"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => renderAll());
  });
}

export function renderAdvantage(outsMap, engineCache) {
  const out = outsMap || engineCache?._lastEngineOutputs || {};

  const win = out.windowDetector || null;
  const seat = out.seatAdjustedPair || null;
  const up = out.dealerUpcardPairModel || null;
  const cbs = out.cbsFilter || null;
  const port = out.portfolioSelector || null;
  const kg = out.kellyGovernor || null;
  const tp = out.temporalOptimizer || null;

  setTxt("advDecision", win?.decision ?? "—");
  setTxt("advScore", win?.score !== undefined ? String(Math.round(win.score)) : "—");
  setTxt("advConf", win?.confidence !== undefined ? fmtPct(win.confidence, 1) : "—");
  setTxt("advBest", port?.best?.bet ?? "—");

  setTxt("apPBase", seat?.p_base !== undefined ? fmtPct(seat.p_base) : "—");
  setTxt("apSeatMult", seat?.mult !== undefined ? fmtN(seat.mult, 4) : "—");
  setTxt("apPAdj", seat?.p_adj !== undefined ? fmtPct(seat.p_adj) : "—");
  setTxt("apEVAdj", seat?.ev_adj !== undefined ? fmtN(seat.ev_adj, 4) : "—");

  setTxt("duUp", up?.upcard ?? "—");
  setTxt("duMult", up?.multiplier !== undefined ? fmtN(up.multiplier, 4) : "—");
  setTxt("duSamples", (up?.samplesUpcard !== undefined && up?.samplesTotal !== undefined)
    ? `${up.samplesUpcard}/${up.samplesTotal}`
    : "—");
  setTxt("duWr", (up?.upcardWinRate !== undefined && up?.baseWinRate !== undefined)
    ? `${fmtPct(up.upcardWinRate,2)} / ${fmtPct(up.baseWinRate,2)}`
    : "—");

  setTxt("cbsSigma", cbs?.sigma !== undefined ? fmtN(cbs.sigma, 4) : "—");
  setTxt("cbsDom", cbs?.dominanceThreshold !== undefined ? fmtN(cbs.dominanceThreshold, 4) : "—");
  setTxt("cbsPass", win?.signals?.passesCBS !== undefined ? String(!!win.signals.passesCBS) : "—");
  setTxt("cbsN", cbs?.nSamples !== undefined ? String(cbs.nSamples) : "—");

  setTxt("kgK", kg?.kellyFraction !== undefined ? fmtN(kg.kellyFraction, 3) : "—");
  setTxt("kgDD", kg?.drawdown !== undefined ? fmtPct(kg.drawdown, 2) : "—");
  setTxt("tpPH", tp?.profitPerHourProxy !== undefined ? fmtN(tp.profitPerHourProxy, 3) : "—");
  setTxt("tpReco", tp?.recommendation ?? "—");

  const debug = {
    windowDetector: win,
    seatAdjustedPair: seat,
    dealerUpcardPairModel: up,
    cbsFilter: cbs,
    kellyGovernor: kg,
    portfolioSelector: port,
    temporalOptimizer: tp
  };
  setTxt("advDump", JSON.stringify(debug, null, 2));
}
