"""Cliente real del consumer para la API de la Tienda."""

import requests


class ClienteProductos:
    """Consulta un producto y genera un resumen de notificación."""

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def obtener_producto(self, producto_id: int) -> dict:
        response = requests.get(f"{self.base_url}/api/productos/{producto_id}", timeout=5)
        response.raise_for_status()
        return response.json()

    def resumen_para_notificar(self, producto_id: int) -> str:
        producto = self.obtener_producto(producto_id)
        return (
            f"Producto {producto['nombre']} ({producto['categoria']}) "
            f"- ${producto['precio']}"
        )
