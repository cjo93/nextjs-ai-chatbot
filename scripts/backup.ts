import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { promisify } from "node:util";

const execAsync = promisify(exec);

async function backup() {
  const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
  const filename = `backup-${timestamp}.sql`;
  const backupDir = "backups";

  if (!existsSync(backupDir)) {
    await mkdir(backupDir, { recursive: true });
  }

  if (!process.env.POSTGRES_URL) {
    console.error("❌ POSTGRES_URL environment variable is not set");
    process.exit(1);
  }

  try {
    console.log("🔄 Creating database backup...");

    // Parse the connection string to extract credentials
    const url = new URL(process.env.POSTGRES_URL);

    // Use environment variables for pg_dump to avoid exposing credentials in process list
    const env = {
      ...process.env,
      PGHOST: url.hostname,
      PGPORT: url.port || "5432",
      PGUSER: url.username,
      PGPASSWORD: url.password,
      PGDATABASE: url.pathname.slice(1), // Remove leading slash
    };

    await execAsync(`pg_dump > ${backupDir}/${filename}`, { env });
    console.log(`✅ Backup created: ${backupDir}/${filename}`);
  } catch (error) {
    console.error("❌ Backup failed");
    console.error(error);
    process.exit(1);
  }
}

backup();
