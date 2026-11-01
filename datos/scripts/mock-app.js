import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(repoRoot, '2-faker', 'catalogo.json');
const port = Number(process.env.PORT || 3100);

const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const catalog = catalogData.catalogo ?? catalogData.productos ?? [];
const pedidos = [];

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'catalog-api', ts: new Date().toISOString() }));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/catalogo') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(catalog));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/pedidos') {
    try {
      const body = await readBody(req);
      const productId = Number(body.productId ?? body.product_id ?? 1);
      const quantity = Number(body.qty ?? body.quantity ?? 1);
      const customerId = body.customerId ?? 'guest';
      const product = catalog.find((item) => item.id === productId);

      if (!product) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'product_not_found' }));
        return;
      }

      const order = {
        id: `ORD-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        productId,
        quantity,
        customerId,
        status: 'created',
        total: Number((product.precio * quantity).toFixed(2))
      };

      pedidos.push(order);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(order));
      return;
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'bad_request', details: error.message }));
      return;
    }
  }

  if (req.method === 'GET' && url.pathname === '/pedidos') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(pedidos));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock catalog API listening on http://127.0.0.1:${port}`);
});
