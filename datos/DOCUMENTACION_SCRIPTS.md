# Documentación línea a línea de los archivos JavaScript de la carpeta scripts

Este documento explica, línea a línea y bloque a bloque, el funcionamiento de cada archivo que hay dentro de la carpeta [datos/scripts](datos/scripts).

---

## 1) build-check.js

Archivo: [datos/scripts/build-check.js](datos/scripts/build-check.js)

```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
```

- `import fs from 'node:fs';`
  - Importa el módulo nativo de Node para leer archivos y comprobar si existen.
- `import path from 'node:path';`
  - Importa utilidades para trabajar con rutas del sistema operativo.
- `import { fileURLToPath } from 'node:url';`
  - Permite convertir la URL del archivo actual en una ruta real del sistema para calcular la ubicación exacta del proyecto.

```js
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
```

- `const __dirname = ...`
  - Calcula la carpeta donde está este archivo.
- `const repoRoot = path.resolve(__dirname, '..');`
  - Sube una carpeta para situarse en la raíz del proyecto `datos`.

```js
const requiredFiles = [
  'package.json',
  '2-faker/generar-datos.js',
  '2-faker/catalogo.json',
  '3-anomizar/1-generar-dump-real.js',
  '3-anomizar/2-anonimizar.js'
];
```

- Define una lista de archivos que son esenciales para el proyecto.
- Si falta alguno, la build debe fallar.
- Este control es una validación de integridad antes de continuar.

```js
const missing = requiredFiles.filter((relative) => !fs.existsSync(path.join(repoRoot, relative)));
```

- Recorre la lista `requiredFiles`.
- `fs.existsSync(...)` devuelve `true` si el archivo existe.
- `filter` mantiene solo los que faltan.
- Si la lista `missing` tiene elementos, la build está rota.

```js
if (missing.length > 0) {
  console.error('Build failed: missing required files');
  console.error(missing.join('\n'));
  process.exit(1);
}
```

- Si faltan archivos, imprime un error claro.
- `console.error` escribe al flujo de errores.
- `missing.join('\n')` imprime cada archivo faltante en una línea distinta.
- `process.exit(1)` hace que el proceso termine con error, lo que corta la pipeline o la ejecución.

```js
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
```

- Lee el contenido del archivo `package.json`.
- `JSON.parse` convierte el texto JSON en un objeto JavaScript.
- Así se puede validar que el proyecto tiene metadata válida.

```js
if (!pkg.name || !pkg.version) {
  console.error('Build failed: invalid package metadata');
  process.exit(1);
}
```

- Comprueba que el paquete tenga una propiedad `name` y `version`.
- Si no tienen valor, falla la validación de build.

```js
console.log(`Build OK: ${pkg.name}@${pkg.version}`);
console.log('Required data and scripts are present.');
```

- Si todo va bien, imprime un mensaje exitoso.
- Muestra el nombre del proyecto y la versión.
- Confirma que todos los artefactos esperados existen.

### Resumen de build-check.js
Este script funciona como verificación de integridad antes del pipeline. Asegura que los archivos clave existen y que el paquete tiene información válida.

---

## 2) mock-app.js

Archivo: [datos/scripts/mock-app.js](datos/scripts/mock-app.js)

```js
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
```

- Importa `http` para crear un servidor HTTP local.
- `fs` se usa para leer el JSON del catálogo.
- `path` y `fileURLToPath` permiten localizar los archivos correctos dentro del proyecto.

```js
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(repoRoot, '2-faker', 'catalogo.json');
const port = Number(process.env.PORT || 3100);
```

- `__dirname` es la carpeta del script.
- `repoRoot` apunta a la raíz del proyecto.
- `catalogPath` apunta a la ubicación del catálogo de productos generado.
- `port` toma el puerto del entorno o usa `3100` por defecto.

```js
const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const catalog = catalogData.catalogo ?? catalogData.productos ?? [];
const pedidos = [];
```

- Lee el JSON del catálogo generado.
- `catalogData.catalogo ?? catalogData.productos ?? []` hace compatibilidad con dos posibles estructuras.
- `const pedidos = []` es una memoria en memoria para guardar pedidos que se creen durante la ejecución del mock.

```js
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
```

