// Endpoints concretos de la PokeAPI. Aquí no hay nada de React ni del DOM.
import { pedirJson, esCancelacion } from './http.js';
import { adaptarListaTipos, adaptarTipo, adaptarPokemon, esPokemonValido, esTipoValido } from '../lib/adaptadores.js';

const BASE = 'https://pokeapi.co/api/v2';

export function obtenerTipos(signal) {
  return pedirJson(`${BASE}/type?limit=50`, { adaptar: adaptarListaTipos, validar: Array.isArray, signal });
}

export function obtenerTipo(nombre, signal) {
  return pedirJson(`${BASE}/type/${encodeURIComponent(nombre)}`, { adaptar: adaptarTipo, validar: esTipoValido, signal });
}

export function obtenerPokemon(id, signal) {
  return pedirJson(`${BASE}/pokemon/${id}`, { adaptar: adaptarPokemon, validar: esPokemonValido, signal });
}

/**
 * Pide varios Pokémon EN PARALELO. Con allSettled, que uno falle no tumba
 * al resto: devolvemos los que llegaron y cuántos se perdieron por el camino.
 * Si la carga entera se cancela, se propaga la cancelación.
 */
export async function obtenerVariosPokemon(ids, signal) {
  const resultados = await Promise.allSettled(ids.map((id) => obtenerPokemon(id, signal)));
  if (signal?.aborted) throw resultados.find((r) => esCancelacion(r.reason))?.reason ?? new DOMException('Cancelada', 'AbortError');

  const pokemon = resultados
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);

  return { pokemon, perdidos: ids.length - pokemon.length };
}
