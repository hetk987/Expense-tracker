#!/usr/bin/env node

/**
 * Migration script to help move from separate backend to integrated Next.js setup
 * This script helps copy environment variables and provides migration guidance
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 Backend Integration Migration Helper");
console.log("=====================================\n");

// Check if backend environment file exists
const backendEnvPath = path.join(__dirname, "../../backend-javascript/.env");
const frontendEnvPath = path.join(__dirname, "../.env.local");

if (fs.existsSync(backendEnvPath)) {
  console.log("✅ Found backend .env file");

  const backendEnv = fs.readFileSync(backendEnvPath, "utf8");
  const envLines = backendEnv.split("\n");

  console.log("\n📋 Environment variables found in backend:");
  envLines.forEach((line) => {
    if (line.trim() && !line.startsWith("#")) {
      const [key] = line.split("=");
      console.log(`  - ${key}`);
    }
  });

  console.log(
    "\n📝 Please copy these variables to your frontend/.env.local file:"
  );
  console.log(
    "   Make sure to update the webhook URL to point to your new Next.js API route."
  );
} else {
  console.log("❌ Backend .env file not found");
  console.log(
    "   Please manually copy your environment variables to frontend/.env.local"
  );
}

console.log("\n📋 Next steps:");
console.log(
  "1. Copy environment variables from backend/.env to frontend/.env.local"
);
console.log(
  "2. Update PLAID_WEBHOOK_URL to: https://your-domain.com/api/plaid/webhook"
);
console.log("3. Run: cd frontend && npm install");
console.log("4. Run: npx prisma migrate dev");
console.log("5. Run: npx prisma generate");
console.log("6. Start the development server: npm run dev");

console.log("\n🎉 Migration helper completed!");
