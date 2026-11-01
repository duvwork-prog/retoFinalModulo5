# Entregable final: catálogo de tienda generado con Faker y semilla fija

Este archivo reúne:
- la versión final y lista para entregar del script, y
- el JSON resultante generado con la semilla fija.

## Script final: 2-faker/generar-datos.js

```js
/**
 * Genera un catalogo de tienda con Faker y semilla fija.
 *
 * Requisitos del reto:
 * - 4+ categorias
 * - 20+ productos
 * - datos reproducibles entre ejecuciones y equipos
 * - estructura adecuada para usar con json-server
 */
import { faker } from '@faker-js/faker';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaCatalogo = path.join(__dirname, 'catalogo.json');
const rutaDb = path.join(__dirname, 'db.json');

const CANTIDAD = 24;
const SEMILLA = 12345;

faker.seed(SEMILLA);

const categorias = [
  { nombre: 'Hogar', productos: ['Lámpara LED', 'Cafetera', 'Juego de sábanas', 'Tetera', 'Plato de cerámica', 'Organizador de cocina'] },
  { nombre: 'Ropa', productos: ['Camiseta básica', 'Pantalón casual', 'Chaqueta ligera', 'Zapatillas urbanas', 'Sudadera', 'Bufanda'] },
  { nombre: 'Electrónica', productos: ['Auriculares inalámbricos', 'Teclado mecánico', 'Monitor 24"', 'Altavoz Bluetooth', 'Cargador USB-C', 'Smartwatch'] },
  { nombre: 'Deportes', productos: ['Pelota de fútbol', 'Mancuerna 10kg', 'Botella de hidratación', 'Raqueta de tenis', 'Gorra deportiva', 'Mochila de senderismo'] },
  { nombre: 'Muebles', productos: ['Mesa de centro', 'Silla ergonómica', 'Escritorio compacto', 'Estantería modular', 'Sofá minimalista', 'Velador'] }
];

function crearProducto(id) {
  const categoria = faker.helpers.arrayElement(categorias);
  const nombre = faker.helpers.arrayElement(categoria.productos);
  const precio = Number(faker.commerce.price({ min: 25, max: 750, dec: 2 }));
  const stock = faker.number.int({ min: 3, max: 200 });

  return {
    id,
    nombre,
    categoria: categoria.nombre,
    precio,
    stock,
    sku: `SKU-${String(id).padStart(5, '0')}`,
    descripcion: `${nombre} de alta calidad para uso diario.`
  };
}

const productos = Array.from({ length: CANTIDAD }, (_, i) => crearProducto(i + 1));
const catalogo = { catalogo: productos, productos };

fs.writeFileSync(rutaCatalogo, JSON.stringify(catalogo, null, 2));
fs.writeFileSync(rutaDb, JSON.stringify(catalogo, null, 2));

console.log('===== CATALOGO DE TIENDA: Faker con semilla fija =====');
console.log(`Generados ${productos.length} productos en 2-faker/catalogo.json`);
console.log(`Categorias: ${[...new Set(productos.map(p => p.categoria))].join(', ')}`);
console.log('Primeros 3 productos:');
productos.slice(0, 3).forEach((p, index) => {
  console.log(`  ${index + 1}) ${p.nombre} | ${p.categoria} | $${p.precio} | stock ${p.stock}`);
});
console.log('');
console.log('Puedes servirlo con json-server:');
console.log('  npx json-server 2-faker/catalogo.json --port 3000');
console.log('  -> http://localhost:3000/catalogo');
console.log('=========================================');
```

## JSON resultante generado: 2-faker/catalogo.json

