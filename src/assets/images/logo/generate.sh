#!/bin/bash
# Generate icons in different sizes
# Inkscape and ImageMagick are required
img="logo.svg"
inkscape --export-png="16x16.png" -w 16 -h 16 $img
convert "16x16.png" "favicon.ico"
rm -f "16x16.png"
