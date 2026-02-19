#!/bin/sh
set -ex

KEY_FILE=${NODE_SSL_KEY_PATH}
CRT_FILE=${NODE_CERT_PATH}

if [ -f "$KEY_FILE" ] && [ -f "$CRT_FILE" ]; then
    echo "Certificats présents. Skip."
    exit 0
fi

echo "Génération certificat..."

openssl req -new -newkey rsa:4096 -days 3650 -nodes -x509 \
    -subj "/CN=internal-services" \
    -keyout "$KEY_FILE" \
    -out "$CRT_FILE" 2>/dev/null

openssl req -new -newkey rsa:4096 -days 3650 -nodes -x509 \
    -subj "/CN=database" \
    -keyout "$DB_SSL_KEY_PATH" \
    -out "$DB_CERT_PATH" 2>/dev/null

echo "Correction des permissions..."

chown 1000:1000 "$KEY_FILE" "$CRT_FILE"
chmod 400 "$KEY_FILE"
chmod 444 "$CRT_FILE"

chown 70:70 "$DB_SSL_KEY_PATH" "$DB_CERT_PATH"
chmod 400 "$DB_SSL_KEY_PATH"
chmod 444 "$DB_CERT_PATH"

echo "Terminé."