```json
{
  "catalogo": [
    {
      "id": 1,
      "nombre": "Silla ergonómica",
      "categoria": "Muebles",
      "precio": 158.35,
      "stock": 120,
      "sku": "SKU-00001",
      "descripcion": "Silla ergonómica de alta calidad para uso diario."
    },
    {
      "id": 2,
      "nombre": "Estantería modular",
      "categoria": "Muebles",
      "precio": 567.95,
      "stock": 193,
      "sku": "SKU-00002",
      "descripcion": "Estantería modular de alta calidad para uso diario."
    },
    {
      "id": 3,
      "nombre": "Lámpara LED",
      "categoria": "Hogar",
      "precio": 241.5,
      "stock": 175,
      "sku": "SKU-00003",
      "descripcion": "Lámpara LED de alta calidad para uso diario."
    },
    {
      "id": 4,
      "nombre": "Sofá minimalista",
      "categoria": "Muebles",
      "precio": 490.89,
      "stock": 67,
      "sku": "SKU-00004",
      "descripcion": "Sofá minimalista de alta calidad para uso diario."
    },
    {
      "id": 5,
      "nombre": "Cargador USB-C",
      "categoria": "Electrónica",
      "precio": 745.65,
      "stock": 36,
      "sku": "SKU-00005",
      "descripcion": "Cargador USB-C de alta calidad para uso diario."
    },
    {
      "id": 6,
      "nombre": "Plato de cerámica",
      "categoria": "Hogar",
      "precio": 680.29,
      "stock": 107,
      "sku": "SKU-00006",
      "descripcion": "Plato de cerámica de alta calidad para uso diario."
    },
    {
      "id": 7,
      "nombre": "Auriculares inalámbricos",
      "categoria": "Electrónica",
      "precio": 673.9,
      "stock": 102,
      "sku": "SKU-00007",
      "descripcion": "Auriculares inalámbricos de alta calidad para uso diario."
    },
    {
      "id": 8,
      "nombre": "Mesa de centro",
      "categoria": "Muebles",
      "precio": 183.79,
      "stock": 93,
      "sku": "SKU-00008",
      "descripcion": "Mesa de centro de alta calidad para uso diario."
    },
    {
      "id": 9,
      "nombre": "Mancuerna 10kg",
      "categoria": "Deportes",
      "precio": 410.35,
      "stock": 186,
      "sku": "SKU-00009",
      "descripcion": "Mancuerna 10kg de alta calidad para uso diario."
    },
    {
      "id": 10,
      "nombre": "Pelota de fútbol",
      "categoria": "Deportes",
      "precio": 379.9,
      "stock": 183,
      "sku": "SKU-00010",
      "descripcion": "Pelota de fútbol de alta calidad para uso diario."
    },
    {
      "id": 11,
      "nombre": "Pantalón casual",
      "categoria": "Ropa",
      "precio": 437.09,
      "stock": 139,
      "sku": "SKU-00011",
      "descripcion": "Pantalón casual de alta calidad para uso diario."
    },
    {
      "id": 12,
      "nombre": "Raqueta de tenis",
      "categoria": "Deportes",
      "precio": 730.6,
      "stock": 101,
      "sku": "SKU-00012",
      "descripcion": "Raqueta de tenis de alta calidad para uso diario."
    },
    {
      "id": 13,
      "nombre": "Sudadera",
      "categoria": "Ropa",
      "precio": 390.39,
      "stock": 159,
      "sku": "SKU-00013",
      "descripcion": "Sudadera de alta calidad para uso diario."
    },
    {
      "id": 14,
      "nombre": "Smartwatch",
      "categoria": "Electrónica",
      "precio": 710.49,
      "stock": 145,
      "sku": "SKU-00014",
      "descripcion": "Smartwatch de alta calidad para uso diario."
    },
    {
      "id": 15,
      "nombre": "Chaqueta ligera",
      "categoria": "Ropa",
      "precio": 189.25,
      "stock": 64,
      "sku": "SKU-00015",
      "descripcion": "Chaqueta ligera de alta calidad para uso diario."
    },
    {
      "id": 16,
      "nombre": "Gorra deportiva",
      "categoria": "Deportes",
      "precio": 643.09,
      "stock": 183,
      "sku": "SKU-00016",
      "descripcion": "Gorra deportiva de alta calidad para uso diario."
    },
    {
      "id": 17,
      "nombre": "Sudadera",
      "categoria": "Ropa",
      "precio": 676.19,
      "stock": 61,
      "sku": "SKU-00017",
      "descripcion": "Sudadera de alta calidad para uso diario."
    },
    {
      "id": 18,
      "nombre": "Pelota de fútbol",
      "categoria": "Deportes",
      "precio": 128.65,
      "stock": 172,
      "sku": "SKU-00018",
      "descripcion": "Pelota de fútbol de alta calidad para uso diario."
    },
    {
      "id": 19,
      "nombre": "Raqueta de tenis",
      "categoria": "Deportes",
      "precio": 540.52,
      "stock": 90,
      "sku": "SKU-00019",
      "descripcion": "Raqueta de tenis de alta calidad para uso diario."
    },
    {
      "id": 20,
      "nombre": "Organizador de cocina",
      "categoria": "Hogar",
      "precio": 497.85,
      "stock": 99,
      "sku": "SKU-00020",
      "descripcion": "Organizador de cocina de alta calidad para uso diario."
    },
    {
      "id": 21,
      "nombre": "Estantería modular",
      "categoria": "Muebles",
      "precio": 77.35,
      "stock": 189,
      "sku": "SKU-00021",
      "descripcion": "Estantería modular de alta calidad para uso diario."
    },
    {
      "id": 22,
      "nombre": "Teclado mecánico",
      "categoria": "Electrónica",
      "precio": 95.69,
      "stock": 8,
      "sku": "SKU-00022",
      "descripcion": "Teclado mecánico de alta calidad para uso diario."
    },
    {
      "id": 23,
      "nombre": "Gorra deportiva",
      "categoria": "Deportes",
      "precio": 554.19,
      "stock": 182,
      "sku": "SKU-00023",
      "descripcion": "Gorra deportiva de alta calidad para uso diario."
    },
    {
      "id": 24,
      "nombre": "Pelota de fútbol",
      "categoria": "Deportes",
      "precio": 251.79,
      "stock": 33,
      "sku": "SKU-00024",
      "descripcion": "Pelota de fútbol de alta calidad para uso diario."
    }
  ],
  "productos": [
    {
      "id": 1,
      "nombre": "Silla ergonómica",
      "categoria": "Muebles",
      "precio": 158.35,
      "stock": 120,
      "sku": "SKU-00001",
      "descripcion": "Silla ergonómica de alta calidad para uso diario."
    },
    {
      "id": 2,
      "nombre": "Estantería modular",
      "categoria": "Muebles",
      "precio": 567.95,
      "stock": 193,
      "sku": "SKU-00002",
      "descripcion": "Estantería modular de alta calidad para uso diario."
    },
    {
      "id": 3,
      "nombre": "Lámpara LED",
      "categoria": "Hogar",
      "precio": 241.5,
      "stock": 175,
      "sku": "SKU-00003",
      "descripcion": "Lámpara LED de alta calidad para uso diario."
    },
    {
      "id": 4,
      "nombre": "Sofá minimalista",
      "categoria": "Muebles",
      "precio": 490.89,
      "stock": 67,
      "sku": "SKU-00004",
      "descripcion": "Sofá minimalista de alta calidad para uso diario."
    },
    {
      "id": 5,
      "nombre": "Cargador USB-C",
      "categoria": "Electrónica",
      "precio": 745.65,
      "stock": 36,
      "sku": "SKU-00005",
      "descripcion": "Cargador USB-C de alta calidad para uso diario."
    },
    {
      "id": 6,
      "nombre": "Plato de cerámica",
      "categoria": "Hogar",
      "precio": 680.29,
      "stock": 107,
      "sku": "SKU-00006",
      "descripcion": "Plato de cerámica de alta calidad para uso diario."
    },
    {
      "id": 7,
      "nombre": "Auriculares inalámbricos",
      "categoria": "Electrónica",
      "precio": 673.9,
      "stock": 102,
      "sku": "SKU-00007",
      "descripcion": "Auriculares inalámbricos de alta calidad para uso diario."
    },
    {
      "id": 8,
      "nombre": "Mesa de centro",
      "categoria": "Muebles",
      "precio": 183.79,
      "stock": 93,
      "sku": "SKU-00008",
      "descripcion": "Mesa de centro de alta calidad para uso diario."
    },
    {
      "id": 9,
      "nombre": "Mancuerna 10kg",
      "categoria": "Deportes",
      "precio": 410.35,
      "stock": 186,
      "sku": "SKU-00009",
      "descripcion": "Mancuerna 10kg de alta calidad para uso diario."
    },
    {
      "id": 10,
      "nombre": "Pelota de fútbol",
      "categoria": "Deportes",
      "precio": 379.9,
      "stock": 183,
      "sku": "SKU-00010",
      "descripcion": "Pelota de fútbol de alta calidad para uso diario."
    },
    {
      "id": 11,
      "nombre": "Pantalón casual",
      "categoria": "Ropa",
      "precio": 437.09,
      "stock": 139,
      "sku": "SKU-00011",
      "descripcion": "Pantalón casual de alta calidad para uso diario."
    },
    {
      "id": 12,
      "nombre": "Raqueta de tenis",
      "categoria": "Deportes",
      "precio": 730.6,
      "stock": 101,
      "sku": "SKU-00012",
      "descripcion": "Raqueta de tenis de alta calidad para uso diario."
    },
    {
      "id": 13,
      "nombre": "Sudadera",
      "categoria": "Ropa",
      "precio": 390.39,
      "stock": 159,
      "sku": "SKU-00013",
      "descripcion": "Sudadera de alta calidad para uso diario."
    },
    {
      "id": 14,
      "nombre": "Smartwatch",
      "categoria": "Electrónica",
      "precio": 710.49,
      "stock": 145,
      "sku": "SKU-00014",
      "descripcion": "Smartwatch de alta calidad para uso diario."
    },
    {
      "id": 15,
      "nombre": "Chaqueta ligera",
      "categoria": "Ropa",
      "precio": 189.25,
      "stock": 64,
      "sku": "SKU-00015",
      "descripcion": "Chaqueta ligera de alta calidad para uso diario."
    },
    {
      "id": 16,
      "nombre": "Gorra deportiva",
      "categoria": "Deportes",
      "precio": 643.09,
      "stock": 183,
      "sku": "SKU-00016",
      "descripcion": "Gorra deportiva de alta calidad para uso diario."
    },
    {
      "id": 17,
      "nombre": "Sudadera",
      "categoria": "Ropa",
      "precio": 676.19,
      "stock": 61,
      "sku": "SKU-00017",
      "descripcion": "Sudadera de alta calidad para uso diario."
    },
    {
      "id": 18,
      "nombre": "Pelota de fútbol",
      "categoria": "Deportes",
      "precio": 128.65,
      "stock": 172,
      "sku": "SKU-00018",
      "descripcion": "Pelota de fútbol de alta calidad para uso diario."
    },
    {
      "id": 19,
      "nombre": "Raqueta de tenis",
      "categoria": "Deportes",
      "precio": 540.52,
      "stock": 90,
      "sku": "SKU-00019",
      "descripcion": "Raqueta de tenis de alta calidad para uso diario."
    },
    {
      "id": 20,
      "nombre": "Organizador de cocina",
      "categoria": "Hogar",
      "precio": 497.85,
      "stock": 99,
      "sku": "SKU-00020",
      "descripcion": "Organizador de cocina de alta calidad para uso diario."
    },
    {
      "id": 21,
      "nombre": "Estantería modular",
      "categoria": "Muebles",
      "precio": 77.35,
      "stock": 189,
      "sku": "SKU-00021",
      "descripcion": "Estantería modular de alta calidad para uso diario."
    },
    {
      "id": 22,
      "nombre": "Teclado mecánico",
      "categoria": "Electrónica",
      "precio": 95.69,
      "stock": 8,
      "sku": "SKU-00022",
      "descripcion": "Teclado mecánico de alta calidad para uso diario."
    },
    {
      "id": 23,
      "nombre": "Gorra deportiva",
      "categoria": "Deportes",
      "precio": 554.19,
      "stock": 182,
      "sku": "SKU-00023",
      "descripcion": "Gorra deportiva de alta calidad para uso diario."
    },
    {
      "id": 24,
      "nombre": "Pelota de fútbol",
      "categoria": "Deportes",
      "precio": 251.79,
      "stock": 33,
      "sku": "SKU-00024",
      "descripcion": "Pelota de fútbol de alta calidad para uso diario."
    }
  ]
}
```

