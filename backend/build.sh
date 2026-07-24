#!/usr/bin/env bash
# Render.com build script for backend

set -e

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "✅ Build complete!"
