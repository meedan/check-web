#!/usr/bin/env bash
echo 'Starting Nginx...'
service nginx start
service nginx status
echo 'Starting regular Chromedriver entry point...'
exec /opt/bin/entry_point.sh