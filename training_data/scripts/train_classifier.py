#!/usr/bin/env python3
"""
Card Classification Model Training Script
Trains a CNN to classify 52 playing cards.

Usage:
    python train_classifier.py --data <dataset_dir> --epochs 50 --batch-size 32
"""

import os
import argparse
import json
from datetime import datetime
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from torch.optim.lr_scheduler import ReduceLROnPlateau

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")


def get_transforms(img_size=224):
    """Get training and validation transforms."""
    train_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(p=0.3),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform


class CardClassifier(nn.Module):
    """Card classification model based on MobileNetV3."""

    def __init__(self, num_classes=52, pretrained=True):
        super(CardClassifier, self).__init__()

        # Use MobileNetV3-Small for efficiency (good for edge deployment)
        self.backbone = models.mobilenet_v3_small(
            weights='IMAGENET1K_V1' if pretrained else None
        )

        # Replace classifier head
        in_features = self.backbone.classifier[0].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.Hardswish(),
            nn.Dropout(p=0.3),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        return self.backbone(x)


class EfficientCardClassifier(nn.Module):
    """Lightweight custom CNN for card classification."""

    def __init__(self, num_classes=52):
        super(EfficientCardClassifier, self).__init__()

        self.features = nn.Sequential(
            # Block 1: 224 -> 112
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),

            # Block 2: 112 -> 56
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),

            # Block 3: 56 -> 28
            nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),

            # Block 4: 28 -> 14
            nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),

            # Block 5: 14 -> 7
            nn.Conv2d(256, 512, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),

            # Global Average Pooling
            nn.AdaptiveAvgPool2d(1)
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(p=0.3),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.2),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


def train_epoch(model, loader, criterion, optimizer, epoch, total_epochs):
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (inputs, targets) in enumerate(loader):
        inputs, targets = inputs.to(device), targets.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += targets.size(0)
        correct += predicted.eq(targets).sum().item()

        if (batch_idx + 1) % 50 == 0:
            print(f'  Batch {batch_idx+1}/{len(loader)} - '
                  f'Loss: {loss.item():.4f} - '
                  f'Acc: {100.*correct/total:.2f}%')

    epoch_loss = running_loss / len(loader)
    epoch_acc = 100. * correct / total
    return epoch_loss, epoch_acc


