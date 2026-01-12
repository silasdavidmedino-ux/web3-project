#!/usr/bin/env python3
"""
Frame Extraction Script for Card Detection Dataset
Extracts frames from video recordings at specified intervals.

Usage:
    python extract_frames.py <video_path> <output_dir> [--interval 0.5]
"""

import cv2
import os
import argparse
from datetime import datetime

def extract_frames(video_path, output_dir, interval_sec=0.5, max_frames=None):
    """
    Extract frames from video at specified interval.

    Args:
        video_path: Path to video file
        output_dir: Directory to save extracted frames
        interval_sec: Seconds between frame extractions
        max_frames: Maximum number of frames to extract (None for all)
    """
    if not os.path.exists(video_path):
        print(f"Error: Video file not found: {video_path}")
        return 0

    os.makedirs(output_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video: {video_path}")
        return 0

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0

    print(f"Video: {video_path}")
    print(f"FPS: {fps:.2f}, Total Frames: {total_frames}, Duration: {duration:.2f}s")

    frame_interval = int(fps * interval_sec) if fps > 0 else 1
    print(f"Extracting every {frame_interval} frames ({interval_sec}s interval)")

    frame_count = 0
    saved_count = 0
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            if max_frames and saved_count >= max_frames:
                break

            filename = f"frame_{timestamp}_{saved_count:06d}.jpg"
            filepath = os.path.join(output_dir, filename)
            cv2.imwrite(filepath, frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
            saved_count += 1

            if saved_count % 100 == 0:
                print(f"Extracted {saved_count} frames...")

        frame_count += 1

    cap.release()
    print(f"\nComplete! Extracted {saved_count} frames to {output_dir}")
    return saved_count


def extract_motion_frames(video_path, output_dir, threshold=30, min_area=5000):
    """
    Extract frames only when motion (card dealing) is detected.

    Args:
        video_path: Path to video file
        output_dir: Directory to save extracted frames
        threshold: Pixel difference threshold for motion detection
        min_area: Minimum changed pixels to trigger extraction
    """
    if not os.path.exists(video_path):
        print(f"Error: Video file not found: {video_path}")
        return 0

    os.makedirs(output_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video: {video_path}")
        return 0

    ret, prev_frame = cap.read()
    if not ret:
        return 0

    prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    prev_gray = cv2.GaussianBlur(prev_gray, (21, 21), 0)

    frame_count = 0
    saved_count = 0
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    cooldown = 0

    print("Extracting frames with motion detection...")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        cooldown = max(0, cooldown - 1)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        # Compute difference
        diff = cv2.absdiff(prev_gray, gray)
        _, thresh = cv2.threshold(diff, threshold, 255, cv2.THRESH_BINARY)
        motion_area = cv2.countNonZero(thresh)

        # Save frame if motion detected and not in cooldown
        if motion_area > min_area and cooldown == 0:
            filename = f"motion_{timestamp}_{saved_count:06d}.jpg"
            filepath = os.path.join(output_dir, filename)
            cv2.imwrite(filepath, frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
            saved_count += 1
            cooldown = 15  # Skip next 15 frames (0.5s at 30fps)

            if saved_count % 50 == 0:
                print(f"Extracted {saved_count} motion frames...")

        prev_gray = gray

    cap.release()
    print(f"\nComplete! Extracted {saved_count} motion frames to {output_dir}")
    return saved_count


def main():
    parser = argparse.ArgumentParser(description="Extract frames from video for dataset collection")
    parser.add_argument("video_path", help="Path to video file")
    parser.add_argument("output_dir", help="Output directory for frames")
    parser.add_argument("--interval", type=float, default=0.5, help="Seconds between extractions (default: 0.5)")
    parser.add_argument("--max", type=int, default=None, help="Maximum frames to extract")
    parser.add_argument("--motion", action="store_true", help="Use motion detection mode")

    args = parser.parse_args()

    if args.motion:
        extract_motion_frames(args.video_path, args.output_dir)
    else:
        extract_frames(args.video_path, args.output_dir, args.interval, args.max)


if __name__ == "__main__":
    main()
