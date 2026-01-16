// Engine registry (v1.3) — add these exports to your existing engines/index.js
export { computeSeatAdjustedPair } from "./seatAdjustedPair.js";
export { computeDealerUpcardPairModel, updateDealerUpcardPairModel } from "./dealerUpcardPairModel.js";
export { computeCBSFilter } from "./cbsFilter.js";
export { computePortfolioSelector } from "./portfolioSelector.js";
export { computeKellyGovernor } from "./kellyGovernor.js";
export { computeTemporalOptimizer } from "./temporalOptimizer.js";
export { computeWindowDetector } from "./windowDetector.js";
export { computeAntiClumpEngine, updateAdaptiveModel } from "./antiClumpEngine.js";
export {
  computeClumpingProbabilityEngine,
  getQuickClumpAction,
  getP3ClumpBoosterStrategy,
  getP4ClumpQuantEVStrategy,
  getP5ClumpSacrificeStrategy
} from "./clumpingProbabilityEngine.js";
