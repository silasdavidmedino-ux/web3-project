#!/bin/bash
# Convert PNG icons to WebP and AVIF formats
# Requires: cwebp (WebP), avifenc (AVIF)
# Install: brew install webp libavif (macOS) or apt install webp libavif-bin (Linux)

ICONS_DIR="icons"
OUTPUT_DIR="icons"

echo "🖼️  Converting icons to modern formats..."

# Check if tools are available
if ! command -v cwebp &> /dev/null; then
    echo "⚠️  cwebp not found. Install with: brew install webp"
    HAS_WEBP=false
else
    HAS_WEBP=true
fi

if ! command -v avifenc &> /dev/null; then
    echo "⚠️  avifenc not found. Install with: brew install libavif"
    HAS_AVIF=false
else
    HAS_AVIF=true
fi

# Convert each PNG to WebP and AVIF
for png in $ICONS_DIR/*.png; do
    if [ -f "$png" ]; then
        filename=$(basename "$png" .png)

        # Convert to WebP (lossy, quality 80)
        if [ "$HAS_WEBP" = true ]; then
            cwebp -q 80 "$png" -o "$OUTPUT_DIR/${filename}.webp" 2>/dev/null
            echo "✅ Created ${filename}.webp"
        fi

        # Convert to AVIF (lossy, quality 60 = smaller file)
        if [ "$HAS_AVIF" = true ]; then
            avifenc "$png" "$OUTPUT_DIR/${filename}.avif" --min 20 --max 60 2>/dev/null
            echo "✅ Created ${filename}.avif"
        fi
    fi
done

# Show file size comparison
echo ""
echo "📊 File Size Comparison:"
echo "------------------------"
for png in $ICONS_DIR/*.png; do
    if [ -f "$png" ]; then
        filename=$(basename "$png" .png)
        png_size=$(wc -c < "$png")

        webp_file="$OUTPUT_DIR/${filename}.webp"
        avif_file="$OUTPUT_DIR/${filename}.avif"

        echo -n "$filename: PNG=${png_size}B"

        if [ -f "$webp_file" ]; then
            webp_size=$(wc -c < "$webp_file")
            savings=$(( (png_size - webp_size) * 100 / png_size ))
            echo -n " | WebP=${webp_size}B (-${savings}%)"
        fi

        if [ -f "$avif_file" ]; then
            avif_size=$(wc -c < "$avif_file")
            savings=$(( (png_size - avif_size) * 100 / png_size ))
            echo -n " | AVIF=${avif_size}B (-${savings}%)"
        fi

        echo ""
    fi
done

echo ""
echo "🎉 Done! Update manifest.json to use WebP/AVIF with PNG fallback."
