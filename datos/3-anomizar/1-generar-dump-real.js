/**
 * RETO EXTRA - Generar un dump real ficticio de clientes.
 *
 * Este script simula una copia de producción con datos personales:
 * nombre, email, documento, teléfono y fecha de nacimiento.
 *
 * En un entorno real, este dato vendría de un backup o una base de datos
 * operational; aquí se fabrica con Faker para practicar la anonimizacion
 * sin usar datos de personas reales.
 *
 * IMPORTANTE:
 * - Este archivo NO debe usarse fuera de producción ni compartirse crudo.
 * - El siguiente paso, 2-anonimizar.js, transforma estos registros en un
 *   dataset seguro para QA, pruebas y entornos no productivos.
 *
 * Ejecutar desde la carpeta raiz del proyecto:
 *   node 3-anomizar/1-generar-dump-real.js
 *   npm run dump-real
 *
 * Salida:
 *   3-anomizar/clientes.json
 */

import { faker } from '@faker-js/faker';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// El script vive dentro de reales/, la salida va en la misma carpeta
const carpeta = __dirname;
const ruta = path.join(carpeta, 'clientes.json');

const CANTIDAD = 15;

// Semilla distinta a la del otro script: son datos "de otra fuente".
faker.seed(2024);

function documentoAleatorio() {
  // Documento de 10 digitos (tipo cedula), como string
  return String(faker.number.int({ min: 1000000000, max: 9999999999 }));
}

function telefonoAleatorio() {
  // Telefono de 10 digitos, solo numeros (facil de enmascarar despues)
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

console.log('===== EJERCICIO 3A: dump "real" (SIMULADO) =====');
console.log('Generados ' + clientes.length + ' clientes en reales/clientes.json');
console.log('OJO: trae datos personales (documento, email, telefono). NO usar crudo en test.');
console.log('Ejemplo (real): ' + clientes[0].nombre + ' | ' + clientes[0].email +
  ' | doc ' + clientes[0].documento + ' | tel ' + clientes[0].telefono);
console.log('Siguiente paso:  npm run anonimizar');
console.log('================================================');
