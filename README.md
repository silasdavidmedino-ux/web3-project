# BJ Probability Engine v1.3.0

**Professional-grade Blackjack Probability & Player Advantage PWA**

Developed by Tech Hive Corporation

---

## Overview

BJ Probability Engine is a comprehensive Progressive Web Application (PWA) designed for professional blackjack analysis. It provides real-time probability calculations, seat-adjusted advantage modeling, and sophisticated bet decision algorithms.

## Features

### Core Probability Engines
- **Any Pair Calculator** - Base probability and EV calculations for Any Pair side bets
- **Perfect Pair Calculator** - Same-suit pair probability modeling
- **21+3 Side Bet Engine** - Flush, straight, three-of-a-kind probabilities

### Advanced Advantage System (v1.3)
- **Seat-Adjusted Pair Model** - Position-based edge multipliers
- **Dealer Upcard Conditioning** - Bayesian learning model for dealer upcard impact
- **Conditional Bet Suppression (CBS)** - Volatility-based bet filtering
- **Portfolio Selector** - Multi-bet opportunity optimization
- **Kelly Governor** - Drawdown-aware bankroll management
- **Temporal Optimizer** - Profit/hour analysis and table exit recommendations
- **Window Detector** - Aggregated BET/NO_BET decision engine

### PWA Capabilities
- Offline functionality via Service Worker
- Installable on desktop and mobile devices
- Local storage for sessions and snapshots
- Responsive design for all screen sizes

---

## Project Structure

```
BJ_PROBABILITY ENGINE APP/
├── index.html                 # Main application shell
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker
├── README.md                  # This file
│
├── css/
│   └── styles.css             # Comprehensive stylesheet
│
├── js/
│   └── app.js                 # Main application logic
│
├── icons/
│   ├── icon.svg               # Source SVG icon
│   ├── generate-icons.html    # Icon generation utility
│   └── icon-*.png             # PWA icons (various sizes)
│
└── quant_extensions_bundle_v1.3/
    ├── docs/
    │   └── README.md          # Integration guide
    ├── engines/
    │   ├── index.js           # Engine exports
    │   ├── seatAdjustedPair.js
    │   ├── dealerUpcardPairModel.js
    │   ├── cbsFilter.js
    │   ├── portfolioSelector.js
    │   ├── kellyGovernor.js
    │   ├── temporalOptimizer.js
    │   └── windowDetector.js
    ├── ui/
    │   ├── advantage_cards.html
    │   ├── advantage_styles.css
    │   └── advantage_wiring.js
    └── utils/
        └── rng.js             # Deterministic RNG
```

---

## Getting Started

### Local Development

1. **Serve the application** using any static file server:
   ```bash
   # Using Python
   python -m http.server 8080

   # Using Node.js
   npx serve

   # Using PHP
   php -S localhost:8080
   ```

2. **Open in browser**: Navigate to `http://localhost:8080`

### Generate PWA Icons

1. Open `icons/generate-icons.html` in a browser
2. Click "Generate All Icons"
3. Download each icon and save to the `/icons` folder

### Install as PWA

1. Open the app in Chrome, Edge, or Safari
2. Click the install prompt or use browser menu
3. App will be available offline and on your home screen

---

## Configuration

### Shoe Configuration
| Parameter | Default | Description |
|-----------|---------|-------------|
| Number of Decks | 6 | Decks in shoe (1-8) |
| Penetration Target | 75% | Target shoe depth |
| Any Pair Payout | 12:1 | Side bet payout |

### Advantage Parameters
| Parameter | Default | Description |
|-----------|---------|-------------|
| Players Seated | 2 | Players at table |
| Seat Index | 2 | Your position |
| Seat Alpha | 0.04 | Edge multiplier cap |
| Window Threshold | 65 | BET decision threshold |
| CBS K | 0.45 | Suppression sigma factor |
| Kelly Fraction | 0.50 | Base Kelly sizing |
| Drawdown Max | 0.20 | Max drawdown tolerance |

---

## Engine Pipeline

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Shoe State     │───▶│  Base Engines   │───▶│  Advantage      │
│  (Card Counts)  │    │  (Probabilities)│    │  Engines        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                       ┌──────────────────────────────┘
                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Window         │───▶│  Temporal       │───▶│  Final          │
│  Detector       │    │  Optimizer      │    │  Decision       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New Session |
| `Ctrl+S` | Create Snapshot |
| `Escape` | Close Modals |

---

## Data Storage

- **Session data** - Stored in memory, exportable as CSV
- **Snapshots** - Persisted to localStorage
- **Settings** - Persisted to localStorage
- **History** - Optional localStorage persistence

---

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

---

## API Reference

### AppState Object
```javascript
{
  session: { id, bankroll, rounds, ... },
  shoeState: { N, rankLeft, cardsDealt, ... },
  roundState: { roundNum, dealer, ... },
  config: { ... },
  engineCache: { _lastEngineOutputs, ... }
}
```

### Engine Output Structure
Each engine returns:
```javascript
{
  engineId: string,
  name: string,
  phase: "pre-deal" | "post-deal" | "bankroll" | "ops",
  // ... engine-specific outputs
}
```

---

## License

Proprietary - Tech Hive Corporation

---

## Version History

- **v1.3.0** - Full PWA implementation with integrated advantage engines
- **v1.2.0** - Added quantitative extensions bundle
- **v1.1.0** - Base probability engines
- **v1.0.0** - Initial release

---

*BJ Probability Engine - Professional Blackjack Analysis*
*Tech Hive Corporation*
