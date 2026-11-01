# Reto Final — QA Cloud Native

Este repositorio reúne la aplicación de ejemplo y la automatización de validación para la fase final del módulo de QA Cloud Native. El objetivo es demostrar un flujo realista de integración continua con validaciones de calidad en cada cambio del código.

## 1. Objetivo del proyecto

La solución incluye:

- Una aplicación de tienda con front y API: [app-tienda](app-tienda)
- Scripts de smoke y carga para validar la app en pipeline: [app-tienda/tests](app-tienda/tests)
- Un pipeline Azure DevOps con gates de calidad: [app-tienda/pipelines/azure-pipelines.yml](app-tienda/pipelines/azure-pipelines.yml)
- Un proyecto de generación y preparación de datos: [datos](datos)

La idea principal es asegurar que la app se ejecute correctamente, responda a las rutas críticas y cumpla un SLA de rendimiento antes de permitir el despliegue.

## 2. Estructura del repositorio

```text
RetoFinal/
├── app-tienda/
│   ├── servidor/
│   ├── public/
│   ├── datos/
│   ├── tests/
│   ├── pipelines/
│   │   └── azure-pipelines.yml
│   ├── package.json
│   └── README.md
├── datos/
│   ├── package.json
│   ├── scripts/
│   └── README.md
├── e2e/
├── pipelines/
│   └── azure-pipelines.yml
├── README.md
└── .gitignore
```

## 3. Aplicación de tienda

La aplicación base vive en [app-tienda](app-tienda). Es una SPA con una API REST que ofrece:

- Health check: /api/health
- Catálogo: /api/productos
- Pedido: POST /api/pedidos
- Front estático en /

La app se ejecuta con:

```powershell
cd app-tienda
npm install
npm start
```

Se puede abrir en el navegador en:

```text
http://localhost:3000/
```

## 4. Smoke test

El smoke test verifica que la app está funcionando tras el arranque. En la práctica comprueba estos puntos:

- La API responde correctamente en /api/health
- El catálogo está disponible y tiene productos
- Se puede consultar un producto concreto
- La ruta 404 funciona para un producto inexistente
- La web principal responde HTML correctamente
- Se puede crear un pedido válido

El script está en [app-tienda/tests/smoke-api.js](app-tienda/tests/smoke-api.js).

## 5. Prueba de carga y quality gate

La prueba de carga se ejecuta desde [app-tienda/tests/carga-simple.js](app-tienda/tests/carga-simple.js) y mide:

- latencia p95
- tasa de error
- throughput

El SLA definido en el pipeline es:

- p95 < 800 ms
- error < 1%

Si el rendimiento no cumple el SLA, el stage de carga falla con exit code 1 y detiene el despliegue. Esto convierte la carga en un quality gate real.

## 6. Pipeline de Azure DevOps

El pipeline se encuentra en [app-tienda/pipelines/azure-pipelines.yml](app-tienda/pipelines/azure-pipelines.yml).

### Stages

1. Build
   - Instala dependencias
   - Genera los datos necesarios para la app

2. SmokeTests
   - Arranca la api
   - Ejecuta el smoke test
   - Valida health, catálogo y creación de pedido

3. LoadTest
   - Arranca la app
   - Ejecuta la carga
   - Comprueba SLA de rendimiento y errores
   - Si falla, aborta el pipeline

4. Deploy
   - Solo se ejecuta si todos los gates anteriores tienen éxito

### Trigger

El pipeline está configurado para ejecutarse en cambios en main y en pull requests hacia main.

### Ejemplo de YAML para E2E en Sauce Labs

Si se quiere ejecutar la automatización E2E desde un navegador remoto, el pipeline puede incluir un stage adicional apuntando a Sauce Labs sin cambiar los escenarios. Esto permite reutilizar la misma suite, pero ejecutando Playwright desde un agente cloud y apuntando a una URL pública.

```yaml
- stage: CloudE2E
  displayName: CloudE2E
  dependsOn: LoadTest
  condition: succeeded()
  jobs:
    - job: SauceLabsE2E
      pool:
        vmImage: ubuntu-latest
      steps:
        - checkout: self

        - task: UsePythonVersion@0
          displayName: Use Python 3.12
          inputs:
            versionSpec: '3.12'

        - script: |
            cd $(Build.SourcesDirectory)/e2e
            python -m pip install --upgrade pip
            pip install -r requirements.txt
            python -m playwright install chromium
          displayName: Install E2E dependencies

        - script: |
            cd $(Build.SourcesDirectory)/e2e
            export BASE_URL="$(BASE_URL_CLOUD)"
            export PLAYWRIGHT_BROWSER_NAME="chromium"
            export PLAYWRIGHT_REMOTE_WS="$(PLAYWRIGHT_REMOTE_WS)"
            pytest -q --maxfail=1
          displayName: Run E2E tests against remote browser
          env:
            BASE_URL_CLOUD: $(BASE_URL_CLOUD)
            PLAYWRIGHT_REMOTE_WS: $(PLAYWRIGHT_REMOTE_WS)
            SAUCE_USERNAME: $(SAUCE_USERNAME)
            SAUCE_ACCESS_KEY: $(SAUCE_ACCESS_KEY)
            SAUCE_REGION: $(SAUCE_REGION)
```

