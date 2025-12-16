/**
 * Point d'entrée principal de l'application
 *
 * Ce module orchestre le processus de crawling:
 * 1. Extraction des URLs des pages liste
 * 2. Crawling séquentiel avec rate limiting
 * 3. Sauvegarde des pages HTML
 *
 * @module index
 */

import { extractListingUrls } from "./crawler/listCrawler";
import { crawlPage } from "./crawler/pageCrawler";
import { UrlQueue } from "./crawler/queue";
import { config, validateConfig } from "./config/env";

/**
 * Pause asynchrone pour respecter le rate limiting
 *
 * @param ms - Durée de la pause en millisecondes
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fonction principale d'orchestration du crawler
 */
async function main(): Promise<void> {
  try {
    // Validation de la configuration
    validateConfig();

    // Affichage de la configuration
    console.log("=".repeat(60));
    console.log("CARZONE.IE CRAWLER");
    console.log("=".repeat(60));
    console.log(`Base URL: ${config.baseUrl}`);
    console.log(`Max Pages: ${config.maxPages}`);
    console.log(`Output Dir: ${config.outputDir}`);
    console.log(`Delay: ${config.delayMs}ms`);
    console.log(`Retries: ${config.retries}`);
    if (config.proxyUrl) {
      const maskedProxy = config.proxyUrl.replace(/\/\/.*@/, "//***:***@");
      console.log(`Proxy: ${maskedProxy}`);
    }
    console.log("=".repeat(60));

    // Initialisation de la queue
    const queue = new UrlQueue();

    // Étape 1: Extraire les URLs des pages liste
    console.log("\n[STEP 1] Extracting listing URLs...");
    const listingUrls = await extractListingUrls();

    if (listingUrls.length === 0) {
      console.warn("[WARN] No listing URLs found. Exiting.");
      process.exit(1);
    }

    // Ajouter les URLs à la queue
    queue.addMany(listingUrls);
    console.log(`[STEP 1] Added ${listingUrls.length} URLs to queue`);

    // Étape 2: Crawler les pages séquentiellement
    console.log("\n[STEP 2] Starting page crawling...");
    let crawledCount = 0;
    const maxPages = Math.min(listingUrls.length, config.maxPages);

    while (!queue.isEmpty() && crawledCount < maxPages) {
      const url = queue.next();

      if (!url) {
        break;
      }

      // Vérifier si déjà visitée (sécurité supplémentaire)
      if (queue.hasVisited(url)) {
        continue;
      }

      try {
        // Crawler la page
        await crawlPage(url, crawledCount + 1);

        // Marquer comme visitée
        queue.markVisited(url);
        crawledCount++;

        // Rate limiting: pause entre les requêtes
        if (crawledCount < maxPages) {
          await sleep(config.delayMs);
        }
      } catch (error) {
        console.error(`[ERROR] Failed to crawl ${url}:`, error);
        // Continuer avec la page suivante même en cas d'erreur
      }

      // Afficher la progression
      if (crawledCount % 10 === 0 || crawledCount === maxPages) {
        console.log(`[PROGRESS] Crawled ${crawledCount}/${maxPages} pages`);
      }
    }

    // Résumé final
    console.log("\n" + "=".repeat(60));
    console.log("CRAWLING COMPLETED");
    console.log("=".repeat(60));
    console.log(`Total pages crawled: ${crawledCount}`);
    console.log(`Output directory: ${config.outputDir}`);
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("\n FATAL ERROR:", error);
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on("unhandledRejection", (reason: unknown) => {
  console.error(" Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.error(" Uncaught Exception:", error);
  process.exit(1);
});

// Exécution du programme
main();
