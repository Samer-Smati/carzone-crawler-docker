/**
 * Crawler pour les pages liste
 * 
 * Ce module extrait les URLs des pages liste depuis la page principale
 * du site carzone.ie. Il utilise plusieurs stratégies pour découvrir
 * les URLs de pagination et de liste.
 * 
 * @module crawler/listCrawler
 */

import client from "../http/client";
import * as cheerio from "cheerio";
import { config } from "../config/env";

/**
 * Normalise une URL relative en URL absolue
 */
function normalizeUrl(url: string, baseUrl: string): string {
  try {
    if (url.startsWith("http")) {
      return url;
    }
    return new URL(url, baseUrl).href;
  } catch {
    return "";
  }
}

/**
 * Extrait les URLs des pages liste depuis le HTML
 * 
 * Utilise plusieurs stratégies:
 * 1. Liens explicites vers /cars avec pagination
 * 2. Liens vers les pages de recherche et catégories
 * 3. Éléments de pagination (boutons, liens "next", etc.)
 * 4. Génération automatique basée sur le pattern de pagination
 * 
 * @param html - Contenu HTML de la page
 * @param currentUrl - URL de la page actuelle
 * @returns Tableau d'URLs normalisées
 */
function extractUrlsFromHtml(html: string, currentUrl: string): string[] {
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  // Stratégie 1: Liens explicites vers /cars avec pagination
  $('a[href*="/cars"], a[href*="page="], a[href*="p="]').each(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_: number, element: any) => {
      const href = $(element).attr("href");
      if (href) {
        const normalized = normalizeUrl(href, config.baseUrl);
        if (
          normalized &&
          normalized.includes("carzone.ie") &&
          (normalized.includes("/cars") ||
            normalized.includes("page=") ||
            normalized.includes("p=")) &&
          !normalized.includes("#") &&
          !normalized.includes("javascript:")
        ) {
          urls.add(normalized);
        }
      }
    }
  );

  // Stratégie 2: Liens vers les pages de recherche et catégories
  $('a[href*="search"], a[href*="/used-cars"], a[href*="/new-cars"]').each(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_: number, element: any) => {
      const href = $(element).attr("href");
      if (href) {
        const normalized = normalizeUrl(href, config.baseUrl);
        if (
          normalized &&
          normalized.includes("carzone.ie") &&
          !normalized.includes("#") &&
          !normalized.includes("javascript:")
        ) {
          urls.add(normalized);
        }
      }
    }
  );

  // Stratégie 3: Éléments de pagination
  $("a.pagination, a.page-link, nav a, .pagination a").each(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_: number, element: any) => {
      const href = $(element).attr("href");
      const text = $(element).text().trim();

      if (
        href &&
        (text.match(/^\d+$/) ||
          text.toLowerCase().includes("next") ||
          text.toLowerCase().includes("page") ||
          text.toLowerCase().includes("suivant"))
      ) {
        const normalized = normalizeUrl(href, config.baseUrl);
        if (
          normalized &&
          normalized.includes("carzone.ie") &&
          !normalized.includes("#") &&
          !normalized.includes("javascript:")
        ) {
          urls.add(normalized);
        }
      }
    }
  );

  // Stratégie 4: Génération automatique de pagination
  try {
    const currentUrlObj = new URL(currentUrl);
    const pageParam =
      currentUrlObj.searchParams.get("page") ||
      currentUrlObj.searchParams.get("p");
    const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

    // Générer les 5 prochaines pages
    for (let i = 1; i <= 5; i++) {
      const nextPage = currentPage + i;
      currentUrlObj.searchParams.set("page", nextPage.toString());
      urls.add(currentUrlObj.href);
    }
  } catch (error) {
    // Si l'URL n'a pas de paramètre page, essayer d'ajouter des paramètres
    if (
      currentUrl.includes("/cars") &&
      !currentUrl.includes("page=") &&
      !currentUrl.includes("p=")
    ) {
      try {
        const urlObj = new URL(currentUrl);
        for (let i = 2; i <= 10; i++) {
          urlObj.searchParams.set("page", i.toString());
          urls.add(urlObj.href);
        }
      } catch (e) {
        // Ignorer les erreurs silencieusement
      }
    }
  }

  return Array.from(urls);
}

/**
 * Extrait les URLs des pages liste depuis la page principale
 * 
 * @param startUrl - URL de départ (par défaut: /cars)
 * @returns Tableau d'URLs des pages liste
 */
export async function extractListingUrls(
  startUrl: string = `${config.baseUrl}/cars`
): Promise<string[]> {
  try {
    console.log(`[LIST] Fetching listing page: ${startUrl}`);
    const response = await client.get<string>(startUrl);
    const urls = extractUrlsFromHtml(response.data, startUrl);
    console.log(`[LIST] Found ${urls.length} listing URLs`);
    return urls;
  } catch (error) {
    console.error(`[LIST] Error extracting URLs from ${startUrl}:`, error);
    return [];
  }
}

