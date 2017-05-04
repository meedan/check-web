#!/bin/bash
if [ ! -d /app/build/web/js ]; then
  npm run build;
fi
npm run publish
