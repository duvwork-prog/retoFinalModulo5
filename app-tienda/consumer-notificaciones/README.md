# Consumer — Contract testing con Pact

Este directorio valida el contrato del cliente que consume la API de la tienda.

## Objetivo

El consumer no prueba la app completa: prueba la interfaz que necesita usar.
En este caso, el cliente consulta el producto por id y forma un resumen para notificarlo.

## Flujo real

1. Se levanta un mock provider con Pact.
2. El test define la respuesta esperada de `GET /api/productos/1`.
3. El cliente real hace la llamada al mock.
4. Pact genera el contrato JSON dentro de la carpeta `../pacts`.

## Ejecución local

Desde la raíz del repositorio:

```powershell
cd app-tienda
npm install
npm start
```

En otra terminal:

```powershell
cd app-tienda\consumer-notificaciones
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -q
```

El contrato resultante se guarda en:

```text
app-tienda/pacts/notificaciones-tienda-api.json
```

## Variables útiles

```powershell
$env:PACT_DIR = "C:\ruta\al\repositorio\app-tienda\pacts"
pytest -q
```

## Docker

```powershell
docker build -t consumer-notificaciones .
docker run --rm consumer-notificaciones
```
