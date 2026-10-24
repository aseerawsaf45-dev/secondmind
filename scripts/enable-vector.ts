import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("No DATABASE_URL");
    process.exit(1);
  }
  const sql = neon(databaseUrl);
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    console.log("Vector extension created successfully!");
  } catch (e) {
    console.error("Error creating vector extension:", e);
  }
}
main();
