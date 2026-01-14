#!/usr/bin/env node
/**
 * Cron Job Runner Script
 * 
 * Usage: node scripts/run-cron.mjs <endpoint>
 * 
 * Endpoints:
 *   - daily-digest
 *   - weekly-digest
 *   - forecast-resolve
 *   - expire-ads
 *   - expire-services
 *   - expire-local-listings
 *   - cleanup
 */

const ENDPOINTS = {
  'daily-digest': '/api/email/daily-digest',
  'weekly-digest': '/api/email/weekly-digest',
  'forecast-resolve': '/api/forecasting/resolve',
  'expire-ads': '/api/cron/expire-ads',
  'expire-services': '/api/cron/expire-services',
  'expire-local-listings': '/api/cron/expire-local-listings',
  'cleanup': '/api/cron/cleanup',
};

async function main() {
  const endpoint = process.argv[2];
  
  if (!endpoint || !ENDPOINTS[endpoint]) {
    console.error('Usage: node scripts/run-cron.mjs <endpoint>');
    console.error('Available endpoints:', Object.keys(ENDPOINTS).join(', '));
    process.exit(1);
  }

  const baseUrl = process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || 'https://builders.to';
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('Error: CRON_SECRET environment variable is required');
    process.exit(1);
  }

  const url = `${baseUrl}${ENDPOINTS[endpoint]}`;
  
  console.log(`[Cron] Running: ${endpoint}`);
  console.log(`[Cron] URL: ${url}`);
  console.log(`[Cron] Time: ${new Date().toISOString()}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[Cron] Error: ${response.status} ${response.statusText}`);
      console.error('[Cron] Response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('[Cron] Success!');
    console.log('[Cron] Response:', JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('[Cron] Failed to execute:', error.message);
    process.exit(1);
  }
}

main();
