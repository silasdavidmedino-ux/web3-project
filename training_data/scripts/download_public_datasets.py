#!/usr/bin/env python3
"""
Download Public Card Datasets
Downloads and prepares public playing card datasets.

Requirements:
    pip install roboflow kaggle requests

Usage:
    python download_public_datasets.py <output_dir>
"""

import os
import sys
import argparse
import zipfile
import shutil
from pathlib import Path

# Check for required packages
def check_dependencies():
    missing = []
    try:
        import requests
    except ImportError:
        missing.append('requests')

    if missing:
        print(f"Missing dependencies: {', '.join(missing)}")
        print(f"Install with: pip install {' '.join(missing)}")
        return False
    return True


def download_file(url, output_path):
    """Download file from URL with progress."""
    import requests

    print(f"Downloading: {url}")
    response = requests.get(url, stream=True)
    total = int(response.headers.get('content-length', 0))

    with open(output_path, 'wb') as f:
        downloaded = 0
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
            if total:
                pct = downloaded * 100 // total
                print(f"\r  Progress: {pct}%", end='', flush=True)

    print()
    return output_path


def download_roboflow_dataset(output_dir, api_key=None):
    """
    Download card dataset from Roboflow Universe.

    Note: Requires Roboflow API key for some datasets.
    Free datasets can be downloaded without API key.
    """
    print("\n=== Roboflow Dataset ===")

    try:
        from roboflow import Roboflow
    except ImportError:
        print("Roboflow not installed. Install with: pip install roboflow")
        print("Skipping Roboflow download...")
        return False

    if not api_key:
        print("No Roboflow API key provided.")
        print("Get free API key at: https://roboflow.com")
        print("Then run: python download_public_datasets.py <output_dir> --roboflow-key YOUR_KEY")
        return False

    try:
        rf = Roboflow(api_key=api_key)

        # Download cards detection dataset
        project = rf.workspace("augmented-startups").project("playing-cards-ow27d")
        dataset = project.version(4).download("yolov8", location=os.path.join(output_dir, "roboflow_cards"))

        print(f"Downloaded to: {output_dir}/roboflow_cards")
        return True

    except Exception as e:
        print(f"Roboflow download failed: {e}")
        return False


def download_kaggle_dataset(output_dir, dataset_name="gpiosenka/cards-image-datasetclassification"):
    """
    Download card dataset from Kaggle.

    Note: Requires Kaggle API credentials in ~/.kaggle/kaggle.json
    """
    print("\n=== Kaggle Dataset ===")

    try:
        import kaggle
    except ImportError:
        print("Kaggle not installed. Install with: pip install kaggle")
        print("Skipping Kaggle download...")
        return False

    kaggle_creds = os.path.expanduser("~/.kaggle/kaggle.json")
    if not os.path.exists(kaggle_creds):
        print("Kaggle credentials not found.")
        print("1. Go to: https://www.kaggle.com/account")
        print("2. Create API Token")
        print(f"3. Save to: {kaggle_creds}")
        return False

    try:
        kaggle_dir = os.path.join(output_dir, "kaggle_cards")
        os.makedirs(kaggle_dir, exist_ok=True)

        kaggle.api.dataset_download_files(
            dataset_name,
            path=kaggle_dir,
            unzip=True
        )

        print(f"Downloaded to: {kaggle_dir}")
        return True

    except Exception as e:
        print(f"Kaggle download failed: {e}")
        return False


def download_github_dataset(output_dir):
    """Download card dataset from GitHub repositories."""
    import requests

    print("\n=== GitHub Datasets ===")

    datasets = [
        {
            'name': 'Playing Cards (Simplified)',
            'url': 'https://github.com/EdjeElectronics/TensorFlow-Lite-Object-Detection-on-Android-and-Raspberry-Pi/raw/master/training_images.zip',
            'type': 'zip'
        }
    ]

    github_dir = os.path.join(output_dir, "github_cards")
    os.makedirs(github_dir, exist_ok=True)

    for dataset in datasets:
        print(f"\nDownloading: {dataset['name']}")
        try:
            zip_path = os.path.join(github_dir, f"{dataset['name'].replace(' ', '_')}.zip")
            download_file(dataset['url'], zip_path)

            # Extract
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(github_dir)

            os.remove(zip_path)
            print(f"  Extracted to: {github_dir}")

        except Exception as e:
            print(f"  Failed: {e}")

    return True


