# Dataset Collection Plan
## Card Detection & Classification Training Data

**Project:** BJ Probability Engine - Autonomous Card Tracking
**Version:** 1.0
**Date:** January 11, 2026
**Target:** 10,000+ annotated card images

---

## 1. Dataset Requirements

### 1.1 Target Metrics

| Dataset | Images | Classes | Purpose |
|---------|--------|---------|---------|
| Card Detection | 5,000+ | 2 (card, card_back) | Bounding box detection |
| Card Classification | 10,000+ | 52 (2-A x 4 suits) | Rank/suit recognition |
| Table Landmarks | 1,000+ | 6 landmarks | Layout normalization |

### 1.2 Class Distribution (Card Classification)

```
Target: ~200 images per card class (52 classes x 200 = 10,400 images)

Ranks (13): 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A
Suits (4):  Spades (♠), Hearts (♥), Diamonds (♦), Clubs (♣)

Total Classes: 52 unique cards
- 2♠, 3♠, 4♠, 5♠, 6♠, 7♠, 8♠, 9♠, 10♠, J♠, Q♠, K♠, A♠
- 2♥, 3♥, 4♥, 5♥, 6♥, 7♥, 8♥, 9♥, 10♥, J♥, Q♥, K♥, A♥
- 2♦, 3♦, 4♦, 5♦, 6♦, 7♦, 8♦, 9♦, 10♦, J♦, Q♦, K♦, A♦
- 2♣, 3♣, 4♣, 5♣, 6♣, 7♣, 8♣, 9♣, 10♣, J♣, Q♣, K♣, A♣
```

---

## 2. Data Sources

### 2.1 Source Priority Matrix

| Source | Volume | Quality | Effort | Priority |
|--------|--------|---------|--------|----------|
| Live stream recordings | High | Realistic | Medium | P0 |
| Physical card photography | Medium | High | High | P1 |
| Existing public datasets | High | Variable | Low | P0 |
| Synthetic generation | Unlimited | Medium | Medium | P2 |

### 2.2 Source 1: Live Stream Recordings (P0)

**Method:** Record live blackjack streams and extract frames

**Target Streams:**
- Online casino live dealer streams
- YouTube blackjack gameplay videos
- Twitch casino streams

**Recording Protocol:**
```
Duration: 2-4 hours per session
Resolution: 1080p minimum
Frame rate: 30fps
Format: MP4 (H.264)

Extraction rate: 1 frame per card deal event
Expected yield: ~500-1000 card images per hour of footage
```

**Diversity Requirements:**
- [ ] 5+ different table layouts
- [ ] 3+ different deck designs (Bee, Bicycle, Casino custom)
- [ ] Various lighting conditions (bright, dim, mixed)
- [ ] Multiple camera angles

### 2.3 Source 2: Public Datasets (P0)

**Available Datasets:**

1. **Roboflow Universe - Playing Cards**
   - URL: https://universe.roboflow.com/search?q=playing+cards
   - ~10,000+ images available
   - Pre-annotated bounding boxes
   - Various deck styles

2. **Kaggle Playing Cards Dataset**
   - URL: https://www.kaggle.com/datasets/gpiosenern/playing-cards-dataset
   - ~10,000 images
   - Clean studio shots
   - Good for classification baseline

3. **Cards Image Dataset (Stanford)**
   - Isolated card images
   - Good for augmentation base

**Download Script:**
```bash
# Roboflow CLI
pip install roboflow
roboflow download cards-detection -f yolov8

# Kaggle CLI
kaggle datasets download -d gpiosenern/playing-cards-dataset
```

### 2.4 Source 3: Physical Card Photography (P1)

**Equipment:**
- Standard playing card decks (multiple designs)
- Smartphone camera (12MP+)
- Green felt or casino table surface
- Variable lighting setup

**Capture Protocol:**
```
Per Card:
- 5 angles (straight, 15° left, 15° right, 15° up, 15° down)
- 3 lighting conditions (bright, normal, dim)
- 2 backgrounds (green felt, dark felt)
- Total: 30 images per card x 52 cards = 1,560 base images

Augmentation multiplier: 5x
Final yield: ~7,800 images
```

