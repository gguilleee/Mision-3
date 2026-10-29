// Capa HTTP genérica: la única parte de la app que llama a fetch.
import { leerCache, guardarCache } from '../lib/cache.js';

const TIEMPO_MAXIMO_MS = 8000;

// Cuántas respuestas han salido de la red y cuántas de la caché desde la última lectura.
const metricas = { red: 0, cache: 0 };

/** Devuelve las métricas acumuladas y las pone a cero. */
export function tomarMetricas() {
  const copia = { ...metricas };
  metricas.red = 0;
  metricas.cache = 0;
  return copia;
}

export class ErrorHttp extends Error {
  constructor(status, url) {
    super(status === 404 ? 'El recurso no existe en la API (404).' : `La API respondió con un error (HTTP ${status}).`);
    this.name = 'ErrorHttp';
    this.status = status;
    this.url = url;
  }
}

/** true si el error viene de cancelar la petición a propósito (no es un fallo real). */
export const esCancelacion = (error) => error?.name === 'AbortError';

/**
 * Pide una URL y devuelve su JSON ya adaptado.
 * - Primero mira la caché; `validar` descarta entradas con una forma inesperada.
 * - `signal` permite cancelar la petición (lo usa el cleanup de useFetch).
 * - fetch NO rechaza con 404/500, por eso se comprueba respuesta.ok.
 */
export async function pedirJson(url, { adaptar = (datos) => datos, validar = () => true, signal } = {}) {
  const guardado = leerCache(url);
  if (guardado !== null && validar(guardado)) {
    metricas.cache++;
    return guardado;
  }

  // La petición se corta si se cancela desde fuera o si pasa el tiempo máximo.
  const senal = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(TIEMPO_MAXIMO_MS)])
    : AbortSignal.timeout(TIEMPO_MAXIMO_MS);

  let respuesta;
  try {
    respuesta = await fetch(url, { signal: senal });
  } catch (error) {
    if (signal?.aborted) throw error; // cancelada por la app: se propaga tal cual (AbortError)
    if (error.name === 'TimeoutError') throw new Error('La API tarda demasiado en responder. Inténtalo de nuevo.');
    if (navigator.onLine === false) throw new Error('Parece que no tienes conexión a internet.');
    throw new Error('No se pudo conectar con la API. Revisa tu conexión.');
  }

  if (!respuesta.ok) throw new ErrorHttp(respuesta.status, url);

  let json;
  try {
    json = await respuesta.json();
  } catch {
    throw new Error('La API devolvió una respuesta que no es JSON válido.');
  }

  metricas.red++;
  const datos = adaptar(json);
  if (datos !== null && datos !== undefined) guardarCache(url, datos);
  return datos;
}