def create_download_instructions(output_dir):
    """Create manual download instructions."""
    instructions = """# Manual Dataset Download Instructions

Since automatic download may fail due to authentication or rate limits,
here are manual download instructions:

## 1. Roboflow Universe (Recommended)

1. Go to: https://universe.roboflow.com/search?q=playing+cards
2. Find "Playing Cards Object Detection" dataset
3. Click "Download" > "YOLOv8" format
4. Extract to: training_data/raw/public_datasets/roboflow_cards/

Recommended datasets:
- https://universe.roboflow.com/augmented-startups/playing-cards-ow27d
- https://universe.roboflow.com/card-detection-iujza/cards-52-classes

## 2. Kaggle

1. Go to: https://www.kaggle.com/datasets/gpiosenka/cards-image-datasetclassification
2. Click "Download" (requires free account)
3. Extract to: training_data/raw/public_datasets/kaggle_cards/

Alternative datasets:
- https://www.kaggle.com/datasets/jaypradipshah/the-complete-playing-card-dataset
- https://www.kaggle.com/datasets/gpiosenern/playing-cards-dataset

## 3. Direct Links (No Auth Required)

Some smaller datasets available directly:

### Playing Cards Detection Dataset
- URL: https://github.com/EdjeElectronics/TensorFlow-Lite-Object-Detection-on-Android-and-Raspberry-Pi
- Contains: Training images with annotations

### Card Sprites
- URL: https://code.google.com/archive/p/vector-playing-cards/
- Contains: Clean vector card images (good for synthetic data)

## 4. Generate Synthetic Data

If you have a clean deck of card images:

1. Place base card images in: training_data/raw/card_templates/
2. Run: python scripts/generate_synthetic.py

This will create augmented versions with various:
- Backgrounds (table felt textures)
- Lighting conditions
- Perspective transforms
- Compression artifacts

## After Download

1. Organize into class folders:
   ```
   python scripts/setup_class_folders.py training_data/classification/
   ```

2. Validate dataset:
   ```
   python scripts/validate_dataset.py training_data/classification/
   ```

3. Augment if needed:
   ```
   python scripts/augment_dataset.py training_data/classification/ training_data/classification_augmented/
   ```
"""

    instructions_path = os.path.join(output_dir, "DOWNLOAD_INSTRUCTIONS.md")
    with open(instructions_path, 'w') as f:
        f.write(instructions)

    print(f"\nCreated download instructions: {instructions_path}")


def main():
    parser = argparse.ArgumentParser(description="Download public card datasets")
    parser.add_argument("output_dir", help="Output directory for datasets")
    parser.add_argument("--roboflow-key", help="Roboflow API key")
    parser.add_argument("--skip-kaggle", action="store_true", help="Skip Kaggle download")
    parser.add_argument("--skip-github", action="store_true", help="Skip GitHub download")

    args = parser.parse_args()

    if not check_dependencies():
        sys.exit(1)

    os.makedirs(args.output_dir, exist_ok=True)

    print("=" * 50)
    print("PUBLIC DATASET DOWNLOADER")
    print("=" * 50)

    # Roboflow
    if args.roboflow_key:
        download_roboflow_dataset(args.output_dir, args.roboflow_key)
    else:
        print("\n[Roboflow] Skipped - no API key provided")

    # Kaggle
    if not args.skip_kaggle:
        download_kaggle_dataset(args.output_dir)

    # GitHub
    if not args.skip_github:
        download_github_dataset(args.output_dir)

    # Create instructions
    create_download_instructions(args.output_dir)

    print("\n" + "=" * 50)
    print("Download complete!")
    print("See DOWNLOAD_INSTRUCTIONS.md for manual download options")
    print("=" * 50)


if __name__ == "__main__":
    main()
