# ============================================================================
# Dockerfile pour Carzone.ie Crawler
# Architecture propre et reproductible
# ============================================================================

FROM node:20-alpine

# Métadonnées
LABEL maintainer="Databiz Exercise"
LABEL description="Crawler web professionnel pour carzone.ie"
LABEL version="1.0.0"

# Installation des dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration (optimisation du cache Docker)
COPY package.json package-lock.json* tsconfig.json ./

# Installation des dépendances (incluant devDependencies pour la compilation)
RUN npm ci --include=dev && \
    npm cache clean --force

# Copie du code source
COPY src ./src

# Compilation TypeScript
RUN npm run build && \
    rm -rf src && \
    npm prune --production

# Création du répertoire de sortie
RUN mkdir -p /data && \
    chmod 755 /data

# Volume pour les données de sortie
VOLUME ["/data"]

# Variables d'environnement par défaut
ENV PROXY_URL=""
ENV OUTPUT_DIR="/data"
ENV DELAY_MS="1000"
ENV HTTP_TIMEOUT="15000"
ENV RETRIES="3"

# Commande par défaut
CMD ["node", "dist/index.js"]
