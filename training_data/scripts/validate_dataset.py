#!/usr/bin/env python3
"""
Dataset Validation Script
Validates dataset quality, balance, and annotation correctness.

Usage:
    python validate_dataset.py <dataset_dir> [--mode classification|detection]
"""

import os
import argparse
import json
from collections import Counter
from pathlib import Path

# Card class definitions
RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
SUITS = ['spades', 'hearts', 'diamonds', 'clubs']
EXPECTED_CLASSES = [f"{r}_{s}" for r in RANKS for s in SUITS]  # 52 classes


def validate_classification_dataset(dataset_dir, min_samples=50):
    """
    Validate classification dataset structure and balance.

    Expected structure:
    dataset_dir/
    ├── train/
    │   ├── 2_spades/
    │   ├── 2_hearts/
    │   └── ...
    ├── val/
    └── test/
    """
    issues = []
    warnings = []
    stats = {
        'total_images': 0,
        'splits': {},
        'class_counts': Counter(),
        'missing_classes': [],
        'empty_classes': [],
        'imbalanced_classes': []
    }

    splits = ['train', 'val', 'test']

    for split in splits:
        split_dir = os.path.join(dataset_dir, split)
        if not os.path.exists(split_dir):
            issues.append(f"Missing split directory: {split}")
            continue

        stats['splits'][split] = {'classes': 0, 'images': 0, 'class_counts': Counter()}

        for class_name in os.listdir(split_dir):
            class_dir = os.path.join(split_dir, class_name)
            if not os.path.isdir(class_dir):
                continue

            images = [f for f in os.listdir(class_dir)
                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            count = len(images)

            stats['splits'][split]['classes'] += 1
            stats['splits'][split]['images'] += count
            stats['splits'][split]['class_counts'][class_name] = count
            stats['class_counts'][class_name] += count
            stats['total_images'] += count

            # Check for issues
            if count == 0:
                issues.append(f"Empty class: {split}/{class_name}")
                stats['empty_classes'].append(f"{split}/{class_name}")
            elif count < min_samples:
                warnings.append(f"Low samples: {split}/{class_name} has {count} images (min: {min_samples})")

    # Check for missing classes
    found_classes = set(stats['class_counts'].keys())
    for expected in EXPECTED_CLASSES:
        if expected not in found_classes:
            stats['missing_classes'].append(expected)
            issues.append(f"Missing class: {expected}")

    # Check class balance
    if stats['class_counts']:
        counts = list(stats['class_counts'].values())
        avg = sum(counts) / len(counts)
        for cls, count in stats['class_counts'].items():
            if count < avg * 0.3:
                stats['imbalanced_classes'].append((cls, count, avg))
                warnings.append(f"Imbalanced: {cls} has {count} samples (avg: {avg:.0f})")

    return issues, warnings, stats


def validate_detection_dataset(dataset_dir):
    """
    Validate detection dataset (YOLO format).

    Expected structure:
    dataset_dir/
    ├── images/
    │   ├── train/
    │   ├── val/
    │   └── test/
    └── labels/
        ├── train/
        ├── val/
        └── test/
    """
    issues = []
    warnings = []
    stats = {
        'total_images': 0,
        'total_labels': 0,
        'splits': {},
        'missing_labels': [],
        'invalid_labels': [],
        'class_distribution': Counter()
    }

    splits = ['train', 'val', 'test']

    for split in splits:
        images_dir = os.path.join(dataset_dir, 'images', split)
        labels_dir = os.path.join(dataset_dir, 'labels', split)

        if not os.path.exists(images_dir):
            issues.append(f"Missing images directory: images/{split}")
            continue

        stats['splits'][split] = {
            'images': 0,
            'labels': 0,
            'missing_labels': [],
            'boxes': 0
        }

        images = [f for f in os.listdir(images_dir)
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

        for img_name in images:
            stats['splits'][split]['images'] += 1
            stats['total_images'] += 1

            base_name = os.path.splitext(img_name)[0]
            label_path = os.path.join(labels_dir, f"{base_name}.txt")

            if not os.path.exists(label_path):
                stats['splits'][split]['missing_labels'].append(img_name)
                stats['missing_labels'].append(f"{split}/{img_name}")
            else:
                stats['splits'][split]['labels'] += 1
                stats['total_labels'] += 1

                # Validate label format
                try:
                    with open(label_path) as f:
                        lines = f.readlines()

                    for line in lines:
                        parts = line.strip().split()
                        if len(parts) == 5:
                            class_id = int(parts[0])
                            x, y, w, h = map(float, parts[1:])

                            # Validate coordinates
                            if not (0 <= x <= 1 and 0 <= y <= 1 and 0 <= w <= 1 and 0 <= h <= 1):
                                stats['invalid_labels'].append(f"{split}/{base_name}.txt: Invalid coordinates")

                            stats['class_distribution'][class_id] += 1
                            stats['splits'][split]['boxes'] += 1
                        elif len(parts) > 0:
                            stats['invalid_labels'].append(f"{split}/{base_name}.txt: Invalid format")

                except Exception as e:
                    stats['invalid_labels'].append(f"{split}/{base_name}.txt: {str(e)}")

        if stats['splits'][split]['missing_labels']:
            warnings.append(f"{split}: {len(stats['splits'][split]['missing_labels'])} images missing labels")

    return issues, warnings, stats


def print_report(issues, warnings, stats, mode):
    """Print validation report."""
    print("\n" + "=" * 60)
    print("DATASET VALIDATION REPORT")
    print("=" * 60)

    print(f"\nMode: {mode.upper()}")
    print(f"Total Images: {stats['total_images']}")

    # Split summary
    print("\n--- SPLIT SUMMARY ---")
    for split, data in stats.get('splits', {}).items():
        if mode == 'classification':
            print(f"  {split}: {data['images']} images, {data['classes']} classes")
        else:
            print(f"  {split}: {data['images']} images, {data['labels']} labels, {data['boxes']} boxes")

    # Class distribution
    if mode == 'classification':
        print(f"\n--- CLASS DISTRIBUTION ---")
        print(f"  Total classes: {len(stats['class_counts'])}/52")
        if stats['class_counts']:
            counts = list(stats['class_counts'].values())
            print(f"  Min samples: {min(counts)}")
            print(f"  Max samples: {max(counts)}")
            print(f"  Avg samples: {sum(counts) / len(counts):.0f}")
    else:
        print(f"\n--- CLASS DISTRIBUTION ---")
        for class_id, count in sorted(stats.get('class_distribution', {}).items()):
            label = ['card_face', 'card_back'][class_id] if class_id < 2 else f'class_{class_id}'
            print(f"  {label}: {count} boxes")

    # Issues
    if issues:
        print(f"\n--- ISSUES ({len(issues)}) ---")
        for issue in issues[:20]:  # Show first 20
            print(f"  [ERROR] {issue}")
        if len(issues) > 20:
            print(f"  ... and {len(issues) - 20} more")

    # Warnings
    if warnings:
        print(f"\n--- WARNINGS ({len(warnings)}) ---")
        for warning in warnings[:20]:  # Show first 20
            print(f"  [WARN] {warning}")
        if len(warnings) > 20:
            print(f"  ... and {len(warnings) - 20} more")

    # Summary
    print("\n--- SUMMARY ---")
    if not issues and not warnings:
        print("  Dataset is VALID")
    elif not issues:
        print(f"  Dataset is VALID with {len(warnings)} warnings")
    else:
        print(f"  Dataset has {len(issues)} ISSUES and {len(warnings)} warnings")

    print("=" * 60 + "\n")


def save_report(issues, warnings, stats, output_path):
    """Save validation report as JSON."""
    report = {
        'issues': issues,
        'warnings': warnings,
        'stats': {
            'total_images': stats['total_images'],
            'splits': stats.get('splits', {}),
            'class_counts': dict(stats.get('class_counts', {})),
            'missing_classes': stats.get('missing_classes', []),
            'empty_classes': stats.get('empty_classes', []),
        }
    }

    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)

    print(f"Report saved to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Validate card detection/classification dataset")
    parser.add_argument("dataset_dir", help="Dataset directory")
    parser.add_argument("--mode", choices=['classification', 'detection'], default='classification',
                        help="Dataset type (default: classification)")
    parser.add_argument("--min-samples", type=int, default=50,
                        help="Minimum samples per class (default: 50)")
    parser.add_argument("--output", help="Save report to JSON file")

    args = parser.parse_args()

    if args.mode == 'classification':
        issues, warnings, stats = validate_classification_dataset(
            args.dataset_dir, args.min_samples
        )
    else:
        issues, warnings, stats = validate_detection_dataset(args.dataset_dir)

    print_report(issues, warnings, stats, args.mode)

    if args.output:
        save_report(issues, warnings, stats, args.output)


if __name__ == "__main__":
    main()
