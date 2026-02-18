#!/bin/sh
set -e # Arrêt immédiat en cas d'erreur

# --- CONFIGURATION ---
CERT_DIR="/certs"
CA_KEY="$CERT_DIR/ca.key"
CA_CERT="$CERT_DIR/ca.crt"
SERVER_KEY="$CERT_DIR/server.key"
SERVER_CSR="$CERT_DIR/server.csr"
SERVER_CERT="$CERT_DIR/server.crt"
EXT_FILE="$CERT_DIR/v3.ext"

# LISTE DES SERVICES (DNS) QUI UTILISERONT CE CERTIFICAT
# Ajoutez ici tous les noms de services définis dans votre docker-compose
DOMAINS="auth-api game-api database traefik"
TARGET_UID=1000
TARGET_GID=1000

echo "--- Démarrage de la PKI Interne ---"

# 1. Génération de l'Autorité Racine (CA) si elle n'existe pas
if [ ! -f "$CA_KEY" ]; then
    echo "--> Création de l'Autorité de Certification (CA)..."
    openssl genrsa -out "$CA_KEY" 4096
    openssl req -x509 -new -nodes -key "$CA_KEY" \
        -sha256 -days 3650 -out "$CA_CERT" \
        -subj "/CN=My-Internal-Root-CA"
    echo "--> CA générée."
else
    echo "--> CA existante détectée. On la garde."
fi

# 2. Génération de la Clé Privée du Serveur (Unique pour tous les services)
if [ ! -f "$SERVER_KEY" ]; then
    echo "--> Génération de la clé privée serveur..."
    openssl genrsa -out "$SERVER_KEY" 4096
fi

# 3. Préparation de la configuration SAN (Subject Alternative Name)
# C'est ici qu'on définit que ce certificat est valide pour PLUSIEURS noms.
if [ ! -f "$SERVER_CERT" ]; then
    echo "--> Génération de la configuration SAN..."
    
    # On crée un fichier de config temporaire pour OpenSSL
    cat > "$EXT_FILE" <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
EOF

    # On boucle sur la liste des domaines pour les ajouter (DNS.1, DNS.2, etc.)
    I=1
    for DOMAIN in $DOMAINS; do
        echo "DNS.$I = $DOMAIN" >> "$EXT_FILE"
        I=$((I+1))
    done
    # On ajoute aussi l'IP locale au cas où
    echo "IP.1 = 127.0.0.1" >> "$EXT_FILE" # a supp non ??

    echo "--> Génération de la demande de signature (CSR)..."
    openssl req -new -key "$SERVER_KEY" -out "$SERVER_CSR" \
        -subj "/CN=internal-services" # pour quoi metre "CN=internal-services" car on est pas obliger de metre quel que chose vue que on a utiliser la methode SAN non ?

    echo "--> Signature du certificat par la CA (avec SAN)..."
    openssl x509 -req -in "$SERVER_CSR" -CA "$CA_CERT" -CAkey "$CA_KEY" \
        -CAcreateserial -out "$SERVER_CERT" \
        -days 825 -sha256 -extfile "$EXT_FILE"
    
    echo "--> Certificat signé avec succès."
    
    # Nettoyage des fichiers temporaires
    rm "$SERVER_CSR" "$EXT_FILE"
else
    echo "--> Certificat serveur existant détecté. On le garde."
fi

# 4. Gestion des permissions (Zero Trust / Docker UID fix)
echo "--> Application des permissions..."

# La CA est publique, mais sa clé est ultra secrète (root seulement)
chmod 400 "$CA_KEY" # on peux supp on a plus besoin en soit non ?
chmod 444 "$CA_CERT"

# Le certificat serveur et sa clé doivent être lisibles par Node/Traefik (1000)
chown $TARGET_UID:$TARGET_GID "$SERVER_KEY" "$SERVER_CERT" "$CA_CERT"
chmod 400 "$SERVER_KEY" # Lecture seule stricte pour l'utilisateur (donc 1000)
chmod 444 "$SERVER_CERT"

echo "--- Terminé. Vos certificats sont prêts dans $CERT_DIR ---"