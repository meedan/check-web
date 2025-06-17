#!/bin/bash

if [ "$MODE" = "test" ]; then
  service nginx start
  service nginx status || echo "[entrypoint] nginx failed to start!"
else
  service nginx status || echo "[entrypoint] nginx is not running!"
fi

exec "$@"