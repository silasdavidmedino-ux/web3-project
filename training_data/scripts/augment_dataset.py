#!/usr/bin/env python3
"""
Dataset Augmentation Script for Card Detection/Classification
Expands dataset through various image augmentations.

Requirements:
    pip install albumentations opencv-python pillow

Usage:
    python augment_dataset.py <input_dir> <output_dir> [--multiplier 5]
"""

import cv2
import os
import argparse
import random
import numpy as np
from pathlib import Path

try:
    import albumentations as A
    ALBUMENTATIONS_AVAILABLE = True
except ImportError:
    ALBUMENTATIONS_AVAILABLE = False
    print("Warning: albumentations not installed. Using basic augmentations.")
    print("Install with: pip install albumentations")


def get_augmentation_pipeline():
    """Create augmentation pipeline for card images."""
    if not ALBUMENTATIONS_AVAILABLE:
        return None

    return A.Compose([
        # Geometric transforms
        A.Rotate(limit=15, p=0.5, border_mode=cv2.BORDER_REPLICATE),
        A.Perspective(scale=(0.02, 0.08), p=0.3),
        A.Affine(
            scale=(0.9, 1.1),
            translate_percent={"x": (-0.05, 0.05), "y": (-0.05, 0.05)},
            p=0.3
        ),

        # Color/brightness transforms
        A.RandomBrightnessContrast(
            brightness_limit=0.3,
            contrast_limit=0.3,
            p=0.5
        ),
        A.ColorJitter(
            brightness=0.2,
            contrast=0.2,
            saturation=0.2,
            hue=0.05,
            p=0.4
        ),
        A.HueSaturationValue(
            hue_shift_limit=10,
            sat_shift_limit=20,
            val_shift_limit=20,
            p=0.3
        ),

        # Noise and blur
        A.GaussNoise(var_limit=(10, 50), p=0.3),
        A.MotionBlur(blur_limit=5, p=0.2),
        A.GaussianBlur(blur_limit=3, p=0.2),

        # Compression artifacts (simulates video stream)
        A.ImageCompression(quality_lower=60, quality_upper=100, p=0.4),

        # Shadow and lighting
        A.RandomShadow(
            shadow_roi=(0, 0, 1, 1),
            shadow_dimension=5,
            p=0.2
        ),
    ])


