import { useCallback, useEffect, useState } from 'react';
import { esCancelacion } from '../api/http.js';

/**
 * Hook reutilizable para cualquier petición asíncrona (BONUS).
 * - `pedir(signal)` es una función que devuelve una promesa.
 * - Se vuelve a ejecutar cuando cambia alguna de las `dependencias`.
 * - Mientras carga conserva los datos anteriores (así "Cargar más" no borra lo que ya se ve).
 * - El cleanup aborta la petición en vuelo: si el usuario cambia de tipo o de búsqueda,
 *   la respuesta vieja se cancela de verdad y nunca pisa a la nueva.
 */
export function useFetch(pedir, dependencias) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));

    pedir(control.signal)
      .then((datos) => {
        if (!control.signal.aborted) setEstado({ datos, cargando: false, error: null });
      })
      .catch((error) => {
        if (control.signal.aborted || esCancelacion(error)) return; // cancelada a propósito: no es un error
        setEstado((previo) => ({ ...previo, cargando: false, error }));
      });

    return () => control.abort();
    // `pedir` se crea en cada render: las dependencias reales las indica quien llama al hook.
  }, [...dependencias, intento]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  return { ...estado, recargar };
}
