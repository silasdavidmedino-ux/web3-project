#!/usr/bin/env python3
"""
Rename Kaggle dataset class folders to standard naming convention.

Converts: "ace of clubs" -> "A_clubs"
"""

import os
import shutil
import argparse

# Mapping from Kaggle names to our standard format
NAME_MAP = {
    'ace': 'A',
    'two': '2',
    'three': '3',
    'four': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8',
    'nine': '9',
    'ten': '10',
    'jack': 'J',
    'queen': 'Q',
    'king': 'K',
    'joker': 'joker'  # Will be excluded
}

def convert_name(kaggle_name):
    """Convert 'ace of clubs' to 'A_clubs'."""
    parts = kaggle_name.lower().split(' of ')
    if len(parts) != 2:
        return None  # Skip joker or invalid names

    rank_word, suit = parts
    rank = NAME_MAP.get(rank_word)

    if rank is None or rank == 'joker':
        return None

    return f"{rank}_{suit}"

def rename_dataset(input_dir, output_dir=None):
    """Rename all class folders in dataset."""

    if output_dir is None:
        output_dir = input_dir + "_renamed"

    splits = ['train', 'valid', 'test']

    for split in splits:
        split_dir = os.path.join(input_dir, split)
        if not os.path.exists(split_dir):
            print(f"Skipping {split} (not found)")
            continue

        out_split = os.path.join(output_dir, split)
        os.makedirs(out_split, exist_ok=True)

        renamed = 0
        skipped = 0

        for old_name in os.listdir(split_dir):
            old_path = os.path.join(split_dir, old_name)
            if not os.path.isdir(old_path):
                continue

            new_name = convert_name(old_name)

            if new_name is None:
                print(f"  Skipping: {old_name}")
                skipped += 1
                continue

            new_path = os.path.join(out_split, new_name)

            # Copy all images
            os.makedirs(new_path, exist_ok=True)
            for img in os.listdir(old_path):
                if img.lower().endswith(('.jpg', '.jpeg', '.png')):
                    shutil.copy2(
                        os.path.join(old_path, img),
                        os.path.join(new_path, img)
                    )

            renamed += 1

        print(f"{split}: Renamed {renamed} classes, skipped {skipped}")

    print(f"\nOutput saved to: {output_dir}")

def main():
    parser = argparse.ArgumentParser(description="Rename Kaggle dataset classes")
    parser.add_argument("input_dir", help="Kaggle dataset directory")
    parser.add_argument("--output", "-o", help="Output directory (default: input_renamed)")

    args = parser.parse_args()
    rename_dataset(args.input_dir, args.output)

if __name__ == "__main__":
    main()