def basic_augment(image):
    """Basic augmentation without albumentations library."""
    augmented = image.copy()
    h, w = image.shape[:2]

    # Random brightness
    if random.random() > 0.5:
        factor = random.uniform(0.7, 1.3)
        augmented = np.clip(augmented * factor, 0, 255).astype(np.uint8)

    # Random rotation
    if random.random() > 0.5:
        angle = random.uniform(-15, 15)
        M = cv2.getRotationMatrix2D((w/2, h/2), angle, 1.0)
        augmented = cv2.warpAffine(augmented, M, (w, h), borderMode=cv2.BORDER_REPLICATE)

    # Random blur
    if random.random() > 0.7:
        ksize = random.choice([3, 5])
        augmented = cv2.GaussianBlur(augmented, (ksize, ksize), 0)

    # Random noise
    if random.random() > 0.7:
        noise = np.random.normal(0, 15, augmented.shape).astype(np.int16)
        augmented = np.clip(augmented.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    # JPEG compression
    if random.random() > 0.5:
        quality = random.randint(60, 95)
        encode_param = [cv2.IMWRITE_JPEG_QUALITY, quality]
        _, enc = cv2.imencode('.jpg', augmented, encode_param)
        augmented = cv2.imdecode(enc, cv2.IMREAD_COLOR)

    return augmented


def augment_image(image, pipeline):
    """Apply augmentation to a single image."""
    if pipeline is not None:
        augmented = pipeline(image=image)
        return augmented['image']
    else:
        return basic_augment(image)


def augment_detection_dataset(input_dir, output_dir, multiplier=5):
    """
    Augment detection dataset (images + YOLO labels).

    Args:
        input_dir: Directory with images/ and labels/ subdirectories
        output_dir: Output directory
        multiplier: Number of augmented versions per image
    """
    images_dir = os.path.join(input_dir, 'images')
    labels_dir = os.path.join(input_dir, 'labels')

    if not os.path.exists(images_dir):
        print(f"Error: Images directory not found: {images_dir}")
        return

    os.makedirs(os.path.join(output_dir, 'images'), exist_ok=True)
    os.makedirs(os.path.join(output_dir, 'labels'), exist_ok=True)

    pipeline = get_augmentation_pipeline()
    image_files = [f for f in os.listdir(images_dir) if f.endswith(('.jpg', '.png', '.jpeg'))]

    print(f"Augmenting {len(image_files)} images with {multiplier}x multiplier...")

    total = 0
    for img_name in image_files:
        img_path = os.path.join(images_dir, img_name)
        image = cv2.imread(img_path)

        if image is None:
            continue

        base_name = os.path.splitext(img_name)[0]
        label_path = os.path.join(labels_dir, f"{base_name}.txt")

        # Copy original
        cv2.imwrite(os.path.join(output_dir, 'images', img_name), image)
        if os.path.exists(label_path):
            with open(label_path) as f:
                labels = f.read()
            with open(os.path.join(output_dir, 'labels', f"{base_name}.txt"), 'w') as f:
                f.write(labels)
        total += 1

        # Generate augmented versions
        for i in range(multiplier - 1):
            aug_image = augment_image(image, pipeline)
            aug_name = f"{base_name}_aug{i+1}.jpg"

            cv2.imwrite(
                os.path.join(output_dir, 'images', aug_name),
                aug_image,
                [cv2.IMWRITE_JPEG_QUALITY, 95]
            )

            # Copy labels (bounding boxes remain approximately valid for minor transforms)
            if os.path.exists(label_path):
                with open(label_path) as f:
                    labels = f.read()
                with open(os.path.join(output_dir, 'labels', f"{base_name}_aug{i+1}.txt"), 'w') as f:
                    f.write(labels)

            total += 1

        if total % 500 == 0:
            print(f"Generated {total} images...")

    print(f"\nComplete! Generated {total} images in {output_dir}")


def augment_classification_dataset(input_dir, output_dir, multiplier=5):
    """
    Augment classification dataset (folder-per-class structure).

    Args:
        input_dir: Directory with class subdirectories
        output_dir: Output directory
        multiplier: Number of augmented versions per image
    """
    pipeline = get_augmentation_pipeline()

    classes = [d for d in os.listdir(input_dir)
               if os.path.isdir(os.path.join(input_dir, d))]

    print(f"Found {len(classes)} classes")
    print(f"Augmenting with {multiplier}x multiplier...")

    total = 0
    for class_name in classes:
        class_input = os.path.join(input_dir, class_name)
        class_output = os.path.join(output_dir, class_name)
        os.makedirs(class_output, exist_ok=True)

        images = [f for f in os.listdir(class_input)
                  if f.endswith(('.jpg', '.png', '.jpeg'))]

        for img_name in images:
            img_path = os.path.join(class_input, img_name)
            image = cv2.imread(img_path)

            if image is None:
                continue

            base_name = os.path.splitext(img_name)[0]

            # Copy original
            cv2.imwrite(os.path.join(class_output, img_name), image)
            total += 1

            # Generate augmented versions
            for i in range(multiplier - 1):
                aug_image = augment_image(image, pipeline)
                aug_name = f"{base_name}_aug{i+1}.jpg"

                cv2.imwrite(
                    os.path.join(class_output, aug_name),
                    aug_image,
                    [cv2.IMWRITE_JPEG_QUALITY, 95]
                )
                total += 1

        print(f"  {class_name}: {len(images)} -> {len(images) * multiplier}")

    print(f"\nComplete! Generated {total} images in {output_dir}")


def main():
    parser = argparse.ArgumentParser(description="Augment card detection/classification dataset")
    parser.add_argument("input_dir", help="Input directory")
    parser.add_argument("output_dir", help="Output directory")
    parser.add_argument("--multiplier", type=int, default=5, help="Augmentation multiplier (default: 5)")
    parser.add_argument("--mode", choices=['detection', 'classification'], default='classification',
                        help="Dataset type (default: classification)")

    args = parser.parse_args()

    if args.mode == 'detection':
        augment_detection_dataset(args.input_dir, args.output_dir, args.multiplier)
    else:
        augment_classification_dataset(args.input_dir, args.output_dir, args.multiplier)


if __name__ == "__main__":
    main()
