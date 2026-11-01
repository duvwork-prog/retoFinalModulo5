# Dockerfile para el consumer de la app Tienda.
# Se usa para validar el contrato del cliente frente a la API real.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["pytest", "-q"]
