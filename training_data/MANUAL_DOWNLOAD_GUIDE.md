# Manual Dataset Download Guide

Since the Roboflow Python package has compatibility issues with Python 3.14, please download datasets manually using the steps below.

---

## Recommended Roboflow Datasets

### 1. Playing Cards by Augmented Startups (BEST - 10,100 images)
**URL:** https://universe.roboflow.com/augmented-startups/playing-cards-ow27d

**Steps:**
1. Open the URL in your browser
2. Click "Download Dataset" button
3. Select format: **YOLOv8** (for detection) or **Folder** (for classification)
4. Download the ZIP file
5. Extract to: `training_data/raw/public_datasets/roboflow_cards/`

### 2. Playing Cards Detection (6,680 images)
**URL:** https://universe.roboflow.com/playcardsdetection/playing-cards-detection

**Steps:**
1. Open the URL in your browser
2. Click "Download Dataset"
3. Select **YOLOv8** format
4. Extract to: `training_data/raw/public_datasets/roboflow_detection/`

### 3. Cards 52 Classes (Comprehensive)
**URL:** https://universe.roboflow.com/card-detection-iujza/cards-52-classes

**Steps:**
1. Open URL
2. Download in YOLOv8 format
3. Extract to: `training_data/raw/public_datasets/cards_52/`

---

## Kaggle Datasets (Alternative)

### Cards Image Dataset Classification
**URL:** https://www.kaggle.com/datasets/gpiosenka/cards-image-datasetclassification

**Steps:**
1. Create free Kaggle account
2. Download dataset (7,624 images of 53 classes)
3. Extract to: `training_data/raw/public_datasets/kaggle_cards/`

---

## After Download - Processing Steps

### 1. Validate the dataset
```bash
python training_data/scripts/validate_dataset.py training_data/raw/public_datasets/roboflow_cards --mode detection
```

### 2. For classification, setup folder structure
```bash
python training_data/scripts/setup_class_folders.py training_data/classification
```

### 3. Augment the dataset (5x multiplier)
```bash
python training_data/scripts/augment_dataset.py training_data/classification training_data/classification_augmented --multiplier 5
```

---

## Expected Folder Structure After Download

```
training_data/
├── raw/
│   └── public_datasets/
│       ├── roboflow_cards/        <- Primary dataset
│       │   ├── train/
│       │   │   ├── images/
│       │   │   └── labels/
│       │   ├── valid/
│       │   └── test/
│       ├── roboflow_detection/    <- Secondary detection set
│       ├── cards_52/              <- 52-class dataset
│       └── kaggle_cards/          <- Kaggle alternative
├── classification/
│   ├── train/
│   │   ├── 2_spades/
│   │   ├── 2_hearts/
│   │   └── ... (52 classes)
│   ├── val/
│   └── test/
└── scripts/
    ├── augment_dataset.py
    ├── validate_dataset.py
    └── setup_class_folders.py
```

---

## Quick Links Summary

| Dataset | Images | Format | URL |
|---------|--------|--------|-----|
| Augmented Startups | 10,100 | YOLO | [Link](https://universe.roboflow.com/augmented-startups/playing-cards-ow27d) |
| Playing Cards Detection | 6,680 | YOLO | [Link](https://universe.roboflow.com/playcardsdetection/playing-cards-detection) |
| Cards 52 Classes | 4,000+ | YOLO | [Link](https://universe.roboflow.com/card-detection-iujza/cards-52-classes) |
| Kaggle Cards | 7,624 | Folders | [Link](https://www.kaggle.com/datasets/gpiosenka/cards-image-datasetclassification) |

**Total potential images: 28,000+** (before augmentation)

---

## Notes

- Roboflow Universe allows free downloads (may require free account)
- YOLOv8 format is preferred for object detection training
- Folder/Classification format is preferred for CNN classifier training
- After download, use augmentation script to expand dataset 5x
