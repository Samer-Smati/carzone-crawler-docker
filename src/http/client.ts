/**
 * Client HTTP avec support proxy et retry automatique
 * 
 * Ce module configure Axios avec:
 * - Support automatique du proxy
 * - Retry avec backoff exponentiel
 * - Timeout configurable
 * - Headers réalistes
 * 
 * @module http/client
 */

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import axiosRetry, { IAxiosRetryConfig } from "axios-retry";
import { config } from "../config/env";

/**
 * Configuration du proxy à partir de l'URL
 */
function getProxyConfig(): AxiosRequestConfig["proxy"] {
  if (!config.proxyUrl) {
    return false;
  }

  try {
    const proxyUrl = new URL(config.proxyUrl);
    
    const proxyConfig: AxiosRequestConfig["proxy"] = {
      host: proxyUrl.hostname,
      port: Number(proxyUrl.port) || (proxyUrl.protocol === "https:" ? 443 : 80),
      protocol: proxyUrl.protocol.replace(":", ""),
    };

    // Ajouter l'authentification si présente dans l'URL
    if (proxyUrl.username && proxyUrl.password) {
      proxyConfig.auth = {
        username: decodeURIComponent(proxyUrl.username),
        password: decodeURIComponent(proxyUrl.password),
      };
    }

    return proxyConfig;
  } catch (error) {
    console.warn(`[HTTP] Invalid proxy URL: ${config.proxyUrl}. Continuing without proxy.`);
    return false;
  }
}

/**
 * Instance Axios configurée avec proxy et retry
 */
const instance: AxiosInstance = axios.create({
  timeout: config.httpTimeout,
  proxy: getProxyConfig(),
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
  },
});

/**
 * Configuration du retry avec backoff exponentiel
 */
const retryConfig: IAxiosRetryConfig = {
  retries: config.retries,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry sur erreurs réseau ou erreurs 5xx
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status !== undefined && error.response.status >= 500)
    );
  },
  onRetry: (retryCount, error) => {
    console.warn(
      `[HTTP] Retry attempt ${retryCount}/${config.retries} for ${error.config?.url}`
    );
  },
};

// Appliquer la configuration de retry
axiosRetry(instance, retryConfig);

// Log de la configuration
if (config.proxyUrl) {
  const maskedProxyUrl = config.proxyUrl.replace(/\/\/.*@/, "//***:***@");
  console.log(`[HTTP] Proxy configured: ${maskedProxyUrl}`);
} else {
  console.log("[HTTP] No proxy configured. Using direct connection.");
}

export default instance;

