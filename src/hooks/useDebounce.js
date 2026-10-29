import { useEffect, useState } from 'react';

/** Devuelve `valor` solo cuando lleva `espera` ms sin cambiar. */
export function useDebounce(valor, espera = 300) {
  const [retrasado, setRetrasado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), espera);
    return () => clearTimeout(temporizador); // cleanup: cada tecla cancela el temporizador anterior
  }, [valor, espera]);

  return retrasado;
}