## Reto extra: dump real ficticio y anonimización antes de usarlo

Este reto complementa el catálogo de tienda. Su objetivo es simular una copia de producción con datos personales y luego anonimizarlos para que puedan usarse en test o entornos no productivos sin riesgo de exponer información sensible.

### 1) Script que genera el dump real ficticio

Archivo: [datos/3-anomizar/1-generar-dump-real.js](datos/3-anomizar/1-generar-dump-real.js)

```js
/**
 * EJERCICIO 3 (parte A) - Generar un dump "real" de clientes.
 *
 * Simula una copia de produccion con datos PERSONALES: nombre, email,
 * documento, telefono y fecha de nacimiento. En la vida real esto vendria
 * de un backup de la base de datos; aqui lo fabricamos con Faker para
 * poder practicar la anonimizacion SIN usar datos de personas reales.
 */
import { faker } from '@faker-js/faker';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const carpeta = __dirname;
const ruta = path.join(carpeta, 'clientes.json');

const CANTIDAD = 15;

faker.seed(2024);

function documentoAleatorio() {
  return String(faker.number.int({ min: 1000000000, max: 9999999999 }));
}

function telefonoAleatorio() {
  return String(faker.number.int({ min: 3000000000, max: 3999999999 }));
}

function crearCliente(id) {
  return {
    id,
    nombre: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    documento: documentoAleatorio(),
    telefono: telefonoAleatorio(),
    fecha_nacimiento: faker.date
      .birthdate({ min: 18, max: 80, mode: 'age' })
      .toISOString()
      .slice(0, 10)
  };
}

const clientes = Array.from({ length: CANTIDAD }, (_, i) => crearCliente(i + 1));

fs.mkdirSync(carpeta, { recursive: true });
fs.writeFileSync(ruta, JSON.stringify(clientes, null, 2));
```

