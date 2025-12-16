/**
 * Crawler pour les pages individuelles
 * 
 * Ce module gère le crawling d'une page individuelle:
 * - Récupération du contenu HTML
 * - Sauvegarde dans le système de stockage
 * - Gestion des erreurs
 * 
 * @module crawler/pageCrawler
 */

import client from "../http/client";
import { saveHtml } from "../storage/fileStore";

/**
 * Crawl une page individuelle et la sauvegarde
 * 
 * @param url - URL de la page à crawler
 * @param index - Index de la page (pour le nom de fichier)
 * @returns Promise qui se résout lorsque la page est sauvegardée
 */
export async function crawlPage(url: string, index: number): Promise<void> {
  try {
    console.log(`[PAGE] Crawling ${index}: ${url}`);
    
    const response = await client.get<string>(url);
    const filename = `page-${String(index).padStart(3, "0")}.html`;
    
    await saveHtml(filename, response.data);
    
    console.log(`[PAGE] Saved: ${filename}`);
  } catch (error) {
    console.error(`[PAGE] Error crawling ${url}:`, error);
    throw error; // Propager l'erreur pour gestion au niveau supérieur
  }
}

