#!/bin/bash

if [ -f /app/.transifexrc ]; then
  echo "[entrypoint] Copying .transifexrc to /root"
  cp /app/.transifexrc /root/.transifexrc
fi

if [ "$MODE" = "test" ]; then
  service nginx start
  service nginx status || echo "[entrypoint] nginx failed to start!"
else
  service nginx status || echo "[entrypoint] nginx is not running!"
fi

exec "$@"