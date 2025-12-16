/**
 * Configuration centralisée de l'application
 * 
 * Toutes les variables d'environnement et constantes de configuration
 * sont définies ici pour faciliter la maintenance et les tests.
 * 
 * @module config/env
 */

/**
 * Configuration de l'application
 */
export const config = {
  /** URL de base du site à crawler */
  baseUrl: "https://www.carzone.ie",

  /** Nombre maximum de pages à crawler */
  maxPages: 200,

  /** Répertoire de sortie pour les fichiers HTML */
  outputDir: process.env.OUTPUT_DIR || "/data",

  /** Délai entre les requêtes en millisecondes (rate limiting) */
  delayMs: parseInt(process.env.DELAY_MS || "1000", 10),

  /** URL du proxy (optionnel) */
  proxyUrl: process.env.PROXY_URL || process.env.HTTP_PROXY || process.env.HTTPS_PROXY || "",

  /** Timeout HTTP en millisecondes */
  httpTimeout: parseInt(process.env.HTTP_TIMEOUT || "15000", 10),

  /** Nombre de tentatives en cas d'échec */
  retries: parseInt(process.env.RETRIES || "3", 10),
} as const;

/**
 * Valide la configuration et lance une erreur si invalide
 */
export function validateConfig(): void {
  if (config.maxPages < 1) {
    throw new Error("maxPages must be greater than 0");
  }

  if (config.delayMs < 0) {
    throw new Error("delayMs must be non-negative");
  }

  if (config.httpTimeout < 1000) {
    throw new Error("httpTimeout must be at least 1000ms");
  }

  if (config.proxyUrl && !isValidUrl(config.proxyUrl)) {
    throw new Error(`Invalid proxy URL: ${config.proxyUrl}`);
  }
}

/**
 * Vérifie si une chaîne est une URL valide
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

