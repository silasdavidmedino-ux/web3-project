# Quant Extensions Bundle v1.3 (Player Advantage Stack)

This bundle is designed for **direct repo import**. It contains:
- /engines : new advantage engines + windowDetector implementation
- /ui : drop-in HTML card snippet + CSS + JS wiring helpers
- /utils : deterministic RNG helper (optional but recommended)
- /docs : integration guidance

## Integration Steps (Recommended)

### 1) Add UI Cards
Paste `ui/advantage_cards.html` into your main `index.html` near your existing dashboard cards.

### 2) Add Styles
Merge `ui/advantage_styles.css` into your main `styles.css` (append is fine).

### 3) Wire the UI
Option A (recommended): import and use the helper module:
- Add to your app entry (app.js):
  - `import { wireAdvantageUI, renderAdvantage } from "./ui/advantage_wiring.js";`
  - call `wireAdvantageUI({ renderAll });` inside your `wire()` function
  - call `renderAdvantage(engineCache._lastEngineOutputs, engineCache);` after computing outputs in `renderAll()`
  - in replay rendering, call `renderAdvantage(snapshotOuts, engineCache);`

Option B: manually copy the functions from `ui/advantage_wiring.js` into app.js.

### 4) Add Config Fields
Ensure `getContext().config` contains the following keys:
- playersSeated, seatIndex, seatAlpha
- windowScoreThreshold
- cbsK, minDominantEV
- startBankroll, drawdownMax, kellyFraction
- handsPerHour, minProfitPerHour
- betFocus

### 5) Register Engines
Merge `engines/index.js` exports into your existing engine registry.
Enable toggles using `engines/engineManager.patch.md` as guidance.

### 6) Window Detector
Replace/merge your existing `windowDetector` with `engines/windowDetector.js` for advantage-aware decisions.

### 7) Dealer Upcard Learning Update Hook
On Pair settlement (WIN/LOSE), call:
- `updateDealerUpcardPairModel(engineCache, dealerUpRank, didWin)`
from `engines/dealerUpcardPairModel.js`.

## Notes
- The Seat Edge model is a conservative prototype multiplier (alpha). Replace with exact conditional seat depletion later.
- Deterministic RNG helper is included to support thesis-grade audit stability if you use Monte Carlo engines.

