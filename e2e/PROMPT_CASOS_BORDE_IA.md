# Prompt usado para proponer los dos casos de borde E2E

```text
Eres un experto en QA de software y automatización E2E para Playwright + pytest-bdd + Screenplay.
Quiero añadir 2 casos de borde reales para la app de una tienda online que ya tiene una suite E2E funcionando.

Requisitos:
- Deben ser casos de borde y no pruebas de happy path.
- Deben ejecutarse sobre la app real sin mockear la lógica.
- Deben encajar con la estructura actual de features y steps del proyecto.
- Deben estar escritos en Gherkin con texto en español y palabras clave en inglés.
- Deben reutilizar el flujo actual de la tienda y los selectores data-testid ya existentes.
- Deben ser verificables en UI y no solo en API.

Devuelve:
- Las dos nuevas scenarios en el formato Gherkin exacto.
- Los pasos necesarios en Python para que pytest-bdd los entienda.
- Una explicación breve de por qué cada caso es útil para detectar regresiones.
```

## Resultados aplicados

Se añadieron los escenarios:
- [e2e/features/carrito.feature](features/carrito.feature)
- [e2e/features/catalogo.feature](features/catalogo.feature)

Los pasos necesarios se incorporaron en:
- [e2e/tests/steps_comunes.py](tests/steps_comunes.py)
