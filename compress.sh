#!/bin/bash
DIR="/Users/warapornluanrit/Library/CloudStorage/OneDrive-ไลบรารีที่แชร์-onedrive/webcard/src/assets"

echo "Compressing pic_no_112.jpg..."
sips -Z 1920 -s formatOptions 75 "$DIR/pic_no_112.jpg" --out "$DIR/pic_no_112.jpg" > /dev/null

echo "Compressing gallery images..."
for f in "$DIR"/pic[0-9]*.jpg; do
  sips -Z 1600 -s formatOptions 75 "$f" --out "$f" > /dev/null
done

echo "Compressing main cover..."
sips -Z 1920 -s formatOptions 75 "$DIR/main_cover.JPG" --out "$DIR/main_cover.JPG" > /dev/null

echo "Done"
