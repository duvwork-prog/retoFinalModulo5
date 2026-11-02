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
  { nombre: 'hogar', productos: ['Lámpara LED', 'Cafetera', 'Juego de sábanas', 'Tetera', 'Plato de cerámica', 'Organizador de cocina'] },
  { nombre: 'ropa', productos: ['Camiseta básica', 'Pantalón casual', 'Chaqueta ligera', 'Zapatillas urbanas', 'Sudadera', 'Bufanda'] },
  { nombre: 'tecnologia', productos: ['Auriculares inalámbricos', 'Teclado mecánico', 'Monitor 24"', 'Altavoz Bluetooth', 'Cargador USB-C', 'Smartwatch'] },
  { nombre: 'juguetes', productos: ['Pelota de fútbol', 'Mancuerna 10kg', 'Botella de hidratación', 'Raqueta de tenis', 'Gorra deportiva', 'Mochila de senderismo'] }
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
