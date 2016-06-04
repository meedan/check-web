#!/bin/bash
cd /app
PLATFORM=web npm run publish 2>&1 >/app/releases/web.log
