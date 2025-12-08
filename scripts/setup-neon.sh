#!/bin/bash

echo "🚀 Neon Database Setup Helper"
echo "============================"
echo ""

# Check if DATABASE_URL is already set
if grep -q "neon.tech" .env 2>/dev/null; then
    echo "✅ Neon connection string already found in .env"
    exit 0
fi

echo "Step 1: Getting Neon connection string..."
echo ""

# Try to get connection string
CONNECTION_STRING=$(npx neonctl@latest connection-string 2>&1)

if echo "$CONNECTION_STRING" | grep -q "postgres://"; then
    echo "✅ Found connection string!"
    echo ""
    echo "Updating .env file..."
    
    # Update DATABASE_URL in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$CONNECTION_STRING\"|" .env
    else
        # Linux
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$CONNECTION_STRING\"|" .env
    fi
    
    echo "✅ Updated .env file with Neon connection string"
    echo ""
    echo "Next steps:"
    echo "1. Run: npx prisma db push"
    echo "2. Run: npm run seed"
    echo "3. Run: npm run dev"
else
    echo "⚠️  Could not automatically get connection string"
    echo ""
    echo "Please:"
    echo "1. Go to https://console.neon.tech"
    echo "2. Select your project"
    echo "3. Copy the connection string from 'Connection Details'"
    echo "4. Update DATABASE_URL in .env file manually"
fi