### 2.5 Source 4: Synthetic Generation (P2)

**Method:** Programmatically generate card images

```python
# Synthetic card generator pseudocode
def generate_synthetic_cards():
    for rank in RANKS:
        for suit in SUITS:
            base_image = load_card_template(rank, suit)

            for _ in range(100):  # 100 variations per card
                augmented = apply_augmentations(base_image, [
                    random_rotation(-20, 20),
                    random_perspective(0.1),
                    random_brightness(0.7, 1.3),
                    random_blur(0, 3),
                    jpeg_compression(60, 95),
                    add_background(random_table_texture()),
                    add_noise(0, 0.05)
                ])
                save_image(augmented, f"{rank}_{suit}_{uuid()}.jpg")
```

---

## 3. Annotation Standards

### 3.1 Detection Annotation (YOLO Format)

**Format:** `class_id x_center y_center width height` (normalized 0-1)

**Example:**
```
# image001.txt
0 0.45 0.32 0.08 0.12   # card at center-left
0 0.62 0.35 0.07 0.11   # card at center-right
1 0.80 0.40 0.06 0.10   # card_back (face down)
```

**Class IDs:**
```
0: card_face (any visible card)
1: card_back (face down card)
```

### 3.2 Classification Annotation

**Format:** Folder structure with class names

```
dataset/
├── train/
│   ├── 2_spades/
│   │   ├── img001.jpg
│   │   ├── img002.jpg
│   │   └── ...
│   ├── 2_hearts/
│   ├── 2_diamonds/
│   ├── 2_clubs/
│   ├── 3_spades/
│   └── ... (52 folders)
├── val/
│   └── ... (same structure)
└── test/
    └── ... (same structure)
```

**Naming Convention:**
```
{rank}_{suit}/img{id}.jpg

Examples:
- 2_spades/img001.jpg
- 10_hearts/img042.jpg
- K_diamonds/img103.jpg
- A_clubs/img007.jpg
```

### 3.3 Landmark Annotation

**Format:** JSON keypoints

```json
{
  "image": "table001.jpg",
  "landmarks": {
    "chip_tray": [0.12, 0.45],
    "card_shoe": [0.88, 0.35],
    "discard_tray": [0.05, 0.30],
    "dealer_position": [0.50, 0.25],
    "player1_box": [0.25, 0.75],
    "player2_box": [0.50, 0.75],
    "player3_box": [0.75, 0.75]
  }
}
```

---

## 4. Collection Workflow

### 4.1 Phase 1: Quick Start (Days 1-3)

**Goal:** 2,000 images for initial model training

```
Day 1: Download public datasets
├── Roboflow cards dataset (~3,000 images)
├── Kaggle playing cards (~2,000 images)
└── Filter and deduplicate

Day 2: Record live streams
├── Record 2 hours of live blackjack
├── Extract frames at card deals
└── Target: 500-1000 images

Day 3: Initial annotation
├── Verify/fix bounding boxes
├── Organize into class folders
└── Split train/val/test (70/20/10)
```

### 4.2 Phase 2: Expansion (Days 4-7)

**Goal:** 5,000+ detection images, 10,000+ classification images

```
Day 4-5: Physical card photography
├── Photograph all 52 cards
├── Multiple angles and lighting
└── Target: 1,500+ images

Day 6: More stream recordings
├── Different table layouts
├── Different deck designs
└── Target: 1,000+ images

Day 7: Quality assurance
├── Review all annotations
├── Remove duplicates
├── Balance class distribution
```

### 4.3 Phase 3: Augmentation (Days 8-10)

**Goal:** 5x dataset expansion through augmentation

