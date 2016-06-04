#!/bin/bash
# Generate icons in different sizes
# Inkscape and ImageMagick are required

img="logo.svg"

# For Chrome Extension

for size in 16 48 128
do
  inkscape --export-png="${size}x${size}.png" -w $size -h $size $img
done

convert "128x128.png" "scalable.ico"

# For Web App (favicon)

convert "16x16.png" "favicon.ico"

# For Android App

rm -rf android
sizes=( m h xh xxh )
i=0
for size in 48 72 96 144
do
  dir="android/mipmap-${sizes[$i]}dpi"
  mkdir -p $dir 2>/dev/null
  inkscape --export-png="$dir/ic_launcher.png" -w $size -h $size $img
  i=$((i+1))
done
