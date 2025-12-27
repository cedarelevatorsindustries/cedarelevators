const path = require('path');
// Try .env.local
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.local')
});
// Also try .env (fallback)
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env')
});

const ngrok = require('@ngrok/ngrok');

const authtoken = process.env.NGROK_AUTHTOKEN;

if (!authtoken) {
  console.error('NGROK_AUTHTOKEN not found in .env.local');
  console.error('Make sure .env.local is in:');
  console.error('D:\\web development\\cedar-elevators-industries\\frontend\\cedar-storefront\\.env.local');
  process.exit(1);
}

async function startTunnel() {
  console.log('Starting ngrok tunnel to http://localhost:3000...');

  const listener = await ngrok.forward({
    addr: 3000,
    authtoken: authtoken,
  });

  const url = listener.url();
  console.log('ngrok tunnel ready!');
  console.log(`Open on your phone: ${url}`);
  console.log(`(All pages will work with live reload)`);
}

startTunnel().catch(err => {
  console.error('Tunnel failed:', err.message);
  process.exit(1);
});

process.stdin.resume();