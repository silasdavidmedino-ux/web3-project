# BJ Probability Engine - Card Tracking Roadblocks & Issues

**Version:** v3.9.22
**Date:** January 11, 2026
**Stream Source:** Local Capture (Screen Capture API)

---

## 1. COCO-SSD Model Limitation

```javascript
// COCO-SSD doesn't have playing cards in its training data
// For production, you'd load a custom-trained card detection model
```

- The AI model (COCO-SSD) was trained on general objects, **NOT playing cards**
- Cannot reliably detect/classify card ranks (2-10, J, Q, K, A)
- Had to fall back to **color/pattern-based detection** instead

**Status:** Workaround implemented (pattern detection fallback)

---

## 2. Zone Calibration Issues

```javascript
dealingZone: { x: 0.44, y: 0.38, w: 0.06, h: 0.08 } // LOCKED: Table 5
```

- Detection zone had to be **manually calibrated** for each table/stream
- Different camera angles = different zone coordinates
- Required trial-and-error to find the sweet spot

**Status:** Manual calibration required per table

---

## 3. Duplicate Card Detection

```javascript
cardCooldown: 1500, // ms between card detections to avoid duplicates
regionCooldown: 1500, // ms before same region can detect again
trackingCooldown: 2000, // ms before same card can be tracked again
```

- Same card detected **multiple times** as it moves/stays visible
- Had to implement multiple cooldown systems to prevent duplicates
- Balance between catching new cards vs. ignoring the same card

**Status:** Fixed with cooldown timers

---

## 4. Detection Speed vs. Accuracy Trade-off

```javascript
confidenceThreshold: 0.50, // Lowered for better detection
detectionInterval: 150, // FASTER - 150ms between detections
```

- Higher confidence = **missed cards**
- Lower confidence = **false positives**
- Had to tune interval for speed without CPU overload

**Status:** Tunable via settings

---

## 5. Motion Detection Sensitivity

```javascript
motionThreshold: 30, // Pixel change threshold
minMotionArea: 500, // Minimum changed pixels to trigger detection
```

- Too sensitive = detects background noise
- Too insensitive = misses card placements
- Lighting changes triggered false motion

**Status:** Requires environment-specific tuning

---

## 6. Card Size/Aspect Ratio Variance

```javascript
minCardWidth: 30,
minCardHeight: 40,
cardAspectRatioMin: 0.6,
cardAspectRatioMax: 0.85,
```

- Cards appear different sizes based on camera zoom/distance
- Rotation affects aspect ratio detection
- Had to use wide range to catch cards at different angles

**Status:** Wide tolerance range implemented

---

## 7. Red vs. Black Card Classification

```javascript
cardPatterns: {
  red: { hMin: 0, hMax: 10, sMin: 100, vMin: 100 },
  black: { hMin: 0, hMax: 180, sMin: 0, sMax: 50, vMin: 0, vMax: 100 }
}
```

- Color detection affected by **lighting conditions**
- Casino table felt color interferes with detection
- Required HSV color space conversion

**Status:** HSV-based detection implemented

---

## 8. TensorFlow.js Loading Failures

```javascript
if (typeof tf === 'undefined') {
  console.warn('TensorFlow.js not loaded, using fallback detection');
  AICardDetector.isModelLoaded = true;
  document.getElementById('aiModelName').textContent = 'Pattern';
  return;
}
```

- TensorFlow.js CDN sometimes fails to load
- Had to implement **fallback pattern-based detection**
- Graceful degradation when AI unavailable

**Status:** Fallback system in place

---

## 9. True Count Not Updating (FIXED)

- `calculateTrueCount()` was **overwritten by a second function definition**
- Second version used `LiveTracker` instead of `AppState`
- Fixed by using `getTrueCount().toFixed(2)` instead

**Status:** RESOLVED in v3.9.21

---

## Summary Table

| Issue | Severity | Status |
|-------|----------|--------|
| No trained card model | High | Workaround (pattern detection) |
| Zone calibration | Medium | Manual tuning required |
| Duplicate detection | High | Fixed (cooldown timers) |
| Speed vs. accuracy | Medium | Tunable thresholds |
| Lighting variance | Medium | HSV detection |
| TF.js load failures | Low | Fallback implemented |
| TC not updating | High | RESOLVED |

---

## Recommendations for Future Development

1. **Train Custom Card Detection Model**
   - Use YOLO or EfficientDet trained on playing card dataset
   - Target 95%+ accuracy on rank/suit classification

2. **Implement Auto-Zone Calibration**
   - Detect table edges automatically
   - Use dealer hand position as reference point

3. **Add Stream Source Options**
   - Support HLS/RTMP for remote streams
   - WebRTC for low-latency feeds

4. **Improve Lighting Compensation**
   - Auto white-balance adjustment
   - Histogram equalization for contrast

---

*Tech Hive Corporation - BJ Probability Engine*
