#!/usr/bin/env python3
"""
Setup Classification Folder Structure
Creates the 52-class folder structure for card classification dataset.

Usage:
    python setup_class_folders.py <output_dir>
"""

import os
import argparse

RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
SUITS = ['spades', 'hearts', 'diamonds', 'clubs']
SUIT_SYMBOLS = {'spades': '♠', 'hearts': '♥', 'diamonds': '♦', 'clubs': '♣'}


def create_class_folders(output_dir):
    """Create folder structure for 52 card classes."""

    splits = ['train', 'val', 'test']
    total_folders = 0

    for split in splits:
        split_dir = os.path.join(output_dir, split)
        os.makedirs(split_dir, exist_ok=True)

        for rank in RANKS:
            for suit in SUITS:
                class_name = f"{rank}_{suit}"
                class_dir = os.path.join(split_dir, class_name)
                os.makedirs(class_dir, exist_ok=True)
                total_folders += 1

    print(f"Created {total_folders} class folders in {output_dir}")
    print(f"\nStructure:")
    print(f"  {output_dir}/")
    print(f"  ├── train/  (52 class folders)")
    print(f"  ├── val/    (52 class folders)")
    print(f"  └── test/   (52 class folders)")

    # Print class list
    print(f"\nClasses ({len(RANKS) * len(SUITS)} total):")
    for suit in SUITS:
        classes = [f"{r}_{suit}" for r in RANKS]
        symbol = SUIT_SYMBOLS[suit]
        print(f"  {suit.capitalize()} {symbol}: {', '.join(classes)}")


def create_readme(output_dir):
    """Create README with instructions."""
    readme = f"""# Card Classification Dataset

## Structure

```
{os.path.basename(output_dir)}/
├── train/           # 70% of data
│   ├── 2_spades/
│   ├── 2_hearts/
│   ├── 2_diamonds/
│   ├── 2_clubs/
│   ├── 3_spades/
│   │   └── ... (52 class folders)
│   └── A_clubs/
├── val/             # 20% of data
│   └── ... (same structure)
└── test/            # 10% of data
    └── ... (same structure)
```

## Classes (52 total)

| Rank | Spades | Hearts | Diamonds | Clubs |
|------|--------|--------|----------|-------|
| 2    | 2_spades | 2_hearts | 2_diamonds | 2_clubs |
| 3    | 3_spades | 3_hearts | 3_diamonds | 3_clubs |
| 4    | 4_spades | 4_hearts | 4_diamonds | 4_clubs |
| 5    | 5_spades | 5_hearts | 5_diamonds | 5_clubs |
| 6    | 6_spades | 6_hearts | 6_diamonds | 6_clubs |
| 7    | 7_spades | 7_hearts | 7_diamonds | 7_clubs |
| 8    | 8_spades | 8_hearts | 8_diamonds | 8_clubs |
| 9    | 9_spades | 9_hearts | 9_diamonds | 9_clubs |
| 10   | 10_spades | 10_hearts | 10_diamonds | 10_clubs |
| J    | J_spades | J_hearts | J_diamonds | J_clubs |
| Q    | Q_spades | Q_hearts | Q_diamonds | Q_clubs |
| K    | K_spades | K_hearts | K_diamonds | K_clubs |
| A    | A_spades | A_hearts | A_diamonds | A_clubs |

## Image Requirements

- Format: JPG or PNG
- Resolution: 64x64 minimum (will be resized)
- Content: Single card, clearly visible rank and suit
- Quality: Readable, minimal blur

## Target

- Minimum 100 images per class
- Total: 5,200+ images minimum
- Recommended: 200+ images per class (10,400+ total)

## Naming Convention

```
{{rank}}_{{suit}}/img{{id}}.jpg

Examples:
- 2_spades/img001.jpg
- 10_hearts/img042.jpg
- K_diamonds/img103.jpg
- A_clubs/img007.jpg
```
"""

    readme_path = os.path.join(output_dir, 'README.md')
    with open(readme_path, 'w') as f:
        f.write(readme)

    print(f"\nCreated README.md with instructions")


def main():
    parser = argparse.ArgumentParser(description="Setup card classification folder structure")
    parser.add_argument("output_dir", help="Output directory for dataset")
    parser.add_argument("--no-readme", action="store_true", help="Skip README creation")

    args = parser.parse_args()

    create_class_folders(args.output_dir)

    if not args.no_readme:
        create_readme(args.output_dir)


if __name__ == "__main__":
    main()
