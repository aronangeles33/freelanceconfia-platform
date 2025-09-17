#!/bin/sh

# Start Node.js backend in background
cd /app/backend && node app.js &

# Start nginx in foreground
nginx -g "daemon off;"