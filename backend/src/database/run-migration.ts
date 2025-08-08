import fs from 'fs';
import path from 'path';
import pool from './connection';

async function runMigration(migrationPathArg?: string) {
  const migrationPath = migrationPathArg || process.argv[2];
  if (!migrationPath) {
    console.error('❌ Please provide a migration file path.');
    process.exit(1);
  }

  const absPath = path.isAbsolute(migrationPath)
    ? migrationPath
    : path.join(process.cwd(), migrationPath);

  try {
    console.log(`📦 Running migration: ${absPath}`);
    const sql = fs.readFileSync(absPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Migration applied successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration().catch((e) => {
  console.error('❌ Unexpected error:', e);
  process.exit(1);
});


