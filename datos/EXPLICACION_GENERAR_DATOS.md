# Explicación del script de generación de datos con Faker y semilla fija

He revisado el archivo [datos/2-faker/generar-datos.js](datos/2-faker/generar-datos.js). Aquí tienes la explicación detallada.

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
```

- Este bloque es solo documentación.
- Explica el objetivo del script: crear un catálogo de tienda, con varias categorías y una cantidad mínima de productos.
- También deja claro que los datos deben ser reproducibles en cualquier máquina.

---

```js
import { faker } from '@faker-js/faker';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
```

- `import { faker } from '@faker-js/faker';`
  - Importa la librería Faker para generar datos aleatorios sintéticos.
- `import fs from 'node:fs';`
  - Importa el módulo `fs` de Node para escribir archivos JSON.
- `import path from 'node:path';`
  - Importa utilidades para trabajar con rutas de archivos.
- `import { fileURLToPath } from 'node:url';`
  - Permite obtener la ruta real del archivo JavaScript para guardar el JSON en la carpeta correcta.

---

```js
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaCatalogo = path.join(__dirname, 'catalogo.json');
const rutaDb = path.join(__dirname, 'db.json');
```

- `__dirname` obtiene la carpeta del script.
- `rutaCatalogo` apunta a `2-faker/catalogo.json`
- `rutaDb` apunta a `2-faker/db.json`

Esto permite guardar el resultado en la misma carpeta del script.

---

```js
const CANTIDAD = 24;
const SEMILLA = 12345;
```

- `CANTIDAD = 24`
  - Genera 24 productos.
- `SEMILLA = 12345`
  - Número fijo que hace que Faker genere siempre el mismo resultado.
  - Esto es lo que hace que los datos sean reproducibles.

---

```js
faker.seed(SEMILLA);
```

- Esta línea es la clave del reto.
- Fija la semilla del generador aleatorio de Faker.
- Si se ejecuta el script dos veces con la misma semilla, se obtienen los mismos datos.
- Eso evita que cambien en cada máquina o ejecución.

---

```js
const categorias = [
  { nombre: 'Hogar', productos: ['Lámpara LED', 'Cafetera', 'Juego de sábanas', 'Tetera', 'Plato de cerámica', 'Organizador de cocina'] },
  { nombre: 'Ropa', productos: ['Camiseta básica', 'Pantalón casual', 'Chaqueta ligera', 'Zapatillas urbanas', 'Sudadera', 'Bufanda'] },
  { nombre: 'Electrónica', productos: ['Auriculares inalámbricos', 'Teclado mecánico', 'Monitor 24"', 'Altavoz Bluetooth', 'Cargador USB-C', 'Smartwatch'] },
  { nombre: 'Deportes', productos: ['Pelota de fútbol', 'Mancuerna 10kg', 'Botella de hidratación', 'Raqueta de tenis', 'Gorra deportiva', 'Mochila de senderismo'] },
  { nombre: 'Muebles', productos: ['Mesa de centro', 'Silla ergonómica', 'Escritorio compacto', 'Estantería modular', 'Sofá minimalista', 'Velador'] }
];
```

- Aquí se definen 5 categorías reales de una tienda:
  - Hogar
  - Ropa
  - Electrónica
  - Deportes
  - Muebles
- Cada categoría tiene varios nombres de productos coherentes con el tipo de categoría.
- Esto cumple el requisito de “al menos 4 categorías”.

---

```js
function crearProducto(id) {
  const categoria = faker.helpers.arrayElement(categorias);
  const nombre = faker.helpers.arrayElement(categoria.productos);
  const precio = Number(faker.commerce.price({ min: 25, max: 750, dec: 2 }));
  const stock = faker.number.int({ min: 3, max: 200 });
```

- `crearProducto(id)` crea un producto para cada ID.
- `const categoria = faker.helpers.arrayElement(categorias);`
  - Escoge una categoría aleatoria, pero siempre válida.
- `const nombre = faker.helpers.arrayElement(categoria.productos);`
  - Escoge un nombre de producto dentro de la categoría seleccionada.
- `const precio = Number(faker.commerce.price({ min: 25, max: 750, dec: 2 }));`
  - Genera un precio entre 25 y 750 con 2 decimales.
- `const stock = faker.number.int({ min: 3, max: 200 });`
  - Genera stock con un valor realista.

---

```js
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
```

- Devuelve un objeto con la estructura del producto:
  - `id`: identificador
  - `nombre`: nombre del producto
  - `categoria`: nombre de la categoría
  - `precio`: precio del producto
  - `stock`: unidades disponibles
  - `sku`: identificador comercial formateado, por ejemplo `SKU-00001`
  - `descripcion`: texto descriptivo

Esto corresponde a los campos coherentes que pedía el reto: nombre, precio, stock y categoría.

---

```js
const productos = Array.from({ length: CANTIDAD }, (_, i) => crearProducto(i + 1));
const catalogo = { catalogo: productos, productos };
```

- `Array.from({ length: CANTIDAD }, ...)`
  - Genera un array de 24 elementos.
- `crearProducto(i + 1)`
  - Crea cada producto con IDs del 1 al 24.
- `const catalogo = { catalogo: productos, productos };`
  - Guarda todo el catálogo en un objeto con dos propiedades:
    - `catalogo`
    - `productos`
  - Esto hace que se pueda usar fácilmente con `json-server` o en otras partes del proyecto.

---

```js
fs.writeFileSync(rutaCatalogo, JSON.stringify(catalogo, null, 2));
fs.writeFileSync(rutaDb, JSON.stringify(catalogo, null, 2));
```

- Escribe el JSON generado en dos archivos:
  - `catalogo.json`
  - `db.json`
- `JSON.stringify(catalogo, null, 2)` formatea el JSON con indentación legible.

---

```js
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

- Muestra un resumen de lo generado.
- Se imprimen:
  - número total de productos,
  - categorías usadas,
  - los primeros 3 productos,
  - cómo servir el JSON con `json-server`.

---

## ¿Por qué NO versionas los datos generados?

Los datos generados por Faker son:
- sintéticos,
- reproducibles,
- no son fuente de verdad,
- se regeneran desde la semilla y el script.

Por eso NO conviene versionarlos en Git como “dato final”:
- Si se suben a Git, se vuelven un artefacto estático y pueden quedar desactualizados.
- El pipeline o la ejecución del script debe volver a generarlos con una semilla fija.
- Eso permite reproducibilidad total en cualquier entorno.
- También evita diffs innecesarios en el repositorio.
- No se depende de un fichero generado para el funcionamiento, sino del propio script que lo recrea.

En resumen:

- El código del generador sí se versiona.
- Los resultados generados se regeneran automáticamente con el mismo script y semilla.
- Ese es el patrón correcto para datasets sintéticos.

Si quieres, también puedo dejarte el bloque final con una versión aún más “lista para entregar” del script y del JSON resultante ya generado.

