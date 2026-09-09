#!/bin/bash
# UMU Sports — stop the local stack and keep all data.
set -e
cd "$(dirname "$0")"
docker compose down
echo "Stopped. Your data is kept in the mysql_data volume."