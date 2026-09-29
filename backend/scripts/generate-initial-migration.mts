import path from 'node:path';
import { generateMigration } from '@vendure/core';
import { config } from '../src/vendure-config.js';

const outputDir = path.join(process.cwd(), 'src/migrations');
const generated = await generateMigration(config, { name: 'initial-schema', outputDir });
if (!generated) {
  throw new Error('No database changes were found for the initial migration');
}
console.log(`Generated migration: ${generated}`);