- Esta función lee el cuerpo enviado por el cliente en una petición HTTP.
- `chunks` almacena los trozos del payload.
- `req.on('data', ...)` se va ejecutando mientras llegan fragmentos.
- `req.on('end', ...)` se ejecuta cuando termina la petición.
- `Buffer.concat(chunks)` junta los fragmentos en un único texto.
- Si el cuerpo está vacío, devuelve `{}`.
- Si el cuerpo no es JSON válido, lanza un error con `Invalid JSON body`.

```js
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
```

- `http.createServer` crea un servidor HTTP.
- `req` es la petición del cliente y `res` es la respuesta.
- `new URL(req.url, ...)` construye la URL completa para analizar la ruta pedida.

```js
  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'catalog-api', ts: new Date().toISOString() }));
    return;
  }
```

- Si el cliente hace `GET /health`, responde con un estado sano.
- `res.writeHead(200, ...)` pone el código HTTP 200.
- Devuelve JSON con el estado del servicio y timestamp.
- `return` corta la ejecución para no entrar a otras rutas.

```js
  if (req.method === 'GET' && url.pathname === '/catalogo') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(catalog));
    return;
  }
```

- Si la solicitud es `GET /catalogo` devuelve el catálogo completo en JSON.

```js
  if (req.method === 'POST' && url.pathname === '/pedidos') {
    try {
      const body = await readBody(req);
      const productId = Number(body.productId ?? body.product_id ?? 1);
      const quantity = Number(body.qty ?? body.quantity ?? 1);
      const customerId = body.customerId ?? 'guest';
      const product = catalog.find((item) => item.id === productId);
```

- Si llega `POST /pedidos`, trata de leer el JSON del cuerpo.
- `productId` toma el ID del producto desde `productId` o `product_id`.
- `quantity` toma la cantidad; acepta `qty` o `quantity`.
- `customerId` toma el cliente o usa `guest` por defecto.
- Busca el producto en `catalog` por su `id`.

```js
      if (!product) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'product_not_found' }));
        return;
      }
```

- Si no encuentra el producto, responde con `404` y un JSON de error.

```js
      const order = {
        id: `ORD-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        productId,
        quantity,
        customerId,
        status: 'created',
        total: Number((product.precio * quantity).toFixed(2))
      };
```

- Construye un pedido simulando una respuesta real.
- `id` incluye timestamp + cadena aleatoria.
- `productId`, `quantity`, `customerId` y `status` se rellenan.
- `total` calcula el importe usando `producto.precio * cantidad` con 2 decimales.

```js
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
```

- Guarda el pedido en el array `pedidos`.
- Responde con `201 Created` para indicar que el pedido se creó.
- En caso de error al procesar el JSON, devuelve `400` con un detalle del fallo.

```js
  if (req.method === 'GET' && url.pathname === '/pedidos') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(pedidos));
    return;
  }
