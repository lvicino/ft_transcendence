#!/bin/sh
set -ex

if [ -f "$NODE_SSL_KEY_PATH" ] && [ -f "$NODE_SSL_CERT_PATH" ]; then
    echo "Certificats présents. Skip."
    exit 0
fi

echo "Génération certificat..."

openssl req -new -newkey rsa:4096 -days 3650 -nodes -x509 \
    -subj "/CN=internal-services" \
    -keyout "$NODE_SSL_KEY_PATH" \
    -out "$NODE_SSL_CERT_PATH" 2>/dev/null

openssl req -new -newkey rsa:4096 -days 3650 -nodes -x509 \
    -subj "/CN=database" \
    -keyout "$DB_SSL_KEY_PATH" \
    -out "$DB_SSL_CERT_PATH" 2>/dev/null

echo "Correction des permissions..."

chown 1000:1000 "$NODE_SSL_KEY_PATH" "$NODE_SSL_CERT_PATH"
chmod 400 "$NODE_SSL_KEY_PATH"
chmod 444 "$NODE_SSL_CERT_PATH"

chown 70:70 "$DB_SSL_KEY_PATH" "$DB_SSL_CERT_PATH"
chmod 400 "$DB_SSL_KEY_PATH"
chmod 444 "$DB_SSL_CERT_PATH"

echo "Terminé."