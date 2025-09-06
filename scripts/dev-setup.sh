#!/bin/bash

# Development Setup Script
echo "🚀 Setting up development environment..."

# Check if .env file exists, if not copy from development.env
if [ ! -f .env ]; then
    echo "📄 Creating .env file from development.env..."
    cp development.env .env
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🗃️ Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Development environment ready!"
echo "🎯 Run 'npm run dev' to start development server with auto-reload"

