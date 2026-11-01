# Dockerfile para la verificación del provider de la app Tienda.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "verificar_provider.py"]