#### Qué hace este script

- genera 15 clientes ficticios,
- usa una semilla fija para que el resultado sea reproducible,
- da valores realistas para:
  - `nombre`
  - `email`
  - `documento`
  - `telefono`
  - `fecha_nacimiento`
- escribe el archivo [datos/3-anomizar/clientes.json](datos/3-anomizar/clientes.json).

> Este archivo representa un dump “real”, pero ficticio. No debe salir del entorno productivo sin tratamiento previo.

### 2) Script que aplica la anonimización

Archivo: [datos/3-anomizar/2-anonimizar.js](datos/3-anomizar/2-anonimizar.js)

```js
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { faker } from '@faker-js/faker';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const carpeta = __dirname;
const rutaEntrada = path.join(carpeta, 'clientes.json');
const rutaSalida = path.join(carpeta, 'clientes-anonimos.json');

faker.seed(777);

function maskEmail(email) {
  const [user, domain] = email.split('@');
  const tld = domain.split('.').pop();
  return user.slice(0, 2) + '***@***.' + tld;
}

function maskTelefono(tel) {
  return String(tel).replace(/\d(?=\d{2})/g, '*');
}

function hashDoc(doc) {
  return crypto.createHash('sha256').update(String(doc)).digest('hex').slice(0, 12);
}

function year(fechaISO) {
  return new Date(fechaISO).getFullYear();
}

if (!fs.existsSync(rutaEntrada)) {
  console.error('No existe reales/clientes.json. Corre primero:  npm run dump-real');
  process.exit(1);
}

const reales = JSON.parse(fs.readFileSync(rutaEntrada, 'utf-8'));

const anonimos = reales.map(c => ({
  id: c.id,
  nombre: faker.person.fullName(),
  email: maskEmail(c.email),
  documento: hashDoc(c.documento),
  telefono: maskTelefono(c.telefono),
  anio_nacimiento: year(c.fecha_nacimiento)
}));

fs.writeFileSync(rutaSalida, JSON.stringify(anonimos, null, 2));
```

