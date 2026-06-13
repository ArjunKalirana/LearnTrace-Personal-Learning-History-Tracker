const { execSync } = require('child_process');

console.log("==========================================");
console.log("       LEARNTRACE STARTUP SCRIPT         ");
console.log("==========================================");

// Sanitize all env vars — trims hidden carriage returns (\r) and accidental
// spaces that users sometimes paste into hosting dashboards (Railway, Render, etc.)
const sanitizedEnv = {};
for (const [key, value] of Object.entries(process.env)) {
  const cleanKey = key.trim();
  const cleanValue = typeof value === 'string' ? value.trim() : value;
  sanitizedEnv[cleanKey] = cleanValue;
}

const dbUrl = sanitizedEnv.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ CRITICAL ERROR: DATABASE_URL is missing!");
  console.log("Raw env keys (hex-encoded to expose hidden characters):");
  Object.keys(process.env).forEach(k => {
    let hex = "";
    for (let i = 0; i < k.length; i++) hex += k.charCodeAt(i).toString(16) + " ";
    console.log(`"${k}" -> [${hex}]`);
  });
  process.exit(1);
}

console.log("✅ DATABASE_URL present and sanitized (length: " + dbUrl.length + ")");

try {
  console.log("🚀 Running database migrations (prisma migrate deploy)...");

  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: sanitizedEnv
    });
    console.log("✅ Migrations applied successfully. Starting app...");
  } catch (migrationErr) {
    // Fallback for DBs that have never used migrate (e.g. fresh Render Postgres).
    // db push syncs the schema directly; subsequent deploys will use migrate deploy.
    console.warn("⚠️  prisma migrate deploy failed — falling back to prisma db push...");
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: sanitizedEnv
    });
    console.log("✅ Schema synced via db push. Starting app...");
  }

  // Replace process.env with the sanitized copy so the Express app sees clean vars
  Object.keys(process.env).forEach(k => delete process.env[k]);
  Object.assign(process.env, sanitizedEnv);

  // Boot the main application
  require('./dist/index.js');

} catch (error) {
  console.error("❌ Startup failed!", error.message);
  process.exit(1);
}
