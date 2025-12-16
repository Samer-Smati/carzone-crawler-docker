/**
 * Système de stockage des fichiers
 *
 * Ce module gère la sauvegarde des fichiers HTML sur le système de fichiers.
 * Il utilise les APIs asynchrones de Node.js pour une meilleure performance.
 *
 * @module storage/fileStore
 */

import fs from "fs/promises";
import path from "path";
import { config } from "../config/env";

/**
 * Crée le répertoire de sortie s'il n'existe pas
 */
async function ensureOutputDir(): Promise<void> {
  try {
    await fs.mkdir(config.outputDir, { recursive: true });
  } catch (error) {
    console.error(`[STORAGE] Error creating output directory: ${error}`);
    throw error;
  }
}

/**
 * Sauvegarde le contenu HTML dans un fichier
 *
 * @param filename - Nom du fichier (ex: "page-001.html")
 * @param content - Contenu HTML à sauvegarder
 * @returns Promise qui se résout lorsque le fichier est écrit
 */
export async function saveHtml(
  filename: string,
  content: string
): Promise<void> {
  try {
    await ensureOutputDir();

    const filePath = path.join(config.outputDir, filename);
    await fs.writeFile(filePath, content, "utf-8");

    console.log(`[STORAGE] File saved: ${filePath}`);
  } catch (error) {
    console.error(`[STORAGE] Error saving file ${filename}:`, error);
    throw error;
  }
}

/**
 * Vérifie si un fichier existe déjà
 *
 * @param filename - Nom du fichier à vérifier
 * @returns true si le fichier existe
 */
export async function fileExists(filename: string): Promise<boolean> {
  try {
    const filePath = path.join(config.outputDir, filename);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retourne le chemin complet du répertoire de sortie
 *
 * @returns Chemin du répertoire de sortie
 */
export function getOutputDir(): string {
  return config.outputDir;
}
