/**
 * Queue de gestion des URLs à crawler
 *
 * Cette classe gère:
 * - La file d'attente des URLs à visiter
 * - Le suivi des URLs déjà visitées (évite les doublons)
 * - La normalisation des URLs
 *
 * @module crawler/queue
 */

/**
 * Queue de gestion des URLs
 */
export class UrlQueue {
  /** URLs déjà visitées (Set pour complexité en temps O(1) lookup) */
  private visited = new Set<string>();

  /** File d'attente des URLs à visiter */
  private queue: string[] = [];

  /**
   * Normalise une URL (retire les fragments, etc.)
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      urlObj.hash = ""; // Retirer le fragment
      return urlObj.href;
    } catch {
      return url;
    }
  }

  /**
   * Ajoute une URL à la file d'attente si elle n'a pas déjà été visitée
   *
   * @param url - URL à ajouter
   */
  add(url: string): void {
    const normalized = this.normalizeUrl(url);

    if (!this.visited.has(normalized) && !this.queue.includes(normalized)) {
      this.queue.push(normalized);
    }
  }

  /**
   * Ajoute plusieurs URLs à la file d'attente
   *
   * @param urls - Tableau d'URLs à ajouter
   */
  addMany(urls: string[]): void {
    urls.forEach((url) => this.add(url));
  }

  /**
   * Récupère la prochaine URL de la file d'attente
   *
   * @returns URL suivante ou undefined si la file est vide
   */
  next(): string | undefined {
    return this.queue.shift();
  }

  /**
   * Marque une URL comme visitée
   *
   * @param url - URL à marquer comme visitée
   */
  markVisited(url: string): void {
    const normalized = this.normalizeUrl(url);
    this.visited.add(normalized);
  }

  /**
   * Vérifie si une URL a déjà été visitée
   *
   * @param url - URL à vérifier
   * @returns true si l'URL a été visitée
   */
  hasVisited(url: string): boolean {
    const normalized = this.normalizeUrl(url);
    return this.visited.has(normalized);
  }

  /**
   * Retourne le nombre d'URLs visitées
   *
   * @returns Nombre d'URLs visitées
   */
  visitedCount(): number {
    return this.visited.size;
  }

  /**
   * Retourne le nombre d'URLs en attente dans la file
   *
   * @returns Nombre d'URLs en attente
   */
  pendingCount(): number {
    return this.queue.length;
  }

  /**
   * Vérifie si la file est vide
   *
   * @returns true si la file est vide
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Vide la file d'attente (utile pour les tests)
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Réinitialise complètement la queue (utile pour les tests)
   */
  reset(): void {
    this.visited.clear();
    this.queue = [];
  }
}
