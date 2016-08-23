#!/bin/bash
sleep 5
echo 'Starting...'
supervisord -c /app/docker/supervisord.conf
sleep 30
tail -f /dev/null
