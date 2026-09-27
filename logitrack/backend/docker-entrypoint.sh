#!/bin/sh
set -eu

if [ -z "${DB_URL:-}" ] && [ -n "${DB_HOST:-}" ]; then
  DB_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-logitrack_db}?sslmode=${DB_SSLMODE:-require}"
  export DB_URL
fi

exec java -jar /app/app.jar
