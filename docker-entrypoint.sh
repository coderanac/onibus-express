#!/bin/sh
set -e

echo "Aplicando migrations..."
npx prisma migrate deploy

echo "Verificando dados iniciais (seed)..."
npx tsx prisma/seed.ts

exec "$@"