#### Técnica aplicada a cada campo

- `nombre`: sustitución sintética
  - se reemplaza por un nombre falso generado por Faker,
  - evita que se exponga la identidad real.

- `email`: enmascarado
  - ejemplo: `ana.lopez@gmail.com` → `an***@***.com`
  - mantiene una forma útil para pruebas sin revelar la dirección original.

- `documento`: hash irreversible
  - se aplica SHA-256 y se guarda solo parte del valor,
  - permite relacionar registros sin exponer el documento real.

- `telefono`: enmascarado
  - se ocultan la mayoría de los dígitos,
  - se mantiene una forma útil para validaciones superficiales.

- `fecha_nacimiento`: generalización
  - se transforma en solo el año,
  - elimina la precisión de la fecha exacta.

### 3) Resultado esperado

El archivo generado es [datos/3-anomizar/clientes-anonimos.json](datos/3-anomizar/clientes-anonimos.json), y contiene registros seguros para pruebas, por ejemplo:

```json
[
  {
    "id": 1,
    "nombre": "María García",
    "email": "ma***@***.com",
    "documento": "8c76d3a4f691",
    "telefono": "********01",
    "anio_nacimiento": 1989
  }
]
```

### 4) ¿Por qué esto es importante?

Este patrón responde a la necesidad de proteger datos personales sin perder capacidad de prueba:

- el dump original se usa solo como fuente ficticia de producción,
- el dump anonimizadod se usa para entornos de QA, pruebas y desarrollo,
- se reduce el riesgo de fuga de datos personales,
- se mantiene la estructura y la utilidad del dataset.

### 5) Regla práctica del proyecto

- `dump real ficticio` = se genera, pero no se reutiliza sin anonimizar.
- `dump anonimizad` = es el que sí puede compartirse o usarse en pruebas.
- la semilla fija garantiza reproductibilidad del ejemplo y una base de datos segura y consistente.

---

Este reto extra cierra el ciclo de generación y protección de datos: primero se crea un dataset plausible, luego se sanitiza para que sea seguro para uso en entornos no productivos.

## Nota

La semilla fija es `12345` y el generado se valida con la ejecución del script. El fichero resultante se puede servir con `json-server` para un endpoint `/catalogo` o `/productos` según la estructura elegida.

