# Resumen para el tutor — Reto Final QA Cloud Native

## 1. Objetivo del proyecto

Este repositorio demuestra una solución completa de calidad y entrega continua para una app de tienda, integrando:

- aplicación web y API en Node.js/Express,
- generación de datos sintéticos,
- validación con smoke test y pruebas de carga,
- pipeline en Azure DevOps con gates de calidad,
- automatización E2E con Playwright + pytest-bdd + Screenplay,
- documentación y trazabilidad para entrega final.

---

## 2. Resultado de la reestructuración realizada

Se realizó la normalización del repositorio para dejarlo consistente y funcional:

- renombrado del proyecto de datos sintéticos a `datos`,
- ajuste de rutas y referencias internas,
- movimiento del pipeline principal a la carpeta de pipelines,
- validación de la estructura del repositorio y de la ejecución real,
- actualización de la documentación del proyecto en el README principal.

La estructura final queda organizada en los siguientes bloques principales:

- [app-tienda](app-tienda): aplicación principal
- [datos](datos): generación de datos sintéticos
- [e2e](e2e): automatización de pruebas E2E
- [pipelines](pipelines): pipeline Azure DevOps
- [README.md](README.md): resumen general del proyecto

---

## 3. Estado de las fases del proyecto

### Fase 3 — Del caso manual al automatizado con IA

Se dejó preparada la base para automatización con IA:

- la app se usa como sistema bajo prueba,
- la suite E2E está desarrollada con Playwright, pytest-bdd y Screenplay,
- los casos de negocio están expresados en Gherkin,
- se usan tags tipo `@TC19`, `@TC20` y `@TC21` para vincularlos con Azure Test Plans.

### Fase 4 — Ejecución en la nube

El flujo está preparado para Azure DevOps:

- se define la pipeline con stages de Build, SmokeTests y LoadTest,
- la validación se hace con gates reales,
- se documenta la conexión con GitHub y la ejecución en la nube.

### Fase 5 — Contenedores y contract testing

Se incorporó la base para contenerización:

- la app cuenta con un Dockerfile,
- la estructura del proyecto es compatible con despliegues por contenedor,
- queda preparada la evolución hacia pruebas de contrato con Pact.

### Fase 6 — Métricas y estrategia

La solución incorpora métricas reales del negocio:

- latencia p95,
- tasa de error,
- gate de calidad para no permitir despliegue si no se cumple el SLA,
- trazabilidad de resultados con Azure Test Plans y Allure.

---

## 4. Evidencias de validación ejecutadas

### 4.1 Validación de la app y smoke test

Se ejecutó la app de tienda y se validó la API con smoke tests reales.

Resultado verificado:

- 7 validaciones OK
- 0 fallidas
- smoke test superado

### 4.2 Validación de carga con gate de rendimiento

Se ejecutó la carga real contra la app.

Resultado verificado:

- p95 = 20.9 ms
- error = 0.00%
- SLA cumplido

### 4.3 Validación E2E con Python 3.12

Se diagnosticó que el entorno de pruebas fallaba con Python 3.14 por incompatibilidad de `greenlet`.

Se corrigió el entorno usando Python 3.12 y se ejecutó la suite de pruebas completa.

Resultado verificado:

- `4 passed in 9.12s`

Esto confirma que la automatización E2E funciona correctamente sobre la app ya levantada.

---

## 5. Causa raíz de la problemática de entorno

El problema principal no estaba en la aplicación, sino en la versión del intérprete de Python.

- Python 3.14 no era compatible con la dependencia `greenlet` usada por Playwright.
- La solución correcta fue reutilizar Python 3.12, que sí soporta la stack de pruebas E2E del proyecto.

Este ajuste quedó documentado como requisito operativo del entorno de ejecución.

---

## 6. Estado final del proyecto

El proyecto queda en estado funcional y listo para la entrega final con:

- app funcionando,
- pipeline estructurado con gate real,
- smoke y carga verificados,
- E2E validado,
- documentación actualizada,
- proyecto listo para presentación o continuación académica.

---

## 7. Conclusión

El reto final queda concluido de forma consistente y con evidencia ejecutada en entorno real. La solución no solo está estructurada, sino también verificada: la app responde, la carga cumple el SLA, y la suite E2E pasa completamente.

Este repositorio cumple el objetivo de demostrar un flujo realista de calidad y entrega continua en un entorno Cloud Native.