def validate(model, loader, criterion):
    """Validate the model."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for inputs, targets in loader:
            inputs, targets = inputs.to(device), targets.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, targets)

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

    val_loss = running_loss / len(loader)
    val_acc = 100. * correct / total
    return val_loss, val_acc


def save_checkpoint(model, optimizer, epoch, val_acc, class_names, save_path):
    """Save model checkpoint."""
    checkpoint = {
        'epoch': epoch,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'val_acc': val_acc,
        'class_names': class_names,
        'num_classes': len(class_names)
    }
    torch.save(checkpoint, save_path)
    print(f"  Checkpoint saved: {save_path}")


def export_onnx(model, save_path, img_size=224):
    """Export model to ONNX format for web deployment."""
    model.eval()
    dummy_input = torch.randn(1, 3, img_size, img_size).to(device)

    torch.onnx.export(
        model,
        dummy_input,
        save_path,
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    print(f"ONNX model exported: {save_path}")


def main():
    parser = argparse.ArgumentParser(description='Train card classifier')
    parser.add_argument('--data', type=str, required=True, help='Dataset directory')
    parser.add_argument('--epochs', type=int, default=50, help='Number of epochs')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    parser.add_argument('--lr', type=float, default=0.001, help='Learning rate')
    parser.add_argument('--img-size', type=int, default=224, help='Input image size')
    parser.add_argument('--model', choices=['mobilenet', 'custom'], default='mobilenet',
                        help='Model architecture')
    parser.add_argument('--output', type=str, default='models', help='Output directory')
    parser.add_argument('--resume', type=str, help='Resume from checkpoint')

    args = parser.parse_args()

    # Create output directory
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Get transforms
    train_transform, val_transform = get_transforms(args.img_size)

    # Load datasets
    print(f"\nLoading dataset from: {args.data}")
    print("This may take a moment...", flush=True)
    train_dir = os.path.join(args.data, 'train')
    val_dir = os.path.join(args.data, 'val')

    print(f"Loading training data from: {train_dir}", flush=True)
    train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
    print(f"Loading validation data from: {val_dir}", flush=True)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transform)
    print("Datasets loaded!", flush=True)

    pin_mem = torch.cuda.is_available()
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size,
                              shuffle=True, num_workers=0, pin_memory=pin_mem)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size,
                            shuffle=False, num_workers=0, pin_memory=pin_mem)

    class_names = train_dataset.classes
    num_classes = len(class_names)

    print(f"Classes: {num_classes}")
    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")

    # Save class mapping
    class_map_path = output_dir / 'class_names.json'
    with open(class_map_path, 'w') as f:
        json.dump({i: name for i, name in enumerate(class_names)}, f, indent=2)
    print(f"Class mapping saved: {class_map_path}")

    # Create model
    print(f"\nCreating {args.model} model...")
    if args.model == 'mobilenet':
        model = CardClassifier(num_classes=num_classes, pretrained=True)
    else:
        model = EfficientCardClassifier(num_classes=num_classes)

    model = model.to(device)

    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=0.01)
    scheduler = ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=5)

    # Resume from checkpoint
    start_epoch = 0
    best_acc = 0.0

    if args.resume:
        print(f"Resuming from: {args.resume}")
        checkpoint = torch.load(args.resume, map_location=device)
        model.load_state_dict(checkpoint['model_state_dict'])
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        start_epoch = checkpoint['epoch'] + 1
        best_acc = checkpoint.get('val_acc', 0.0)

    # Training loop
    print(f"\n{'='*60}")
    print(f"TRAINING STARTED")
    print(f"{'='*60}")

    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}

    for epoch in range(start_epoch, args.epochs):
        print(f"\nEpoch {epoch+1}/{args.epochs}")
        print("-" * 40)

        # Train
        train_loss, train_acc = train_epoch(
            model, train_loader, criterion, optimizer, epoch, args.epochs
        )

        # Validate
        val_loss, val_acc = validate(model, val_loader, criterion)

        # Update scheduler
        scheduler.step(val_acc)

        # Log results
        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%")

        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)

        # Save best model
        if val_acc > best_acc:
            best_acc = val_acc
            save_checkpoint(
                model, optimizer, epoch, val_acc, class_names,
                output_dir / 'best_model.pth'
            )

        # Save periodic checkpoint
        if (epoch + 1) % 10 == 0:
            save_checkpoint(
                model, optimizer, epoch, val_acc, class_names,
                output_dir / f'checkpoint_epoch_{epoch+1}.pth'
            )

    # Save final model
    save_checkpoint(
        model, optimizer, args.epochs - 1, val_acc, class_names,
        output_dir / 'final_model.pth'
    )

    # Export to ONNX
    print("\nExporting to ONNX...")
    export_onnx(model, output_dir / 'card_classifier.onnx', args.img_size)

    # Save training history
    history_path = output_dir / 'training_history.json'
    with open(history_path, 'w') as f:
        json.dump(history, f, indent=2)

    print(f"\n{'='*60}")
    print(f"TRAINING COMPLETE")
    print(f"{'='*60}")
    print(f"Best Validation Accuracy: {best_acc:.2f}%")
    print(f"Models saved to: {output_dir}")
    print(f"\nFiles:")
    print(f"  - best_model.pth (PyTorch checkpoint)")
    print(f"  - card_classifier.onnx (Web deployment)")
    print(f"  - class_names.json (Class mapping)")
    print(f"  - training_history.json (Training logs)")


if __name__ == '__main__':
    main()