Variables típicas en Azure DevOps:

```text
BASE_URL_CLOUD=https://tu-app-desplegada.example.com
PLAYWRIGHT_REMOTE_WS=wss://cdp.us-west-1.saucelabs.com/playwright?username=TU_USUARIO&accessKey=TU_ACCESS_KEY
SAUCE_USERNAME=TU_USUARIO
SAUCE_ACCESS_KEY=TU_ACCESS_KEY
SAUCE_REGION=us-west-1
```

En local, la ejecución sigue siendo con `http://localhost:3000`; en Sauce Labs, la app debe ser accesible desde internet y Playwright se conecta al navegador remoto usando el WebSocket de Sauce.

## 7. Integración con GitHub

La conexión con GitHub se realiza desde Azure DevOps seleccionando el repositorio correcto como origen del código. Una vez conectado, el YAML del pipeline queda asociado al repositorio y cada push o PR puede activar la ejecución.

## 8. Demostración de gate rojo y verde

La intención del proyecto es demostrar ambos escenarios:

- Rojo: forzando un SLA más exigente para que la carga falle y el gate detenga el deploy
- Verde: con el SLA válido y la app respondiendo bien, la pipeline continúa hasta Deploy

Esto queda documentado en la evidencia del pipeline y en la ejecución local de los scripts de smoke y carga.

## 9. Cómo ejecutar localmente

### App

```powershell
cd app-tienda
npm install
npm start
```

### Smoke test

```powershell
cd app-tienda
$env:BASE_URL = 'http://localhost:3000'
node tests/smoke-api.js
```

### Carga

```powershell
cd app-tienda
$env:BASE_URL = 'http://localhost:3000'
$env:SLA_P95_MS = '800'
$env:SLA_ERROR_PCT = '1'
node tests/carga-simple.js
```

## 10. Resultado esperado

Un workflow correcto de CI/CD para esta app debe cumplir esta secuencia:

- Build pasa
- Smoke pasa
- Load gate pasa
- Deploy habilitado

Si alguna validación falla, el pipeline se detiene antes del despliegue.

## 11. Estado de las fases del proyecto

### Fase 3 — Del caso manual al automatizado con IA

- La app base queda estabilizada como objetivo de automatización.
- El proyecto incluye pruebas E2E con Playwright + pytest-bdd + Screenplay en [e2e](e2e).
- Los escenarios de negocio se modelan con Gherkin y se asocian a Azure Test Plans mediante tags como `@TC19`, `@TC20` y `@TC21`.
- La automatización ya está preparada para evolucionar con IA a través de MCP, manteniendo la lógica del negocio y mejorando la mantenibilidad.

### Fase 4 — Ejecución en la nube

- El flujo se diseñó para ejecutarse en Azure DevOps con GitHub como origen del repositorio.
- La pipeline local se valida en stages Build, SmokeTests y LoadTest, con un gate de despliegue condicionado a la superación de la carga.
- La ejecución real en Azure requiere configuración del repositorio, la conexión con GitHub y la publicación de resultados, pero la estructura y el YAML ya están preparados para esa operación.

### Fase 5 — Contenedores y contract testing

- La aplicación incluye un [Dockerfile](app-tienda/Dockerfile) listo para conteinerizar la app.
- El proyecto ya contempla el patrón de despliegue por contenedor y healthcheck, aunque la parte de contract testing formal (por ejemplo, simulación con Pact) puede ampliarse en un siguiente paso si se quiere cerrar la capa de integración externa.
- El repositorio contiene la base para integrar pruebas de contrato sin desmontar la automatización existente.

### Fase 6 — Métricas y estrategia

- El pipeline incorpora la métrica real de negocio: p95 y tasa de error como gate de calidad.
- La estrategia de calidad queda enfocada en cuatro capas: validación de build, smoke, carga y automatización E2E.
- A nivel de reporting, la solución está preparada para publicar resultados y mantener la trazabilidad con Azure Test Plans y Allure.

### Entrega final

El proyecto está listo para presentar una solución completa con:

- app funcional en Node/Express,
- generación de datos sintéticos,
- CI con stages de calidad,
- smoke y carga reales,
- automatización E2E con Playwright,
- documentación y trazabilidad del flujo de entrega.

> Nota: el entorno de pruebas Python necesita usar Python 3.12 para evitar el problema de compatibilidad con `greenlet` que aparece en Python 3.14.

---

Certificación 5 — QA Cloud Native · Lite Thinking University of Technology