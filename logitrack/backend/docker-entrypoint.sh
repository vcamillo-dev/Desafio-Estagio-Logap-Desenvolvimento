#!/bin/sh
set -eu

if [ -z "${DB_URL:-}" ] && [ -n "${DB_HOST:-}" ]; then
  DB_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-logitrack_db}"
  export DB_URL
fi

if [ "${DB_SEED_DEMO:-false}" = "true" ]; then
  : "${DB_HOST:?DB_HOST must be configured when DB_SEED_DEMO=true}"
  : "${DB_NAME:?DB_NAME must be configured when DB_SEED_DEMO=true}"
  : "${DB_USERNAME:?DB_USERNAME must be configured when DB_SEED_DEMO=true}"
  : "${DB_PASSWORD:?DB_PASSWORD must be configured when DB_SEED_DEMO=true}"

  db_port="${DB_PORT:-5432}"
  attempt=0

  until pg_isready -q -h "$DB_HOST" -p "$db_port" -U "$DB_USERNAME" -d "$DB_NAME"; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 30 ]; then
      echo "PostgreSQL did not become ready; demo SQL was not applied." >&2
      exit 1
    fi
    sleep 2
  done

  export PGPASSWORD="$DB_PASSWORD"
  psql -v ON_ERROR_STOP=1 \
    -h "$DB_HOST" \
    -p "$db_port" \
    -U "$DB_USERNAME" \
    -d "$DB_NAME" \
    -f /app/initial-data.sql
  unset PGPASSWORD
fi

exec java -jar /app/app.jar
