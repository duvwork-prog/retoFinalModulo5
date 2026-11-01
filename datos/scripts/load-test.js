import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { performance } from 'node:perf_hooks';

const port = Number(process.env.PORT || 3100);
const baseUrl = `http://127.0.0.1:${port}`;
const targetP95 = Number(process.env.SLA_P95_MS ?? 800);
const targetErrorRate = Number(process.env.SLA_ERROR_RATE ?? 0.01);
const totalRequests = Number(process.env.LOAD_REQUESTS ?? 120);
const concurrency = Number(process.env.LOAD_CONCURRENCY ?? 6);

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch {
    // raw text is acceptable here
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
        // server not ready
      }
      await wait(250);
    }

    reject(new Error(`Load test timeout: service did not start on ${baseUrl}`));
  });
}

async function issueRequest(index) {
  const start = performance.now();
  try {
    const response = await fetchJson(`${baseUrl}/catalogo`);
    const latency = performance.now() - start;
    const hasError = response.status >= 400 || !Array.isArray(response.data);
    return { latency, hasError, status: response.status };
  } catch (error) {
    const latency = performance.now() - start;
    return { latency, hasError: true, status: 500 };
  }
}

async function main() {
  const server = spawn(process.execPath, ['scripts/mock-app.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: 'inherit'
  });

  try {
    await waitForServer();

    const results = [];
    const queue = Array.from({ length: totalRequests }, (_, index) => index);

    const workers = Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        const index = queue.pop();
        if (typeof index === 'number') {
          const result = await issueRequest(index);
          results.push(result);
        }
      }
    });

    await Promise.all(workers);

    const latencies = results.map((result) => result.latency);
    const errors = results.filter((result) => result.hasError).length;
    const p95 = percentile(latencies, 95);
    const errorRate = errors / results.length;

    console.log('LOAD TEST SUMMARY');
    console.log(`requests=${results.length}`);
    console.log(`p95_ms=${p95.toFixed(2)}`);
    console.log(`error_rate=${errorRate.toFixed(4)}`);
    console.log(`SLA p95_ms<${targetP95} and error_rate<${targetErrorRate}`);

    const failReason = [];
    if (p95 > targetP95) {
      failReason.push(`p95 ${p95.toFixed(2)}ms exceeds ${targetP95}ms`);
    }
    if (errorRate > targetErrorRate) {
      failReason.push(`error rate ${errorRate.toFixed(4)} exceeds ${targetErrorRate}`);
    }

    if (failReason.length > 0) {
      console.error('LOAD TEST FAILED');
      console.error(failReason.join(' | '));
      process.exit(1);
    }

    console.log('LOAD TEST PASS: SLA gate passed.');
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error('LOAD TEST FAILED');
  console.error(error.stack || error.message);
  process.exit(1);
});
