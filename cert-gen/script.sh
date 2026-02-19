#!/bin/sh
set -e

KEY_FILE=${SSL_KEY_PATH}
CRT_FILE=${SSL_CERT_PATH}

if [ -f "$KEY_FILE" ] && [ -f "$CRT_FILE" ]; then
    echo "Certificats présents. Skip."
    exit 0
fi

echo "Génération certificat..."

openssl req -new -newkey rsa:4096 -days 3650 -nodes -x509 \
    -subj "/CN=internal-services" \
    -keyout "$KEY_FILE" \
    -out "$CRT_FILE" 2>/dev/null

echo "Correction des permissions..."

chown 1000:1000 "$KEY_FILE" "$CRT_FILE"
chmod 400 "$KEY_FILE"
chmod 444 "$CRT_FILE"

echo "Terminé."