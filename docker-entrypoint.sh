#!/bin/bash
if [ ! -d /app/build/web/js ]
then
  npm install
  npm run build
fi
npm run publish
