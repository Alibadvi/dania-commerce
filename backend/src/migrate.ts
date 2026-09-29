import { runMigrations } from '@vendure/core';
import { config } from './vendure-config.js';

try {
  const migrations = await runMigrations(config);
  console.log(`Applied ${migrations.length} migration(s)`);
} catch (error) {
  console.error('Failed to apply database migrations:', error);
  process.exitCode = 1;
}
