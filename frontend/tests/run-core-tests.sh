#!/bin/bash

# Run only the core functionality tests
echo "🧪 Running Core E2E Tests..."
echo "=============================="

# Run authentication tests
echo "🔐 Testing Authentication..."
npx playwright test auth-core.spec.ts

# Run dashboard tests
echo "📊 Testing Dashboard..."
npx playwright test dashboard-core.spec.ts

# Run AI generator tests
echo "🤖 Testing AI Generator..."
npx playwright test ai-generator-realistic.spec.ts

echo "✅ Core tests completed!"
