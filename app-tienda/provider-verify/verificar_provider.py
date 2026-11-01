"""Verificación del provider contra el contrato Pact generado por el consumer."""

import os
import sys
from pathlib import Path

from pact import Verifier

PROVIDER_URL = os.environ.get("PROVIDER_URL", "http://localhost:3000")
PACT_FILE = Path(
    os.environ.get(
        "PACT_FILE",
        str((Path(__file__).resolve().parents[1] / "pacts" / "notificaciones-tienda-api.json")),
    )
)


def main():
    if not PACT_FILE.exists():
        print(f"No existe el contrato Pact en: {PACT_FILE}")
        print("Primero genera el consumer con: cd consumer-notificaciones && pytest -q")
        sys.exit(1)

    print(f"Verificando el provider en {PROVIDER_URL}")
    print(f"Contra el contrato {PACT_FILE}")

    verifier = Verifier(
        provider="tienda-api",
        provider_base_url=PROVIDER_URL,
    )

    resultado = verifier.verify_pacts(str(PACT_FILE))
    exito = resultado[0] if isinstance(resultado, tuple) else resultado

    if exito in (0, False):
        print("\nOK — el provider cumple el contrato del consumer.")
        sys.exit(0)

    print("\nFALLO — el provider no cumple el contrato. Revisa la API.")
    sys.exit(1)


if __name__ == "__main__":
    main()
