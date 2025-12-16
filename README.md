# 🚗 Carzone.ie Web Crawler

> Crawler professionnel TypeScript/Node.js avec architecture modulaire et scalable pour extraire et sauvegarder les pages liste du site [carzone.ie](https://www.carzone.ie)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [Développement](#-développement)

## 🎯 Vue d'ensemble

Ce projet implémente un crawler web professionnel avec une architecture modulaire et scalable:

- ✅ **Séparation claire des responsabilités** (config, http, crawler, storage)
- ✅ **Gestion automatique du proxy** avec retry et timeout
- ✅ **Queue contrôlée** pour éviter les doublons
- ✅ **Retry automatique** avec backoff exponentiel
- ✅ **Rate limiting** pour respecter le site cible
- ✅ **Docker propre et reproductible**

## 🏗️ Architecture

```
carzone-crawler/
├── src/
│   ├── config/
│   │   └── env.ts          # Configuration centralisée
│   ├── http/
│   │   └── client.ts       # Client HTTP avec proxy + retry
│   ├── crawler/
│   │   ├── queue.ts        # Gestion de la queue d'URLs
│   │   ├── listCrawler.ts  # Extraction des pages liste
│   │   └── pageCrawler.ts  # Crawling des pages individuelles
│   ├── storage/
│   │   └── fileStore.ts    # Sauvegarde des fichiers HTML
│   └── index.ts            # Point d'entrée et orchestration
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Principes de conception

1. **Séparation des responsabilités**: Chaque module a une responsabilité unique et bien définie
2. **Configuration centralisée**: Toute la config dans `config/env.ts`
3. **Gestion d'erreurs robuste**: Retry automatique avec axios-retry
4. **Queue contrôlée**: Évite les doublons et gère efficacement les URLs
5. **Respect du site**: Rate limiting avec délais configurables

## ✨ Fonctionnalités

- ✅ **Architecture modulaire**: Code organisé et maintenable
- ✅ **Retry automatique**: Backoff exponentiel pour les erreurs réseau
- ✅ **Proxy dynamique**: Configuration via variables d'environnement
- ✅ **Queue intelligente**: Gestion des URLs visitées avec Set (O(1))
- ✅ **Rate limiting**: Délais configurables entre requêtes
- ✅ **TypeScript strict**: Code type-safe avec types stricts
- ✅ **Docker optimisé**: Image Alpine légère et reproductible
- ✅ **Logging structuré**: Logs clairs avec préfixes de module

## 🚀 Installation

### Prérequis

- **Docker** 20.10+ (recommandé)
- **Node.js** 20+ et **npm** 9+ (pour développement local)

### Construction de l'image Docker

```bash
# Construction standard
docker build -t carzone-crawler .

# Avec proxy (optionnel)
docker build \
  --build-arg PROXY_URL=http://proxy.example.com:3128 \
  -t carzone-crawler .
```

## 💻 Utilisation

### Exécution avec Docker (Recommandé)

#### Étape 1: Construire l'image Docker

**Linux/Mac:**

```bash
docker build -t carzone-crawler .
```

**Windows PowerShell:**

```powershell
docker build -t carzone-crawler .
```

**Avec proxy (optionnel lors du build):**

```bash
docker build --build-arg PROXY_URL=http://proxy.example.com:3128 -t carzone-crawler .
```

#### Étape 2: Créer le répertoire de sortie

**Linux/Mac:**

```bash
mkdir -p output
```

**Windows PowerShell:**

```powershell
New-Item -ItemType Directory -Force -Path output
```

#### Étape 3: Exécuter le conteneur

**Linux/Mac - Exécution standard:**

```bash
docker run --rm -v "$(pwd)/output:/data" carzone-crawler
```

**Windows PowerShell - Exécution standard:**

```powershell
docker run --rm -v "${PWD}/output:/data" carzone-crawler
```

**Avec proxy:**

```bash
# Linux/Mac
docker run --rm \
  -e PROXY_URL=http://proxy.example.com:3128 \
  -v "$(pwd)/output:/data" \
  carzone-crawler
```

```powershell
# Windows PowerShell
docker run --rm `
  -e PROXY_URL=http://proxy.example.com:3128 `
  -v "${PWD}/output:/data" `
  carzone-crawler
```

**Avec variables d'environnement personnalisées:**

```bash
# Linux/Mac
docker run --rm \
  -e OUTPUT_DIR=/data \
  -e DELAY_MS=2000 \
  -e MAX_PAGES=100 \
  -e HTTP_TIMEOUT=20000 \
  -e RETRIES=5 \
  -v "$(pwd)/output:/data" \
  carzone-crawler
```

```powershell
# Windows PowerShell
docker run --rm `
  -e OUTPUT_DIR=/data `
  -e DELAY_MS=2000 `
  -e MAX_PAGES=100 `
  -e HTTP_TIMEOUT=20000 `
  -e RETRIES=5 `
  -v "${PWD}/output:/data" `
  carzone-crawler
```

#### Commandes Docker utiles

```bash
# Voir les images Docker disponibles
docker images

# Voir les conteneurs en cours d'exécution
docker ps

# Voir tous les conteneurs (y compris arrêtés)
docker ps -a

# Voir les logs d'un conteneur (remplacez <container-id> par l'ID réel)
docker logs <container-id>

# Supprimer l'image Docker
docker rmi carzone-crawler

# Nettoyer les conteneurs arrêtés
docker container prune

# Nettoyer les images non utilisées
docker image prune
```

#### Vérification de l'exécution

Après l'exécution, vérifiez que les fichiers ont été créés :

```bash
# Linux/Mac
ls -lh output/
head -n 50 output/page-001.html

# Windows PowerShell
Get-ChildItem output
Get-Content output/page-001.html -Head 50
```

#### Dépannage Docker

**Problème: Docker Desktop n'est pas démarré**

```bash
# Vérifier si Docker fonctionne
docker ps

# Si erreur: démarrer Docker Desktop et attendre qu'il soit complètement démarré
```

**Problème: L'image n'existe pas**

```bash
# Reconstruire l'image
docker build -t carzone-crawler .
```

**Problème: Erreurs de permissions sur le répertoire output**

```bash
# Linux/Mac: Ajuster les permissions
chmod 755 output
chown -R $USER:$USER output

# Windows: Vérifier que le dossier existe et est accessible
```

**Problème: Le conteneur s'arrête immédiatement**

```bash
# Vérifier les logs du dernier conteneur
docker logs $(docker ps -lq)

# Exécuter en mode interactif pour déboguer
docker run -it --rm -v "$(pwd)/output:/data" carzone-crawler sh
```

### Exécution locale (Développement)

```bash
# Installation des dépendances
npm install

# Compilation TypeScript
npm run build

# Exécution
npm start

# Ou en mode développement
npm run dev
```

## ⚙️ Configuration

### Variables d'environnement

| Variable       | Description                         | Défaut    |
| -------------- | ----------------------------------- | --------- |
| `PROXY_URL`    | URL du proxy (peut inclure auth)    | `""`      |
| `OUTPUT_DIR`   | Répertoire de sortie                | `"/data"` |
| `DELAY_MS`     | Délai entre requêtes (ms)           | `"1000"`  |
| `HTTP_TIMEOUT` | Timeout HTTP (ms)                   | `"15000"` |
| `RETRIES`      | Nombre de tentatives en cas d'échec | `"3"`     |

### Exemples de configuration

```bash
# Proxy avec authentification
PROXY_URL=http://user:pass@proxy.example.com:3128

# Délai plus long pour respecter le site
DELAY_MS=2000

# Plus de tentatives pour les connexions instables
RETRIES=5
```

### Fichier .env (Développement local)

Pour la configuration locale (sans Docker), vous pouvez créer un fichier `.env` à la racine du projet :

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos valeurs
nano .env  # ou votre éditeur préféré
```

**Exemple de fichier `.env` :**

```env
PROXY_URL=http://proxy.example.com:3128
OUTPUT_DIR=./output
DELAY_MS=1000
HTTP_TIMEOUT=15000
RETRIES=3
```

⚠️ **Important**: Ne commitez jamais le fichier `.env` avec des credentials réels. Le fichier `.env.example` sert de template.

**Note**: Pour charger automatiquement les variables depuis `.env` en développement local, vous pouvez installer `dotenv` :

```bash
npm install dotenv
```

Puis ajoutez au début de `src/index.ts` :

```typescript
import "dotenv/config";
```

En production Docker, utilisez les variables d'environnement directement via `-e` ou un fichier `.env` monté.

## 📁 Structure du projet

```
DATABIZ_EXERCICE/
│
├── src/
│   ├── config/
│   │   └── env.ts              # Configuration centralisée
│   │
│   ├── http/
│   │   └── client.ts           # Client HTTP avec retry
│   │
│   ├── crawler/
│   │   ├── queue.ts            # Queue de gestion des URLs
│   │   ├── listCrawler.ts      # Extraction des URLs liste
│   │   └── pageCrawler.ts      # Crawling des pages
│   │
│   ├── storage/
│   │   └── fileStore.ts        # Sauvegarde des fichiers
│   │
│   └── index.ts                # Point d'entrée principal
│
├── dist/                       # Code compilé (généré)
├── output/                     # Fichiers HTML (généré)
│
├── Dockerfile                  # Configuration Docker
├── package.json                # Dépendances npm
├── tsconfig.json               # Configuration TypeScript
├── .env.example                # Template de configuration
│
├── README.md                   # Ce fichier
```

## 🔧 Développement

### Scripts disponibles

```bash
npm run build    # Compiler TypeScript
npm start        # Exécuter le code compilé
npm run dev      # Exécuter avec ts-node (dev)
npm run clean    # Nettoyer les fichiers générés
```

### Format de sortie

Les pages HTML sont sauvegardées avec des noms séquentiels:

```
output/
├── page-001.html
├── page-002.html
├── page-003.html
└── ...
```

### Logs

Le crawler affiche des logs structurés:

```
============================================================
🚀 CARZONE.IE CRAWLER
============================================================
📍 Base URL: https://www.carzone.ie
📄 Max Pages: 200
💾 Output Dir: /data
⏱️  Delay: 1000ms
🔄 Retries: 3
============================================================

[STEP 1] Extracting listing URLs...
[LIST] Fetching listing page: https://www.carzone.ie/cars
[LIST] Found 45 listing URLs

[STEP 2] Starting page crawling...
[PAGE] Crawling 1: https://www.carzone.ie/cars
[STORAGE] File saved: /data/page-001.html
[PAGE] Saved: page-001.html
...
```

## 🎯 Principes de conception

### 1. Séparation des responsabilités

- **config/**: Configuration centralisée
- **http/**: Client HTTP avec retry
- **crawler/**: Logique de crawling
- **storage/**: Gestion du stockage

### 2. Gestion automatique du proxy

Le proxy est configuré automatiquement depuis les variables d'environnement, avec support de l'authentification.

### 3. Queue contrôlée

La classe `UrlQueue` gère:

- Les URLs visitées (Set pour O(1) lookup)
- La file d'attente (FIFO)
- La normalisation des URLs

### 4. Retry + Timeout

- **Retry automatique**: 3 tentatives par défaut avec backoff exponentiel
- **Timeout**: 15 secondes par défaut
- **Gestion d'erreurs**: Erreurs réseau et 5xx retentées automatiquement

### 5. Respect du site

- **Rate limiting**: Délai configurable entre requêtes (1s par défaut)
- **User-Agent réaliste**: Évite la détection de bot
- **Headers appropriés**: Headers HTTP réalistes

### 6. Docker propre

- **Image Alpine**: Légère et sécurisée
- **Multi-stage optimisé**: Cache Docker optimisé
- **Variables d'environnement**: Configuration flexible

## 📝 Notes importantes

- ⚠️ **Respectez les conditions d'utilisation** du site carzone.ie
- ⚠️ **Respectez le robots.txt** et les directives du site
- ⚠️ **Utilisez des délais appropriés** pour ne pas surcharger le serveur
- ⚠️ **Ce crawler est à des fins éducatives/d'exercice uniquement**

## 📄 Licence

ISC License

## 👤 Auteur

**Samer Smati**

---

**Bon crawling! 🚀**
