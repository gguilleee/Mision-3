import { useEffect, useState } from 'react';

/** Como useState, pero el valor sobrevive a recargar la página (BONUS). */
export function useLocalStorage(clave, valorInicial) {
  // Inicialización perezosa: localStorage solo se lee en el primer render.
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado === null ? valorInicial : JSON.parse(guardado);
    } catch {
      return valorInicial; // JSON corrupto o almacenamiento bloqueado
    }
  });

  // Sincroniza con un sistema externo (localStorage): uso justificado de useEffect.
  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      // Sin espacio o sin permiso: el valor sigue funcionando en memoria.
    }
  }, [clave, valor]);

  return [valor, setValor];
}
