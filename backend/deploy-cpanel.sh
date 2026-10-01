#!/usr/bin/env bash
set -euo pipefail

cd /home/daniasto/dania-backend
if [ -e .env ]; then
  echo "An existing .env is present. Nothing was changed."
  exit 1
fi

source /home/daniasto/nodevenv/dania-backend/22/bin/activate
printf 'PostgreSQL password for daniasto_app: '
IFS= read -rs DANIA_DB_PASSWORD
printf '\n'
if [ -z "$DANIA_DB_PASSWORD" ]; then
  echo "Password is required."
  exit 1
fi
export DANIA_DB_PASSWORD

node <<'NODE'
const fs = require('node:fs');
const crypto = require('node:crypto');

const adminPassword = crypto.randomBytes(20).toString('hex');
const settings = {
  APP_ENV: 'production',
  APP_ORIGINS: 'https://daniastore.ir',
  DB_HOST: '127.0.0.1',
  DB_PORT: '5432',
  DB_NAME: 'daniasto_dania',
  DB_USERNAME: 'daniasto_app',
  DB_PASSWORD: process.env.DANIA_DB_PASSWORD,
  DB_SYNCHRONIZE: 'false',
  COOKIE_SECRET: crypto.randomBytes(32).toString('hex'),
  SUPERADMIN_USERNAME: 'superadmin',
  SUPERADMIN_PASSWORD: adminPassword,
  ALLOW_DUMMY_PAYMENTS: 'false',
  RUN_WORKER_IN_PROCESS: 'true',
  ASSET_UPLOAD_DIR: '/home/daniasto/dania-data/assets',
  ASSET_URL_PREFIX: 'https://api.daniastore.ir/assets/',
};

fs.mkdirSync('/home/daniasto/dania-data/assets', { recursive: true });
const file = Object.entries(settings)
  .map(([name, value]) => `${name}=${JSON.stringify(value)}`)
  .join('\n') + '\n';
fs.writeFileSync('.env', file, { flag: 'wx', mode: 0o600 });
console.log('Production settings saved. Keep these admin credentials private:');
console.log('Username: superadmin');
console.log(`Password: ${adminPassword}`);
NODE

unset DANIA_DB_PASSWORD
node dist/migrate.js
node dist/seed.js
mkdir -p tmp
touch tmp/restart.txt
echo "Backend migration and catalog seed complete. Restart the Node app in cPanel."
