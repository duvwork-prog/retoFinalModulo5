# Provider verification — validación del contrato

Este directorio verifica que la app real cumple el contrato generado por el consumer.

## Objetivo

Se toma el archivo Pact generado por el consumer y se comprueba que la API real responde con la estructura esperada.

## Requisitos

- La app de tienda debe estar arrancada en `http://localhost:3000`.
- Debe existir el contrato generado en `app-tienda/pacts/notificaciones-tienda-api.json`.

## Ejecución local

1. Arrancar la app:

```powershell
cd app-tienda
npm install
npm start
```

2. Generar el contrato del consumer:

```powershell
cd app-tienda\consumer-notificaciones
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -q
```

3. Verificar el provider:

```powershell
cd app-tienda\provider-verify
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python verificar_provider.py
```

## Variables útiles

```powershell
$env:PROVIDER_URL = "http://localhost:3000"
$env:PACT_FILE = "C:\ruta\al\repositorio\app-tienda\pacts\notificaciones-tienda-api.json"
python verificar_provider.py
```

## Docker

```powershell
docker build -t provider-verify .
docker run --rm -e PROVIDER_URL=http://host.docker.internal:3000 provider-verify
```