```

- Si se hace un `GET /pedidos`, devuelve los pedidos creados.

```js
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
});
```

- Si la ruta no coincide con ninguna conocida, responde `404`.

```js
server.listen(port, '127.0.0.1', () => {
  console.log(`Mock catalog API listening on http://127.0.0.1:${port}`);
});
```

- Arranca el servidor en localhost y puerto 3100 por defecto.
- Cuando está activo, imprime el mensaje de inicio del servicio.

### Resumen de mock-app.js
Es una aplicación simulada que emula un backend de catálogo con tres puntos clave:
- `/health` para comprobar que está viva
- `/catalogo` para devolver productos
- `/pedidos` para crear y consultar pedidos

---

## 3) smoke-tests.js

Archivo: [datos/scripts/smoke-tests.js](datos/scripts/smoke-tests.js)

```js
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
```

- `spawn` permite lanzar otro proceso desde Node; aquí se usa para arrancar `mock-app.js`.
- `wait` es una versión de `setTimeout` basada en promesas para esperar sin bloquear.

```js
const port = Number(process.env.PORT || 3100);
const baseUrl = `http://127.0.0.1:${port}`;
```

- Usa el mismo puerto definido por el entorno o `3100` por defecto.
- `baseUrl` es la URL base del servicio para hacer requests HTTP.

```js
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
```

- Esta función hace una llamada HTTP y devuelve el resultado junto con su estado.
- `fetch` es la API global de Node para HTTP.
- `response.text()` obtiene la respuesta como texto.
- Intenta convertir a JSON si el contenido es JSON válido.
- Si fallara, deja `data` como texto sin romper la ejecución.

```js
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
```

- Espera a que el servicio arranque correctamente.
- Reintenta cada 250 ms hasta 15 segundos.
- Cuando `/health` responde `200`, considera que el servicio ya está listo.
- Si transcurre el tiempo máximo, lanza un error explicando timeout.

```js
async function main() {
  const server = spawn(process.execPath, ['scripts/mock-app.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: 'inherit'
  });
```

- Inicia el mock app en un subproceso nuevo.
- `process.execPath` es la ruta del intérprete Node actual.
- `['scripts/mock-app.js']` ejecuta el archivo del mock server.
- `cwd: process.cwd()` ejecuta el proceso desde la raíz del proyecto.
- `env` reusa las variables de entorno y fija `PORT`.
- `stdio: 'inherit'` hace que la salida del subproceso se vea en la consola del test.

```js
  try {
    await waitForServer();

    const health = await fetchJson(`${baseUrl}/health`);
    if (health.status !== 200 || !health.data || health.data.status !== 'ok') {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }
```

- Espera a que el servicio esté levantado.
- Hace una petición a `/health`.
- Si la respuesta no es `200`, o el JSON no tiene `status: ok`, falla el smoke test.

```js
    const catalog = await fetchJson(`${baseUrl}/catalogo`);
    if (catalog.status !== 200 || !Array.isArray(catalog.data) || catalog.data.length < 1) {
      throw new Error(`Catalog check failed: ${JSON.stringify(catalog)}`);
    }
```

- Consulta `/catalogo`.
- Asegura que la respuesta es HTTP 200 y que devuelve un array no vacío.
- Si no retorna productos, falla la validación.

```js
    const order = await fetchJson(`${baseUrl}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 1, qty: 2, customerId: 'smoke-user' })
    });
```

- Simula la creación de un pedido con `POST /pedidos`.
- Envía un JSON con `productId`, `qty` y `customerId`.

```js
    if (order.status !== 201 || !order.data || !order.data.id) {
      throw new Error(`Create order failed: ${JSON.stringify(order)}`);
    }
```

- Comprueba que la creación del pedido ha devuelto `201 Created` y que incluye un `id`.
- Si no, falla el smoke test.

```js
    console.log('SMOKE TEST OK: health, catalog and create order all succeeded.');
  } finally {
    server.kill('SIGTERM');
  }
}
```

- Si todo sale bien, imprime un mensaje de éxito.
- `finally` se ejecuta siempre, y cierra el subproceso del mock app con `SIGTERM` para no dejar procesos abiertos.

```js
main().catch((error) => {
  console.error('SMOKE TEST FAILED');
  console.error(error.stack || error.message);
  process.exit(1);
});
```

- Ejecuta la función principal.
- Si falla algo, imprime el error y termina con `exit 1`.
- Eso hace que la tarea del pipeline falle.

### Resumen de smoke-tests.js
Este archivo valida que la app no solo arrancó, sino que también respondió a las rutas esenciales del negocio: salud, catálogo y pedido.

---

## 4) load-test.js

Archivo: [datos/scripts/load-test.js](datos/scripts/load-test.js)

```js
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { performance } from 'node:perf_hooks';
```

- `spawn` arranca el mock app.
- `wait` permite esperar con promesas.
- `performance` da acceso a métricas de tiempo para medir latencias reales.

```js
const port = Number(process.env.PORT || 3100);
const baseUrl = `http://127.0.0.1:${port}`;
const targetP95 = Number(process.env.SLA_P95_MS ?? 800);
const targetErrorRate = Number(process.env.SLA_ERROR_RATE ?? 0.01);
const totalRequests = Number(process.env.LOAD_REQUESTS ?? 120);
const concurrency = Number(process.env.LOAD_CONCURRENCY ?? 6);
```

- Define la configuración del test de carga.
- `targetP95` es el p95 máximo permitido, por defecto 800 ms.
- `targetErrorRate` es el error permitido, por defecto 1% (0.01).
- `totalRequests` es el total de peticiones a lanzar.
- `concurrency` determina cuántas llamadas concurrentes se hacen a la vez.

```js
function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}
```

- Calcula un percentil de latencia.
- Ordena las latencias y toma el valor que corresponde al percentil indicado.
- Con `p=95` obtiene el p95.

```js
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
```

- Hace una petición HTTP y devuelve el estado y el contenido.
- Si la respuesta es JSON, lo parsea; si no, se deja como texto.

```js
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
```

- Espera a que el servicio esté vivo antes de lanzar pruebas de carga.
- Si no está listo en 15 segundos, falla la prueba.

```js
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
```

- `issueRequest` simula una petición real a `/catalogo`.
- `performance.now()` mide el tiempo exacto antes y después de la petición.
- Calcula `latency` como diferencia de tiempo.
- Marca una respuesta como error si:
  - el código HTTP es >= 400
  - o no devuelve un array válido en JSON
- Si la llamada falla por excepción, lo marca como `status: 500` y `hasError: true`.

```js
async function main() {
  const server = spawn(process.execPath, ['scripts/mock-app.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: 'inherit'
  });
```

- Inicia el servicio mock en un subproceso.
- La prueba de carga ejecuta el mismo backend que usa el smoke test.

```js
  try {
    await waitForServer();

    const results = [];
    const queue = Array.from({ length: totalRequests }, (_, index) => index);
```

- Espera a que el servidor esté listo.
- `results` almacena todas las métricas de las peticiones.
- `queue` crea un conjunto de peticiones a ejecutar.

```js
    const workers = Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        const index = queue.pop();
        if (typeof index === 'number') {
          const result = await issueRequest(index);
          results.push(result);
        }
      }
    });
```

- Crea varios workers concurrentes.
- Cada worker va tomando peticiones del array `queue` y ejecutándolas.
- Esto simula carga concurrente real.

```js
    await Promise.all(workers);

    const latencies = results.map((result) => result.latency);
    const errors = results.filter((result) => result.hasError).length;
    const p95 = percentile(latencies, 95);
    const errorRate = errors / results.length;
```

- Espera a que todos los workers terminan.
- Recoge todas las latencias en un array.
- Cuenta el número de peticiones fallidas.
- Calcula:
  - `p95` = percentil 95 de latencia
  - `errorRate` = proporción de errores sobre total de resultados

```js
    console.log('LOAD TEST SUMMARY');
    console.log(`requests=${results.length}`);
    console.log(`p95_ms=${p95.toFixed(2)}`);
    console.log(`error_rate=${errorRate.toFixed(4)}`);
    console.log(`SLA p95_ms<${targetP95} and error_rate<${targetErrorRate}`);
```

- Imprime el resumen de la prueba de carga con los valores numéricos calculados.
- Muestra también el SLA esperado.

```js
    const failReason = [];
    if (p95 > targetP95) {
      failReason.push(`p95 ${p95.toFixed(2)}ms exceeds ${targetP95}ms`);
    }
    if (errorRate > targetErrorRate) {
      failReason.push(`error rate ${errorRate.toFixed(4)} exceeds ${targetErrorRate}`);
    }
```

- Revisa si se ha incumplido el SLA.
- `p95 > targetP95` indica que la latencia es demasiado alta.
- `errorRate > targetErrorRate` indica demasiados errores.
- Cada motivo se acumula en `failReason`.

```js
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
```

- Si hay motivos de fallo, el script hace `exit 1`.
- Esa salida con código de error hace que el pipeline detenga el deploy.
- Si pasa, imprime mensaje de éxito.
- `finally` cierra el servidor mock.

```js
main().catch((error) => {
  console.error('LOAD TEST FAILED');
  console.error(error.stack || error.message);
  process.exit(1);
});
```

- Ejecuta la prueba principal.
- Si cualquier error no controlado aparece, se captura aquí y se fuerza el fallo con exit 1.

### Resumen de load-test.js
Este archivo mide la capacidad del servicio bajo carga y actúa como quality gate final: si la latencia o los errores superan el SLA, detiene el despliegue.

---

## Conclusión

La carpeta scripts contiene cuatro archivos clave:

- [datos/scripts/build-check.js](datos/scripts/build-check.js): valida que el proyecto esté completo y listo para compilar.
- [datos/scripts/mock-app.js](datos/scripts/mock-app.js): simula la API del catálogo para pruebas.
- [datos/scripts/smoke-tests.js](datos/scripts/smoke-tests.js): valida que la API respondió correctamente a salud, catálogo y pedido.
- [datos/scripts/load-test.js](datos/scripts/load-test.js): valida el SLA con p95 y errores, y falla la pipeline si no se cumple.

Juntos forman la base del pipeline que automatiza build, smoke y gate de carga.