```python
# Augmentation pipeline
augmentation_pipeline = A.Compose([
    A.RandomRotate90(p=0.3),
    A.Rotate(limit=15, p=0.5),
    A.RandomBrightnessContrast(
        brightness_limit=0.3,
        contrast_limit=0.3,
        p=0.5
    ),
    A.GaussNoise(var_limit=(10, 50), p=0.3),
    A.MotionBlur(blur_limit=5, p=0.2),
    A.ImageCompression(quality_lower=60, quality_upper=100, p=0.3),
    A.Perspective(scale=(0.05, 0.1), p=0.3),
    A.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2,
        hue=0.1,
        p=0.5
    )
])
```

---

## 5. Directory Structure

```
C:\Users\davide\Desktop\BJ_PROBABILITY ENGINE APP\
└── training_data/
    ├── raw/
    │   ├── stream_recordings/
    │   │   ├── session_001/
    │   │   ├── session_002/
    │   │   └── ...
    │   ├── physical_photos/
    │   └── public_datasets/
    │
    ├── detection/
    │   ├── images/
    │   │   ├── train/
    │   │   ├── val/
    │   │   └── test/
    │   └── labels/
    │       ├── train/
    │       ├── val/
    │       └── test/
    │
    ├── classification/
    │   ├── train/
    │   │   ├── 2_spades/
    │   │   ├── 2_hearts/
    │   │   └── ... (52 folders)
    │   ├── val/
    │   └── test/
    │
    ├── landmarks/
    │   ├── images/
    │   └── annotations/
    │
    └── scripts/
        ├── extract_frames.py
        ├── augment_dataset.py
        ├── split_dataset.py
        └── validate_annotations.py
```

---

## 6. Tools & Software

### 6.1 Annotation Tools

| Tool | Purpose | URL |
|------|---------|-----|
| **CVAT** | Bounding box annotation | https://cvat.ai |
| **LabelImg** | YOLO format labeling | https://github.com/HumanSignal/labelImg |
| **Roboflow** | Auto-annotation + augmentation | https://roboflow.com |
| **Label Studio** | Multi-format annotation | https://labelstud.io |

### 6.2 Frame Extraction

```python
# extract_frames.py
import cv2
import os

def extract_frames(video_path, output_dir, interval_sec=0.5):
    """Extract frames from video at specified interval."""
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(fps * interval_sec)

    frame_count = 0
    saved_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            filename = f"frame_{saved_count:06d}.jpg"
            cv2.imwrite(os.path.join(output_dir, filename), frame)
            saved_count += 1

        frame_count += 1

    cap.release()
    print(f"Extracted {saved_count} frames from {video_path}")

# Usage
extract_frames("stream_recording.mp4", "raw/frames/", interval_sec=0.5)
```

### 6.3 Dataset Splitting

```python
# split_dataset.py
import os
import shutil
import random

def split_dataset(source_dir, output_dir, train=0.7, val=0.2, test=0.1):
    """Split dataset into train/val/test sets."""
    images = [f for f in os.listdir(source_dir) if f.endswith(('.jpg', '.png'))]
    random.shuffle(images)

    n = len(images)
    train_end = int(n * train)
    val_end = int(n * (train + val))

    splits = {
        'train': images[:train_end],
        'val': images[train_end:val_end],
        'test': images[val_end:]
    }

    for split_name, split_images in splits.items():
        split_dir = os.path.join(output_dir, split_name)
        os.makedirs(split_dir, exist_ok=True)

        for img in split_images:
            shutil.copy(
                os.path.join(source_dir, img),
                os.path.join(split_dir, img)
            )

            # Copy corresponding label file if exists
            label = img.rsplit('.', 1)[0] + '.txt'
            label_src = os.path.join(source_dir, label)
            if os.path.exists(label_src):
                shutil.copy(label_src, os.path.join(split_dir, label))

    print(f"Split complete: {len(splits['train'])} train, {len(splits['val'])} val, {len(splits['test'])} test")
```

---

## 7. Quality Assurance Checklist

### 7.1 Image Quality

- [ ] Resolution >= 640x480
- [ ] Card fully visible in frame
- [ ] No extreme blur (readable rank/suit)
- [ ] No severe occlusion (>70% visible)
- [ ] Proper exposure (not over/underexposed)

### 7.2 Annotation Quality

