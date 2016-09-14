#!/bin/bash
# Generate icons in different sizes
# Inkscape and ImageMagick are required
img="logo.svg"
inkscape --export-png="favicon.png" -w 32 -h 32 $img
convert "favicon.png" "favicon.ico"
rm -f "favicon.png"
