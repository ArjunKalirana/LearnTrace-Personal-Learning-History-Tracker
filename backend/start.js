const { execSync } = require('child_process');

console.log("==========================================");
console.log("    RAILWAY STARTUP DIAGNOSTIC SCRIPT     ");
console.log("==========================================");

// Create a heavily sanitized copy of process.env to eliminate hidden Carriage Returns (\r)
// or accidental spaces that users often paste into the Railway Dashboard GUI.
const sanitizedEnv = {};
for (const [key, value] of Object.entries(process.env)) {
  const cleanKey = key.trim();
  const cleanValue = typeof value === 'string' ? value.trim() : value;
  sanitizedEnv[cleanKey] = cleanValue;
}

const dbUrl = sanitizedEnv.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ CRITICAL ERROR: DATABASE_URL is missing even after checking heavily sanitized keys!");
  console.log("Current RAW keys in process.env (hex encoded to show hidden characters):");
  Object.keys(process.env).forEach(k => {
    let hex = "";
    for(let i=0; i<k.length; i++) hex += k.charCodeAt(i).toString(16) + " ";
    console.log(`"${k}" -> [${hex}]`);
  });
  process.exit(1);
}

console.log("✅ DATABASE_URL is present and sanitized! (Length: " + dbUrl.length + ")");

try {
  console.log("🚀 Running database push (npx prisma db push)...");
  
  // Explicitly inject the completely sanitized environment.
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    env: sanitizedEnv
  });
  
  console.log("✅ Database synced successfully. Starting app...");
  
  // Overwrite the global process.env so the Express app uses the sanitized vars too!
  // Instead of reassigning, strictly manipulate the native process.env object properties
  Object.keys(process.env).forEach(k => delete process.env[k]);
  Object.assign(process.env, sanitizedEnv);
  
  // Start the main application
  require('./dist/index.js');
  
} catch (error) {
  console.error("❌ Startup failed!", error.message);
  process.exit(1);
}
