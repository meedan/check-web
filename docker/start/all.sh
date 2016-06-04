#!/bin/bash
sleep 5
echo 'Starting...'
supervisord -c /etc/supervisord.conf
sleep 30
tail -f /dev/null
