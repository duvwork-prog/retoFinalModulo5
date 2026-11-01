"""Contract test del consumer para la API de la Tienda."""

import atexit
import os
from pathlib import Path

import pytest
from pact import Consumer, Provider, Like

from cliente_productos import ClienteProductos

PACT_MOCK_HOST = "localhost"
PACT_MOCK_PORT = 1234
PACT_DIR = Path(__file__).resolve().parents[1] / "pacts"
PACT_DIR.mkdir(parents=True, exist_ok=True)

# Permite sobrescribir la ruta por variable de entorno si se ejecuta desde Docker.
PACT_DIR = Path(os.environ.get("PACT_DIR", str(PACT_DIR)))

pact = Consumer("notificaciones").has_pact_with(
    Provider("tienda-api"),
    host_name=PACT_MOCK_HOST,
    port=PACT_MOCK_PORT,
    pact_dir=str(PACT_DIR),
)

pact.start_service()
atexit.register(pact.stop_service)


@pytest.fixture
def cliente():
    return ClienteProductos(f"http://{PACT_MOCK_HOST}:{PACT_MOCK_PORT}")


def test_obtener_producto_existente(cliente):
    cuerpo_esperado = {
        "id": Like(1),
        "nombre": Like("Silla ergonómica"),
        "categoria": Like("hogar"),
        "precio": Like(99.99),
        "stock": Like(10),
    }

    (
        pact
        .upon_receiving("una petición para consultar el producto 1")
        .with_request("get", "/api/productos/1")
        .will_respond_with(200, body=cuerpo_esperado)
    )

    with pact:
        resumen = cliente.resumen_para_notificar(1)
        assert "Producto" in resumen
        assert "$" in resumen
