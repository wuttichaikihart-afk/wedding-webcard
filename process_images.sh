#!/bin/bash
TARGET_DIR="/Users/warapornluanrit/Library/CloudStorage/OneDrive-ไลบรารีที่แชร์-onedrive/webcard/src/assets"
SRC_DIR="/Users/warapornluanrit/Library/CloudStorage/OneDrive-ไลบรารีที่แชร์-onedrive/งานแต่ง/ใช้ในเว็บ"

echo "Removing old pictures..."
rm -f "$TARGET_DIR"/pic*

COUNTER=1

# Process IMG_ files
echo "Processing IMG_ files..."
find "$SRC_DIR" -maxdepth 1 -iname "IMG_*.JPG" -print0 | sort -z | while IFS= read -r -d '' file; do
  echo "Processing $file -> pic${COUNTER}.jpg"
  sips -Z 1920 "$file" --out "$TARGET_DIR/pic${COUNTER}.jpg" > /dev/null
  COUNTER=$((COUNTER + 1))
done

# Process NO files
echo "Processing NO files..."
find "$SRC_DIR" -maxdepth 1 -iname "NO *.jpg" -print0 | sort -z | while IFS= read -r -d '' file; do
  echo "Processing $file -> pic${COUNTER}.jpg"
  sips -Z 1920 "$file" --out "$TARGET_DIR/pic${COUNTER}.jpg" > /dev/null
  COUNTER=$((COUNTER + 1))
done

echo "Done!"
