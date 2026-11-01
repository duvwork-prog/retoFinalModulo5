import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const port = Number(process.env.PORT || 3100);
const baseUrl = `http://127.0.0.1:${port}`;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch {
    // keep raw text if not JSON
  }
  return { status: response.status, data };
}

function waitForServer() {
  return new Promise(async (resolve, reject) => {
    const deadline = Date.now() + 15000;

    while (Date.now() < deadline) {
      try {
        const response = await fetchJson(`${baseUrl}/health`);
        if (response.status === 200) {
          resolve();
          return;
        }
      } catch {
        // server not ready yet
      }
      await wait(250);
    }

    reject(new Error(`Smoke test timeout: service did not start on ${baseUrl}`));
  });
}

async function main() {
  const server = spawn(process.execPath, ['scripts/mock-app.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: 'inherit'
  });

  try {
    await waitForServer();

    const health = await fetchJson(`${baseUrl}/health`);
    if (health.status !== 200 || !health.data || health.data.status !== 'ok') {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }

    const catalog = await fetchJson(`${baseUrl}/catalogo`);
    if (catalog.status !== 200 || !Array.isArray(catalog.data) || catalog.data.length < 1) {
      throw new Error(`Catalog check failed: ${JSON.stringify(catalog)}`);
    }

    const order = await fetchJson(`${baseUrl}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 1, qty: 2, customerId: 'smoke-user' })
    });

    if (order.status !== 201 || !order.data || !order.data.id) {
      throw new Error(`Create order failed: ${JSON.stringify(order)}`);
    }

    console.log('SMOKE TEST OK: health, catalog and create order all succeeded.');
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error('SMOKE TEST FAILED');
  console.error(error.stack || error.message);
  process.exit(1);
});