- [ ] Bounding box tightly fits card
- [ ] Correct class label assigned
- [ ] No duplicate annotations
- [ ] Consistent labeling across similar images

### 7.3 Dataset Balance

- [ ] Each class has minimum 100 samples
- [ ] No class has >3x average samples
- [ ] Train/val/test splits are stratified
- [ ] Diverse conditions in each split

### 7.4 Validation Script

```python
# validate_annotations.py
import os
from collections import Counter

def validate_dataset(dataset_dir):
    """Validate dataset quality and balance."""
    issues = []
    class_counts = Counter()

    for split in ['train', 'val', 'test']:
        split_dir = os.path.join(dataset_dir, split)
        if not os.path.exists(split_dir):
            issues.append(f"Missing split directory: {split}")
            continue

        for class_name in os.listdir(split_dir):
            class_dir = os.path.join(split_dir, class_name)
            if os.path.isdir(class_dir):
                count = len([f for f in os.listdir(class_dir) if f.endswith(('.jpg', '.png'))])
                class_counts[class_name] += count

                if count < 50:
                    issues.append(f"Low sample count: {class_name} has {count} images in {split}")

    # Check balance
    if class_counts:
        avg = sum(class_counts.values()) / len(class_counts)
        for cls, count in class_counts.items():
            if count < avg * 0.3:
                issues.append(f"Imbalanced class: {cls} has {count} samples (avg: {avg:.0f})")

    # Report
    print("=== Dataset Validation Report ===")
    print(f"Total classes: {len(class_counts)}")
    print(f"Total images: {sum(class_counts.values())}")
    print(f"Average per class: {sum(class_counts.values()) / max(len(class_counts), 1):.0f}")

    if issues:
        print(f"\n{len(issues)} Issues Found:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("\nNo issues found!")

    return issues

# Usage
validate_dataset("training_data/classification/")
```

---

## 8. Timeline & Milestones

### Week 1: Initial Collection

| Day | Task | Target | Status |
|-----|------|--------|--------|
| Day 1 | Download public datasets | 5,000 images | [ ] |
| Day 2 | Record stream session 1 | 1,000 frames | [ ] |
| Day 3 | Record stream session 2 | 1,000 frames | [ ] |
| Day 4 | Physical card photography | 1,500 images | [ ] |
| Day 5 | Initial annotation | 3,000 labeled | [ ] |
| Day 6 | Quality review | Remove bad samples | [ ] |
| Day 7 | First model test | Baseline accuracy | [ ] |

### Week 2: Expansion & Refinement

| Day | Task | Target | Status |
|-----|------|--------|--------|
| Day 8 | More stream recordings | 2,000 frames | [ ] |
| Day 9 | Augmentation pipeline | 5x expansion | [ ] |
| Day 10 | Balance classes | Equal distribution | [ ] |
| Day 11 | Final QA pass | 0 issues | [ ] |
| Day 12 | Dataset freeze | Version 1.0 | [ ] |

---

## 9. Immediate Action Items

### Today's Tasks

1. **Create directory structure**
   ```bash
   mkdir -p training_data/{raw,detection,classification,landmarks,scripts}
   mkdir -p training_data/raw/{stream_recordings,physical_photos,public_datasets}
   mkdir -p training_data/detection/{images,labels}/{train,val,test}
   ```

2. **Download Roboflow dataset**
   ```bash
   pip install roboflow
   # Get API key from roboflow.com
   ```

3. **Start stream recording**
   - Find 2-3 live blackjack streams
   - Record minimum 1 hour
   - Save as MP4 1080p

4. **Install annotation tool**
   ```bash
   pip install labelImg
   # or use CVAT online: https://cvat.ai
   ```

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Total images | 10,000+ | Count files |
| Classes covered | 52/52 | Folder count |
| Min samples per class | 100+ | Min count |
| Annotation accuracy | 99%+ | Manual review |
| Train/val/test split | 70/20/10 | Count ratio |

---

*Dataset Collection Plan v1.0*
*Tech Hive Corporation - BJ Probability Engine*
