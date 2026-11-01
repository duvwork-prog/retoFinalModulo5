# Documentación del proyecto: datos sintéticos, anonimización y Azure Pipelines

Este documento reúne todo lo que se ha realizado en el proyecto para cumplir la fase de generación de datos, anonimización y automatización de validación con Azure Pipelines.

---

## 1. Generación del catálogo con Faker y semilla fija

Se creó el script [datos/2-faker/generar-datos.js](datos/2-faker/generar-datos.js), que genera un catálogo de tienda reproducible con semilla fija.

### Objetivo
- Generar un catálogo con 24 productos.
- Incluir al menos 4 categorías.
- Mantener datos reproducibles en cualquier máquina.
- Usar una estructura compatible con `json-server`.

### Características clave
- Semilla fija: `12345`
- Categorías: Hogar, Ropa, Electrónica, Deportes, Muebles
- Campos por producto: `id`, `nombre`, `categoria`, `precio`, `stock`, `sku`, `descripcion`
- Salida generada: [datos/2-faker/catalogo.json](datos/2-faker/catalogo.json)

### Verificación ejecutada
Se validó con:

```powershell
cd "c:\Users\duvce\OneDrive\Documentos\DiplomadoLtThinking\Modulo5\RetoFinal\datos"
node 2-faker/generar-datos.js
```

Resultado verificado:
- 24 productos generados
- 5 categorías presentes
- primer registro válido con nombre, categoría, precio y stock

---

## 2. Reto extra: dump real ficticio y anonimización

Se añadió el flujo de generación y anonimización en:

- [datos/3-anomizar/1-generar-dump-real.js](datos/3-anomizar/1-generar-dump-real.js)
- [datos/3-anomizar/2-anonimizar.js](datos/3-anomizar/2-anonimizar.js)

### Flujo
1. Genera un dump ficticio “real” con datos personales simulados.
2. Crea un archivo con datos sensibles: nombre, email, documento, teléfono y fecha de nacimiento.
3. Aplica anonimización:
   - nombres sustituidos por nombres falsos
   - emails enmascarados
   - documento con hash SHA-256
   - teléfono enmascarado
   - año de nacimiento como generalización
4. Guarda el resultado seguro en [datos/3-anomizar/clientes-anonimos.json](datos/3-anomizar/clientes-anonimos.json)

### Verificación ejecutada
Se ejecutó:

```powershell
cd "c:\Users\duvce\OneDrive\Documentos\DiplomadoLtThinking\Modulo5\RetoFinal\datos"
npm run dump-real
npm run anonimizar
```

Resultado verificado:
- Se generaron 15 clientes ficticios
- Se anonimizó el mismo número de registros
- Ejemplo verificado:
  - antes: nombre real + email real
  - después: nombre falso + email enmascarado + documento hash + teléfono oculto + año de nacimiento

---

## 3. Pipeline Azure Pipelines

Se creó el archivo [datos/azure-pipelines.yml](datos/azure-pipelines.yml)

### Stages incluidos
- Build
- SmokeTests
- LoadTest

### Qué valida cada etapa
#### Build
Valida que el proyecto tiene los archivos y metadata necesarios.

Script asociado:
- [datos/scripts/build-check.js](datos/scripts/build-check.js)

#### SmokeTests
Valida que la aplicación “encendió” y responde:
- `/health`
- `/catalogo`
- creación de pedido vía `/pedidos`

Script asociado:
- [datos/scripts/smoke-tests.js](datos/scripts/smoke-tests.js)
- [datos/scripts/mock-app.js](datos/scripts/mock-app.js)

#### LoadTest
Valida el SLA del sistema:
- p95 < 800 ms
- error rate < 1%

Si falla cualquiera de estas condiciones, el script sale con `exit 1`, bloqueando el deploy.

Script asociado:
- [datos/scripts/load-test.js](datos/scripts/load-test.js)

---

## 4. Scripts añadidos para la automatización

Se añadieron scripts de ejecución al [datos/package.json](datos/package.json):

- `build`
- `smoke`
- `load`
- `load:green`
- `load:red`

### Uso
```powershell
npm run build
npm run smoke
npm run load:green
npm run load:red
```

---

## 5. Demostración de gate verde y rojo

### Verde
Se ejecutó:

```powershell
npm run load:green
```

Resultado verificado:
- p95_ms=21.47
- error_rate=0.0000
- `LOAD TEST PASS: SLA gate passed.`

### Rojo
Se ejecutó:

```powershell
npm run load:red
```

Resultado verificado:
- p95_ms=21.94
- SLA forzada a 1 ms
- `LOAD TEST FAILED`
- el proceso termina con código 1, demostrando que el gate de carga bloquea el despliegue

---

## 6. Dónde está cada gate

- Build gate: en [datos/azure-pipelines.yml](datos/azure-pipelines.yml), etapa `Build`
- Smoke gate: en [datos/azure-pipelines.yml](datos/azure-pipelines.yml), etapa `SmokeTests`
- Load gate: en [datos/azure-pipelines.yml](datos/azure-pipelines.yml), etapa `LoadTest`

La etapa `LoadTest` actúa como quality gate final:
- si pasa, sigue el pipeline
- si falla, detiene el deploy con `exit 1`

---

## 7. Resultado final

Se dejó el proyecto con:
- catálogo reproducible generado con Faker,
- dump ficticio “real” con anonimización,
- pipeline Azure DevOps con 3 stages,
- validación de smoke test,
- quality gate de carga con SLA
- evidencia de ejecución en verde y rojo.

Esto cumple el objetivo de la fase: automatizar build, smoke y carga, y detener el despliegue cuando no se cumple la calidad mínima exigida.

